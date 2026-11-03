import { LOCALES, type Locale, DEFAULT_LOCALE } from './config'

export function getLocaleFromRequest(request: Request): Locale {
  const url = new URL(request.url)
  const pathSegments = url.pathname.split('/').filter(Boolean)
  const firstSegment = pathSegments[0]
  if (firstSegment && LOCALES.includes(firstSegment as Locale)) {
    return firstSegment as Locale
  }
  const cookieHeader = request.headers.get('cookie') || ''
  const match = cookieHeader.match(/(?:^|;\s*)medivisor-lang=([^;]+)/)
  if (match) {
    const cookieLocale = decodeURIComponent(match[1]) as Locale
    if (LOCALES.includes(cookieLocale)) {
      return cookieLocale
    }
  }
  const acceptLanguage = request.headers.get('accept-language') || ''
  const primaryLang = acceptLanguage.split(',')[0]?.trim().split('-')[0]
  if (primaryLang === 'hi') return 'hi'
  return DEFAULT_LOCALE
}

export async function getTranslations(locale: Locale): Promise<Record<string, any>> {
  const cacheKey = `messages-${locale}`
  try {
    const res = await fetch(`/messages/${locale}.json`, {
      cache: 'force-cache',
      next: { tags: [cacheKey] },
    })
    if (res.ok) return await res.json()
  } catch {
    // Fall through
  }
  return {}
}

export function interpolate(template: string, params: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
  }
  return result
}
