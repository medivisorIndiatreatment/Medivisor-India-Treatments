"use client"

import { Calendar, HeartPulse, Bed, Users, LucideIcon } from "lucide-react"
import { Inter } from "next/font/google"
import StatCard, { StatCardProps } from "./StatCard"
import { useI18n } from "@/lib/i18n"

const inter = Inter({
  subsets: ["latin"],
  weight: ["200", "300", "400"],
  variable: "--font-inter"
})

export interface OverviewSectionProps {
  yearEstablished?: number | string | null
  totalBeds?: number | string | null
  noOfDoctors?: number | string | null
  specialty?: string
  hospitalName?: string
  title?: string
}

interface StatItem {
  icon: LucideIcon
  value: string | number
  label: string
  showPlus: boolean
}

const OverviewSection = ({
  yearEstablished,
  totalBeds,
  noOfDoctors,
  specialty,
  title,
}: OverviewSectionProps) => {
  const { t } = useI18n()
  const resolvedLabels = {
    established: t("Established"),
    specialty: t("Speciality"),
    beds: t("Beds"),
    doctors: t("Doctors"),
  }

  const stats: StatItem[] = [
    { icon: Calendar, value: yearEstablished || 'N/A', label: resolvedLabels.established, showPlus: false },
    { icon: HeartPulse, value: specialty || 'Multi Specialty', label: resolvedLabels.specialty, showPlus: false },
    { icon: Bed, value: totalBeds || 'N/A', label: resolvedLabels.beds, showPlus: true },
    { icon: Users, value: noOfDoctors || 'N/A', label: resolvedLabels.doctors, showPlus: true },
  ]

  return (
    <div className={`${inter.variable} font-light`}>
      {title && (
        <h2 className="text-2xl md:text-[29px] font-normal md:font-medium text-gray-900 tracking-tight flex items-center mb-3">
          {title}
        </h2>
      )}
      <div className="grid grid-cols-4 gap-2 md:gap-4">
        {stats.map((stat, index) => (
          <StatCard 
            key={index}
            icon={stat.icon} 
            value={stat.value} 
            label={stat.label} 
            showPlus={stat.showPlus} 
          />
        ))}
      </div>
    </div>
  )
}

export default OverviewSection
