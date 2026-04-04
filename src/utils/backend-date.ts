const BRAZIL_TIMEZONE = 'America/Sao_Paulo'

function parseBackendDateTime(value: string) {
  const normalizedValue = value.trim()

  if (!normalizedValue) {
    return null
  }

  const hasExplicitTimezone = /[zZ]|[+-]\d{2}:\d{2}$/.test(normalizedValue)
  const date = new Date(hasExplicitTimezone ? normalizedValue : `${normalizedValue}Z`)

  return Number.isNaN(date.getTime()) ? null : date
}

export function formatBackendDate(value: string | null) {
  if (!value) {
    return '-'
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())

  if (match) {
    const [, year, month, day] = match
    return `${day}/${month}/${year}`
  }

  const date = parseBackendDateTime(value)
  return date
    ? date.toLocaleDateString('pt-BR', { timeZone: BRAZIL_TIMEZONE })
    : value
}

export function formatBackendDateTime(value: string | null) {
  if (!value) {
    return '-'
  }

  const date = parseBackendDateTime(value)
  return date
    ? date.toLocaleString('pt-BR', { timeZone: BRAZIL_TIMEZONE })
    : value
}
