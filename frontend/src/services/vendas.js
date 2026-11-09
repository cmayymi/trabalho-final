import { usarMock } from './config'
import { requisicao } from './http'
import { mockVendas } from './mock/api'

const real = {
  listar: () => requisicao('/vendas'),
  buscar: (id) => requisicao(`/vendas/${id}`),
  criar: (dados) => requisicao('/vendas', { metodo: 'POST', corpo: dados }),
  atualizar: (id, dados) => requisicao(`/vendas/${id}`, { metodo: 'PUT', corpo: dados })
}

export default usarMock.vendas ? mockVendas : real
