const mojibakePattern = /(\\u[\dA-Fa-f]{4}|\\x[\dA-Fa-f]{2}|Ã.|Â.|â.|�)/
const mojibakeCharPattern = /[ÃÂâ�]/
const textDecoder = new TextDecoder('utf-8')

function decodeEscapedSequences(value: string) {
  return value
    .replace(/\\u([\dA-Fa-f]{4})/g, (_, code) => String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/\\x([\dA-Fa-f]{2})/g, (_, code) => String.fromCharCode(Number.parseInt(code, 16)))
}

function countBrokenMarkers(value: string) {
  const unicodeEscapes = value.match(/\\u[\dA-Fa-f]{4}|\\x[\dA-Fa-f]{2}/g)?.length ?? 0
  const mojibakeChars = value.match(mojibakeCharPattern)?.length ?? 0
  return unicodeEscapes + mojibakeChars
}

function repairMojibake(value: string) {
  const bytes = Uint8Array.from(Array.from(value), (character) => character.charCodeAt(0) & 0xff)
  return textDecoder.decode(bytes)
}

export function cleanUiText(value: string | null | undefined) {
  if (!value) {
    return ''
  }

  const decodedValue = decodeEscapedSequences(value)

  if (!mojibakePattern.test(decodedValue)) {
    return decodedValue
  }

  try {
    const repairedValue = repairMojibake(decodedValue)

    if (repairedValue.includes('\uFFFD')) {
      return decodedValue
    }

    return countBrokenMarkers(repairedValue) < countBrokenMarkers(decodedValue)
      ? repairedValue
      : decodedValue
  } catch {
    return decodedValue
  }
}

export function cleanUiTextList(values: string[]) {
  return values.map((value) => cleanUiText(value))
}
