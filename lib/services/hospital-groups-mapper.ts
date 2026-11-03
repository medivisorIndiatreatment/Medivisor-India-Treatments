import { getWixImageUrl, getWixScaledToFillImageUrl } from "@/lib/wixMedia"
import { generateSlug, generateBranchSlug } from "@/lib/slug-utils"
import { mapToDelhiNCR } from "@/lib/utils/city-utils"
import type { HospitalGroup } from "./hospital-groups"

export interface MappedGroup {
  _id: string
  name: string
  slug: string
  image: string
  logo?: string
  yearEstablished?: string
  branchCount: number
  branches: string
  specialty: string
  isStandalone: boolean
  standaloneBranchSlug?: string
}

export function mapGroup(group: HospitalGroup): MappedGroup {
  const wixImage = group.hospitalImage || undefined
  let imageUrl = getWixScaledToFillImageUrl(wixImage, 800, 600)
  if (!imageUrl) {
    imageUrl = getWixImageUrl(wixImage) || group.hospitalImage || "/placeholder.svg"
  }

  const logoUrl = group.logo ? getWixImageUrl(group.logo) || group.logo : undefined

  const branches = group.branches || []
  const branchNames = branches
    .map((b: any) => {
      const cityData = b.city
      if (Array.isArray(cityData) && cityData.length > 0) {
        const cityName = cityData[0]?.cityName || cityData[0]?.name || cityData[0] || ""
        return mapToDelhiNCR(String(cityName))
      }
      return typeof cityData === "string" ? mapToDelhiNCR(cityData) : ""
    })
    .filter(Boolean)

  const uniqueCities = [...new Set(branchNames)]
  const locationText = uniqueCities.length > 0
    ? uniqueCities.slice(0, 3).join(", ") + (uniqueCities.length > 3 ? ` +${uniqueCities.length - 3}` : "")
    : "Multiple Locations"

  const specName = group.specialty?.[0]?.name || "Multi Specialty"
  const slug = group.slug || generateSlug(group.hospitalName)

  const isStandalone = (group.hospitalList?.length || 0) <= 1 && branches.length <= 1
  let standaloneBranchSlug: string | undefined
  if (isStandalone) {
    const branch = branches[0]
    const branchName = branch.branchName || branch.hospitalName || group.hospitalName
    const cityRaw = Array.isArray(branch.city) ? branch.city[0]?.cityName || branch.city[0]?.name || branch.city[0] : branch.city
    const cityName = typeof cityRaw === "string" ? cityRaw : ""
    standaloneBranchSlug = cityName
      ? generateBranchSlug(branchName, cityName)
      : generateSlug(branchName)
  }

  return {
    _id: group._id,
    name: group.hospitalName,
    slug,
    image: imageUrl,
    logo: logoUrl,
    yearEstablished: group.yearEstablished || undefined,
    branchCount: branches.length,
    branches: locationText,
    specialty: specName,
    isStandalone,
    standaloneBranchSlug,
  }
}
