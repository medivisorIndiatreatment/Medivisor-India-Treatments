"use client"

import { useMemo } from "react"
import { useI18n } from "./I18nProvider"
import { useTranslatedStrings } from "./useTranslatedStrings"

interface RicosNode {
  type?: string
  textData?: { text?: string }
  nodes?: RicosNode[]
  [key: string]: any
}

function extractTextFromRicos(content: unknown): string[] {
  if (!content) return []
  const nodes: RicosNode[] =
    Array.isArray(content) ? (content as RicosNode[]) :
    (content as RicosContent)?.nodes ?? []
  if (!Array.isArray(nodes)) return []

  const texts: string[] = []
  const seen = new Set<string>()
  const stack: RicosNode[] = [...nodes]

  while (stack.length > 0) {
    const node = stack.pop()!
    if (node.textData?.text) {
      const text = node.textData.text.trim()
      if (text && !seen.has(text)) {
        seen.add(text)
        texts.push(text)
      }
    }
    if (node.nodes && Array.isArray(node.nodes)) {
      for (const child of node.nodes) {
        stack.push(child as RicosNode)
      }
    }
  }
  return texts
}

function deepCloneWithTranslations(
  content: unknown,
  translationMap: Map<string, string>
): unknown {
  if (!content) return content
  if (Array.isArray(content)) {
    return content.map((item) => deepCloneWithTranslations(item, translationMap))
  }
  if (typeof content !== "object" || content === null) {
    return content
  }

  const obj = { ...content } as Record<string, any>
  for (const key of Object.keys(obj)) {
    if (key === "textData" && obj[key]?.text) {
      const original = obj[key].text
      const trimmed = original.trim()
      const translated = translationMap.get(trimmed)
      if (translated && translated !== trimmed) {
        obj[key] = { ...obj[key], text: original.replace(trimmed, translated) }
      }
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      obj[key] = deepCloneWithTranslations(obj[key], translationMap)
    }
  }
  return obj
}

interface RicosContent {
  nodes: RicosNode[]
}

export function useTranslatedRicosContent(content: unknown): unknown {
  const { lang, langVersion } = useI18n()

  const textStrings = useMemo(() => {
    if (lang === "en") return []
    return extractTextFromRicos(content)
  }, [content, lang])

  const translatedStrings = useTranslatedStrings(textStrings)

  const translationMap = useMemo(() => {
    const map = new Map<string, string>()
    textStrings.forEach((original, i) => {
      map.set(original, translatedStrings[i] ?? original)
    })
    return map
  }, [textStrings, translatedStrings])

  return useMemo(() => {
    if (lang === "en" || textStrings.length === 0 || translationMap.size === 0) {
      return content
    }
    return deepCloneWithTranslations(content, translationMap)
  }, [content, translationMap, lang, textStrings.length, langVersion])
}

interface RicosContent {
  nodes: RicosNode[]
}
