const mojibakeMarkers = ['Ã', 'Â', 'â', '\uFFFD']

export function repairText(value: string | null | undefined) {
  if (!value) {
    return ''
  }

  let repaired = value

  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (!mojibakeMarkers.some((marker) => repaired.includes(marker))) {
      break
    }

    const bytes = Uint8Array.from(repaired, (character) => character.charCodeAt(0) & 0xff)
    const candidate = new TextDecoder('utf-8', { fatal: false }).decode(bytes)

    if (!candidate || candidate === repaired) {
      break
    }

    repaired = candidate
  }

  return repaired
}
