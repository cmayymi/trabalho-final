// UC05 - Imprimir/Exportar Relatório. As bibliotecas de PDF são carregadas só
// quando usadas: o Webpack as separa em um arquivo próprio (code splitting).
import logoUrl from '@/assets/img/logo-claro.png'
import { dataLonga, moeda } from './formatadores'

async function carregarLogo() {
  try {
    const blob = await (await fetch(logoUrl)).blob()
    return await new Promise((resolve, reject) => {
      const leitor = new FileReader()
      leitor.onload = () => resolve(leitor.result)
      leitor.onerror = reject
      leitor.readAsDataURL(blob)
    })
  } catch {
    return null // O relatório continua válido sem o logo.
  }
}

export async function gerarPdfVendas({ linhas, totais, periodo }) {
  const [{ jsPDF }, { default: autoTable }, logo] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
    carregarLogo()
  ])

  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
  const margem = 14
  if (logo) doc.addImage(logo, 'PNG', margem, 8, 36, 23, undefined, 'FAST')

  doc.setFont('helvetica', 'bold').setFontSize(18).setTextColor(31, 31, 28)
  doc.text('Relatório de vendas', 196, 18, { align: 'right' })
  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(102, 102, 96)
  doc.text(`Período: ${periodo.rotulo}`, 196, 24, { align: 'right' })
  doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, 196, 29, { align: 'right' })

  autoTable(doc, {
    startY: 36,
    margin: { left: margem, right: margem },
    head: [['Vendas', 'Faturamento', 'Custo', 'Lucro', 'Margem']],
    body: [[
      String(totais.quantidade),
      moeda(totais.venda),
      moeda(totais.custo),
      moeda(totais.lucro),
      `${totais.margem.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
    ]],
    styles: { halign: 'center', fontSize: 11 },
    headStyles: { fillColor: [31, 31, 28], textColor: 255 },
    theme: 'grid'
  })

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 6,
    margin: { left: margem, right: margem },
    head: [['Cliente', 'Item', 'Data', ...['Venda', 'Custo', 'Lucro'].map((content) => ({ content, styles: { halign: 'right' } }))]],
    body: linhas.map((l) => [
      l.cliente, l.item, dataLonga(l.data), moeda(l.venda), moeda(l.custo), moeda(l.lucro)
    ]),
    foot: [['Total', '', '', moeda(totais.venda), moeda(totais.custo), moeda(totais.lucro)]],
    showFoot: 'lastPage',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [245, 169, 16], textColor: [31, 31, 28] },
    footStyles: { fillColor: [255, 246, 223], textColor: [31, 31, 28] },
    columnStyles: {
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' }
    },
    theme: 'grid'
  })

  const paginas = doc.getNumberOfPages()
  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i)
    doc.setFontSize(8).setTextColor(102, 102, 96)
    doc.text(`Betina Cozinha — página ${i} de ${paginas}`, 105, 290, { align: 'center' })
  }

  doc.save(`relatorio-vendas-${periodo.inicio}-a-${periodo.fim}.pdf`)
}

// Evita que um nome iniciado por "=" seja executado como fórmula na planilha.
function celula(valor) {
  const texto = String(valor ?? '').replace(/"/g, '""')
  return /^[=+\-@]/.test(texto) ? `"'${texto}"` : `"${texto}"`
}

export function exportarCsvVendas({ linhas, periodo }) {
  const decimal = (v) => Number(v).toFixed(2).replace('.', ',')
  const conteudo = [
    ['Cliente', 'Item', 'Data', 'Venda', 'Custo', 'Lucro'].join(';'),
    ...linhas.map((l) =>
      [celula(l.cliente), celula(l.item), dataLonga(l.data), decimal(l.venda), decimal(l.custo), decimal(l.lucro)].join(';')
    )
  ].join('\r\n')

  const blob = new Blob(['﻿' + conteudo], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `relatorio-vendas-${periodo.inicio}-a-${periodo.fim}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
