"use client"
import Overview from "@/components/Overview"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Hospital } from 'lucide-react';
import { wixClient } from "@/lib/wix"
import CtaSection from "@/components/CtaSection"
import { getBestCoverImage } from "@/lib/wixMedia" // No longer needed for direct photo field
import type { MedicalAdvisor } from "@/types/medicalAdvisor" // New type import
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle, Stethoscope, Briefcase } from "lucide-react" // Added Stethoscope, Briefcase
import { OptimizedImage } from "@/components/optimized-image"
import Banner from "@/components/BannerService"
import { DESIGN_TOKENS } from "@/components/design-tokens"
import { useTranslatedStrings } from "@/lib/i18n";
import { MarqueeHeading } from "@/components/ui";

const COLLECTION_ID = "MedicalAdvisors"
const ITEMS_PER_PAGE = 100

export default function MedicalAdvisorsPage() {
  // Renamed component
  const [allAdvisors, setAllAdvisors] = useState<MedicalAdvisor[]>([]) // Updated state type and name
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const [translatedErrorLoad, translatedErrorMore] = useTranslatedStrings([
    "Failed to load medical advisors. Please try again.",
    "Failed to load more advisors. Please try again.",
  ]);
  const [translatedNoAdvisorsTitle, translatedNoAdvisorsDesc, translatedTryAgain] = useTranslatedStrings([
    "No Medical Advisors Found",
    "Your MedicalAdvisors collection appears to be empty or inaccessible.",
    "Try Again",
  ]);
  const [translatedLoadingMore, translatedLoadMoreAdvisors, translatedConnectionIssue] = useTranslatedStrings([
    "Loading More...",
    "Load More Advisors",
    "Connection Issue",
  ]);

  const fetchMedicalAdvisors = async (skip = 0, limit: number = ITEMS_PER_PAGE) => {
    try {
      const url = new URL("/api/medical-advisors", window.location.origin)
      url.searchParams.set("skip", String(skip))
      url.searchParams.set("limit", String(limit))
      const response = await fetch(url.toString())
      if (!response.ok) {
        throw new Error(`Failed to fetch medical advisors: ${response.status}`)
      }
      const data = await response.json()
      return {
        items: data.items || [],
        hasMore: data.hasMore || false,
        totalCount: data.totalCount || 0,
      }
    } catch (error) {
      console.error("Error fetching MedicalAdvisors collection:", error)
      return { items: [], hasMore: false, totalCount: 0 }
    }
  }

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchMedicalAdvisors(0, ITEMS_PER_PAGE) // Call new function
      setAllAdvisors(result.items) // Update state
      setHasMore(result.hasMore)
      setTotalCount(result.totalCount)
    } catch (err) {
setError(translatedErrorLoad);
      console.error("Error loading initial data:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = async () => {
    if (loadingMore || !hasMore) return

    try {
      setLoadingMore(true)
      const result = await fetchMedicalAdvisors(allAdvisors.length, ITEMS_PER_PAGE) // Call new function
      setAllAdvisors((prev) => [...prev, ...result.items]) // Update state
      setHasMore(result.hasMore)
    } catch (err) {
setError(translatedErrorMore);
      console.error("Error loading more data:", err)
    } finally {
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  // Loading Skeleton Component
  const SkeletonCard = () => (
    <Card className="w-full h-full animate-pulse">
      <div className="h-56 bg-gray-200 rounded-t-lg"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </Card>
  )

  // Advisor Card Component (Renamed from MomentCard)
  const AdvisorCard = ({ advisor }: { advisor: MedicalAdvisor }) => {
    const imageUrl = advisor.photo ? getBestCoverImage(advisor.photo) : null
    const [translatedName, translatedSpecialty, translatedExperience] = useTranslatedStrings([
      advisor.name || "Medical Advisor",
      advisor.specialty || "N/A",
      advisor.experience || "N/A",
    ]);

    return (
      <Card className="group relative border border-gray-100 flex flex-col overflow-hidden rounded-md border bg-white shadow-none hover:shadow-md transition-all duration-300">
        {/* Image Section */}
        <div className="relative h-72 w-full overflow-hidden">
          {imageUrl ? (
            <OptimizedImage
              src={imageUrl}
alt={translatedName}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              fallbackSrc="/placeholder.svg?height=500&width=800&text=Image Not Found"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-100">
              <Stethoscope className="h-10 w-10 text-gray-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        {/* Content */}
        <div className="flex flex-col px-4 py-3 border-t border-gray-100">
          {/* Name */}
<MarqueeHeading className={`${DESIGN_TOKENS.TYPOGRAPHY.H3} mb-1 text-gray-900`} isHovered={false}>
            {translatedName}
          </MarqueeHeading>

          {/* Specialty */}
          {advisor.specialty && (
            <div className="flex items-center border-b border-gray-100 mb-1 pb-1">
<span className={`${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC} text-gray-500 flex items-center gap-1`} data-i18n-original={advisor.specialty} data-trans-managed="true">
                {translatedSpecialty}
              </span>
            </div>
          )}

          {/* Experience / Bio */}
          {advisor.experience && (
<p className={`${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC} text-[#241d1f] leading-relaxed line-clamp-2`} data-i18n-original={advisor.experience} data-trans-managed="true">
              {translatedExperience}
            </p>
          )}
        </div>
      </Card>
    )
  }

  return (
    <>
      <Banner
        topSpanText="Meet Our Experts"
        title="Our Esteemed Medical Advisors"
        description="
At Medivisor India Treatment, our esteemed medical advisors combine global expertise with compassionate care. They are here to guide you at every step, making your treatment journey smooth, transparent, and stress-free. Explore the specialist below and discover the doctors who bring world-class healthcare closer to you."
        buttonText="Explore Advisors"
        buttonLink="/medical-advisors/#advisor-gallery"
        mainImageSrc="/about-main-1.png"
        mainImageAlt="Medivisor India Medical Advisors"
      />

      <section className="bg-gray-50 py-12 md:py-16">
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
          {/* Error State */}
          {error && (
            <Card className="mb-8 border-red-200 bg-red-50">
<CardHeader>
                        <CardTitle className="text-red-800 flex items-center gap-2" data-i18n-original="Connection Issue" data-trans-managed="true">
                          <AlertTriangle className="h-5 w-5" />
                          {translatedConnectionIssue}
                        </CardTitle>
                       </CardHeader>
                       <CardContent>
                         <p className="text-red-700 mb-4" data-i18n-original={error} data-trans-managed="true">{error}</p>
                         <Button
                           onClick={loadInitialData}
                           variant="outline"
                           className="border-red-300 text-red-700 bg-transparent"
                           data-i18n-original="Try Again"
                           data-trans-managed="true"
                         >
                           {translatedTryAgain}
                         </Button>
                      </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          )}

          {/* Content */}
          {!loading && (
            <>
{allAdvisors.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Stethoscope className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-[#241d1f] mb-2" data-i18n-original="No Medical Advisors Found" data-trans-managed="true">{translatedNoAdvisorsTitle}</h3>
                    <p className="text-gray-500 mb-4" data-i18n-original="Your MedicalAdvisors collection appears to be empty or inaccessible." data-trans-managed="true">
                      {translatedNoAdvisorsDesc}
                    </p>
                    <Button onClick={loadInitialData} variant="outline" data-i18n-original="Try Again" data-trans-managed="true">
                      {translatedTryAgain}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-8">
                  {/* Gallery Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                    {allAdvisors.map(
                      (advisor) => (
                        <AdvisorCard key={advisor._id} advisor={advisor} />
                      ),
                    )}
                  </div>

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="text-center pt-8">
<Button
                         onClick={loadMore}
                         disabled={loadingMore}
                         size="lg"
                         className="bg-[#E22026] hover:bg-[#74BF44] text-white px-8 py-3"
                       >
                          {loadingMore ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              <span data-i18n-original="Loading More..." data-trans-managed="true">{translatedLoadingMore}</span>
                            </>
                          ) : (
                            <>
                              <span data-i18n-original="Load More Advisors" data-trans-managed="true">{translatedLoadMoreAdvisors}</span>
                              {totalCount - allAdvisors.length > 0 && (
                                <span className="ml-2 text-sm opacity-80" data-i18n-original={`(${Math.min(ITEMS_PER_PAGE, totalCount - allAdvisors.length)} more)`} data-trans-managed="true">
                                  ({Math.min(ITEMS_PER_PAGE, totalCount - allAdvisors.length)} more)
                                </span>
                              )}
                            </>
                          )}
                       </Button>
                    </div>
                  )}

                  {/* End Message */}
                  {!hasMore && allAdvisors.length > ITEMS_PER_PAGE && (
                    <div className="text-center pt-8">
<p className="text-gray-500 text-sm" data-i18n-original={`🎉 You've seen all ${totalCount} medical advisors!`} data-trans-managed="true">🎉 You've seen all {totalCount} medical advisors!</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

    </>
  )
}