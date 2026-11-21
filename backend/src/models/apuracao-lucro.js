// ENTITY: uma apuracao de lucro de um periodo (resumo + itens por produto)
// os totais SAEM da soma dos itens: nao recebe total de fora, assim nao tem como ficar inconsistente

class ApuracaoLucro {
    #id;            // null enquanto nao foi salva
    #inicio;
    #fim;
    #dataApuracao;
    #itens;         // array de ItemApuracao

    constructor(id, inicio, fim, dataApuracao, itens = []) {
        this.#id = id;
        this.#inicio = inicio;
        this.#fim = fim;
        this.#dataApuracao = dataApuracao;
        this.#itens = itens;
    }

    getId() { return this.#id; }
    getInicio() { return this.#inicio; }
    getFim() { return this.#fim; }
    getDataApuracao() { return this.#dataApuracao; }
    getItens() { return this.#itens; }

    // chamado depois de salvar, quando o banco gera o id
    definirId(id) {
        this.#id = id;
    }

    getFaturamento() {
        return this.#itens.reduce((soma, item) => soma + item.getFaturamento(), 0);
    }

    getCustoTotal() {
        return this.#itens.reduce((soma, item) => soma + item.getCusto(), 0);
    }

    getLucro() {
        return this.getFaturamento() - this.getCustoTotal();
    }

    // lucro / faturamento * 100, com 2 casas (faturamento 0 -> 0)
    getMargem() {
        const faturamento = this.getFaturamento();
        if (faturamento === 0) {
            return 0;
        }
        return Math.round((this.getLucro() / faturamento) * 10000) / 100;
    }

    toJSON() {
        return {
            id: this.#id,
            inicio: this.#inicio,
            fim: this.#fim,
            data_apuracao: this.#dataApuracao,
            faturamento: this.getFaturamento(),
            custo_total: this.getCustoTotal(),
            lucro: this.getLucro(),
            margem: this.getMargem(),
            produtos: this.#itens.map((item) => item.toJSON()),
        };
    }
}

module.exports = ApuracaoLucro;