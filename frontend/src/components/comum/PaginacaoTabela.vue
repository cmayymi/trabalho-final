<template>
  <nav v-if="totalPaginas > 1" class="d-flex justify-content-between align-items-center mt-3 nao-imprimir" aria-label="Paginação">
    <span class="texto-suave small">Página {{ modelValue }} de {{ totalPaginas }}</span>
    <ul class="pagination mb-0">
      <li class="page-item" :class="{ disabled: modelValue === 1 }">
        <button type="button" class="page-link" :disabled="modelValue === 1" @click="$emit('update:modelValue', modelValue - 1)">Anterior</button>
      </li>
      <li class="page-item" :class="{ disabled: modelValue === totalPaginas }">
        <button type="button" class="page-link" :disabled="modelValue === totalPaginas" @click="$emit('update:modelValue', modelValue + 1)">Próxima</button>
      </li>
    </ul>
  </nav>
</template>

<script setup>
defineProps({
  modelValue: { type: Number, required: true },
  totalPaginas: { type: Number, required: true }
})
defineEmits(['update:modelValue'])
</script>
