class Ingrediente {
    #id;
    #nome;
    #unidadeMedida;
    #quantidadeEstoque;
    #estoqueMinimo;
    #valorUltimaCompra; // em centavos
    #quantidadeUltimaCompra; // na mesma unidade de medida do ingrediente
    #dataUltimaCompra; // AAAA-MM-DD

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
    getEstoqueMinimo() {
        return this.#estoqueMinimo;
    }
    getValorUltimaCompra() {
        return this.#valorUltimaCompra;
    }
    getQuantUltimaCompra() {
        return this.#quantidadeUltimaCompra;
    }
    getDataUltimaCompra() {
        return this.#dataUltimaCompra;
    }
    constructor(id, nome, unidadeMedida, quantidadeEstoque, estoqueMinimo = 0, valorUltimaCompra = 0, quantidadeUltimaCompra = 0, dataUltimaCompra = null) {
        this.#id = id;
        this.#nome = nome;
        this.#unidadeMedida = unidadeMedida;
        this.#quantidadeEstoque = quantidadeEstoque;
        this.#estoqueMinimo = estoqueMinimo;
        this.#valorUltimaCompra = valorUltimaCompra;
        this.#quantidadeUltimaCompra = quantidadeUltimaCompra;
        this.#dataUltimaCompra = dataUltimaCompra;
    }
    possuiQuant(quantidade) {
        if (typeof quantidade !== 'number' || Number.isNaN(quantidade)) {
            return false;
        }
        return quantidade <= this.#quantidadeEstoque; // retorna true caso a quantidade solicitada seja menor do que a disponivel
    }

    // custo (em centavos, sem arredondar) de uma quantidade deste ingrediente
    calcularCusto(quantidade) {
        if (typeof quantidade !== 'number' || Number.isNaN(quantidade)) {
            return 0;
        }
        if (this.#quantidadeUltimaCompra <= 0) { // evita divisão por zero
            return 0;
        }
        return quantidade * this.#valorUltimaCompra / this.#quantidadeUltimaCompra;
    }

    // para o relatorio de estoque (RF01)
    abaixoDoMinimo() {
        return this.#quantidadeEstoque < this.#estoqueMinimo;
    }

    // false se ainda não há compra registrada (o custo sairia 0 sem aviso)
    temCusto() {
        return this.#quantidadeUltimaCompra > 0 && this.#valorUltimaCompra > 0;
    }
}

module.exports = Ingrediente;