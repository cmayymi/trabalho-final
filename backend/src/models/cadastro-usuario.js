// RESPONSÁVEL PELA ENTITY COLLECTION DE USUARIOS PERSISTENTES (DADOS DEVEM EXISTIR MESMO APÓS O FIM DE UMA SESSÃO)
const db = require('../../database/conexao');
const Usuario = require('./usuario');

class CadastroUsuario {
    buscarLogin(login) {
        const achou = db.prepare('SELECT * FROM Usuario WHERE login = ?').get(login);     // capta o campo login do banco de dados
        if(!achou){                 // se nao ha nenhum usuario com esse login, entao retorna nulo
            return null;
        }
        return new Usuario(achou.id, achou.nome, achou.login, achou.senhaHash);     // caso contrario, retorna o usuario procurado
    }
}

module.exports = CadastroUsuario;