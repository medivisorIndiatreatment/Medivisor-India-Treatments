"use client"

import { useState, useEffect } from "react"
import { Users, AlertCircle } from "lucide-react"
import { DESIGN_TOKENS } from "@/components/design-tokens"
import HomepageCarousel from "@/components/ui/HomepageCarousel"
import DoctorCard from "@/components/cards/DoctorCard"
import type { DoctorCardData } from "@/components/cards/types"
import SectionHeading from "@/components/ui/SectionHeading";
import { useTranslatedStrings } from "@/lib/i18n";

const LoadingSkeleton = () => (
  <section className={`${DESIGN_TOKENS.BACKGROUNDS.WHITE} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
    <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-2 md:mb-4 px-2">
        <div className="space-y-2">
          <div className={`h-10 w-64 ${DESIGN_TOKENS.BACKGROUNDS.GRAY_200} rounded-lg animate-pulse`} />
          <div className={`h-4 w-48 ${DESIGN_TOKENS.BACKGROUNDS.GRAY_200} rounded animate-pulse`} />
        </div>
      </div>
      <div className="flex">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="min-w-0 shrink-0 grow-0 basis-full pl-2 pr-2 sm:basis-6/10 sm:pl-2 sm:pr-2 md:basis-4/5 md:pl-2 md:pr-2 lg:basis-[25%] xl:basis-[25%]">
            <div className={`${DESIGN_TOKENS.BACKGROUNDS.WHITE} rounded-xl border border-gray-200 ${DESIGN_TOKENS.SHADOWS.SM} h-full flex flex-col`}>
              <div className="w-full h-44 md:h-52 bg-gray-200 rounded-t-xl animate-pulse" />
              <div className="p-4 md:px-5 pt-5 pb-1 flex flex-col flex-1 space-y-1">
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="p-2">
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export default function MeetOurDoctors() {
  const [advisors, setAdvisors] = useState<DoctorCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [translatedTeamTitle, translatedAdvisorsTitle, translatedAdvisorsSubtitle] = useTranslatedStrings([
    "Our Team",
    "Our Medical Advisors",
    "Our medical advisor information is currently being updated. Check back soon!"
  ]);
  const [translatedError] = useTranslatedStrings(["Unable to load medical advisors data"]);

  useEffect(() => {
    let isMounted = true
    
    const fetchData = async () => {
      if (!isMounted) return
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/doctors?pageSize=100`)
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        
        if (!isMounted) return
        
        // Extract doctors array from response
        let doctorsArray: any[] = []
        if (data?.items) {
          doctorsArray = data.items
        } else if (Array.isArray(data)) {
          doctorsArray = data
        } else if (data?.data) {
          doctorsArray = Array.isArray(data.data) ? data.data : []
        }
        
        if (isMounted) {
          setAdvisors(
            doctorsArray
              .map((doctor: any): DoctorCardData => ({
                _id: doctor._id || '',
                doctorName: doctor.doctorName || doctor.name || '',
                name: doctor.doctorName || doctor.name || '',
                slug: doctor.slug || '',
                doctorSlug: doctor.slug || '',
                specialization: Array.isArray(doctor.specialization)
                  ? doctor.specialization.map((s: any) => ({ name: s.name || '' }))
                  : doctor.specialization
                  ? [{ name: doctor.specialization }]
                  : [],
                qualification: doctor.qualification ?? null,
                designation: doctor.designation ?? null,
                experienceYears: doctor.experience 
                  ? parseInt(String(doctor.experience), 10) 
                  : null,
                profileImageUrl: doctor.profileImage ?? null,
                popular: !!doctor.popular,
                hospitalId: doctor.hospitalId || '',
                hospitalName: doctor.hospitalName || '',
                branchId: doctor.branchId || '',
                branchName: doctor.branchName || '',
               city: doctor.city
                 ? Array.isArray(doctor.city)
                   ? doctor.city.map((c: any) => ({
                       cityName: (c?.cityName || c?.name || ''),
                       name: (c?.cityName || c?.name || ''),
                       state: undefined,
                       State: undefined,
                     }))
                   : typeof doctor.city === 'string'
                     ? [{
                         cityName: doctor.city,
                         name: doctor.city,
                         state: undefined,
                         State: undefined,
                       }]
                     : undefined
                 : undefined,}))
              .sort((a, b) => 
                (a.doctorName || a.name || '').localeCompare(b.doctorName || b.name || '')
              )
          )
        }
      } catch (err) {
        if (isMounted) {
setError(translatedError)
          setAdvisors([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()
    
    return () => {
      isMounted = false
    }
  }, [])

if (loading) return (
    <section className={`${DESIGN_TOKENS.BACKGROUNDS.WHITE} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
      <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-amber-50 rounded-full mb-4 md:mb-6">
            <Users className="h-8 w-8 md:h-10 md:w-10 text-amber-600" />
          </div>
           <SectionHeading title={translatedTeamTitle} align="center" />
           <p className={`${DESIGN_TOKENS.TYPOGRAPHY.BODY_BASE}`} data-i18n-original="Loading team information..." data-trans-managed="true">Loading team information...</p>
        </div>
      </div>
    </section>
  )

  if (advisors.length === 0) {
    return (
      <section className={`${DESIGN_TOKENS.BACKGROUNDS.WHITE} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-100 to-purple-100 rounded-full mb-8">
              <Users className="h-12 w-12 text-red-600" />
            </div>
<h2 className={DESIGN_TOKENS.TYPOGRAPHY.SECTION_HEADING_DARK} data-i18n-original="Our Medical Advisors" data-trans-managed="true">
              {translatedAdvisorsTitle}
            </h2>
            <p className={DESIGN_TOKENS.TYPOGRAPHY.BODY_LG} data-i18n-original="Our medical advisor information is currently being updated. Check back soon!" data-trans-managed="true">
              {translatedAdvisorsSubtitle}
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={DESIGN_TOKENS.BACKGROUNDS.WHITE}>
      <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-4 ">
          <div>
              
<SectionHeading
                         title={translatedAdvisorsTitle}
                         className="px-2"
                       />
              
             {error && (
              <div className="flex items-center gap-2 text-sm text-amber-600 mt-2">
                <AlertCircle className="w-4 h-4" />
                <span data-i18n-original={error} data-trans-managed="true">{error}</span>
              </div>
            )}
          </div>
        </div>

        <HomepageCarousel autoplay>
          {advisors.map((advisor, index) => (
            <DoctorCard
              key={advisor._id || index.toString()}
              doctor={advisor}
              index={index}
              hoveredIndex={null}
              onHover={() => {}}
              showHospital={false}
            />
          ))}
        </HomepageCarousel>
      </div>
    </section>
  )
}