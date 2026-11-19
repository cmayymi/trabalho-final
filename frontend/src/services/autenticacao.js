import { iniciarSessao, encerrarSessao } from '@/composables/sessao'
import { usarMock } from './config'
import { requisicao } from './http'
import { mockAutenticacao } from './mock/api'

const real = {
  login: (login, senha) =>
    requisicao('/login', { metodo: 'POST', corpo: { login, senha }, autenticada: false })
}

const api = usarMock.autenticacao ? mockAutenticacao : real

export const emModoDemonstracao = usarMock.autenticacao

export async function entrar(login, senha) {
  const { token, nome } = await api.login(login.trim(), senha)
  iniciarSessao(token, nome)
}

export function sair() {
  encerrarSessao()
}
