class Produto {
    #id;
    #nome;
    #descricao;
    #preco;
    #tipoVenda;     // 'unidade' ou 'peso' (para 'peso', preco e ficha valem por 1 kg)

    constructor(id, nome, descricao, preco, ficha, tipoVenda) {
        if (!['unidade', 'peso'].includes(tipoVenda)) {
            throw new Error("ERRO: tipo de venda deve ser 'unidade' ou 'peso'.");
        }
        this.#id = id;
        this.#nome = nome;
        this.#descricao = descricao;
        this.#preco = preco;
        this.ficha = ficha;
        this.#tipoVenda = tipoVenda;
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
    getTipoVenda() {
        return this.#tipoVenda;
    }
    obterFichaTecnica() {
        return this.ficha;
    }
    verificarDisp() {
        return this.ficha.verificarDisp();              // pede a classe ficha tecnica para verificar a disponibilidade (se ha ingredientes)
    }
    calcularCusto() {
        return this.ficha.calcularCusto();              // delega a ficha tecnica, que soma o custo dos itens
    }
    possuiIngredienteSemCusto() {
        return this.ficha.possuiIngredienteSemCusto();
    }
}

module.exports = Produto;