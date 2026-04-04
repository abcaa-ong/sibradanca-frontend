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
    title: 'Base interna da ONG',
    description: 'Arquivos completos para consulta, conferência, leitura e trabalho do dia a dia da equipe.',
    items: [
      {
        name: 'Fichas por protocolo',
        format: 'PDF',
        purpose: 'Leitura completa de cada cadastro, com respostas organizadas por formulário.',
        actionLabel: 'Baixar PDF',
        action: downloadAdminSubmissionsDetailedPdf,
      },
      {
        name: 'Base detalhada da equipe',
        format: 'XLSX',
        purpose: 'Abas com visão geral, cadastros e respostas organizadas por tema.',
        actionLabel: 'Baixar Excel',
        action: downloadAdminSubmissionsDetailedXlsx,
      },
      {
        name: 'Base resumida de cadastros',
        format: 'XLSX',
        purpose: 'Consulta rápida por protocolo para acompanhamento do dia a dia.',
        actionLabel: 'Baixar Excel',
        action: downloadAdminSubmissionsXlsx,
      },
      {
        name: 'Base detalhada em CSV',
        format: 'CSV',
        purpose: 'Linhas por cadastro, etapa, campo e resposta para cruzamentos internos.',
        actionLabel: 'Baixar CSV',
        action: downloadAdminSubmissionsDetailedCsv,
      },
      {
        name: 'Base resumida em CSV',
        format: 'CSV',
        purpose: 'Consulta operacional rápida para revisões pontuais.',
        actionLabel: 'Baixar CSV',
        action: downloadAdminSubmissionsCsv,
      },
    ],
  },
  {
    title: 'Materiais para apresentações e compartilhamentos',
    description: 'Arquivos que a ONG organiza para reuniões, parceiros, pitchs, relatórios e apresentações.',
    items: [
      {
        name: 'Relatório geral',
        format: 'PDF',
        purpose: 'Leitura visual com os principais recortes da base para reuniões e apresentações.',
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
        purpose: 'Recortes gerais para cruzamentos, dashboards e materiais externos.',
        actionLabel: 'Baixar CSV',
        action: downloadAdminStatisticsCsv,
      },
    ],
  },
] as const

const exportRules = [
  ['Uso interno da equipe', 'Fichas completas, base detalhada e consulta nominal da ONG'],
  ['Uso em apresentações', 'Indicadores gerais, gráficos e recortes preparados pela equipe'],
  ['Uso com parceiros', 'Material selecionado e enviado pela ONG conforme cada finalidade'],
  ['Dados pessoais', 'Permanecem no ambiente interno e não aparecem em materiais públicos'],
] as const

const handoffFlow = [
  {
    title: 'Ler a base',
    text: 'A equipe consulta o painel interno, entende o recorte e define qual material precisa sair.',
  },
  {
    title: 'Escolher o formato',
    text: 'A ONG decide se precisa de PDF, planilha ou CSV conforme a finalidade do uso.',
  },
  {
    title: 'Preparar o envio',
    text: 'O material é revisado pela equipe antes de ir para apresentações, parceiros ou reuniões.',
  },
  {
    title: 'Compartilhar com segurança',
    text: 'A ONG envia apenas o que faz sentido para cada caso, sem abrir o sistema para terceiros.',
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
            É aqui que a ONG transforma a base em relatórios, planilhas, dashboards e materiais para
            reuniões, apresentações e articulações externas.
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
              <p className="eyebrow">Regras de saída</p>
              <h2>Como cada arquivo deve sair da base</h2>
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
      </section>
    </div>
  )
}
