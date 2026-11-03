import PatientTestimonialsPage from './PatientTestimonialsPage'
import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { getLanguageFromCookie } from '@/lib/googleTranslate'
import { patientTestimonialsMetadata } from '@/app/metadata'
import { LANGUAGES } from '@/lib/googleTranslate'

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()
  const lang = getLanguageFromCookie(cookieHeader)

  const baseMetadata = patientTestimonialsMetadata

  const ogLocale = lang === 'zh-CN' ? 'zh_CN' : lang

  return {
    ...baseMetadata,
    alternates: {
      canonical: 'https://medivisorindiatreatment.com/patient-testimonials',
      languages: Object.fromEntries(
        LANGUAGES.map((l) => [l.code, `https://medivisorindiatreatment.com/patient-testimonials`])
      ),
    },
    openGraph: {
      ...baseMetadata.openGraph,
      locale: ogLocale,
    },
  }
}

export default function Page() {
  return <PatientTestimonialsPage />
}
