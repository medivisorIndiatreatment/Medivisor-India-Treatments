// app/api/treatments/[slug]/route.ts
// Get single treatment by slug

import { NextResponse } from "next/server"
import { getAllCMSData } from "@/lib/cms"
import { generateSlug } from "@/lib/slug-utils"
import { CACHE_HEADERS } from "@/lib/api/pagination"
/**
 * GET /api/treatments/[slug]
 * Get single treatment by slug with complete multi-reference data
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    // Fetch all CMS data
    const cmsData = await getAllCMSData()
    
    // Find the treatment directly in cmsData.treatments (already mapped with full data)
const treatment = cmsData.treatments.find((t: any) => 
       t.slug === slug || generateSlug(t.name || '') === slug || t._id === slug
     )
     
     if (!treatment) {
       // Try fuzzy match
       const searchName = slug.replace(/-/g, ' ').toLowerCase()
       const found = cmsData.treatments.find((t: any) => 
         t.name?.toLowerCase().includes(searchName) ||
         t.slug?.toLowerCase()?.includes(searchName) ||
         generateSlug(t.name || '').includes(searchName)
       )
       if (!found) {
         return NextResponse.json(
           { error: 'Treatment not found' },
           { status: 404, headers: CACHE_HEADERS }
         )
       }
       return NextResponse.json(found, {
         headers: CACHE_HEADERS,
       })
     }
     
     return NextResponse.json(treatment, {
       headers: CACHE_HEADERS,
     })
   } catch (error) {
     console.error('Error fetching treatment:', error)
     return NextResponse.json(
       { error: 'Failed to fetch treatment' },
       { status: 500, headers: CACHE_HEADERS }
     )
  }
}
