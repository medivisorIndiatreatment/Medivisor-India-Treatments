import { Metadata } from 'next'
import { defaultMetadata } from '@/app/metadata'
import HomepageClient from './HomepageClient'
import { fetchHomepageData } from '@/lib/services/homepage'

export async function generateMetadata(): Promise<Metadata> {
  return defaultMetadata
}

export const revalidate = 300

export default async function HomePage() {
  const homepageData = await fetchHomepageData()
  return <HomepageClient data={homepageData} />
}
