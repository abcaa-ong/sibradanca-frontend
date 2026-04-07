function digitsOnly(value: string) {
  return value.replace(/\D/g, '')
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

export function isValidCpf(value: string) {
  const digits = digitsOnly(value)

  if (digits.length !== 11 || isRepeatedDigits(digits)) {
    return false
  }

  const firstDigit = calculateVerifierDigit(digits.slice(0, 9), 10)
  const secondDigit = calculateVerifierDigit(digits.slice(0, 10), 11)

  return digits === `${digits.slice(0, 9)}${firstDigit}${secondDigit}`
}

function calculateCnpjVerifierDigit(digits: string, factors: number[]) {
  const total = digits.split('').reduce((sum, digit, index) => sum + Number(digit) * factors[index], 0)
  const remainder = total % 11
  return remainder < 2 ? 0 : 11 - remainder
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

export function calculateAgeFromBirthDate(value: string) {
  if (!value) {
    return null
  }

  const birthDate = new Date(`${value}T00:00:00`)

  if (Number.isNaN(birthDate.getTime())) {
    return null
  }

  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDifference = today.getMonth() - birthDate.getMonth()

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
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
