'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react'
import type { ReactNode } from 'react'
import {
  type LanguageCode,
  getStoredLanguage,
  setStoredLanguage,
  applyDirAttribute,
  initiatePageTranslation,
  notifyLangChange,
  subscribeToLangChange,
  getCachedTranslation,
  isRtlLanguage,
  LANGUAGES,
} from '@/lib/googleTranslate'

let staticMessageCache: Record<LanguageCode, Record<string, string>> | null = null
let staticMessagesLoadPromise: Promise<Record<LanguageCode, Record<string, string>>> | null = null

function getNestedValue(obj: Record<string, any>, key: string): string | undefined {
  return key.split('.').reduce((current: any, part: string) => current?.[part], obj)
}

async function loadStaticMessages(): Promise<Record<LanguageCode, Record<string, string>>> {
  if (staticMessageCache) return staticMessageCache
  if (staticMessagesLoadPromise) return staticMessagesLoadPromise

  staticMessagesLoadPromise = (async () => {
    const cache: Record<LanguageCode, Record<string, string>> = {} as any

    const localePromises = LANGUAGES.filter((lang) => lang.code === 'en' || lang.code === 'hi').map(async (lang) => {
      try {
        const res = await fetch(`/messages/${lang.code}.json`, { cache: 'force-cache' })
        cache[lang.code] = res.ok ? await res.json() : {}
      } catch {
        cache[lang.code] = {}
      }
    })

    await Promise.all(localePromises)

    staticMessageCache = cache
    return cache
  })()

  return staticMessagesLoadPromise
}

export interface I18nContextValue {
  lang: LanguageCode
  dir: 'ltr' | 'rtl'
  setLang: (lang: LanguageCode) => Promise<void>
  t: (text: string) => string
  isTranslating: boolean
  langVersion: number
  setLangVersion: (version: number | ((prev: number) => number)) => void
}

export const I18nContext = createContext<I18nContextValue | undefined>(undefined)

const SAFE_DEFAULT: I18nContextValue = {
  lang: 'en',
  dir: 'ltr',
  setLang: async () => {},
  t: (text: string) => text,
  isTranslating: false,
  langVersion: 0,
  setLangVersion: () => {},
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  // Never throw: a missing provider (e.g. a duplicated context module or an
  // unexpected render path) must degrade gracefully instead of 500-ing a page.
  return ctx ?? SAFE_DEFAULT
}

export function I18nProvider({
  children,
  initialLang,
}: {
  children: ReactNode
  initialLang?: LanguageCode
}) {
  const resolvedInitialLang = initialLang ?? getStoredLanguage()
  const [lang, setLangState] = useState<LanguageCode>(resolvedInitialLang)
  const [langVersion, setLangVersion] = useState(0)
  const [isTranslating, setIsTranslating] = useState(false)
  const lastHandledLangRef = useRef<LanguageCode>(resolvedInitialLang)
  const unsubRef = useRef<(() => void) | null>(null)

  const t = useCallback(
    (text: string): string => {
      if (!text) return text
      if (lang === 'en') return text

      const cached = getCachedTranslation(lang, text)
      if (cached) return cached

      if (staticMessageCache && staticMessageCache[lang]) {
        const staticTranslation = getNestedValue(staticMessageCache[lang], text)
        if (typeof staticTranslation === 'string') return staticTranslation
      }

      return text
    },
    [lang]
  )

  const dir = useMemo(() => {
    if (isRtlLanguage(lang)) return 'rtl'
    return 'ltr'
  }, [lang])

  const setLang = useCallback(
    async (newLang: LanguageCode) => {
      if (newLang === lastHandledLangRef.current) return

      setStoredLanguage(newLang)
      applyDirAttribute(newLang)

      lastHandledLangRef.current = newLang
      setLangState(newLang)

      notifyLangChange(newLang)

      if (newLang !== 'en') {
        setIsTranslating(true)
        try {
          await initiatePageTranslation(newLang)
        } catch {
          // keep originals
        } finally {
          setIsTranslating(false)
        }
      } else {
        try {
          await initiatePageTranslation(newLang)
        } catch {
          // ignore
        }
      }

      setLangVersion((v) => v + 1)
    },
    [setLangState],
  )

  useEffect(() => {
    const storedLang = getStoredLanguage()
    applyDirAttribute(storedLang)

    const init = async () => {
      await loadStaticMessages()
    }
    init()

    if (storedLang !== 'en' && storedLang !== lastHandledLangRef.current) {
      lastHandledLangRef.current = storedLang
      setLangState(storedLang)
      setLangVersion((v) => v + 1)
    }
  }, [])

  useEffect(() => {
    const unsub = subscribeToLangChange((newLang) => {
      if (newLang !== lastHandledLangRef.current) {
        lastHandledLangRef.current = newLang
        setLangState(newLang)
        applyDirAttribute(newLang)
        setLangVersion((v) => v + 1)
      }
    })
    unsubRef.current = unsub
    return () => {
      unsub()
      unsubRef.current = null
    }
  }, [setLangState])

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      dir,
      setLang,
      t,
      isTranslating,
      langVersion,
      setLangVersion,
    }),
    [lang, dir, setLang, t, isTranslating, langVersion]
  )

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  )
}
