import AboutPage from './AboutPage'
import { Metadata } from 'next'
import { aboutMetadata } from '@/app/metadata'
import { getAllHospitalGroups } from '@/lib/services/hospital-groups'
import { mapGroup } from '@/lib/services/hospital-groups-mapper'

export const metadata: Metadata = aboutMetadata

export default async function Page() {
  const groups = await getAllHospitalGroups()
  const initialGroups = groups.map(mapGroup)

  return <AboutPage initialGroups={initialGroups} />
}
