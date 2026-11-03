// app/team/[slug]/TeamPage.tsx
// Team member detail page - matching doctor slug page format

"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  GraduationCap,
  CheckCircle,
  Shield,
  Trophy,
} from "lucide-react"
import Image from "next/image"
import BreadcrumbNav from "@/components/ui/BreadcrumbNav"
import ContactForm from "@/components/ContactForm"
import { DESIGN_TOKENS, getAlternatingBackground } from "@/components/design-tokens"
import { generateSlug, generateUniqueSlug } from "@/lib/slug-utils"
import { getBestCoverImage, getWixImageUrl } from "@/lib/wixMedia"
import { isRichTextContent } from "@/lib/cms"
import { RicosRenderer } from "@/components/RichContentViewer"
import { useTranslatedString, useTranslatedHtmlString, Trans } from "@/lib/i18n"

const COLLECTION_ID = "Team1"

// Helper function to extract text from a rich text object
const extractTextFromRichText = (richTextObj: any): string => {
  if (!richTextObj) return ""
  if (typeof richTextObj === "string") return richTextObj
  if (richTextObj.nodes && Array.isArray(richTextObj.nodes)) {
    return richTextObj.nodes
      .map((node: any) => {
        if (node.type === "PARAGRAPH" && node.nodes) {
          return node.nodes
            .map((textNode: any) => {
              if (textNode.type === "TEXT" && textNode.textData) {
                return textNode.textData.text || ""
              }
              return ""
            })
            .join("")
        }
        return ""
      })
      .join("\n\n")
      .trim()
  }
  if (richTextObj.text) return richTextObj.text
  if (richTextObj.textData && richTextObj.textData.text) return richTextObj.textData.text
  return ""
}

// Interface for the team member data structure
interface TeamMember {
  _id?: string
  name: string
  role: string
  image: string
  bio: string
  shortDescription: string
  longDescription: string
  order: number
  qualifications?: string[]
  awards?: string[]
  "link-team-1-title": string
  email?: string
  linkedin?: string
  twitter?: string
  website?: string
  richContent?: any
  rawData?: any
}

// Props interface for the client component
interface TeamPageProps {
  slug: string
  initialData?: any
}

// Skeleton loader component
const SkeletonProfile = () => (
  <div className="min-h-screen bg-white">
    <div className="container mx-auto px-4 py-16">
      <div className="h-10 bg-gray-200 rounded animate-pulse w-32 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center min-h-[480px]">
        <div className="lg:col-span-7 space-y-6">
          <div className="h-12 bg-gray-200 rounded animate-pulse w-64" />
          <div className="h-8 bg-gray-200 rounded animate-pulse w-48" />
          <div className="h-6 bg-gray-200 rounded animate-pulse w-32" />
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-20 h-8 bg-gray-200 rounded-full animate-pulse" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  </div>
)

// Data fetching
const fetchMemberItem = async (memberId: string): Promise<TeamMember | null> => {
  const { wixClient } = await import("@/lib/wix")

  const processWixImageUrl = (item: any): string => {
    const bestImage = getBestCoverImage(item)
    if (bestImage) {
      const scaledUrl = getWixImageUrl(bestImage)
      if (scaledUrl) return scaledUrl
    }

    const imageFields = [
      "Photo", "photo", "image", "picture", "avatar", "profileImage",
      "mainImage", "featuredImage", "coverImage", "thumbnail",
    ]

    for (const field of imageFields) {
      if (item[field]) {
        let imageUrl = null
        if (typeof item[field] === "string" && item[field].startsWith("wix:image://")) {
          imageUrl = item[field]
        } else if (item[field]?.url && item[field].url.startsWith("wix:image://")) {
          imageUrl = item[field].url
        } else if (item[field]?.src && item[field].src.startsWith("wix:image://")) {
          imageUrl = item[field].src
        }

        if (imageUrl) {
          const scaledUrl = getWixImageUrl(imageUrl)
          if (scaledUrl) return scaledUrl
        }
      }
    }
    return `/placeholder.svg?height=600&width=600&query=team member`
  }

  const mapToTeamMember = (item: any): TeamMember => {
    const itemData = item.data || item
    
    // Extract rich content from various possible rich text fields
    const richContentField = itemData.longDescription || item.longDescription || item["Long Description"] || item.bio || item.description
    
    return {
      _id: item._id || item.ID,
      name: itemData.title || item.title || item.Name || item.name || "Team Member",
      role: itemData.jobTitle || item.jobTitle || item["Job Title"] || item.role || item.position || "Team Member",
      image: processWixImageUrl(itemData),
      bio: extractTextFromRichText(richContentField) || "Dedicated team member.",
      shortDescription: extractTextFromRichText(itemData.shortDescription || item.shortDescription || item["Short Description"] || item.excerpt) || "",
      longDescription: extractTextFromRichText(richContentField) || "",
      qualifications: [],
      awards: [],
      order: Number.parseInt(itemData.order) || Number.parseInt(item.order) || Number.parseInt(item.Order) || 0,
      "link-team-1-title": itemData["link-team-1-title"] || item["link-team-1-title"] || item.link || item.profileUrl || item.website || "#",
      email: itemData.email || item.email || item.Email || "",
      linkedin: itemData.linkedin || item.linkedin || item.LinkedIn || "",
      twitter: itemData.twitter || item.twitter || item.Twitter || "",
      website: itemData.website || item.website || item.Website || "",
      richContent: richContentField,
      rawData: item,
    }
  }

  let response: any = await wixClient.items.query(COLLECTION_ID).eq("_id", memberId).find({ consistentRead: true })

  if (!response?.items?.length) {
    const allMembersResponse = await wixClient.items.query(COLLECTION_ID).skip(0).limit(100).find({ consistentRead: true })
    if (allMembersResponse?.items?.length) {
      const targetMember = allMembersResponse.items.find((item: any) => {
        const itemData = item.data || item
        const memberName = itemData.title || item.title || item.Name || item.name || ""
        const memberSlug = generateSlug(memberName)
        const linkSlug = itemData["link-team-1-title"] || item["link-team-1-title"] || ""
        const extractedSlug = linkSlug ? linkSlug.replace(/^.*\/team\//, "").replace(/\/$/, "") : ""
        return memberSlug === memberId || extractedSlug === memberId || item._id === memberId || generateUniqueSlug(memberName, item._id) === memberId
      })
      if (targetMember) {
        response = { items: [targetMember] }
      }
    }
  }

  if (!response?.items?.length) {
    const nameFromSlug = memberId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

    response = await wixClient.items
      .query(COLLECTION_ID)
      .contains("title", nameFromSlug)
      .find({ consistentRead: true })
  }

  if (response?.items?.[0]) {
    return mapToTeamMember(response.items[0])
  }

  return null
}

export default function TeamPage({ slug, initialData }: TeamPageProps) {
  const router = useRouter()
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const translatedName = useTranslatedString(teamMember?.name || '')
  const translatedRole = useTranslatedString(teamMember?.role || '')
  const rawBio = teamMember?.longDescription || teamMember?.bio || ''
  const translatedBio = useTranslatedHtmlString(rawBio)
  const translatedAboutTitle = useTranslatedString(teamMember ? `About ${teamMember.name}` : '')

  useEffect(() => {
    if (initialData) {
      setTeamMember({
        _id: initialData._id,
        name: initialData.name,
        role: initialData.role,
        image: initialData.image,
        bio: initialData.bio,
        shortDescription: initialData.shortDescription,
        longDescription: initialData.longDescription,
        order: initialData.order || 0,
        qualifications: initialData.qualifications || [],
        awards: initialData.awards || [],
        "link-team-1-title": initialData["link-team-1-title"] || "#",
        email: initialData.email || "",
        linkedin: initialData.linkedin || "",
        twitter: initialData.twitter || "",
        website: initialData.website || "",
        richContent: initialData.richContent,
        rawData: initialData.rawData,
      })
      setLoading(false)
    } else if (slug) {
      loadTeamMember()
    }
  }, [slug, initialData])

  const loadTeamMember = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/team/${encodeURIComponent(slug)}`)
      if (!response.ok) {
        if (response.status === 404) {
          setNotFound(true)
          return
        }
        throw new Error(`Failed to fetch team member: ${response.status}`)
      }
      const data = await response.json()
      if (data.error) {
        setNotFound(true)
        return
      }
      setTeamMember({
        _id: data._id,
        name: data.name,
        role: data.role,
        image: data.image,
        bio: data.bio,
        shortDescription: data.shortDescription,
        longDescription: data.longDescription,
        order: data.order || 0,
        qualifications: data.qualifications || [],
        awards: data.awards || [],
        "link-team-1-title": data["link-team-1-title"] || "#",
        email: data.email || "",
        linkedin: data.linkedin || "",
        twitter: data.twitter || "",
        website: data.website || "",
        richContent: data.richContent,
        rawData: data.rawData,
      })
    } catch (error) {
      console.error("Failed to load team member:", error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  // All hooks must be declared before any conditional returns
  const getImageUrl = (image?: string | null): string | null => {
    if (!image) return null
    const wixUrl = getWixImageUrl(image)
    if (wixUrl) return wixUrl
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image
    }
    return null
  }

  const teamImg = teamMember ? getImageUrl(teamMember.image) : null
  const hasRichText = isRichTextContent(teamMember?.richContent as any)
  const renderContent = useMemo(() => {
    if (!teamMember) return null
    if (isRichTextContent((teamMember as any).richContent as any)) {
      return <RicosRenderer content={(teamMember as any).richContent as any} />
    }
    if (teamMember.longDescription || teamMember.bio) {
      return (
        <p className={DESIGN_TOKENS.TYPOGRAPHY.DESCRIPTION}>
          {teamMember.longDescription || teamMember.bio}
        </p>
      )
    }
    return null
  }, [teamMember])

  // Now safe to return conditionally
  const GREEN = "#74BF44"
  const breadcrumbItems = teamMember ? [
    { label: "Team", href: "/team" },
    { label: teamMember.name, href: "#" },
  ] : [{ label: "Team", href: "/team" }]

  if (loading) {
    return <SkeletonProfile />
  }

  if (notFound || !teamMember) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
<h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-6" data-i18n="team.not-found" data-i18n-original="Team Member Not Found" data-trans-managed="true">
             Team Member Not Found
           </h1>
           <p className="text-lg text-[#241d1f] mb-8" data-i18n="team.not-found-desc" data-i18n-original="The team member you're looking for doesn't exist or may have been removed." data-trans-managed="true">
             The team member you're looking for doesn't exist or may have been removed.
           </p>
           <a href="/team" className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-[#23366E] rounded-lg hover:bg-[#1A2A52] transition-all duration-200 shadow-sm hover:shadow-md" data-i18n="team.back-to-team" data-i18n-original="Back to Team" data-trans-managed="true">
             Back to Team
           </a>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-white py-8 md:py-10">
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} relative ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
          <div className="relative z-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center min-h-[480px] lg:min-h-[560px]">
              {/* Left Side - Team Member Info */}
              <div className="flex flex-col justify-end order-2 lg:order-2 col-span-12 lg:col-span-7 bg-white py-10 lg:py-10">
<h1 className="text-[clamp(28px,3.5vw,48px)] font-semibold text-gray-900 leading-tight tracking-tight mb-1" data-i18n-original={teamMember.name} data-trans-managed="true">
                  {translatedName}
                </h1>
                <p className="text-xl text-gray-900 font-medium leading-relaxed mb-0 max-w-md" data-i18n-original={teamMember.role} data-trans-managed="true">
                  {translatedRole}
                </p>
                
                 <div className="flex items-center gap-4 mt-2">
                   <a href="/team" className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-gray-300 bg-white transition-all duration-200 hover:bg-gray-50" data-i18n="team.back" data-i18n-original="← Back to Team" data-trans-managed="true">
                     <span>←</span>
                     <span className="text-gray-800 font-medium text-base"><Trans id="team.back">Back to Team</Trans></span>
                   </a>
                 </div>
              </div>

              {/* Image Container */}
              <div className="relative order-1 lg:order-1 col-span-3 min-h-[350px] border-4 border-gray-200 rounded-lg lg:max-h-[360px] w-auto mx-auto lg:mx-0 aspect-square overflow-hidden">
                {teamImg ? (
                  <Image
                    src={teamImg}
alt={teamMember.name}
                     data-i18n-original={teamMember.name}
                    fill
                    priority
                    className="object-cover object-center"
                    sizes="(max-width: 512px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-4xl font-bold text-gray-400">
                      {teamMember.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <BreadcrumbNav items={breadcrumbItems} />

      {/* Main Content Section */}
      <section className={`${getAlternatingBackground(0)} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-3 space-y-6 md:space-y-8">
<div className="md:bg-white md:rounded-xl md:p-6 md:shadow-sm md:border border-gray-100">
                 <h2 className="text-3xl font-medium leading-normal" data-i18n-original={`About ${teamMember.name}`} data-trans-managed="true">
                    {translatedAboutTitle}
                  </h2>
                 <div className="prose custom-list space-y-2 first-heading max-w-none text-sm md:text-lg department-description-content mt-4">
                   {hasRichText ? (
                     <RicosRenderer content={teamMember.richContent as any} />
                   ) : (
                     <div
                       className="text-gray-500"
                       data-i18n-original={rawBio || "No biography available."}
                       data-trans-managed="true"
                       dangerouslySetInnerHTML={{ __html: translatedBio || "No biography available." }}
                     />
                   )}
                 </div>
                </div>
              </div>

            {/* Right Column - Sticky Contact Form */}
            <div className="lg:col-span-1">
              <div className="sticky md:block hidden top-24">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Contact Form */}
      <section className={`py-8 md:py-10 block md:hidden ${getAlternatingBackground(1)}`}>
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
          <div className="md:bg-white md:rounded-xl md:p-6 md:shadow-sm">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  )
}