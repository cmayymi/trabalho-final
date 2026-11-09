<template>
  <article class="cartao produto h-100">
    <img v-if="produto.foto" :src="produto.foto" :alt="`Foto de ${produto.nome}`" class="foto" />
    <div v-else class="foto foto-vazia">
      <i class="bi bi-cake2" aria-hidden="true"></i>
      Foto do produto
    </div>

    <div class="px-2 pt-3">
      <h2 class="nome">{{ produto.nome }}</h2>
      <p class="texto-suave mb-3">{{ produto.categoria }} &nbsp;•&nbsp; {{ moedaCurta(produto.precoBase) }}</p>
      <EtiquetaStatus :status="produto.disponibilidade" />

      <div class="d-flex align-items-center gap-3 mt-3">
        <router-link class="acao" :to="{ name: 'produto-detalhe', params: { id: produto.id } }">Ver detalhes</router-link>
        <router-link class="acao" :to="{ name: 'produto-editar', params: { id: produto.id } }">Editar</router-link>
        <div class="dropdown">
          <button class="acao" type="button" data-bs-toggle="dropdown" aria-expanded="false" :aria-label="`Mais ações para ${produto.nome}`">
            <i class="bi bi-three-dots" aria-hidden="true"></i>
          </button>
          <ul class="dropdown-menu">
            <li>
              <router-link class="dropdown-item" :to="{ name: 'venda-nova', query: { produto: produto.id } }">Registrar venda</router-link>
            </li>
            <li><button class="dropdown-item text-danger" type="button" @click="$emit('excluir', produto)">Excluir</button></li>
          </ul>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import EtiquetaStatus from '@/components/comum/EtiquetaStatus.vue'
import { moedaCurta } from '@/utils/formatadores'

defineProps({ produto: { type: Object, required: true } })
defineEmits(['excluir'])
</script>

<style scoped>
.produto {
  padding: 1rem 1rem 1.4rem;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.produto:hover {
  box-shadow: 0 10px 26px rgba(31, 31, 28, 0.16);
  transform: translateY(-2px);
}

.foto {
  border-radius: 26px;
  height: 190px;
  object-fit: cover;
  width: 100%;
}

.nome {
  font-size: 1.3rem;
  margin-bottom: 0.35rem;
}
</style>
