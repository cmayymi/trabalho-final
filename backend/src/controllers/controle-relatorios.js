// valida o periodo, chama o cadastro e monta as linhas; nao acessa o banco diretamente
const CadastroRelatorio = require('../models/cadastro-relatorio');
const ControlePedidos = require('./controle-pedidos');
const ValidadorData = require('../utils/validador-data');

const ErroDeNegocio = ControlePedidos.ErroDeNegocio;    // reaproveita o erro com status HTTP

class ControleRelatorios {
    constructor() {
        this.cadastro = new CadastroRelatorio();
    }

    // devolve { linhas: [...] } no formato do CONTRATO-API (valores em reais)
    gerarRelatorioVendas(inicio, fim) {
        this.#validarPeriodo(inicio, fim);

        const linhas = this.cadastro.buscarVendas(inicio, fim).map((r) => {
            // calculo em centavos (inteiros) e so no final converte para reais
            const vendaCentavos = r.quantidade * r.preco_unitario;
            const custoCentavos = r.quantidade * r.custo_unitario;
            return {
                pedido: r.pedido,
                cliente: r.cliente,
                item: r.item,
                data: r.data,
                venda: this.#paraReais(vendaCentavos),
                custo: this.#paraReais(custoCentavos),
                lucro: this.#paraReais(vendaCentavos - custoCentavos),
            };
        });

        return { linhas };
    }

    // devolve { linhas: [...] } com insumo, estoque atual, estoque minimo e custo
    // "custo" eh o valor da ULTIMA COMPRA (nao eh custo medio)
    gerarRelatorioEstoque() {
        const linhas = this.cadastro.buscarEstoque().map((r) => ({
            insumo: r.nome,
            unidade: r.unidadeMedida,
            estoque_atual: r.quantidadeEstoque,
            estoque_minimo: r.estoqueMinimo,
            custo_ultima_compra: this.#paraReais(r.custoUltimaCompra),
            abaixo_do_minimo: r.quantidadeEstoque < r.estoqueMinimo,
        }));

        return { linhas };
    }

    // lanca ErroDeNegocio (400) se as datas faltarem, forem invalidas ou fim < inicio
    #validarPeriodo(inicio, fim) {
        if (!ValidadorData.dataValida(inicio)) {
            throw new ErroDeNegocio("A data inicial é inválida (use AAAA-MM-DD).");
        }
        if (!ValidadorData.dataValida(fim)) {
            throw new ErroDeNegocio("A data final é inválida (use AAAA-MM-DD).");
        }
        if (!ValidadorData.periodoValido(inicio, fim)) {
            throw new ErroDeNegocio('A data final não pode ser anterior à data inicial.');
        }
    }

    #paraReais(centavos) {
        return centavos / 100;
    }
}

ControleRelatorios.ErroDeNegocio = ErroDeNegocio;

module.exports = ControleRelatorios;