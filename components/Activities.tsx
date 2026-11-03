'use client';

import { useRef, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import HomepageCarousel from "@/components/ui/HomepageCarousel"
import { DESIGN_TOKENS, getAlternatingBackground, SECTION_INDEX } from "@/components/design-tokens";
import SectionHeading from "@/components/ui/SectionHeading";
import { Trans } from '@/lib/i18n/Trans';
import { useTranslatedStrings } from "@/lib/i18n";
import { getWixImageUrl } from "@/lib/wixMedia"
import { fetcher } from "@/lib/utils/swr"

interface ActivityPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  media?: {
    wixMedia?: { image?: string };
    embedMedia?: { thumbnail?: { url: string } };
  };
  coverMedia?: { image?: string };
}

export default function Activities() {
  const { data, error, isLoading } = useSWR(
    '/api/wix-posts?limit=12&offset=0&category=social-activity',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000,
    }
  );

// Extract activity data
  const activities: ActivityPost[] = useMemo(() => {
    if (!Array.isArray(data?.posts)) return []
    return data.posts.map((post: any) => ({
      title: post.title,
      description: post.excerpt || "Celebrating moments of care and joy.",
      image: getWixImageUrl(post.media?.wixMedia?.image || post.coverMedia?.image) || "/placeholder.svg",
      slug: post.slug,
    }))
  }, [data?.posts])

  // Translate activity titles reactively
  const translatableStrings = useMemo(() => {
    const strings: string[] = [
      "We Go Beyond Care — We Celebrate Life",
      "Beyond treatment, we bring care, joy, and unforgettable moments. From warm personal visits to lively events, your healing journey with us is filled with smiles and celebration — because your happiness is our true mission.",
      "Every Treatment Counts",
      "We dedicate a significant portion of our revenue to supporting underprivileged individuals in the regions where we operate. This commitment brings us immense joy and fulfillment, knowing we're making a meaningful impact for those in need. Additionally, the heartfelt well-wishes and blessings we receive create a positive environment that supports us in achieving the highest success rates for our patients.",
    ]
    const seen = new Set<string>(strings)
    for (const activity of activities) {
      if (activity.title && !seen.has(activity.title)) {
        seen.add(activity.title)
        strings.push(activity.title)
      }
    }
    return strings
  }, [activities])

  const translatedStrings = useTranslatedStrings(translatableStrings)

  const translationMap = useMemo(() => {
    const map = new Map<string, string>()
    translatableStrings.forEach((original, i) => {
      map.set(original, translatedStrings[i] ?? original)
    })
    return map
  }, [translatableStrings, translatedStrings])

  const t = useCallback((text: string): string => {
    if (!text) return text
    return translationMap.get(text) || text
  }, [translationMap])

  if (isLoading) {
    return (
<section className={`${getAlternatingBackground(SECTION_INDEX.ACTIVITIES)} ${DESIGN_TOKENS.SECTION_SPACING.PY} overflow-hidden relative`}>
         <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING} relative`}>
         <div className="md:text-center md:mb-8 mb-4 max-w-3xl mx-auto">
           <h2 className={DESIGN_TOKENS.TYPOGRAPHY.H2 + " mb-2"} data-i18n="activities.skeleton-title" data-i18n-original="We Go Beyond Care — We Celebrate Life" data-trans-managed="true">
             <Trans id="activities.skeleton-title">We Go Beyond Care — We Celebrate Life</Trans>
           </h2>
           <p className={DESIGN_TOKENS.TYPOGRAPHY.BODY_BASE} data-i18n="activities.skeleton-desc" data-i18n-original="Beyond treatment, we bring care, joy, and unforgettable moments. From warm personal visits to lively events, your healing journey with us is filled with smiles and celebration — because your happiness is our true mission." data-trans-managed="true">
             <Trans id="activities.skeleton-desc">Beyond treatment, we bring care, joy, and unforgettable moments. From warm personal visits to lively events, your healing journey with us is filled with smiles and celebration — because your happiness is our true mission.</Trans>
           </p>
         </div>
         <div className="flex justify-center items-center py-12">
           <div className="animate-pulse flex space-x-4">
             <div className="rounded-lg bg-gray-300 h-56 w-80"></div>
             <div className="rounded-lg bg-gray-300 h-56 w-80"></div>
             <div className="rounded-lg bg-gray-300 h-56 w-80"></div>
           </div>
         </div>
       </div>
     </section>
    );
  }

  if (error || activities.length === 0) {
    return null; // Don't show section if there's an error or no activities
  }
return (
      <section
        className={`${getAlternatingBackground(SECTION_INDEX.ACTIVITIES)} ${DESIGN_TOKENS.SECTION_SPACING.PY} overflow-hidden relative`}>
       <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING} relative`}>
          {/* Heading */}
<div className="md:text-center mb-5 md:mb-8 max-w-3xl mx-auto">
          <SectionHeading title="Every Treatment Counts" align="center" titleClassName="md:text-center" titleI18nKey="activities.title" data-i18n-original="Every Treatment Counts" />
          <p className={DESIGN_TOKENS.TYPOGRAPHY.DESCRIPTION} data-i18n="activities.desc" data-i18n-original="We dedicate a significant portion of our revenue to supporting underprivileged individuals in the regions where we operate. This commitment brings us immense joy and fulfillment, knowing we're making a meaningful impact for those in need. Additionally, the heartfelt well-wishes and blessings we receive create a positive environment that supports us in achieving the highest success rates for our patients." data-trans-managed="true">
            <Trans id="activities.desc">We dedicate a significant portion of our revenue to supporting underprivileged individuals in the regions where we operate. This commitment brings us immense joy and fulfillment, knowing we're making a meaningful impact for those in need. Additionally, the heartfelt well-wishes and blessings we receive create a positive environment that supports us in achieving the highest success rates for our patients.</Trans>
          </p>
        </div>

        {/* Carousel */}
          <HomepageCarousel
            showControls={true}
            loop={true}
            centerNavOnSlides={true}
          >
          {activities.map((activity: any, index: number) => (
            <div key={activity.slug || index} className="h-full">
              <Link href={`/blog/${activity.slug}`} className="block h-full">
                <div className="relative group cursor-pointer overflow-hidden rounded-xs shadow h-56 md:h-64">
                  <Image
                    src={activity.image}
                    alt={t(activity.title)}
                    fill
                    className="object-cover rounded-sm transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
<h2 className="w-full inline-flex text-2xl md:text-2xl font-medium leading-tight text-white group-hover:text-primary transition-colors tracking-tight" data-i18n-original={activity.title} data-trans-managed="true">
                       {t(activity.title)}
                     </h2>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </HomepageCarousel>
      </div>
</section>
   );
}
