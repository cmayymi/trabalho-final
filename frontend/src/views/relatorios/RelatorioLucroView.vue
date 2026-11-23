<template>
  <CabecalhoPagina titulo="Relatório de lucro" subtitulo="Rentabilidade do negócio por período" />

  <form class="row g-3 align-items-end mb-4 nao-imprimir" novalidate aria-label="Período da apuração" @submit.prevent="apurar">
    <div class="col-6 col-lg-3">
      <label class="form-label" for="lucro-inicio">Início</label>
      <input id="lucro-inicio" v-model="inicio" type="date" class="form-control" />
    </div>
    <div class="col-6 col-lg-3">
      <label class="form-label" for="lucro-fim">Fim</label>
      <input id="lucro-fim" v-model="fim" type="date" class="form-control" />
    </div>
    <div class="col-12 col-lg-auto d-flex flex-wrap gap-2">
      <button type="button" class="btn btn-branco" @click="definirPeriodo('mes')">Este mês</button>
      <button type="button" class="btn btn-branco" @click="definirPeriodo('ano')">Este ano</button>
      <button type="submit" class="btn btn-ambar" :disabled="carregando">Gerar apuração</button>
    </div>
  </form>

  <EstadoPagina v-if="carregando" tipo="carregando" titulo="Apurando o lucro…" />
  <EstadoPagina v-else-if="erro" tipo="erro" icone="bi-calendar-x" titulo="Não foi possível gerar a apuração" :texto="erro" />
  <EstadoPagina v-else-if="apuracao && !apuracao.produtos.length" icone="bi-inbox" titulo="Nenhuma venda encontrada" texto="Não existem vendas registradas no período escolhido." />

  <template v-else-if="apuracao">
    <section class="row g-3 mb-4" aria-label="Resumo da apuração">
      <div v-for="item in resumo" :key="item.rotulo" class="col-6 col-xl-3">
        <div class="cartao-numero">
          <div class="rotulo">{{ item.rotulo }}</div>
          <div class="valor">{{ item.valor }}</div>
        </div>
      </div>
    </section>

    <div class="table-responsive mb-4">
      <table class="table tabela-sbc">
        <caption class="visually-hidden">Lucro por produto</caption>
        <thead>
          <tr>
            <th scope="col">Produto</th><th scope="col">Qtd. vendas</th><th scope="col">Faturamento</th>
            <th scope="col">Custo</th><th scope="col">Lucro</th><th scope="col">Margem</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in apuracao.produtos" :key="p.produto">
            <td>{{ p.produto }}</td>
            <td class="num">{{ p.quantidade }}</td>
            <td class="num">{{ moeda(p.faturamento) }}</td>
            <td class="num">{{ moeda(p.custo) }}</td>
            <td class="num">{{ moeda(p.lucro) }}</td>
            <td class="num">{{ porcentagem(p.margem) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>

  <h2 class="titulo-secao mt-2">Apurações anteriores</h2>
  <p v-if="!historico.length" class="texto-suave">Nenhuma apuração gravada ainda.</p>
  <div v-else class="table-responsive">
    <table class="table tabela-sbc">
      <thead>
        <tr><th scope="col">Gerada em</th><th scope="col">Período</th><th scope="col">Faturamento</th><th scope="col">Lucro</th><th scope="col">Margem</th></tr>
      </thead>
      <tbody>
        <tr v-for="a in historico" :key="a.id">
          <td class="num">{{ dataLonga(a.dataApuracao) }}</td>
          <td class="num">{{ dataLonga(a.inicio) }} a {{ dataLonga(a.fim) }}</td>
          <td class="num">{{ moeda(a.faturamento) }}</td>
          <td class="num">{{ moeda(a.lucro) }}</td>
          <td class="num">{{ porcentagem(a.margem) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import CabecalhoPagina from '@/components/layout/CabecalhoPagina.vue'
import EstadoPagina from '@/components/comum/EstadoPagina.vue'
import relatorios from '@/services/relatorios'
import { avisar } from '@/composables/avisos'
import { dataLonga, hojeISO, moeda } from '@/utils/formatadores'

// RF09: apuração do lucro por período, com faturamento, custo (RF08), lucro e margem por produto.
const hoje = hojeISO()
const inicio = ref(`${hoje.slice(0, 7)}-01`)
const fim = ref(hoje)
const apuracao = ref(null)
const historico = ref([])
const carregando = ref(false)
const erro = ref('')

const porcentagem = (valor) => `${(Number(valor) || 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`

const resumo = computed(() => [
  { rotulo: 'Faturamento', valor: moeda(apuracao.value.faturamento) },
  { rotulo: 'Custos', valor: moeda(apuracao.value.custo) },
  { rotulo: 'Lucro', valor: moeda(apuracao.value.lucro) },
  { rotulo: 'Margem', valor: porcentagem(apuracao.value.margem) }
])

function definirPeriodo(tipo) {
  inicio.value = tipo === 'mes' ? `${hoje.slice(0, 7)}-01` : `${hoje.slice(0, 4)}-01-01`
  fim.value = hoje
}

async function carregarHistorico() {
  try {
    historico.value = await relatorios.historicoLucro()
  } catch {
    historico.value = []
  }
}

async function apurar() {
  erro.value = ''
  if (!inicio.value || !fim.value) {
    erro.value = 'Informe as datas de início e fim.'
    return
  }
  if (inicio.value > fim.value) {
    erro.value = 'A data de início não pode ser depois da data de fim.'
    return
  }
  carregando.value = true
  try {
    apuracao.value = await relatorios.lucro(inicio.value, fim.value)
    if (apuracao.value.id) {
      avisar.sucesso('Apuração gerada e gravada no histórico.')
      await carregarHistorico()
    }
  } catch (falha) {
    erro.value = falha.message
  } finally {
    carregando.value = false
  }
}

onMounted(carregarHistorico)
</script>
