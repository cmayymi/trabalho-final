// RESPONSÁVEL PELO LIMITE ENTRE BOUNDARY E ENTITY DO; CORAÇÃO DO COMPONENTE DE PEDIDOS
// QUEM CHAMA O RESTANTE DAS CLASSES (PEDIDO E CADASTROPEDIDO)
// valida, busca preço no banco (via coleção) e calcula o total; não acessa o banco diretamente
const CadastroPedido = require('../models/cadastro-pedido');
const CadastroProduto = require('../models/cadastro-produto');
const Pedido = require('../models/pedido');
const ErroDeNegocio = require('../utils/erro-de-negocio');
const ValidadorData = require('../utils/validador-data');

class ControlePedidos {
    static #STATUS_PAGAMENTO_VALIDOS = ['pendente', 'pago'];

    constructor() {
        this.cadastro = new CadastroPedido();               // associacao consulta do diagrama de classes
        this.cadastroProduto = new CadastroProduto();       // para chegar na ficha tecnica (RF08)
    }

    // registra uma nova venda 
    // recebe o corpo da requisição e devolve o Pedido completo já salvo
    registrarPedido(corpo) {
        const dados = {
            data_pedido: corpo.data_pedido ?? ValidadorData.hojeISO(),
            cliente_nome: corpo.cliente_nome,
            cliente_contato: corpo.cliente_contato,
            descricao: corpo.descricao ?? '',
            data_entrega: corpo.data_entrega,
            status_pagamento: corpo.status_pagamento,
            itens: corpo.itens,
        };

        this.#validarDadosPedido(dados);

        // monta os itens usando o preco e o custo do banco, nunca o que veio do cliente
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

        // monta os dados como no registrarPedido, mas o padrao do data_pedido e a data do pedido original (não a data de hoje), para n mexer nos relatorios
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

    // monta os itens usando o preço e o custo do banco, nunca o que veio do cliente
    // (usado pelo registrarPedido e pelo editarPedido, assim os dois calculam igual)
    // produto por 'peso': preço e ficha valem por 1 kg, então os dois são multiplicados pelo mesmo fator (peso em g / 1000)
    // preço e custo são arredondados por unidade (centavos inteiros); a diferença em vendas grandes é de poucos centavos e é aceita
    #montarItens(itensRecebidos) {
        return itensRecebidos.map((item, i) => {
            const n = i + 1;
            const produto = this.cadastroProduto.buscarId(item.id);
            if (!produto) {
                throw new ErroDeNegocio(`Item ${n}: produto ${item.id} não encontrado.`, 404);
            }

            const porPeso = produto.getTipoVenda() === 'peso';
            if (porPeso && (!Number.isInteger(item.peso) || item.peso <= 0)) {
                throw new ErroDeNegocio(`Item ${n}: o peso (em gramas) deve ser um inteiro maior que zero.`);
            }
            const fator = porPeso ? item.peso / 1000 : 1;

            return {
                id: item.id,
                quantidade: item.quantidade,
                peso: porPeso ? item.peso : 0, // produto por unidade não tem peso
                preco_unitario: Math.round(produto.getPreco() * fator), // copia do preco no momento da venda
                custo_unitario: Math.round(produto.calcularCusto() * fator), // copia do custo no momento da venda
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
        });
    }

    #textoPreenchido(valor) {
        return typeof valor === 'string' && valor.trim() !== '';
    }
}

ControlePedidos.ErroDeNegocio = ErroDeNegocio;

module.exports = ControlePedidos;