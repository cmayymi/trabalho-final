// Simula o backend no navegador, seguindo o contrato de docs/CONTRATO-API.md.
// Para testar as telas de erro: localStorage.setItem('sbc.mock.falha', '1')
import { ErroApi } from '../http'
import { criarBancoInicial } from './dados'

const CHAVE = 'sbc.mock.v2'
let memoria = null

function lerBanco() {
  if (memoria) return memoria
  try {
    memoria = JSON.parse(localStorage.getItem(CHAVE))
  } catch {
    memoria = null
  }
  if (!memoria) {
    memoria = criarBancoInicial()
    salvarBanco()
  }
  return memoria
}

function salvarBanco() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(memoria))
  } catch {
    // Sem armazenamento, os dados valem até a página ser recarregada.
  }
}

async function simularRede() {
  await new Promise((resolve) => setTimeout(resolve, 250))
  let falhar = false
  try {
    falhar = localStorage.getItem('sbc.mock.falha') === '1'
  } catch {
    falhar = false
  }
  if (falhar) throw new ErroApi('O servidor está indisponível no momento. Tente novamente em instantes.', 500)
}

const FATOR = { g: 0.001, kg: 1, ml: 0.001, l: 1, un: 1 }
const arredondar = (valor) => Math.round(valor * 1000) / 1000
const naBase = (item) => item.quantidade * (FATOR[item.unidade] ?? 1)
const copia = (dado) => JSON.parse(JSON.stringify(dado))

function statusInsumo(insumo, necessario = 0) {
  if (!insumo || insumo.saldo < necessario) return 'FALTA'
  return insumo.saldo <= insumo.minimo ? 'CRITICO' : 'OK'
}

function montarProduto(banco, produto) {
  const fichaTecnica = produto.fichaTecnica.map((item) => {
    const insumo = banco.insumos.find((i) => i.id === item.insumoId)
    const fator = FATOR[item.unidade] ?? 1
    return {
      ...item,
      saldoDisponivel: insumo ? arredondar(insumo.saldo / fator) : 0,
      status: statusInsumo(insumo, naBase(item))
    }
  })
  const estados = fichaTecnica.map((f) => f.status)
  let disponibilidade = 'DISPONIVEL'
  if (estados.includes('FALTA') || !estados.length) disponibilidade = 'EM_FALTA'
  else if (estados.includes('CRITICO')) disponibilidade = 'CRITICO'
  return { ...copia(produto), fichaTecnica, disponibilidade }
}

function acharProduto(banco, id) {
  const produto = banco.produtos.find((p) => p.id === Number(id) && !p.removido)
  if (!produto) throw new ErroApi('Produto não encontrado.', 404)
  return produto
}

function acharVenda(banco, id) {
  const venda = banco.vendas.find((v) => v.id === Number(id))
  if (!venda) throw new ErroApi('Venda não encontrada.', 404)
  return venda
}

function custoDoProduto(banco, produto) {
  return produto.fichaTecnica.reduce((total, item) => {
    const insumo = banco.insumos.find((i) => i.id === item.insumoId)
    return total + naBase(item) * (insumo?.custoMedio ?? 0)
  }, 0)
}

// UC04: calcula o consumo antes de alterar os saldos, para nunca gravar pela metade.
function consumoDaVenda(produto, quantidade) {
  if (!produto.fichaTecnica.length) {
    throw new ErroApi('O produto não possui ficha técnica completa.', 422)
  }
  return produto.fichaTecnica.map((item) => ({
    insumoId: item.insumoId,
    ingrediente: item.ingrediente,
    quantidade: naBase(item) * quantidade
  }))
}

function aplicarConsumo(banco, consumo, sinal) {
  consumo.forEach(({ insumoId, quantidade }) => {
    const insumo = banco.insumos.find((i) => i.id === insumoId)
    if (insumo) insumo.saldo = arredondar(insumo.saldo - sinal * quantidade)
  })
}

function validarEstoque(banco, consumo) {
  const faltantes = consumo.filter(({ insumoId, quantidade }) => {
    const insumo = banco.insumos.find((i) => i.id === insumoId)
    return !insumo || insumo.saldo < quantidade
  })
  if (faltantes.length) {
    throw new ErroApi(`Estoque insuficiente: ${faltantes.map((f) => f.ingrediente).join(', ')}.`, 409)
  }
}

function alertasDeEstoque(banco, consumo) {
  return consumo
    .map(({ insumoId }) => banco.insumos.find((i) => i.id === insumoId))
    .filter((insumo) => insumo && insumo.saldo <= insumo.minimo)
    .map((insumo) => `${insumo.nome}: saldo atual ${insumo.saldo} ${insumo.unidade}`)
}

export const mockAutenticacao = {
  async login(login, senha) {
    await simularRede()
    if (login.toLowerCase() !== 'betina' || senha !== 'betina123') {
      throw new ErroApi('Login ou senha inválidos.', 401)
    }
    const carga = btoa(JSON.stringify({
      id: 1,
      login: 'betina',
      exp: Math.floor(Date.now() / 1000) + 8 * 3600
    }))
    return { token: `demonstracao.${carga}.assinatura` }
  }
}

export const mockCatalogo = {
  async listarProdutos() {
    await simularRede()
    const banco = lerBanco()
    return banco.produtos.filter((p) => !p.removido).map((p) => montarProduto(banco, p))
  },
  async buscarProduto(id) {
    await simularRede()
    const banco = lerBanco()
    return montarProduto(banco, acharProduto(banco, id))
  },
  async criarProduto(dados) {
    await simularRede()
    const banco = lerBanco()
    const produto = { ...copia(dados), id: Math.max(0, ...banco.produtos.map((p) => p.id)) + 1, removido: false }
    banco.produtos.push(produto)
    salvarBanco()
    return montarProduto(banco, produto)
  },
  async atualizarProduto(id, dados) {
    await simularRede()
    const banco = lerBanco()
    const produto = acharProduto(banco, id)
    Object.assign(produto, copia(dados))
    salvarBanco()
    return montarProduto(banco, produto)
  },
  async excluirProduto(id) {
    await simularRede()
    const banco = lerBanco()
    // RF11: o produto sai do catálogo, mas as vendas antigas continuam intactas.
    acharProduto(banco, id).removido = true
    salvarBanco()
    return null
  },
  async listarInsumos() {
    await simularRede()
    return lerBanco().insumos.map((i) => ({ ...i, status: statusInsumo(i) }))
  }
}

export const mockVendas = {
  async listar() {
    await simularRede()
    return copia(lerBanco().vendas).sort((a, b) => b.id - a.id)
  },
  async buscar(id) {
    await simularRede()
    return copia(acharVenda(lerBanco(), id))
  },
  async criar(dados) {
    await simularRede()
    const banco = lerBanco()
    const produto = acharProduto(banco, dados.produtoId)
    const consumo = consumoDaVenda(produto, dados.quantidade)
    validarEstoque(banco, consumo)
    aplicarConsumo(banco, consumo, 1)
    const venda = {
      ...copia(dados),
      id: Math.max(0, ...banco.vendas.map((v) => v.id)) + 1,
      produto: produto.nome,
      custo: custoDoProduto(banco, produto) * dados.quantidade
    }
    banco.vendas.push(venda)
    salvarBanco()
    return { ...copia(venda), alertasEstoque: alertasDeEstoque(banco, consumo) }
  },
  async atualizar(id, dados) {
    await simularRede()
    const banco = lerBanco()
    const venda = acharVenda(banco, id)

    // Sem troca de produto ou quantidade, o estoque e o custo histórico não mudam.
    if (venda.produtoId === dados.produtoId && venda.quantidade === dados.quantidade) {
      Object.assign(venda, copia(dados), { produto: venda.produto, custo: venda.custo })
      salvarBanco()
      return copia(venda)
    }

    const produtoNovo = acharProduto(banco, dados.produtoId)
    const produtoAntigo = banco.produtos.find((p) => p.id === venda.produtoId)
    const consumoAntigo = produtoAntigo?.fichaTecnica.length
      ? consumoDaVenda(produtoAntigo, venda.quantidade)
      : []
    const consumoNovo = consumoDaVenda(produtoNovo, dados.quantidade)

    aplicarConsumo(banco, consumoAntigo, -1)
    try {
      validarEstoque(banco, consumoNovo)
    } catch (erro) {
      aplicarConsumo(banco, consumoAntigo, 1)
      throw erro
    }
    aplicarConsumo(banco, consumoNovo, 1)

    Object.assign(venda, copia(dados), {
      produto: produtoNovo.nome,
      custo: custoDoProduto(banco, produtoNovo) * dados.quantidade
    })
    salvarBanco()
    return { ...copia(venda), alertasEstoque: alertasDeEstoque(banco, consumoNovo) }
  }
}

export const mockRelatorios = {
  async vendas(inicio, fim) {
    await simularRede()
    const linhas = lerBanco().vendas
      .filter((v) => v.dataPedido >= inicio && v.dataPedido <= fim)
      .sort((a, b) => b.dataPedido.localeCompare(a.dataPedido) || b.id - a.id)
      .map((v) => ({
        pedido: v.id,
        cliente: v.cliente,
        item: v.produto,
        data: v.dataPedido,
        venda: v.valorTotal,
        custo: v.custo,
        lucro: v.valorTotal - v.custo
      }))
    return { linhas }
  }
}
