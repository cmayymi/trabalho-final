const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function moeda(valor) {
  return formatoMoeda.format(Number(valor) || 0)
}

// "R$ 120" quando não há centavos, como nas listagens do protótipo.
export function moedaCurta(valor) {
  const numero = Number(valor) || 0
  return Number.isInteger(numero)
    ? `R$ ${numero.toLocaleString('pt-BR')}`
    : moeda(numero)
}

// Preço com a forma de venda: "R$ 80 /kg" (por peso) ou "R$ 3,50 /un" (por unidade).
export function precoComUnidade(produto) {
  const sufixo = { peso: ' /kg', unidade: ' /un' }[produto.tipoVenda] || ''
  return moedaCurta(produto.precoBase) + sufixo
}

// Rota da tela "em desenvolvimento" para funções que ainda não existem no backend.
export function emDesenvolvimento(funcionalidade) {
  return { name: 'em-breve', query: { funcionalidade } }
}

export function dataLonga(iso) {
  if (!iso) return '—'
  const [ano, mes, dia] = iso.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

export function dataCurta(iso) {
  return dataLonga(iso).slice(0, 5)
}

export function paraISO(data) {
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${data.getFullYear()}-${mes}-${dia}`
}

export function hojeISO() {
  return paraISO(new Date())
}

export function diasAtrasISO(dias) {
  const data = new Date()
  data.setDate(data.getDate() - dias)
  return paraISO(data)
}

export function normalizar(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

export function mascaraWhatsApp(texto) {
  const d = String(texto).replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function numeroBR(valor) {
  return (Number(valor) || 0).toLocaleString('pt-BR', { maximumFractionDigits: 3 })
}
