// RESPONSÁVEL PELA ENTITY COLLECTION DE PEDIDOS PERSISTENTES (DADOS DEVEM EXISTIR MESMO APÓS O FIM DE UMA SESSÃO)
// aqui só existe acesso ao banco (SQL e transação), nenhuma regra de negócio
const db = require('../../database/conexao');
const Pedido = require('./pedido');

class CadastroPedido {
    // grava o pedido e todos os seus itens de uma vez só (tudo ou nada)
    // se qualquer insert falhar, a transação desfaz tudo e o erro é propagado
    // devolve o ID do pedido gerado
    salvarPedidoCompleto(pedido) {
        const salvar = db.transaction(() => {
            const pedidosID = this.#inserirPedido(pedido);
            pedido.getItens().forEach((item) => this.#inserirItem(pedidosID, item));
            return pedidosID;
        });
        return salvar();
    }

    // busca um pedido ativo pelo ID, já com os itens (null se não existir ou estiver excluído)
    buscarPorId(pedidosID) {
        const achou = db.prepare(`SELECT * FROM pedidos WHERE pedidosID = ? AND situacao = 'ativo'`).get(pedidosID);
        if (!achou) {
            return null;
        }
        return this.#montarPedido(achou);
    }

    // lista todos os pedidos ativos, do mais recente para o mais antigo
    listar() {
        const linhas = db.prepare(`
            SELECT * FROM pedidos
            WHERE situacao = 'ativo'
            ORDER BY data_pedido DESC, pedidosID DESC
        `).all();
        return linhas.map((linha) => this.#montarPedido(linha));
    }

    // busca um produto pelo ID (null se não existir)
    // TODO: trocar pela coleção de produtos da colega quando o catálogo (RF03) estiver pronto
    buscarProdutoPorId(produtoID) {
        return db.prepare('SELECT * FROM produtos WHERE produtoID = ?').get(produtoID) ?? null;
    }

    // insere o cabeçalho do pedido e devolve o ID gerado
    #inserirPedido(pedido) {
        const sql = `
            INSERT INTO pedidos
                (data_pedido, cliente_nome, cliente_contato, descricao, data_entrega, status_pagamento, valor_total)
            VALUES
                (@data_pedido, @cliente_nome, @cliente_contato, @descricao, @data_entrega, @status_pagamento, @valor_total)
        `;
        const resultado = db.prepare(sql).run(pedido.paraBanco());
        return Number(resultado.lastInsertRowid);
    }

    // insere um item ligado a um pedido
    #inserirItem(pedidosID, item) {
        const sql = `
            INSERT INTO itens_pedido
                (pedidosID, produtoID, quantidade, peso, preco_unitario, custo_unitario)
            VALUES
                (?, ?, ?, ?, ?, ?)
        `;
        db.prepare(sql).run(
            pedidosID,
            item.produtoID,
            item.quantidade,
            item.peso,
            item.preco_unitario,
            item.custo_unitario
        );
    }

    // transforma uma linha do banco em um objeto Pedido, carregando os itens (com o nome do produto)
    #montarPedido(linha) {
        const itens = db.prepare(`
            SELECT i.*, p.nome AS produto_nome
            FROM itens_pedido i
            JOIN produtos p ON p.produtoID = i.produtoID
            WHERE i.pedidosID = ?
        `).all(linha.pedidosID);

        return new Pedido({
            id: linha.pedidosID,
            data_pedido: linha.data_pedido,
            cliente_nome: linha.cliente_nome,
            cliente_contato: linha.cliente_contato,
            descricao: linha.descricao,
            data_entrega: linha.data_entrega,
            status_pagamento: linha.status_pagamento,
            situacao: linha.situacao,
            itens,
        });
    }
}

module.exports = CadastroPedido;