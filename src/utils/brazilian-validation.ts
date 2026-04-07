const BRAZIL_TIMEZONE = 'America/Sao_Paulo'

function digitsOnly(value: string) {
  return value.replace(/\D/g, '')
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
  const total = digits.split('').reduce((sum, digit, index) => sum + Number(digit) * factors[index], 0)
  const remainder = total % 11
  return remainder < 2 ? 0 : 11 - remainder
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
  const digits = digitsOnly(value).slice(0, 14)

  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
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
  const digits = digitsOnly(value)

  if (digits.length !== 14 || isRepeatedDigits(digits)) {
    return false
  }

  const firstDigit = calculateCnpjVerifierDigit(digits.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const secondDigit = calculateCnpjVerifierDigit(
    `${digits.slice(0, 12)}${firstDigit}`,
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  )

  return digits === `${digits.slice(0, 12)}${firstDigit}${secondDigit}`
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
