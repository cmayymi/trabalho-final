import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import { definirAoExpirar, encerrarSessao, estaAutenticada } from '@/composables/sessao'

// Cada tela é carregada sob demanda: o Webpack gera um arquivo separado por rota.
const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { publica: true, titulo: 'Entrar' }
  },
  {
    path: '/',
    component: AppLayout,
    children: [
      { path: '', redirect: { name: 'inicio' } },
      { path: 'inicio', name: 'inicio', component: () => import('@/views/InicioView.vue'), meta: { titulo: 'Início' } },

      { path: 'catalogo', name: 'catalogo', component: () => import('@/views/catalogo/CatalogoView.vue'), meta: { titulo: 'Catálogo' } },
      { path: 'catalogo/novo', name: 'produto-novo', component: () => import('@/views/catalogo/ProdutoFormView.vue'), meta: { titulo: 'Cadastrar produto' } },
      { path: 'catalogo/:id', name: 'produto-detalhe', component: () => import('@/views/catalogo/ProdutoDetalheView.vue'), meta: { titulo: 'Produto' } },
      { path: 'catalogo/:id/editar', name: 'produto-editar', component: () => import('@/views/catalogo/ProdutoFormView.vue'), meta: { titulo: 'Editar produto' } },

      { path: 'vendas', name: 'vendas', component: () => import('@/views/vendas/VendasView.vue'), meta: { titulo: 'Vendas' } },
      { path: 'vendas/nova', name: 'venda-nova', component: () => import('@/views/vendas/VendaFormView.vue'), meta: { titulo: 'Registrar venda' } },
      { path: 'vendas/:id', name: 'venda-detalhe', component: () => import('@/views/vendas/VendaDetalheView.vue'), meta: { titulo: 'Pedido' } },
      { path: 'vendas/:id/editar', name: 'venda-editar', component: () => import('@/views/vendas/VendaFormView.vue'), meta: { titulo: 'Editar venda' } },

      { path: 'relatorios', name: 'relatorios', component: () => import('@/views/relatorios/RelatoriosView.vue'), meta: { titulo: 'Relatórios' } },
      { path: 'relatorios/vendas', name: 'relatorio-vendas', component: () => import('@/views/relatorios/RelatorioVendasView.vue'), meta: { titulo: 'Relatório de vendas' } },

      { path: 'em-breve', name: 'em-breve', component: () => import('@/views/EmBreveView.vue'), meta: { titulo: 'Em breve' } },
      { path: ':caminho(.*)*', name: 'nao-encontrado', component: () => import('@/views/NaoEncontradoView.vue'), meta: { titulo: 'Não encontrado' } }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

// RF05: nenhuma funcionalidade é acessível sem autenticação.
router.beforeEach((destino) => {
  if (destino.meta.publica) {
    return destino.name === 'login' && estaAutenticada() ? { name: 'inicio' } : true
  }
  if (estaAutenticada()) return true
  encerrarSessao()
  return { name: 'login', query: { redirecionar: destino.fullPath } }
})

router.afterEach((destino) => {
  document.title = `${destino.meta.titulo} · Betina Cozinha`
})

definirAoExpirar(() => {
  router.push({ name: 'login', query: { expirada: '1' } })
})

export default router
