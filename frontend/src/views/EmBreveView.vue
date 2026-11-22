<template>
  <CabecalhoPagina :titulo="funcionalidade" subtitulo="Funcionalidade prevista no projeto do SBC" />
  <EstadoPagina icone="bi-tools" titulo="Em desenvolvimento" texto="Esta funcionalidade faz parte do sistema planejado, mas ainda não foi implementada nesta versão.">
    <button class="btn btn-branco" type="button" @click="voltar">Voltar</button>
    <router-link class="btn btn-ambar ms-2" :to="{ name: 'inicio' }">Ir para o início</router-link>
  </EstadoPagina>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CabecalhoPagina from '@/components/layout/CabecalhoPagina.vue'
import EstadoPagina from '@/components/comum/EstadoPagina.vue'

const rota = useRoute()
const router = useRouter()
const funcionalidade = computed(() => rota.query.funcionalidade || 'Em desenvolvimento')

function voltar() {
  if (window.history.length > 1) router.back()
  else router.push({ name: 'inicio' })
}
</script>
