const BRAZIL_TIMEZONE = 'America/Sao_Paulo'
const CNPJ_BODY_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
const CNPJ_FULL_WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

function digitsOnly(value: string) {
  return value.replace(/\D/g, '')
}

function alphaNumericUpperOnly(value: string) {
  return value.toUpperCase().replace(/[^0-9A-Z]/g, '')
}

function getBrazilDateParts(reference = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: BRAZIL_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const parts = formatter.formatToParts(reference)
  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value

  if (!year || !month || !day) {
    return null
  }

  return { year: Number(year), month: Number(month), day: Number(day) }
}

function parseDateInput(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())

  if (!match) {
    return null
  }

  const [, year, month, day] = match
  return { year: Number(year), month: Number(month), day: Number(day) }
}

function dateInputToUtcDate(value: string) {
  const parts = parseDateInput(value)

  if (!parts) {
    return null
  }

  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day))
}

function formatDateInputFromUtcDate(value: Date) {
  const year = value.getUTCFullYear()
  const month = String(value.getUTCMonth() + 1).padStart(2, '0')
  const day = String(value.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isRepeatedDigits(value: string) {
  return /^(\d)\1+$/.test(value)
}

function calculateVerifierDigit(digits: string, factor: number) {
  let total = 0

  for (const digit of digits) {
    total += Number(digit) * factor
    factor -= 1
  }

  const remainder = total % 11
  return remainder < 2 ? 0 : 11 - remainder
}

function calculateCnpjVerifierDigit(digits: string, factors: number[]) {
  const total = digits.split('').reduce((sum, digit, index) => {
    const normalizedDigit = cnpjCharacterToValue(digit)
    return sum + normalizedDigit * factors[index]
  }, 0)
  const remainder = total % 11
  return remainder < 2 ? 0 : 11 - remainder
}

function cnpjCharacterToValue(character: string) {
  if (/^\d$/.test(character)) {
    return Number(character)
  }

  return character.charCodeAt(0) - 48
}

export function normalizeDigits(value: string) {
  return digitsOnly(value.trim())
}

export function formatCpfInput(value: string) {
  const digits = digitsOnly(value).slice(0, 11)

  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function formatCnpjInput(value: string) {
  const normalized = alphaNumericUpperOnly(value).slice(0, 14)

  if (!normalized) {
    return ''
  }

  const part1 = normalized.slice(0, 2)
  const part2 = normalized.slice(2, 5)
  const part3 = normalized.slice(5, 8)
  const part4 = normalized.slice(8, 12)
  const part5 = normalized.slice(12, 14)

  let formatted = part1

  if (part2) {
    formatted += `.${part2}`
  }

  if (part3) {
    formatted += `.${part3}`
  }

  if (part4) {
    formatted += `/${part4}`
  }

  if (part5) {
    formatted += `-${part5}`
  }

  return formatted
}

export function normalizeCnpjValue(value: string) {
  return alphaNumericUpperOnly(value.trim())
}

export function formatBrazilianPhoneInput(value: string) {
  const digits = digitsOnly(value).slice(0, 11)

  if (digits.length <= 2) {
    return digits ? `(${digits}` : ''
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function isValidCpf(value: string) {
  const digits = digitsOnly(value)

  if (digits.length !== 11 || isRepeatedDigits(digits)) {
    return false
  }

  const firstDigit = calculateVerifierDigit(digits.slice(0, 9), 10)
  const secondDigit = calculateVerifierDigit(digits.slice(0, 10), 11)

  return digits === `${digits.slice(0, 9)}${firstDigit}${secondDigit}`
}

export function isValidCnpj(value: string) {
  const normalized = normalizeCnpjValue(value)

  if (normalized.length !== 14 || !/^[0-9A-Z]{12}\d{2}$/.test(normalized)) {
    return false
  }

  if (/^\d+$/.test(normalized) && isRepeatedDigits(normalized)) {
    return false
  }

  const body = normalized.slice(0, 12)
  const verifierDigits = normalized.slice(12)

  const firstDigit = calculateCnpjVerifierDigit(body, CNPJ_BODY_WEIGHTS)
  const secondDigit = calculateCnpjVerifierDigit(
    `${body}${firstDigit}`,
    CNPJ_FULL_WEIGHTS,
  )

  return verifierDigits === `${firstDigit}${secondDigit}`
}

export function isValidBrazilianPhone(value: string) {
  const digits = digitsOnly(value)

  if ((digits.length !== 10 && digits.length !== 11) || isRepeatedDigits(digits)) {
    return false
  }

  const ddd = Number(digits.slice(0, 2))
  return ddd >= 11 && ddd <= 99
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function getCurrentBrazilDateInputValue() {
  const parts = getBrazilDateParts()

  if (!parts) {
    return formatDateInputFromUtcDate(new Date())
  }

  const month = String(parts.month).padStart(2, '0')
  const day = String(parts.day).padStart(2, '0')
  return `${parts.year}-${month}-${day}`
}

export function shiftDateInputValue(value: string, { years = 0, days = 0 }: { years?: number; days?: number }) {
  const date = dateInputToUtcDate(value)

  if (!date) {
    return value
  }

  date.setUTCFullYear(date.getUTCFullYear() + years)
  date.setUTCDate(date.getUTCDate() + days)
  return formatDateInputFromUtcDate(date)
}

export function calculateAgeFromBirthDate(value: string) {
  const birthDate = parseDateInput(value)
  const today = getBrazilDateParts()

  if (!birthDate || !today) {
    return null
  }

  let age = today.year - birthDate.year
  const monthDifference = today.month - birthDate.month

  if (monthDifference < 0 || (monthDifference === 0 && today.day < birthDate.day)) {
    age -= 1
  }

  return age
}

export function isAgeCompatibleWithBirthDate(ageValue: string, birthDate: string) {
  const normalizedAge = ageValue.trim()

  if (!normalizedAge || !birthDate) {
    return true
  }

  const age = Number(normalizedAge)
  const calculatedAge = calculateAgeFromBirthDate(birthDate)

  if (!Number.isInteger(age) || calculatedAge === null) {
    return false
  }

  return age === calculatedAge
}
