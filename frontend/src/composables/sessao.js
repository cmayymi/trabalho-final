// Estado da sessão da usuária (UC06 - Autenticar-se no Sistema).
// O token fica no sessionStorage: ao fechar a aba, é preciso entrar novamente.
import { reactive } from 'vue'

const CHAVE = 'sbc.sessao'

export function decodificarToken(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return null
  }
}

function lerSalvo() {
  try {
    return JSON.parse(sessionStorage.getItem(CHAVE)) || {}
  } catch {
    return {}
  }
}

const salvo = lerSalvo()

export const sessao = reactive({
  token: salvo.token || null,
  nome: salvo.nome || null
})

let aoExpirar = () => {}

export function definirAoExpirar(funcao) {
  aoExpirar = funcao
}

export function iniciarSessao(token, nome) {
  const dados = decodificarToken(token)
  // A resposta atual do backend só traz o token; o SBC tem uma única usuária.
  sessao.token = token
  sessao.nome = nome || dados?.nome || 'Betina'
  try {
    sessionStorage.setItem(CHAVE, JSON.stringify({ token: sessao.token, nome: sessao.nome }))
  } catch {
    // Sem armazenamento a sessão continua válida enquanto a página estiver aberta.
  }
}

export function encerrarSessao() {
  sessao.token = null
  sessao.nome = null
  try {
    sessionStorage.removeItem(CHAVE)
  } catch {
    // Nada a limpar.
  }
}

export function estaAutenticada() {
  if (!sessao.token) return false
  const dados = decodificarToken(sessao.token)
  if (!dados) return false
  return !dados.exp || dados.exp * 1000 > Date.now()
}

export function sessaoExpirada() {
  encerrarSessao()
  aoExpirar()
}
