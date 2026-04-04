import { Badge } from './Badge'

type SectionTitleProps = {
  badge: string
  title: string
  description: string
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
      <span className="section-title-orb section-title-orb-left" aria-hidden="true" />
      <span className="section-title-orb section-title-orb-right" aria-hidden="true" />
      <Badge dark={dark}>{badge}</Badge>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  )
}
