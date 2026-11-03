"use client"

import { LucideIcon } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export interface StatCardProps {
  icon: LucideIcon
  value: string | number
  label: string
  showPlus?: boolean
}

const StatCard = ({ icon: Icon, value, label, showPlus = true }: StatCardProps) => {
  const { t } = useI18n()
  return (
  <div className={`
    flex flex-col items-center justify-center
    p-1.5 md:p-5
    bg-gray-50
    border border-gray-200
    rounded-lg
    shadow-sm
    hover:shadow-md hover:border-gray-300
    transition-all duration-300
    text-center
    min-h-[120px]
  `}>
    <Icon className="w-5 h-5 md:w-10 md:h-10 text-[#241d1f] mb-3 md:mb-4 flex-shrink-0" />
<p className="text-base md:text-xl font-medium text-[#241d1f] mb-1 leading-tight" data-i18n-original={String(value)} data-trans-managed="true">
      {String(value)}
    </p>
    <p className="text-sm md:text-xl text-gray-900 font-medium leading-snug" data-i18n-original={label} data-trans-managed="true">
      {t(label)}
    </p>
  </div>
  )
}

export default StatCard
