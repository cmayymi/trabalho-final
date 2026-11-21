// recebe a requisição HTTP e devolve a resposta
// as regras (validacao de periodo, calculos) ficam no controle-relatorios.js

const express = require('express');
const router = express.Router();

const ControleRelatorios = require('../controllers/controle-relatorios');
const controle = new ControleRelatorios();

// converte o erro em resposta HTTP: erro de negocio tem status proprio; o resto vira 500
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

// POST /api/relatorios/lucro   body: { "inicio": "AAAA-MM-DD", "fim": "AAAA-MM-DD" }
// POST porque gera E grava a apuracao (GET nao deveria gravar nada)
// 201 = gravou (id preenchido); 200 = periodo sem vendas, nada foi gravado (id: null)
router.post('/lucro', (req, res) => {
    const { inicio, fim } = req.body || {};
    try {
        const apuracao = controle.gerarRelatorioLucro(inicio, fim);
        return res.status(apuracao.id === null ? 200 : 201).json(apuracao);
    } catch (erro) {
        return responderErro(res, erro);
    }
});

// GET /api/relatorios/lucro/historico
router.get('/lucro/historico', (req, res) => {
    try {
        return res.status(200).json(controle.listarHistoricoLucro());
    } catch (erro) {
        return responderErro(res, erro);
    }
});

module.exports = router;