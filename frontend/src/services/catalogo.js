// Comunicação do UC9 (Consultar Catálogo, RF03) com o backend (/api/produtos).
// O backend guarda o preço em centavos; para produtos vendidos por peso, o preço
// e a ficha técnica valem para 1 kg.
import { usarMock } from './config'
import { requisicao } from './http'
import { mockCatalogo } from './mock/api'

// Item da ficha técnica do backend -> formato das telas
function itemDeBackend({ quantidade, ingrediente }) {
  return {
    insumoId: ingrediente.id,
    ingrediente: ingrediente.nome,
    quantidade,
    unidade: ingrediente.unidadeMedida,
    saldoDisponivel: ingrediente.quantidadeEstoque,
    status: ingrediente.quantidadeEstoque >= quantidade ? 'OK' : 'FALTA'
  }
}

// Produto do backend -> produto usado pelas telas
function produtoDeBackend(produto, ingredientesDisp) {
  const fichaTecnica = (produto.ficha?.itens || []).map(itemDeBackend)
  const disponivel = ingredientesDisp ?? fichaTecnica.every((i) => i.status === 'OK')
  return {
    id: produto.id,
    nome: produto.nome,
    descricao: produto.descricao || '',
    precoBase: (Number(produto.preco) || 0) / 100,
    tipoVenda: produto.tipoVenda ?? produto.tipo_venda ?? null,
    categoria: '',
    massa: '',
    cobertura: '',
    peso: null,
    foto: null,
    fichaTecnica,
    ingredientesDisp: disponivel,
    disponibilidade: disponivel ? 'DISPONIVEL' : 'EM_FALTA'
  }
}

const real = {
  // Cadastrar, editar e excluir produto (RF11) e os filtros por categoria ainda não existem no backend.
  gerenciavel: false,
  filtrosAvancados: false,
  listarProdutos: async () => (await requisicao('/produtos')).map((p) => produtoDeBackend(p)),
  buscarProduto: async (id) => {
    const resposta = await requisicao(`/produtos/${id}`)
    return produtoDeBackend(resposta.produto, resposta.ingredientesDisp)
  }
}

const mock = { ...mockCatalogo, gerenciavel: true, filtrosAvancados: true }

export default usarMock.catalogo ? mock : real
