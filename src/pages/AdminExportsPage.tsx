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
    description: 'Arquivos completos da base.',
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
        purpose: 'Planilha completa da base.',
        actionLabel: 'Baixar Excel',
        action: downloadAdminSubmissionsDetailedXlsx,
      },
      {
        name: 'Base completa em CSV',
        format: 'CSV',
        purpose: 'Base detalhada em linhas.',
        actionLabel: 'Baixar CSV',
        action: downloadAdminSubmissionsDetailedCsv,
      },
    ],
  },
  {
    title: 'Operação do dia a dia',
    description: 'Arquivos rápidos da rotina.',
    items: [
      {
        name: 'Cadastros do dia a dia',
        format: 'XLSX',
        purpose: 'Consulta rápida por protocolo.',
        actionLabel: 'Baixar Excel',
        action: downloadAdminSubmissionsXlsx,
      },
      {
        name: 'Cadastros do dia a dia',
        format: 'CSV',
        purpose: 'Conferência rápida da base.',
        actionLabel: 'Baixar CSV',
        action: downloadAdminSubmissionsCsv,
      },
    ],
  },
  {
    title: 'Análises, relatórios e apresentações',
    description: 'Arquivos para análise e apresentação.',
    items: [
      {
        name: 'Relatório geral da base',
        format: 'PDF',
        purpose: 'Resumo visual da base.',
        actionLabel: 'Baixar PDF',
        action: downloadAdminStatisticsPdf,
      },
      {
        name: 'Indicadores da base',
        format: 'XLSX',
        purpose: 'Recortes da base para relatórios e BI.',
        actionLabel: 'Baixar Excel',
        action: downloadAdminStatisticsXlsx,
      },
      {
        name: 'Indicadores em CSV',
        format: 'CSV',
        purpose: 'Recortes para dashboards e cruzamentos.',
        actionLabel: 'Baixar CSV',
        action: downloadAdminStatisticsCsv,
      },
    ],
  },
] as const

const deliveryGuide = [
  {
    file: 'Fichas por protocolo',
    content: 'Mostram o cadastro inteiro por protocolo.',
    use: 'Revisão, atendimento e leitura institucional.',
    sharing: 'Não saem para fora da ONG.',
  },
  {
    file: 'Base completa da equipe',
    content: 'Reúne a leitura total da base.',
    use: 'Estudos internos e cruzamentos.',
    sharing: 'Sai apenas em recortes preparados pela ONG.',
  },
  {
    file: 'Cadastros do dia a dia',
    content: 'Mostram consulta rápida por protocolo.',
    use: 'Rotina da equipe e acompanhamento operacional.',
    sharing: 'Uso interno da equipe.',
  },
  {
    file: 'Relatório geral da base',
    content: 'Apresenta os principais números da base.',
    use: 'Reuniões, diretorias, eventos e alinhamentos institucionais.',
    sharing: 'Pode ser apresentado sem dados pessoais.',
  },
  {
    file: 'Indicadores para Power BI e dashboards',
    content: 'Levam recortes por tema, território e perfil.',
    use: 'Power BI e dashboards.',
    sharing: 'Pode sair em materiais sem dados pessoais.',
  },
] as const

const exportRules = [
  ['Uso interno da equipe', 'Fichas completas, base detalhada e revisão por protocolo.'],
  ['Uso institucional', 'Relatórios, gráficos e recortes preparados pela ONG.'],
  ['Uso com parceiros', 'Somente materiais enviados pela ONG, sem acesso ao sistema.'],
  ['Dados pessoais', 'Ficam no ambiente interno e não saem em materiais públicos.'],
] as const

const handoffFlow = [
  {
    title: 'Ler a base',
    text: 'A equipe consulta a base e define o recorte.',
  },
  {
    title: 'Escolher o arquivo',
    text: 'A ONG escolhe ficha, planilha, CSV ou relatório.',
  },
  {
    title: 'Preparar o material',
    text: 'Os arquivos são revisados antes do envio.',
  },
  {
    title: 'Compartilhar com segurança',
    text: 'A ONG envia apenas o recorte adequado.',
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
            Arquivos da base para leitura interna, relatórios, dashboards e materiais preparados pela ONG.
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
              <h2>O que sai em cada arquivo</h2>
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
              <h2>Como cada material deve sair</h2>
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
              <h2>Da base ao envio</h2>
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
              <h2>Como a ONG leva a base para fora</h2>
            </div>
          </div>

          <div className="admin-governance-grid">
            <div className="admin-governance-card">
              <h3>Apresentações e reuniões</h3>
              <p>Relatórios em PDF e indicadores gerais apoiam reuniões e apresentações.</p>
            </div>
            <div className="admin-governance-card">
              <h3>Planilhas e Power BI</h3>
              <p>Excel e CSV levam a base para dashboards, cruzamentos e BI.</p>
            </div>
            <div className="admin-governance-card">
              <h3>Parceiros externos</h3>
              <p>Parceiros recebem somente recortes preparados pela ONG.</p>
            </div>
            <div className="admin-governance-card">
              <h3>Dados pessoais</h3>
              <p>Informações nominais seguem protegidas no ambiente interno.</p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  )
}
