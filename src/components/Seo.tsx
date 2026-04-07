import { useEffect } from 'react'
import { cleanUiText } from '../utils/ui-text'

type SeoProps = {
  title: string
  description: string
  path?: string
  robots?: string
  type?: 'website' | 'article'
}

const SITE_NAME = 'SIBRADANÇA'

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

function upsertCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')

  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', 'canonical')
    document.head.appendChild(element)
  }

  element.setAttribute('href', href)
}

export function Seo({ title, description, path, robots = 'index,follow', type = 'website' }: SeoProps) {
  useEffect(() => {
    const origin = window.location.origin
    const canonicalUrl = new URL(path ?? window.location.pathname, origin).toString()
    const normalizedTitle = cleanUiText(title)
    const normalizedDescription = cleanUiText(description)
    const normalizedSiteName = cleanUiText(SITE_NAME)
    const fullTitle = normalizedTitle.includes(normalizedSiteName)
      ? normalizedTitle
      : `${normalizedTitle} | ${normalizedSiteName}`

    document.title = fullTitle
    document.documentElement.lang = 'pt-BR'

    upsertMeta('name', 'description', normalizedDescription)
    upsertMeta('name', 'robots', robots)
    upsertMeta('property', 'og:locale', 'pt_BR')
    upsertMeta('property', 'og:site_name', normalizedSiteName)
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', normalizedDescription)
    upsertMeta('property', 'og:url', canonicalUrl)
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', normalizedDescription)
    upsertCanonical(canonicalUrl)
  }, [description, path, robots, title, type])

  return null
}
