'use client'

import type { JSX } from 'react'
import { useContext, useMemo } from 'react'
import { I18nContext } from './I18nProvider'
import {
  getCachedTranslation,
  type LanguageCode,
} from '@/lib/googleTranslate'

type TransTagType =
  | 'span'
  | 'p'
  | 'div'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'button'
  | 'li'
  | 'a'
  | 'label'
  | 'th'
  | 'td'
  | keyof JSX.IntrinsicElements

export interface TransProps {
  children: string
  id?: string
  className?: string
  as?: TransTagType
  htmlFor?: string
  'aria-label'?: string
  [key: string]: any
}

function getCachedText(lang: LanguageCode | undefined, text: string): string {
  if (!lang || lang === 'en' || !text) return text
  return getCachedTranslation(lang, text) || text
}

export function Trans({
  children,
  id,
  className,
  as: Tag = 'span',
  htmlFor,
  ...rest
}: TransProps) {
  const ctx = useContext(I18nContext)
  const lang = ctx?.lang
  const version = ctx?.langVersion ?? 0

  const childText = typeof children === 'string' ? children : String(children)

  const translated = useMemo(() => getCachedText(lang, childText), [lang, childText, version])

  const dataAttrs = {
    'data-i18n': id || childText,
    'data-i18n-original': childText,
    'data-trans-managed': 'true',
  }

  const elementProps: Record<string, any> = {
    className,
    ...dataAttrs,
    ...rest,
    suppressHydrationWarning: true,
  }
  if (htmlFor) elementProps.htmlFor = htmlFor

  if (ctx?.dir === 'rtl') {
    elementProps.dir = 'auto'
    const existingClass = elementProps.className || ''
    elementProps.className = existingClass ? `${existingClass} rtl-text` : 'rtl-text'
  }

  const Component = Tag as keyof JSX.IntrinsicElements

  return (
    <Component {...elementProps}>
      {translated}
    </Component>
  )
}
