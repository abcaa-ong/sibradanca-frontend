import { Card } from './Card'

type AdminZeroStateProps = {
  eyebrow?: string
  title: string
  description: string
  items?: string[]
  note?: string
  className?: string
}

export function AdminZeroState({
  eyebrow = 'Base em preparação',
  title,
  description,
  items = [],
  note,
  className = '',
}: AdminZeroStateProps) {
  return (
    <Card className={`admin-panel-card admin-empty-panel ${className}`.trim()}>
      <div className="admin-panel-header">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p className="admin-section-text">{description}</p>
        </div>
      </div>

      {items.length ? (
        <ul className="admin-empty-list">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}

      {note ? <p className="admin-empty-note">{note}</p> : null}
    </Card>
  )
}
