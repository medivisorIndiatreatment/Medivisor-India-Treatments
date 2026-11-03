'use client'

import { useContext, useState, useEffect, useRef, useMemo } from 'react'
import { I18nContext } from './I18nProvider'
import {
  getCachedTranslation,
  fetchTranslations,
  type LanguageCode,
} from '@/lib/googleTranslate'

function getCachedText(lang: LanguageCode | undefined, text: string): string {
  if (!lang || lang === 'en' || !text) return text
  return getCachedTranslation(lang, text) || text
}

export interface UseTranslatedStringsResult {
  translated: string[]
  isLoading: boolean
}

/**
 * Translate an array of strings using the current language.
 *
 * @param texts - Array of English strings to translate
 * @param autoFetch - If true (default), fetches missing translations from the API
 * @returns Array of translated strings in the same order as input
 *
 * @example
 * const names = useTranslatedStrings(doctors.map(d => d.name))
 */
export function useTranslatedStrings(
  texts: string[],
  autoFetch: boolean = true
): string[] {
  const ctx = useContext(I18nContext)
  const lang = ctx?.lang ?? 'en'
  const version = ctx?.langVersion ?? 0

  // Bump to trigger a synchronous re-read of the cache once a background fetch
  // completes. Kept intentionally separate from lang/version so cache warming
  // by the DOM translator is reflected immediately on the next render.
  const [cacheBump, setCacheBump] = useState(0)

  // Last emitted result, used only to skip no-op re-renders when a background
  // fetch did not actually add new translations.
  const prevResultsRef = useRef<string[] | undefined>(undefined)
  const textsRef = useRef(texts)
  textsRef.current = texts

  // Synchronous cache read — guarantees the displayed text matches the active
  // language the instant the context value changes (no interim flash).
  const translated = useMemo(
    () => texts.map((t) => getCachedText(lang, t)),
     
    [texts, lang, version, cacheBump]
  )

  useEffect(() => {
    if (lang === 'en' || !autoFetch || !textsRef.current.length) return

    // Only fetch strings that are not yet cached.
    const missing = textsRef.current.filter(
      (t) => t.length > 0 && getCachedText(lang, t) === t
    )
    if (missing.length === 0) return

    let active = true
    fetchTranslations(missing, lang)
      .then(() => {
        if (!active) return
        const before = textsRef.current.map((t) => getCachedText(lang, t))
        const prev = prevResultsRef.current
        const changed =
          prev === undefined ||
          before.length !== prev.length ||
          before.some((r, i) => r !== prev[i])
        if (changed) {
          prevResultsRef.current = before
          setCacheBump((c) => c + 1)
        }
      })
      .catch(() => {
        // Keep existing translations on error (English fallback remains)
      })

    return () => {
      active = false
    }
  }, [lang, version, autoFetch])

  return translated
}

/**
 * Translate a single string (simpler API for single-value use cases).
 */
export function useTranslatedString(
  text: string,
  autoFetch: boolean = true
): string {
  const results = useTranslatedStrings(text ? [text] : [], autoFetch)
  return results[0] || text
}

/**
 * Translate an object's string values.
 * Useful for translating CMS objects with multiple text fields.
 *
 * @param obj - Object whose string values should be translated
 * @param keys - Only translate these keys (if omitted, translates all string values)
 * @returns New object with translated string values
 */
export function useTranslatedObject<T extends Record<string, any>>(
  obj: T,
  keys?: (keyof T)[],
  autoFetch: boolean = true
): T {
  const ctx = useContext(I18nContext)
  const lang = ctx?.lang ?? 'en'
  const version = ctx?.langVersion ?? 0

  const [cacheBump, setCacheBump] = useState(0)
  const prevResultsRef = useRef<T | undefined>(undefined)
  const objRef = useRef(obj)
  objRef.current = obj

  const translated = useMemo<T>(() => {
    if (lang === 'en') return obj
    const result: T = { ...obj }
    const targetKeys = keys ?? (Object.keys(obj) as (keyof T)[])
    for (const key of targetKeys) {
      const value = obj[key]
      if (typeof value === 'string') {
        ;(result as any)[key] = getCachedText(lang, value)
      }
    }
    return result
  }, [obj, lang, version, cacheBump, keys])

  useEffect(() => {
    if (lang === 'en' || !autoFetch) return

    const targetKeys = keys ?? (Object.keys(objRef.current) as (keyof T)[])
    const missing: string[] = []
    for (const key of targetKeys) {
      const value = objRef.current[key]
      if (typeof value === 'string') {
        const cached = getCachedText(lang, value)
        if (cached === value && value.length > 0) {
          missing.push(value)
        }
      }
    }
    if (missing.length === 0) return

    let active = true
    fetchTranslations(missing, lang)
      .then(() => {
        if (!active) return
        const before: T = { ...objRef.current }
        for (const key of targetKeys) {
          const value = objRef.current[key]
          if (typeof value === 'string') {
            ;(before as any)[key] = getCachedText(lang, value) || value
          }
        }
        const prev = prevResultsRef.current
        const changed = JSON.stringify(before) !== JSON.stringify(prev)
        if (changed) {
          prevResultsRef.current = before
          setCacheBump((c) => c + 1)
        }
      })
      .catch(() => {
        // Keep existing translations on error
      })

    return () => {
      active = false
    }
  }, [lang, version, keys, autoFetch])

  return translated
}
