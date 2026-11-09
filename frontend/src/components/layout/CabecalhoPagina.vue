<template>
  <header class="mb-4">
    <h1 class="titulo">{{ titulo }}</h1>
    <p v-if="subtitulo" class="texto-suave mb-0">{{ subtitulo }}</p>
  </header>
</template>

<script setup>
defineProps({
  titulo: { type: String, required: true },
  subtitulo: { type: String, default: '' }
})
</script>

<style scoped>
.titulo {
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  margin-bottom: 0.2rem;
  padding-right: 7rem;
}
</style>
