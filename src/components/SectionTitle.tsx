import { Badge } from './Badge'

type SectionTitleProps = {
  badge: string
  title: string
  description?: string
  dark?: boolean
}

export function SectionTitle({
  badge,
  title,
  description,
  dark = true,
}: SectionTitleProps) {
  return (
    <div className="section-title">
      <Badge dark={dark}>{badge}</Badge>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  )
}
