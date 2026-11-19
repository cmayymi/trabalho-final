// Dados fictícios usados enquanto as rotas do backend não existem.
import { diasAtrasISO } from '@/utils/formatadores'

const insumos = [
  { id: 1, nome: 'Farinha', saldo: 12, unidade: 'kg', minimo: 5, custoMedio: 4.2 },
  { id: 2, nome: 'Chocolate', saldo: 8, unidade: 'kg', minimo: 3, custoMedio: 27.5 },
  { id: 3, nome: 'Ovos', saldo: 36, unidade: 'un', minimo: 24, custoMedio: 0.78 },
  { id: 4, nome: 'Manteiga', saldo: 6, unidade: 'kg', minimo: 2, custoMedio: 40 },
  { id: 5, nome: 'Açúcar', saldo: 15, unidade: 'kg', minimo: 5, custoMedio: 5 },
  { id: 6, nome: 'Leite condensado', saldo: 20, unidade: 'un', minimo: 6, custoMedio: 7.5 },
  { id: 7, nome: 'Creme de leite', saldo: 18, unidade: 'un', minimo: 6, custoMedio: 3.35 },
  { id: 8, nome: 'Frutas da estação', saldo: 7, unidade: 'kg', minimo: 2, custoMedio: 22 },
  { id: 9, nome: 'Morango', saldo: 1.2, unidade: 'kg', minimo: 1.5, custoMedio: 30 },
  { id: 10, nome: 'Embalagem', saldo: 40, unidade: 'un', minimo: 10, custoMedio: 3.53 }
]

const item = (insumoId, ingrediente, quantidade, unidade) => ({ insumoId, ingrediente, quantidade, unidade })

const produtos = [
  {
    id: 1, nome: 'Bolo de chocolate', categoria: 'Bolos', massa: 'Chocolate', cobertura: 'Brigadeiro',
    descricao: 'Bolo artesanal de chocolate com cobertura de brigadeiro.', peso: 1.5, precoBase: 120, foto: null,
    fichaTecnica: [
      item(1, 'Farinha', 500, 'g'), item(2, 'Chocolate', 300, 'g'), item(3, 'Ovos', 4, 'un'),
      item(4, 'Manteiga', 300, 'g'), item(5, 'Açúcar', 400, 'g'), item(6, 'Leite condensado', 2, 'un'),
      item(10, 'Embalagem', 1, 'un')
    ]
  },
  {
    id: 2, nome: 'Bolo de frutas', categoria: 'Bolos', massa: 'Baunilha', cobertura: 'Chantilly',
    descricao: 'Massa leve de baunilha com recheio de frutas da estação.', peso: 1.5, precoBase: 95, foto: null,
    fichaTecnica: [
      item(1, 'Farinha', 400, 'g'), item(3, 'Ovos', 3, 'un'), item(4, 'Manteiga', 200, 'g'),
      item(5, 'Açúcar', 300, 'g'), item(8, 'Frutas da estação', 800, 'g'), item(7, 'Creme de leite', 1, 'un'),
      item(10, 'Embalagem', 1, 'un')
    ]
  },
  {
    id: 3, nome: 'Torta de morango', categoria: 'Tortas', massa: 'Amanteigada', cobertura: 'Morango',
    descricao: 'Base amanteigada, creme suave e morangos frescos.', peso: 1.2, precoBase: 110, foto: null,
    fichaTecnica: [
      item(1, 'Farinha', 300, 'g'), item(3, 'Ovos', 2, 'un'), item(4, 'Manteiga', 150, 'g'),
      item(5, 'Açúcar', 200, 'g'), item(9, 'Morango', 810, 'g'), item(7, 'Creme de leite', 1, 'un'),
      item(10, 'Embalagem', 1, 'un')
    ]
  },
  {
    id: 4, nome: 'Bolo de cenoura', categoria: 'Bolos', massa: 'Cenoura', cobertura: 'Brigadeiro',
    descricao: 'Clássico bolo de cenoura com calda de brigadeiro.', peso: 1.3, precoBase: 85, foto: null,
    fichaTecnica: [
      item(1, 'Farinha', 400, 'g'), item(2, 'Chocolate', 150, 'g'), item(3, 'Ovos', 4, 'un'),
      item(5, 'Açúcar', 300, 'g'), item(6, 'Leite condensado', 1, 'un'), item(10, 'Embalagem', 1, 'un')
    ]
  },
  {
    id: 5, nome: 'Torta de limão', categoria: 'Tortas', massa: 'Amanteigada', cobertura: 'Merengue',
    descricao: 'Creme de limão siciliano e merengue maçaricado.', peso: 1, precoBase: 98, foto: null,
    fichaTecnica: [
      item(1, 'Farinha', 300, 'g'), item(3, 'Ovos', 5, 'un'), item(4, 'Manteiga', 150, 'g'),
      item(5, 'Açúcar', 250, 'g'), item(6, 'Leite condensado', 2, 'un'), item(10, 'Embalagem', 1, 'un')
    ]
  },
  {
    id: 6, nome: 'Brigadeiro gourmet (cento)', categoria: 'Doces', massa: 'Sem massa', cobertura: 'Granulado belga',
    descricao: 'Cento de brigadeiros com chocolate belga.', peso: 2, precoBase: 180, foto: null,
    fichaTecnica: [
      item(2, 'Chocolate', 800, 'g'), item(4, 'Manteiga', 200, 'g'), item(6, 'Leite condensado', 6, 'un'),
      item(10, 'Embalagem', 1, 'un')
    ]
  }
]

const clientes = [
  ['Maria Silva', '(45) 99999-0000'], ['Ana Paula', '(45) 99999-0001'], ['Carla Souza', '(45) 99999-0002'],
  ['Juliana Reis', '(45) 99999-0003'], ['Patrícia Lima', '(45) 99999-0004'], ['Fernanda Alves', '(45) 99999-0005'],
  ['Camila Rocha', '(45) 99999-0006'], ['Beatriz Nunes', '(45) 99999-0007']
]

// Custo de cada produto calculado a partir da ficha técnica e do custo médio dos insumos.
const CUSTOS_INICIAIS = { 1: 46, 2: 38, 3: 41, 4: 21.46, 5: 30.94, 6: 78.53 }

function criarVenda(id, cliente, produto, dias, quantidade, status, personalizacao = '') {
  const dataPedido = diasAtrasISO(dias)
  return {
    id,
    cliente: cliente[0],
    whatsapp: cliente[1],
    dataPedido,
    produtoId: produto.id,
    produto: produto.nome,
    quantidade,
    peso: produto.peso,
    dataEntrega: diasAtrasISO(dias - 3),
    descricao: personalizacao || produto.descricao,
    valorTotal: produto.precoBase * quantidade,
    custo: CUSTOS_INICIAIS[produto.id] * quantidade,
    statusPagamento: status
  }
}

function gerarVendas() {
  // Gerador com semente fixa: os dados de demonstração são sempre os mesmos.
  let semente = 42
  const sorteio = (limite) => {
    semente = (semente * 1103515245 + 12345) & 0x7fffffff
    return (semente >> 16) % limite
  }

  const vendas = []
  let id = 1039
  for (let dias = 6; dias < 360; dias += 4 + sorteio(5)) {
    const quantidade = sorteio(6) === 0 ? 2 : 1
    const status = dias < 20 && sorteio(2) === 0 ? 'Pendente' : 'Pago'
    vendas.push(criarVenda(id--, clientes[sorteio(clientes.length)], produtos[sorteio(produtos.length)], dias, quantidade, status))
  }

  // Os três pedidos mais recentes são os mesmos do protótipo.
  return [
    criarVenda(1042, clientes[0], produtos[0], 0, 1, 'Pago', 'Massa de chocolate, cobertura brigadeiro, sem decoração temática.'),
    criarVenda(1041, clientes[1], produtos[1], 1, 1, 'Pendente'),
    criarVenda(1040, clientes[2], produtos[2], 2, 1, 'Pago'),
    ...vendas
  ]
}

export function criarBancoInicial() {
  return {
    insumos: insumos.map((i) => ({ ...i })),
    produtos: produtos.map((p) => ({ ...p, removido: false, fichaTecnica: p.fichaTecnica.map((f) => ({ ...f })) })),
    vendas: gerarVendas()
  }
}
