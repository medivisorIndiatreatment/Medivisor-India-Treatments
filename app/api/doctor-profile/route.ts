// app/api/doctor-profile/route.ts
// API route to get doctor profile by slug from Wix CMS

import { NextResponse } from "next/server"
import { getAllCMSData } from '@/lib/cms'

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
}

function generateSlug(name: string): string {
    if (!name) return ''
    return name
        .toLowerCase()
        .trim()
        .replace(/^(dr\.?\s*)/i, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
}

function convertToProfile(doctor: any, hospitalName: string): any {
    const specNames = doctor.specialization?.map((s: any) => typeof s === 'string' ? s : (s?.name || '')).join(', ') || 'Specialist'
    
    return {
        _id: doctor._id || '',
        name: doctor.doctorName ? `Dr. ${doctor.doctorName}` : 'Doctor',
        title: doctor.designation || specNames,
        specialty: specNames,
        photo: doctor.profileImage || '',
        experience: doctor.experienceYears || '0',
        hospitals: hospitalName ? [hospitalName] : [],
    }
}

/**
 * GET handler for fetching doctor profile by slug
 */
export async function GET(request: Request) {
    const requestId = crypto.randomUUID?.() || Date.now().toString()
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    
    if (!slug) {
        return NextResponse.json(
            { error: 'Missing slug parameter' },
            { status: 400, headers: { ...CACHE_HEADERS, 'X-Request-Id': requestId } }
        )
    }
    
    try {
        const { hospitals } = await getAllCMSData()
        
        let foundDoctor = null
        let hospitalName = ''
        
        for (const hospital of hospitals || []) {
            for (const d of hospital.doctors || []) {
                const doctorSlug = generateSlug(d.doctorName)
                if (doctorSlug === slug || doctorSlug === slug.toLowerCase()) {
                    foundDoctor = d
                    hospitalName = hospital.hospitalName
                    break
                }
            }
            
            if (!foundDoctor) {
                for (const branch of hospital.branches || []) {
                    for (const d of branch.doctors || []) {
                        const doctorSlug = generateSlug(d.doctorName)
                        if (doctorSlug === slug || doctorSlug === slug.toLowerCase()) {
                            foundDoctor = d
                            hospitalName = branch.branchName || hospital.hospitalName
                            break
                        }
                    }
                    if (foundDoctor) break
                }
            }
            
            if (foundDoctor) break
        }
        
        if (!foundDoctor) {
            return NextResponse.json(
                { error: 'Doctor not found' },
                { status: 404, headers: { ...CACHE_HEADERS, 'X-Request-Id': requestId } }
            )
        }
        
        const profile = convertToProfile(foundDoctor, hospitalName)
        return NextResponse.json(profile, { headers: { ...CACHE_HEADERS, 'X-Request-Id': requestId } })
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json(
            { error: 'Failed to fetch doctor profile', message: errorMessage },
            { status: 500, headers: { ...CACHE_HEADERS, 'X-Request-Id': requestId } }
        )
    }
}
