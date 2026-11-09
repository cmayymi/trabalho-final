<template>
  <CabecalhoPagina titulo="Página inicial" subtitulo="Resumo do negócio e atalhos principais" />

  <EstadoPagina v-if="carregando" tipo="carregando" titulo="Carregando o resumo…" />
  <EstadoPagina v-else-if="erro" tipo="erro" icone="bi-cloud-slash" titulo="Não foi possível carregar o resumo" :texto="erro">
    <button class="btn btn-branco" type="button" @click="carregar">Tentar novamente</button>
  </EstadoPagina>

  <template v-else>
    <section class="row g-3 mb-4" aria-label="Indicadores">
      <div v-for="indicador in indicadores" :key="indicador.rotulo" class="col-6 col-xl-3">
        <div class="cartao-numero">
          <div class="rotulo">{{ indicador.rotulo }}</div>
          <div class="valor">{{ indicador.valor }}</div>
        </div>
      </div>
    </section>

    <h2 class="titulo-secao">Ações rápidas</h2>
    <div class="row g-3 mb-4">
      <div class="col-12 col-md-4">
        <router-link class="btn btn-ambar w-100 atalho" :to="{ name: 'venda-nova' }">+ Registrar venda</router-link>
      </div>
      <div class="col-12 col-md-4">
        <router-link class="btn btn-branco w-100 atalho" :to="{ name: 'produto-novo' }">+ Novo produto</router-link>
      </div>
      <div class="col-12 col-md-4">
        <router-link class="btn btn-branco w-100 atalho" :to="{ name: 'em-breve', query: { funcionalidade: 'Movimentar estoque' } }">+ Movimentar estoque</router-link>
      </div>
    </div>

    <h2 class="titulo-secao">Alertas</h2>
    <div v-if="criticos.length" class="d-grid gap-2">
      <div v-for="insumo in criticos" :key="insumo.id" class="alerta-sbc">
        <i class="bi bi-exclamation-triangle me-2" aria-hidden="true"></i>
        {{ insumo.nome }} atingiu o estoque mínimo. Saldo atual: {{ numeroBR(insumo.saldo) }} {{ insumo.unidade }}.
      </div>
    </div>
    <p v-else class="texto-suave">Nenhum alerta no momento. O estoque está em dia.</p>
  </template>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import CabecalhoPagina from '@/components/layout/CabecalhoPagina.vue'
import EstadoPagina from '@/components/comum/EstadoPagina.vue'
import catalogo from '@/services/catalogo'
import vendasApi from '@/services/vendas'
import { hojeISO, moedaCurta, numeroBR } from '@/utils/formatadores'

const carregando = ref(true)
const erro = ref('')
const vendas = ref([])
const insumos = ref([])

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    ;[vendas.value, insumos.value] = await Promise.all([vendasApi.listar(), catalogo.listarInsumos()])
  } catch (falha) {
    erro.value = falha.message
  } finally {
    carregando.value = false
  }
}

onMounted(carregar)

const criticos = computed(() => insumos.value.filter((i) => i.status !== 'OK'))

const indicadores = computed(() => {
  const hoje = hojeISO()
  const deHoje = vendas.value.filter((v) => v.dataPedido === hoje)
  return [
    { rotulo: 'Vendas hoje', valor: deHoje.length },
    { rotulo: 'Faturamento hoje', valor: moedaCurta(deHoje.reduce((soma, v) => soma + v.valorTotal, 0)) },
    { rotulo: 'Pedidos pendentes', valor: vendas.value.filter((v) => v.statusPagamento === 'Pendente').length },
    { rotulo: 'Estoque crítico', valor: criticos.value.length }
  ]
})
</script>

<style scoped>
.atalho {
  padding-bottom: 1.1rem;
  padding-top: 1.1rem;
}
</style>
