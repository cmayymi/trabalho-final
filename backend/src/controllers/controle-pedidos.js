// RESPONSÁVEL PELO LIMITE ENTRE BOUNDARY E ENTITY DO; CORAÇÃO DO COMPONENTE DE PEDIDOS
// QUEM CHAMA O RESTANTE DAS CLASSES (PEDIDO E CADASTROPEDIDO)
// valida, busca preço no banco (via coleção) e calcula o total; não acessa o banco diretamente
const CadastroPedido = require('../models/cadastro-pedido');
const Pedido = require('../models/pedido');
const ValidadorData = require('../utils/validador-data');

// erro com status HTTP, para a rota saber o que devolver
class ErroDeNegocio extends Error {
    constructor(mensagem, status = 400) {
        super(mensagem);
        this.status = status;
    }
}

class ControlePedidos {
    static #STATUS_PAGAMENTO_VALIDOS = ['pendente', 'pago'];

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
        const itens = this.#montarItens(dados.itens);

        const pedido = new Pedido({ ...dados, itens });
        const pedidosID = this.cadastro.salvarPedidoCompleto(pedido);
        return this.buscarPedido(pedidosID);
    }

    // edita uma venda existente (substitui cabeçalho e itens)
    // devolve o Pedido ja atualizado
    editarPedido(pedidosID, corpo) {
        // busca o pedido atual 
        const pedidoOriginal = this.buscarPedido(pedidosID);

        // monta os dados como no registrarPedido, mas o padrao do data_pedido e a data do pedido original (não #hojeISO), para n mexer nos relatorios
        const dados = {
            data_pedido: corpo.data_pedido ?? pedidoOriginal.getDataPedido(),
            cliente_nome: corpo.cliente_nome,
            cliente_contato: corpo.cliente_contato,
            descricao: corpo.descricao ?? '',
            data_entrega: corpo.data_entrega,
            status_pagamento: corpo.status_pagamento,
            itens: corpo.itens,
        };

        // valida
        this.#validarDadosPedido(dados);

        // monta os itens com o preco atual do catalogo
        const itens = this.#montarItens(dados.itens);

        // cria o Pedido com o id, atualiza e devolve o pedido salvo
        const pedido = new Pedido({ ...dados, id: pedidosID, itens });
        this.cadastro.atualizarPedidoCompleto(pedido);
        return this.buscarPedido(pedidosID);
    }

    // exclusao logica
    excluirPedido(pedidosID) {
        const excluiu = this.cadastro.marcarComoExcluido(pedidosID);
        if (!excluiu) {
            throw new ErroDeNegocio('Pedido não encontrado.', 404);
        }
    }

    // monta os itens usando o preço do banco, nunca o que veio do cliente
    // (extraído do registrarPedido; usado também pelo editarPedido)
    #montarItens(itensRecebidos) {
        return itensRecebidos.map((item, i) => {
            const produto = this.cadastro.buscarProdutoPorId(item.id);
            if (!produto) {
                throw new ErroDeNegocio(`Item ${i + 1}: produto ${item.id} não encontrado.`, 404);
            }
            return {
                id: item.id,
                quantidade: item.quantidade,
                peso: item.peso,
                preco_unitario: produto.preco,
                custo_unitario: 0, // TODO RF08
            };
        });
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
        if (!ValidadorData.dataValida(dados.data_pedido)) {
            throw new ErroDeNegocio('A data do pedido é inválida (use AAAA-MM-DD).');
        }
        if (!ValidadorData.dataValida(dados.data_entrega)) {
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
            if (!Number.isInteger(item.id) || item.id <= 0) {
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

    #textoPreenchido(valor) {
        return typeof valor === 'string' && valor.trim() !== '';
    }
}

ControlePedidos.ErroDeNegocio = ErroDeNegocio;

module.exports = ControlePedidos;