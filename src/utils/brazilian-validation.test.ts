import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  calculateAgeFromBirthDate,
  formatBrazilianPhoneInput,
  formatCnpjInput,
  formatCpfInput,
  getCurrentBrazilDateInputValue,
  isAgeCompatibleWithBirthDate,
  isValidBrazilianPhone,
  isValidCnpj,
  isValidCpf,
  normalizeCnpjValue,
} from './brazilian-validation'

describe('brazilian validation utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-07T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('formats and validates CPF values', () => {
    expect(formatCpfInput('52998224725')).toBe('529.982.247-25')
    expect(isValidCpf('529.982.247-25')).toBe(true)
    expect(isValidCpf('111.111.111-11')).toBe(false)
  })

  it('formats, normalizes and validates numeric and alphanumeric CNPJ values', () => {
    expect(formatCnpjInput('12abc34501de35')).toBe('12.ABC.345/01DE-35')
    expect(normalizeCnpjValue('12.Abc.345/01de-35')).toBe('12ABC34501DE35')
    expect(isValidCnpj('11.222.333/0001-81')).toBe(true)
    expect(isValidCnpj('12.ABC.345/01DE-35')).toBe(true)
    expect(isValidCnpj('12.ABC.345/01DE-00')).toBe(false)
  })

  it('formats and validates brazilian phone numbers', () => {
    expect(formatBrazilianPhoneInput('11987654321')).toBe('(11) 98765-4321')
    expect(isValidBrazilianPhone('(11) 98765-4321')).toBe(true)
    expect(isValidBrazilianPhone('00000000000')).toBe(false)
  })

  it('uses brazilian date boundaries when calculating age', () => {
    expect(getCurrentBrazilDateInputValue()).toBe('2026-04-07')
    expect(calculateAgeFromBirthDate('2008-04-07')).toBe(18)
    expect(calculateAgeFromBirthDate('2008-04-08')).toBe(17)
  })

  it('compares typed age against the birth date consistently', () => {
    expect(isAgeCompatibleWithBirthDate('18', '2008-04-07')).toBe(true)
    expect(isAgeCompatibleWithBirthDate('17', '2008-04-07')).toBe(false)
    expect(isAgeCompatibleWithBirthDate('', '2008-04-07')).toBe(true)
  })
})
