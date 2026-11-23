// Comunicação do RF02 (Registrar Venda) e do RF10 (editar/excluir pedido) com o backend (/api/pedidos).
// No backend, valores ficam em centavos, peso em gramas e o status em minúsculas.
// Cada item é enviado com o campo "id" do produto (tabela Produto do catálogo).
import { usarMock } from './config'
import { requisicao } from './http'
import { mockVendas } from './mock/api'

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
    produtoId: primeiro.produtoID ?? primeiro.id ?? null,
    produto: itens.map((i) => i.produto_nome).join(', '),
    quantidade: itens.reduce((soma, i) => soma + i.quantidade, 0),
    peso: itens.reduce((soma, i) => soma + (i.peso || 0), 0) / 1000,
    dataEntrega: pedido.data_entrega,
    descricao: pedido.descricao,
    valorTotal: paraReais(pedido.valor_total),
    custo: paraReais(itens.reduce((soma, i) => soma + i.custo_unitario * i.quantidade, 0)),
    statusPagamento: pedido.status_pagamento === 'pago' ? 'Pago' : 'Pendente'
  }
}

// Venda do formulário -> corpo esperado por POST e PUT /api/pedidos
function paraBackend(venda) {
  const porPeso = venda.peso > 0
  return {
    data_pedido: venda.dataPedido,
    cliente_nome: venda.cliente,
    cliente_contato: venda.whatsapp,
    descricao: venda.descricao,
    data_entrega: venda.dataEntrega,
    status_pagamento: venda.statusPagamento.toLowerCase(),
    itens: [{
      id: venda.produtoId,
      quantidade: venda.quantidade,
      peso: porPeso ? Math.round(venda.peso * 1000) : 0
    }]
  }
}

const real = {
  // O backend calcula o total pelo preço do catálogo e ainda não dá baixa no estoque (UC4).
  podeEditar: true,
  baixaEstoque: false,
  valorManual: false,
  listar: async () => (await requisicao('/pedidos')).map(deBackend),
  buscar: async (id) => deBackend(await requisicao(`/pedidos/${id}`)),
  criar: async (venda) => deBackend(await requisicao('/pedidos', { metodo: 'POST', corpo: paraBackend(venda) })),
  atualizar: async (id, venda) => deBackend(await requisicao(`/pedidos/${id}`, { metodo: 'PUT', corpo: paraBackend(venda) })),
  excluir: (id) => requisicao(`/pedidos/${id}`, { metodo: 'DELETE' })
}

const mock = { ...mockVendas, podeEditar: true, baixaEstoque: true, valorManual: true }

export { deBackend, paraBackend }
export default usarMock.vendas ? mock : real
