"use client"

import { useMemo, useCallback } from "react"
import SectionHeading from "@/components/ui/SectionHeading"
import HospitalCard from "@/components/ui/HospitalCard"
import { DESIGN_TOKENS, getAlternatingBackground } from "@/components/design-tokens"
import { useI18n, useTranslatedStrings } from "@/lib/i18n"
import type { HospitalData } from "@/lib/cms/types"

export interface DoctorHospitalsSectionProps {
  visualIndex: number
  hospitals: HospitalData[]
  doctor: {
    id: string
    branchId: string
    branchName: string
  }
  hoveredBranchIndex: number | null
  onHoverBranch: (index: number | null) => void
}

export function DoctorHospitalsSection({
  visualIndex,
  hospitals,
  doctor,
  hoveredBranchIndex,
  onHoverBranch,
}: DoctorHospitalsSectionProps) {
  const mappedBranches = useMemo(() => {
    const result: { branch: any; hospitalName: string }[] = []

    hospitals.forEach((hospital) => {
      if (!hospital.branches) return

      hospital.branches.forEach((branch) => {
        const isMapped =
          branch._id === doctor.branchId ||
          branch.branchName === doctor.branchName ||
          (branch.doctors &&
            branch.doctors.some((d: any) => d._id === doctor.id))

        if (isMapped) {
          const exists = result.some(
            (item) => item.branch._id === branch._id,
          )
          if (!exists) {
            result.push({ branch, hospitalName: hospital.hospitalName })
          }
        }
      })
    })

    return result
  }, [hospitals, doctor.branchId, doctor.branchName, doctor.id])

  if (!mappedBranches.length) return null

  // Pre-fetch the section title for flash-free translation
  const { t: tGlobal } = useI18n()
  const translatableStrings = useMemo(() => ["Affiliated Hospitals"], [])
  const translatedStrings = useTranslatedStrings(translatableStrings)
  const translationMap = useMemo(() => {
    const map = new Map<string, string>()
    translatableStrings.forEach((original, i) => {
      map.set(original, translatedStrings[i] ?? original)
    })
    return map
  }, [translatableStrings, translatedStrings])
  const t = useCallback(
    (text: string): string => {
      if (!text) return text
      return translationMap.get(text) || tGlobal(text)
    },
    [translationMap, tGlobal],
  )

  return (
    <div
      className={`md:bg-white md:rounded-xl md:p-6 md:shadow-sm md:border border-gray-100`}
    >
<SectionHeading title={t("Affiliated Hospitals")} titleI18nKey="doctor.affiliated_hospitals" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6">
        {mappedBranches.map(({ branch, hospitalName }, idx) => (
          <HospitalCard
            key={branch._id}
            data={{
              _id: branch._id,
              branchName: branch.branchName,
              hospitalName: hospitalName,
              branchImage: branch.branchImage,
              image: branch.branchImage,
              logo: branch.logo,
              specialty: branch.specialty,
              totalBeds: branch.totalBeds,
              noOfDoctors: branch.noOfDoctors,
              yearEstablished: branch.yearEstablished,
              city: branch.city,
              popular: branch.popular || false,
            }}
            index={idx}
            hoveredIndex={hoveredBranchIndex}
            onHover={onHoverBranch}
            showStats={true}
            showAccreditation={true}
            showLogo={true}
          />
        ))}
      </div>
    </div>
  )
}
