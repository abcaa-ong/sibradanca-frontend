import { useMemo, useState } from 'react'
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

type ExportItem = {
  name: string
  format: 'PDF' | 'XLSX' | 'CSV'
  purpose: string
  actionLabel: string
  action: DownloadAction
}

const exportGroups: Array<{
  title: string
  description: string
  items: ExportItem[]
}> = [
  {
    title: 'Base detalhada',
    description: 'Consulta completa da base para uso interno da equipe.',
    items: [
      {
        name: 'Fichas por protocolo',
        format: 'PDF',
        purpose: 'Ficha completa por protocolo.',
        actionLabel: 'Baixar PDF',
        action: downloadAdminSubmissionsDetailedPdf,
      },
      {
        name: 'Base completa da equipe',
        format: 'XLSX',
        purpose: 'Planilha detalhada da base.',
        actionLabel: 'Baixar Excel',
        action: downloadAdminSubmissionsDetailedXlsx,
      },
      {
        name: 'Base completa em CSV',
        format: 'CSV',
        purpose: 'Linhas prontas para cruzamentos.',
        actionLabel: 'Baixar CSV',
        action: downloadAdminSubmissionsDetailedCsv,
      },
    ],
  },
  {
    title: 'Operação diária',
    description: 'Arquivos rápidos para rotina da equipe.',
    items: [
      {
        name: 'Cadastros do dia a dia',
        format: 'XLSX',
        purpose: 'Conferência rápida por protocolo.',
        actionLabel: 'Baixar Excel',
        action: downloadAdminSubmissionsXlsx,
      },
      {
        name: 'Cadastros do dia a dia',
        format: 'CSV',
        purpose: 'Consulta leve da base operacional.',
        actionLabel: 'Baixar CSV',
        action: downloadAdminSubmissionsCsv,
      },
    ],
  },
  {
    title: 'Indicadores e BI',
    description: 'Arquivos institucionais, dashboards e leitura analítica.',
    items: [
      {
        name: 'Relatório geral da base',
        format: 'PDF',
        purpose: 'Resumo institucional da base.',
        actionLabel: 'Baixar PDF',
        action: downloadAdminStatisticsPdf,
      },
      {
        name: 'Indicadores da base',
        format: 'XLSX',
        purpose: 'Recortes para estudos e BI.',
        actionLabel: 'Baixar Excel',
        action: downloadAdminStatisticsXlsx,
      },
      {
        name: 'Indicadores em CSV',
        format: 'CSV',
        purpose: 'Recortes leves para dashboards.',
        actionLabel: 'Baixar CSV',
        action: downloadAdminStatisticsCsv,
      },
    ],
  },
]

const exportRules = [
  ['Fichas completas', 'Uso interno da ONG. Não saem para parceiros.'],
  ['Planilhas detalhadas', 'Usadas pela equipe para conferência e cruzamentos.'],
  ['PDFs institucionais', 'Podem ser apresentados sem dados pessoais.'],
  ['CSV e BI', 'Saem apenas em recortes preparados pela ONG.'],
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
  const totalFiles = useMemo(
    () => exportGroups.reduce((total, group) => total + group.items.length, 0),
    [],
  )

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
          <h2>Arquivos da base interna</h2>
          <p className="admin-page-subtitle">
            A equipe da ONG baixa aqui fichas, planilhas, PDFs institucionais e arquivos para BI.
          </p>
        </div>
      </header>

      {downloadError ? <Card className="admin-alert admin-alert-error">{downloadError}</Card> : null}

      <section className="admin-grid">
        <Card className="admin-metric-card">
          <span className="eyebrow">Arquivos</span>
          <strong>{totalFiles}</strong>
          <p className="card-text">Saídas disponíveis no painel.</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Base detalhada</span>
          <strong>PDF · XLSX · CSV</strong>
          <p className="card-text">Consulta completa da equipe.</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Operação</span>
          <strong>XLSX · CSV</strong>
          <p className="card-text">Rotina rápida da equipe.</p>
        </Card>

        <Card className="admin-metric-card">
          <span className="eyebrow">Indicadores</span>
          <strong>PDF · XLSX · CSV</strong>
          <p className="card-text">Leitura institucional e BI.</p>
        </Card>
      </section>

      <section className="admin-section-stack">
        {exportGroups.map((group) => (
          <Card key={group.title} className="admin-panel-card">
            <div className="admin-panel-header">
              <div>
                <p className="eyebrow">{group.title}</p>
                <h2>{group.description}</h2>
              </div>
            </div>

            <div className="admin-export-grid">
              {group.items.map((item) => (
                <div key={`${group.title}-${item.name}-${item.format}`} className="admin-export-card">
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
              <p className="eyebrow">Uso dos arquivos</p>
              <h2>Qual arquivo usar em cada situação</h2>
            </div>
          </div>

          <ul className="admin-purpose-list">
            <li>PDF por protocolo: leitura integral de um cadastro específico.</li>
            <li>Excel detalhado: conferência, cruzamento e trabalho interno da equipe.</li>
            <li>CSV detalhado: BI, dashboards e integração analítica.</li>
            <li>PDF institucional: apresentações, reuniões e materiais da ONG.</li>
          </ul>
        </Card>

        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Regras de saída</p>
              <h2>O que fica interno e o que pode sair</h2>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Diretriz</th>
                </tr>
              </thead>
              <tbody>
                {exportRules.map(([material, rule]) => (
                  <tr key={material}>
                    <td>{material}</td>
                    <td>{rule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  )
}
