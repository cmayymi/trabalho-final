// ENTITY: uma linha da memoria de calculo (um produto dentro de uma apuracao de lucro)
// valores em CENTAVOS; margem em % (ex.: 38.5)
class ItemApuracao {
    #produtoId;
    #produtoNome;
    #quantidade;
    #faturamento;
    #custo;

    constructor(produtoId, produtoNome, quantidade, faturamento, custo) {
        this.#produtoId = produtoId;
        this.#produtoNome = produtoNome;
        this.#quantidade = quantidade;
        this.#faturamento = faturamento;
        this.#custo = custo;
    }

    getProdutoId() { return this.#produtoId; }
    getProdutoNome() { return this.#produtoNome; }
    getQuantidade() { return this.#quantidade; }
    getFaturamento() { return this.#faturamento; }
    getCusto() { return this.#custo; }

    // faturamento - custo
    calcularLucro() {
        return this.#faturamento - this.#custo;
    }

    // lucro / faturamento * 100, com 2 casas (faturamento 0 -> 0, nao NaN/Infinity)
    calcularMargem() {
        if (this.#faturamento === 0) {
            return 0;
        }
        return Math.round((this.calcularLucro() / this.#faturamento) * 10000) / 100;
    }

    // formato que vai pro JSON da resposta (e eh o mesmo que o historico devolve)
    toJSON() {
        return {
            produto_id: this.#produtoId,
            produto: this.#produtoNome,
            quantidade: this.#quantidade,
            faturamento: this.#faturamento,
            custo: this.#custo,
            lucro: this.calcularLucro(),
            margem: this.calcularMargem(),
        };
    }
}

module.exports = ItemApuracao;