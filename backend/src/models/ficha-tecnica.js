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
}

module.exports = FichaTecnica;