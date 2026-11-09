<template>
  <div ref="elemento" class="modal fade" tabindex="-1" :aria-labelledby="idTitulo" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content p-2">
        <div class="modal-header border-0">
          <h2 :id="idTitulo" class="modal-title fs-4">{{ titulo }}</h2>
          <button type="button" class="btn-close" aria-label="Fechar" :disabled="ocupado" @click="fechar"></button>
        </div>
        <div class="modal-body"><slot /></div>
        <div class="modal-footer border-0">
          <button type="button" class="btn btn-branco" :disabled="ocupado" @click="fechar">{{ textoCancelar }}</button>
          <button type="button" class="btn" :class="perigo ? 'btn-perigo' : 'btn-ambar'" :disabled="ocupado" @click="$emit('confirmar')">
            <span v-if="ocupado" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
            {{ textoConfirmar }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Modal } from 'bootstrap'

defineProps({
  titulo: { type: String, required: true },
  textoConfirmar: { type: String, default: 'Confirmar' },
  textoCancelar: { type: String, default: 'Cancelar' },
  perigo: Boolean,
  ocupado: Boolean
})
defineEmits(['confirmar'])

const idTitulo = `modal-${Math.random().toString(36).slice(2, 9)}`
const elemento = ref(null)
let instancia = null

onMounted(() => {
  instancia = new Modal(elemento.value)
})

onBeforeUnmount(() => {
  instancia?.dispose()
  document.querySelectorAll('.modal-backdrop').forEach((fundo) => fundo.remove())
  document.body.classList.remove('modal-open')
  document.body.removeAttribute('style')
})

function abrir() {
  instancia.show()
}

// Devolve uma promessa para aguardar o fim da animação antes de trocar de página.
function fechar() {
  return new Promise((resolve) => {
    if (!elemento.value.classList.contains('show')) return resolve()
    elemento.value.addEventListener('hidden.bs.modal', resolve, { once: true })
    instancia.hide()
  })
}

defineExpose({ abrir, fechar })
</script>
