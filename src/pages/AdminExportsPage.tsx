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
      'Arquivos para ver o cadastro inteiro, revisar respostas e entender cada formulário com profundidade.',
    items: [
      {
        name: 'Fichas por protocolo',
        format: 'PDF',
        purpose: 'Leitura completa de cada cadastro, com respostas separadas por formulário e etapa.',
        actionLabel: 'Baixar PDF',
        action: downloadAdminSubmissionsDetailedPdf,
      },
      {
        name: 'Base completa da equipe',
        format: 'XLSX',
        purpose: 'Abas com visão geral, cadastros e respostas organizadas por tema.',
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
    title: 'Operação do dia a dia',
    description:
      'Arquivos mais diretos para conferência, acompanhamento de protocolos e rotina da equipe.',
    items: [
      {
        name: 'Cadastros do dia a dia',
        format: 'XLSX',
        purpose: 'Consulta rápida por protocolo e situação do cadastro.',
        actionLabel: 'Baixar Excel',
        action: downloadAdminSubmissionsXlsx,
      },
      {
        name: 'Cadastros do dia a dia',
        format: 'CSV',
        purpose: 'Conferência operacional e revisões pontuais da base.',
        actionLabel: 'Baixar CSV',
        action: downloadAdminSubmissionsCsv,
      },
    ],
  },
  {
    title: 'Análises, relatórios e apresentações',
    description:
      'Recortes que ajudam a ONG a montar dashboards, Power BI, reuniões, materiais externos e articulações.',
    items: [
      {
        name: 'Relatório geral da base',
        format: 'PDF',
        purpose: 'Resumo visual com os principais recortes da base para reuniões e apresentações.',
        actionLabel: 'Baixar PDF',
        action: downloadAdminStatisticsPdf,
      },
      {
        name: 'Indicadores da base',
        format: 'XLSX',
        purpose: 'Planilha com abas por tema para relatórios, planilhas e Power BI.',
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
    content: 'Mostram o cadastro inteiro, com respostas separadas por etapa do formulário.',
    use: 'Revisão detalhada, atendimento, validação e leitura institucional.',
    sharing: 'Não saem para fora da ONG.',
  },
  {
    file: 'Base completa da equipe',
    content: 'Reúne a leitura total da base, com abas e recortes por tema.',
    use: 'Estudos internos, cruzamentos, planejamento e construção de indicadores.',
    sharing: 'Sai apenas em recortes preparados pela ONG.',
  },
  {
    file: 'Cadastros do dia a dia',
    content: 'Mostram consulta rápida por protocolo, perfil e situação.',
    use: 'Rotina da equipe e acompanhamento operacional.',
    sharing: 'Uso interno da equipe.',
  },
  {
    file: 'Relatório geral da base',
    content: 'Apresenta a leitura visual dos principais números e recortes.',
    use: 'Reuniões, diretorias, eventos e alinhamentos institucionais.',
    sharing: 'Pode ser apresentado sem dados pessoais.',
  },
  {
    file: 'Indicadores para Power BI e dashboards',
    content: 'Levam recortes por tema, território, perfil e leitura consolidada da base.',
    use: 'Power BI, dashboards e aprofundamento analítico.',
    sharing: 'Pode sair em materiais sem dados pessoais.',
  },
] as const

const exportRules = [
  ['Uso interno da equipe', 'Fichas completas, base detalhada, consulta nominal e revisão por protocolo.'],
  ['Uso institucional', 'Relatórios, gráficos e recortes preparados pela ONG para reuniões e apresentações.'],
  ['Uso com parceiros', 'Somente materiais selecionados e enviados pela ONG, sem abrir o sistema para terceiros.'],
  ['Dados pessoais', 'Permanecem no ambiente interno e não aparecem em materiais públicos ou compartilhados.'],
] as const

const handoffFlow = [
  {
    title: 'Ler a base',
    text: 'A equipe consulta o painel interno, entende o recorte e decide qual material precisa sair.',
  },
  {
    title: 'Escolher o arquivo',
    text: 'A ONG define se precisa de ficha, planilha, CSV ou relatório visual, conforme a finalidade.',
  },
  {
    title: 'Preparar o material',
    text: 'Os arquivos são revisados antes de seguirem para reuniões, estudos, dashboards ou apresentações.',
  },
  {
    title: 'Compartilhar com segurança',
    text: 'A ONG envia apenas o recorte adequado, sem abrir a área interna para parceiros ou terceiros.',
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
          : 'Não foi possível gerar o arquivo solicitado.',
      )
    }
  }

  return (
    <div className="admin-page-content">
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Exportações</p>
          <h2>Arquivos que saem do Banco Nacional da Dança</h2>
          <p className="admin-page-subtitle">
            Aqui a ONG transforma a base em leitura institucional, planilhas, dashboards, Power BI,
            relatórios e materiais preparados para apresentações e parceiros.
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
              <h2>O que a equipe encontra em cada saída</h2>
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
              <p className="eyebrow">Regras de saída</p>
              <h2>Como cada material deve sair da base</h2>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Situação</th>
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
              <h2>Da leitura da base até o envio</h2>
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
              <h3>Apresentações e reuniões</h3>
              <p>Relatórios em PDF e indicadores gerais ajudam a mostrar o retrato nacional da dança.</p>
            </div>
            <div className="admin-governance-card">
              <h3>Planilhas e Power BI</h3>
              <p>Excel e CSV levam a base organizada para dashboards, cruzamentos e aprofundamento analítico.</p>
            </div>
            <div className="admin-governance-card">
              <h3>Parceiros externos</h3>
              <p>Ministério, Funarte e outras instituições recebem somente recortes preparados pela ONG.</p>
            </div>
            <div className="admin-governance-card">
              <h3>Dados pessoais</h3>
              <p>Informações nominais continuam protegidas no ambiente interno e não acompanham materiais públicos.</p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  )
}
