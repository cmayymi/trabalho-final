// RESPONSÁVEL POR CONECTAR COM O FRONTEND
// recebe a requisição HTTP, valida só o formato e devolve a resposta
// as regras de negócio ficam no controle-pedidos.js

const express = require('express');
const router = express.Router();                // roteador do express para gerenciar as rotas de pedidos

const ControlePedidos = require('../controllers/controle-pedidos');
const controle = new ControlePedidos();

// converte o erro em resposta HTTP
// erros de negócio têm status próprio; qualquer outro vira 500
function responderErro(res, erro) {
    if (erro instanceof ControlePedidos.ErroDeNegocio) {
        return res.status(erro.status).json({ erro: erro.message });
    }
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno ao processar o pedido.' });
}

// POST /api/pedidos -> registra uma nova venda
router.post('/', (req, res) => {
    const corpo = req.body;

    // formato: o corpo é um objeto e itens é uma lista
    if (!corpo || typeof corpo !== 'object' || Array.isArray(corpo)) {
        return res.status(400).json({ erro: 'Corpo da requisição inválido.' });
    }
    if (!Array.isArray(corpo.itens)) {
        return res.status(400).json({ erro: "O campo 'itens' deve ser uma lista." });
    }

    try {
        const pedido = controle.registrarPedido(corpo);
        return res.status(201).json(pedido);
    } catch (erro) {
        return responderErro(res, erro);
    }
});

// GET /api/pedidos -> lista os pedidos ativos
router.get('/', (req, res) => {
    try {
        return res.status(200).json(controle.listarPedidos());
    } catch (erro) {
        return responderErro(res, erro);
    }
});

// GET /api/pedidos/:id -> detalhes de um pedido com seus itens
router.get('/:id', (req, res) => {
    const id = Number(req.params.id);

    // formato: o id da URL precisa ser um inteiro positivo
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ erro: 'ID de pedido inválido.' });
    }

    try {
        return res.status(200).json(controle.buscarPedido(id));
    } catch (erro) {
        return responderErro(res, erro);
    }
});

module.exports = router;