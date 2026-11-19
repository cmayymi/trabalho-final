// RESPONSÁVEL PELA ENTITY DO PEDIDO; ARMAZENA OS DADOS DE UMA VENDA E O COMPORTAMENTO LIGADO A ELES
// a validação das regras e a transação ficam no controle-pedidos.js

class Pedido {
    // atributos privados, só acessados pelos getters
    #id;
    #dataPedido;
    #clienteNome;
    #clienteContato;
    #descricao;
    #dataEntrega;
    #statusPagamento;
    #situacao;
    #itens;         // cada item: { produtoID, quantidade, peso, preco_unitario, custo_unitario, ... }

    constructor({
        id = null,
        data_pedido,
        cliente_nome,
        cliente_contato,
        descricao = '',
        data_entrega,
        status_pagamento,
        situacao = 'ativo',
        itens = [],
    }) {
        this.#id = id;
        this.#dataPedido = data_pedido;
        this.#clienteNome = cliente_nome;
        this.#clienteContato = cliente_contato;
        this.#descricao = descricao;
        this.#dataEntrega = data_entrega;
        this.#statusPagamento = status_pagamento;
        this.#situacao = situacao;
        this.#itens = itens;
    }

    // soma quantidade x preço unitário de todos os itens (tudo em centavos)
    calcularTotal() {
        return this.#itens.reduce(
            (soma, item) => soma + item.quantidade * item.preco_unitario,
            0
        );
    }

    // dados no formato das colunas da tabela pedidos (usado pela coleção para o INSERT)
    paraBanco() {
        return {
            data_pedido: this.#dataPedido,
            cliente_nome: this.#clienteNome,
            cliente_contato: this.#clienteContato,
            descricao: this.#descricao,
            data_entrega: this.#dataEntrega,
            status_pagamento: this.#statusPagamento,
            valor_total: this.calcularTotal(),
        };
    }

    // campos privados não aparecem no JSON.stringify, então o res.json() usa este método
    toJSON() {
        return {
            pedidosID: this.#id,
            data_pedido: this.#dataPedido,
            cliente_nome: this.#clienteNome,
            cliente_contato: this.#clienteContato,
            descricao: this.#descricao,
            data_entrega: this.#dataEntrega,
            status_pagamento: this.#statusPagamento,
            valor_total: this.calcularTotal(),
            situacao: this.#situacao,
            itens: this.#itens,
        };
    }

    // getters
    getId() {
        return this.#id;
    }

    getDataPedido() {
        return this.#dataPedido;
    }

    getClienteNome() {
        return this.#clienteNome;
    }

    getClienteContato() {
        return this.#clienteContato;
    }

    getDescricao() {
        return this.#descricao;
    }

    getDataEntrega() {
        return this.#dataEntrega;
    }

    getStatusPagamento() {
        return this.#statusPagamento;
    }

    getSituacao() {
        return this.#situacao;
    }

    getItens() {
        return this.#itens;
    }
}

module.exports = Pedido;