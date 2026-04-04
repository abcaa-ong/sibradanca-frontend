import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import {
  downloadAdminStatisticsCsv,
  downloadAdminStatisticsPdf,
  downloadAdminStatisticsXlsx,
  downloadAdminSubmissionsCsv,
  downloadAdminSubmissionsXlsx,
} from '../services/admin.service'

const exportGroups = [
  {
    title: 'Relatórios executivos',
    items: [
      {
        name: 'Relatório institucional',
        format: 'PDF',
        purpose: 'Diretoria, parceiros e prestação de contas',
        actionLabel: 'Baixar PDF',
        action: downloadAdminStatisticsPdf,
      },
    ],
  },
  {
    title: 'Planilhas de trabalho',
    items: [
      {
        name: 'Base estatística consolidada',
        format: 'XLSX',
        purpose: 'Equipe de dados, análise e consolidação',
        actionLabel: 'Baixar Excel',
        action: downloadAdminStatisticsXlsx,
      },
      {
        name: 'Base administrativa de cadastros',
        format: 'XLSX',
        purpose: 'Operação, atendimento e conferência',
        actionLabel: 'Baixar Excel',
        action: downloadAdminSubmissionsXlsx,
      },
      {
        name: 'Base estatística alternativa',
        format: 'CSV',
        purpose: 'Importação rápida e integrações',
        actionLabel: 'Baixar CSV',
        action: downloadAdminStatisticsCsv,
      },
      {
        name: 'Cadastros para importação rápida',
        format: 'CSV',
        purpose: 'Sistemas legados e conferências pontuais',
        actionLabel: 'Baixar CSV',
        action: downloadAdminSubmissionsCsv,
      },
    ],
  },
] as const

const integrationCards = [
  {
    title: 'Power BI',
    text: 'Consome as mesmas bases internas usadas nas planilhas e nos relatórios.',
  },
  {
    title: 'Excel',
    text: 'Apoia filtros, tratamento de base, cruzamentos e revisões operacionais.',
  },
  {
    title: 'PDF',
    text: 'Entrega leitura executiva pronta para reuniões, conselho e auditoria.',
  },
] as const

const fileMatrix = [
  ['PDF institucional', 'Diretoria e auditoria', 'Leitura executiva'],
  ['Excel estatístico', 'Equipe de dados', 'Tratamento e cruzamento'],
  ['Excel de cadastros', 'Operação', 'Conferência e atendimento'],
  ['CSV', 'Integrações', 'Carga em outras ferramentas'],
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

  async function handleDownload(action: () => Promise<{ blob: Blob; filename: string | null }>) {
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
          <p className="eyebrow">Relatórios</p>
          <h2>Arquivos e bases internas</h2>
          <p className="admin-page-subtitle">
            Cada arquivo atende uma rotina diferente da equipe. A leitura executiva, a operação e a
            análise de dados não ficam mais misturadas.
          </p>
        </div>
      </header>

      <section className="admin-section-grid">
        {exportGroups.map((group) => (
          <Card key={group.title} className="admin-panel-card">
            <div className="admin-panel-header">
              <div>
                <p className="eyebrow">Download</p>
                <h2>{group.title}</h2>
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

      {downloadError ? <Card className="admin-alert admin-alert-error">{downloadError}</Card> : null}

      <section className="admin-section-grid">
        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Uso das bases</p>
              <h2>Como cada equipe trabalha</h2>
            </div>
          </div>

          <div className="admin-bi-grid">
            {integrationCards.map((item) => (
              <div key={item.title} className="admin-bi-card">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="admin-panel-card">
          <div className="admin-panel-header">
            <div>
              <p className="eyebrow">Matriz de arquivos</p>
              <h2>Destino de cada formato</h2>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Arquivo</th>
                  <th>Quem usa</th>
                  <th>Finalidade</th>
                </tr>
              </thead>
              <tbody>
                {fileMatrix.map(([file, user, purpose]) => (
                  <tr key={file}>
                    <td>{file}</td>
                    <td>{user}</td>
                    <td>{purpose}</td>
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
