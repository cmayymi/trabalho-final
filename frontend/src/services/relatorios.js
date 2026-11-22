// Comunicação dos relatórios com o backend (/api/relatorios).
// RF01: relatório de vendas (UC1) e de estoque. RF09: relatório de lucro.
// Os valores chegam em centavos e são convertidos para reais aqui.
import { usarMock } from './config'
import { requisicao } from './http'
import { mockRelatorios } from './mock/api'

const paraReais = (centavos) => (Number(centavos) || 0) / 100

const real = {
  async vendas(inicio, fim) {
    const resposta = await requisicao(`/relatorios/vendas?inicio=${encodeURIComponent(inicio)}&fim=${encodeURIComponent(fim)}`)
    return {
      linhas: resposta.linhas.map((l) => ({
        ...l,
        venda: paraReais(l.venda),
        custo: paraReais(l.custo),
        lucro: paraReais(l.lucro)
      }))
    }
  },

  async estoque() {
    const resposta = await requisicao('/relatorios/estoque')
    return {
      linhas: resposta.linhas.map((l) => ({
        insumo: l.insumo,
        unidade: l.unidade,
        estoqueAtual: l.estoque_atual,
        estoqueMinimo: l.estoque_minimo,
        custoUnitario: paraReais(l.custo_unitario),
        valorUltimaCompra: paraReais(l.valor_ultima_compra),
        quantidadeUltimaCompra: l.quantidade_ultima_compra,
        dataUltimaCompra: l.data_ultima_compra,
        abaixoDoMinimo: l.abaixo_do_minimo,
        semCusto: l.sem_custo
      }))
    }
  },

  async lucro(inicio, fim) {
    const a = await requisicao('/relatorios/lucro', { metodo: 'POST', corpo: { inicio, fim } })
    return apuracaoDeBackend(a)
  },

  async historicoLucro() {
    const resposta = await requisicao('/relatorios/lucro/historico')
    return resposta.apuracoes.map(apuracaoDeBackend)
  }
}

function apuracaoDeBackend(a) {
  return {
    id: a.id,
    inicio: a.inicio,
    fim: a.fim,
    dataApuracao: a.data_apuracao,
    faturamento: paraReais(a.faturamento),
    custo: paraReais(a.custo_total),
    lucro: paraReais(a.lucro),
    margem: a.margem,
    produtos: (a.produtos || []).map((p) => ({
      produto: p.produto,
      quantidade: p.quantidade,
      faturamento: paraReais(p.faturamento),
      custo: paraReais(p.custo),
      lucro: paraReais(p.lucro),
      margem: p.margem
    }))
  }
}

export default usarMock.relatorios ? mockRelatorios : real
