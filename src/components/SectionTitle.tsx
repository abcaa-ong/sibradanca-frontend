import { Badge } from './Badge'
import { repairText } from '../utils/repairText'

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
      <Badge dark={dark}>{repairText(badge)}</Badge>
      <h2>{repairText(title)}</h2>
      {description ? <p>{repairText(description)}</p> : null}
    </div>
  )
}
