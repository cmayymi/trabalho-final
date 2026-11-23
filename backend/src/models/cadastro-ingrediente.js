const db = require('../../database/conexao');
const Ingrediente = require('./ingrediente');

class CadastroIngrediente {
    buscarId(id) {
        const ingred = db.prepare('SELECT * FROM Ingrediente WHERE id = ?').get(id);
        if(!ingred) {
            return null;
        }
        return new Ingrediente(ingred.id, ingred.nome, ingred.unidadeMedida, ingred.quantidadeEstoque, ingred.estoqueMinimo, ingred.valorUltimaCompra, ingred.quantidadeUltimaCompra, ingred.dataUltimaCompra);
    }

    cadastrarIngrediente(ingrediente) {
        const novoIngred = db.prepare('INSERT INTO Ingrediente (nome, unidadeMedida, quantidadeEstoque, estoqueMinimo, valorUltimaCompra, quantidadeUltimaCompra, dataUltimaCompra) VALUES (?, ?, ?, ?, ?, ?, ?)');
        novoIngred.run(ingrediente.getNome(), ingrediente.getUM(), ingrediente.getQuantEstoque(), ingrediente.getEstoqueMinimo(), ingrediente.getValorUltimaCompra(), ingrediente.getQuantUltimaCompra(), ingrediente.getDataUltimaCompra());
    }

    editarIngrediente(ingrediente) {
        const atualiza = db.prepare(`UPDATE Ingrediente SET nome = ?, unidadeMedida = ?, quantidadeEstoque = ?, estoqueMinimo = ?, valorUltimaCompra = ?, quantidadeUltimaCompra = ?, dataUltimaCompra = ? WHERE id = ?`);
        atualiza.run(ingrediente.getNome(), ingrediente.getUM(), ingrediente.getQuantEstoque(), ingrediente.getEstoqueMinimo(), ingrediente.getValorUltimaCompra(), ingrediente.getQuantUltimaCompra(), ingrediente.getDataUltimaCompra(), ingrediente.getId());
    }

    excluirIngrediente(id) {
        if(!Number.isInteger(id) || id <= 0) {
            throw new Error('ERRO: ID inválido.');
        }

        const check = db.prepare('SELECT COUNT(*) AS total FROM ItemFicha WHERE ingredienteId = ?');        // protecao dos relacionamentos existentes no banco

        if(check.get(id).total > 0) {
            throw new Error('ERRO: Ingrediente é utilizado em outro produto!');
        }
        const exclui = db.prepare('DELETE FROM Ingrediente WHERE id = ?');
        const resultado = exclui.run(id);                   // exclui e devolve um objeto com suas infos 

        if(resultado.changes === 0) {                                       // se for zero, não tinha nenhum ingrediente la, pois a varredura nao encontrou nada
            throw new Error('ERRO: Ingrediente não encontrado.');
        }
    }
    listarTodos() {
        const lista = db.prepare('SELECT * FROM Ingrediente').all();

        return lista.map(ingred =>
            new Ingrediente(
                ingred.id,
                ingred.nome,
                ingred.unidadeMedida,
                ingred.quantidadeEstoque,
                ingred.estoqueMinimo,
                ingred.valorUltimaCompra,
                ingred.quantidadeUltimaCompra,
                ingred.dataUltimaCompra
            )
        );
    }
}

module.exports = CadastroIngrediente;