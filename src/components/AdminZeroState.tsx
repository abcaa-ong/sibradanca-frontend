import { Card } from './Card'
import { cleanUiText, cleanUiTextList } from '../utils/ui-text'

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
  const normalizedItems = cleanUiTextList(items)

  return (
    <Card className={`admin-panel-card admin-empty-panel ${className}`.trim()}>
      <div className="admin-panel-header">
        <div>
          <p className="eyebrow">{cleanUiText(eyebrow)}</p>
          <h2>{cleanUiText(title)}</h2>
          <p className="admin-section-text">{cleanUiText(description)}</p>
        </div>
      </div>

      {normalizedItems.length ? (
        <ul className="admin-empty-list">
          {normalizedItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}

      {note ? <p className="admin-empty-note">{cleanUiText(note)}</p> : null}
    </Card>
  )
}
