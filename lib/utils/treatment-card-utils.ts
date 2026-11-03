// lib/utils/treatment-card-utils.ts
// Shared utilities for treatment card rendering - eliminates duplicate mapping logic

import { getWixScaledToFitImageUrl } from '@/lib/wixMedia'
import { generateSlug } from '@/lib/slug-utils'
import { extractFirstParagraphText, stripHtmlTags } from '@/lib/cms'

/**
 * Standardized treatment card data structure for UI components
 */
export interface TreatmentCardProps {
  _id: string
  name: string
  slug: string
  image: string
  cost?: string | null
  description?: string
}

/**
 * Map raw treatment data to standardized TreatmentCard format
 * Used by DoctorDetailClient, TreatmentPage, and other treatment displays
 */
export function mapTreatmentToCard(treatment: {
  _id: string
  name?: string
  slug?: string
  treatmentImage?: string | null
  treatmentImageUrl?: string | null
  cost?: string | null
  description?: string | null
  descriptionHtml?: string | { nodes: unknown[] } | null
}): TreatmentCardProps {
  const imageUrl = getTreatmentImageUrl(treatment.treatmentImage || treatment.treatmentImageUrl) || '/placeholder.svg'
  const slug = treatment.slug || generateSlug(treatment.name || '')
  
  return {
    _id: treatment._id,
    name: treatment.name || 'Treatment',
    slug,
    image: imageUrl,
    cost: treatment.cost || null,
    description: getTreatmentDescription(treatment),
  }
}

/**
 * Get treatment image URL with Wix conversion
 */
export function getTreatmentImageUrl(image: string | null | undefined): string | null {
  if (!image) return null
  const scaledUrl = getWixScaledToFitImageUrl(image, 600, 400)
  return scaledUrl
}

/**
 * Extract clean description text from treatment data
 */
export function getTreatmentDescription(treatment: {
  description?: string | null
  descriptionHtml?: string | { nodes: unknown[] } | null
}): string {
  const desc = treatment.description || ''
  const hasHtml = typeof desc === 'string' && /<[^>]+>/.test(desc)
  return hasHtml ? (extractFirstParagraphText(desc) ?? '') : stripHtmlTags(desc)
}