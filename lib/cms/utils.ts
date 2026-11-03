// lib/cms/utils.ts
// Rich text processing and content extraction utilities

import { RicosContent, ProcessedRichContent } from './types'

// =============================================================================
// ACHIEVEMENTS/AWARDS EXTRACTION
// =============================================================================

/**
 * Extract achievements/awards text from various CMS formats:
 * - String array: returns as-is (deduplicated)
 * - Rich text object: extracts text from nodes
 * - HTML string: strips tags and returns text
 * - Plain string: splits by semicolons/punctuation if multiple items
 */
export function extractAchievementsText(data: unknown): string[] {
  if (!data) return []

  const result: string[] = []

  // Handle array of strings or objects
  if (Array.isArray(data)) {
    data
      .map((item) => {
        if (typeof item === 'string') return item
        if (typeof item === 'object' && item !== null) {
          // Handle rich text object with nodes
          if ('nodes' in item) {
            return extractRichText(item as { nodes: unknown[] })
          }
          // Handle object with text property
          if ('text' in item && typeof (item as { text: unknown }).text === 'string') {
            return (item as { text: string }).text
          }
          // Handle object with name/title property
          if ('name' in item && typeof (item as { name: unknown }).name === 'string') {
            return (item as { name: string }).name
          }
          if ('title' in item && typeof (item as { title: unknown }).title === 'string') {
            return (item as { title: string }).title
          }
          return String(item)
        }
        return String(item)
      })
      .filter(Boolean)
      .forEach(item => {
        if (!result.includes(item)) {
          result.push(item)
        }
      })
    return result
  }

  // Handle string (could be HTML or plain text with multiple items)
  if (typeof data === 'string') {
    // Strip HTML tags if present
    const stripped = stripHtmlTags(data)
    if (!stripped) return []

    // Split by semicolons, "and", or numbered lists (e.g., "1.", "2.")
    const parts = stripped.split(/;\s*|\s+and\s+|\d+\.\s*/).filter(Boolean)

    // If split resulted in multiple meaningful parts, add them (deduplicated)
    if (parts.length > 1) {
      parts.forEach(p => {
        const trimmed = p.trim()
        if (trimmed && !result.includes(trimmed)) {
          result.push(trimmed)
        }
      })
      return result
    }

    // Single item - return if not duplicate
    if (!result.includes(stripped)) {
      return [stripped]
    }
    return []
  }

  // Handle object with nodes (rich text)
  if (typeof data === 'object' && 'nodes' in data) {
    const text = extractRichText(data as { nodes: unknown[] })
    if (text && !result.includes(text)) {
      return [text]
    }
    return []
  }

  return []
}

// =============================================================================
// RICH TEXT EXTRACTION
// =============================================================================

/**
 * Extract plain text from Wix Rich Text field
 */
export function extractRichText(field: unknown): string {
  if (!field) return ''
  if (typeof field === 'string') return field
  if (Array.isArray((field as { nodes?: unknown[] }).nodes)) {
    const nodes = (field as { nodes: any[] }).nodes
    return nodes
      .filter((node) => node.type === 'PARAGRAPH' && node.nodes)
      .map((node) => node.nodes?.map((n: any) => n.textData?.text || '').join('') ?? '')
      .join('\n')
  }
  return ''
}

// =============================================================================


// =============================================================================
// CONTENT DESCRIPTION HELPERS
// =============================================================================

/**
 * Check if content is Wix rich text (has nodes structure)
 * Aliased: earlier v1 accepted arrays directly for Ricos callers.
 */
export function isRichTextContent(content: unknown): boolean {
  // v1: also treats a plain nodes array as rich text
  if (Array.isArray(content)) return true
  // v2: original committed variant
  if (!content || typeof content !== 'object') return false
  const obj = content as Record<string, unknown>
  return !!(obj.nodes && Array.isArray(obj.nodes))
}

/**
 * Extract plain text from the first paragraph of Wix Rich Text field
 * Used for descriptions where the first paragraph should appear without HTML
 */
export function extractFirstParagraphText(field: unknown): string {
  if (!field) return ''
  if (typeof field === 'string') {
    // For string input, strip HTML and get first paragraph text
    const stripped = field.replace(/<[^>]*>/g, '')
    const match = stripped.match(/^[^<]+/)
    return match ? match[0].trim() : stripped.substring(0, 200).trim()
  }
  const nodes = (field as { nodes?: any[] })?.nodes
  if (!nodes || !Array.isArray(nodes)) return ''

  for (const node of nodes) {
    if (node.type === 'PARAGRAPH' && node.nodes) {
      return node.nodes
        .map((n: any) => n.textData?.text || '')
        .join('')
        .trim()
    }
  }
  return ''
}

/**
 * Extract plain text from Ricos content (nodes array)
 */
export function extractTextFromRicos(nodes: any[]): string {
  if (!nodes || !Array.isArray(nodes)) return ''
  return nodes
    .filter((node) => node.type === 'PARAGRAPH' && node.nodes)
    .map((node) => node.nodes?.map((n: any) => (n.textData?.text || '')).join('') ?? '')
    .join('\n')
}

/**
 * Extract rich text HTML from Wix CMS Rich Text field
 * Preserves formatting like bold, lists, paragraphs etc.
 */
export function extractRichTextHtml(field: unknown, skipFirstHeading = true, plainFirstParagraph = false): string {
  if (!field) return ''

  if (typeof field === 'string') {
    let html = field
    if (skipFirstHeading) {
      html = html.replace(/<h[1-6][^>]*>.*?<\/h[1-6]>/gis, '').trim()
    }
    if (plainFirstParagraph) {
      // Replace first <p>...</p> with just its text content
      html = html.replace(/^<p[^>]*>(.*?)<\/p>/is, (match, content) => {
        // Strip inner HTML tags from the first paragraph content
        return content.replace(/<[^>]*>/g, '').trim()
      })
    }
    return html
  }

  const nodes = (field as { nodes?: any[] })?.nodes
  if (!nodes || !Array.isArray(nodes)) return ''

  let headingSkipped = false
  let firstParagraphProcessed = false
  return nodes
    .map((node: any) => {
      if (skipFirstHeading && !headingSkipped && isHeadingNode(node)) {
        headingSkipped = true
        return ''
      }

      if (plainFirstParagraph && !firstParagraphProcessed && node.type === 'PARAGRAPH') {
        firstParagraphProcessed = true
        // Return just the plain text of the first paragraph, without <p> tags
        return processNodeContent(node)
      }

      return convertNodeToHtml(node)
    })
    .filter(Boolean)
    .join('')
}

function isHeadingNode(node: any): boolean {
  const type = node.type as string
  return type === 'HEADING' || type?.startsWith('HEADING')
}

function convertNodeToHtml(node: any): string {
  if (!node) return ''

  const nodeType = node.type as string

  switch (nodeType) {
    case 'PARAGRAPH':
      return `<p class="font_8">${processNodeContent(node)}</p>`

    case 'HEADING': {
      const level = (node.headingData as { level?: number })?.level || 1
      const headingLevel = Math.min(Math.max(level, 1), 6)
      return `<h${headingLevel}>${processNodeContent(node)}</h${headingLevel}>`
    }

    case 'BULLETED_LIST':
      return convertWixListToHtml(node, 'ul')

    case 'ORDERED_LIST':
      return convertWixListToHtml(node, 'ol')

    case 'LIST_ITEM':
      return `<li><p class="font_8">${processNodeContent(node)}</p></li>`

    case 'TEXT': {
      const textData = node.textData as { text?: string; decorations?: Array<{ type: string }> } | undefined
      if (!textData?.text) return ''
      let text = textData.text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\u00a0/g, '&nbsp;')

      return applyTextDecorations(text, textData.decorations || [])
    }

    case 'horizontal-rule':
    case 'hr':
      return '<hr/>'

    case 'blockquote':
    case 'BLOCKQUOTE':
      return `<blockquote>${processNodeContent(node)}</blockquote>`

    default:
      if (node.nodes && Array.isArray(node.nodes)) {
        return processNodeContent(node)
      }
      return ''
  }
}

function convertWixListToHtml(node: any, listType: 'ul' | 'ol'): string {
  const nodes = node.nodes
  if (!nodes || !Array.isArray(nodes)) return ''

  const listItems = nodes
    .map((item: any) => {
      if (item.type === 'LIST_ITEM' || item.listItemData) {
        return `<li><p class="font_8">${processNodeContent(item)}</p></li>`
      }
      if (item.nodes) {
        return `<li><p class="font_8">${processNodeContent(item)}</p></li>`
      }
      return ''
    })
    .filter(Boolean)
    .join('')

  return `<${listType} class="font_8">${listItems}</${listType}>`
}

function applyTextDecorations(
  text: string,
  decorations: Array<{ type: string; linkData?: { link?: { url?: string; anchor?: string; target?: string } } }>
): string {
  let hasLink = false
  let linkUrl = '#'
  let linkTarget = '_self'

  for (const dec of decorations) {
    if (dec.type === 'BOLD') text = `<strong>${text}</strong>`
    if (dec.type === 'ITALIC') text = `<em>${text}</em>`
    if (dec.type === 'UNDERLINE') text = `<u>${text}</u>`
    if (dec.type === 'LINK') {
      hasLink = true
      const link = dec.linkData?.link
      linkUrl = link?.url || (link?.anchor ? `#${link.anchor}` : '#')
      linkTarget = link?.target === 'BLANK' ? '_blank' : '_self'
    }
  }

  if (hasLink) {
    const rel = linkTarget === '_blank' ? ' rel="noopener noreferrer"' : ''
    text = `<a href="${linkUrl}" target="${linkTarget}"${rel}>${text}</a>`
  }

  return text
}

function processNodeContent(node: any): string {
  const nodes = node.nodes
  if (!nodes || !Array.isArray(nodes)) {
    const textData = node.textData as { text?: string; decorations?: Array<{ type: string }> } | undefined
    if (textData?.text) {
      let text = textData.text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\u00a0/g, '&nbsp;')

      return applyTextDecorations(text, textData.decorations || [])
    }
    return ''
  }

  return nodes
    .map((child: any) => {
      if (child.type === 'TEXT' || child.textData) {
        const textData = child.textData as { text?: string; decorations?: Array<{ type: string }> } | undefined
        if (!textData?.text) return ''
        let text = textData.text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\u00a0/g, '&nbsp;')

        return applyTextDecorations(text, textData.decorations || [])
      }
      if (child.type === 'LINK' || child.linkData) {
        const href = (child.linkData as { link?: { url?: string } })?.link?.url || '#'
        return `<a href="${href}">${processNodeContent(child)}</a>`
      }
      if (child.nodes || child.type) return convertNodeToHtml(child)
      return ''
    })
    .join('')
}

// =============================================================================
// HTML PROCESSING
// =============================================================================

/**
 * Strip HTML tags from a string and decode HTML entities
 */
export function stripHtmlTags(html: string): string {
  if (!html) return ''
  const stripped = html.replace(/<[^>]*>/g, '').trim()
  // Decode common HTML entities
  return stripped
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

/**
 * Process Wix Rich Content field - returns object with hasContent, excerpt, and plainText
 */
export function processWixRichContent(field: unknown): ProcessedRichContent {
  const plainText = extractRichText(field)
  const hasContent = plainText.length > 0
  const excerpt = plainText.length > 150 ? plainText.substring(0, 150).replace(/\s+\S*$/, '') + '...' : plainText

  return { hasContent, excerpt, plainText }
}

// =============================================================================
// CONTENT DESCRIPTION HELPERS
// =============================================================================

/**
 * Unified rich content fetcher for slug pages
 * Priority: descriptionHtml > about > description > fallbackMessage
 */
export function getRichContentDescription(options: {
  descriptionHtml?: string | null
  about?: string | null
  description?: string | null
  fallbackMessage: string
}): string {
  const { descriptionHtml, about, description, fallbackMessage } = options
  if (descriptionHtml) return descriptionHtml
  if (about) return about
  if (description) return description
  return fallbackMessage
}

// =============================================================================
// HTML SANITIZATION
// =============================================================================

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return ''

  let sanitized = dirty

  sanitized = sanitized.replace(/class="[^"]*font_8[^"]*"/gi, '')
  sanitized = sanitized.replace(/class='[^']*font_8[^']*'/gi, '')

  try {
    const DOMPurify = require('dompurify')
    if (typeof window === 'undefined') {
      const { JSDOM } = require('jsdom')
      const window = new JSDOM('').window
      const purify = DOMPurify(window)
      return purify.sanitize(sanitized, {
        ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'u', 'em', 'strong', 'a', 'ul', 'ol', 'li',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'img', 'table',
          'thead', 'tbody', 'tr', 'th', 'td', 'blockquote', 'code', 'pre'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style', 'target', 'rel'],
      })
    }
    return DOMPurify.sanitize(sanitized, {
      ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'u', 'em', 'strong', 'a', 'ul', 'ol', 'li',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'img', 'table',
        'thead', 'tbody', 'tr', 'th', 'td', 'blockquote', 'code', 'pre'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style', 'target', 'rel'],
    })
  } catch {
    return basicSanitize(sanitized)
  }
}

/**
 * Basic HTML sanitization for server-side rendering
 */
export function basicSanitize(html: string): string {
  if (!html) return ''

  let sanitized = html

  sanitized = sanitized.replace(/class="[^"]*font_8[^"]*"/gi, '')
  sanitized = sanitized.replace(/class='[^']*font_8[^']*'/gi, '')

  return sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\s*on\w+="[^"]*"/gi, '')
    .replace(/\s*on\w+='[^']*'/gi, '')
    .replace(/\s*on\w+=\S+/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
}
