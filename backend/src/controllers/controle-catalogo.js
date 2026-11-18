// RESPONSÁVEL POR CHAMAR AS ENTIDADES E AS COLEÇÕES REFERENTES AO CATÁLOGO
const CadastroProduto = require('../models/cadastro-produto');
const ControleAutenticacao = require('./controle-autenticacao');

class ControleCatalogo {
    #cadastro;
    #autenticacao;

    constructor() {
        this.#cadastro = new CadastroProduto();
        this.#autenticacao = new ControleAutenticacao();
    }

    verificarSessao(token) {
        return this.#autenticacao.autenticado(token);                // checa se o token do usuario eh valido, ou seja, se ele esta autenticado
    }

    listarProdutos(token) {                              // a listagem dos produtos eh protegida por meio de uma autenticacao, ou seja, so eh possivel se o usuario estiver autenticado 
        if(this.verificarSessao(token)) {
            return this.#cadastro.listarTodos();                 // token como parametro para que o controle do catalogo chame o controle autenticacao e verifique se eh possivel listar os produtos
        }
        else {
            throw new Error("Usuário não autenticado.");
        }
    }

    detalharProduto(id_produto, token) {
        if(this.verificarSessao(token)) {           // se o usuario estiver autenticado
            const produto = this.#cadastro.buscarId(id_produto);
            if (produto == null) {
                return null;
            }
   
            const ficha = produto.obterFichaTecnica();
            const ingredientesDisp = produto.verificarDisp();
            return {produto, ficha, ingredientesDisp};                  // retorna tres propriedades identificadas no diagrama de sequencia
  
        }
        else {
            throw new Error("Usuário não autenticado.");
        }
    }
}

module.exports = ControleCatalogo;