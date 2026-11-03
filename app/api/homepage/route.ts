import { NextResponse } from 'next/server'
import { fetchFullHomepageData } from '@/lib/services/homepage/fetchHomepage'

export async function GET() {
  const data = await fetchFullHomepageData()
  const hasContent = data.departmentCards.length > 0 || data.doctors.length > 0 || data.hospitals.length > 0
  if (!hasContent) {
    return NextResponse.json({ error: 'Homepage data is temporarily unavailable' }, { status: 503 })
  }
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=1800',
    },
  })
}
