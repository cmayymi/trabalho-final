<template>
  <aside id="menu-principal" ref="elemento" class="offcanvas-lg offcanvas-start barra nao-imprimir" tabindex="-1" aria-label="Menu principal">
    <div class="d-flex flex-column h-100">
      <router-link :to="{ name: 'inicio' }" class="logo">
        <img :src="logo" alt="Betina Cozinha, comfort food" />
      </router-link>

      <nav class="flex-grow-1">
        <router-link v-for="item in itens" :key="item.nome" :to="item.destino" class="item" :class="{ ativo: estaAtivo(item) }">
          <i class="bi" :class="item.icone" aria-hidden="true"></i>
          <span>{{ item.texto }}</span>
        </router-link>
      </nav>

      <button type="button" class="item sair" @click="$emit('sair')">Sair</button>
    </div>
  </aside>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Offcanvas } from 'bootstrap'
import logo from '@/assets/img/logo-escuro.png'

defineEmits(['sair'])

const rota = useRoute()
const elemento = ref(null)

const emBreve = (funcionalidade) => ({ name: 'em-breve', query: { funcionalidade } })

const itens = [
  { nome: 'inicio', texto: 'Início', icone: 'bi-house-door-fill', destino: { name: 'inicio' }, prefixo: '/inicio' },
  { nome: 'vendas', texto: 'Vendas', icone: 'bi-coin', destino: { name: 'vendas' }, prefixo: '/vendas' },
  { nome: 'catalogo', texto: 'Catálogo', icone: 'bi-grid-3x3', destino: { name: 'catalogo' }, prefixo: '/catalogo' },
  { nome: 'estoque', texto: 'Estoque', icone: 'bi-card-list', destino: emBreve('Estoque'), funcionalidade: 'Estoque' },
  { nome: 'relatorios', texto: 'Relatórios', icone: 'bi-layout-three-columns', destino: { name: 'relatorios' }, prefixo: '/relatorios' },
  { nome: 'configuracoes', texto: 'Configurações', icone: 'bi-gear', destino: emBreve('Configurações'), funcionalidade: 'Configurações' }
]

function estaAtivo(item) {
  if (item.funcionalidade) return rota.query.funcionalidade === item.funcionalidade
  return rota.path.startsWith(item.prefixo)
}

// No celular o menu é uma gaveta: fecha sozinho ao escolher uma página.
watch(() => rota.fullPath, () => {
  if (elemento.value) Offcanvas.getInstance(elemento.value)?.hide()
})
</script>

<style scoped>
.barra {
  --bs-offcanvas-width: 250px;
  background: var(--sbc-escuro) !important; /* o offcanvas-lg fica transparente no desktop */
  color: #fff;
}

@media (min-width: 992px) {
  .barra {
    bottom: 0;
    left: 0;
    position: fixed;
    top: 0;
    width: 240px;
    z-index: 1020;
  }
}

.barra > div {
  overflow-y: auto;
  padding: 1.75rem 1.1rem 1.5rem;
}

.logo {
  display: block;
  margin-bottom: 2.25rem;
  text-align: center;
}

.logo img {
  max-width: 165px;
  width: 100%;
}

.item {
  align-items: center;
  background: none;
  border: 0;
  border-radius: 12px;
  color: #fff;
  display: flex;
  font-size: 1.05rem;
  gap: 0.7rem;
  margin-bottom: 0.65rem;
  padding: 0.8rem 1rem;
  text-align: left;
  text-decoration: none;
  transition: background-color 0.12s ease;
  width: 100%;
}

.item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.item:focus-visible {
  outline: 2px solid var(--sbc-ambar);
  outline-offset: -2px;
}

.item.ativo {
  background: var(--sbc-escuro-ativo);
  color: var(--sbc-ambar);
  font-weight: 700;
}

.sair {
  color: rgba(255, 255, 255, 0.78);
  margin-bottom: 0;
}
</style>
