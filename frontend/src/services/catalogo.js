import { usarMock } from './config'
import { requisicao } from './http'
import { mockCatalogo } from './mock/api'

const real = {
  listarProdutos: () => requisicao('/produtos'),
  buscarProduto: (id) => requisicao(`/produtos/${id}`),
  criarProduto: (dados) => requisicao('/produtos', { metodo: 'POST', corpo: dados }),
  atualizarProduto: (id, dados) => requisicao(`/produtos/${id}`, { metodo: 'PUT', corpo: dados }),
  excluirProduto: (id) => requisicao(`/produtos/${id}`, { metodo: 'DELETE' }),
  listarInsumos: () => requisicao('/insumos')
}

export default usarMock.catalogo ? mockCatalogo : real
