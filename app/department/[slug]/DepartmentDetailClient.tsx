"use client"

import { useMemo, useState, useEffect } from "react"
import dynamic from "next/dynamic"
import SectionHeading from "@/components/ui/SectionHeading"
import BreadcrumbNav from "@/components/ui/BreadcrumbNav"
import BranchHeroBanner from "@/components/BranchHeroBanner"
import ContactForm from "@/components/ContactForm"
import ContactModal from "@/components/ContactModal"
import { getDisplayLocation } from "@/lib/utils/city-utils"
import { DESIGN_TOKENS, getAlternatingBackground } from "@/components/design-tokens"
import { isRichTextContent } from "@/lib/cms"
import { TableOfContents, extractHeadingsFromNodes, extractHeadingsFromHtml } from "@/components/ui/TableOfContents"
import type { DoctorData } from "@/lib/cms/types"
import {
  DepartmentDescription,
  DepartmentTreatmentsSection,
  TreatmentDoctorsSection,
} from "@/components/department"

const HospitalBranchesCarouselLazy = dynamic(
  () => import("@/components/HospitalBranchesCarousel"),
  {
    loading: () => (
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="h-8 w-64 mb-6 bg-gray-100 animate-pulse rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
                <div className="h-48 bg-gray-100 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-5 w-3/4 bg-gray-100 animate-pulse rounded-lg" />
                  <div className="h-4 w-1/2 bg-gray-100 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
  }
)

const CtaSectionLazy = dynamic(
  () => import("@/components/CtaSection"),
  {
    loading: () => (
      <section className="py-12 bg-white">
        <div className="h-96 w-full bg-gray-100 animate-pulse rounded-xl" />
      </section>
    ),
  }
)

interface DepartmentTreatment {
  _id: string
  name: string
  treatmentImage?: string | null
  cost?: string | null
  popular?: boolean
  description?: string | null
}

interface Department {
  _id: string
  name: string
  slug: string
  departmentImage?: string | null
  subDepartments?: { _id: string; name: string; treatments?: DepartmentTreatment[] }[]
  treatments?: DepartmentTreatment[]
  totalTreatments?: number
  description?: string | null
  descriptionHtml?: string | { nodes: unknown[] } | null
  richContent?: unknown
}

interface DepartmentDetailClientProps {
  department: Department
  hospitals: { branches?: { department?: unknown[]; city?: unknown[]; totalBeds?: unknown; noOfDoctors?: unknown }[] }[]
  slug: string
  doctors?: DoctorData[]
  allDoctors?: DoctorData[]
  departmentTreatments?: DepartmentTreatment[]
  allTreatments?: DepartmentTreatment[]
  subDepartmentNames?: string[]
}

function getNumberValue(val: unknown): number | null {
  if (val === null || val === undefined) return null
  if (typeof val === "number") return val
  if (typeof val === "string") return parseInt(val, 10) || null
  return null
}

export default function DepartmentDetailClient({
  department,
  hospitals,
  slug,
  doctors = [],
  allDoctors = [],
  departmentTreatments = [],
  allTreatments = [],
}: DepartmentDetailClientProps) {
  const treatments = useMemo(() => department.treatments ?? [], [department.treatments])
  const totalTreatments = department.totalTreatments ?? treatments.length

  const subDepartmentNames = useMemo(() => {
    return department.subDepartments?.map(sd => sd.name).filter(Boolean) ?? []
  }, [department.subDepartments])

  const departmentLocation = useMemo(() => {
    if (!hospitals || hospitals.length === 0) return ""

    for (const hospital of hospitals) {
      if (hospital.branches && Array.isArray(hospital.branches)) {
        for (const branch of hospital.branches) {
          if (branch.department) {
            const deptRefs = Array.isArray(branch.department)
              ? branch.department
              : [branch.department]
            const hasDept = deptRefs.some(
              (d: unknown) =>
                (d as Department)?._id === department._id ||
                (d as Department)?.name === department.name
            )
            if (hasDept && branch.city) {
              const cityName =
                (branch.city as { cityName?: string; name?: string }[])[0]?.cityName ||
                (branch.city as { cityName?: string; name?: string }[])[0]?.name ||
                ""
              if (cityName) return getDisplayLocation(cityName)
            }
          }
        }
      }
    }
    return ""
  }, [hospitals, department._id, department.name])

  const overviewStats = useMemo(() => {
    let totalBranches = 0
    let totalBeds = 0
    let totalDoctors = 0

    if (hospitals && hospitals.length > 0) {
      hospitals.forEach((hospital: { branches?: { department?: unknown[]; totalBeds?: unknown; noOfDoctors?: unknown }[] }) => {
        if (hospital.branches && Array.isArray(hospital.branches)) {
          hospital.branches.forEach((branch) => {
            if (branch.department) {
              const deptRefs = Array.isArray(branch.department)
                ? branch.department
                : [branch.department]
              const hasDept = deptRefs.some(
                (d: unknown) =>
                  (d as Department)?._id === department._id ||
                  (d as Department)?.name === department.name
              )
              if (hasDept) {
                totalBranches++
                totalBeds += getNumberValue(branch.totalBeds) || 0
                totalDoctors += getNumberValue(branch.noOfDoctors) || 0
              }
            }
          })
        }
      })
    }

    return {
      totalBranches,
      totalBeds: totalBeds > 0 ? totalBeds : null,
      totalDoctors: totalDoctors > 0 ? totalDoctors : null,
    }
  }, [hospitals, department._id, department.name])

const displayName = department.name || slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

  const breadcrumbItems = useMemo(
    () => [
      { label: "Departments", href: "", i18nKey: "breadcrumb.departments" },
      { label: displayName, href: "#" },
    ],
    [displayName]
  )

  const [headings, setHeadings] = useState<Array<{ id: string; text: string; level: number }>>([])

  const ricosNodes = useMemo(() => {
    if (!department) return null

    const richContent = department.richContent
    if (!richContent) return null

    if (isRichTextContent(richContent)) {
      const ricaContent = richContent as any
      if (ricaContent?.nodes && Array.isArray(ricaContent.nodes)) {
        return ricaContent.nodes
      }
      if (Array.isArray(richContent)) {
        return richContent
      }
    }

    return null
  }, [department])

  const contentHtml = useMemo(() => {
    if (!department) return null

    if (ricosNodes) return null

    const content = department.descriptionHtml
    if (typeof content === "string" && content.trim()) {
      return content
    }

    const fallback = department.description
    if (fallback && typeof fallback === "string") {
      return `<p>${fallback}</p>`
    }

    return null
  }, [department, ricosNodes])

  useEffect(() => {
    if (ricosNodes) {
      const h = extractHeadingsFromNodes(ricosNodes)
      setHeadings(h)
    } else if (typeof contentHtml === "string") {
      const h = extractHeadingsFromHtml(contentHtml)
      setHeadings(h)
    } else {
      setHeadings([])
    }
  }, [ricosNodes, contentHtml])

  const processedHtml = useMemo(() => {
    if (!contentHtml) return null

    const headingSet = new Set(headings.map((h) => h.text.trim().toLowerCase()))

    return contentHtml.replace(
      /<u>(.*?)<\/u>/gs,
      (match, text) => {
        const plainText = text.replace(/<[^>]*>/g, "").trim().toLowerCase()
        if (headingSet.has(plainText)) {
          const heading = headings.find((h) => h.text.trim().toLowerCase() === plainText)
          if (heading) {
            return ('<a href="#' + heading.id + '" class=" font-medium">' + text + '</a>')
          }
        }
        return match
      }
    )
  }, [contentHtml, headings])
  if (!department) {
    return (
      <div className="bg-white min-h-screen">
        <BreadcrumbNav items={breadcrumbItems} />
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-5 sm:px-6 lg:px-8">
            <SectionHeading
              title="Explore Our Departments"
              subtitle="Find the best department for your treatment in India"
              className="mb-5 md:mb-8"
            />
            <div className="prose max-w-none">
              <p className="text-base md:text-lg">
                Medivisor partners with top hospital chains across India to provide world-class
                healthcare at affordable costs. Browse our departments to find the best option
                for your medical needs.
              </p>
            </div>
          </div>
        </section>
        <CtaSectionLazy />
      </div>
    )
  }

   return (
     <div className="bg-white min-h-screen smooth-load loaded">
       <BranchHeroBanner
title={displayName}
         titleI18nKey="department.hero-title"
         branchImage={department.departmentImage || null}
         logo={null}
         accreditations={[]}
         hospitalName={undefined}
       />

       <BreadcrumbNav items={breadcrumbItems} />

       <section className={`${DESIGN_TOKENS.BACKGROUNDS.WHITE} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
         <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
           <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
             <div className="lg:col-span-3">
               <div className="bg-white md:rounded-xl md:p-6 lg:p-8 first-heading md:shadow-sm md:border border-gray-100">
                 <DepartmentDescription
                   description={department.description}
                   descriptionHtml={department.descriptionHtml}
                   richContent={department.richContent}
                   departmentName={department.name}
                   totalTreatments={totalTreatments}
                 />
               </div>
             </div>

             <div className="lg:col-span-1 hidden md:block">
               <div className="sticky top-24">
                 <ContactForm />
               </div>
             </div>
           </div>
         </div>
       </section>

 <DepartmentTreatmentsSection
            treatments={treatments}
            departmentName={department.name}
            departmentTreatments={departmentTreatments}
            allTreatments={allTreatments}
            title={`${department.name} Treatments in India`}
            titleI18nKey="department.treatments"
          />

          <TreatmentDoctorsSection
            doctors={doctors}
            allDoctors={allDoctors}
            hospitals={hospitals}
            title={`Top Doctors for ${department.name} in India`}
            titleI18nKey="doctors.related_doctors"
          />

          {hospitals && hospitals.length > 0 && (
              <HospitalBranchesCarouselLazy
                title={`Top Hospitals for ${department.name} in India`}
                titleI18nKey="hospitals.related"
                hospitals={hospitals}
                showSearch={true}
                autoplay={true}
                autoplayDelay={4000}
                filterDepartment={department.name}
              />
          )}

        <ContactModal isOpen={false} onClose={() => {}} />

       <section className={`${getAlternatingBackground(7)} ${DESIGN_TOKENS.SECTION_SPACING.PY} md:hidden block`}>
         <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
           <div className="md:bg-white md:rounded-xl  md:p-6 md:shadow-sm md:border border-gray-100">
             <ContactForm />
           </div>
         </div>
       </section>
     </div>
   )
}