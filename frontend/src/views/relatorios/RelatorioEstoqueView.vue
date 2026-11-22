<template>
  <CabecalhoPagina titulo="Relatório de estoque" subtitulo="Posição atual dos insumos" />

  <section class="d-flex flex-wrap gap-3 mb-4 nao-imprimir" aria-label="Ações do relatório">
    <button type="button" class="btn btn-branco" :disabled="carregando" @click="carregar">
      <i class="bi bi-arrow-clockwise me-1" aria-hidden="true"></i>Atualizar
    </button>
    <button type="button" class="btn btn-ambar ms-lg-auto" :disabled="!linhas.length" @click="imprimir">
      <i class="bi bi-printer me-1" aria-hidden="true"></i>Imprimir
    </button>
  </section>

  <EstadoPagina v-if="carregando" tipo="carregando" titulo="Consultando o estoque…" />
  <EstadoPagina v-else-if="erro" tipo="erro" icone="bi-cloud-slash" titulo="Não foi possível gerar o relatório" :texto="erro">
    <button class="btn btn-branco" type="button" @click="carregar">Tentar novamente</button>
  </EstadoPagina>
  <EstadoPagina v-else-if="!linhas.length" icone="bi-box-seam" titulo="Nenhum insumo cadastrado" texto="Não há ingredientes no estoque." />

  <template v-else>
    <section class="row g-3 mb-4" aria-label="Resumo do estoque">
      <div class="col-6 col-xl-3">
        <div class="cartao-numero">
          <div class="rotulo">Insumos</div>
          <div class="valor">{{ linhas.length }}</div>
        </div>
      </div>
      <div class="col-6 col-xl-3">
        <div class="cartao-numero">
          <div class="rotulo">Abaixo do mínimo</div>
          <div class="valor">{{ abaixoDoMinimo }}</div>
        </div>
      </div>
    </section>

    <div class="table-responsive">
      <table class="table tabela-sbc">
        <caption class="visually-hidden">Posição atual dos insumos</caption>
        <thead>
          <tr>
            <th scope="col">Insumo</th><th scope="col">Saldo atual</th><th scope="col">Unidade</th>
            <th scope="col">Estoque mínimo</th><th scope="col">Custo médio unitário</th>
            <th scope="col">Última compra</th><th scope="col">Situação</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="linha in linhas" :key="linha.insumo">
            <td>{{ linha.insumo }}</td>
            <td class="num">{{ numeroBR(linha.estoqueAtual) }}</td>
            <td>{{ linha.unidade }}</td>
            <td class="num">{{ numeroBR(linha.estoqueMinimo) }}</td>
            <td class="num">{{ linha.semCusto ? '—' : `${moedaFracionada(linha.custoUnitario)}/${linha.unidade}` }}</td>
            <td class="num">{{ linha.dataUltimaCompra ? `${dataLonga(linha.dataUltimaCompra)} • ${moeda(linha.valorUltimaCompra)}` : '—' }}</td>
            <td><EtiquetaStatus :status="linha.abaixoDoMinimo ? 'CRITICO' : 'OK'" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import CabecalhoPagina from '@/components/layout/CabecalhoPagina.vue'
import EstadoPagina from '@/components/comum/EstadoPagina.vue'
import EtiquetaStatus from '@/components/comum/EtiquetaStatus.vue'
import relatorios from '@/services/relatorios'
import { dataLonga, moeda, numeroBR } from '@/utils/formatadores'

// RF01 (parte de estoque) e RF04: saldo, mínimo e custo médio de cada insumo.
const linhas = ref([])
const carregando = ref(true)
const erro = ref('')

const abaixoDoMinimo = computed(() => linhas.value.filter((l) => l.abaixoDoMinimo).length)

// Custos por grama ficam com mais casas decimais (ex.: R$ 0,0267/g).
const formatoFracionado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 4 })
const moedaFracionada = (valor) => formatoFracionado.format(Number(valor) || 0)

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    linhas.value = (await relatorios.estoque()).linhas
  } catch (falha) {
    erro.value = falha.message
  } finally {
    carregando.value = false
  }
}

function imprimir() {
  window.print()
}

onMounted(carregar)
</script>
