<template>
  <div class="aplicacao">
    <BarraLateral @sair="fazerLogout" />

    <div class="conteudo">
      <div class="topo nao-imprimir">
        <button class="btn btn-branco d-lg-none menu" type="button" data-bs-toggle="offcanvas" data-bs-target="#menu-principal" aria-controls="menu-principal" aria-label="Abrir menu">
          <i class="bi bi-list" aria-hidden="true"></i>
        </button>

        <div class="dropdown ms-auto">
          <button class="usuaria dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            {{ sessao.nome }}
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <router-link class="dropdown-item" :to="{ name: 'em-breve', query: { funcionalidade: 'Configurações' } }">Configurações</router-link>
            </li>
            <li><button class="dropdown-item" type="button" @click="fazerLogout">Sair</button></li>
          </ul>
        </div>
      </div>

      <main>
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import BarraLateral from './BarraLateral.vue'
import { sessao } from '@/composables/sessao'
import { sair } from '@/services/autenticacao'
import { avisar } from '@/composables/avisos'

const router = useRouter()

function fazerLogout() {
  sair()
  avisar.info('Você saiu do sistema.')
  router.push({ name: 'login' })
}
</script>

<style scoped>
.aplicacao {
  min-height: 100vh;
}

.conteudo {
  padding: 2.25rem clamp(16px, 3.5vw, 44px) 2.5rem;
  position: relative;
}

@media (min-width: 992px) {
  .conteudo {
    margin-left: 240px;
  }
}

.topo {
  align-items: center;
  display: flex;
  left: clamp(16px, 3.5vw, 44px);
  position: absolute;
  right: clamp(16px, 3.5vw, 44px);
  top: 2rem;
  z-index: 5;
}

@media (max-width: 991.98px) {
  .topo {
    margin-bottom: 1rem;
    position: static;
  }

  .conteudo {
    padding-top: 1rem;
  }
}

.menu {
  padding: 0.4rem 0.75rem;
}

.usuaria {
  background: none;
  border: 0;
  font-weight: 700;
  padding: 0.25rem 0.4rem;
}

.usuaria:focus-visible {
  border-radius: 6px;
  outline: 2px solid var(--sbc-ambar);
}
</style>
