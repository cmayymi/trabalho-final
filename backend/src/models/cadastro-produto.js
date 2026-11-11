const db = require('../../database/conexao');
const Produto = require('./produto');
const CadastroFichaTecnica = require('./cadastro-fichatec');
const FichaTecnica = require('./ficha-tecnica');
const ItemFicha = require('./item-ficha');
const Ingrediente = require('./ingrediente');

class CadastroProduto {
    listarTodos() {
        const cadastro_fichatec = new CadastroFichaTecnica();
        const lista = db.prepare('SELECT * FROM Produto').all();    
        return lista.map(prod => {
            return new Produto(prod.id, prod.nome, prod.descricao, prod.preco, cadastro_fichatec.buscarId(prod.fichaId))});                        // retorna o produto com suas respectivas informacoes
    }

    buscarId(id) {
        const prod = db.prepare('SELECT * FROM Produto WHERE id = ?').get(id);

        if(!prod) {
            return null;
        }

        const ficha = new CadastroFichaTecnica();
        return new Produto(prod.id, prod.nome, prod.descricao, prod.preco, ficha.buscarId(prod.fichaId));
    }

    cadastrarProduto(produto) {
        // agrupar as tres transacoes de ficha, produto e item
        const cadastrar = db.transaction(() => {
            // insere/cadastra o reg da ficha no banco de dados
            const novaFicha = db.prepare('INSERT INTO FichaTecnica DEFAULT VALUES');        // valor eh atualizado pelo proprio banco, nao inserido manualmente
            const fichaId = novaFicha.run().lastInsertRowid;                            // guarda o identificador gerado pelo banco

            // cadastra o produto no banco de dados
            const novoProduto = db.prepare('INSERT INTO Produto (nome, descricao, preco, fichaId) VALUES (?, ?, ?, ?)');
            novoProduto.run(produto.getNome(), produto.getDescricao(), produto.getPreco(), fichaId);

            // cadastra os novos itens da ficha
            const novoItem = db.prepare('INSERT INTO ItemFicha (fichaId, ingredienteId, quantidade) VALUES (?, ?, ?)');
            for(const item of produto.obterFichaTecnica().obterItens()) {
                novoItem.run(fichaId, item.getIngrediente().getId(), item.getQuantidade());
            }
        });

        cadastrar();                // executa todo o conjunto
    }

    editarProduto(produto) {
        const editar = db.transaction(() => {
            // atualiza com as novas infos
            const registro = db.prepare('SELECT fichaId FROM Produto WHERE id = ?').get(produto.getId());

            if (!registro) {
                throw new Error('ERRO: Produto não encontrado.');
            }

            const fichaId = registro.fichaId;
            const atualiza = db.prepare('UPDATE Produto SET nome = ?, descricao = ?, preco = ? WHERE id = ?');
            atualiza.run(produto.getNome(), produto.getDescricao(), produto.getPreco(), produto.getId());

            // apagar os itens antigos
            const deleta_itens = db.prepare('DELETE FROM ItemFicha WHERE fichaId = ?');
            deleta_itens.run(fichaId);

            // inserir/editar os novos itens
            const novoItem = db.prepare('INSERT INTO ItemFicha (fichaId, ingredienteId, quantidade) VALUES (?, ?, ?)');
            for(const item of produto.obterFichaTecnica().obterItens()) {
                novoItem.run(fichaId, item.getIngrediente().getId(), item.getQuantidade());
            }
        });

        editar();
    }

    excluirProduto(id) {
        if(!Number.isInteger(id) || id <= 0) {
            throw new Error('ERRO: ID inválido.');
        }

        const check = db.prepare('SELECT fichaId FROM Produto WHERE id = ?');        // protecao dos relacionamentos existentes no banco

        const registro = check.get(id);             // recupera fichaId para excluir os itens da ficha e ela propria

        if(!registro) {
            throw new Error('ERRO: Produto não encontrado!');
        }
        const fichaId = registro.fichaId;

        const delecao = db.transaction(() => {
            const exclui_itens = db.prepare('DELETE FROM ItemFicha WHERE fichaId = ?');
            exclui_itens.run(fichaId);

            const exclui_produto = db.prepare('DELETE FROM Produto WHERE id = ?');
            exclui_produto.run(id);

            const exclui_ficha = db.prepare('DELETE FROM FichaTecnica WHERE id = ?');
            exclui_ficha.run(fichaId);
        });

        delecao();
    }
}

module.exports = CadastroProduto;