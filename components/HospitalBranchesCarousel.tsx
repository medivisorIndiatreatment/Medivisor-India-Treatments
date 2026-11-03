"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Building2, Search } from "lucide-react"
import SectionHeading from "@/components/ui/SectionHeading"
import HomepageCarousel from "@/components/ui/HomepageCarousel"
import { getWixImageUrl } from "@/lib/wixMedia"
import { fetchAllBranches } from "@/lib/cms"
import {
  extractCityInfo,
  checkPopular,
  shouldShowHospital,
  generateBranchSlug,
} from '@/lib/services/homepage/utils'
import HospitalCard, { type HospitalCardData } from "@/components/ui/HospitalCard"
import SearchDropdown from "@/components/ui/SearchDropdown"
import { DESIGN_TOKENS, getAlternatingBackground } from "@/components/design-tokens"
import { transformBranch, mapNormalizedLocationToBranchCard, type NormalizedLocation } from '@/lib/services/homepage/transformers'
import { Trans } from '@/lib/i18n/Trans'
import { useI18n } from '@/lib/i18n'

const isValidUrl = (url: string): boolean => {
  if (!url || url === '/placeholder.svg') return false
  if (url.startsWith('/') && !url.startsWith('http')) return true
  if (url.startsWith('http://') || url.startsWith('https://')) {
    const afterProtocol = url.slice(url.indexOf('://') + 3)
    const slashIndex = afterProtocol.indexOf('/')
    const hostname = slashIndex > 0 ? afterProtocol.slice(0, slashIndex) : afterProtocol
    return hostname.length > 0 && hostname.includes('.')
  }
  return false
}

const getStringValue = (val: any, fallback = ''): string => {
  if (!val) return fallback
  if (typeof val === 'string') return val
  if (typeof val === 'object') return val.name || val.title || val.value || fallback
  return fallback
}

interface HospitalBranchesCarouselProps {
  title: string
  titleI18nKey?: string
  subtitle?: string
  hospitals?: any[]
  initialSearchTerm?: string
  showSearch?: boolean
  autoplay?: boolean
  autoplayDelay?: number
  className?: string
  filterCity?: string
  excludeBranchId?: string
  filterDepartment?: string
  filterTestDiagnosis?: string
  showOnlyPopular?: boolean
}

export default function HospitalBranchesCarousel({
  title,
  titleI18nKey,
  subtitle,
  hospitals,
  initialSearchTerm = "",
  showSearch = true,
  autoplay = true,
  autoplayDelay = 4000,
  className = "",
  filterCity,
  excludeBranchId,
  filterDepartment,
  filterTestDiagnosis,
  showOnlyPopular = false
}: HospitalBranchesCarouselProps) {
  const { t } = useI18n()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [loading, setLoading] = useState(true)
  const [allBranches, setAllBranches] = useState<NormalizedLocation[]>([])
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const fetchAttemptedRef = useRef(false)

  const processBranches = useCallback((hospitalsData: any[]): NormalizedLocation[] => {
    const branchMap = new Map<string, NormalizedLocation>()

    hospitalsData.forEach((hospital: any) => {
      const hospitalBranches = hospital.branches || hospital.data?.branches || []

      if (hospitalBranches && Array.isArray(hospitalBranches)) {
        hospitalBranches.forEach((branch: any) => {
          if (!branch._id && !branch.id && !branch.ID) return
          if (!shouldShowHospital(branch)) return

          const branchId = branch._id || branch.id || branch.ID
          if (branchMap.has(branchId)) return

          const transformed = transformBranch(branch, hospital, { computeSlug: true })
          branchMap.set(branchId, transformed)
        })
      }
    })

    return Array.from(branchMap.values()).sort((a, b) => {
      const nameA = getStringValue(a.branchName || a.name, '').toLowerCase()
      const nameB = getStringValue(b.branchName || b.name, '').toLowerCase()
      return nameA.localeCompare(nameB)
    })
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadBranches() {
      setLoading(true)

      try {
        if (hospitals && hospitals.length > 0) {
          const processedBranches = processBranches(hospitals)
          if (isMounted) {
            setAllBranches(processedBranches)
            setLoading(false)
          }
        } else if (!fetchAttemptedRef.current) {
          fetchAttemptedRef.current = true
          const branches = await fetchAllBranches(false)
          const transformed = branches.map((branch: any) => transformBranch(branch, null, { computeSlug: true }))
          if (isMounted) {
            setAllBranches(transformed)
            setLoading(false)
          }
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Error loading branches:', error)
        if (isMounted) {
          setAllBranches([])
          setLoading(false)
        }
      }
    }

    loadBranches()
    return () => { isMounted = false }
  }, [hospitals, processBranches])

  const filteredBranches = useMemo(() => {
    let filtered = allBranches

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(branch => {
        const branchName = getStringValue(branch.branchName || branch.name, '').toLowerCase()
        const hospitalName = getStringValue(branch.hospitalName, '').toLowerCase()
        const location = getStringValue(branch.location, '').toLowerCase()
        const specialty = getStringValue(branch.specialty, '').toLowerCase()

        return branchName.includes(term) ||
          hospitalName.includes(term) ||
          location.includes(term) ||
          specialty.includes(term)
      })
    }

    if (filterDepartment && !searchTerm) {
      const deptLower = filterDepartment.toLowerCase()
      filtered = filtered.filter(branch => {
        const branchDepts = branch.department || []
        if (!branchDepts || branchDepts.length === 0) return false

        return branchDepts.some((dept: any) => {
          const deptName = getStringValue(dept, '').toLowerCase()
          return deptName.includes(deptLower) || deptName === deptLower
        })
      })
    }

    if (filterTestDiagnosis && !searchTerm) {
      const testDiagnosisLower = filterTestDiagnosis.toLowerCase()
      filtered = filtered.filter(branch => {
        const branchTestDiagnoses = branch.testDiagnosis || []
        if (!branchTestDiagnoses || branchTestDiagnoses.length === 0) return false

        return branchTestDiagnoses.some((td: any) => {
          const tdName = getStringValue(td, '').toLowerCase()
          return tdName.includes(testDiagnosisLower) || tdName === testDiagnosisLower
        })
      })
    }

    return filtered
  }, [allBranches, searchTerm, filterDepartment, filterTestDiagnosis])

  const carouselBranches = useMemo(() => {
    let carouselFiltered = filteredBranches

    if (filterCity && !searchTerm) {
      const cityLower = filterCity.toLowerCase()
      carouselFiltered = carouselFiltered.filter(branch => {
        const { cityName } = extractCityInfo(branch)
        const branchLocation = branch.location?.toLowerCase() || ''
        const cityNameLower = cityName.toLowerCase()

        const isDelhiNCRFilter = cityLower === 'delhi ncr'
        const isDelhiNCRBranch =
          cityNameLower.includes('delhi') ||
          cityNameLower.includes('noida') ||
          cityNameLower.includes('gurgaon') ||
          cityNameLower.includes('gurugram') ||
          cityNameLower.includes('faridabad') ||
          cityNameLower.includes('ghaziabad') ||
          branchLocation.includes('delhi ncr')

        if (isDelhiNCRFilter) {
          return isDelhiNCRBranch || branchLocation.includes(cityLower)
        }
        return cityNameLower.includes(cityLower) || branchLocation.includes(cityLower)
      })
    }

    if (showOnlyPopular && !searchTerm) {
      carouselFiltered = carouselFiltered.filter(branch => checkPopular(branch))
    }

    if (excludeBranchId && !searchTerm) {
      carouselFiltered = carouselFiltered.filter(branch => branch._id !== excludeBranchId)
    }

    return carouselFiltered
  }, [filteredBranches, filterCity, searchTerm, excludeBranchId, showOnlyPopular])

  const searchOptions = useMemo(() => {
    return allBranches.map(branch => {
      const { cityName } = extractCityInfo(branch)
      const hospitalName = branch.hospitalName || branch.name || ''
      let displayName = getStringValue(branch.branchName || branch.name, 'Hospital')

      if (cityName && cityName.trim() !== '') {
        displayName = `${displayName} (${cityName})`
      }

      return {
        id: branch._id,
        name: displayName,
        type: 'branch' as const,
      }
    }).sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
  }, [allBranches])

  const handleSearchSelect = useCallback((id: string) => {
    const branch = allBranches.find(b => b._id === id)
    if (branch) {
      setSearchTerm("")
      router.push(`/hospital-branches/${branch.hospitalSlug || branch.slug}`)
    }
  }, [allBranches, router])

  const handleSearchClear = useCallback(() => {
    setSearchTerm("")
  }, [])

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
  }, [])

  const mapToHospitalCardData = useCallback((branch: NormalizedLocation): HospitalCardData => {
    const card = mapNormalizedLocationToBranchCard(branch)
    return {
      ...card,
      branchImage: card.image || '/placeholder.svg',
      image: card.image || '/placeholder.svg',
      accreditation: (card.accreditation || []).map((acc) => ({
        _id: acc._id || '',
        image: acc.image,
        title: acc.title,
        logo: acc.logo,
      })),
    }
  }, [])

  if (loading) {
    return (
      <section className={`${DESIGN_TOKENS.BACKGROUNDS.WHITE} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-2 md:mb-4 px-2">
            <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-96 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
                <div className="h-48 bg-gray-100 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (carouselBranches.length === 0 && !loading) {
    return null
  }

  if (filteredBranches.length === 0 && searchTerm) {
    return (
      <section className={`${DESIGN_TOKENS.BACKGROUNDS.WHITE} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING} max-w-2xl`}>
          <SectionHeading
            title={title}
            titleI18nKey={titleI18nKey}
            subtitle={subtitle}
            className="mb-5 md:mb-8"
          />
          {showSearch && (
            <div className="w-full max-w-md mx-auto mb-6">
              <SearchDropdown
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={t("Search hospitals by name or city")}
                options={searchOptions}
                onOptionSelect={handleSearchSelect}
                onClear={handleSearchClear}
                type="branch"
                maxHeight={300}
              />
            </div>
          )}
          <Building2 className="w-12 h-12 md:w-16 md:h-16 mx-auto text-gray-300 mb-3 md:mb-4" />
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">
            <Trans id="hospital-carousel.no-results">No hospitals found</Trans>
          </h3>
          <p className="text-base md:text-base text-gray-900">
            <Trans id="hospital-carousel.try-adjusting">Try adjusting your search</Trans>
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className={`${DESIGN_TOKENS.BACKGROUNDS.GRAY_LIGHT} ${DESIGN_TOKENS.SECTION_SPACING.PY} ${className}`}>
      <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-2 md:mb-4 px-2">
          <SectionHeading
            title={title}
            titleI18nKey={titleI18nKey}
            subtitle={subtitle}
            className="!mb-0"
          />

          {showSearch && (
            <div className="relative w-full md:w-85">
              <SearchDropdown
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search Hospitals"
                placeholderI18nKey="search.hospitals"
                options={searchOptions}
                onOptionSelect={handleSearchSelect}
                onClear={handleSearchClear}
                type="branch"
                maxHeight={300}
              />
            </div>
          )}
        </div>

        <div className="overflow-hidden">
          <HomepageCarousel autoplay>
            {carouselBranches.map((branch, index) => (
              <div key={branch._id}>
                <HospitalCard
                  data={mapToHospitalCardData(branch)}
                  index={index}
                  hoveredIndex={hoveredIndex}
                  onHover={setHoveredIndex}
                  showStats={true}
                  showAccreditation={true}
                  showLogo={true}
                />
              </div>
            ))}
          </HomepageCarousel>
        </div>
      </div>
    </section>
  )
}
