// app/api/technologies/route.ts
// Technologies API

import { NextResponse } from "next/server"
import { fetchAllTechnologies } from "@/lib/cms"
import { generateSlug } from "@/lib/slug-utils"
import { CACHE_HEADERS } from "@/lib/api/pagination"

// Default to fetching all technologies for complete data
const DEFAULT_PAGE_SIZE = 100
const MAX_PAGE_SIZE = 500

function mapTechnology(tech: any) {
  // Helper to extract string from potential rich text object
  const extractString = (value: unknown): string => {
    if (!value) return ""
    if (typeof value === "string") return value
    if (typeof value === "number") return String(value)
    if (typeof value === "object" && value !== null) {
      const obj = value as { nodes?: unknown[]; documentStyle?: unknown }
      if (obj.nodes && Array.isArray(obj.nodes)) {
        const nodes = obj.nodes as Array<{ type?: string; nodes?: Array<{ textData?: { text?: string } }> }>
        try {
          return nodes
            .filter((node) => node.type === "PARAGRAPH" && node.nodes)
            .map((node) => node.nodes?.map((n) => n.textData?.text || "").join("") ?? "")
            .join("\n")
        } catch {
          return ""
        }
      }
      const objAny = value as Record<string, unknown>
      for (const key of Object.keys(objAny)) {
        const v = objAny[key]
        if (typeof v === "string" && v) return v
        if (typeof v === "number") return String(v)
      }
    }
    return String(value)
  }

  // Helper to try to parse a value as rich text object { nodes: [...] }
  const tryParseRichText = (value: unknown): unknown => {
    if (!value || typeof value !== "string") return value
    const trimmed = value.trim()
    if (!(trimmed.startsWith("{") && trimmed.endsWith("}"))) return value
    try {
      const parsed = JSON.parse(trimmed)
      if (parsed && typeof parsed === "object" && Array.isArray(parsed.nodes)) {
        return parsed
      }
    } catch {
      // Not valid JSON
    }
    return value
  }

  const heading = extractString(tech.Heading || tech.heading || tech.title)
  const subHeading = extractString(tech['Sub Heading'] || tech.subHeading)
  const description = extractString(tech.Description || tech.description)
  const image = extractString(tech.Image || tech.image) || null
  
  // Preserve rich text structure for DetailsHtml if available
  const rawDetailsHtml = tech.DetailsHtml || tech.detailsHtml || null
  const detailsHtml = tryParseRichText(rawDetailsHtml)
  
  const technologiesGallery = tech.TechnologiesGallery || tech.technologiesGallery || []

  return {
    _id: tech._id || tech.ID || "",
    heading,
    subHeading,
    description,
    image,
    detailsHtml,
    technologiesGallery: Array.isArray(technologiesGallery) ? technologiesGallery : [],
  }
}

/**
 * GET /api/technologies
 * 
 * Query parameters:
 * - page: page number (default: 0)
 * - pageSize: items per page (default: 100, max: 500)
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const page = Math.max(0, parseInt(url.searchParams.get("page") || "0", 10))
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(url.searchParams.get("pageSize") || String(DEFAULT_PAGE_SIZE), 10)))

    const technologies = await fetchAllTechnologies()
    
    // Map technologies
    const items = technologies.map(mapTechnology)
    
    // Sort by heading A-Z
    items.sort((a, b) => (a.heading || '').localeCompare(b.heading || ''))
    
    // Paginate
    const total = items.length
    const start = page * pageSize
    const end = start + pageSize
    const paginatedItems = items.slice(start, end)
    
    return NextResponse.json({
      items: paginatedItems,
      pagination: {
        page,
        pageSize,
        total,
        hasMore: end < total,
      },
    }, {
      headers: CACHE_HEADERS,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Failed to fetch technologies" },
      { status: 500 }
    )
  }
}