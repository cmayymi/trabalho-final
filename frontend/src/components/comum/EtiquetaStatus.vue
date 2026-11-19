<template>
  <span class="etiqueta" :class="dados.cor">
    <i class="bi" :class="dados.icone" aria-hidden="true"></i>{{ dados.texto }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ status: { type: String, required: true } })

const mapa = {
  DISPONIVEL: { texto: 'Disponível', cor: 'verde', icone: 'bi-check-lg' },
  OK: { texto: 'OK', cor: 'verde', icone: 'bi-check-lg' },
  Pago: { texto: 'Pago', cor: 'verde', icone: 'bi-check-lg' },
  CRITICO: { texto: 'Estoque crítico', cor: 'ambar', icone: 'bi-exclamation-triangle' },
  Pendente: { texto: 'Pendente', cor: 'ambar', icone: 'bi-clock' },
  EM_FALTA: { texto: 'Em falta', cor: 'vermelho', icone: 'bi-x-lg' },
  FALTA: { texto: 'Em falta', cor: 'vermelho', icone: 'bi-x-lg' }
}

const dados = computed(() => mapa[props.status] || { texto: props.status, cor: 'ambar', icone: 'bi-dot' })
</script>
