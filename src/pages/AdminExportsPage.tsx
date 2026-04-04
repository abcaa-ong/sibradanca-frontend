import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import {
  downloadAdminStatisticsCsv,
  downloadAdminStatisticsPdf,
  downloadAdminStatisticsXlsx,
  downloadAdminSubmissionsCsv,
  downloadAdminSubmissionsDetailedCsv,
  downloadAdminSubmissionsDetailedPdf,
  downloadAdminSubmissionsDetailedXlsx,
  downloadAdminSubmissionsXlsx,
} from '../services/admin.service'

type DownloadAction = () => Promise<{ blob: Blob; filename: string | null }>

const exportGroups = [
  {
    title: 'Leitura completa da equipe',
    description:
      'Arquivos para ver o cadastro inteiro, revisar respostas e entender cada formulario com profundidade.',
    items: [
      {
        name: 'Fichas por protocolo',
        format: 'PDF',
        purpose: 'Leitura completa de cada cadastro, com respostas separadas por formulario e etapa.',
        actionLabel: 'Baixar PDF',
        action: downloadAdminSubmissionsDetailedPdf,
      },
      {
        name: 'Base completa da equipe',
        format: 'XLSX',
        purpose: 'Abas com visao geral, cadastros e respostas organizadas por tema.',
        actionLabel: 'Baixar Excel',
        action: downloadAdminSubmissionsDetailedXlsx,
      },
      {
        name: 'Base completa em CSV',
        format: 'CSV',
        purpose: 'Linhas por cadastro, etapa, campo e resposta para estudos e cruzamentos.',
        actionLabel: 'Baixar CSV',
        action: downloadAdminSubmissionsDetailedCsv,
      },
    ],
  },
  {
    title: 'Operacao do dia a dia',
    description:
      'Arquivos mais diretos para conferencia, acompanhamento de protocolos e rotina da equipe.',
    items: [
      {
        name: 'Cadastros do dia a dia',
        format: 'XLSX',
        purpose: 'Consulta rapida por protocolo e situacao do cadastro.',
        actionLabel: 'Baixar Excel',
        action: downloadAdminSubmissionsXlsx,
      },
      {
        name: 'Cadastros do dia a dia',
        format: 'CSV',
        purpose: 'Conferencia operacional e revisoes pontuais da base.',
        actionLabel: 'Baixar CSV',
        action: downloadAdminSubmissionsCsv,
      },
    ],
  },
  {
    title: 'Analises, relatorios e apresentacoes',
    description:
      'Recortes que ajudam a ONG a montar dashboards, Power BI, reunioes, materiais externos e articulacoes.',
    items: [
      {
        name: 'Relatorio geral da base',
        format: 'PDF',
        purpose: 'Resumo visual com os principais recortes da base para reunioes e apresentacoes.',
        actionLabel: 'Baixar PDF',
        action: downloadAdminStatisticsPdf,
      },
      {
        name: 'Indicadores da base',
        format: 'XLSX',
        purpose: 'Planilha com abas por tema para relatorios, planilhas e Power BI.',
        actionLabel: 'Baixar Excel',
        action: downloadAdminStatisticsXlsx,
      },
      {
        name: 'Indicadores em CSV',
        format: 'CSV',
        purpose: 'Recortes gerais para cruzamentos, dashboards e materiais preparados pela ONG.',
        actionLabel: 'Baixar CSV',
        action: downloadAdminStatisticsCsv,
      },
    ],
  },
] as const

const deliveryGuide = [
  {
    file: 'Fichas por protocolo',
    content: 'Mostram o cadastro inteiro, com respostas separadas por etapa do formulario.',
    use: 'Revisao detalhada, atendimento, validacao e leitura institucional.',
    sharing: 'Nao saem para fora da ONG.',
  },
  {
    file: 'Base completa da equipe',
    content: 'Reune a leitura total da base, com abas e recortes por tema.',
    use: 'Estudos internos, cruzamentos, planejamento e construcao de indicadores.',
    sharing: 'Sai apenas em recortes preparados pela ONG.',
  },
  {
    file: 'Cadastros do dia a dia',
    content: 'Mostram consulta rapida por protocolo, perfil e situacao.',
    use: 'Rotina da equipe e acompanhamento operacional.',
    sharing: 'Uso interno da equipe.',
  },
  {
    file: 'Relatorio geral da base',
    content: 'Apresenta a leitura visual dos principais numeros e recortes.',
    use: 'Reunioes, diretorias, eventos e alinhamentos institucionais.',
    sharing: 'Pode ser apresentado sem dados pessoais.',
  },
  {
    file: 'Indicadores para Power BI e dashboards',
    content: 'Levam recortes por tema, territorio, perfil e leitura consolidada da base.',
    use: 'Power BI, dashboards e aprofundamento analitico.',
    sharing: 'Pode sair em materiais sem dados pessoais.',
  },
] as const

const exportRules = [
  ['Uso interno da equipe', 'Fichas completas, base detalhada, consulta nominal e revisao por protocolo.'],
  ['Uso institucional', 'Relatorios, graficos e recortes preparados pela ONG para reunioes e apresentacoes.'],
  ['Uso com parceiros', 'Somente materiais selecionados e enviados pela ONG, sem abrir o sistema para terceiros.'],
  ['Dados pessoais', 'Permanecem no ambiente interno e nao aparecem em materiais publicos ou compartilhados.'],
] as const

const handoffFlow = [
  {
    title: 'Ler a base',
    text: 'A equipe consulta o painel interno, entende o recorte e decide qual material precisa sair.',
  },
  {
    title: 'Escolher o arquivo',
    text: 'A ONG define se precisa de ficha, planilha, CSV ou relatorio visual, conforme a finalidade.',
  },
  {
    title: 'Preparar o material',
    text: 'Os arquivos sao revisados antes de seguirem para reunioes, estudos, dashboards ou apresentacoes.',
  },
  {
    title: 'Compartilhar com seguranca',
    text: 'A ONG envia apenas o recorte adequado, sem abrir a area interna para parceiros ou terceiros.',
  },
] as const

function triggerDownload(blob: Blob, filename: string | null) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename ?? 'arquivo'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export default function AdminExportsPage() {
  const [downloadError, setDownloadError] = useState('')

  async function handleDownload(action: DownloadAction) {
    setDownloadError('')

    try {
      const file = await action()
      triggerDownload(file.blob, file.filename)
    } catch (downloadActionError) {
      setDownloadError(
        downloadActionError instanceof Error
          ? downloadActionError.message
          : 'Nao foi possivel gerar o arquivo solicitado.',
      )
    }
  }

  return (
    <div className="admin-page-content">
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Exportacoes</p>
          <h2>Arquivos que saem do Banco Nacional da Danca</h2>
          <p className="admin-page-subtitle">
            Aqui a ONG transforma a base em leitura institucional, planilhas, dashboards, Power BI,
            relatorios e materiais preparados para apresentacoes e parceiros.
          </p>
        </div>
      </header>

      {downloadError ? <Card className="admin-alert admin-alert-error">{downloadError}</Card> : null}

      <section className="admin-section-stack">
        {exportGroups.map((group) => (
          <Card key={group.title} className="admin-panel-card">
            <div className="admin-panel-header">
              <div>
                <p className="eyebrow">Download</p>
                <h2>{group.title}</h2>
                <p className="admin-section-text">{group.description}</p>
              </div>
            </div>

            <div className="admin-export-grid">
              {group.items.map((item) => (
                <div key={`${group.title}-${item.name}`} className="admin-export-card">
                  <div>
                    <p className="admin-export-audience">{item.format}</p>
                    <h3>{item.name}</h3>
                    <p>{item.purpose}</p>
                  </div>

                  <Button onClick={() => void handleDownload(item.action)}>
                    <Download size={16} /> {item.actionLabel}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </section>

      <section className="admin-section-grid">
        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Leitura dos arquivos</p>
              <h2>O que a equipe encontra em cada saida</h2>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Arquivo</th>
                  <th>O que entrega</th>
                  <th>Quando usar</th>
                  <th>Compartilhamento</th>
                </tr>
              </thead>
              <tbody>
                {deliveryGuide.map((item) => (
                  <tr key={item.file}>
                    <td>{item.file}</td>
                    <td>{item.content}</td>
                    <td>{item.use}</td>
                    <td>{item.sharing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Regras de saida</p>
              <h2>Como cada material deve sair da base</h2>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Situacao</th>
                  <th>Diretriz</th>
                </tr>
              </thead>
              <tbody>
                {exportRules.map(([situation, rule]) => (
                  <tr key={situation}>
                    <td>{situation}</td>
                    <td>{rule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section className="admin-section-grid">
        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Fluxo recomendado</p>
              <h2>Da leitura da base ate o envio</h2>
            </div>
          </div>

          <div className="admin-governance-grid">
            {handoffFlow.map((item) => (
              <div key={item.title} className="admin-governance-card">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Uso institucional</p>
              <h2>Como a ONG leva essa base para fora</h2>
            </div>
          </div>

          <div className="admin-governance-grid">
            <div className="admin-governance-card">
              <h3>Apresentacoes e reunioes</h3>
              <p>Relatorios em PDF e indicadores gerais ajudam a mostrar o retrato nacional da danca.</p>
            </div>
            <div className="admin-governance-card">
              <h3>Planilhas e Power BI</h3>
              <p>Excel e CSV levam a base organizada para dashboards, cruzamentos e aprofundamento analitico.</p>
            </div>
            <div className="admin-governance-card">
              <h3>Parceiros externos</h3>
              <p>Ministerio, Funarte e outras instituicoes recebem somente recortes preparados pela ONG.</p>
            </div>
            <div className="admin-governance-card">
              <h3>Dados pessoais</h3>
              <p>Informacoes nominais continuam protegidas no ambiente interno e nao acompanham materiais publicos.</p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  )
}
