// ENTITY COLLECTION dos relatorios: so leitura do banco, nenhuma regra de negocio
// (sem validar data, sem calcular lucro: isso eh do ControleRelatorios)
const db = require('../../database/conexao');
const Ingrediente = require('./ingrediente');

class CadastroRelatorio {
    // 1 registro por item de pedido ATIVO dentro do periodo (inclusive nas duas pontas)
    // devolve [] se nao houver vendas
    // preco_unitario e custo_unitario vem do item gravado, nunca de Produto.preco
    buscarVendas(inicio, fim) {
        const sql = `
            SELECT
                p.pedidosID    AS pedido,
                p.cliente_nome AS cliente,
                COALESCE(pr.nome, '(produto removido)') AS item,
                p.data_pedido  AS data,
                i.quantidade,
                i.preco_unitario,
                i.custo_unitario
            FROM pedidos p
            JOIN itens_pedido i ON i.pedidosID = p.pedidosID
            LEFT JOIN Produto pr ON pr.id = i.id
            WHERE p.situacao = 'ativo'
              AND p.data_pedido BETWEEN ? AND ?
            ORDER BY p.data_pedido DESC, p.pedidosID DESC, i.itens_pedidoID ASC
        `;
        return db.prepare(sql).all(inicio, fim);
    }

    // todos os insumos como entidades Ingrediente, em ordem alfabetica
    buscarEstoque() {
        const linhas = db.prepare('SELECT * FROM Ingrediente ORDER BY nome COLLATE NOCASE ASC').all();
        return linhas.map((r) => new Ingrediente(
            r.id,
            r.nome,
            r.unidadeMedida,
            r.quantidadeEstoque,
            r.estoqueMinimo,
            r.valorUltimaCompra,
            r.quantidadeUltimaCompra,
            r.dataUltimaCompra
        ));
    }
}

module.exports = CadastroRelatorio;