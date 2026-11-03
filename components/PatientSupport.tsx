"use client"

import { useState, useEffect, useRef, useMemo } from "react";
import Image from 'next/image';
import SectionHeading from "@/components/ui/SectionHeading";
import { DESIGN_TOKENS, SECTION_INDEX, getAlternatingBackground } from "@/components/design-tokens";
import { Trans } from "@/lib/i18n/Trans";
import { useTranslatedStrings } from "@/lib/i18n";

   const LazyYouTubeEmbed = ({ 
   videoId, 
   title,
   thumbnailQuality = "hqdefault" 
   }: { 
   videoId: string; 
   title: string;
   thumbnailQuality?: "default" | "hqdefault" | "mqdefault" | "sddefault" | "maxresdefault";
   }) => {
   const [isLoaded, setIsLoaded] = useState(false);
   const [hasInteracted, setHasInteracted] = useState(false);
   const observerRef = useRef<IntersectionObserver | null>(null);
   const containerRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
     if (!containerRef.current || hasInteracted) return;

     observerRef.current = new IntersectionObserver(
       (entries) => {
         entries.forEach((entry) => {
           if (entry.isIntersecting) {
             setIsLoaded(true);
             observerRef.current?.disconnect();
           }
         });
       },
       { rootMargin: "100px" }
     );

     observerRef.current.observe(containerRef.current);

     return () => {
       observerRef.current?.disconnect();
     };
   }, [hasInteracted]);

   const handlePlay = () => {
     setHasInteracted(true);
   };

   const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/${thumbnailQuality}.jpg`;
   const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&controls=1&rel=0&playsinline=1`;

   return (
     <div 
       ref={containerRef}
       className="relative rounded-xs overflow-hidden shadow-xs ${DESIGN_TOKENS.BACKGROUNDS.GRAY_LIGHTER}"
       itemScope
       itemType="https://schema.org/VideoObject"
     >
       <meta itemProp="name" content={title} />
       <meta itemProp="description" content="Patient support and medical journey assistance" />
       <meta itemProp="thumbnailUrl" content={thumbnailUrl} />
       <meta itemProp="uploadDate" content="2024-01-01" />
       
       {!hasInteracted ? (
         <div 
           className="relative cursor-pointer group aspect-[16/9] md:aspect-[17/10]"
           onClick={handlePlay}
           role="button"
           aria-label={`Play video: ${title}`}
           tabIndex={0}
           onKeyDown={(e) => {
             if (e.key === 'Enter' || e.key === ' ') {
               e.preventDefault();
               handlePlay();
             }
           }}
         >
           {/* Optimized thumbnail with loading state */}
           <Image
             src={thumbnailUrl}
             alt={`Video thumbnail: ${title}`}
             fill
             className="object-cover transition-opacity duration-300 group-hover:opacity-90"
             sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
             priority={false}
             loading="lazy"
           />
           
           {/* Play button overlay */}
           <div className="absolute inset-0 bg-black/20 ${DESIGN_TOKENS.BORDER_RADIUS.MD} group-hover:bg-black/30 transition-colors flex items-center justify-center">
             <div className="w-16 h-16 md:w-20 md:h-20 ${DESIGN_TOKENS.BORDER_RADIUS.FULL} bg-[#23366E] rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
               <svg 
                 className="w-6 h-6 md:w-8 md:h-8 text-white ml-1" 
                 fill="currentColor" 
                 viewBox="0 0 24 24"
               >
                 <path d="M8 5v14l11-7z"/>
               </svg>
             </div>
           </div>
         </div>
       ) : (
         // Load iframe only after interaction
         <div className="aspect-[16/9] md:aspect-[17/10]">
           <iframe
             src={embedUrl}
             title={title}
             className="w-full h-full border-0"
             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
             allowFullScreen
             loading="lazy"
             referrerPolicy="strict-origin-when-cross-origin"
             itemProp="embedUrl"
           />
         </div>
       )}
     </div>
   );
 };
export default function PatientSupport() {
    const allStrings = useMemo(() => [
      "We Stand by Our Patients Every Step of the Way",
      "Medivisor takes pride in providing unwavering support to our patients throughout their journey. From the moment they step foot in the Delhi airport, our dedicated team ensures that they are never left to navigate their medical experience alone.",
      "At every juncture of their treatment process, at least one Medivisor staff member is by their side, offering escorting, guidance, and assistance every step of the way. Our commitment is to ensure that patients feel supported and cared for at all times, allowing them to focus on their recovery with peace of mind.",
      "Medivisor Patient Support Journey - Comprehensive Medical Assistance",
    ], [])

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
      <>
        <section
          className={`${getAlternatingBackground(SECTION_INDEX.PATIENT_SUPPORT)} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}
          id="PatientSupport"
          itemScope
          itemType="https://schema.org/MedicalOrganization"
        >
          <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
            <div className="md:grid lg:grid-cols-12 md:gap-12 items-center flex flex-col-reverse">

              {/* Content Side - SEO Optimized */}
              <div className="space-y-4 md:space-y-6 col-span-5 md:order-1 order-2 mb-2 md:mb-0">
                 <SectionHeading title={t("We Stand by Our Patients Every Step of the Way")} titleI18nKey="patient-support.title" className="mb-4 text-left md:text-left" />


                <div itemProp="description">
                   <p className={`${DESIGN_TOKENS.TYPOGRAPHY.DESCRIPTION} mb-4`} data-i18n-original="Medivisor takes pride in providing unwavering support to our patients throughout their journey. From the moment they step foot in the Delhi airport, our dedicated team ensures that they are never left to navigate their medical experience alone." data-trans-managed="true">
                     {t("Medivisor takes pride in providing unwavering support to our patients throughout their journey. From the moment they step foot in the Delhi airport, our dedicated team ensures that they are never left to navigate their medical experience alone.")}
                   </p>

                   <p className={`${DESIGN_TOKENS.TYPOGRAPHY.DESCRIPTION}`} data-i18n-original="At every juncture of their treatment process, at least one Medivisor staff member is by their side, offering escorting, guidance, and assistance every step of the way. Our commitment is to ensure that patients feel supported and cared for at all times, allowing them to focus on their recovery with peace of mind." data-trans-managed="true">
                     {t("At every juncture of their treatment process, at least one Medivisor staff member is by their side, offering escorting, guidance, and assistance every step of the way. Our commitment is to ensure that patients feel supported and cared for at all times, allowing them to focus on their recovery with peace of mind.")}
                   </p>
                </div>

                {/* Additional SEO-rich content */}
                <div className="hidden" itemProp="serviceArea" itemType="https://schema.org/Country">
                  <span itemProp="name">India</span>
                </div>
                <meta itemProp="medicalSpecialty" content="Medical Tourism" />
              </div>

              {/* Video Side - Performance Optimized */}
              <div className="relative md:col-span-7 w-full mt-0 md:mt-0 md:order-2 order-1">
                <LazyYouTubeEmbed
                  videoId="94RNiXZj8_8"
                  title={t("Medivisor Patient Support Journey - Comprehensive Medical Assistance")}
                  thumbnailQuality="maxresdefault"
                />
              </div>

            </div>
          </div>
        </section>

       {/* Structured Data for SEO */}
       <script
         type="application/ld+json"
         dangerouslySetInnerHTML={{
           __html: JSON.stringify({
             "@context": "https://schema.org",
             "@type": "MedicalOrganization",
             "name": "Medivisor Patient Support",
             "description": "Comprehensive medical tourism support and patient care services in India",
             "url": "https://medivisorindiatreatment.com",
             "serviceArea": {
               "@type": "Country",
               "name": "India"
             },
             "medicalSpecialty": "Medical Tourism",
             "serviceType": "Patient Support and Medical Assistance",
             "hasOfferCatalog": {
               "@type": "OfferCatalog",
               "name": "Medical Tourism Services",
               "itemListElement": [
                 {
                   "@type": "Offer",
                   "itemOffered": {
                     "@type": "Service",
                     "name": "Airport Pickup and Assistance"
                   }
                 },
                 {
                   "@type": "Offer",
                   "itemOffered": {
                     "@type": "Service",
                     "name": "Medical Treatment Coordination"
                   }
                 },
                 {
                   "@type": "Offer",
                   "itemOffered": {
                     "@type": "Service",
                     "name": "24/7 Patient Support"
                   }
                 }
               ]
             }
           })
         }}
       />
     </>
    );
  }
