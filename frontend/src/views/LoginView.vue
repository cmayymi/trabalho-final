<template>
  <main class="pagina">
    <img :src="logo" alt="Betina Cozinha, comfort food" class="logo" />

    <section class="cartao-login" aria-labelledby="titulo-login">
      <h1 id="titulo-login">Entrar no sistema</h1>
      <p class="texto-suave text-center mb-4">Acesse os dados da confeitaria</p>

      <div v-if="aviso" class="alert alert-warning" role="status">{{ aviso }}</div>
      <div v-if="erro" class="alert alert-danger d-flex gap-2" role="alert">
        <i class="bi bi-exclamation-circle-fill" aria-hidden="true"></i>
        <span>{{ erro }}</span>
      </div>

      <form novalidate @submit.prevent="entrarNoSistema">
        <div class="mb-3">
          <label for="login" class="form-label">Usuária</label>
          <input id="login" ref="campoLogin" v-model="login" class="form-control" :class="{ 'is-invalid': erros.login }" autocomplete="username" autocapitalize="none" spellcheck="false" />
          <div class="invalid-feedback">{{ erros.login }}</div>
        </div>

        <div class="mb-4">
          <label for="senha" class="form-label">Senha</label>
          <div class="position-relative">
            <input id="senha" v-model="senha" :type="mostrarSenha ? 'text' : 'password'" class="form-control campo-senha" :class="{ 'is-invalid': erros.senha }" autocomplete="current-password" />
            <button type="button" class="olho" :aria-label="mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'" :aria-pressed="mostrarSenha" @click="mostrarSenha = !mostrarSenha">
              <i class="bi" :class="mostrarSenha ? 'bi-eye-slash' : 'bi-eye'" aria-hidden="true"></i>
            </button>
            <div class="invalid-feedback">{{ erros.senha }}</div>
          </div>
        </div>

        <button type="submit" class="btn btn-ambar w-100 entrar" :disabled="enviando">
          <span v-if="enviando" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
          {{ enviando ? 'Entrando…' : 'Entrar' }}
        </button>
      </form>

      <button type="button" class="acao d-block mx-auto mt-3 esqueci" @click="esqueciSenha">Esqueci minha senha</button>

      <p v-if="emModoDemonstracao" class="demo">
        <i class="bi bi-info-circle" aria-hidden="true"></i>
        Modo demonstração: usuária <strong>betina</strong>, senha <strong>betina123</strong>
      </p>
    </section>
  </main>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import logo from '@/assets/img/logo-claro.png'
import { emModoDemonstracao, entrar } from '@/services/autenticacao'
import { avisar } from '@/composables/avisos'

const rota = useRoute()
const router = useRouter()

const campoLogin = ref(null)
const login = ref('')
const senha = ref('')
const mostrarSenha = ref(false)
const enviando = ref(false)
const erro = ref('')
const erros = reactive({ login: '', senha: '' })
const aviso = ref(rota.query.expirada ? 'Sua sessão expirou. Entre novamente para continuar.' : '')

onMounted(() => campoLogin.value.focus())

function destinoSeguro() {
  const destino = rota.query.redirecionar
  // Aceita apenas caminhos internos do próprio sistema.
  return typeof destino === 'string' && destino.startsWith('/') && !destino.startsWith('//')
    ? destino
    : { name: 'inicio' }
}

async function entrarNoSistema() {
  erro.value = ''
  aviso.value = ''
  erros.login = login.value.trim() ? '' : 'Informe sua usuária.'
  erros.senha = senha.value ? '' : 'Informe sua senha.'
  if (erros.login || erros.senha) return

  enviando.value = true
  try {
    await entrar(login.value, senha.value)
    await router.replace(destinoSeguro())
  } catch (falha) {
    erro.value = falha.message
    senha.value = ''
  } finally {
    enviando.value = false
  }
}

function esqueciSenha() {
  avisar.info('A recuperação de senha ainda não está disponível. Fale com a administração do sistema.')
}
</script>

<style scoped>
.pagina {
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
  padding: 16px;
  position: relative;
}

.logo {
  left: 5.5vw;
  mix-blend-mode: multiply;
  position: absolute;
  top: 12px;
  width: 200px;
}

.cartao-login {
  background: #fff;
  border-radius: 56px;
  box-shadow: 0 12px 34px rgba(31, 31, 28, 0.2);
  max-width: 520px;
  padding: 3.25rem clamp(1.5rem, 5vw, 4rem) 2.5rem;
  width: 100%;
}

h1 {
  font-size: clamp(1.9rem, 4vw, 2.6rem);
  margin-bottom: 0.1rem;
  text-align: center;
}

.campo-senha {
  background-image: none !important;
  padding-right: 3rem;
}

.olho {
  background: none;
  border: 0;
  color: var(--sbc-texto-suave);
  font-size: 1.2rem;
  height: 54px;
  position: absolute;
  right: 4px;
  top: 0;
  width: 44px;
}

.olho:focus-visible {
  border-radius: 10px;
  outline: 2px solid var(--sbc-ambar);
}

.entrar {
  min-height: 62px;
  font-size: 1.1rem;
}

.esqueci {
  font-weight: 500;
}

.demo {
  background: var(--sbc-fundo);
  border-radius: 12px;
  color: var(--sbc-texto-suave);
  font-size: 0.82rem;
  margin: 1.25rem 0 0;
  padding: 0.6rem 0.8rem;
  text-align: center;
}

@media (max-width: 991.98px) {
  .logo {
    margin-bottom: 1rem;
    position: static;
    width: 170px;
  }

  .pagina {
    justify-content: flex-start;
    padding-top: 2rem;
  }

  .cartao-login {
    border-radius: 36px;
  }
}
</style>
