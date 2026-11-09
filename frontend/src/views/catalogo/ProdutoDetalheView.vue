<template>
  <EstadoPagina v-if="carregando" tipo="carregando" titulo="Carregando o produto…" />
  <EstadoPagina v-else-if="erro" tipo="erro" icone="bi-cloud-slash" titulo="Não foi possível abrir o produto" :texto="erro">
    <router-link class="btn btn-branco" :to="{ name: 'catalogo' }">Voltar ao catálogo</router-link>
  </EstadoPagina>

  <template v-else>
    <CabecalhoPagina :titulo="produto.nome" subtitulo="Detalhes e manutenção do produto" />

    <section class="row g-4 mb-4">
      <div class="col-12 col-md-5">
        <img v-if="produto.foto" :src="produto.foto" :alt="`Foto de ${produto.nome}`" class="foto" />
        <div v-else class="foto foto-vazia">
          <i class="bi bi-cake2" aria-hidden="true"></i>
          Foto do produto
        </div>
      </div>

      <div class="col-12 col-md-7">
        <div class="d-flex flex-wrap justify-content-between gap-3">
          <div>
            <h2 class="nome">{{ produto.nome }}</h2>
            <p class="texto-suave mb-2">{{ produto.categoria }} • {{ numeroBR(produto.peso) }} kg</p>
            <EtiquetaStatus :status="produto.disponibilidade" />
          </div>
          <div class="d-flex gap-3 align-items-start">
            <router-link class="btn btn-ambar" :to="{ name: 'produto-editar', params: { id: produto.id } }">Editar produto</router-link>
            <button class="btn btn-branco" type="button" @click="modal.abrir()">Excluir</button>
          </div>
        </div>

        <p class="texto-suave mt-4 mb-0">Preço base</p>
        <p class="preco">{{ moeda(produto.precoBase) }}</p>
        <p class="mb-1">{{ produto.descricao }}</p>
        <p class="texto-suave small mb-0">Massa: {{ produto.massa || '—' }} &nbsp;•&nbsp; Cobertura: {{ produto.cobertura || '—' }}</p>
      </div>
    </section>

    <h2 class="titulo-secao">Ficha técnica</h2>
    <div class="row g-4">
      <div class="col-12 col-xl-9">
        <div class="table-responsive">
          <table class="table tabela-sbc">
            <thead>
              <tr><th scope="col">Ingrediente</th><th scope="col">Quantidade</th><th scope="col">Unidade</th><th scope="col">Estoque</th></tr>
            </thead>
            <tbody>
              <tr v-for="item in produto.fichaTecnica" :key="item.insumoId">
                <td>{{ item.ingrediente }}</td>
                <td class="num">{{ numeroBR(item.quantidade) }}</td>
                <td>{{ item.unidade }}</td>
                <td><EtiquetaStatus :status="item.status" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <p class="col-12 col-xl-3 texto-suave small">A exclusão do catálogo não apaga vendas históricas associadas.</p>
    </div>

    <ModalConfirmacao ref="modal" titulo="Excluir produto?" texto-confirmar="Excluir" perigo :ocupado="excluindo" @confirmar="excluir">
      <p class="mb-1"><strong>{{ produto.nome }}</strong> sairá do catálogo.</p>
      <p class="texto-suave mb-0">A exclusão do catálogo não apaga vendas históricas associadas.</p>
    </ModalConfirmacao>
  </template>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CabecalhoPagina from '@/components/layout/CabecalhoPagina.vue'
import EstadoPagina from '@/components/comum/EstadoPagina.vue'
import EtiquetaStatus from '@/components/comum/EtiquetaStatus.vue'
import ModalConfirmacao from '@/components/comum/ModalConfirmacao.vue'
import catalogo from '@/services/catalogo'
import { avisar } from '@/composables/avisos'
import { moeda, numeroBR } from '@/utils/formatadores'

const rota = useRoute()
const router = useRouter()
const produto = ref(null)
const carregando = ref(true)
const erro = ref('')
const modal = ref(null)
const excluindo = ref(false)

onMounted(async () => {
  try {
    produto.value = await catalogo.buscarProduto(rota.params.id)
  } catch (falha) {
    erro.value = falha.message
  } finally {
    carregando.value = false
  }
})

async function excluir() {
  excluindo.value = true
  try {
    await catalogo.excluirProduto(produto.value.id)
    await modal.value.fechar()
    avisar.sucesso(`${produto.value.nome} foi removido do catálogo.`)
    router.push({ name: 'catalogo' })
  } catch (falha) {
    await modal.value.fechar()
    avisar.erro(falha.message)
  } finally {
    excluindo.value = false
  }
}
</script>

<style scoped>
.foto {
  border-radius: 36px;
  box-shadow: var(--sbc-sombra-cartao);
  height: 260px;
  object-fit: cover;
  width: 100%;
}

.nome {
  font-size: 2rem;
  margin-bottom: 0.25rem;
}

.preco {
  font-size: 1.9rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
</style>
