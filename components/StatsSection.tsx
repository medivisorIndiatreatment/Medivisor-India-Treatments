"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  UserRoundIcon as UserRoundMedical,
  Hospital,
  Globe,
  Heart,
  Smile,
  Stethoscope,
  MapPin,
  ThumbsUp,
  LucideIcon,
} from "lucide-react"
import { DESIGN_TOKENS, getAlternatingBackground } from "@/components/design-tokens"
import SectionHeading from "@/components/ui/SectionHeading"
import StatCard from "@/components/ui/StatCard"
import { Trans } from '@/lib/i18n/Trans';
import { useTranslatedStrings } from '@/lib/i18n'

export default function StatsSection() {
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null)

  const stats = [
    {
      icon: UserRoundMedical,
      value: "3,500+",
      label: "Patients Cared For",
      description: "Global patient success stories with expert-led care.",
      hoverIcon: Smile,
    },
    {
      icon: Hospital,
      value: "100+",
      label: "Accredited Hospitals",
      description: "Partnered with world-class medical institutions.",
      hoverIcon: Stethoscope,
    },
    {
      icon: Globe,
      value: "15+",
      label: "Countries Served",
      description: "Supporting cross-border care and travel.",
      hoverIcon: MapPin,
    },
    {
      icon: Heart,
      value: "95%+",
      label: "Satisfaction Rate",
      description: "Top-rated experiences by real patients.",
      hoverIcon: ThumbsUp,
    },
  ]

  const allStrings = useMemo(() => {
    const strings: string[] = []
    stats.forEach((stat) => {
      strings.push(stat.label, stat.description)
    })
    strings.push(
      "Why Choose Medivisor?",
      "Discover why patients across the globe trust us for international medical care."
    )
    return strings
  }, [])

  const translated = useTranslatedStrings(allStrings)

  const translationMap = useMemo(() => {
    const map = new Map<string, string>()
    allStrings.forEach((original, i) => {
      map.set(original, translated[i] ?? original)
    })
    return map
  }, [allStrings, translated])

  const t = (text: string) => translationMap.get(text) || text

  return (
    <section className={`${getAlternatingBackground(0)} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
      <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
        <SectionHeading
title={t("Why Choose Medivisor?")}
          align="center"
          size="lg"
          className="mb-4 text-center md:text-center"
        />
        <p className={`${DESIGN_TOKENS.TYPOGRAPHY.BODY_LG} max-w-2xl mx-auto text-center`} data-i18n-original="Discover why patients across the globe trust us for international medical care.">
          {t("Discover why patients across the globe trust us for international medical care.")}
        </p>

        <div className="mt-10">
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ${DESIGN_TOKENS.SECTION_SPACING.GAP}`}>
          {stats.map((stat, index) => {
            const isHovered = activeCardIndex === index
            const Icon = stat.icon as   LucideIcon  
            const HoverIcon = stat.hoverIcon as LucideIcon
            return (
              <motion.div
                key={index}
                onMouseEnter={() => setActiveCardIndex(index)}
                onMouseLeave={() => setActiveCardIndex(null)}
                className={`border border-gray-200 rounded-lg bg-gray-50 ${DESIGN_TOKENS.COMPONENT.CARD.HOVER} flex justify-center flex-col cursor-pointer p-3 md:p-4`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >

                <motion.div
                  className="mb-4 mx-auto text-center flex justify-center"
                  animate={{ scale: isHovered ? 1.15 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {isHovered ? (
                    <HoverIcon className="text-[#29A9B9] w-8 h-8 md:w-10 md:h-10" />
                  ) : (
                    <Icon className="text-[#23366E] w-8 h-8 md:w-10 md:h-10" />
                  )}
                </motion.div>
<h3 className={`text-center ${DESIGN_TOKENS.TYPOGRAPHY.H3} mt-1`} data-i18n-original={stat.value}>{stat.value}</h3>
                <p className={`text-center ${DESIGN_TOKENS.TYPOGRAPHY.H4} text-[#241d1f] mt-1`} data-i18n-original={stat.label}>{t(stat.label)}</p>
                <p className={`text-center ${DESIGN_TOKENS.TYPOGRAPHY.DESCRIPTION} text-gray-900 mt-1 leading-relaxed`} data-i18n-original={stat.description}>{t(stat.description)}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
      </div>
    </section>
  )
}
