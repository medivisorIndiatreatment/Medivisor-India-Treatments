'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import SectionHeading from '@/components/ui/SectionHeading';
import HomepageCarousel from '@/components/ui/HomepageCarousel';
import SearchDropdown from '@/components/ui/SearchDropdown';
import { Button } from '@/components/ui/button';
import { DESIGN_TOKENS, getAlternatingBackground, SECTION_INDEX } from '@/components/design-tokens';
import type { BranchCardData } from '@/components/cards/types';
import { AlertCircle } from 'lucide-react';
import HospitalCard, { HospitalCardData } from '@/components/ui/HospitalCard';
import { Trans } from '@/lib/i18n/Trans';

interface HospitalSectionProps {
  hospitals: BranchCardData[];
  title?: string;
  titleI18nKey?: string;
  showSearch?: boolean;
  visualIndex?: number;
  className?: string;
  slidesToShow?: number;
  loading?: boolean;
  error?: string | null;
  retryCallback?: () => void;
  skeletonCount?: number;
  hideStats?: boolean;
}

const LoadingSkeleton = ({
  visualIndex,
  className,
  count = 8,
}: {
  visualIndex: number;
  className: string;
  count?: number;
}) => (
  <section className={`${getAlternatingBackground(visualIndex)} ${DESIGN_TOKENS.SECTION_SPACING.PY} ${className}`}>
    <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-4 md:mb-6 md:px-0">
        <div className="h-8 md:h-10 w-56 md:w-64 rounded-lg animate-pulse bg-gray-200"></div>
        <div className="h-11 w-full md:w-[340px] rounded-lg animate-pulse bg-gray-200"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden">
            <div className="relative h-48 md:h-52 bg-gray-100 animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse"></div>
            </div>
            <div className="p-4 md:p-5 space-y-3">
              <div className="h-6 w-3/4 rounded-lg animate-pulse bg-gray-200"></div>
              <div className="space-y-2">
                <div className="h-4 w-full rounded animate-pulse bg-gray-200"></div>
                <div className="h-4 w-5/6 rounded animate-pulse bg-gray-200"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ErrorDisplay = ({
  visualIndex,
  className,
  title,
  error,
  retryCallback,
}: {
  visualIndex: number;
  className: string;
  title: string;
  error: string;
  retryCallback?: () => void;
}) => (
  <section className={`${getAlternatingBackground(visualIndex)} ${DESIGN_TOKENS.SECTION_SPACING.PY} ${className}`}>
    <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING} text-center max-w-2xl mx-auto`}>
      <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-amber-50 rounded-full mb-4 md:mb-6">
        <AlertCircle className="h-8 w-8 md:h-10 md:w-10 text-amber-600" />
      </div>
<SectionHeading title={title} align="center" />
       <p className={`${DESIGN_TOKENS.TYPOGRAPHY.BODY_BASE} mb-6`} data-i18n-original={error}>
         {error}
       </p>
       {retryCallback && (
         <Button variant="destructive" size="lg" onClick={retryCallback} data-i18n="common.try-again" data-i18n-original="Try Again">
           <Trans id="common.try-again">Try Again</Trans>
         </Button>
       )}
    </div>
  </section>
);

function getSpecialtyName(specialty: unknown): string | null {
  if (typeof specialty === 'string') return specialty || null;

  const specialtyArray = specialty as { name?: string }[] | string[] | undefined;
  if (!specialtyArray?.length) return null;

  const firstItem = specialtyArray[0];
  return typeof firstItem === 'string'
    ? firstItem
    : typeof (firstItem as { name?: string })?.name === 'string'
      ? (firstItem as { name?: string }).name || null
      : null;
}

function getLocationString(hospital: any): string | null {
  // Check location field directly
  if (hospital.location && typeof hospital.location === 'string') {
    return hospital.location;
  }

  // Build location from city data
  if (hospital.city) {
    if (Array.isArray(hospital.city) && hospital.city.length > 0) {
      const city = hospital.city[0];
      if (typeof city === 'object') {
        const cityName = city.cityName || city.name || '';
        const state = city.state || city.State || '';
        return state ? `${cityName}, ${state}` : cityName;
      }
      return String(city);
    }
    if (typeof hospital.city === 'string') {
      return hospital.city;
    }
  }
  return null;
}

export default function HospitalSection({
  hospitals,
  title = 'Available Hospitals',
  titleI18nKey,
  showSearch = true,
  visualIndex = SECTION_INDEX.POPULAR_HOSPITALS,
  className = '',
  loading = false,
  error = null,
  retryCallback,
  skeletonCount = 8,
  hideStats = false,
}: HospitalSectionProps) {
  const router = useRouter();
  const [searchInputValue, setSearchInputValue] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchInputValue);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchInputValue]);

  const displayHospitals = useMemo(() => {
    if (!Array.isArray(hospitals) || hospitals.length === 0) return [];

    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      return hospitals.filter((hospital) => {
        const specialtyName = getSpecialtyName(hospital.specialty);
        const location = getLocationString(hospital);

        const specialtyMatch = specialtyName?.toLowerCase().includes(term) ?? false;
        const branchNameMatch = (hospital.branchName?.toLowerCase() || '').includes(term);
        const hospitalNameMatch = (hospital.hospitalName?.toLowerCase() || '').includes(term);
        const locationMatch = location?.toLowerCase().includes(term) ?? false;

        return branchNameMatch || hospitalNameMatch || specialtyMatch || locationMatch;
      });
    }

    return hospitals;
  }, [hospitals, debouncedSearchTerm]);

  const searchOptions = useMemo(() => {
    return hospitals.map((hospital) => ({
      id: hospital._id,
      name: hospital.branchName || hospital.hospitalName || 'Hospital',
      type: 'branch' as const,
      hospitalSlug: hospital.hospitalSlug || hospital.slug,
      location: getLocationString(hospital),
      specialty: getSpecialtyName(hospital.specialty),
    }));
  }, [hospitals]);

  const handleSelect = useCallback(
    (id: string) => {
      const hospital = hospitals.find((h) => h._id === id);
      if (hospital) {
        setSearchInputValue('');
        if (hospital.href) {
          router.push(hospital.href);
        } else {
          const targetSlug = hospital.hospitalSlug || hospital.slug;
          if (targetSlug) {
            router.push(`/hospital-branches/${targetSlug}`);
          }
        }
      }
    },
    [hospitals, router]
  );

  if (loading) {
    return <LoadingSkeleton visualIndex={visualIndex} className={className} count={skeletonCount} />;
  }

  if (error) {
    return (
      <ErrorDisplay
        visualIndex={visualIndex}
        className={className}
        title={title}
        error={error}
        retryCallback={retryCallback}
      />
    );
  }

  if (!Array.isArray(hospitals) || hospitals.length === 0) {
    return null;
  }

  return (
    <section className={`${getAlternatingBackground(visualIndex)} ${DESIGN_TOKENS.SECTION_SPACING.PY} ${className}`}>
      <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-4 md:mb-6 md:px-0">
<SectionHeading title={title} titleI18nKey={titleI18nKey} className="!mb-0" />

          {showSearch && (
            <div className="relative w-full md:w-[340px]">
               <SearchDropdown
                 value={searchInputValue}
                 onChange={setSearchInputValue}
                 placeholder="Search Hospitals"
                 options={searchOptions}
                 onOptionSelect={handleSelect}
                 onClear={() => {
                   setSearchInputValue('');
                   setDebouncedSearchTerm('');
                 }}
                 type="branch"
                 maxHeight={300}
                 data-i18n="search.hospitals"
                 data-i18n-original="Search Hospitals"
               />
            </div>
          )}
        </div>

        <HomepageCarousel autoplay>
           {displayHospitals.map((hospital, index) => (
             <div key={hospital._id || index}>
               <HospitalCard
                 data={{
                   _id: hospital._id,
                   branchName: hospital.branchName || hospital.hospitalName || 'Hospital',
                   hospitalName: hospital.hospitalName,
                   branchImage: hospital.image || hospital.branchImage,
                   image: hospital.image || hospital.branchImage,
                   logo: hospital.logo,
                   specialty: hospital.specialty || [],
                   specialization: hospital.specialization,
                   specialist: hospital.specialist,
                   specialities: hospital.specialities,
                   accreditation: hospital.accreditation?.map((acc) => ({
                     _id: acc._id || '',
                     image: acc.image,
                     title: acc.title,
                     logo: acc.logo,
                   })),
                   city: hospital.city,
                   location: hospital.location,
                   totalBeds: hospital.totalBeds,
                   noOfDoctors: hospital.noOfDoctors,
                   yearEstablished: hospital.yearEstablished,
                   popular: hospital.popular,
                    slug: hospital.slug,
                    hospitalSlug: hospital.hospitalSlug || hospital.slug,
                    href: hospital.href,
                  } as HospitalCardData}
                 index={index}
                hoveredIndex={hoveredIndex}
                onHover={setHoveredIndex}
                showStats={!hideStats}
              />
            </div>
          ))}
        </HomepageCarousel>
      </div>
    </section>
  );
}