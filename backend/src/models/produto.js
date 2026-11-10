class Produto {
    #id;
    #nome;
    #descricao;
    #preco;

    constructor(id, nome, descricao, preco, ficha) {
        this.#id = id;
        this.#nome = nome;
        this.#descricao = descricao;
        this.#preco = preco;
        this.ficha = ficha;
    }
    getId() {
        return this.#id;
    }
    getNome() {
        return this.#nome;
    }
    getDescricao() {
        return this.#descricao;
    }
    getPreco() {
        return this.#preco;
    }
    obterFichaTecnica() {
        return this.ficha;
    }
    verificarDisp() {
        return this.ficha.verificarDisp();              // pede a classe ficha tecnica para verificar a disponibilidade (se ha ingredientes)
    }
}

module.exports = Produto;