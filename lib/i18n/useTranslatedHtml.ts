"use client"

import { useMemo, useRef } from "react"
import { useI18n } from "./I18nProvider"
import { useTranslatedStrings } from "./useTranslatedStrings"

const TEXT_NODE = 4

function extractTextFromHtml(html: string): string[] {
  if (typeof document === "undefined") return []
  const temp = document.createElement("div")
  temp.innerHTML = html
  const texts: string[] = []
  const seen = new Set<string>()
  const walker = document.createTreeWalker(temp, TEXT_NODE)
  let node: Node | null
  while ((node = walker.nextNode())) {
    const text = (node as Text).data.trim()
    if (text && !seen.has(text)) {
      seen.add(text)
      texts.push(text)
    }
  }
  return texts
}

function replaceTextInHtml(html: string, translationMap: Map<string, string>): string {
  if (typeof document === "undefined") return html
  const temp = document.createElement("div")
  temp.innerHTML = html
  const walker = document.createTreeWalker(temp, TEXT_NODE)
  let node: Text | null
  while ((node = walker.nextNode() as Text | null)) {
    const trimmed = node.data.trim()
    if (trimmed) {
      const translated = translationMap.get(trimmed)
      if (translated && translated !== trimmed) {
        node.data = node.data.replace(trimmed, translated)
      }
    }
  }
  return temp.innerHTML
}

export function useTranslatedHtml(html: string | string[]): string | string[] {
  const { lang } = useI18n()

  const isStringArray = Array.isArray(html)

  const htmls = useMemo(
    () => (isStringArray ? (html as string[]) : [html as string]),
    [html, isStringArray]
  )

  const textStringsRef = useRef<{ cacheKey: string; texts: string[] } | null>(null)

  const textStrings = useMemo(() => {
    if (lang === "en") return []
    if (typeof document === "undefined") return []
    const cacheKey = JSON.stringify(htmls)
    if (textStringsRef.current?.cacheKey === cacheKey) {
      return textStringsRef.current.texts
    }
    const texts: string[] = []
    const seen = new Set<string>()
    for (const h of htmls) {
      if (!h) continue
      for (const t of extractTextFromHtml(h)) {
        if (!seen.has(t)) {
          seen.add(t)
          texts.push(t)
        }
      }
    }
    textStringsRef.current = { cacheKey, texts }
    return texts
  }, [htmls, lang])

  const translatedStrings = useTranslatedStrings(textStrings)

  const translationMap = useMemo(() => {
    const map = new Map<string, string>()
    textStrings.forEach((original, i) => {
      map.set(original, translatedStrings[i] ?? original)
    })
    return map
  }, [textStrings, translatedStrings])

  const result = useMemo(() => {
    if (lang === "en" || typeof document === "undefined" || textStrings.length === 0) {
      return isStringArray ? htmls : htmls[0]
    }
    const translated = htmls.map((h) =>
      h ? replaceTextInHtml(h, translationMap) : h
    )
    return isStringArray ? translated : translated[0]
  }, [htmls, translationMap, lang, textStrings.length, isStringArray])

  return result
}

export function useTranslatedHtmlString(html: string): string {
  const result = useTranslatedHtml(html)
  return typeof result === "string" ? result : html
}

export function useTranslatedHtmlStrings(htmls: string[]): string[] {
  const result = useTranslatedHtml(htmls)
  return Array.isArray(result) ? result : htmls
}
