// Único ponto do frontend que conversa com o backend.
import { sessao, sessaoExpirada } from '@/composables/sessao'

export class ErroApi extends Error {
  constructor(mensagem, status = 0) {
    super(mensagem)
    this.name = 'ErroApi'
    this.status = status
  }
}

const SERVIDOR_INDISPONIVEL = 'O servidor está indisponível no momento. Tente novamente em instantes.'

export async function requisicao(caminho, { metodo = 'GET', corpo, autenticada = true } = {}) {
  const cabecalhos = {}
  if (corpo !== undefined) cabecalhos['Content-Type'] = 'application/json'
  if (autenticada && sessao.token) cabecalhos.Authorization = `Bearer ${sessao.token}`

  let resposta
  try {
    resposta = await fetch(`/api${caminho}`, {
      method: metodo,
      headers: cabecalhos,
      body: corpo === undefined ? undefined : JSON.stringify(corpo)
    })
  } catch {
    throw new ErroApi(SERVIDOR_INDISPONIVEL)
  }

  const dados = await resposta.json().catch(() => null)
  if (resposta.ok) return dados

  if (resposta.status === 401 && autenticada) {
    sessaoExpirada()
    throw new ErroApi('Sua sessão expirou. Entre novamente.', 401)
  }

  if (resposta.status >= 500 || !dados) {
    throw new ErroApi(SERVIDOR_INDISPONIVEL, resposta.status)
  }

  throw new ErroApi(dados.erro || 'Não foi possível concluir a operação.', resposta.status)
}
