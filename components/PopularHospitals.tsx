"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import ContactModal from "@/components/ContactModal"
import { useRouter } from "next/navigation"
import { SECTION_INDEX } from "@/components/design-tokens"
import {
  mapNormalizedLocationToBranchCard,
  type NormalizedLocation,
} from '@/lib/services/homepage/transformers'
import HospitalSection from "@/components/sections/HospitalSection"

interface PopularHospitalsSectionProps {
  initialLocations?: NormalizedLocation[]
}

export default function PopularHospitalsSection({ initialLocations }: PopularHospitalsSectionProps) {
  const router = useRouter()
  const [hospitals, setHospitals] = useState<NormalizedLocation[]>(initialLocations ?? [])
  const [allBranches, setAllBranches] = useState<NormalizedLocation[]>(initialLocations ?? [])
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchInputValue, setSearchInputValue] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(initialLocations === undefined || initialLocations.length === 0)
  const [fetchAttempted, setFetchAttempted] = useState(false)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchInputValue), 150)
    return () => clearTimeout(timer)
  }, [searchInputValue])

  // Client-side fallback: fetch branches from API when server data is empty
  useEffect(() => {
    if (hospitals.length > 0) {
      return
    }

    if (fetchAttempted) {
      return
    }

    const fetchBranches = async () => {
      setIsLoading(true)
      setFetchAttempted(true)
      try {
        const response = await fetch('/api/branches?pageSize=1000')
        if (!response.ok) {
          throw new Error(`Failed to fetch branches: ${response.status} ${response.statusText}`)
        }
        const data = await response.json()
        const rawBranches = data.items || []

        const normalized = rawBranches
          .filter((branch: any) => branch.branchName && branch.hospitalName)
          .map((branch: any, index: number) => {
            const imageUrl = branch.branchImage || branch.logo || "/placeholder.svg"
            const { cityName, state: location } = (() => {
              if (!branch.city || !Array.isArray(branch.city)) return { cityName: '', state: '' }
              const c = branch.city[0]
              const cn = c?.cityName || c?.name || ''
              const s = c?.state || c?.State || ''
              return { cityName: cn, state: s ? `${cn}, ${s}` : cn }
            })()

            return {
              _id: branch._id || branch.ID || `branch-${index}`,
              name: branch.branchName,
              slug: branch.slug || branch.branchName.toLowerCase().replace(/\s+/g, '-'),
              image: imageUrl,
              branchId: branch._id || '',
              address: branch.address || '',
              city: branch.city || [],
              location: location || '',
              hospitalName: branch.hospitalName || '',
              hospitalId: branch.hospitalId || '',
              hospitalSlug: branch.hospitalSlug || '',
              isStandalone: !!branch.hospitalId && !branch.hospitalGroup,
              hospitalLinkType: 'hospital-branches',
              popular: branch.popular || false,
              specialty: branch.specialty?.name || branch.specialty || 'Multi Specialty',
              specialization: branch.specialization || [],
              specialities: branch.specialities || [],
              accreditation: branch.accreditation || [],
              totalBeds: branch.totalBeds ? parseInt(String(branch.totalBeds), 10) : 0,
              noOfDoctors: branch.noOfDoctors ? parseInt(String(branch.noOfDoctors), 10) : 0,
              yearEstablished: branch.yearEstablished ? parseInt(String(branch.yearEstablished), 10) : undefined,
              logo: branch.logo || null,
              department: branch.department || [],
            } as NormalizedLocation
          })

        if (normalized.length === 0) {
          setError("No hospitals are currently available for display")
        } else {
          setError(null)
          setHospitals(normalized)
          setAllBranches(normalized)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load hospitals")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBranches()
  }, [fetchAttempted])

  // Carousel hospitals - memoized
  const carouselHospitals = useMemo(() => {
    const branchOnly = hospitals.filter(h => h.name?.trim())

    if (!debouncedSearchTerm) {
      return branchOnly
    }

    const term = debouncedSearchTerm.toLowerCase()
    return branchOnly.filter(h =>
      (h.hospitalName?.toLowerCase().includes(term)) ||
      (h.location?.toLowerCase().includes(term)) ||
      (h.specialty?.toLowerCase().includes(term))
    )
  }, [hospitals, debouncedSearchTerm])

  // Search options - memoized - includes ALL branches for proper search/redirect
  const searchOptions = useMemo(() => {
    const branchOnly = allBranches.filter(b => b.name?.trim())
    return branchOnly.map(branch => {
      const cityOnly = branch.location?.split(',')[0].trim() || ''
      return {
        id: branch._id,
        name: `${branch.hospitalName}${cityOnly ? ` (${cityOnly})` : ''}`,
      }
    })
  }, [allBranches])

  const handleSelect = useCallback((id: string) => {
    const branch = allBranches.find((b) => b._id === id)
    if (branch && branch.slug) {
      router.push(`/hospital-branches/${branch.slug}`)
    } else if (branch && branch.hospitalSlug) {
      router.push(`/hospital-branches/${branch.hospitalSlug}`)
    }
  }, [allBranches, router])

  // Convert NormalizedLocation to BranchCardData for HospitalSection
  const branchCardData = useMemo(() => {
    return hospitals.map(mapNormalizedLocationToBranchCard)
  }, [hospitals])

  return (
    <>
      <HospitalSection
        hospitals={branchCardData}
        title="Top Multi-Specialty Hospitals in India"
        visualIndex={SECTION_INDEX.POPULAR_HOSPITALS}
        loading={isLoading}
        error={error}
        retryCallback={() => {
          setFetchAttempted(false)
          setHospitals([])
          setAllBranches([])
          setError(null)
          window.location.reload()
        }}
        showSearch={true}
      />

      <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
