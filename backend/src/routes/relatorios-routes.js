// recebe a requisição HTTP e devolve a resposta
// as regras (validacao de periodo, calculos) ficam no controle-relatorios.js

const express = require('express');
const router = express.Router();

const ControleRelatorios = require('../controllers/controle-relatorios');
const controle = new ControleRelatorios();

// converte o erro em resposta HTTP
function responderErro(res, erro) {
    if (erro instanceof ControleRelatorios.ErroDeNegocio) {
        return res.status(erro.status).json({ erro: erro.message });
    }
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno ao gerar o relatório.' });
}

// GET /api/relatorios/vendas?inicio=AAAA-MM-DD&fim=AAAA-MM-DD
router.get('/vendas', (req, res) => {
    const { inicio, fim } = req.query;
    try {
        return res.status(200).json(controle.gerarRelatorioVendas(inicio, fim));
    } catch (erro) {
        return responderErro(res, erro);
    }
});

// GET /api/relatorios/estoque
router.get('/estoque', (req, res) => {
    try {
        return res.status(200).json(controle.gerarRelatorioEstoque());
    } catch (erro) {
        return responderErro(res, erro);
    }
});

module.exports = router;