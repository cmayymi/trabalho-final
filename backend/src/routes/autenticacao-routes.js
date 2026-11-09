// RESPONSÁVEL POR CONECTAR COM O FRONTEND (PARTE DO IOKS)

const express = require('express');
const router = express.Router();                // roteador do express para gerenciar as rotas de autenticacao

const ControleAutenticacao = require('../controllers/controle-autenticacao');
const controle = new ControleAutenticacao();

router.post('/login', (req, res) => {
  const { login, senha } = req.body || {};              // recebe login e senha no corpo da requisicao

  if (
    typeof login !== 'string' ||                        // verifica se os campos foram corretamente enviados
    typeof senha !== 'string' ||
    login.trim() === '' ||
    senha === ''
  ) {
    return res.status(400).json({                       // se nao estiverem, retorna erro 400
      erro: 'Login e senha são obrigatórios.'
    });
  }

  const token = controle.autenticarUsuario(login, senha);       // chama o metodo de ControleAutenticacao autenticarUsuario

  if (!token) {                                                 // checa se eles sao incompativeis com login e senha verdadeira do usuario (token do servidor)
    return res.status(401).json({                               // se forem incomaptiveis, retorna erro 401
      erro: 'Login ou senha inválidos.'
    });
  }

  return res.status(200).json({ token });                       // caso sejam validos, retorna 200 e o token jwt
});

module.exports = router;
