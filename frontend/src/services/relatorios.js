import { usarMock } from './config'
import { requisicao } from './http'
import { mockRelatorios } from './mock/api'

const real = {
  vendas: (inicio, fim) =>
    requisicao(`/relatorios/vendas?inicio=${encodeURIComponent(inicio)}&fim=${encodeURIComponent(fim)}`)
}

export default usarMock.relatorios ? mockRelatorios : real
