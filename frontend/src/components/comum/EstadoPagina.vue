<template>
  <div class="estado text-center" :role="tipo === 'erro' ? 'alert' : 'status'">
    <div v-if="tipo === 'carregando'" class="spinner-border carregando" aria-hidden="true"></div>
    <i v-else class="bi icone" :class="icone" aria-hidden="true"></i>
    <h2 class="fs-5 mt-3 mb-1">{{ titulo }}</h2>
    <p v-if="texto" class="texto-suave mb-3">{{ texto }}</p>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  tipo: { type: String, default: 'vazio' },
  titulo: { type: String, required: true },
  texto: { type: String, default: '' },
  icone: { type: String, default: 'bi-inbox' }
})
</script>

<style scoped>
.estado {
  background: #fff;
  border: 1px dashed var(--sbc-borda);
  border-radius: 24px;
  padding: 3rem 1.5rem;
}

.icone {
  color: var(--sbc-ambar-forte);
  font-size: 2.4rem;
}

.carregando {
  color: var(--sbc-ambar);
}
</style>
