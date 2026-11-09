<template>
  <CabecalhoPagina titulo="Catálogo" subtitulo="Produtos disponíveis para venda" />

  <section class="row g-3 align-items-end mb-4" aria-label="Filtros do catálogo">
    <div class="col-12 col-xl">
      <label class="form-label" for="busca-produto">Buscar</label>
      <input id="busca-produto" v-model="filtros.busca" type="search" class="form-control" placeholder="Buscar por nome" />
    </div>
    <div v-for="filtro in listaFiltros" :key="filtro.chave" class="col-6 col-md-4 col-xl-auto filtro">
      <select v-model="filtros[filtro.chave]" class="form-select filtro-forte" :aria-label="filtro.rotulo">
        <option value="">{{ filtro.rotulo }}</option>
        <option v-for="opcao in filtro.opcoes" :key="opcao" :value="opcao">{{ opcao }}</option>
      </select>
    </div>
    <div class="col-6 col-md-6 col-xl-auto">
      <router-link class="btn btn-ambar w-100 botao-filtro" :to="{ name: 'em-breve', query: { funcionalidade: 'Gerenciamento de preços' } }">Gerenciar preços</router-link>
    </div>
    <div class="col-12 col-md-6 col-xl-auto">
      <router-link class="btn btn-ambar w-100 botao-filtro" :to="{ name: 'produto-novo' }">+ Novo produto</router-link>
    </div>
  </section>

  <EstadoPagina v-if="carregando" tipo="carregando" titulo="Carregando o catálogo…" />
  <EstadoPagina v-else-if="erro" tipo="erro" icone="bi-cloud-slash" titulo="Não foi possível carregar o catálogo" :texto="erro">
    <button class="btn btn-branco" type="button" @click="carregar">Tentar novamente</button>
  </EstadoPagina>
  <EstadoPagina v-else-if="!produtos.length" titulo="Nenhum produto cadastrado" texto="Cadastre o primeiro produto para começar a vender.">
    <router-link class="btn btn-ambar" :to="{ name: 'produto-novo' }">+ Novo produto</router-link>
  </EstadoPagina>
  <EstadoPagina v-else-if="!filtrados.length" icone="bi-search" titulo="Nenhum produto encontrado" texto="Altere ou remova os filtros para ver outros produtos.">
    <button class="btn btn-branco" type="button" @click="limparFiltros">Limpar filtros</button>
  </EstadoPagina>

  <section v-else class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4" aria-label="Produtos">
    <div v-for="produto in filtrados" :key="produto.id" class="col">
      <CartaoProduto :produto="produto" @excluir="pedirExclusao" />
    </div>
  </section>

  <ModalConfirmacao ref="modal" titulo="Excluir produto?" texto-confirmar="Excluir" perigo :ocupado="excluindo" @confirmar="confirmarExclusao">
    <p class="mb-1"><strong>{{ selecionado?.nome }}</strong> sairá do catálogo.</p>
    <p class="texto-suave mb-0">A exclusão do catálogo não apaga vendas históricas associadas.</p>
  </ModalConfirmacao>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import CabecalhoPagina from '@/components/layout/CabecalhoPagina.vue'
import EstadoPagina from '@/components/comum/EstadoPagina.vue'
import ModalConfirmacao from '@/components/comum/ModalConfirmacao.vue'
import CartaoProduto from '@/components/catalogo/CartaoProduto.vue'
import catalogo from '@/services/catalogo'
import { avisar } from '@/composables/avisos'
import { normalizar } from '@/utils/formatadores'

const produtos = ref([])
const carregando = ref(true)
const erro = ref('')
const filtros = reactive({ busca: '', categoria: '', massa: '', cobertura: '' })

const modal = ref(null)
const selecionado = ref(null)
const excluindo = ref(false)

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    produtos.value = await catalogo.listarProdutos()
  } catch (falha) {
    erro.value = falha.message
  } finally {
    carregando.value = false
  }
}

onMounted(carregar)

const opcoesDe = (campo) =>
  [...new Set(produtos.value.map((p) => p[campo]).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'))

const listaFiltros = computed(() => [
  { chave: 'categoria', rotulo: 'Categoria', opcoes: opcoesDe('categoria') },
  { chave: 'massa', rotulo: 'Massa', opcoes: opcoesDe('massa') },
  { chave: 'cobertura', rotulo: 'Cobertura', opcoes: opcoesDe('cobertura') }
])

const filtrados = computed(() => {
  const busca = normalizar(filtros.busca)
  return produtos.value.filter((p) =>
    normalizar(p.nome).includes(busca) &&
    (!filtros.categoria || p.categoria === filtros.categoria) &&
    (!filtros.massa || p.massa === filtros.massa) &&
    (!filtros.cobertura || p.cobertura === filtros.cobertura)
  )
})

function limparFiltros() {
  Object.assign(filtros, { busca: '', categoria: '', massa: '', cobertura: '' })
}

function pedirExclusao(produto) {
  selecionado.value = produto
  modal.value.abrir()
}

async function confirmarExclusao() {
  excluindo.value = true
  try {
    await catalogo.excluirProduto(selecionado.value.id)
    await modal.value.fechar()
    avisar.sucesso(`${selecionado.value.nome} foi removido do catálogo.`)
    await carregar()
  } catch (falha) {
    await modal.value.fechar()
    avisar.erro(falha.message)
  } finally {
    excluindo.value = false
  }
}
</script>

<style scoped>
.botao-filtro {
  align-items: center;
  display: flex;
  justify-content: center;
  min-height: 54px;
  padding-left: 1rem;
  padding-right: 1rem;
  white-space: nowrap;
}

@media (min-width: 1200px) {
  .filtro {
    width: 148px;
  }
}
</style>
