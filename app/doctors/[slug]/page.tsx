// app/doctors/[slug]/page.tsx
// Doctor slug page with SEO optimization, JSON-LD schema markup, and responsive design

import { notFound } from 'next/navigation'
import DoctorDetailClient from '@/components/DoctorDetailClient'
import { generateDoctorMetadata } from '@/app/metadata'
import { generateSlug } from '@/lib/slug-utils'
import { processImageForMetadata } from '@/lib/wixMedia'
import { extractFirstParagraphText, stripHtmlTags } from '@/lib/cms'
import { loadDoctorPageData } from './doctor-page-helpers'

export const dynamicParams = true
export const revalidate = 3600

// ─── SEO metadata ──────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<import('next').Metadata> {
  const { slug } = await params

  try {
    const { doctor } = await loadDoctorPageData(slug)

    return generateDoctorMetadata({
      doctorName: doctor.name,
      specialization: doctor.specialties[0] || doctor.title || 'Doctor',
      description: doctor.about || undefined,
      doctorImage: doctor.image || doctor.doctorImage || null,
      hospitalName: doctor.hospitalName,
      experience: doctor.experienceYears > 0 ? `${doctor.experienceYears}+ years` : '',
      city: doctor.city,
      slug: generateSlug(doctor.name),
    })
  } catch {
    return {
      title: 'Doctor - Medivisor India Treatment',
      description:
        'Browse expert doctors and book appointments through Medivisor India Treatment.',
    }
  }
}

// ─── JSON-LD Schema Markup ───────────────────────────────────────────────
function cleanJsonLdText(value: unknown): string {
  const text = typeof value === 'object' && value && 'nodes' in value
    ? extractFirstParagraphText(value)
    : String(value || '')
  return stripHtmlTags(text).replace(/\s+/g, ' ').trim()
}

function generateDoctorJsonLd(doctor: any, relatedTreatments: any[]): object {
  const siteUrl = 'https://medivisorindiatreatment.com'
  const doctorImageUrl = processImageForMetadata(doctor.profileImage || doctor.doctorImage || doctor.image, siteUrl)
  const doctorName = doctor.name || doctor.doctorName || ''
  const doctorSlug = generateSlug(doctorName)
  const hospitalName = cleanJsonLdText(doctor.hospitalName)

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${siteUrl}/doctors/${doctorSlug}#doctor`,
    name: doctorName,
    url: `${siteUrl}/doctors/${doctorSlug}`,
    image: doctorImageUrl || `${siteUrl}/logo_medivisor.png`,
    jobTitle: cleanJsonLdText(doctor.designation || doctor.title || doctor.qualification),
    description: cleanJsonLdText(doctor.about || doctor.description || doctor.descriptionHtml),
    medicalSpecialty: doctor.specialties?.filter(Boolean).join(', ') || '',
    knowsAbout: doctor.specialties?.filter(Boolean).join(', ') || '',
    hasCredential: doctor.qualifications?.map((q: unknown) => ({
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'Degree',
      text: cleanJsonLdText(q)
    })).filter((credential: any) => credential.text) || [],
    award: doctor.awards?.map((a: unknown) => ({
      '@type': 'Award',
      text: cleanJsonLdText(a)
    })).filter((award: any) => award.text) || [],
    workLocation: hospitalName ? {
      '@type': 'MedicalOrganization',
      name: hospitalName,
      address: doctor.city ? {
        '@type': 'PostalAddress',
        addressCountry: 'India',
        addressLocality: cleanJsonLdText(doctor.city)
      } : undefined
    } : undefined,
    availableService: relatedTreatments?.slice(0, 5).map((t: any) => ({
      '@type': 'MedicalProcedure',
      name: cleanJsonLdText(t.name),
      description: cleanJsonLdText(t.descriptionHtml || t.description).substring(0, 200)
    })).filter((service: any) => service.name) || [],
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/doctors/${doctorSlug}`
    }
  }
}

// ─── Doctor page server component ───────────────────────────────────────────
export default async function DoctorPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  try {
    const { doctor, doctorHospitals, matchedHospital, relatedDoctors, relatedTreatments, allDoctorCards, allTreatments } =
      await loadDoctorPageData(slug)

    const jsonLd = generateDoctorJsonLd(doctor, relatedTreatments)

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <DoctorDetailClient
          doctor={doctor}
          hospitals={doctorHospitals}
          matchedHospital={matchedHospital}
          relatedDoctors={relatedDoctors}
          relatedTreatments={relatedTreatments}
          allDoctorCards={allDoctorCards}
          allTreatments={allTreatments}
        />
      </>
    )
  } catch {
    notFound()
  }
}