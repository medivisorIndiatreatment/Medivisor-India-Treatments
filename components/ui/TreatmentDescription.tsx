"use client"

import { useMemo } from "react"
import { sanitizeHtml } from "@/lib/cms"
import { DESIGN_TOKENS } from "../design-tokens"
import { useTranslatedHtmlString } from "@/lib/i18n"

interface TreatmentDescriptionProps {
  htmlContent: string
  className?: string
  maxLines?: number
}

/**
 * Renders HTML content from Wix CMS Rich Text field for treatment descriptions.
 * Optimized for card display with line clamping support.
 *
 * The HTML is translated client-side (markup preserved, text translated) via
 * useTranslatedHtmlString so card descriptions update in real time on language
 * change, falling back to the original English text when no translation is cached.
 */
export default function  TreatmentDescription({
  htmlContent,
  className = "",
  maxLines = 3,
}: TreatmentDescriptionProps) {
// Translate rich/HTML content (markup preserved, text translated).
  const translatedHtml = useTranslatedHtmlString(htmlContent || "")

  const processedHtml = useMemo(() => {
    if (!translatedHtml) return ""

    // Check if content looks like HTML
    const isHtml = translatedHtml.includes('<') && translatedHtml.includes('>')

    if (isHtml) {
      // Remove first heading if present (skipFirstHeading behavior)
      const match = translatedHtml.match(/<h[1-6][^>]*>.*?<\/h[1-6]>/i)
      if (match) {
        return translatedHtml.replace(match[0], '').trim()
      }
      return translatedHtml
    }

    // Plain text - no processing needed
    return translatedHtml
  }, [translatedHtml])

  if (!processedHtml) return null

  // For plain text, render as a simple paragraph
  const isHtml = processedHtml.includes('<') && processedHtml.includes('>')

  const wrapperAttrs = {
    "data-i18n-html": "",
    "data-trans-managed": "true",
    suppressHydrationWarning: true as boolean,
  }

  if (!isHtml) {
    return (
      <p
        className={`${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC} ${className} `}
        style={{
          display: '-webkit-box',
          WebkitLineClamp: maxLines,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
        {...wrapperAttrs}
      >
        {processedHtml}
      </p>
    )
  }

  // For HTML content, use dangerouslySetInnerHTML with sanitization
  return (
    <div
      className={`${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC} ${className} `}
      style={{
        display: '-webkit-box',
        WebkitLineClamp: maxLines,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(processedHtml) }}
      {...wrapperAttrs}
    />
  )
}

/**
 * Renders full HTML content from Wix CMS Rich Text field without line clamping.
 * Use this for detailed description views.
 */
export function TreatmentDescriptionFull({ 
  htmlContent, 
  className = "" 
}: { 
  htmlContent: string
  className?: string 
}) {
  
  const typographyClasses = `
    text-gray-700 leading-relaxed
    prose-h1:text-2xl prose-h1:font-bold prose-h1:mt-4 prose-h1:mb-2
    prose-h2:text-xl prose-h2:font-bold prose-h2:mt-4 prose-h2:mb-2
    prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-3 prose-h3:mb-2
    prose-p my-2
    prose-ul my-2 prose-ul:list-disc prose-ul:pl-5
    prose-ol my-2 prose-ol:list-decimal prose-ol:pl-5
    prose-li my-1
    prose-strong font-semibold
    prose-em italic
    prose-a text-blue-600 prose-a:underline
  `

  if (!htmlContent) return null

  return (
    <div 
      className={` ${className} `}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(htmlContent) }}
    />
  )
}
