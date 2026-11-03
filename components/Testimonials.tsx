"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import SectionHeading from "@/components/ui/SectionHeading"
import { DESIGN_TOKENS, SECTION_INDEX, getAlternatingBackground } from "@/components/design-tokens"
import { Trans } from "@/lib/i18n/Trans"

export interface Testimonial {
  id: string
  name: string
  treatment: string
  title: string
}

interface TestimonialsProps {
  initialTestimonials?: Testimonial[]
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: "tRFHfLX-v2Q",
    name: "Akanisi Navuku",
    treatment: "Cancer Treatment",
    title: "Akanisi Navuku from Fiji - Cancer Treatment",
  },
  {
    id: "KZDq1ICki0k",
    name: "Cathy Koe",
    treatment: "Mitral Valve Replacement",
    title: "Cathy Koe from Solomon Islands",
  },
  {
    id: "5NVBGLyg5Cs",
    name: "Sterry Toukes",
    treatment: "Heart Treatment",
    title: "Sterry Toukes from PNG - Heart Treatment",
  },
  {
    id: "5BsftwEpNLo",
    name: "Leon Warsal",
    treatment: "Aortic Valve Replacement",
    title: "Leon Warsal from Vanuatu - Aortic Valve Replacement",
  },
  {
    id: "c2HbMordW7s",
    name: "Jean Gabriel",
    treatment: "Hodgkin's Lymphoma",
    title: "Jean Gabriel from Vanuatu - Hodgkin's Lymphoma",
  },
  // {
  //   id: "SQ1RQELGqUM",
  //   name: "Freda Sofu",
  //   treatment: "Kidney Stone Removal",
  //   title: "Freda Sofu from Solomon Islands - Kidney Stone Removal",
  // },
]

export default function Testimonials({ initialTestimonials = DEFAULT_TESTIMONIALS }: TestimonialsProps) {
  const [currentVideo, setCurrentVideo] = useState({
    id: initialTestimonials[0]?.id || "tRFHfLX-v2Q",
    title: initialTestimonials[0]?.title || "",
  })
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const testimonials = initialTestimonials

  const changeVideo = (videoId: string, title: string) => {
    setCurrentVideo({ id: videoId, title })
  }

  return (
    <>
      <section
        className={`${getAlternatingBackground(SECTION_INDEX.TESTIMONIALS)} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}
        id="Stories"
        itemScope
        itemType="https://schema.org/VideoGallery"
      >
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
          <div className="md:text-center md:mb-8 mb-4 max-w-3xl mx-auto">
<SectionHeading title="International Success Stories" align="center" className="mb-4 text-left md:text-center" data-i18n-original="International Success Stories" />
            <p className={`${DESIGN_TOKENS.TYPOGRAPHY.DESCRIPTION} mb-4 md:mb-6`} itemProp="description" data-i18n="testimonials.description" data-i18n-original="Discover the voices of 3,500+ international patients who found comfort, care, and a hassle-free treatment journey in India — all made possible with Medivisor by their side." data-trans-managed="true">
              <Trans id="testimonials.description">Discover the voices of 3,500+ international patients who found comfort, care, and a hassle-free treatment journey in India — all made possible with Medivisor by their side.</Trans>
            </p>
          </div>

          <div className={`grid grid-cols-1 lg:grid-cols-3 ${DESIGN_TOKENS.SECTION_SPACING.GAP}`}>
            {/* Main Video Section */}
            <div
              className={`lg:col-span-2 border-t  md:border bg-gray-50 border-gray-200 overflow-hidden ${DESIGN_TOKENS.BORDER_RADIUS.XL} ${DESIGN_TOKENS.SHADOWS.LG}`}
              role="region"
aria-label="Featured testimonial video"
             >
              <h4 className={`${DESIGN_TOKENS.TYPOGRAPHY.H3} px-2 md:px-4 py-3 md:py-4`} itemProp="name" data-i18n-original={currentVideo.title}>
                {currentVideo.title}
              </h4>
              <div className="aspect-video overflow-hidden bg-gray-100" itemProp="video" itemScope itemType="https://schema.org/VideoObject">
                <meta itemProp="name" content={currentVideo.title} />
                <meta itemProp="thumbnailUrl" content={`https://img.youtube.com/vi/${currentVideo.id}/maxresdefault.jpg`} />
                <meta itemProp="embedUrl" content={`https://www.youtube.com/embed/${currentVideo.id}`} />

                <div className="relative w-full h-full bg-gray-100">
                  <iframe
                    loading="lazy"
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1&mute=1&rel=0&modestbranding=1&showinfo=0&playsinline=1`}
                    title={`Patient Testimonial: ${currentVideo.title}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    itemProp="embedUrl"
                  />
                </div>
              </div>
            </div>

            {/* Testimonials List */}
            <div>
              <div
                className={`h-full bg-gray-50 border border-gray-200 overflow-hidden ${DESIGN_TOKENS.BORDER_RADIUS.XL}`}
                role="region"
                aria-label="All testimonial videos"
>
                <h3 className={`${DESIGN_TOKENS.TYPOGRAPHY.H3} py-3 md:pb-4 pb-0 px-4 md:px-4 mt-2 text-[#23366E]`} data-i18n="testimonials.other-stories" data-i18n-original="Other Inspiring Stories" data-trans-managed="true">
                  <Trans id="testimonials.other-stories">Other Inspiring Stories</Trans>
                </h3>
                <div
                  ref={scrollContainerRef}
                  className="space-y-4 md:space-y-3.5  max-h-full px-4 md:px-4 py-4 md:py-0"
                  role="list"
                >
                  {testimonials.map((testimonial, index) => (
                    <div
                      key={testimonial.id}
                      className={`cursor-pointer flex items-start p-2 md:p-2.5 ${DESIGN_TOKENS.BORDER_RADIUS.MD} border border-gray-200 hover:border-[#29A9B9]/30 hover:bg-[#29A9B9]/5 ${DESIGN_TOKENS.TRANSITIONS.FAST} group`}
                      onClick={() => changeVideo(testimonial.id, testimonial.title)}
                      role="listitem"
                      itemScope
                      itemType="https://schema.org/VideoObject"
                    >
                      <div className={`relative w-24 h-16 md:w-20 md:h-14 flex-shrink-0 ${DESIGN_TOKENS.BORDER_RADIUS.MD} overflow-hidden`}>
                        <Image
                          src={`https://img.youtube.com/vi/${testimonial.id}/hqdefault.jpg`}
                           alt={`Video thumbnail: ${testimonial.name} - ${testimonial.treatment}`}
                          width={96}
                          height={64}
                          className="w-full h-full object-cover rounded-md transition-opacity duration-300"
                          loading={index < 3 ? "eager" : "lazy"}
                          itemProp="thumbnailUrl"
                        />
                      </div>

<div className="ms-3 md:ms-4 min-w-0">
                         <p
                           className={`font-medium ${DESIGN_TOKENS.TYPOGRAPHY.H4} group-hover:text-[#29A9B9] transition-colors line-clamp-2`}
                           itemProp="name"
                           data-i18n-original={testimonial.name}
                         >
                           {testimonial.name}
                         </p>
                         <p className={`${DESIGN_TOKENS.TYPOGRAPHY.BODY_SM} line-clamp-1`} itemProp="description" data-i18n-original={testimonial.treatment}>
                           {testimonial.treatment}
                         </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-4 md:px-4 py-4  pt-0 md:pt-6 md:border-t  border-gray-100">
                  <Button
                    variant="primary"
                   
                    className="w-full text-white"
                  >
<a
                       href="/patient-testimonials"
                       className="flex items-center justify-center gap-2"
                       aria-label="View more patient testimonial videos"
                     >
                       <Trans id="testimonials.more-videos">More Videos</Trans>
                       {/* <ChevronRight className="w-4 h-4" /> */}
                     </a>
                   </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "VideoGallery",
              name: "Patient Testimonials - Medivisor India Treatment",
              description: "Watch inspiring stories from international patients who received medical treatment in India with Medivisor's assistance.",
              video: testimonials.map(testimonial => ({
                "@type": "VideoObject",
                name: testimonial.title,
                description: `Patient testimonial from ${testimonial.name} about ${testimonial.treatment}`,
                thumbnailUrl: `https://img.youtube.com/vi/${testimonial.id}/maxresdefault.jpg`,
                embedUrl: `https://www.youtube.com/embed/${testimonial.id}`,
                uploadDate: "2024-01-01",
                duration: "PT2M",
              }))
            })
          }}
        />
      </section>
    </>
  )
}