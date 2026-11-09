<template>
  <CabecalhoPagina :titulo="funcionalidade" subtitulo="Funcionalidade prevista para uma próxima etapa" />
  <EstadoPagina icone="bi-tools" titulo="Ainda não disponível" texto="Esta entrega contempla autenticação, catálogo, registro de vendas e relatório de vendas.">
    <router-link class="btn btn-ambar" :to="{ name: 'inicio' }">Voltar ao início</router-link>
  </EstadoPagina>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import CabecalhoPagina from '@/components/layout/CabecalhoPagina.vue'
import EstadoPagina from '@/components/comum/EstadoPagina.vue'

const rota = useRoute()
const funcionalidade = computed(() => rota.query.funcionalidade || 'Em breve')
</script>
