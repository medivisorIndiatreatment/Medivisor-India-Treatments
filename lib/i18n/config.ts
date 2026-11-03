import { LANGUAGES, type LanguageCode } from '@/lib/googleTranslate'

export const LOCALES = LANGUAGES.map((l) => l.code) as readonly LanguageCode[]
export type Locale = LanguageCode
export const LOCALE_NAMES: Record<LanguageCode, string> = LANGUAGES.reduce(
  (acc, lang) => {
    acc[lang.code] = lang.label
    return acc
  },
  {} as Record<LanguageCode, string>,
)
export const DEFAULT_LOCALE: Locale = 'en'
