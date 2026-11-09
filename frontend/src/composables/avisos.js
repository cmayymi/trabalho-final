// Mensagens rápidas (toasts) exibidas no canto da tela.
import { reactive } from 'vue'

export const avisos = reactive([])
let proximoId = 1

function adicionar(tipo, texto, duracao = 5000) {
  const id = proximoId++
  avisos.push({ id, tipo, texto })
  setTimeout(() => removerAviso(id), duracao)
}

export function removerAviso(id) {
  const indice = avisos.findIndex((a) => a.id === id)
  if (indice >= 0) avisos.splice(indice, 1)
}

export const avisar = {
  sucesso: (texto) => adicionar('sucesso', texto),
  erro: (texto) => adicionar('erro', texto, 8000),
  alerta: (texto) => adicionar('alerta', texto, 8000),
  info: (texto) => adicionar('info', texto)
}
