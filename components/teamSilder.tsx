"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Users } from "lucide-react"
import SectionHeading from "@/components/ui/SectionHeading"
import HomepageCarousel from "@/components/ui/HomepageCarousel"
import MarqueeHeading from "@/components/ui/MarqueeHeading"
import { generateUniqueSlug } from "@/lib/slug-utils"
import { DESIGN_TOKENS } from "@/components/design-tokens"
import { Trans, useTranslatedStrings, useTranslatedHtmlString } from '@/lib/i18n'

const COLLECTION_ID = "Team1"

interface TeamMember {
  _id?: string
  name: string
  role: string
  image: string
  bio: string
  shortDescription: string
  longDescription: string
  order: number
  slug: string
}

function TeamMemberCard({ member, index, hoveredIndex, setHoveredIndex }: { member: TeamMember, index: number, hoveredIndex: number | null, setHoveredIndex: (index: number | null) => void }) {
  const router = useRouter()
  const [translatedName, translatedRole, translatedDesc] = useTranslatedStrings([
    member.name,
    member.role,
    member.shortDescription || member.bio,
  ])
  const translatedHtmlDesc = useTranslatedHtmlString(member.shortDescription || member.bio || "")

  const slug = member.slug?.trim()

  return (
    <div
      className="group bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col h-full min-h-[280px] md:min-h-[320px] hover:shadow-xl hover:border-gray-300 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#29A9B9]/20"
      onClick={() => { if (slug) router.push(`/team/${slug}`) }}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (slug) router.push(`/team/${slug}`) } }}
    >
      <div className="relative w-full h-48 md:h-56 overflow-hidden bg-gray-50">
        <Image
          src={member.image || "/placeholder.svg"}
          alt={translatedName}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          loading={index < 6 ? "eager" : "lazy"}
          onError={(e) => {
            const target = e.target as HTMLImageElement
            if (!target.dataset.fallbackAttempted) {
              target.dataset.fallbackAttempted = "true"
              target.src = `/placeholder.svg?height=240&width=240&query=${encodeURIComponent(member.name + " team member")}`
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-4 md:p-5 md:pb-2 flex flex-col flex-1">
        <div className="mb-2">
          <MarqueeHeading isHovered={hoveredIndex === index} className={`w-full ${DESIGN_TOKENS.TYPOGRAPHY.CARD_TITLE}`}>
            {translatedName}
          </MarqueeHeading>
        </div>
        <p className={`${DESIGN_TOKENS.TYPOGRAPHY.H4} mb-1 mt-0 line-clamp-1 text-gray-900`} data-i18n-original={member.role} data-trans-managed="true">
          {translatedRole}
        </p>
        <div
          className={`${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC} mt-0 line-clamp-3 mb-2`}
          data-i18n-original={member.shortDescription || member.bio}
          data-trans-managed="true"
          dangerouslySetInnerHTML={{ __html: translatedHtmlDesc }}
        />
      </div>
      <footer className="border-t border-gray-100 mx-2 mb-2 pt-3 mt-auto">
        <Link
          href={`/team/${member.slug}`}
          className="flex items-center justify-center gap-2 text-base font-medium text-white bg-[#23366E] px-4 py-2 rounded-lg shadow-sm hover:bg-[#1A2650] hover:shadow-md active:scale-[0.98] transition-all duration-200"
          data-i18n-original="View Profile"
          data-trans-managed="true"
          onClick={(e) => e.stopPropagation()}
        >
          <Trans id="team.view-profile">View Profile</Trans>
        </Link>
      </footer>
    </div>
  )
}

export default function TeamSlider() {
  const [currentTeamMembers, setCurrentTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch("/api/team")
      if (!response.ok) {
        throw new Error(`Failed to fetch team: ${response.status}`)
      }
      const data = await response.json()
      const teamMembersData: TeamMember[] = (data.items || []).map((item: any) => {
        const memberName = item.Name || item.name || item.title || "Team Member"
        const memberId = item._id || item.ID
        const slug = generateUniqueSlug(memberName, memberId) || "team-member"

        return {
          _id: memberId,
          name: memberName,
          role: item["Job Title"] || item.jobTitle || item.role || item.position || "Team Member",
          image: item.image || "/placeholder.svg",
          bio: item["Long Description"] || item.longDescription || item.bio || item.description || "Dedicated team member.",
          shortDescription: item["Short Description"] || item.shortDescription || item.excerpt || "",
          longDescription: item["Long Description"] || item.longDescription || item.bio || item.description || "",
          order: Number.parseInt(item.Order) || Number.parseInt(item.order) || 0,
          slug: slug,
        }
      })

      return teamMembersData.sort((a, b) => a.order - b.order)
    } catch (error: any) {
      throw error
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const result = await fetchTeamMembers()
      setCurrentTeamMembers(result)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) return (
    <section className={`${DESIGN_TOKENS.BACKGROUNDS.WHITE} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
      <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-amber-50 rounded-full mb-4 md:mb-6">
            <Users className="h-8 w-8 md:h-10 md:w-10 text-amber-600" />
          </div>
          <SectionHeading title="Our Team" align="center" />
          <p className={`${DESIGN_TOKENS.TYPOGRAPHY.BODY_BASE}`} data-i18n="team.loading-desc" data-i18n-original="Loading team information..." data-trans-managed="true">
            <Trans id="team.loading-desc">Loading team information...</Trans>
          </p>
        </div>
      </div>
    </section>
  )

  if (currentTeamMembers.length === 0) {
    return (
      <section className={`${DESIGN_TOKENS.BACKGROUNDS.WHITE} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING} text-center max-w-2xl mx-auto`}>
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-amber-50 rounded-full mb-4 md:mb-6">
            <Users className="h-8 w-8 md:h-10 md:w-10 text-amber-600" />
          </div>
          <SectionHeading title="Our Team" className="px-2" align="center" />
          <p className={`${DESIGN_TOKENS.TYPOGRAPHY.BODY_BASE}`} data-i18n="team.empty-desc" data-i18n-original="Our team information is currently being updated. Check back soon!" data-trans-managed="true">
            <Trans id="team.empty-desc">Our team information is currently being updated. Check back soon!</Trans>
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className={`${DESIGN_TOKENS.BACKGROUNDS.WHITE} px-2 ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
      <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
        <SectionHeading
          title="Our Team"
          className="px-2"
          align="left"
        />

        <div>
          <HomepageCarousel autoplay>
            {currentTeamMembers.map((member, index) => (
              <TeamMemberCard
                key={member._id || index}
                member={member}
                index={index}
                hoveredIndex={hoveredIndex}
                setHoveredIndex={setHoveredIndex}
              />
            ))}
          </HomepageCarousel>
        </div>
      </div>
    </section>
  )
}
