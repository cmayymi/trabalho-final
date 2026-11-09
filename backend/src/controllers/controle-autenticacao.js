// RESPONSÁVEL PELO LIMITE ENTRE BOUNDARY E ENTITY; CORAÇÃO DO COMPONENTE
// QUEM CHAMA O RESTANTE DAS CLASSES (USUARIO E CADASTROUSUARIO)
const jwt = require('jsonwebtoken');
const CadastroUsuario = require('../models/cadastro-usuario');

class ControleAutenticacao {
    constructor() {
        this.cadastro = new CadastroUsuario();          // associacao consults do diagrama de classes
    }

    iniciarSessao(usuario) {
        return jwt.sign({id: usuario.getId(), login: usuario.getLogin()}, process.env.JWT_SECRET, {expiresIn: '8h'});        // token assinado pelo servidor 
        // tem um prazo de existencia de 8 hs, caso haja perda ou roubo do mesmo
    }

    autenticarUsuario(login, senha) {
        if (typeof login !== 'string' || typeof senha !== 'string') {
            return null;
        }
        // pede para o CadastroUsuario buscar o login no database
        const usuario = this.cadastro.buscarLogin(login);
        if(!usuario) {
            return null;                // se nao houver nenhum usuario com esse login, o retorno será nulo
        }
        else if (usuario.validarSenha(senha)){      // se o usuario existe, chama validar senha
            return this.iniciarSessao(usuario);
        }
        else {                              // caso a senha der errado, retorna null e frontend retorna mensagem de erro
            return null;
        }
    }

    // se um usuario for apagado, seu token continuara valido ate o prazo de expiracao
    autenticado(token) {
        if (typeof token !== 'string') {
            return false;
        }
        try {
            jwt.verify(token, process.env.JWT_SECRET);      // verifica se o token esta compativel, se nao foi adulterado ou expirado
            return true;                                    // se for compativel, retorna true
        } catch {                                           // se foi expirado ou adulterado, retorna false
            return false;
        }
    }
}

module.exports = ControleAutenticacao;