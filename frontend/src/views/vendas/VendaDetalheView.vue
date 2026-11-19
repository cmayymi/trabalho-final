<template>
  <EstadoPagina v-if="carregando" tipo="carregando" titulo="Carregando o pedido…" />
  <EstadoPagina v-else-if="erro" tipo="erro" icone="bi-cloud-slash" titulo="Não foi possível abrir o pedido" :texto="erro">
    <router-link class="btn btn-branco" :to="{ name: 'vendas' }">Voltar às vendas</router-link>
  </EstadoPagina>

  <template v-else>
    <CabecalhoPagina :titulo="`Pedido #${venda.id}`" subtitulo="Detalhes do pedido" />

    <section class="cartao p-4 p-md-5 detalhe">
      <h2 class="fs-2 mb-1">{{ venda.cliente }}</h2>
      <p class="texto-suave mb-4">WhatsApp: {{ venda.whatsapp }}</p>

      <dl class="row mb-4">
        <template v-for="campo in campos" :key="campo.rotulo">
          <dt class="col-sm-3 texto-suave">{{ campo.rotulo }}</dt>
          <dd class="col-sm-9">{{ campo.valor }}</dd>
        </template>
        <dt class="col-sm-3 texto-suave">Pagamento</dt>
        <dd class="col-sm-9"><EtiquetaStatus :status="venda.statusPagamento" /></dd>
      </dl>

      <div class="d-flex flex-wrap gap-3">
        <router-link v-if="vendasApi.podeEditar" class="btn btn-ambar" :to="{ name: 'venda-editar', params: { id: venda.id } }">Editar pedido</router-link>
        <router-link class="btn btn-branco" :to="{ name: 'vendas' }">Voltar</router-link>
      </div>
    </section>
  </template>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import CabecalhoPagina from '@/components/layout/CabecalhoPagina.vue'
import EstadoPagina from '@/components/comum/EstadoPagina.vue'
import EtiquetaStatus from '@/components/comum/EtiquetaStatus.vue'
import vendasApi from '@/services/vendas'
import { dataLonga, moeda, numeroBR } from '@/utils/formatadores'

const rota = useRoute()
const venda = ref(null)
const carregando = ref(true)
const erro = ref('')

onMounted(async () => {
  try {
    venda.value = await vendasApi.buscar(rota.params.id)
  } catch (falha) {
    erro.value = falha.message
  } finally {
    carregando.value = false
  }
})

const campos = computed(() => [
  { rotulo: 'Produto', valor: venda.value.produto },
  { rotulo: 'Quantidade', valor: venda.value.quantidade },
  { rotulo: 'Peso', valor: `${numeroBR(venda.value.peso)} kg` },
  { rotulo: 'Data do pedido', valor: dataLonga(venda.value.dataPedido) },
  { rotulo: 'Entrega', valor: dataLonga(venda.value.dataEntrega) },
  { rotulo: 'Descrição', valor: venda.value.descricao || '—' },
  { rotulo: 'Valor', valor: moeda(venda.value.valorTotal) }
])
</script>

<style scoped>
.detalhe {
  max-width: 820px;
}

dt {
  font-weight: 700;
}

dd {
  margin-bottom: 1rem;
}
</style>
