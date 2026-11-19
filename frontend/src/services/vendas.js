// Boundary do RF02: traduz o formato das telas para o formato do backend (/api/pedidos).
// No backend, valores ficam em centavos, peso em gramas e o status em minúsculas.
import { usarMock } from './config'
import { ErroApi, requisicao } from './http'
import { mockVendas } from './mock/api'

const paraCentavos = (reais) => Math.round(Number(reais) * 100)
const paraReais = (centavos) => (Number(centavos) || 0) / 100

// Pedido do backend -> venda usada pelas telas
function deBackend(pedido) {
  const itens = pedido.itens || []
  const primeiro = itens[0] || {}
  return {
    id: pedido.pedidosID,
    cliente: pedido.cliente_nome,
    whatsapp: pedido.cliente_contato,
    dataPedido: pedido.data_pedido,
    produtoId: primeiro.produtoID ?? null,
    produto: itens.map((i) => i.produto_nome).join(', '),
    quantidade: itens.reduce((soma, i) => soma + i.quantidade, 0),
    peso: itens.reduce((soma, i) => soma + i.peso, 0) / 1000,
    dataEntrega: pedido.data_entrega,
    descricao: pedido.descricao,
    valorTotal: paraReais(pedido.valor_total),
    custo: paraReais(itens.reduce((soma, i) => soma + i.custo_unitario * i.quantidade, 0)),
    statusPagamento: pedido.status_pagamento === 'pago' ? 'Pago' : 'Pendente'
  }
}

// Venda do formulário -> corpo esperado por POST /api/pedidos
function paraBackend(venda) {
  return {
    data_pedido: venda.dataPedido,
    cliente_nome: venda.cliente,
    cliente_contato: venda.whatsapp,
    descricao: venda.descricao,
    data_entrega: venda.dataEntrega,
    status_pagamento: venda.statusPagamento.toLowerCase(),
    itens: [{
      produtoID: venda.produtoId,
      quantidade: venda.quantidade,
      peso: Math.round(venda.peso * 1000)
    }]
  }
}

const real = {
  // O backend ainda não tem edição (RF10) nem baixa de estoque, e calcula o total pelo preço do catálogo.
  podeEditar: false,
  baixaEstoque: false,
  valorManual: false,
  listar: async () => (await requisicao('/pedidos')).map(deBackend),
  buscar: async (id) => deBackend(await requisicao(`/pedidos/${id}`)),
  criar: async (venda) => deBackend(await requisicao('/pedidos', { metodo: 'POST', corpo: paraBackend(venda) })),
  atualizar: async () => {
    throw new ErroApi('A edição de pedidos ainda não está disponível.', 501)
  }
}

const mock = { ...mockVendas, podeEditar: true, baixaEstoque: true, valorManual: true }

export { deBackend, paraBackend, paraCentavos }
export default usarMock.vendas ? mock : real
