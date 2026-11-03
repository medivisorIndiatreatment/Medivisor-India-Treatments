"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { getWixImageUrl, getWixScaledToFillImageUrl } from "@/lib/wixMedia";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Mail,
  MessageCircle,
} from "lucide-react";

import Banner from "@/components/BannerService";
import { DESIGN_TOKENS } from "@/components/design-tokens";
import { getAllTreatments } from "@/lib/services/treatments";
import { generateSlug } from "@/lib/slug-utils";
import MarqueeHeading from "@/components/ui/MarqueeHeading";
import {
  extractRichTextHtml,
  sanitizeHtml,
} from "@/lib/cms";

interface Treatment {
  _id: string;
  name: string;
  slug?: string;
  treatmentImage?: string | null;
  treatmentImageUrl?: string | null;
  cost?: string | null;
  minPrice?: string | null;
  description?: string | null;
  descriptionHtml?: string | null;
  popular?: boolean;
}

// TreatmentCard Component with consistent styling
const TreatmentCard = ({
  treatment,
}: {
  treatment: Treatment;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const imageUrl: string =
    getWixScaledToFillImageUrl(treatment.treatmentImage, 400, 224) ||
    getWixImageUrl(treatment.treatmentImage) ||
    treatment.treatmentImageUrl ||
    treatment.treatmentImage ||
    "/placeholder.svg?height=224&width=400&text=Image Not Found";

  const rawDescription =
    treatment.descriptionHtml || treatment.description || "";
  const richHtml = extractRichTextHtml(rawDescription, true, true);
  const plainText = richHtml
    ? sanitizeHtml(richHtml).replace(/<[^>]*>/g, "")
    : "";
  const displayText = plainText || treatment.description || "No description available.";
  const isHtml = richHtml && richHtml.includes("<");

  const priceLabel =
    treatment.cost || treatment.minPrice
      ? `$ ${treatment.cost || treatment.minPrice}`
      : "";

  const href = treatment.slug
    ? `/treatment/${treatment.slug}`
    : `/treatment/${generateSlug(treatment.name || "")}`;

  return (
    <Link
      href={href}
      className="group block bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden rounded-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="bg-white border-0 shadow-none h-full">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={imageUrl}
            alt={treatment.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-4 flex flex-col">
          <div className="mb-2 overflow-hidden">
            <MarqueeHeading
              isHovered={isHovered}
              className="text-lg md:text-xl font-medium text-[#241d1f] leading-tight tracking-tight"
            >
              {treatment.name}
            </MarqueeHeading>
          </div>
          {isHtml ? (
            <div
              className="text-base text-[#241d1f] leading-relaxed line-clamp-3"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(richHtml) }}
              data-i18n-html=""
              data-trans-managed="true"
              suppressHydrationWarning
            />
          ) : (
            <div
              className="text-base text-[#241d1f] leading-relaxed line-clamp-3"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
              data-i18n-original={displayText}
              suppressHydrationWarning
            >
              {displayText}
            </div>
          )}
          {priceLabel && (
            <div className="mt-2 text-lg font-normal text-[#241d1f]" data-i18n-original={`Starting price: ${priceLabel}`}>
             Starting Price: {priceLabel}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};

// Main page component
export default function TreatmentsPage() {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [displayCount, setDisplayCount] = useState(16);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const INITIAL_DISPLAY = 16;
  const LOAD_MORE_BATCH = 16;

  const fetchTreatments = async () => {
    try {
      const data = await getAllTreatments();

      if (!data || data.length === 0) {
        setTotalCount(0);
        return [];
      }

      setTotalCount(data.length);
      return data as Treatment[];
    } catch (err) {
      console.error("Error fetching Treatments:", err);
      setError("Failed to load treatments.");
      return [];
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      const data = await fetchTreatments();
      setTreatments(data);
      setDisplayCount(INITIAL_DISPLAY);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (loading || isLoadingMore) return;
    if (displayCount >= totalCount) return;

    let observer: IntersectionObserver | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      const sentinel = sentinelRef.current;
      if (!sentinel) {
        retryTimer = setTimeout(connect, 50);
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry?.isIntersecting) {
            setIsLoadingMore(true);
            setTimeout(() => {
              setDisplayCount((prev) => Math.min(prev + LOAD_MORE_BATCH, totalCount));
              setIsLoadingMore(false);
            }, 300);
          }
        },
        { threshold: 0.1, rootMargin: "200px" },
      );

      observer.observe(sentinel);
    };

    connect();

    return () => {
      if (retryTimer) clearTimeout(retryTimer);
      if (observer) observer.disconnect();
    };
  }, [loading, isLoadingMore, displayCount, totalCount]);

  const displayedTreatments = treatments.slice(0, displayCount);
  const hasMore = displayCount < totalCount;

  const SkeletonCard = () => (
    <div className="bg-white rounded-md shadow-xs overflow-hidden transform transition-transform duration-300 animate-pulse p-6">
      <div className="w-full h-40 bg-gray-200"></div>
      <div className="h-6 bg-gray-200 rounded w-3/4 my-3"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-white">
        <Banner
          topSpanText="Treatment Costs"
          title="Affordable Medical Treatment Costs in India for International Patients"
          description="We know that cost is one of the biggest concerns when planning healthcare abroad. Medivisor India connects you with world-class doctors and hospitals at affordable prices, giving you clear, upfront details so you can make the best choice for your health."
          buttonText="See Cost Details"
          buttonLink="#treatment-costs"
            bannerBgImage="/banner/service.png"
          mainImageSrc="/banner/treatment-cost-banner.png"
          mainImageAlt="Affordable Medical Treatment Costs in India"
        />

        {/* Info Section */}
        <section className="bg-gray-50 py-12 md:py-16">
          <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
            <div className="max-w-5xl mx-auto">
              <Card className="bg-white border border-gray-100 shadow-sm">
                <CardContent className="p-6 space-y-6">
                  <div className="text-base md:text-lg text-[#241d1f] leading-relaxed">
<p data-i18n-original="As Medivisor, our expertise lies in orchestrating medical treatments in India, and we take pride in delivering detailed and personalized cost estimates. To initiate the process, we encourage you to email us your medical reports and a concise history of your health concern at info@medivisorhealth.com. Alternatively, you can share the same information with us via Viber or WhatsApp at +91-8340780250. The information will allow us to tailor a quotation to your individual needs and preferences.">
                      As Medivisor, our expertise lies in orchestrating medical treatments in India, and we take pride in delivering detailed and personalized cost estimates. To initiate the process, we encourage you to email us your medical reports and a concise history of your health concern at info@medivisorhealth.com. Alternatively, you can share the same information with us via Viber or WhatsApp at +91-8340780250. The information will allow us to tailor a quotation to your individual needs and preferences.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6 pt-4">
                    <Card className="border border-gray-200 bg-white shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Mail className="h-5 w-5 text-[#29A9B9]" />
<h3 className="text-xl font-medium text-[#241d1f]" data-i18n-original="Email Your Reports">Email Your Reports</h3>
                        </div>
                        <p className="text-base text-[#241d1f] leading-relaxed mb-4" data-i18n-original="Send your medical reports and health history for a detailed cost estimate.">
                          Send your medical reports and health history for a detailed cost estimate.
                        </p>
                        <Button
                          asChild
                          variant="outline"
                          className="w-full border-[#29A9B9] text-[#29A9B9] hover:bg-green-50"
                        >
                          <a href="mailto:info@medivisorhealth.com">
                            <Mail className="h-4 w-4 mr-2" />
<span data-i18n-original="Email Reports">Email Reports</span>
                          </a>
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border border-gray-200 bg-white shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <MessageCircle className="h-5 w-5 text-[#29A9B9]" />
<h3 className="text-xl font-medium text-[#241d1f]" data-i18n-original="WhatsApp / Viber">WhatsApp / Viber</h3>
                        </div>
                        <p className="text-base text-[#241d1f] leading-relaxed mb-4" data-i18n-original="Quick consultation via WhatsApp or Viber for immediate assistance.">
                          Quick consultation via WhatsApp or Viber for immediate assistance.
                        </p>
                        <Button
                          asChild
                          variant="outline"
                          className="w-full border-[#29A9B9] text-[#29A9B9] hover:bg-green-50"
                        >
                          <a
                            href="https://wa.me/918340780250"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
<span data-i18n-original="Contact via WhatsApp">Contact via WhatsApp</span>
                          </a>
                        </Button>
                       </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
            </div>
          </section>

          {/* Treatments Gallery */}
          <section id="treatments-gallery" className="bg-white py-12 md:py-16">
            <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading && (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                )}
                {!loading &&
                  displayedTreatments.map((treatment) => (
                    <TreatmentCard
                      key={treatment._id}
                      treatment={treatment}
                    />
                  ))}
                {isLoadingMore && (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                )}
                {hasMore && <div ref={sentinelRef} className="col-span-full h-10" />}
{!loading && treatments.length === 0 && (
                  <div className="col-span-full text-center py-10">
                    <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900" data-i18n-original="No treatments found">
                      No treatments found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500" data-i18n-original="We couldn't find any treatments. Please try again later.">
                      We couldn't find any treatments. Please try again later.
                    </p>
                  </div>
                )}
{error && (
                  <div className="col-span-full text-center py-10">
                    <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900" data-i18n-original="Error loading treatments">
                      Error loading treatments
                    </h3>
                    <p className="mt-1 text-sm text-gray-500" data-i18n-original={error}>{error}</p>
                  </div>
                )}
              </div>
            </div>
          </section>

        </div>

      </>
    );
  }
