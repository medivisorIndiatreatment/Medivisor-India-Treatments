// lib/i18n/index.ts
// Public API for the i18n layer

export { I18nProvider, useI18n, type I18nContextValue } from './I18nProvider'
export { Trans, type TransProps } from './Trans'
export { useTranslatedStrings, useTranslatedString, type UseTranslatedStringsResult } from './useTranslatedStrings'
export { useTranslatedHtml, useTranslatedHtmlString, useTranslatedHtmlStrings } from './useTranslatedHtml'
export { useTranslatedRicosContent } from './useTranslatedRicosContent'
export { useLang } from './useLang'
export {
  LANGUAGES,
  type LanguageCode,
  getStoredLanguage,
  setStoredLanguage,
  getLanguageByCode,
  getCachedTranslation,
  isRtlLanguage,
  getLanguageFromCookie,
  fetchTranslations,
  translateStrings,
  applyDirAttribute,
  subscribeToLangChange,
  notifyLangChange,
  collectUntranslatedTexts,
  applyTranslations,
  initiatePageTranslation,
} from '@/lib/googleTranslate'

export { getLocaleFromRequest, getTranslations, interpolate } from './server'
export { LOCALES, DEFAULT_LOCALE, type Locale, LOCALE_NAMES } from './config'
