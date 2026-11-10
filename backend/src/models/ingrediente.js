class Ingrediente {
    #id;
    #nome;
    #unidadeMedida;
    #quantidadeEstoque;

    getId() {
        return this.#id;
    }
    getNome() {
        return this.#nome;
    }
    getUM() {
        return this.#unidadeMedida;
    }
    getQuantEstoque() {
        return this.#quantidadeEstoque;
    }
    constructor(id, nome, unidadeMedida, quantidadeEstoque) {
        this.#id = id;
        this.#nome = nome;
        this.#unidadeMedida = unidadeMedida;
        this.#quantidadeEstoque = quantidadeEstoque;
    }
    possuiQuant(quantidade) {
        if (typeof quantidade !== 'number' || Number.isNaN(quantidade)) {
            return false;
        }
        return quantidade <= this.#quantidadeEstoque;                           // retorna true caso a quantidade solicitada seja menor do que a disponivel
    }
}

module.exports = Ingrediente;