
const express = require('express');
const router = express.Router();        // roteador para gerenciar e organizar as rotas do catalogo

const ControleCatalogo = require('../controllers/controle-catalogo');
const controle = new ControleCatalogo();
const CadastroIngrediente = require('../models/cadastro-ingrediente');
const cadastroIngrediente = new CadastroIngrediente();
const CadastroProduto = require('../models/cadastro-produto');
const cadastroProduto = new CadastroProduto();
const Produto = require('../models/produto');
const FichaTecnica = require('../models/ficha-tecnica');
const ItemFicha = require('../models/item-ficha');

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

router.get('/ingredientes', (req, res) => {
    const token = obterToken(req);

    try {
        // Verifica autenticação
        if (!controle.verificarSessao(token)) {
            return res.status(401).json({
                erro: 'Usuário não autenticado.'
            });
        }

        const ingredientes = cadastroIngrediente.listarTodos();

        const ingredientesJSON = ingredientes.map(ingrediente => ({
            id: ingrediente.getId(),
            nome: ingrediente.getNome(),
            unidadeMedida: ingrediente.getUM(),
            quantidadeEstoque: ingrediente.getQuantEstoque(),
            estoqueMinimo: ingrediente.getEstoqueMinimo(),
            valorUltimaCompra: ingrediente.getValorUltimaCompra(),
            quantidadeUltimaCompra: ingrediente.getQuantUltimaCompra(),
            dataUltimaCompra: ingrediente.getDataUltimaCompra()
        }));

        return res.status(200).json(ingredientesJSON);

    } catch (erro) {
        console.error(erro);
        return res.status(500).json({
            erro: 'Erro interno do servidor.'
        });
    }
});

router.post('/produtos', (req, res) => {
    const token = obterToken(req);

    try {
        if (!controle.verificarSessao(token)) {
            return res.status(401).json({
                erro: 'Usuário não autenticado.'
            });
        }

        const { nome, descricao, preco, tipoVenda, ingredientes } = req.body || {};

        // Validar os dados básicos
        if (
            typeof nome !== 'string' ||
            nome.trim() === '' ||
            (descricao !== undefined && descricao !== null && typeof descricao !== 'string') ||
            !Number.isInteger(preco) ||
            preco < 0 ||
            !['unidade', 'peso'].includes(tipoVenda) ||
            !Array.isArray(ingredientes) ||
            ingredientes.length === 0
        ) {
            return res.status(400).json({
                erro: 'Dados do produto inválidos.'
            });
        }

        // Montar os itens da ficha técnica
        const itens = [];

        const ingredientesAdicionados = new Set();

        for (const item of ingredientes) {
            if (
                !Number.isInteger(item.ingredienteId) ||
                item.ingredienteId <= 0 ||
                typeof item.quantidade !== 'number' ||
                !Number.isFinite(item.quantidade) ||
                item.quantidade <= 0
            ) {
                return res.status(400).json({
                    erro: 'Dados dos ingredientes inválidos.'
                });
            }

            if (ingredientesAdicionados.has(item.ingredienteId)) {
                return res.status(400).json({
                    erro: 'Não é permitido repetir ingredientes na ficha técnica.'
                });
            }

            ingredientesAdicionados.add(item.ingredienteId);

            const ingrediente = cadastroIngrediente.buscarId(item.ingredienteId);

            if (!ingrediente) {
                return res.status(404).json({
                    erro: `Ingrediente ${item.ingredienteId} não encontrado.`
                });
            }

            itens.push(new ItemFicha(item.quantidade, ingrediente));
        }

        // Criar os objetos do domínio
        const ficha = new FichaTecnica(null, itens);

        const produto = new Produto(
            null,
            nome.trim(),
            descricao || '',
            preco,
            ficha,
            tipoVenda
        );

        // Persistir no banco
        cadastroProduto.cadastrarProduto(produto);

        return res.status(201).json({
            mensagem: 'Produto cadastrado com sucesso.'
        });

    } catch (erro) {
        console.error(erro);

        return res.status(500).json({
            erro: 'Erro interno do servidor.'
        });
    }
});

router.put('/produtos/:id', (req, res) => {
    const token = obterToken(req);

    try {
        if (!controle.verificarSessao(token)) {
            return res.status(401).json({ erro: 'Usuário não autenticado.' });
        }

        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ erro: 'ID do produto inválido.' });
        }

        const produtoExistente = cadastroProduto.buscarId(id);

        if (!produtoExistente) {
            return res.status(404).json({ erro: 'Produto não encontrado.' });
        }

        const { nome, descricao, preco, tipoVenda, ingredientes } = req.body || {};

        if (
            typeof nome !== 'string' ||
            nome.trim() === '' ||
            (descricao !== undefined && descricao !== null && typeof descricao !== 'string') ||
            !Number.isInteger(preco) ||
            preco < 0 ||
            !['unidade', 'peso'].includes(tipoVenda) ||
            !Array.isArray(ingredientes) ||
            ingredientes.length === 0
        ) {
            return res.status(400).json({ erro: 'Dados do produto inválidos.' });
        }

        const itens = [];
        const ingredientesAdicionados = new Set();

        for (const item of ingredientes) {
            if (
                !item ||
                !Number.isInteger(item.ingredienteId) ||
                item.ingredienteId <= 0 ||
                typeof item.quantidade !== 'number' ||
                !Number.isFinite(item.quantidade) ||
                item.quantidade <= 0
            ) {
                return res.status(400).json({ erro: 'Dados dos ingredientes inválidos.' });
            }

            if (ingredientesAdicionados.has(item.ingredienteId)) {
                return res.status(400).json({
                    erro: 'Não é permitido repetir ingredientes na ficha técnica.'
                });
            }

            ingredientesAdicionados.add(item.ingredienteId);

            const ingrediente = cadastroIngrediente.buscarId(item.ingredienteId);

            if (!ingrediente) {
                return res.status(404).json({
                    erro: `Ingrediente ${item.ingredienteId} não encontrado.`
                });
            }

            itens.push(new ItemFicha(item.quantidade, ingrediente));
        }

        const ficha = new FichaTecnica(
            produtoExistente.obterFichaTecnica().getId(),
            itens
        );

        const produto = new Produto(
            id,
            nome.trim(),
            descricao || '',
            preco,
            ficha,
            tipoVenda
        );

        cadastroProduto.editarProduto(produto);

        return res.status(200).json({
            mensagem: 'Produto atualizado com sucesso.'
        });

    } catch (erro) {
        console.error(erro);
        return res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
});

router.delete('/produtos/:id', (req, res) => {
    const token = obterToken(req);

    try {
        if (!controle.verificarSessao(token)) {
            return res.status(401).json({ erro: 'Usuário não autenticado.' });
        }

        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ erro: 'ID do produto inválido.' });
        }

        cadastroProduto.excluirProduto(id);

        return res.status(200).json({
            mensagem: 'Produto excluído com sucesso.'
        });

    } catch (erro) {
        if (erro.message === 'ERRO: Produto não encontrado!') {
            return res.status(404).json({ erro: 'Produto não encontrado.' });
        }

        console.error(erro);
        return res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
});

module.exports = router;
