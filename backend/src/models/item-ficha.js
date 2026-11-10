class ItemFicha {
    #quantidade;

    constructor(quantidade, ingrediente){
        this.#quantidade = quantidade;
        this.ingrediente = ingrediente;                 // itemficha passa a ter acesso ao mesmo ingrediente referido
    }
    getQuantidade() {
        return this.#quantidade;
    }
    getIngrediente() {
        return this.ingrediente;
    }
    verificarDisp() {                       // verifica se o ingrediente esta disponivel
        return this.ingrediente.possuiQuant(this.#quantidade);
    }
}

module.exports = ItemFicha; 