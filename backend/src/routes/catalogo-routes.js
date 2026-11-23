
const express = require('express');
const router = express.Router();        // roteador para gerenciar e organizar as rotas do catalogo

const ControleCatalogo = require('../controllers/controle-catalogo');
const controle = new ControleCatalogo();

// ideia: recuperar o token recebido pela tela (frontend)
function obterToken(req) {
    const authorization = req.headers.authorization;            // requisicao recebida pelo server, com token enviado junto ao cabecalho

    if (typeof authorization !== 'string') {
        return null;
    }

    const [tipo, token] = authorization.split(' ');             // separa o token para compreensao

    if (tipo !== 'Bearer' || !token) {                          // se o formato, apos separacao, estiver correto e se existir um token
        return null;
    }

    return token;
}

function converterProdutoJSON(produto) {
    const ficha = produto.obterFichaTecnica();

    return {
        id: produto.getId(),
        nome: produto.getNome(),
        descricao: produto.getDescricao(),
        preco: produto.getPreco(),
        tipoVenda: produto.getTipoVenda(),
        ficha: {
            itens: ficha.obterItens().map(item => {
                const ingrediente = item.getIngrediente();

                return {
                    quantidade: item.getQuantidade(),
                    ingrediente: {
                        id: ingrediente.getId(),
                        nome: ingrediente.getNome(),
                        unidadeMedida: ingrediente.getUM(),
                        quantidadeEstoque: ingrediente.getQuantEstoque()
                    }
                };
            })
        }
    };
}

// listar os produtos quando solicitado
router.get('/produtos', (req, res) => {         // rota do tipo get para enviar resposta conforme a requisicao recebida
    const token = obterToken(req);              // recupera o token

    try {
        const produtos = controle.listarProdutos(token);        // rota chama o controlador; controlador chama o resto das classes

        const produtosJSON = produtos.map(converterProdutoJSON);
        return res.status(200).json(produtosJSON);                  // retorna 200 para req bem sucedida e envia a lista de produtos em formato json

    } catch (erro) {
        if (erro.message === 'Usuário não autenticado.') {
            return res.status(401).json({
                erro: erro.message
            });
        }

        return res.status(500).json({
            erro: 'Erro interno do servidor.'
        });
    }
});

// detalhamento dos produtos registrados
router.get('/produtos/:id', (req, res) => {
    const token = obterToken(req);
    const id = Number(req.params.id);               // recupera o id para detalhamento

    if (!Number.isInteger(id) || id <= 0) {         // checagem de valores invalidos enviados ao controle
        return res.status(400).json({
            erro: 'ID do produto inválido.'
        });
    }

    try {
        const resultado = controle.detalharProduto(id, token);  // chama o metodo responsavel

        if (resultado === null) {
            return res.status(404).json({
                erro: 'Produto não encontrado.'
            });
        }

        const produtoJSON = converterProdutoJSON(resultado.produto);

        return res.status(200).json({
            produto: produtoJSON,
            ficha: produtoJSON.ficha,
            ingredientesDisp: resultado.ingredientesDisp
        });             // servidor devolve as infos do produto no formato json

    } catch (erro) {
        if (erro.message === 'Usuário não autenticado.') {
            return res.status(401).json({
                erro: erro.message
            });
        }

        return res.status(500).json({
            erro: 'Erro interno do servidor.'
        });
    }
});

module.exports = router;
