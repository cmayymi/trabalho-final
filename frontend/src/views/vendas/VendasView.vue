<template>
  <CabecalhoPagina titulo="Vendas" subtitulo="Consulte, registre e gerencie pedidos" />

  <section class="row g-3 align-items-end mb-4" aria-label="Filtros de vendas">
    <div class="col-12 col-xl">
      <label class="form-label" for="busca-venda">Buscar</label>
      <input id="busca-venda" v-model="filtros.busca" type="search" class="form-control" placeholder="Cliente, produto ou nº do pedido" />
    </div>
    <div class="col-6 col-md-4 col-xl-auto">
      <select v-model="filtros.status" class="form-select filtro-forte" aria-label="Status do pagamento">
        <option value="">Status</option>
        <option value="Pago">Pago</option>
        <option value="Pendente">Pendente</option>
      </select>
    </div>
    <div class="col-6 col-md-4 col-xl-auto">
      <select v-model="filtros.periodo" class="form-select filtro-forte" aria-label="Período do pedido">
        <option value="">Período</option>
        <option value="7">Últimos 7 dias</option>
        <option value="30">Últimos 30 dias</option>
        <option value="90">Últimos 90 dias</option>
      </select>
    </div>
    <div class="col-12 col-md-4 col-xl-auto">
      <router-link class="btn btn-ambar w-100 nova-venda" :to="{ name: 'venda-nova' }">+ Nova venda</router-link>
    </div>
  </section>

  <EstadoPagina v-if="carregando" tipo="carregando" titulo="Carregando as vendas…" />
  <EstadoPagina v-else-if="erro" tipo="erro" icone="bi-cloud-slash" titulo="Não foi possível carregar as vendas" :texto="erro">
    <button class="btn btn-branco" type="button" @click="carregar">Tentar novamente</button>
  </EstadoPagina>
  <EstadoPagina v-else-if="!filtradas.length" icone="bi-search" titulo="Nenhuma venda encontrada" texto="Altere os filtros ou registre uma nova venda." />

  <template v-else>
    <div class="table-responsive">
      <table class="table tabela-sbc">
        <thead>
          <tr>
            <th scope="col">Pedido</th><th scope="col">Cliente</th><th scope="col">Entrega</th>
            <th scope="col">Valor</th><th scope="col">Pagamento</th><th scope="col">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="venda in pagina" :key="venda.id">
            <td class="fw-semibold">#{{ venda.id }}</td>
            <td>{{ venda.cliente }}</td>
            <td class="num">{{ dataCurta(venda.dataEntrega) }}</td>
            <td class="num">{{ moedaCurta(venda.valorTotal) }}</td>
            <td><EtiquetaStatus :status="venda.statusPagamento" /></td>
            <td>
              <div class="d-flex align-items-center gap-2">
                <router-link class="acao" :to="{ name: 'venda-detalhe', params: { id: venda.id } }">Ver</router-link>
                <span aria-hidden="true">•</span>
                <router-link class="acao" :to="{ name: 'venda-editar', params: { id: venda.id } }">Editar</router-link>
                <span aria-hidden="true">•</span>
                <div class="dropdown">
                  <button class="acao" type="button" data-bs-toggle="dropdown" data-bs-popper-config='{"strategy":"fixed"}' aria-expanded="false" :aria-label="`Mais ações do pedido ${venda.id}`">
                    <i class="bi bi-three-dots" aria-hidden="true"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                      <button class="dropdown-item" type="button" @click="alternarPagamento(venda)">
                        Marcar como {{ venda.statusPagamento === 'Pago' ? 'pendente' : 'pago' }}
                      </button>
                    </li>
                    <li>
                      <a class="dropdown-item" :href="linkWhatsApp(venda)" target="_blank" rel="noopener">Abrir WhatsApp</a>
                    </li>
                  </ul>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <PaginacaoTabela v-model="numeroPagina" :total-paginas="totalPaginas" />
  </template>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import CabecalhoPagina from '@/components/layout/CabecalhoPagina.vue'
import EstadoPagina from '@/components/comum/EstadoPagina.vue'
import EtiquetaStatus from '@/components/comum/EtiquetaStatus.vue'
import PaginacaoTabela from '@/components/comum/PaginacaoTabela.vue'
import vendasApi from '@/services/vendas'
import { avisar } from '@/composables/avisos'
import { dataCurta, diasAtrasISO, moedaCurta, normalizar } from '@/utils/formatadores'

const POR_PAGINA = 10

const vendas = ref([])
const carregando = ref(true)
const erro = ref('')
const numeroPagina = ref(1)
const filtros = reactive({ busca: '', status: '', periodo: '' })

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    vendas.value = await vendasApi.listar()
  } catch (falha) {
    erro.value = falha.message
  } finally {
    carregando.value = false
  }
}

onMounted(carregar)
watch(filtros, () => { numeroPagina.value = 1 })

const filtradas = computed(() => {
  const busca = normalizar(filtros.busca).replace(/^#/, '')
  const limite = filtros.periodo ? diasAtrasISO(Number(filtros.periodo)) : ''
  return vendas.value.filter((v) =>
    (normalizar(v.cliente).includes(busca) || normalizar(v.produto).includes(busca) || String(v.id).includes(busca)) &&
    (!filtros.status || v.statusPagamento === filtros.status) &&
    (!limite || v.dataPedido >= limite)
  )
})

const totalPaginas = computed(() => Math.max(1, Math.ceil(filtradas.value.length / POR_PAGINA)))
const pagina = computed(() => filtradas.value.slice((numeroPagina.value - 1) * POR_PAGINA, numeroPagina.value * POR_PAGINA))

function linkWhatsApp(venda) {
  return `https://wa.me/55${venda.whatsapp.replace(/\D/g, '')}`
}

async function alternarPagamento(venda) {
  const novoStatus = venda.statusPagamento === 'Pago' ? 'Pendente' : 'Pago'
  try {
    await vendasApi.atualizar(venda.id, { ...venda, statusPagamento: novoStatus })
    venda.statusPagamento = novoStatus
    avisar.sucesso(`Pedido #${venda.id} marcado como ${novoStatus.toLowerCase()}.`)
  } catch (falha) {
    avisar.erro(falha.message)
  }
}
</script>

<style scoped>
.nova-venda {
  align-items: center;
  display: flex;
  justify-content: center;
  min-height: 54px;
  white-space: nowrap;
}

.tabela-sbc td {
  text-align: left;
}
</style>
