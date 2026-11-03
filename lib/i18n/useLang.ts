'use client'

import { useContext } from 'react'
import { I18nContext } from './I18nProvider'

export function useLang() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    return { lang: 'en' as const, dir: 'ltr' as const }
  }
  return { lang: ctx.lang, dir: ctx.dir }
}
