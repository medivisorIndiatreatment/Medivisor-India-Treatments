// app/sitemap.ts
// Dynamic sitemap generation for all pages including dynamic routes
// Uses direct service imports to avoid Next.js data cache and 2MB limit

import { generateSlug, generateBranchSlug, generateUniqueSlug } from '@/lib/slug-utils'
import { wixServerClient } from '@/lib/wix'
import { getDepartments } from '@/lib/services/departments'
import { getTreatments } from '@/lib/services/treatments'
import { getHospitalGroups } from '@/lib/services/hospital-groups'
import { fetchAllTechnologies, getAllCMSData } from '@/lib/cms'
import { getAllDoctors } from '@/lib/services/doctors'

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://medivisorindiatreatment.com').replace(/\/$/, '')

// Sitemap generation performs several CMS reads; keep the generated result cached
// between requests instead of rebuilding the full URL graph on every crawl.
export const revalidate = 3600

// Static pages that should always be in sitemap
const staticPages = [
  { url: '/', priority: 1.0, changefreq: 'daily' as const },
  { url: '/search', priority: 0.9, changefreq: 'daily' as const },
  { url: '/aboutus', priority: 0.8, changefreq: 'monthly' as const },
  { url: '/services', priority: 0.9, changefreq: 'weekly' as const },
  { url: '/team', priority: 0.7, changefreq: 'weekly' as const },
  { url: '/medical-advisors', priority: 0.7, changefreq: 'weekly' as const },
  { url: '/hospital-network', priority: 0.8, changefreq: 'daily' as const },
  { url: '/safety-measures', priority: 0.6, changefreq: 'monthly' as const },
  { url: '/treatment-cost', priority: 0.8, changefreq: 'weekly' as const },
  { url: '/treatment-process', priority: 0.7, changefreq: 'monthly' as const },
  { url: '/treatment-service', priority: 0.8, changefreq: 'weekly' as const },
  { url: '/visa-process', priority: 0.7, changefreq: 'monthly' as const },
  { url: '/visa-form', priority: 0.7, changefreq: 'monthly' as const },
  { url: '/travel-guide', priority: 0.6, changefreq: 'monthly' as const },
  { url: '/faqs', priority: 0.6, changefreq: 'monthly' as const },
  { url: '/patient-testimonials', priority: 0.7, changefreq: 'weekly' as const },
  { url: '/photo-albums', priority: 0.5, changefreq: 'weekly' as const },
  { url: '/media-coverage', priority: 0.5, changefreq: 'monthly' as const },
  { url: '/blog', priority: 0.8, changefreq: 'daily' as const },
  { url: '/contact', priority: 0.9, changefreq: 'monthly' as const },
  { url: '/why-medivisor', priority: 0.7, changefreq: 'monthly' as const },
  { url: '/our-initiatives', priority: 0.5, changefreq: 'monthly' as const },
  { url: '/medivisor-expanded-patient-support-network', priority: 0.6, changefreq: 'monthly' as const },
  { url: '/medivisor-expanded-patient-support-network-png', priority: 0.6, changefreq: 'monthly' as const },
  { url: '/social-activity', priority: 0.5, changefreq: 'monthly' as const },
  { url: '/categories/patient-activities', priority: 0.5, changefreq: 'monthly' as const },
  { url: '/fiji-eye-test', priority: 0.3, changefreq: 'yearly' as const },
  { url: '/epsp-form', priority: 0.4, changefreq: 'yearly' as const },
]

// Fetch all blog posts from Wix directly
async function fetchAllBlogPosts() {
  const allPosts: any[] = []
  let offset = 0
  const limit = 50
  try {
    while (true) {
      const result = await wixServerClient.posts.listPosts({
        paging: { limit, offset },
        sort: 'PUBLISHED_DATE_DESC'
      })
      const posts = result.posts ?? []
      allPosts.push(...posts)
      if (posts.length < limit) break
      offset += limit
      if (offset > 200) break
    }
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error)
  }
  return allPosts
}

async function fetchAllBlogCategories() {
  const allCategories: any[] = []
  try {
    const result = await (wixServerClient as any).categories.listCategories({})
    const cats = result.categories ?? []
    allCategories.push(...cats)
  } catch (error) {
    console.error('Error fetching blog categories for sitemap:', error)
  }
  return allCategories
}

export default async function sitemap() {
  const staticUrls = staticPages.map((page) => ({
    url: `${BASE_URL}${page.url}`,
    lastModified: new Date(),
    changeFrequency: page.changefreq,
    priority: page.priority,
  }))

  let dynamicUrls: typeof staticUrls = []

  try {
    // Fetch data directly from services (bypassing API routes) to avoid 2MB cache limit
    // Use reasonable page sizes; services use memoryCache for speed
    const [deptResult, treatResult, hospitalResult, blogPosts, blogCategories, technologies] = await Promise.all([
      getDepartments({ page: 0, pageSize: 1000 }),
      getTreatments({ page: 0, pageSize: 1000 }),
      getHospitalGroups({ page: 0, pageSize: 1000 }),
      fetchAllBlogPosts(),
      fetchAllBlogCategories(),
      fetchAllTechnologies(),
    ])

    // Department URLs
    const departmentUrls = (deptResult.items || [])
      .filter((dept: any) => dept?.slug)
      .map((dept: any) => ({
        url: `${BASE_URL}/department/${dept.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))

    // Treatment URLs - generate slug from name if missing
    const treatmentUrls = (treatResult.items || [])
      .filter((treat: any) => treat?.name)
      .map((treat: any) => {
        const slug = treat.slug || generateSlug(treat.name)
        return {
          url: `${BASE_URL}/treatment/${slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }
      })

    // Hospital Group URLs
    const hospitalGroupUrls = (hospitalResult.items || [])
      .filter((hospital: any) => hospital?.slug)
      .map((hospital: any) => ({
        url: `${BASE_URL}/hospital-groups/${hospital.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))

    // Blog post URLs
    const blogUrls = (blogPosts as any[])
      .filter((post: any) => post?.slug)
      .map((post: any) => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: new Date(post.publishedDate || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))

    // Blog category URLs
    const blogCategorySlugs = new Set<string>()
    const blogCategoryUrls: { url: string; lastModified: Date; changeFrequency: 'weekly'; priority: number }[] = []
    for (const cat of (blogCategories as any[])) {
      if (!cat?.slug) continue
      const catSlug = typeof cat.slug === 'string' ? cat.slug : cat.slug?.slug || cat.slug?.name
      if (!catSlug || blogCategorySlugs.has(catSlug)) continue
      blogCategorySlugs.add(catSlug)
      blogCategoryUrls.push({
        url: `${BASE_URL}/blog/categories/${catSlug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    }

    // Medical Advisor URLs
    const advisorSlugs = new Set<string>()
    const advisorUrls: { url: string; lastModified: Date; changeFrequency: 'weekly'; priority: number }[] = []
    try {
      const advisorsRes = await wixServerClient.items
        .query('Import2')
        .limit(1000)
        .find({ consistentRead: true })
      for (const item of (advisorsRes.items || [])) {
        if (!item.slug && !item.name) continue
        const advSlug = item.slug || generateSlug(item.name || '')
        if (advisorSlugs.has(advSlug)) continue
        advisorSlugs.add(advSlug)
        advisorUrls.push({
          url: `${BASE_URL}/medical-advisors/${advSlug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        })
      }
    } catch {
      // Silently skip advisor URLs on error
    }

    // Team member URLs
    const teamSlugSet = new Set<string>()
    const teamUrls: { url: string; lastModified: Date; changeFrequency: 'weekly'; priority: number }[] = []
    try {
      const teamRes = await wixServerClient.items
        .query('Team1')
        .limit(1000)
        .find({ consistentRead: true })
      for (const item of (teamRes.items || [])) {
        const itemData = item.data || item
        const memberName = itemData.name || itemData.title || item.Name || ''
        if (!memberName) continue
        const memberId = itemData._id || item._id || ''
        const tSlug = memberId ? generateUniqueSlug(memberName, memberId) : generateSlug(memberName)
        if (teamSlugSet.has(tSlug)) continue
        teamSlugSet.add(tSlug)
        teamUrls.push({
          url: `${BASE_URL}/team/${tSlug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        })
      }
    } catch {
      // Silently skip team URLs on error
    }

    // Photo album (happy moments) URLs
    const albumIdSet = new Set<string>()
    const albumUrls: { url: string; lastModified: Date; changeFrequency: 'weekly'; priority: number }[] = []
    try {
      const albumsRes = await (wixServerClient as any).items
        .query('photo-album')
        .limit(1000)
        .find({ consistentRead: true })
      for (const item of (albumsRes.items || [])) {
        const mid = item._id || item.id
        if (!mid || albumIdSet.has(mid)) continue
        albumIdSet.add(mid)
        albumUrls.push({
          url: `${BASE_URL}/photo-albums/${mid}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.5,
        })
      }
    } catch {
      // Silently skip album URLs on error
    }

    // Technology URLs
    const techSlugs = new Set<string>()
    const technologyUrls: { url: string; lastModified: Date; changeFrequency: 'weekly'; priority: number }[] = []
    for (const tech of (technologies as any[])) {
      if (!tech?.Heading && !tech?.heading && !tech?.slug) continue
      const techSlug = tech.slug || generateSlug(tech.Heading || tech.heading || '')
      if (techSlugs.has(techSlug)) continue
      techSlugs.add(techSlug)
      technologyUrls.push({
        url: `${BASE_URL}/technology/${techSlug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    }

    // Doctor URLs
    const doctorSlugs = new Set<string>()
    const doctorUrls: { url: string; lastModified: Date; changeFrequency: 'weekly'; priority: number }[] = []
    try {
      const doctors = await getAllDoctors()
      for (const doc of doctors) {
        if (!doc?.slug && !doc?.doctorName) continue
        const docSlug = doc.slug || generateSlug(doc.doctorName || '')
        if (doctorSlugs.has(docSlug)) continue
        doctorSlugs.add(docSlug)
        doctorUrls.push({
          url: `${BASE_URL}/doctors/${docSlug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        })
      }
    } catch {
      // Silently skip doctor URLs on error
    }

    // Branch URLs from CMS data
    const branchUrls: { url: string; lastModified: Date; changeFrequency: 'weekly'; priority: number }[] = []
    try {
      const { hospitals } = await getAllCMSData()
      const branchSlugs = new Set<string>()
      for (const hospital of hospitals) {
        const branches = hospital.branches || []
        for (const branch of branches) {
          if (!branch?.branchName) continue
          const cityData: any = Array.isArray(branch.city) ? branch.city[0] : branch.city
          const cityName = typeof cityData === 'string'
            ? cityData.trim()
            : cityData && typeof cityData === 'object'
              ? cityData.cityName || cityData.name || cityData.city || ''
              : ''
          const branchSlug = generateSlug(branch.branchName || '') + (cityName && !(branch.branchName || '').toLowerCase().includes(String(cityName).toLowerCase()) ? `-${generateSlug(String(cityName))}` : '')
          if (branchSlugs.has(branchSlug)) continue
          branchSlugs.add(branchSlug)
          branchUrls.push({
            url: `${BASE_URL}/hospital-branches/${branchSlug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
          })
        }
      }
    } catch {
      // Silently skip branch URLs on error
    }

    dynamicUrls = [
      ...departmentUrls,
      ...treatmentUrls,
      ...hospitalGroupUrls,
      ...blogUrls,
      ...blogCategoryUrls,
      ...technologyUrls,
      ...doctorUrls,
      ...branchUrls,
      ...advisorUrls,
      ...teamUrls,
      ...albumUrls,
    ]
  } catch (error) {
    console.error('[Sitemap] Failed to fetch dynamic pages:', error)
  }

  const uniqueUrls = new Map<string, (typeof staticUrls)[number]>()
  for (const entry of [...staticUrls, ...dynamicUrls]) {
    if (!uniqueUrls.has(entry.url)) uniqueUrls.set(entry.url, entry)
  }
  return Array.from(uniqueUrls.values())
}
