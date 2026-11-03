'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import SectionHeading from '@/components/ui/SectionHeading'
import { DESIGN_TOKENS } from '@/components/design-tokens'
import { getAllHospitalGroups, HospitalGroup } from '@/lib/services/hospital-groups'
import { mapGroup, type MappedGroup } from '@/lib/services/hospital-groups-mapper'
import { getWixImageUrl, getWixScaledToFillImageUrl } from '@/lib/wixMedia'
import { generateSlug, generateBranchSlug } from '@/lib/slug-utils'
import { mapToDelhiNCR } from '@/lib/utils/city-utils'
import HomepageCarousel from '@/components/ui/HomepageCarousel'
import Image from 'next/image'
import { AlertCircle } from 'lucide-react'
import ContactModal from '@/components/ContactModal'
import HospitalSection from '@/components/sections/HospitalSection'
import type { BranchCardData } from '@/components/cards/types'
import { Trans } from '@/lib/i18n/Trans'
import { useTranslatedStrings } from '@/lib/i18n'

interface HospitalGroupPartnersProps {
  initialGroups?: MappedGroup[]
}

function getGroupHref(group: MappedGroup): string {
  if (group.isStandalone && group.standaloneBranchSlug) {
    return `/hospital-branches/${group.standaloneBranchSlug}`
  }
  return `/hospital-groups/${group.slug}`
}

export default function HospitalGroupPartners({ initialGroups }: HospitalGroupPartnersProps) {
  const router = useRouter()
  const [allGroups, setAllGroups] = useState<MappedGroup[]>(initialGroups || [])
  const [loading, setLoading] = useState(!initialGroups)
  const [error, setError] = useState<string | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [translatedTitle] = useTranslatedStrings(['Hospital Partners'])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 150)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    if (initialGroups) return

    let cancelled = false
    async function load() {
      try {
        const data = await getAllHospitalGroups()
        if (!cancelled) {
          setAllGroups(data.map(mapGroup))
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          setError('Unable to load hospital partners')
          setLoading(false)
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [initialGroups])

  const filteredGroups = useMemo(() => {
    if (!debouncedSearch) return allGroups;
    const term = debouncedSearch.toLowerCase();
    return allGroups.filter(g =>
      g.name.toLowerCase().includes(term) ||
      g.branches.toLowerCase().includes(term) ||
      g.specialty.toLowerCase().includes(term)
    );
  }, [allGroups, debouncedSearch]);

  const searchOptions = useMemo(() =>
    allGroups.map(g => ({ id: g._id, name: g.name })),
    [allGroups]
  );

  const handleSelect = useCallback((id: string) => {
    const group = allGroups.find(g => g._id === id);
    if (group) {
      setSearchInput('');
      router.push(getGroupHref(group));
    }
  }, [allGroups, router]);

  // Transform MappedGroup to BranchCardData for HospitalSection
  const branchCardData = useMemo(() => {
    return allGroups
      .filter(group => {
        // Filter out groups with missing or invalid data
        const validName = group.name && group.name.trim() !== '' && group.name !== 'Unnamed Hospital';
        const validImage = group.image && group.image.trim() !== '' && group.image !== '/placeholder.svg';
        return validName && validImage;
      })
      .map(group => ({
        _id: group._id,
        image: group.image,
        hospitalName: group.name,
        branchName: group.isStandalone ? group.name : undefined,
        location: group.branches,
        yearEstablished: group.yearEstablished ? parseInt(group.yearEstablished, 10) : undefined,
        totalBeds: undefined, // Not available in hospital groups data
        noOfDoctors: undefined, // Not available in hospital groups data
        accreditation: [], // Not available in hospital groups data
        popular: false, // Not available in hospital groups data
        primarySpecialty: group.specialty,
        specialty: [{ name: group.specialty }],
        specialization: [{ name: group.specialty }],
        specialities: [{ name: group.specialty }],
        specialist: [], // Not available in hospital groups data
        slug: group.slug,
        hospitalSlug: group.slug,
        href: getGroupHref(group),
        logo: group.logo,
      }));
  }, [allGroups]);

  if (loading) {
    return (
      <section className={`bg-white ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
          <div className="flex justify-between items-center mb-3">
            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
            <div className="flex gap-2">
              <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse" />
              <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="flex -ml-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="min-w-0 flex-grow-0 flex-shrink-0 basis-full pl-4 md:basis-1/2 lg:basis-1/4">
                <div className={`${DESIGN_TOKENS.COMPONENT.CARD.BASE} overflow-hidden`}>
                  <div className="h-60 bg-gray-100 animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 w-3/4 bg-gray-100 rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                      <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                      <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                      <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`${DESIGN_TOKENS.BACKGROUNDS.GRAY_LIGHT} py-8 md:py-10`}>
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING} text-center`}>
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
<p className="text-gray-600 text-sm md:text-base" data-i18n-original={error} data-trans-managed="true">{error}</p>
        </div>
      </section>
    );
  }

  if (allGroups.length === 0) return null;

  return (
    <>
<HospitalSection
        hospitals={branchCardData}
         title={translatedTitle}
        showSearch={false} // Search is handled in SectionHeading
        visualIndex={2}
        loading={false}
        error={error}
        retryCallback={() => window.location.reload()}
        hideStats={true}
      />
    </>
  );
}