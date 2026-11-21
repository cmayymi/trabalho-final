class FichaTecnica {
    #id;

    constructor(id, itens) {
        this.#id = id;
        this.itens = itens;         // serve apenas para auxiliar quais serão os itens a serem retornados (associacao entre itemficha e ficha)
    }
    getId() {
        return this.#id;
    }
    getItens() {
        return this.itens;
    }
    obterItens() {
        return this.itens;              // retorna a coleção de itens existentes na ficha tecnica daquele item
    }
    verificarDisp() {
        return this.itens.every(item => item.verificarDisp());          // checa se todos os elementos do array obedecem uma determinada condicao
    }
    calcularCusto() {  // soma o custo de cada item da ficha (0 e o valor inicial, evita erro se a ficha estiver vazia)
    return this.itens.reduce((soma, item) => soma + item.calcularCusto(), 0);
    }
    possuiIngredienteSemCusto() {
    return this.itens.some(item => !item.getIngrediente().temCusto());
    }
}

module.exports = FichaTecnica;