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
    buscarProdutoPorId(id) {
        return db.prepare('SELECT * FROM Produto WHERE id = ?').get(id) ?? null;
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
                (pedidosID, id, quantidade, peso, preco_unitario, custo_unitario)
            VALUES
                (?, ?, ?, ?, ?, ?)
        `;
        db.prepare(sql).run(
            pedidosID,
            item.id,
            item.quantidade,
            item.peso,
            item.preco_unitario,
            item.custo_unitario
        );
    }

    // RF10: edicao e exclusao

    // edita o pedido inteiro (cabeçalho + itens) de uma vez
    // recebe um Pedido já com o id e os dados novos, lanca erro se o pedido nao existir
    atualizarPedidoCompleto(pedido) {
        const atualizar = db.transaction(() => {
            const pedidosID = pedido.getId();

            // le o pedido atual (com itens) antes de mexer em qualquer coisa
            const pedidoAntigo = this.buscarPorId(pedidosID);
            if (!pedidoAntigo) {
                throw new Error('Pedido não encontrado');
            }

            // guarda o snapshot do pedido antigo
            this.#gravarHistorico(pedidosID, 'edicao', pedidoAntigo);

            // atualiza o cabecalho
            this.#atualizarCabecalho(pedidosID, pedido);

            // troca os itens: apaga os antigos e insere os novos
            this.#apagarItens(pedidosID);
            pedido.getItens().forEach((item) => this.#inserirItem(pedidosID, item));
        });
        atualizar();
    }

    // exclusao logica, ou seja, n faz delete, so muda a situacao pra excluido 
    // devolve true se excluiu, false se o pedido não existia/já estava excluído
    marcarComoExcluido(pedidosID) {
        const excluir = db.transaction(() => {
            // busca o pedido ativo
            const pedidoAtivo = this.buscarPorId(pedidosID);
            // se n existir, retornar false
            if (!pedidoAtivo) {
                return false;
            }

            // gravar o snapshot com tipo_operacao = 'exclusao'
            this.#gravarHistorico(pedidosID, 'exclusao', pedidoAtivo);


            // exclusao logica
            db.prepare(`UPDATE pedidos SET situacao = 'excluido' WHERE pedidosID = ?`).run(pedidosID);

            return true;
        });
        return excluir();
    }

    // grava no historico o estado ANTERIOR do pedido
    // tipoOperacao: 'edicao' ou 'exclusao' (o CHECK do schema so aceita esses dois)
    #gravarHistorico(pedidosID, tipoOperacao, pedidoAntigo) {
        const sql = `
            INSERT INTO historico_pedidos (pedidosID, tipo_operacao, dados_anteriores, data)
            VALUES (?, ?, ?, ?)
        `;
        db.prepare(sql).run(
            pedidosID,
            tipoOperacao,
            JSON.stringify(pedidoAntigo),
            new Date().toISOString()
        );
    }

    // atualiza só o cabeçalho (os itens são tratados à parte)
    #atualizarCabecalho(pedidosID, pedido) {
        const sql = `
           UPDATE pedidos SET
                data_pedido = @data_pedido,
                cliente_nome = @cliente_nome,
                cliente_contato = @cliente_contato,
                descricao = @descricao,
                data_entrega = @data_entrega,
                status_pagamento = @status_pagamento,
                valor_total = @valor_total
            WHERE pedidosID = @pedidosID
        `;
        db.prepare(sql).run({ ...pedido.paraBanco(), pedidosID});
        
    }

    // remove os itens antigos de um pedido (só usado dentro da edição)
    #apagarItens(pedidosID) {
        db.prepare('DELETE FROM itens_pedido WHERE pedidosID = ?').run(pedidosID);
    }

    // transforma uma linha do banco em um objeto Pedido, carregando os itens (com o nome do produto)
    #montarPedido(linha) {
        const itens = db.prepare(`
            SELECT i.*, p.nome AS produto_nome
            FROM itens_pedido i
            JOIN Produto p ON p.id = i.id
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