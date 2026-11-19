// RESPONSÁVEL PELO LIMITE ENTRE BOUNDARY E ENTITY DO RF02; CORAÇÃO DO COMPONENTE DE PEDIDOS
// QUEM CHAMA O RESTANTE DAS CLASSES (PEDIDO E CADASTROPEDIDO)
// valida, busca preço no banco (via coleção) e calcula o total; não acessa o banco diretamente
const CadastroPedido = require('../models/cadastro-pedido');
const Pedido = require('../models/pedido');

// erro com status HTTP, para a rota saber o que devolver
class ErroDeNegocio extends Error {
    constructor(mensagem, status = 400) {
        super(mensagem);
        this.status = status;
    }
}

class ControlePedidos {
    static #STATUS_PAGAMENTO_VALIDOS = ['pendente', 'pago'];
    static #REGEX_DATA = /^\d{4}-\d{2}-\d{2}$/;     // formato AAAA-MM-DD (permite comparar como texto)

    constructor() {
        this.cadastro = new CadastroPedido();       // associacao consulta do diagrama de classes
    }

    // registra uma nova venda 
    // recebe o corpo da requisição e devolve o Pedido completo já salvo
    registrarPedido(corpo) {
        const dados = {
            data_pedido: corpo.data_pedido ?? this.#hojeISO(),
            cliente_nome: corpo.cliente_nome,
            cliente_contato: corpo.cliente_contato,
            descricao: corpo.descricao ?? '',
            data_entrega: corpo.data_entrega,
            status_pagamento: corpo.status_pagamento,
            itens: corpo.itens,
        };

        this.#validarDadosPedido(dados);

        // monta os itens usando o preço do banco, nunca o que veio do cliente
        const itens = dados.itens.map((item, i) => {
            const produto = this.cadastro.buscarProdutoPorId(item.produtoID);
            if (!produto) {
                throw new ErroDeNegocio(`Item ${i + 1}: produto ${item.produtoID} não encontrado.`, 404);
            }
            return {
                produtoID: item.produtoID,
                quantidade: item.quantidade,
                peso: item.peso,
                preco_unitario: produto.preco_base,     // cópia do preço no momento da venda
                custo_unitario: 0,                      // TODO RF08: trocar pelo custo real calculado pela ficha técnica
            };
        });

        const pedido = new Pedido({ ...dados, itens });
        const pedidosID = this.cadastro.salvarPedidoCompleto(pedido);
        return this.buscarPedido(pedidosID);
    }

    // devolve o pedido com seus itens; 404 se não existir
    buscarPedido(pedidosID) {
        const pedido = this.cadastro.buscarPorId(pedidosID);
        if (!pedido) {
            throw new ErroDeNegocio('Pedido não encontrado.', 404);
        }
        return pedido;
    }

    // lista os pedidos ativos
    listarPedidos() {
        return this.cadastro.listar();
    }

    // valida os dados recebidos; lança ErroDeNegocio se algo estiver errado
    #validarDadosPedido(dados) {
        if (!this.#textoPreenchido(dados.cliente_nome)) {
            throw new ErroDeNegocio('O nome do cliente é obrigatório.');
        }
        if (!this.#textoPreenchido(dados.cliente_contato)) {
            throw new ErroDeNegocio('O contato do cliente é obrigatório.');
        }
        if (!ControlePedidos.#STATUS_PAGAMENTO_VALIDOS.includes(dados.status_pagamento)) {
            throw new ErroDeNegocio("O status do pagamento deve ser 'pendente' ou 'pago'.");
        }
        if (!this.#dataValida(dados.data_pedido)) {
            throw new ErroDeNegocio('A data do pedido é inválida (use AAAA-MM-DD).');
        }
        if (!this.#dataValida(dados.data_entrega)) {
            throw new ErroDeNegocio('A data de entrega é inválida (use AAAA-MM-DD).');
        }
        if (dados.data_entrega < dados.data_pedido) {
            throw new ErroDeNegocio('A data de entrega não pode ser anterior à data do pedido.');
        }
        if (!Array.isArray(dados.itens) || dados.itens.length === 0) {
            throw new ErroDeNegocio('O pedido precisa ter pelo menos um item.');
        }

        dados.itens.forEach((item, i) => {
            const n = i + 1;
            if (!Number.isInteger(item.produtoID) || item.produtoID <= 0) {
                throw new ErroDeNegocio(`Item ${n}: produto inválido.`);
            }
            if (!Number.isInteger(item.quantidade) || item.quantidade <= 0) {
                throw new ErroDeNegocio(`Item ${n}: a quantidade deve ser um inteiro maior que zero.`);
            }
            if (!Number.isInteger(item.peso) || item.peso <= 0) {
                throw new ErroDeNegocio(`Item ${n}: o peso (em gramas) deve ser um inteiro maior que zero.`);
            }
        });
    }

    // data de hoje no formato AAAA-MM-DD (usa o fuso do servidor, não UTC)
    #hojeISO() {
        const agora = new Date();
        const mes = String(agora.getMonth() + 1).padStart(2, '0');
        const dia = String(agora.getDate()).padStart(2, '0');
        return `${agora.getFullYear()}-${mes}-${dia}`;
    }

    // confere se é uma data real, não só o formato (ex.: 2026-02-31 é inválida)
    #dataValida(texto) {
        if (typeof texto !== 'string' || !ControlePedidos.#REGEX_DATA.test(texto)) {
            return false;
        }
        const d = new Date(`${texto}T00:00:00Z`);
        return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === texto;
    }

    #textoPreenchido(valor) {
        return typeof valor === 'string' && valor.trim() !== '';
    }
}

ControlePedidos.ErroDeNegocio = ErroDeNegocio;

module.exports = ControlePedidos;