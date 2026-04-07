import { RefObject, useEffect } from 'react'
import { cleanUiText } from '../utils/ui-text'

function cleanElementAttributes(root: HTMLElement) {
  const elements = root.querySelectorAll<HTMLElement>('[placeholder], [title], [aria-label]')

  elements.forEach((element) => {
    const placeholder = element.getAttribute('placeholder')
    if (placeholder) {
      element.setAttribute('placeholder', cleanUiText(placeholder))
    }

    const title = element.getAttribute('title')
    if (title) {
      element.setAttribute('title', cleanUiText(title))
    }

    const ariaLabel = element.getAttribute('aria-label')
    if (ariaLabel) {
      element.setAttribute('aria-label', cleanUiText(ariaLabel))
    }
  })
}

function cleanTextNodes(root: HTMLElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const textNodes: Text[] = []

  while (walker.nextNode()) {
    textNodes.push(walker.currentNode as Text)
  }

  textNodes.forEach((node) => {
    const originalValue = node.textContent ?? ''
    const cleanedValue = cleanUiText(originalValue)

    if (cleanedValue !== originalValue) {
      node.textContent = cleanedValue
    }
  })
}

export function useCleanUiTextTree(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current

    if (!root) {
      return
    }

    cleanElementAttributes(root)
    cleanTextNodes(root)
  })
}
