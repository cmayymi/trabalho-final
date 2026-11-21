// ENTITY COLLECTION dos relatorios: so leitura do banco, nenhuma regra de negocio
const db = require('../../database/conexao');

class CadastroRelatorio {
    // 1 registro por item de pedido ativo dentro do periodo (inclusive nas duas pontas)
    // preco_unitario e custo_unitario vem do item gravado, nunca de Produto.preco
    // devolve [] se nao houver vendas
    buscarVendas(inicio, fim) {
        const sql = `
            SELECT
                p.pedidosID    AS pedido,
                p.cliente_nome AS cliente,
                pr.nome        AS item,
                p.data_pedido  AS data,
                i.quantidade,
                i.preco_unitario,
                i.custo_unitario
            FROM pedidos p
            JOIN itens_pedido i ON i.pedidosID = p.pedidosID
            JOIN Produto pr     ON pr.id = i.id
            WHERE p.situacao = 'ativo'
              AND p.data_pedido BETWEEN ? AND ?
            ORDER BY p.data_pedido DESC, p.pedidosID DESC, i.itens_pedidoID ASC
        `;
        return db.prepare(sql).all(inicio, fim);
    }

    // 1 registro por insumo, em ordem alfabetica
    buscarEstoque() {
        const sql = `
            SELECT
                id,
                nome,
                unidadeMedida,
                quantidadeEstoque,
                estoqueMinimo,
                custoUltimaCompra
            FROM Ingrediente
            ORDER BY nome COLLATE NOCASE ASC
        `;
        return db.prepare(sql).all();
    }
}

module.exports = CadastroRelatorio;