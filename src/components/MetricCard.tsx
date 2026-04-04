type MetricCardProps = {
  label: string
  percent: string
  detail: string
  eyebrowLabel?: string
}

export function MetricCard({ label, percent, detail, eyebrowLabel = 'Indicador' }: MetricCardProps) {
  return (
    <div className="card statistics-metric-card">
      <span className="eyebrow">{eyebrowLabel}</span>
      <h3 className="statistics-metric-title">{label}</h3>
      <strong className="statistics-metric-value">{percent}</strong>
      <p className="card-text">{detail}</p>
    </div>
  )
}
