<template>
  <input type="text" inputmode="numeric" class="form-control" :value="moeda(modelValue)" @input="aoDigitar" />
</template>

<script setup>
import { moeda } from '@/utils/formatadores'

defineProps({ modelValue: { type: Number, default: 0 } })
const emit = defineEmits(['update:modelValue'])

// Os dígitos entram pela direita, como em caixa de banco: 1 → 12 → R$ 1,20.
function aoDigitar(evento) {
  const digitos = evento.target.value.replace(/\D/g, '').slice(0, 10)
  const valor = Number(digitos || 0) / 100
  evento.target.value = moeda(valor)
  emit('update:modelValue', valor)
}
</script>
