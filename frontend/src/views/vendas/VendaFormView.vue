<template>
  <CabecalhoPagina titulo="Registrar/editar venda" subtitulo="Preencha os dados do pedido" />

  <EstadoPagina v-if="carregando" tipo="carregando" titulo="Carregando…" />
  <EstadoPagina v-else-if="erroCarga" tipo="erro" icone="bi-cloud-slash" titulo="Não foi possível abrir o formulário" :texto="erroCarga">
    <router-link class="btn btn-branco" :to="{ name: 'vendas' }">Voltar às vendas</router-link>
  </EstadoPagina>
  <EstadoPagina v-else-if="editando && !vendasApi.podeEditar" icone="bi-tools" titulo="Edição ainda não disponível" texto="A edição de pedidos (RF10) ainda não foi implementada no servidor.">
    <router-link class="btn btn-branco" :to="{ name: 'vendas' }">Voltar às vendas</router-link>
  </EstadoPagina>
  <EstadoPagina v-else-if="!produtos.length" titulo="O catálogo está vazio" texto="Cadastre um produto antes de registrar uma venda.">
    <router-link class="btn btn-ambar" :to="{ name: 'produto-novo' }">+ Novo produto</router-link>
  </EstadoPagina>

  <form v-else novalidate @submit.prevent="revisar">
    <div v-if="erroEnvio" class="alert alert-danger" role="alert">A venda não foi registrada. {{ erroEnvio }}</div>

    <div class="row g-3 mb-3">
      <div class="col-12 col-lg-4">
        <label class="form-label" for="cliente">Cliente</label>
        <input id="cliente" v-model="form.cliente" class="form-control" :class="{ 'is-invalid': erros.cliente }" maxlength="80" autocomplete="off" />
        <div class="invalid-feedback">{{ erros.cliente }}</div>
      </div>
      <div class="col-12 col-sm-6 col-lg-3">
        <label class="form-label" for="whatsapp">WhatsApp</label>
        <input id="whatsapp" :value="form.whatsapp" class="form-control" :class="{ 'is-invalid': erros.whatsapp }" inputmode="tel" placeholder="(45) 99999-0000" autocomplete="off" @input="digitarWhatsApp" />
        <div class="invalid-feedback">{{ erros.whatsapp }}</div>
      </div>
      <div class="col-12 col-sm-6 col-lg-3">
        <label class="form-label" for="data-pedido">Data do pedido</label>
        <input id="data-pedido" v-model="form.dataPedido" type="date" class="form-control" :class="{ 'is-invalid': erros.dataPedido }" />
        <div class="invalid-feedback">{{ erros.dataPedido }}</div>
      </div>
      <div class="col-12 col-lg-2 d-flex align-items-end">
        <button type="button" class="btn btn-branco w-100 importar" @click="importarWhatsApp">Importar do WhatsApp</button>
      </div>
    </div>

    <div class="row g-3 mb-3">
      <div class="col-12 col-lg-4">
        <label class="form-label" for="produto">Produto</label>
        <select id="produto" v-model="form.produtoId" class="form-select" :class="{ 'is-invalid': erros.produtoId }" @change="aoTrocarProduto">
          <option :value="null" disabled>Selecione um produto</option>
          <option v-for="p in produtos" :key="p.id" :value="p.id">{{ p.nome }}</option>
        </select>
        <div class="invalid-feedback">{{ erros.produtoId }}</div>
      </div>
      <div class="col-6 col-lg-2">
        <label class="form-label" for="quantidade">Quantidade</label>
        <input id="quantidade" v-model.number="form.quantidade" type="number" min="1" step="1" class="form-control" :class="{ 'is-invalid': erros.quantidade }" @input="recalcularValor" />
        <div class="invalid-feedback">{{ erros.quantidade }}</div>
      </div>
      <div class="col-6 col-lg-2">
        <label class="form-label" for="peso">Peso</label>
        <div class="input-group has-validation">
          <input id="peso" v-model.number="form.peso" type="number" min="0" step="0.1" class="form-control" :class="{ 'is-invalid': erros.peso }" />
          <span class="input-group-text">kg</span>
          <div class="invalid-feedback">{{ erros.peso }}</div>
        </div>
      </div>
      <div class="col-12 col-lg-3">
        <label class="form-label" for="data-entrega">Data de entrega</label>
        <input id="data-entrega" v-model="form.dataEntrega" type="date" class="form-control" :class="{ 'is-invalid': erros.dataEntrega }" />
        <div class="invalid-feedback">{{ erros.dataEntrega }}</div>
      </div>
    </div>

    <div class="row g-3 mb-3">
      <div class="col-12 col-lg-11">
        <label class="form-label" for="descricao">Descrição / personalizações</label>
        <textarea id="descricao" v-model="form.descricao" class="form-control" rows="3" maxlength="500"></textarea>
      </div>
    </div>

    <div class="row g-3 align-items-end">
      <div class="col-6 col-lg-3">
        <label class="form-label" for="valor">Valor total</label>
        <CampoMoeda id="valor" v-model="form.valorTotal" :class="{ 'is-invalid': erros.valorTotal }" :readonly="!vendasApi.valorManual" :aria-describedby="vendasApi.valorManual ? null : 'valor-ajuda'" @input="valorManual = true" />
        <div class="invalid-feedback">{{ erros.valorTotal }}</div>
        <div v-if="!vendasApi.valorManual" id="valor-ajuda" class="form-text">Calculado pelo preço do catálogo.</div>
      </div>
      <div class="col-6 col-lg-3">
        <label class="form-label" for="status">Status do pagamento</label>
        <select id="status" v-model="form.statusPagamento" class="form-select">
          <option>Pendente</option>
          <option>Pago</option>
        </select>
      </div>
      <div v-if="analise" class="col-12 col-lg-5">
        <div class="disponibilidade" :class="analise.tipo" role="status">
          <i class="bi" :class="analise.icone" aria-hidden="true"></i>
          <span>{{ analise.mensagem }}</span>
        </div>
      </div>
    </div>

    <div class="d-flex justify-content-end gap-3 mt-4">
      <router-link class="btn btn-branco botao" :to="{ name: 'vendas' }">Cancelar</router-link>
      <button type="submit" class="btn btn-ambar botao" :disabled="analise?.tipo === 'falta'">Salvar venda</button>
    </div>
  </form>

  <ModalConfirmacao ref="modal" titulo="Confirme a venda" texto-confirmar="Confirmar venda" texto-cancelar="Voltar e editar" :ocupado="enviando" @confirmar="confirmar">
    <dl class="row mb-0 resumo">
      <dt class="col-5">Cliente</dt><dd class="col-7">{{ form.cliente }}</dd>
      <dt class="col-5">Produto</dt><dd class="col-7">{{ produtoSelecionado?.nome }} × {{ form.quantidade }}</dd>
      <dt class="col-5">Entrega</dt><dd class="col-7">{{ dataLonga(form.dataEntrega) }}</dd>
      <dt class="col-5">Pagamento</dt><dd class="col-7">{{ form.statusPagamento }}</dd>
      <dt class="col-5">Valor total</dt><dd class="col-7 fs-5 fw-bold">{{ moeda(form.valorTotal) }}</dd>
    </dl>
    <p v-if="vendasApi.baixaEstoque" class="texto-suave small mt-2 mb-0">Ao confirmar, os ingredientes da ficha técnica serão baixados do estoque.</p>
  </ModalConfirmacao>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CabecalhoPagina from '@/components/layout/CabecalhoPagina.vue'
import EstadoPagina from '@/components/comum/EstadoPagina.vue'
import CampoMoeda from '@/components/comum/CampoMoeda.vue'
import ModalConfirmacao from '@/components/comum/ModalConfirmacao.vue'
import catalogo from '@/services/catalogo'
import vendasApi from '@/services/vendas'
import { avisar } from '@/composables/avisos'
import { dataLonga, hojeISO, mascaraWhatsApp, moeda } from '@/utils/formatadores'

const rota = useRoute()
const router = useRouter()
const editando = computed(() => Boolean(rota.params.id))

const carregando = ref(true)
const erroCarga = ref('')
const erroEnvio = ref('')
const enviando = ref(false)
const produtos = ref([])
const original = ref(null)
const valorManual = ref(false)
const modal = ref(null)
const erros = reactive({})

const form = reactive({
  cliente: '',
  whatsapp: '',
  dataPedido: hojeISO(),
  produtoId: null,
  quantidade: 1,
  peso: null,
  dataEntrega: '',
  descricao: '',
  valorTotal: 0,
  statusPagamento: 'Pendente'
})

const produtoSelecionado = computed(() => produtos.value.find((p) => p.id === form.produtoId))

onMounted(async () => {
  try {
    const [lista, venda] = await Promise.all([
      catalogo.listarProdutos(),
      editando.value ? vendasApi.buscar(rota.params.id) : null
    ])
    produtos.value = lista
    if (venda) {
      original.value = venda
      valorManual.value = true
      Object.keys(form).forEach((campo) => { form[campo] = venda[campo] })
    } else if (rota.query.produto) {
      form.produtoId = Number(rota.query.produto)
      aoTrocarProduto()
    }
  } catch (falha) {
    erroCarga.value = falha.message
  } finally {
    carregando.value = false
  }
})

function digitarWhatsApp(evento) {
  form.whatsapp = mascaraWhatsApp(evento.target.value)
  evento.target.value = form.whatsapp
}

function recalcularValor() {
  if (!valorManual.value && produtoSelecionado.value) {
    form.valorTotal = produtoSelecionado.value.precoBase * (Number(form.quantidade) || 0)
  }
}

function aoTrocarProduto() {
  const produto = produtoSelecionado.value
  if (!produto) return
  form.peso = produto.peso
  valorManual.value = false
  recalcularValor()
}

// UC07, extensão 1a: sem integração, o fluxo continua com o cadastro manual.
function importarWhatsApp() {
  avisar.info('A integração com o WhatsApp não está disponível. Preencha o pedido manualmente.')
  document.getElementById('cliente').focus()
}

const analise = computed(() => {
  const produto = produtoSelecionado.value
  if (!produto) return null
  if (!produto.fichaTecnica?.length) {
    return { tipo: 'falta', icone: 'bi-x-circle', mensagem: 'Produto sem ficha técnica completa.' }
  }

  const quantidade = Number(form.quantidade) || 0
  const anterior = original.value?.produtoId === produto.id ? original.value.quantidade : 0
  const faltantes = produto.fichaTecnica.filter(
    (item) => item.quantidade * quantidade > item.saldoDisponivel + item.quantidade * anterior + 1e-9
  )
  if (faltantes.length) {
    return {
      tipo: 'falta',
      icone: 'bi-x-circle',
      mensagem: `Estoque insuficiente: ${faltantes.map((f) => f.ingrediente).join(', ')}.`
    }
  }

  const criticos = produto.fichaTecnica.filter((item) => item.status === 'CRITICO')
  if (criticos.length) {
    return {
      tipo: 'critico',
      icone: 'bi-exclamation-triangle',
      mensagem: `Disponível, mas em nível crítico: ${criticos.map((c) => c.ingrediente).join(', ')}.`
    }
  }
  return { tipo: 'ok', icone: 'bi-check-lg', mensagem: 'Ingredientes disponíveis para produção' }
})

function validar() {
  Object.keys(erros).forEach((chave) => delete erros[chave])
  if (!form.cliente.trim()) erros.cliente = 'Informe o nome do cliente.'
  if (form.whatsapp.replace(/\D/g, '').length < 10) erros.whatsapp = 'Informe um WhatsApp com DDD.'
  if (!form.dataPedido) erros.dataPedido = 'Informe a data do pedido.'
  if (!form.produtoId) erros.produtoId = 'Selecione um produto.'
  if (!Number.isInteger(form.quantidade) || form.quantidade < 1) erros.quantidade = 'Use um número inteiro a partir de 1.'
  if (!(form.peso > 0)) erros.peso = 'Informe um peso válido.'
  if (!form.dataEntrega) erros.dataEntrega = 'Informe a data de entrega.'
  else if (form.dataPedido && form.dataEntrega < form.dataPedido) erros.dataEntrega = 'A entrega não pode ser antes do pedido.'
  if (!(form.valorTotal > 0)) erros.valorTotal = 'Informe o valor da venda.'
  return Object.keys(erros).length === 0
}

async function revisar() {
  erroEnvio.value = ''
  if (!validar()) {
    await nextTick()
    document.querySelector('form .is-invalid')?.focus()
    return
  }
  modal.value.abrir()
}

async function confirmar() {
  const dados = { ...form, cliente: form.cliente.trim(), descricao: form.descricao.trim() }
  enviando.value = true
  try {
    const salva = editando.value
      ? await vendasApi.atualizar(rota.params.id, dados)
      : await vendasApi.criar(dados)
    await modal.value.fechar()
    avisar.sucesso(editando.value ? `Pedido #${salva.id} atualizado.` : `Venda #${salva.id} registrada com sucesso.`)
    if (salva.alertasEstoque?.length) {
      avisar.alerta(`Estoque crítico. ${salva.alertasEstoque.join('; ')}.`)
    }
    router.push({ name: 'vendas' })
  } catch (falha) {
    await modal.value.fechar()
    erroEnvio.value = falha.message
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } finally {
    enviando.value = false
  }
}
</script>

<style scoped>
.importar {
  font-size: 0.92rem;
  line-height: 1.15;
  min-height: 54px;
  padding: 0.3rem 0.5rem;
}

.disponibilidade {
  align-items: center;
  border: 1.5px solid;
  border-radius: 18px;
  display: flex;
  font-weight: 600;
  gap: 0.5rem;
  min-height: 54px;
  padding: 0.75rem 1.1rem;
}

.disponibilidade.ok {
  background: var(--sbc-verde-claro);
  border-color: var(--sbc-verde);
  color: #24704a;
}

.disponibilidade.critico {
  background: var(--sbc-creme);
  border-color: var(--sbc-ambar);
  color: #8a5a00;
}

.disponibilidade.falta {
  background: var(--sbc-vermelho-claro);
  border-color: var(--sbc-vermelho);
  color: #a33024;
}

.botao {
  min-width: 150px;
  padding-bottom: 0.95rem;
  padding-top: 0.95rem;
}

.resumo dt {
  color: var(--sbc-texto-suave);
}

.resumo dd {
  margin-bottom: 0.5rem;
}
</style>
