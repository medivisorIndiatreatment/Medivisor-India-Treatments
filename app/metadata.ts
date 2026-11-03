// app/metadata.ts
import { Metadata } from 'next';
import type { LanguageCode } from '@/lib/googleTranslate';
import { processImageForMetadata } from '@/lib/wixMedia';
import { sanitizeHtml } from '@/lib/utils/cms';


// ====================================================================
// TRANSLATED METADATA HELPERS
// ====================================================================

const TRANSLATED_TITLES: Record<string, Record<string, string>> = {
  en: {
    SITE_TITLE_BASE: 'Medivisor India Treatment - World Class Healthcare For International Patients',
    SITE_NAME: 'Medivisor India Treatment',
  },
  ar: {
    SITE_TITLE_BASE: 'ميديفيسور للعلاج في الهند - رعاية صحية عالمية للمرضى الدوليين',
    SITE_NAME: 'ميديفيسور للعلاج في الهند',
  },
  fr: {
    SITE_TITLE_BASE: 'Medivisor India Treatment - Soins de santé mondiaux pour les patients internationaux',
    SITE_NAME: 'Medivisor India Treatment',
  },
  es: {
    SITE_TITLE_BASE: 'Medivisor India Treatment - Atención médica mundial para pacientes internacionales',
    SITE_NAME: 'Medivisor India Treatment',
  },
  pt: {
    SITE_TITLE_BASE: 'Medivisor India Treatment - Cuidados de saúde mundiais para pacientes internacionais',
    SITE_NAME: 'Medivisor India Treatment',
  },
  ru: {
    SITE_TITLE_BASE: 'Medivisor India Treatment - Мировая медицина для международных пациентов',
    SITE_NAME: 'Medivisor India Treatment',
  },
  'zh-CN': {
    SITE_TITLE_BASE: 'Medivisor India Treatment - 国际患者世界级医疗服务',
    SITE_NAME: 'Medivisor India Treatment',
  },
  sw: {
    SITE_TITLE_BASE: 'Medivisor India Treatment - Afya ya Kimataifa kwa Wagonjwa wa Kimataifa',
    SITE_NAME: 'Medivisor India Treatment',
  },
  am: {
    SITE_TITLE_BASE: 'Medivisor India Treatment - የተለለው የግል የኢትዮጵያ የግል የምስር',
    SITE_NAME: 'Medivisor India Treatment',
  },
  ha: {
    SITE_TITLE_BASE: 'Medivisor India Treatment - Kiwani Duniya Ga Ina Hausa',
    SITE_NAME: 'Medivisor India Treatment',
  },
  fa: {
    SITE_TITLE_BASE: 'ميديفيسور برای درمان در هند - مراقبت‌های بهداشتی جهانی برای بیماران بین‌المللی',
    SITE_NAME: 'میدیویسر برای درمان در هند',
  },
  ur: {
    SITE_TITLE_BASE: 'میڈیویسر انڈیا ٹریٹمنٹ - بین الاقوامی مریضوں کے لیے عالمی طبی خدمات',
    SITE_NAME: 'میڈیویسر انڈیا ٹریٹمنٹ',
  },
  uz: {
    SITE_TITLE_BASE: 'Medivisor India Treatment - Xalqaro bemorlar uchun jahon darajadagi tibbiy xizmatlar',
    SITE_NAME: 'Medivisor India Treatment',
  },
  bn: {
    SITE_TITLE_BASE: 'মেডিভিজর ইন্ডিয়া ট্রিটমেন্ট - আন্তর্জাতিক রোগীদের জন্য বিশ্বস্ত মানের চিকিৎসা',
    SITE_NAME: 'মেডিভিজর ইন্ডিয়া ট্রিটমেন্ট',
  },
  de: {
    SITE_TITLE_BASE: 'Medivisor India Treatment - Weltklasse-Gesundheitsversorgung für internationale Patienten',
    SITE_NAME: 'Medivisor India Treatment',
  },
  ja: {
    SITE_TITLE_BASE: 'Medivisor India Treatment - 国際患者向け世界クラスの医療',
    SITE_NAME: 'Medivisor India Treatment',
  },
  it: {
    SITE_TITLE_BASE: 'Medivisor India Treatment - Assistenza sanitaria di livello mondiale per pazienti internazionali',
    SITE_NAME: 'Medivisor India Treatment',
  },
  pl: {
    SITE_TITLE_BASE: 'Medivisor India Treatment - Światowa opieka zdrowotna dla pacjentów międzynarodowych',
    SITE_NAME: 'Medivisor India Treatment',
  },
  id: {
    SITE_TITLE_BASE: 'Medivisor India Treatment - Layanan kesehatan kelas dunia untuk pasien internasional',
    SITE_NAME: 'Medivisor India Treatment',
  },
};

export function getTranslatedMetadata(lang: LanguageCode): {
  title: string;
  description: string;
  siteName: string;
} {
  const translations = TRANSLATED_TITLES[lang] || TRANSLATED_TITLES.en;
  return {
    title: translations.SITE_TITLE_BASE,
    description: translations.SITE_NAME,
    siteName: translations.SITE_NAME,
  };
}


// ====================================================================
// 1. GLOBAL CONSTANTS
// ====================================================================
const SITE_NAME = 'Medivisor India Treatment';
const SITE_URL = 'https://medivisorindiatreatment.com/';
const SITE_TITLE_BASE = 'Medivisor India Treatment - World Class Healthcare For International Patients';
const SITE_DESCRIPTION = 'Proudly treated 3,500+ patients worldwide. Medivisor India Treatment offers world-class, affordable medical treatments for international patients, including surgeries, IVF, kidney transplants, cancer care, and advanced heart treatments. Experience compassionate care with expert doctors and state-of-the-art hospitals.';
const TWITTER_HANDLE = '@Medivisorindiatreatment';
const OG_IMAGE_URL = '/banner/homepage.png';

// ====================================================================
// 2. DEFAULT METADATA CONFIGURATION (Used by the Root Layout or Home Page)
// ====================================================================
export const defaultMetadata: Metadata = {
  title: {
    default: SITE_TITLE_BASE,
    template: `%s | ${SITE_NAME}`, // Allows for dynamic titles like "About Us  Treatment"
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'Medivisor India Treatment',
    'medical tourism India',
    'affordable medical treatment',
    'international patient care',
    'surgery in India',
    'IVF treatment India',
    'kidney transplant India',
    'cancer treatment India',
    'heart treatment India',
    'best hospitals India',
    'expert doctors',
    'world-class healthcare',
  ],
  authors: [{ name: 'Medivisor Team' }],
  creator: SITE_NAME,
  publisher: SITE_NAME,

  metadataBase: new URL(SITE_URL),

  alternates: {
    canonical: SITE_URL,
    languages: {
      'en': SITE_URL,
      'hi': SITE_URL,
      'x-default': SITE_URL,
    },
  },

  // --- Open Graph (OG) for social media previews ---
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE_BASE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE_URL,
        width: 800, // Matching your initial provided width
        height: 250, // Matching your initial provided height
        alt: `${SITE_NAME} - Premium Medical Care`,
      },
    ],
  },

  // --- Twitter Card for social media previews ---
  twitter: {
    card: 'summary_large_image', // Often preferred for better engagement
    title: SITE_TITLE_BASE,
    description: SITE_DESCRIPTION,
    site: TWITTER_HANDLE,
    creator: TWITTER_HANDLE,
    images: [OG_IMAGE_URL],
  },

  // --- Robots/SEO Configuration ---
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // --- Verification (Replace with your actual codes) ---
  verification: {
    google: '746594929470-busv549t5tat92misjbn6jcercqd5886.apps.googleusercontent.com',
  },

  // --- Other useful metadata (e.g., icons) ---
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  }
};

// ====================================================================
// 3. DYNAMIC METADATA GENERATORS FOR DYNAMIC ROUTES
// ====================================================================

/**
 * Generate metadata for treatment pages
 */
export async function generateTreatmentMetadata(
  treatmentName: string,
  treatmentDescription?: string,
  treatmentImage?: string,
slug: string = '',
  lang: LanguageCode = 'en'
): Promise<Metadata> {
  const siteUrl = 'https://medivisorindiatreatment.com'
  const pageUrl = `${siteUrl}/treatment/${slug}`
  const ogImage = processImageForMetadata(treatmentImage, siteUrl) || `${siteUrl}/logo_medivisor.png`
  const pageTitle = treatmentName
  const ogLocale = lang === 'zh-CN' ? 'zh_CN' : lang

  return {
    title: `${pageTitle} Treatment in India | Medivisor India Treatment`,
    description: treatmentDescription || `Get ${treatmentName} treatment in India with Medivisor. World-class healthcare at affordable costs. Expert doctors and top hospitals.`,
    keywords: [
      `${treatmentName} treatment India`,
      'medical tourism India',
      'affordable treatment',
      'best hospitals India',
      'expert doctors',
      'treatment cost India'
    ],
    authors: [{ name: 'Medivisor Team' }],
    publisher: 'Medivisor India Treatment',
    metadataBase: new URL(siteUrl),
    alternates: { canonical: pageUrl },
    openGraph: {
      type: 'website',
      locale: ogLocale,
      url: pageUrl,
      siteName: 'Medivisor India Treatment',
      title: `${pageTitle} Treatment in India | Medivisor India Treatment`,
      description: treatmentDescription || `Get ${treatmentName} treatment in India with Medivisor. World-class healthcare at affordable costs.`,
      images: [{
        url: ogImage,
        secureUrl: ogImage,
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: `${pageTitle} Treatment in India - Medivisor`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pageTitle} Treatment in India | Medivisor`,
      description: treatmentDescription || `Get ${treatmentName} treatment in India with Medivisor.`,
      site: '@medivisorindiatreatment',
      creator: '@medivisorindiatreatment',
      images: [{
        url: ogImage,
        width: 1200,
        height: 630,
        alt: `${pageTitle} Treatment in India - Medivisor`,
      }],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

/**
 * Generate metadata for department pages
 */
export async function generateDepartmentMetadata(
  departmentName: string,
  departmentDescription?: string,
  departmentImage?: string,
  treatmentCount?: number,
  slug: string = ''
): Promise<Metadata> {
  const siteUrl = 'https://medivisorindiatreatment.com'
  const pageUrl = `${siteUrl}/department/${slug}`
  const ogImage = processImageForMetadata(departmentImage, siteUrl) || `${siteUrl}/logo_medivisor.png`
  const description = departmentDescription || `Explore ${treatmentCount || 'multiple'} medical treatments in ${departmentName}. World-class healthcare services in India through Medivisor.`

  return {
    title: `${departmentName} Department in India | Medivisor India Treatment`,
    description: description,
    keywords: [
      `${departmentName} department`,
      `${departmentName} treatments`,
      'medical tourism India',
      'affordable healthcare',
      'best hospitals India',
      'expert doctors',
      'healthcare India'
    ].filter(Boolean),
    authors: [{ name: 'Medivisor Team' }],
    publisher: 'Medivisor India Treatment',
    metadataBase: new URL(siteUrl),
    alternates: { canonical: pageUrl },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: pageUrl,
      siteName: 'Medivisor India Treatment',
      title: `${departmentName} Department in India | Medivisor India Treatment`,
      description: description,
      images: [{
        url: ogImage,
        secureUrl: ogImage,
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: `${departmentName} Department - Medivisor India Treatment`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${departmentName} Department in India | Medivisor`,
      description: description,
      site: '@medivisorindiatreatment',
      creator: '@medivisorindiatreatment',
      images: [{
        url: ogImage,
        width: 1200,
        height: 630,
        alt: `${departmentName} Department - Medivisor India Treatment`,
      }],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

/**
 * Generate metadata for Test & Diagnosis pages
 */
export async function generateTestDiagnosisMetadata(
  testDiagnosisName: string,
  testDiagnosisDescription?: string,
  testDiagnosisImage?: string,
  treatmentCount?: number,
  slug: string = ''
): Promise<Metadata> {
  const siteUrl = 'https://medivisorindiatreatment.com'
  const pageUrl = `${siteUrl}/test-diagnosis/${slug}`
  const ogImage = processImageForMetadata(testDiagnosisImage, siteUrl) || `${siteUrl}/logo_medivisor.png`
  const description = testDiagnosisDescription || `Explore ${treatmentCount || 'multiple'} medical tests and diagnoses in ${testDiagnosisName}. World-class healthcare services in India through Medivisor.`

  return {
    title: `${testDiagnosisName} Test & Diagnosis in India | Medivisor India Treatment`,
    description: description,
    keywords: [
      `${testDiagnosisName} test`,
      `${testDiagnosisName} diagnosis`,
      'medical tests India',
      'diagnostic services India',
      'medical tourism India',
      'affordable healthcare',
      'best hospitals India',
      'expert doctors',
      'healthcare India'
    ].filter(Boolean),
    authors: [{ name: 'Medivisor Team' }],
    publisher: 'Medivisor India Treatment',
    metadataBase: new URL(siteUrl),
    alternates: { canonical: pageUrl },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: pageUrl,
      siteName: 'Medivisor India Treatment',
      title: `${testDiagnosisName} Test & Diagnosis in India | Medivisor India Treatment`,
      description: description,
      images: [{
        url: ogImage,
        secureUrl: ogImage,
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: `${testDiagnosisName} Test & Diagnosis - Medivisor India Treatment`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${testDiagnosisName} Test & Diagnosis in India | Medivisor`,
      description: description,
      site: '@medivisorindiatreatment',
      creator: '@medivisorindiatreatment',
      images: [{
        url: ogImage,
        width: 1200,
        height: 630,
        alt: `${testDiagnosisName} Test & Diagnosis - Medivisor India Treatment`,
      }],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

/**
 * Generate metadata for hospital branch pages
 */
export async function generateBranchMetadata(
  branchName: string,
  branchDescription?: string,
  branchImage?: string,
  hospitalName?: string,
slug: string = '',
  lang: LanguageCode = 'en'
): Promise<Metadata> {
  const siteUrl = 'https://medivisorindiatreatment.com'
  const pageUrl = `${siteUrl}/hospital-branches/${slug}`
  const ogImage = processImageForMetadata(branchImage, siteUrl) || `${siteUrl}/logo_medivisor.png`
  const pageTitle = branchName
  const description = branchDescription || (lang === 'en' ? `Visit ${branchName} through Medivisor. World-class healthcare at affordable costs. Expert doctors and top hospitals in India.` : `${branchName} - Medivisor`)

  return {
    title: hospitalName ? `${pageTitle} - ${hospitalName} | Medivisor` : `${pageTitle} Hospital Branch in India | Medivisor India Treatment`,
    description: branchDescription || `Visit ${branchName} through Medivisor. World-class healthcare at affordable costs. Expert doctors and top hospitals in India.`,
    keywords: [
      `${branchName} hospital`,
      'medical tourism India',
      'affordable healthcare',
      'best hospitals India',
      'expert doctors',
      hospitalName || '',
      'hospital branch India'
    ].filter(Boolean),
    authors: [{ name: 'Medivisor Team' }],
    publisher: 'Medivisor India Treatment',
    metadataBase: new URL(siteUrl),
    alternates: { canonical: pageUrl },
    openGraph: {
      type: 'website',
locale: lang === 'zh-CN' ? 'zh_CN' : lang,
      url: pageUrl,
      siteName: 'Medivisor India Treatment',
      title: hospitalName ? `${pageTitle} - ${hospitalName} | Medivisor` : `${pageTitle} Hospital Branch in India | Medivisor India Treatment`,
      description: description,
      images: [{
        url: ogImage,
        secureUrl: ogImage,
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: `${pageTitle} Hospital India - Medivisor India Treatment`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: hospitalName ? `${pageTitle} - ${hospitalName} | Medivisor` : `${pageTitle} Hospital Branch in India | Medivisor`,
      description: description,
      site: '@medivisorindiatreatment',
      creator: '@medivisorindiatreatment',
      images: [{
        url: ogImage,
        secureUrl: ogImage,
        width: 1200,
        height: 630,
        alt: `${pageTitle} Hospital India - Medivisor India Treatment`,
      }],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

/**
 * Generate metadata for hospital group pages
 */
export async function generateHospitalGroupMetadata(
  hospitalName: string,
  hospitalDescription?: string,
  hospitalImage?: string,
  branchCount?: number,
slug: string = '',
  lang: LanguageCode = 'en'
): Promise<Metadata> {
  const siteUrl = 'https://medivisorindiatreatment.com'
  const pageUrl = `${siteUrl}/hospital-groups/${slug}`
  const ogImage = processImageForMetadata(hospitalImage, siteUrl) || `${siteUrl}/logo_medivisor.png`
  const description = hospitalDescription || `Explore ${hospitalName} hospital branches in India. Medivisor provides world-class healthcare at affordable costs. Expert doctors and top facilities.`
  const ogLocale = lang === 'zh-CN' ? 'zh_CN' : lang

  return {
    title: `${hospitalName} Hospitals in India | Medivisor India Treatment`,
    description: description,
    keywords: [
      `${hospitalName} hospitals India`,
      'medical tourism India',
      'hospital network India',
      'best hospitals India',
      'affordable healthcare',
      `top ${hospitalName} hospitals`
    ].filter(Boolean),
    authors: [{ name: 'Medivisor Team' }],
    publisher: 'Medivisor India Treatment',
    metadataBase: new URL(siteUrl),
    alternates: { canonical: pageUrl },
    openGraph: {
      type: 'website',
      locale: ogLocale,
      url: pageUrl,
      siteName: 'Medivisor India Treatment',
      title: `${hospitalName} Hospitals in India | Medivisor India Treatment`,
      description: description,
      images: [{
        url: ogImage,
        secureUrl: ogImage,
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: `${hospitalName} Hospitals India - Medivisor`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${hospitalName} Hospitals in India | Medivisor`,
      description: description,
      site: '@medivisorindiatreatment',
      creator: '@medivisorindiatreatment',
      images: [{
        url: ogImage,
        width: 1200,
        height: 630,
        alt: `${hospitalName} Hospitals India - Medivisor`,
      }],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

/**
 * Generate metadata for doctor pages
 *
 * Called with individual positional arguments (legacy):
 *   generateDoctorMetadata(name, spec, desc, img, hospital, exp, city, slug)
 *
 * Or with a single options object (new):
 *   generateDoctorMetadata({ doctorName, specialization, ... })
 */
export async function generateDoctorMetadata(
  doctorNameOrOptions:
    | string
    | {
        doctorName: string
        specialization: string
        description?: string | null
        doctorImage?: string | null
        hospitalName?: string
        experience?: string
        city?: string
        slug?: string
      },
  specialization?: string,
  description?: string,
  doctorImage?: string,
  hospitalName?: string,
  experience?: string,
  city?: string,
  slug: string = ''
): Promise<Metadata> {
  // Support both calling conventions
  const doctorName =
    typeof doctorNameOrOptions === 'string'
      ? doctorNameOrOptions
      : doctorNameOrOptions.doctorName
  const effectiveSpecialization =
    typeof doctorNameOrOptions === 'string'
      ? specialization!
      : doctorNameOrOptions.specialization
  const effectiveDescription = typeof doctorNameOrOptions === 'string'
    ? description
    : doctorNameOrOptions.description ?? undefined   // null → undefined

  const effectiveDoctorImage = typeof doctorNameOrOptions === 'string'
    ? doctorImage
    : (doctorNameOrOptions.doctorImage ?? undefined)  // null → undefined
  const effectiveHospitalName =
    typeof doctorNameOrOptions === 'string'
      ? hospitalName
      : doctorNameOrOptions.hospitalName
  const effectiveExperience =
    typeof doctorNameOrOptions === 'string'
      ? experience
      : doctorNameOrOptions.experience
  const effectiveCity =
    typeof doctorNameOrOptions === 'string'
      ? city
      : doctorNameOrOptions.city
  const effectiveSlug =
    typeof doctorNameOrOptions === 'string'
      ? slug
      : doctorNameOrOptions.slug || ''
  const siteUrl = 'https://medivisorindiatreatment.com'
  const pageUrl = `${siteUrl}/doctors/${effectiveSlug}`
  const ogImage = processImageForMetadata(effectiveDoctorImage, siteUrl) || `${siteUrl}/logo_medivisor.png`

   // Clean text for meta tags: remove HTML, decode entities, and trim
   const cleanText = (text: string | undefined) => {
     if (!text) return ''
     let cleaned = sanitizeHtml(text)
     cleaned = cleaned
       .replace(/&amp;/g, '&')
       .replace(/&lt;/g, '<')
       .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&apos;/g, "'")
    cleaned = cleaned.replace(/<[^>]*>/g, '')
    return cleaned.trim()
  }

  const cleanedDoctorName = cleanText(doctorName)
  const cleanedSpecialization = cleanText(effectiveSpecialization)
  const cleanedDescription = cleanText(effectiveDescription)
  const cleanedHospitalName = cleanText(effectiveHospitalName)
  const cleanedExperience = cleanText(effectiveExperience)
  const cleanedCity = cleanText(effectiveCity)

  const metaDescription =
    cleanedDescription ||
    `Book an appointment with ${cleanedDoctorName}, ${cleanedSpecialization}${cleanedHospitalName ? ` at ${cleanedHospitalName}` : ''}. ${cleanedExperience ? `${cleanedExperience} of experience.` : ''}${cleanedCity ? ` Located in ${cleanedCity}.` : ''} Medivisor provides world-class healthcare at affordable costs.`

  return {
    title: `${cleanedDoctorName} - ${cleanedSpecialization} | Medivisor India Treatment`,
    description: metaDescription,
    keywords: [
      cleanedDoctorName,
      cleanedSpecialization,
      'medical tourism India',
      'best doctors India',
      'expert doctors',
      'healthcare India',
      cleanedHospitalName || '',
      cleanedCity || '',
    ].filter(Boolean) as string[],
    authors: [{ name: 'Medivisor Team' }],
    publisher: 'Medivisor India Treatment',
    metadataBase: new URL(siteUrl),
    alternates: { canonical: pageUrl },
    openGraph: {
      type: 'profile',
      locale: 'en_US',
      url: pageUrl,
      siteName: 'Medivisor India Treatment',
      title: `${cleanedDoctorName} - ${cleanedSpecialization} | Medivisor India Treatment`,
      description:
        cleanedDescription ||
        `Book an appointment with ${cleanedDoctorName}, ${cleanedSpecialization}${cleanedHospitalName ? ` at ${cleanedHospitalName}` : ''}.`,
      images: [
        {
          url: ogImage,
          secureUrl: ogImage,
          width: 1200,
          height: 630,
          type: 'image/jpeg',
          alt: `${cleanedDoctorName} - ${cleanedSpecialization} | Medivisor`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${cleanedDoctorName} - ${cleanedSpecialization} | Medivisor`,
      description:
        cleanedDescription ||
        `Book an appointment with ${cleanedDoctorName}, ${cleanedSpecialization}.`,
      site: '@medivisorindiatreatment',
      creator: '@medivisorindiatreatment',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${cleanedDoctorName} - ${cleanedSpecialization} | Medivisor`,
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

// ====================================================================
// 4. PAGE-SPECIFIC METADATA CONFIGURATIONS (Static Pages)
// ====================================================================

// About Us Page
export const aboutMetadata: Metadata = {
  title: 'About Medivisor India Treatment | Trusted International Medical Partner',
  description: 'Medivisor India is your trusted gateway to world-class healthcare. We help international patients access advanced medical treatments including surgeries, IVF, kidney transplants, cancer care, and heart treatments with compassionate, expert-led care.',
  keywords: [
    'Medivisor India',
    'About Medivisor',
    'international medical travel',
    'medical tourism India',
    'expert doctors India',
    'surgeries',
    'IVF treatment India',
    'kidney transplant',
    'cancer care',
    'heart treatment',
    'trusted healthcare partner'
  ],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://medivisorindiatreatment.com/aboutus',
  },
  openGraph: {
    title: 'About Medivisor India Treatment | Trusted International Medical Partner',
    description: 'Learn about Medivisor India’s mission, values, and experience in helping international patients access world-class healthcare with safety, compassion, and expertise.',
    url: 'https://medivisorindiatreatment.com/aboutus',
    siteName: 'Medivisor India Treatment',
    images: [
      {
        url: 'https://medivisorindiatreatment.com/logo_medivisor.png',
        width: 800,
        height: 250,
        alt: 'About Medivisor India Treatment - Trusted Medical Partner',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Medivisor India Treatment | Trusted International Medical Partner',
    description: 'Discover how Medivisor India helps international patients access world-class medical treatments in India with expert care and safety-first approach.',
    site: '@MedivisorIndiatreatment',
  },
};

// PNG Expanded Metadata
export const pngExpendedMetadata: Metadata = {
  title: 'Health Ambassador ',
  description:
    'Join the Medivisor Expanded Patient Support Network (PNG) as a Community Health Partner. Help bridge healthcare gaps between Papua New Guinea and India.',
  keywords: [
    'Medivisor Community Health Partners',
    'PNG Health Ambassador',
    'Medical Support Network PNG',
    'Healthcare Partners Papua New Guinea',
    'Medical Tourism India',
    'Community Health Guide',
    'Patient Support Network',
    'Health Ambassador Program',
    'Medical Support PNG',
    'Healthcare Bridge PNG India',
  ],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://medivisorindiatreatment.com/medivisor-expanded-patient-support-network-png',
  },
  openGraph: {
    title: 'Serve PNG. Save Lives.',
    description: 'Join the Medivisor Expanded Patient Support Network (PNG) as a Community Health Partner.',
    url: 'https://medivisorindiatreatment.com/medivisor-expanded-patient-support-network-png',
    siteName: 'Medivisor India Treatment',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://medivisorindiatreatment.com/PNG-Web-Banner-fb.jpg',
        secureUrl: 'https://medivisorindiatreatment.com/PNG-Web-Banner-fb.jpg',
        width: 1200,
        height: 630,
        alt: 'Medivisor Community Health Partners PNG',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Serve PNG. Save Lives.',
    description: 'Join the Medivisor Expanded Patient Support Network (PNG) as a Community Health Partner.',
    images: ['https://medivisorindiatreatment.com/PNG-Web-Banner-fb.jpg'],
  },
};

// Blog Page
export const blogMetadata: Metadata = {
  title: 'Blog ',
  description: 'Read informative blog posts by Medivisor India on medical treatments, healthcare tips, patient journeys, and international medical tourism in India.',
  keywords: ['Medivisor India blog', 'healthcare blog India', 'medical tourism articles', 'patient stories', 'medical treatment tips', 'health tips for international patients'],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://medivisorindiatreatment.com/blog',
  },
  openGraph: {
    title: 'Blog ',
    description: 'Stay updated with the latest blog posts, patient stories, and healthcare insights by Medivisor India.',
    url: 'https://medivisorindiatreatment.com/blog',
    siteName: 'Medivisor India Treatment',
    images: [
      {
        url: 'https://medivisorindiatreatment.com/logo_medivisor.png',
        width: 800,
        height: 250,
        alt: 'Medivisor India Blog',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog ',
    description: 'Read blog posts and healthcare articles by Medivisor India to guide international patients.',
    site: '@MedivisorIndiatreatment',
  },
};

// Services Page
export const servicesMetadata: Metadata = {
  title: "Our Medical Services",
  description:
    "Explore Medivisor India's world-class medical services for international patients. We offer advanced surgeries, IVF, kidney transplant, cancer care, and heart treatments with compassionate, expert-led care.",
  keywords:
    "Medivisor India services, medical tourism India, surgeries India, IVF treatment India, kidney transplant, cancer care, heart treatment, international patient care, world-class hospitals India",
  robots: "index, follow",
  alternates: {
    canonical: "https://medivisorindiatreatment.com/services",
  },
  openGraph: {
    title: "Our Medical Services",
    description:
      "Discover Medivisor India’s advanced medical services including surgeries, IVF, kidney transplant, cancer care, and heart treatments for international patients.",
    url: "https://medivisorindiatreatment.com/services/",
    siteName: "Medivisor India Treatment",
    images: [
      {
        url: "https://medivisorindiatreatment.com/logo_medivisor.png",
        width: 800,
        height: 250,
        alt: "Medivisor India Medical Services",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Medical Services",
    description:
      "Get advanced medical care in India with Medivisor. Surgeries, IVF, kidney transplant, cancer care, and heart treatments with expert-led guidance.",
    site: "@MedivisorIndiatreatment",
  },
};

// Team Page
export const teamMetadata: Metadata = {
  title: 'Meet Our Expert Team',
  description: 'Meet the Medivisor India team of expert doctors, surgeons, and healthcare professionals committed to providing world-class medical care to international patients.',
  keywords: 'Medivisor India team, expert doctors India, medical team India, international patient care, surgeons, healthcare professionals, medical tourism India',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://medivisorindiatreatment.com/team',
  },
  openGraph: {
    title: 'Meet Our Expert Team',
    description: 'Discover our dedicated team of doctors, surgeons, and healthcare professionals delivering advanced medical care for international patients.',
    url: 'https://medivisorindiatreatment.com/team',
    siteName: 'Medivisor India Treatment',
    images: [
      {
        url: 'https://medivisorindiatreatment.com/logo_medivisor.png',
        width: 800,
        height: 250,
        alt: 'Medivisor India Expert Team',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Meet Our Expert Team',
    description: 'Meet our team of highly skilled doctors, surgeons, and healthcare professionals committed to world-class medical care.',
    site: '@MedivisorIndiatreatment',
  },
};

// Safety Measures Page
export const safetyMeasuresMetadata: Metadata = {
  title: 'Safety Measures & Protocols ',
  description: 'Our commitment to your safety: Review Medivisor India\'s strict safety protocols, accredited hospital partnerships, and comprehensive measures ensuring a secure and worry-free healthcare journey for international patients.',
  keywords: 'Medivisor India safety measures, patient safety protocols, accredited hospitals India, secure medical journey, healthcare security, international patient safety',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://medivisorindiatreatment.com/safety-measures',
  },
  openGraph: {
    title: 'Ensuring Care with Trust | Safety Measures at Medivisor India',
    description: 'Learn about the strict safety and hygiene protocols Medivisor India follows to ensure the highest standard of care and security throughout your treatment in India.',
    url: 'https://medivisorindiatreatment.com/safety-measures', // Update the URL to your safety measures page
    siteName: 'Medivisor India Treatment',
    images: [
      {
        url: 'https://medivisorindiatreatment.com/safety_measures_banner.png', // Update the image URL to a relevant safety/trust image
        width: 1200, // Recommend a larger width for Open Graph images
        height: 630, // Recommend a standard ratio (e.g., 1.91:1)
        alt: 'Medivisor India Safety and Trust',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your Safety is Our Priority',
    description: 'We follow stringent safety protocols and partner only with accredited facilities. Explore our commitment to a secure medical journey.',
    site: '@MedivisorIndiatreatment',
  },
};

// Treatment Cost Page
export const treatmentCostMetadata: Metadata = {
  title: 'Treatment Cost',
  description: 'Get an overview of treatment costs in India with Medivisor India. Transparent pricing for surgeries, IVF, kidney transplant, cancer care, and heart treatments for international patients.',
  keywords: 'Medivisor India treatment cost, medical treatment prices India, surgery cost India, IVF cost India, kidney transplant price, cancer treatment cost, heart treatment cost, international patients',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://medivisorindiatreatment.com/treatment-cost',
  },
  openGraph: {
    title: 'Treatment Cost',
    description: 'Transparent treatment cost overview for international patients. Learn about prices for surgeries, IVF, kidney transplant, cancer care, and heart treatments in India.',
    url: 'https://medivisorindiatreatment.com/treatment-cost',
    siteName: 'Medivisor India Treatment',
    images: [
      {
        url: 'https://medivisorindiatreatment.com/logo_medivisor.png',
        width: 800,
        height: 250,
        alt: 'Medivisor India Treatment Cost',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Treatment Cost',
    description: 'Get clear information on treatment costs for surgeries, IVF, kidney transplant, cancer care, and heart treatments in India with Medivisor.',
    site: '@MedivisorIndiatreatment',
  },
};

// Treatment Process Page
export const treatmentProcessMetadata: Metadata = {
  title: "Treatment Process",
  description:
    "Learn about the Medivisor India treatment process for international patients. From initial consultation to post-treatment care, we ensure a smooth and safe medical journey.",
  keywords:
    "Medivisor India treatment process, medical process India, international patient care, hospital procedures India, treatment steps India, patient journey, medical tourism India",
  robots: "index, follow",
  alternates: {
    canonical: "https://medivisorindiatreatment.com/treatment-process/", // ✅ Canonical Added
  },
  openGraph: {
    title: "Treatment Process",
    description:
      "Step-by-step guide to Medivisor India’s treatment process for international patients, ensuring safe and effective medical care.",
    url: "https://medivisorindiatreatment.com/treatment-process/",
    siteName: "Medivisor India Treatment",
    images: [
      {
        url: "https://medivisorindiatreatment.com/logo_medivisor.png",
        width: 800,
        height: 250,
        alt: "Medivisor India Treatment Process",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Treatment Process",
    description:
      "Explore Medivisor India’s treatment process for international patients, from consultation to post-treatment follow-up.",
    site: "@MedivisorIndiatreatment",
  },
};

// Visa Process Page
export const visaProcessMetadata: Metadata = {
  title: 'Visa Process for Medical Travel',
  description: 'Learn about the step-by-step visa process for international patients seeking medical treatment in India with Medivisor India.',
  keywords: 'Medivisor India visa process, medical visa India, international patient visa, India medical travel, healthcare visa India, medical tourism India',
  robots: 'index, follow',
  openGraph: {
    title: 'Visa Process for Medical Travel',
    description: 'Step-by-step guide for international patients to obtain a medical visa and travel to India for world-class treatment with Medivisor India.',
    url: 'https://medivisorindiatreatment.com/visa-process',
    siteName: 'Medivisor India Treatment',
    images: [
      {
        url: 'https://medivisorindiatreatment.com/logo_medivisor.png',
        width: 800,
        height: 250,
        alt: 'Medivisor India Visa Process',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visa Process for Medical Travel',
    description: 'Medivisor India helps international patients with the medical visa application process and travel guidance to India.',
    site: '@MedivisorIndiatreatment',
  },
};

// Travel Guide Page
export const travelGuideMetadata: Metadata = {
  title: 'Travel Guide for International Patients',
  description: 'Medivisor India provides a comprehensive travel guide for international patients seeking medical treatment in India. Learn about travel tips, accommodation, local transport, and essential guidelines.',
  keywords: 'Medivisor India travel guide, medical travel India, international patient guide, India travel tips, medical tourism India, accommodation for patients, local transport India',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://medivisorindiatreatment.com/travel-guide',
  },
  openGraph: {
    title: 'Travel Guide for International Patients',
    description: 'Plan your medical trip to India with Medivisor India’s travel guide for international patients, including tips on travel, accommodation, and local transport.',
    url: 'https://medivisorindiatreatment.com/travel-guide',
    siteName: 'Medivisor India Treatment',
    images: [
      {
        url: 'https://medivisorindiatreatment.com/og-travel-guide.jpg',
        width: 800,
        height: 250,
        alt: 'Medivisor India Travel Guide',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Travel Guide for International Patients',
    description: 'Get essential travel tips, accommodation guidance, and local transport information for international patients traveling to India for medical treatment.',
    site: '@MedivisorIndiatreatment',
  },
};

// FAQs Page
export const faqsMetadata: Metadata = {
  title: 'FAQs',
  description: 'Find answers to frequently asked questions by international patients seeking medical treatment in India. Get clarity on treatments, costs, travel, and more.',
  keywords: 'Medivisor India FAQs, medical treatment questions, international patients, treatment queries, travel and visa FAQs, cost and hospital information',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://medivisorindiatreatment.com/faqs',
  },
  openGraph: {
    title: 'FAQs',
    description: 'Explore frequently asked questions for international patients planning medical treatment in India with Medivisor India.',
    url: 'https://medivisorindiatreatment.com/faqs',
    siteName: 'Medivisor India Treatment',
    images: [
      {
        url: 'https://medivisorindiatreatment.com/logo_medivisor.png',
        width: 800,
        height: 250,
        alt: 'Medivisor India FAQs',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQs | Medivisor India',
    description: 'Get answers to commonly asked questions for international patients traveling to India for medical treatment.',
    site: '@MedivisorIndiatreatment',
  },
};

// Why Medivisor Page
export const whyMedivisorMetadata: Metadata = {
  title: 'Why Choose Medivisor India? | Leading Medical Tourism',
  description: 'Discover why Medivisor India is the best choice for international patients, offering world-class doctors, accredited hospitals, seamless patient experience, and compassionate care.',
  keywords: 'Why Medivisor India, choose Medivisor, best medical tourism India, world-class healthcare, accredited hospitals, seamless patient journey, medical care India',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://medivisorindiatreatment.com/why-medivisor',
  },
  openGraph: {
    title: 'The Medivisor Advantage: Trust, Quality, and Compassionate Care',
    description: 'Learn about the unique advantages of choosing Medivisor India for your medical treatment, including high standards of safety, transparency, and personalized support.',
    url: 'https://medivisorindiatreatment.com/why-medivisor', // Update the URL
    siteName: 'Medivisor India Treatment',
    images: [
      {
        url: 'https://medivisorindiatreatment.com/why_medivisor_og_banner.png', // Replace with an image showcasing trust or quality
        width: 1200,
        height: 630,
        alt: 'The Medivisor India Advantage',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your Best Choice for Medical Travel: Why Medivisor?',
    description: 'World-class doctors, accredited facilities, and comprehensive support—see why Medivisor India is the trusted partner for your medical journey.',
    site: '@MedivisorIndiatreatment',
  },
};

// Patient Testimonials Page
export const patientTestimonialsMetadata: Metadata = {
  title: 'Patient Testimonials',
  description: 'Read real experiences and success stories from international patients who received treatment in India through Medivisor India. Learn why patients trust us for world-class healthcare.',
  keywords: 'Medivisor India testimonials, patient reviews India, medical treatment feedback, international patient experiences, surgery success stories, medical tourism India',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://medivisorindiatreatment.com/patient-testimonials',
    languages: {
      'en': 'https://medivisorindiatreatment.com/patient-testimonials',
      'ar': 'https://medivisorindiatreatment.com/patient-testimonials',
      'fr': 'https://medivisorindiatreatment.com/patient-testimonials',
      'es': 'https://medivisorindiatreatment.com/patient-testimonials',
      'pt': 'https://medivisorindiatreatment.com/patient-testimonials',
      'ru': 'https://medivisorindiatreatment.com/patient-testimonials',
      'zh-CN': 'https://medivisorindiatreatment.com/patient-testimonials',
      'sw': 'https://medivisorindiatreatment.com/patient-testimonials',
      'am': 'https://medivisorindiatreatment.com/patient-testimonials',
      'ha': 'https://medivisorindiatreatment.com/patient-testimonials',
      'fa': 'https://medivisorindiatreatment.com/patient-testimonials',
      'ur': 'https://medivisorindiatreatment.com/patient-testimonials',
      'uz': 'https://medivisorindiatreatment.com/patient-testimonials',
      'bn': 'https://medivisorindiatreatment.com/patient-testimonials',
      'de': 'https://medivisorindiatreatment.com/patient-testimonials',
      'ja': 'https://medivisorindiatreatment.com/patient-testimonials',
      'it': 'https://medivisorindiatreatment.com/patient-testimonials',
      'pl': 'https://medivisorindiatreatment.com/patient-testimonials',
      'id': 'https://medivisorindiatreatment.com/patient-testimonials',
      'x-default': 'https://medivisorindiatreatment.com/patient-testimonials',
    },
  },
  openGraph: {
    title: 'Patient Testimonials',
    description: 'Discover real experiences of international patients who trusted Medivisor India for their medical treatment in India.',
    url: 'https://medivisorindiatreatment.com/patient-testimonials',
    siteName: 'Medivisor India Treatment',
    images: [
      {
        url: 'https://medivisorindiatreatment.com/logo_medivisor.png',
        width: 800,
        height: 250,
        alt: 'Medivisor India Patient Testimonials',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Patient Testimonials',
    description: 'Read patient reviews and success stories of international patients treated in India through Medivisor India.',
    site: '@MedivisorIndiatreatment',
creator: '@MedivisorIndiatreatment',
    images: ['https://medivisorindiatreatment.com/logo_medivisor.png'],
  },
}

// Media Coverage Page
export const mediaCoverageMetadata: Metadata = {
  title: 'Media Coverage & News',
  description: 'Explore the latest media coverage, press releases, and news articles about Medivisor India’s contributions to international patient care and medical tourism in India.',
  keywords: 'Medivisor India news, media coverage India, press releases, healthcare news, international patient news, medical tourism media, India healthcare news',
  robots: 'index, follow',
  openGraph: {
    title: 'Media Coverage & News',
    description: 'Stay updated with press releases, news articles, and media mentions of Medivisor India.',
    url: 'https://medivisorindiatreatment.com/media-coverage',
    siteName: 'Medivisor India Treatment',
    images: [
      {
        url: 'https://medivisorindiatreatment.com/logo_medivisor.png',
        width: 800,
        height: 250,
        alt: 'Medivisor India Media Coverage',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Media Coverage & News',
    description: 'Discover recent news articles, press releases, and media coverage featuring Medivisor India and international patient care.',
    site: '@MedivisorIndiatreatment',
  },
};

// Contact Page
export const contactMetadata: Metadata = {
  title: "Contact Medivisor India Treatment - Get Medical Tourism Support",
  description:
    "Contact Medivisor India Treatment for medical tourism assistance. Global offices in India, Mauritius, Fiji, Vanuatu, Solomon Islands, and PNG. 24/7 support available.",
  keywords:
    "contact medivisor, medical tourism contact, healthcare support India, international patient assistance",
  openGraph: {
    title: "Contact Medivisor India Treatment - Get Medical Tourism Support",
    description:
      "Reach Medivisor India for expert medical tourism assistance across multiple countries. Our global offices provide 24/7 support to international patients.",
    url: "https://medivisorindiatreatment.com/contact",
    siteName: "Medivisor India",
    type: "website",
    images: [
      {
        url: 'https://medivisorindiatreatment.com/logo_medivisor.png',
        width: 800,
        height: 250,
        alt: "Contact Medivisor India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Medivisor India Treatment",
    description:
      "Connect with Medivisor India for seamless medical tourism assistance and global support for patients.",
    site: "@MedivisorIndiatreatment",
    images: ["/logo-10.png"],
  },
  robots: "index, follow",
  authors: [{ name: "Medivisor India" }],
  metadataBase: new URL("https://medivisorindiatreatment.com"),
};

// PNG Network Metadata
export const pngNetworkMetadata: Metadata = {
  title: 'Serve PNG. Save Lives.',
  description: 'Join the Medivisor Expanded Patient Support Network (PNG) as a Community Health Partner. Help bridge healthcare gaps between Papua New Guinea and India. Earn respect, purpose, skills, and sustainable livelihood while saving lives.',
  keywords: [
    'Medivisor Community Health Partners',
    'PNG Health Ambassador',
    'Medical Support Network PNG',
    'Healthcare Partners Papua New Guinea',
    'Medical Tourism India',
    'Community Health Guide',
    'Patient Support Network',
    'Health Ambassador Program',
    'Medical Support PNG',
    'Healthcare Bridge PNG India'
  ],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://medivisorindiatreatment.com/medivisor-expanded-patient-support-network-png',
  },
  openGraph: {
    title: 'Serve PNG. Save Lives.',
    description: 'Join the Medivisor Expanded Patient Support Network (PNG) as a Community Health Partner. Help bridge healthcare gaps between Papua New Guinea and India.',
    url: 'https://medivisorindiatreatment.com/medivisor-expanded-patient-support-network-png',
    siteName: 'Medivisor India Treatment',
    images: [
      {
        url: 'https://medivisorindiatreatment.com/PNG-Web-Banner-fb.jpg',
        width: 1200,
        height: 630,
        alt: 'Medivisor Community Health Partners PNG',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Serve PNG. Save Lives.',
    description: 'Join the Medivisor Expanded Patient Support Network (PNG) as a Community Health Partner.',
    site: '@MedivisorIndia',
    images: ['https://medivisorindiatreatment.com/PNG-Web-Banner-fb.jpg'],
  },
};
// ====================================================================
// 5. LOCALIZED METADATA GENERATOR
// ====================================================================

import { LOCALES, DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config'

export function getLocalizedMetadata(locale: Locale): Metadata {
  const isHi = locale === 'hi'
  const siteUrl = 'https://medivisorindiatreatment.com'

  return {
    title: {
      default: isHi
        ? 'मेडिविसर इंडिया ट्रीटमेंट - भारत में सर्वश्रेष्ठ चिकित्सा पर्यटन'
        : 'Medivisor India Treatment - World Class Healthcare For International Patients',
      template: isHi ? `%s | मेडिविसर इंडिया ट्रीटमेंट` : `%s | Medivisor India Treatment`,
    },
    description: isHi
      ? '3,500+ रोगियों को सफलतापूर्वक उपचारित। मेडिविसर इंडिया ट्रीटमेंट अंतरराष्ट्रीय रोगियों के लिए विश्वस्तरीय, किफायती चिकित्सा उपचार प्रदान करता है।'
      : 'Proudly treated 3,500+ patients worldwide. Medivisor India Treatment offers world-class, affordable medical treatments for international patients.',
    keywords: isHi
      ? ['मेडिविसर इंडिया', 'चिकित्सा पर्यटन भारत', 'किफायती चिकित्सा उपचार', 'अंतरराष्ट्रीय रोगी देखभाल']
      : [
          'Medivisor India Treatment',
          'medical tourism India',
          'affordable medical treatment',
          'international patient care',
          'surgery in India',
          'IVF treatment India',
          'kidney transplant India',
          'cancer treatment India',
          'heart treatment India',
          'best hospitals India',
          'expert doctors',
          'world-class healthcare',
        ],
    alternates: {
      canonical: siteUrl,
      languages: {
        'en': siteUrl,
        'hi': siteUrl,
        'x-default': siteUrl,
      },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'hi' ? 'hi_IN' : 'en_US',
      alternateLocale: locale === 'hi' ? ['en_US'] : ['hi_IN'],
      url: siteUrl,
      siteName: 'Medivisor India Treatment',
      title: isHi
        ? 'मेडिविसर इंडिया ट्रीटमेंट - भारत में सर्वश्रेष्ठ चिकित्सा पर्यटन'
        : 'Medivisor India Treatment - World Class Healthcare For International Patients',
      description: isHi
        ? '3,500+ रोगियों को सफलतापूर्वक उपचारित। मेडिविसर इंडिया ट्रीटमेंट अंतरराष्ट्रीय रोगियों के लिए विश्वस्तरीय, किफायती चिकित्सा उपचार प्रदान करता है।'
        : 'Proudly treated 3,500+ patients worldwide.',
      images: [
        {
          url: '/banner/homepage.png',
          width: 800,
          height: 250,
          alt: 'Medivisor India Treatment - Premium Medical Care',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: isHi
        ? 'मेडिविसर इंडिया ट्रीटमेंट - भारत में सर्वश्रेष्ठ चिकित्सा पर्यटन'
        : 'Medivisor India Treatment - World Class Healthcare For International Patients',
      description: isHi
        ? '3,500+ रोगियों को सफलतापूर्वक उपचारित।'
        : 'Proudly treated 3,500+ patients worldwide.',
      site: '@Medivisorindiatreatment',
      creator: '@Medivisorindiatreatment',
      images: ['/banner/homepage.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: '746594929470-busv549t5tat92misjbn6jcercqd5886.apps.googleusercontent.com',
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
    },
  }
}
