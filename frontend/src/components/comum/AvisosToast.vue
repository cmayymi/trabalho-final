<template>
  <div class="avisos nao-imprimir" aria-live="polite" aria-atomic="false">
    <div v-for="aviso in avisos" :key="aviso.id" class="aviso" :class="aviso.tipo" role="status">
      <i class="bi" :class="icones[aviso.tipo]" aria-hidden="true"></i>
      <span class="flex-grow-1">{{ aviso.texto }}</span>
      <button type="button" class="btn-close" aria-label="Fechar aviso" @click="removerAviso(aviso.id)"></button>
    </div>
  </div>
</template>

<script setup>
import { avisos, removerAviso } from '@/composables/avisos'

const icones = {
  sucesso: 'bi-check-circle-fill',
  erro: 'bi-x-circle-fill',
  alerta: 'bi-exclamation-triangle-fill',
  info: 'bi-info-circle-fill'
}
</script>

<style scoped>
.avisos {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  max-width: min(420px, calc(100vw - 32px));
  position: fixed;
  right: 16px;
  top: 16px;
  width: 100%;
  z-index: 1090;
}

.aviso {
  align-items: center;
  background: #fff;
  border-left: 5px solid;
  border-radius: 14px;
  box-shadow: var(--sbc-sombra-cartao);
  display: flex;
  font-weight: 500;
  gap: 0.7rem;
  padding: 0.85rem 1rem;
}

.aviso.sucesso { border-color: var(--sbc-verde); }
.aviso.sucesso .bi { color: var(--sbc-verde); }
.aviso.erro { border-color: var(--sbc-vermelho); }
.aviso.erro .bi { color: var(--sbc-vermelho); }
.aviso.alerta { border-color: var(--sbc-ambar); }
.aviso.alerta .bi { color: var(--sbc-ambar-forte); }
.aviso.info { border-color: var(--sbc-escuro); }
</style>
