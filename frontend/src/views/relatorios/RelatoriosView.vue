<template>
  <CabecalhoPagina titulo="Relatórios" subtitulo="Escolha o relatório que deseja analisar" />

  <section class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4 mb-4">
    <div v-for="relatorio in relatorios" :key="relatorio.titulo" class="col">
      <article class="cartao p-4 h-100 d-flex flex-column">
        <i class="bi bi-layout-three-columns icone" aria-hidden="true"></i>
        <h2 class="nome">{{ relatorio.titulo }}</h2>
        <p class="texto-suave flex-grow-1">{{ relatorio.descricao }}</p>
        <router-link class="btn btn-ambar" :to="relatorio.destino">Abrir relatório</router-link>
      </article>
    </div>
  </section>

  <router-link class="btn btn-ambar" :to="emBreve('Custos e margens')">Custos e margens</router-link>
</template>

<script setup>
import CabecalhoPagina from '@/components/layout/CabecalhoPagina.vue'

const emBreve = (funcionalidade) => ({ name: 'em-breve', query: { funcionalidade } })

const relatorios = [
  { titulo: 'Relatório de vendas', descricao: 'Vendas, custos e lucro por período', destino: { name: 'relatorio-vendas' } },
  { titulo: 'Relatório de estoque', descricao: 'Saldo atual, mínimo e custo médio', destino: emBreve('Relatório de estoque') },
  { titulo: 'Relatório de lucro', descricao: 'Filtros avançados e rentabilidade', destino: emBreve('Relatório de lucro') }
]
</script>

<style scoped>
.icone {
  color: var(--sbc-ambar);
  font-size: 2.2rem;
}

.nome {
  font-size: 1.45rem;
  margin: 1.25rem 0 1rem;
}
</style>
