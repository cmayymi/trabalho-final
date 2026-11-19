<template>
  <CabecalhoPagina titulo="Relatório de vendas" subtitulo="Analise o desempenho comercial" />

  <section class="d-flex flex-wrap gap-3 mb-3 nao-imprimir" aria-label="Período e exportação">
    <div class="d-flex flex-wrap gap-3" role="group" aria-label="Modalidade do período">
      <button v-for="opcao in MODALIDADES" :key="opcao.valor" type="button" class="btn btn-branco" :class="{ ativo: modalidade === opcao.valor }" :aria-pressed="modalidade === opcao.valor" @click="escolherModalidade(opcao.valor)">
        {{ opcao.texto }}
      </button>
    </div>

    <div class="d-flex flex-wrap gap-3 ms-lg-auto">
      <button type="button" class="btn btn-branco" :disabled="estado !== 'ok'" @click="modal.abrir()">Exportar PDF</button>
      <div class="dropdown">
        <button type="button" class="btn btn-ambar dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" :disabled="estado !== 'ok'">Exportar</button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><button class="dropdown-item" type="button" @click="exportarCsv"><i class="bi bi-filetype-csv me-2" aria-hidden="true"></i>Planilha (CSV)</button></li>
          <li><button class="dropdown-item" type="button" @click="imprimir"><i class="bi bi-printer me-2" aria-hidden="true"></i>Imprimir</button></li>
        </ul>
      </div>
    </div>
  </section>

  <section class="row g-3 align-items-end mb-4 nao-imprimir" aria-label="Seleção do período">
    <div v-if="modalidade === 'mensal'" class="col-12 col-sm-6 col-lg-3">
      <label class="form-label" for="mes">Mês</label>
      <input id="mes" v-model="filtros.mes" type="month" class="form-control" />
    </div>
    <div v-if="modalidade === 'semestral'" class="col-6 col-lg-3">
      <label class="form-label" for="semestre">Semestre</label>
      <select id="semestre" v-model.number="filtros.semestre" class="form-select">
        <option :value="1">1º semestre</option>
        <option :value="2">2º semestre</option>
      </select>
    </div>
    <div v-if="modalidade === 'semestral' || modalidade === 'anual'" class="col-6 col-lg-2">
      <label class="form-label" for="ano">Ano</label>
      <select id="ano" v-model.number="filtros.ano" class="form-select">
        <option v-for="ano in ANOS" :key="ano" :value="ano">{{ ano }}</option>
      </select>
    </div>
    <template v-if="modalidade === 'personalizado'">
      <div class="col-6 col-lg-3">
        <label class="form-label" for="inicio">Início</label>
        <input id="inicio" v-model="filtros.inicio" type="date" class="form-control" />
      </div>
      <div class="col-6 col-lg-3">
        <label class="form-label" for="fim">Fim</label>
        <input id="fim" v-model="filtros.fim" type="date" class="form-control" />
      </div>
      <div class="col-12 col-lg-auto">
        <button type="button" class="btn btn-ambar w-100 aplicar" @click="consultar">Aplicar</button>
      </div>
    </template>
  </section>

  <p class="d-none d-print-block mb-3"><strong>Período:</strong> {{ periodo.rotulo }}</p>

  <EstadoPagina v-if="estado === 'carregando'" tipo="carregando" titulo="Consultando as vendas…" />
  <EstadoPagina v-else-if="estado === 'aguardando'" icone="bi-calendar-range" titulo="Escolha o intervalo" texto="Informe as datas de início e fim e clique em Aplicar." />
  <EstadoPagina v-else-if="estado === 'invalido'" tipo="erro" icone="bi-calendar-x" titulo="Período inválido" :texto="periodo.erro" />
  <EstadoPagina v-else-if="estado === 'vazio'" icone="bi-inbox" titulo="Nenhuma venda encontrada" :texto="`Não existem vendas registradas em ${periodo.rotulo}.`" />
  <EstadoPagina v-else-if="estado === 'erro'" tipo="erro" icone="bi-cloud-slash" titulo="Não foi possível gerar o relatório" :texto="mensagemErro">
    <button class="btn btn-branco" type="button" @click="consultar">Tentar novamente</button>
  </EstadoPagina>

  <template v-else>
    <section class="row g-3 mb-4" aria-label="Resumo do período">
      <div v-for="item in resumo" :key="item.rotulo" class="col-6 col-xl-3">
        <div class="cartao-numero">
          <div class="rotulo">{{ item.rotulo }}</div>
          <div class="valor">{{ item.valor }}</div>
          <div class="detalhe">{{ item.detalhe }}</div>
        </div>
      </div>
    </section>

    <div class="table-responsive">
      <table class="table tabela-sbc">
        <caption class="visually-hidden">Vendas de {{ periodo.rotulo }}</caption>
        <thead>
          <tr>
            <th scope="col">Cliente</th><th scope="col">Item</th><th scope="col">Data</th>
            <th scope="col">Venda</th><th scope="col">Custo</th><th scope="col">Lucro</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="linha in linhasVisiveis" :key="linha.pedido">
            <td>{{ linha.cliente }}</td>
            <td>{{ linha.item }}</td>
            <td class="num">{{ dataCurta(linha.data) }}</td>
            <td class="num">{{ moedaCurta(linha.venda) }}</td>
            <td class="num">{{ moedaCurta(linha.custo) }}</td>
            <td class="num">{{ moedaCurta(linha.lucro) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3">Total do período</td>
            <td class="num">{{ moedaCurta(totais.venda) }}</td>
            <td class="num">{{ moedaCurta(totais.custo) }}</td>
            <td class="num">{{ moedaCurta(totais.lucro) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
    <PaginacaoTabela v-model="numeroPagina" :total-paginas="totalPaginas" />
  </template>

  <ModalConfirmacao ref="modal" titulo="Gerar relatório em PDF?" texto-confirmar="Gerar PDF" :ocupado="gerando" @confirmar="gerarPdf">
    <dl class="row mb-0 resumo-modal">
      <dt class="col-6">Período</dt><dd class="col-6">{{ periodo.rotulo }}</dd>
      <dt class="col-6">Vendas encontradas</dt><dd class="col-6">{{ totais.quantidade }}</dd>
      <dt class="col-6">Faturamento</dt><dd class="col-6">{{ moeda(totais.venda) }}</dd>
      <dt class="col-6">Custo</dt><dd class="col-6">{{ moeda(totais.custo) }}</dd>
      <dt class="col-6">Lucro</dt><dd class="col-6 fw-bold">{{ moeda(totais.lucro) }}</dd>
    </dl>
  </ModalConfirmacao>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import CabecalhoPagina from '@/components/layout/CabecalhoPagina.vue'
import EstadoPagina from '@/components/comum/EstadoPagina.vue'
import ModalConfirmacao from '@/components/comum/ModalConfirmacao.vue'
import PaginacaoTabela from '@/components/comum/PaginacaoTabela.vue'
import relatorios from '@/services/relatorios'
import { avisar } from '@/composables/avisos'
import { dataCurta, dataLonga, hojeISO, moeda, moedaCurta } from '@/utils/formatadores'
import { exportarCsvVendas, gerarPdfVendas } from '@/utils/exportacao'

const MODALIDADES = [
  { valor: 'mensal', texto: 'Mensal' },
  { valor: 'semestral', texto: 'Semestral' },
  { valor: 'anual', texto: 'Anual' },
  { valor: 'personalizado', texto: 'Personalizado' }
]
const POR_PAGINA = 15
const agora = new Date()
const ANOS = Array.from({ length: 5 }, (_, i) => agora.getFullYear() - i)

const modalidade = ref('mensal')
const filtros = reactive({
  mes: hojeISO().slice(0, 7),
  semestre: agora.getMonth() < 6 ? 1 : 2,
  ano: agora.getFullYear(),
  inicio: '',
  fim: ''
})

const estado = ref('carregando')
const mensagemErro = ref('')
const linhas = ref([])
const numeroPagina = ref(1)
const modal = ref(null)
const gerando = ref(false)
let consultaAtual = 0

const periodo = computed(() => {
  if (modalidade.value === 'mensal') {
    if (!filtros.mes) return { erro: 'Escolha o mês do relatório.', rotulo: '' }
    const [ano, mes] = filtros.mes.split('-').map(Number)
    const ultimoDia = new Date(ano, mes, 0).getDate()
    return { inicio: `${filtros.mes}-01`, fim: `${filtros.mes}-${ultimoDia}`, rotulo: `${String(mes).padStart(2, '0')}/${ano}` }
  }
  if (modalidade.value === 'semestral') {
    const primeiro = filtros.semestre === 1
    return {
      inicio: `${filtros.ano}-${primeiro ? '01-01' : '07-01'}`,
      fim: `${filtros.ano}-${primeiro ? '06-30' : '12-31'}`,
      rotulo: `${filtros.semestre}º semestre de ${filtros.ano}`
    }
  }
  if (modalidade.value === 'anual') {
    return { inicio: `${filtros.ano}-01-01`, fim: `${filtros.ano}-12-31`, rotulo: String(filtros.ano) }
  }
  if (!filtros.inicio || !filtros.fim) return { erro: 'Informe as datas de início e fim.', rotulo: '' }
  if (filtros.inicio > filtros.fim) return { erro: 'A data de início não pode ser depois da data de fim.', rotulo: '' }
  return {
    inicio: filtros.inicio,
    fim: filtros.fim,
    rotulo: `${dataLonga(filtros.inicio)} a ${dataLonga(filtros.fim)}`
  }
})

async function consultar() {
  numeroPagina.value = 1
  if (periodo.value.erro) {
    estado.value = 'invalido'
    return
  }

  const numero = ++consultaAtual
  estado.value = 'carregando'
  try {
    const resposta = await relatorios.vendas(periodo.value.inicio, periodo.value.fim)
    if (numero !== consultaAtual) return // Uma consulta mais nova já assumiu a tela.
    linhas.value = resposta.linhas
    estado.value = resposta.linhas.length ? 'ok' : 'vazio'
  } catch (falha) {
    if (numero !== consultaAtual) return
    mensagemErro.value = falha.message
    estado.value = 'erro'
  }
}

function escolherModalidade(valor) {
  modalidade.value = valor
  if (valor === 'personalizado') {
    consultaAtual++
    estado.value = 'aguardando'
  } else {
    consultar()
  }
}

watch(() => [filtros.mes, filtros.semestre, filtros.ano], () => {
  if (modalidade.value !== 'personalizado') consultar()
})

onMounted(consultar)

const totais = computed(() => {
  const soma = (campo) => linhas.value.reduce((total, l) => total + l[campo], 0)
  const venda = soma('venda')
  const lucro = soma('lucro')
  return {
    quantidade: linhas.value.length,
    venda,
    custo: soma('custo'),
    lucro,
    margem: venda ? (lucro / venda) * 100 : 0
  }
})

const resumo = computed(() => [
  { rotulo: 'Vendas', valor: totais.value.quantidade, detalhe: periodo.value.rotulo },
  { rotulo: 'Faturamento', valor: moedaCurta(totais.value.venda), detalhe: 'Soma das vendas' },
  { rotulo: 'Custo', valor: moedaCurta(totais.value.custo), detalhe: 'Soma dos insumos' },
  {
    rotulo: 'Lucro',
    valor: moedaCurta(totais.value.lucro),
    detalhe: `Margem de ${totais.value.margem.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
  }
])

const totalPaginas = computed(() => Math.max(1, Math.ceil(linhas.value.length / POR_PAGINA)))
const imprimindo = ref(false) // Na impressão entram todas as linhas, não só a página atual.
const linhasVisiveis = computed(() =>
  imprimindo.value
    ? linhas.value
    : linhas.value.slice((numeroPagina.value - 1) * POR_PAGINA, numeroPagina.value * POR_PAGINA)
)

async function gerarPdf() {
  gerando.value = true
  try {
    await gerarPdfVendas({ linhas: linhas.value, totais: totais.value, periodo: periodo.value })
    await modal.value.fechar()
    avisar.sucesso('Relatório gerado com sucesso. O PDF foi baixado.')
  } catch {
    await modal.value.fechar()
    avisar.erro('Não foi possível gerar o PDF. O relatório continua disponível na tela.')
  } finally {
    gerando.value = false
  }
}

function exportarCsv() {
  try {
    exportarCsvVendas({ linhas: linhas.value, periodo: periodo.value })
    avisar.sucesso('Planilha exportada com sucesso.')
  } catch {
    avisar.erro('Não foi possível exportar a planilha.')
  }
}

function imprimir() {
  window.addEventListener('afterprint', () => { imprimindo.value = false }, { once: true })
  imprimindo.value = true
  setTimeout(() => window.print(), 50)
}
</script>

<style scoped>
.aplicar {
  min-height: 54px;
}

.resumo-modal dt {
  color: var(--sbc-texto-suave);
}

.resumo-modal dd {
  margin-bottom: 0.45rem;
}
</style>
