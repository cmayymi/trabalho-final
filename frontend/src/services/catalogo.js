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

// Ingrediente do backend (/api/ingredientes) -> formato usado pelo formulário de produto
function ingredienteDeBackend(ingrediente) {
  const saldo = Number(ingrediente.quantidadeEstoque) || 0
  const minimo = Number(ingrediente.estoqueMinimo) || 0
  return {
    id: ingrediente.id,
    nome: ingrediente.nome,
    unidade: ingrediente.unidadeMedida,
    saldo,
    status: saldo > minimo ? 'OK' : 'CRITICO'
  }
}

// Dados do formulário -> corpo esperado por POST/PUT /api/produtos.
// As quantidades da ficha já estão na unidade do ingrediente (para 1 unidade ou 1 kg do produto).
function produtoParaBackend(dados) {
  return {
    nome: dados.nome,
    descricao: dados.descricao,
    preco: Math.round(dados.precoBase * 100),
    tipoVenda: dados.tipoVenda,
    ingredientes: dados.fichaTecnica.map((item) => ({ ingredienteId: item.insumoId, quantidade: item.quantidade }))
  }
}

async function listarProdutos() {
  return (await requisicao('/produtos')).map((p) => produtoDeBackend(p))
}

const real = {
  // Gerenciar Produto (extensão do UC9): cadastro, edição e exclusão pelas rotas de /api/produtos.
  gerenciavel: true,
  // Os campos extras do protótipo (categoria, massa, cobertura, peso padrão e foto) e os filtros
  // por categoria não existem no banco.
  filtrosAvancados: false,
  camposExtras: false,
  // O backend recusa a exclusão de produtos que já foram vendidos.
  bloqueiaExclusaoComVendas: true,
  listarProdutos,
  buscarProduto: async (id) => {
    const resposta = await requisicao(`/produtos/${id}`)
    return produtoDeBackend(resposta.produto, resposta.ingredientesDisp)
  },
  listarInsumos: async () => (await requisicao('/ingredientes')).map(ingredienteDeBackend),
  criarProduto: async (dados) => {
    await requisicao('/produtos', { metodo: 'POST', corpo: produtoParaBackend(dados) })
    // O POST não devolve o id; o produto novo é o de maior id com esse nome.
    const candidatos = (await listarProdutos()).filter((p) => p.nome === dados.nome)
    return candidatos.reduce((maior, p) => (p.id > maior.id ? p : maior), candidatos[0] || { id: null })
  },
  atualizarProduto: async (id, dados) => {
    await requisicao(`/produtos/${id}`, { metodo: 'PUT', corpo: produtoParaBackend(dados) })
    return { id: Number(id) }
  },
  excluirProduto: (id) => requisicao(`/produtos/${id}`, { metodo: 'DELETE' })
}

const mock = { ...mockCatalogo, gerenciavel: true, filtrosAvancados: true, camposExtras: true, bloqueiaExclusaoComVendas: false }

export default usarMock.catalogo ? mock : real
