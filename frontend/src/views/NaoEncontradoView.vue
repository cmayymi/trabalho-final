<template>
  <CabecalhoPagina titulo="Página não encontrada" />
  <EstadoPagina icone="bi-signpost-split" titulo="Este endereço não existe" texto="Confira o link ou volte para a página inicial.">
    <router-link class="btn btn-ambar" :to="{ name: 'inicio' }">Ir para o início</router-link>
  </EstadoPagina>
</template>

<script setup>
import CabecalhoPagina from '@/components/layout/CabecalhoPagina.vue'
import EstadoPagina from '@/components/comum/EstadoPagina.vue'
</script>
