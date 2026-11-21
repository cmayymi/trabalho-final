// valida o periodo, chama o cadastro e monta as linhas; nao acessa o banco diretamente
// importa o ErroDeNegocio do utils, NAO do ControlePedidos (evita acoplar os dois controles)
const CadastroRelatorio = require('../models/cadastro-relatorio');
const ErroDeNegocio = require('../utils/erro-de-negocio');
const ValidadorData = require('../utils/validador-data');

class ControleRelatorios {
    constructor() {
        this.cadastro = new CadastroRelatorio();
    }

    // devolve { linhas: [...] } com venda, custo e lucro em CENTAVOS (inteiros)
    // (decisao do grupo: relatorio devolve centavos; quem arredonda/formata eh o frontend)
    gerarRelatorioVendas(inicio, fim) {
        this.#validarPeriodo(inicio, fim);

        const linhas = this.cadastro.buscarVendas(inicio, fim).map((r) => {
            const venda = r.quantidade * r.preco_unitario;
            const custo = r.quantidade * r.custo_unitario;
            return {
                pedido: r.pedido,
                cliente: r.cliente,
                item: r.item,
                data: r.data,
                venda,
                custo,
                lucro: venda - custo,
            };
        });

        return { linhas };     // periodo sem vendas -> { linhas: [] }
    }

    // devolve { linhas: [...] }
    // com SO o "ultimo valor pago" isso eh o custo da ULTIMA COMPRA, nao custo medio
    gerarRelatorioEstoque() {
        const linhas = this.cadastro.buscarEstoque().map((ing) => ({
            insumo: ing.getNome(),
            unidade: ing.getUM(),
            estoque_atual: ing.getQuantEstoque(),
            estoque_minimo: ing.getEstoqueMinimo(),
            valor_ultima_compra: ing.getValorUltimaCompra(),            // centavos
            quantidade_ultima_compra: ing.getQuantUltimaCompra(),
            custo_unitario: ing.calcularCusto(1),                       // centavos por 1 unidade do insumo, sem arredondar
            data_ultima_compra: ing.getDataUltimaCompra(),
            abaixo_do_minimo: ing.abaixoDoMinimo(),
            sem_custo: !ing.temCusto(),
        }));

        return { linhas };
    }

    // lanca ErroDeNegocio (400) se as datas faltarem, forem invalidas ou fim < inicio
    #validarPeriodo(inicio, fim) {
        if (!ValidadorData.dataValida(inicio)) {
            throw new ErroDeNegocio('A data inicial é inválida (use AAAA-MM-DD).');
        }
        if (!ValidadorData.dataValida(fim)) {
            throw new ErroDeNegocio('A data final é inválida (use AAAA-MM-DD).');
        }
        if (!ValidadorData.periodoValido(inicio, fim)) {
            throw new ErroDeNegocio('A data final não pode ser anterior à data inicial.');
        }
    }
}

ControleRelatorios.ErroDeNegocio = ErroDeNegocio;

module.exports = ControleRelatorios;