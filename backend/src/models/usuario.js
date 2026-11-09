// RESPONSÁVEL PELA ENTITY DO USUARIO; ARMAZENA INFOS PRIMORDIAIS RELACIONADAS A CADA USUARIO
const bcrypt = require('bcryptjs');

class Usuario{
    // atributos privados, usuario nao pode ter acesso
    #id;
    #nome;
    #login;
    #senhaHash;         // garante segurança e proteção dos dados do usuario; nunca havera get, pois nenhuma classe pode acessar

    constructor(id, nome, login, senhaHash){
        this.#id = id;                          // inicializa os atributos privados
        this.#nome = nome;
        this.#login = login;
        this.#senhaHash = senhaHash;
    }

    validarSenha(senha){
        // verificar se a senha é uma string; caso contrario, a comparacao ira falhar
        if (typeof senha !== 'string') {
            return false;
        }

        return bcrypt.compareSync(senha, this.#senhaHash);
    }

    // getters
    getId() {
        return this.#id;
    }

    getNome() {
        return this.#nome;
    }

    getLogin() {
        return this.#login;
    }

}

module.exports = Usuario;