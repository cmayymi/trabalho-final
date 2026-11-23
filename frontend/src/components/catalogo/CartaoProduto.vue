<template>
  <article class="cartao produto h-100">
    <img v-if="produto.foto" :src="produto.foto" :alt="`Foto de ${produto.nome}`" class="foto" />
    <div v-else class="foto foto-vazia">
      <i class="bi bi-cake2" aria-hidden="true"></i>
      Foto do produto
    </div>

    <div class="px-2 pt-3">
      <h2 class="nome">{{ produto.nome }}</h2>
      <p class="texto-suave mb-3">
        <template v-if="produto.categoria">{{ produto.categoria }} &nbsp;•&nbsp; </template>{{ precoComUnidade(produto) }}
      </p>
      <EtiquetaStatus :status="produto.disponibilidade" />

      <div class="d-flex align-items-center gap-3 mt-3">
        <button class="acao" type="button" @click="$emit('selecionar', produto.id)">Ver detalhes</button>
        <router-link class="acao" :to="gerenciavel ? { name: 'produto-editar', params: { id: produto.id } } : emDesenvolvimento('Edição de produtos')">Editar</router-link>
        <div class="dropdown">
          <button class="acao" type="button" data-bs-toggle="dropdown" aria-expanded="false" :aria-label="`Mais ações para ${produto.nome}`">
            <i class="bi bi-three-dots" aria-hidden="true"></i>
          </button>
          <ul class="dropdown-menu">
            <li>
              <router-link class="dropdown-item" :to="{ name: 'venda-nova', query: { produto: produto.id } }">Registrar venda</router-link>
            </li>
            <li v-if="gerenciavel"><button class="dropdown-item text-danger" type="button" @click="$emit('excluir', produto)">Excluir</button></li>
            <li v-else><router-link class="dropdown-item" :to="emDesenvolvimento('Exclusão de produtos')">Excluir</router-link></li>
          </ul>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import EtiquetaStatus from '@/components/comum/EtiquetaStatus.vue'
import { emDesenvolvimento, precoComUnidade } from '@/utils/formatadores'

defineProps({
  produto: { type: Object, required: true },
  gerenciavel: { type: Boolean, default: true }
})
defineEmits(['selecionar', 'excluir'])
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
