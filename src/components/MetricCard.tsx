import { cleanUiText } from '../utils/ui-text'

type MetricCardProps = {
  label: string
  percent: string
  detail: string
  eyebrowLabel?: string
}

export function MetricCard({ label, percent, detail, eyebrowLabel = 'Destaque' }: MetricCardProps) {
  return (
    <div className="card statistics-metric-card">
      <span className="eyebrow">{cleanUiText(eyebrowLabel)}</span>
      <h3 className="statistics-metric-title">{cleanUiText(label)}</h3>
      <strong className="statistics-metric-value">{percent}</strong>
      <p className="card-text">{cleanUiText(detail)}</p>
    </div>
  )
}
