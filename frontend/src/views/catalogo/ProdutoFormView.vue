<template>
  <CabecalhoPagina :titulo="editando ? 'Editar produto' : 'Cadastrar produto'" subtitulo="Dados do catálogo e ficha técnica" />

  <EstadoPagina v-if="carregando" tipo="carregando" titulo="Carregando…" />
  <EstadoPagina v-else-if="erroCarga" tipo="erro" icone="bi-cloud-slash" titulo="Não foi possível abrir o formulário" :texto="erroCarga">
    <router-link class="btn btn-branco" :to="{ name: 'catalogo' }">Voltar ao catálogo</router-link>
  </EstadoPagina>

  <form v-else novalidate @submit.prevent="salvar">
    <div v-if="erroEnvio" class="alert alert-danger" role="alert">O produto não foi salvo. {{ erroEnvio }}</div>

    <div class="row g-3 mb-3">
      <div class="col-12 col-lg-5">
        <label class="form-label" for="nome">Nome</label>
        <input id="nome" v-model="form.nome" class="form-control" :class="{ 'is-invalid': erros.nome }" maxlength="80" />
        <div class="invalid-feedback">{{ erros.nome }}</div>
      </div>
      <div class="col-12 col-sm-6 col-lg-3">
        <label class="form-label" for="categoria">Categoria</label>
        <select id="categoria" v-model="form.categoria" class="form-select" :class="{ 'is-invalid': erros.categoria }">
          <option value="" disabled>Selecione</option>
          <option v-for="c in CATEGORIAS" :key="c" :value="c">{{ c }}</option>
        </select>
        <div class="invalid-feedback">{{ erros.categoria }}</div>
      </div>
      <div class="col-6 col-lg-2">
        <label class="form-label" for="peso">Peso padrão</label>
        <div class="input-group has-validation">
          <input id="peso" v-model.number="form.peso" type="number" min="0" step="0.1" class="form-control" :class="{ 'is-invalid': erros.peso }" />
          <span class="input-group-text">kg</span>
          <div class="invalid-feedback">{{ erros.peso }}</div>
        </div>
      </div>
      <div class="col-6 col-sm-12 col-lg-2">
        <label class="form-label" for="preco">Preço base</label>
        <CampoMoeda id="preco" v-model="form.precoBase" :class="{ 'is-invalid': erros.precoBase }" />
        <div class="invalid-feedback">{{ erros.precoBase }}</div>
      </div>
    </div>

    <div class="row g-3 mb-3">
      <div class="col-12 col-sm-6">
        <label class="form-label" for="massa">Tipo de massa</label>
        <input id="massa" v-model="form.massa" class="form-control" list="opcoes-massa" maxlength="40" placeholder="Ex.: Chocolate" />
        <datalist id="opcoes-massa"><option v-for="m in opcoesMassa" :key="m" :value="m" /></datalist>
      </div>
      <div class="col-12 col-sm-6">
        <label class="form-label" for="cobertura">Cobertura</label>
        <input id="cobertura" v-model="form.cobertura" class="form-control" list="opcoes-cobertura" maxlength="40" placeholder="Ex.: Brigadeiro" />
        <datalist id="opcoes-cobertura"><option v-for="c in opcoesCobertura" :key="c" :value="c" /></datalist>
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-12 col-lg-9">
        <label class="form-label" for="descricao">Descrição</label>
        <textarea id="descricao" v-model="form.descricao" class="form-control" :class="{ 'is-invalid': erros.descricao }" rows="3" maxlength="400"></textarea>
        <div class="invalid-feedback">{{ erros.descricao }}</div>
      </div>
      <div class="col-12 col-lg-3">
        <span class="form-label d-block">Foto do produto</span>
        <label class="foto-campo" :class="{ 'foto-vazia': !form.foto }">
          <img v-if="form.foto" :src="form.foto" alt="Pré-visualização da foto" />
          <template v-else><i class="bi bi-camera" aria-hidden="true"></i><span class="small">Adicionar</span></template>
          <input type="file" accept="image/*" class="visually-hidden" aria-label="Escolher foto do produto" @change="escolherFoto" />
        </label>
        <button v-if="form.foto" type="button" class="acao small" @click="form.foto = null">Remover foto</button>
      </div>
    </div>

    <h2 class="titulo-secao">Ficha técnica</h2>
    <div class="row g-3">
      <div class="col-12 col-xl-10">
        <div class="table-responsive">
          <table class="table tabela-sbc">
            <thead>
              <tr><th scope="col">Ingrediente</th><th scope="col">Quantidade</th><th scope="col">Unidade</th><th scope="col">Disponibilidade</th><th scope="col"><span class="visually-hidden">Remover</span></th></tr>
            </thead>
            <tbody>
              <tr v-for="(item, indice) in form.fichaTecnica" :key="item.chave">
                <td>
                  <select v-model="item.insumoId" class="form-select" :aria-label="`Ingrediente ${indice + 1}`" @change="ajustarUnidade(item)">
                    <option :value="null" disabled>Selecione</option>
                    <option v-for="i in insumos" :key="i.id" :value="i.id">{{ i.nome }}</option>
                  </select>
                </td>
                <td><input v-model.number="item.quantidade" type="number" min="0" step="any" class="form-control" :aria-label="`Quantidade do ingrediente ${indice + 1}`" /></td>
                <td>
                  <select v-model="item.unidade" class="form-select" :aria-label="`Unidade do ingrediente ${indice + 1}`">
                    <option v-for="u in unidadesDe(item)" :key="u" :value="u">{{ u }}</option>
                  </select>
                </td>
                <td class="text-center"><EtiquetaStatus v-if="item.insumoId" :status="statusDe(item)" /></td>
                <td class="text-center">
                  <button type="button" class="acao text-danger" :aria-label="`Remover ingrediente ${indice + 1}`" @click="form.fichaTecnica.splice(indice, 1)">
                    <i class="bi bi-trash" aria-hidden="true"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="!form.fichaTecnica.length">
                <td colspan="5" class="text-center texto-suave">Adicione os ingredientes usados na produção.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="erros.fichaTecnica" class="text-danger small mt-2" role="alert">{{ erros.fichaTecnica }}</div>
      </div>
      <div class="col-12 col-xl-2">
        <button type="button" class="btn btn-branco w-100" @click="adicionarIngrediente">+ Ingrediente</button>
      </div>
    </div>

    <div class="d-flex justify-content-end gap-3 mt-4">
      <router-link class="btn btn-branco" :to="{ name: 'catalogo' }">Cancelar</router-link>
      <button type="submit" class="btn btn-ambar" :disabled="enviando">
        <span v-if="enviando" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
        Salvar produto
      </button>
    </div>
  </form>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CabecalhoPagina from '@/components/layout/CabecalhoPagina.vue'
import EstadoPagina from '@/components/comum/EstadoPagina.vue'
import EtiquetaStatus from '@/components/comum/EtiquetaStatus.vue'
import CampoMoeda from '@/components/comum/CampoMoeda.vue'
import catalogo from '@/services/catalogo'
import { avisar } from '@/composables/avisos'

const CATEGORIAS = ['Bolos', 'Tortas', 'Doces', 'Salgados']
const UNIDADES = { kg: ['g', 'kg'], l: ['ml', 'l'], un: ['un'] }
const FATOR = { g: 0.001, ml: 0.001 }

const rota = useRoute()
const router = useRouter()
const editando = computed(() => Boolean(rota.params.id))

const carregando = ref(true)
const erroCarga = ref('')
const erroEnvio = ref('')
const enviando = ref(false)
const insumos = ref([])
const produtos = ref([])
const erros = reactive({})
let proximaChave = 1

const form = reactive({
  nome: '', categoria: '', massa: '', cobertura: '', peso: null, precoBase: 0, descricao: '', foto: null, fichaTecnica: []
})

const opcoesMassa = computed(() => [...new Set(produtos.value.map((p) => p.massa).filter(Boolean))])
const opcoesCobertura = computed(() => [...new Set(produtos.value.map((p) => p.cobertura).filter(Boolean))])

onMounted(async () => {
  try {
    const [listaInsumos, listaProdutos, produto] = await Promise.all([
      catalogo.listarInsumos(),
      catalogo.listarProdutos(),
      editando.value ? catalogo.buscarProduto(rota.params.id) : null
    ])
    insumos.value = listaInsumos
    produtos.value = listaProdutos
    if (produto) {
      Object.assign(form, produto, {
        fichaTecnica: produto.fichaTecnica.map((f) => ({
          chave: proximaChave++, insumoId: f.insumoId, quantidade: f.quantidade, unidade: f.unidade
        }))
      })
    }
  } catch (falha) {
    erroCarga.value = falha.message
  } finally {
    carregando.value = false
  }
})

const insumoDe = (item) => insumos.value.find((i) => i.id === item.insumoId)
const unidadesDe = (item) => UNIDADES[insumoDe(item)?.unidade] || ['g', 'kg', 'ml', 'l', 'un']

function adicionarIngrediente() {
  form.fichaTecnica.push({ chave: proximaChave++, insumoId: null, quantidade: null, unidade: 'g' })
}

function ajustarUnidade(item) {
  const unidades = unidadesDe(item)
  if (!unidades.includes(item.unidade)) item.unidade = unidades[0]
}

function statusDe(item) {
  const insumo = insumoDe(item)
  if (!insumo) return 'FALTA'
  const necessario = (Number(item.quantidade) || 0) * (FATOR[item.unidade] ?? 1)
  if (insumo.saldo < necessario) return 'FALTA'
  return insumo.status === 'OK' ? 'OK' : 'CRITICO'
}

function validar() {
  Object.keys(erros).forEach((chave) => delete erros[chave])
  if (!form.nome.trim()) erros.nome = 'Informe o nome do produto.'
  if (!form.categoria) erros.categoria = 'Selecione a categoria.'
  if (!(form.peso > 0)) erros.peso = 'Informe um peso válido.'
  if (!(form.precoBase > 0)) erros.precoBase = 'Informe o preço base.'
  if (!form.descricao.trim()) erros.descricao = 'Descreva o produto.'

  const fichaIncompleta = form.fichaTecnica.some((i) => !i.insumoId || !(i.quantidade > 0))
  const ids = form.fichaTecnica.map((i) => i.insumoId)
  if (!form.fichaTecnica.length) erros.fichaTecnica = 'Inclua ao menos um ingrediente na ficha técnica.'
  else if (fichaIncompleta) erros.fichaTecnica = 'Preencha o ingrediente e a quantidade de todas as linhas.'
  else if (new Set(ids).size !== ids.length) erros.fichaTecnica = 'Há ingredientes repetidos na ficha técnica.'

  return Object.keys(erros).length === 0
}

// Reduz a imagem antes de guardar, para não pesar no armazenamento.
function escolherFoto(evento) {
  const arquivo = evento.target.files[0]
  if (!arquivo) return
  const url = URL.createObjectURL(arquivo)
  const imagem = new Image()
  imagem.onload = () => {
    const escala = Math.min(1, 640 / imagem.width)
    const canvas = document.createElement('canvas')
    canvas.width = imagem.width * escala
    canvas.height = imagem.height * escala
    canvas.getContext('2d').drawImage(imagem, 0, 0, canvas.width, canvas.height)
    form.foto = canvas.toDataURL('image/jpeg', 0.8)
    URL.revokeObjectURL(url)
  }
  imagem.onerror = () => {
    URL.revokeObjectURL(url)
    avisar.erro('Não foi possível ler esta imagem.')
  }
  imagem.src = url
}

async function salvar() {
  erroEnvio.value = ''
  if (!validar()) {
    await nextTick()
    document.querySelector('form .is-invalid')?.focus()
    return
  }

  const dados = {
    nome: form.nome.trim(),
    categoria: form.categoria,
    massa: form.massa.trim(),
    cobertura: form.cobertura.trim(),
    peso: form.peso,
    precoBase: form.precoBase,
    descricao: form.descricao.trim(),
    foto: form.foto,
    fichaTecnica: form.fichaTecnica.map((i) => ({
      insumoId: i.insumoId,
      ingrediente: insumoDe(i).nome,
      quantidade: i.quantidade,
      unidade: i.unidade
    }))
  }

  enviando.value = true
  try {
    const salvo = editando.value
      ? await catalogo.atualizarProduto(rota.params.id, dados)
      : await catalogo.criarProduto(dados)
    avisar.sucesso('Produto salvo com sucesso.')
    router.push({ name: 'produto-detalhe', params: { id: salvo.id } })
  } catch (falha) {
    erroEnvio.value = falha.message
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } finally {
    enviando.value = false
  }
}
</script>

<style scoped>
.foto-campo {
  border-radius: 18px;
  cursor: pointer;
  display: flex;
  height: 92px;
  overflow: hidden;
}

.foto-campo:focus-within {
  outline: 3px solid var(--sbc-ambar);
}

.foto-campo img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.foto-campo .bi {
  font-size: 1.3rem;
}
</style>
