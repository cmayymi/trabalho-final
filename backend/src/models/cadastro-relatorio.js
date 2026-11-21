// ENTITY COLLECTION dos relatorios: so leitura do banco, nenhuma regra de negocio
// (sem validar data, sem calcular lucro: isso eh do ControleRelatorios)
const db = require('../../database/conexao');
const Ingrediente = require('./ingrediente');
const ApuracaoLucro = require('./apuracao-lucro');
const ItemApuracao = require('./item-apuracao');

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

    // ====== RF09 - LUCRO ======

    // faturamento e custo por produto no periodo (mesmo filtro do buscarVendas: pedido ATIVO, BETWEEN inclusivo)
    // devolve [{ produto_id, produto, quantidade, faturamento, custo }]; [] se nao houver vendas
    // OBS: so soma e agrupa; lucro e margem NAO sao calculados aqui (isso eh do ItemApuracao)
    buscarLucroPorProduto(inicio, fim) {
        const sql = `
            SELECT
                i.id AS produto_id,
                COALESCE(pr.nome, '(produto removido)') AS produto,
                SUM(i.quantidade) AS quantidade,
                SUM(i.quantidade * i.preco_unitario) AS faturamento,
                SUM(i.quantidade * i.custo_unitario) AS custo
            FROM pedidos p
            JOIN itens_pedido i ON i.pedidosID = p.pedidosID
            LEFT JOIN Produto pr ON pr.id = i.id
            WHERE p.situacao = 'ativo'
              AND p.data_pedido BETWEEN ? AND ?
            GROUP BY i.id
            ORDER BY produto COLLATE NOCASE ASC
        `;
        return db.prepare(sql).all(inicio, fim);
    }

    // grava a apuracao (resumo + itens) numa TRANSACAO: ou grava tudo ou nada
    // devolve o id gerado
    salvarApuracao(apuracao) {
        const inserirResumo = db.prepare(`
            INSERT INTO apuracao_lucro
                (data_inicio, data_fim, faturamento, custo_total, lucro, margem, data_apuracao)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        const inserirItem = db.prepare(`
            INSERT INTO apuracao_lucro_produto
                (apuracaoID, produto_id, produto_nome, quantidade, faturamento, custo, lucro, margem)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const gravar = db.transaction(() => {
            const resultado = inserirResumo.run(
                apuracao.getInicio(),
                apuracao.getFim(),
                apuracao.getFaturamento(),
                apuracao.getCustoTotal(),
                apuracao.getLucro(),
                apuracao.getMargem(),
                apuracao.getDataApuracao()
            );
            const id = Number(resultado.lastInsertRowid);

            for (const item of apuracao.getItens()) {
                inserirItem.run(
                    id,
                    item.getProdutoId(),
                    item.getProdutoNome(),
                    item.getQuantidade(),
                    item.getFaturamento(),
                    item.getCusto(),
                    item.calcularLucro(),
                    item.calcularMargem()
                );
            }
            return id;
        });

        return gravar();
    }

    // lista as apuracoes salvas, da mais recente para a mais antiga, ja com os itens
    // devolve [ApuracaoLucro]
    listarApuracoes() {
        const resumos = db.prepare('SELECT * FROM apuracao_lucro ORDER BY apuracaoID DESC').all();
        const buscarItens = db.prepare(
            'SELECT * FROM apuracao_lucro_produto WHERE apuracaoID = ? ORDER BY produto_nome COLLATE NOCASE ASC'
        );

        return resumos.map((r) => {
            const itens = buscarItens.all(r.apuracaoID).map((i) => new ItemApuracao(
                i.produto_id,
                i.produto_nome,
                i.quantidade,
                i.faturamento,
                i.custo
            ));
            return new ApuracaoLucro(r.apuracaoID, r.data_inicio, r.data_fim, r.data_apuracao, itens);
        });
    }
}

module.exports = CadastroRelatorio;