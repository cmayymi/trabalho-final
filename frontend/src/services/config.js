// Liga ou desliga os dados de teste de cada módulo. Valores definidos em .env.
const ligado = (valor) => valor === 'true'

export const usarMock = {
  autenticacao: ligado(process.env.VUE_APP_MOCK_AUTH),
  catalogo: ligado(process.env.VUE_APP_MOCK_CATALOGO),
  vendas: ligado(process.env.VUE_APP_MOCK_VENDAS),
  relatorios: ligado(process.env.VUE_APP_MOCK_RELATORIOS)
}
