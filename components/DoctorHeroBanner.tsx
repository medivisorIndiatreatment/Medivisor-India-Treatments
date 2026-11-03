"use client";

import Image from "next/image";
import { Check, MapPin, Share2 } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import { getWixImageUrl, getWixScaledToFitImageUrl } from "@/lib/wixMedia";
import { DESIGN_TOKENS } from "@/components/design-tokens";
import { stripHtmlTags } from "@/lib/cms";
import { useI18n, useTranslatedStrings } from "@/lib/i18n";

interface DoctorHeroBannerProps {
  name: string;
  title?: string;
  designation?: string;
  image?: string | null;
  qualification?: string;
  specialties: string[];
  experienceYears: number;
  rating: number;
  reviewCount: number;
  languages: string[];
  hospitalName?: string;
  branchName?: string;
  city?: string;
  hospitalBranches?: string[];
  nameI18nKey?: string;
  titleI18nKey?: string;
  designationI18nKey?: string;
  experienceI18nKey?: string;
  shareText?: string;
  shareTitle?: string;
}

const GREEN = "#74BF44";
const RED = "#E22026";

const getImageUrl = (image?: string | null): string | null => {
  if (!image) return null;
  const wixUrl = getWixImageUrl(image);
  if (wixUrl) return wixUrl;
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }
  return null;
};

// Get full doctor image URL with proper sizing for Open Graph
const getDoctorImageUrl = (image?: string | null): string | null => {
  if (!image) return null;
  const wixUrl = getWixScaledToFitImageUrl(image, 1200, 1200);
  if (wixUrl) return wixUrl;
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }
  return null;
};

export default function DoctorHeroBanner({
  name,
  title,
  designation,
  image,
  qualification,
  specialties,
  experienceYears,
  rating,
  reviewCount,
  languages,
  hospitalName = "",
  branchName = "",
  city = "",
  hospitalBranches,
  nameI18nKey,
  titleI18nKey,
  designationI18nKey,
  experienceI18nKey,
  shareText,
  shareTitle,
}: DoctorHeroBannerProps) {
  const [copied, setCopied] = useState(false);
  const { t: tGlobal } = useI18n();
  const doctorImg = getImageUrl(image);

  // Strip HTML from designation and title for clean text display
  const cleanDesignation = useMemo(
    () => stripHtmlTags(designation || ""),
    [designation],
  );
  const cleanTitle = useMemo(() => stripHtmlTags(title || ""), [title]);
  // Strip HTML from other text fields too. Raw CMS rich-text HTML (e.g.
  // "<p>...</p>") nested inside a <p> causes invalid nesting that breaks
  // hydration when the browser auto-corrects the DOM.
  const cleanName = useMemo(() => stripHtmlTags(name || ""), [name]);
  const cleanBranchName = useMemo(
    () => stripHtmlTags(branchName || ""),
    [branchName],
  );
  const cleanHospitalBranches = useMemo(
    () => {
      const branches = (hospitalBranches || [])
        .map((b) => stripHtmlTags(b || "").replace(/\s+/g, " ").trim())
        .filter(Boolean)
      const seen = new Set<string>()
      return branches.filter((b) => {
        const key = b.toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
    },
    [hospitalBranches],
  );
  const cleanSpecialties = useMemo(
    () => specialties.map((s) => stripHtmlTags(s || "")),
    [specialties],
  );

  // Pre-fetch all translatable CMS strings + static labels for flash-free,
  // real-time translation.  This mirrors the pattern used in HospitalCard /
  // TreatmentDetailClient.
  const translatableStrings = useMemo(() => {
    const designation = cleanDesignation || cleanTitle || ""
    const strings: string[] = [
      cleanName,
      designation,
      cleanBranchName,
      ...cleanHospitalBranches,
      hospitalName,
      "Medical Specialist",
      "Share Profile",
      "Share doctor profile",
      "Link Copied!",
      "years experience",
      "years of experience",
      "Check out Dr.",
      "at",
      "Specializing in",
    ]
    cleanSpecialties.forEach((s) => {
      if (s) strings.push(s)
    })
    if (experienceYears > 0) {
      strings.push(`${experienceYears}+ years experience`)
    }
    return Array.from(new Set(strings.filter(Boolean)))
  }, [cleanName, cleanDesignation, cleanTitle, cleanBranchName, cleanHospitalBranches, hospitalName, cleanSpecialties, experienceYears])

  const translatedStrings = useTranslatedStrings(translatableStrings)

  const translationMap = useMemo(() => {
    const map = new Map<string, string>()
    translatableStrings.forEach((original, i) => {
      map.set(original, translatedStrings[i] ?? original)
    })
    return map
  }, [translatableStrings, translatedStrings])

  const t = useCallback(
    (text: string): string => {
      if (!text) return text
      return translationMap.get(text) || tGlobal(text)
    },
    [translationMap, tGlobal],
  )

  // Memoize share handler to prevent re-creation on every render
  const handleShare = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const translatedName = t(cleanName)
    const translatedDesignation = t(cleanDesignation || cleanTitle || "Medical Specialist")
    const shareTitle = `Dr. ${translatedName} - ${translatedDesignation}`;
    const shareText = `Check out Dr. ${translatedName}${hospitalName ? ` at ${t(hospitalName)}` : ""}. ${experienceYears > 0 ? `${experienceYears}+ years of experience. ` : ""}${cleanSpecialties.length > 0 ? `${t("Specializing in")} ${cleanSpecialties.slice(0, 3).map((s) => t(s)).join(", ")}.` : ""}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url,
        });
        return;
      } catch {
        // User cancelled - do nothing
        return;
      }
    }

    // Fallback: copy URL to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [
    cleanName,
    cleanDesignation,
    cleanTitle,
    hospitalName,
    experienceYears,
    cleanSpecialties,
    t,
  ]);

  // Early return for image fallback to reduce nesting
  const renderImage = () => {
    if (!doctorImg) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{
                backgroundColor: `${GREEN}15`,
                border: `2px solid ${GREEN}30`,
              }}
            >
              <span className="text-4xl font-bold" style={{ color: GREEN }}>
                {t(cleanName).charAt(0)}
              </span>
            </div>
            <p className="text-gray-400 text-sm"> {t(cleanName)}</p>
          </div>
        </div>
      );
    }

    return (
      <Image
        src={doctorImg}
        alt={`${t(cleanName)}, ${t(cleanDesignation || cleanTitle || "Medical Specialist")}${cleanBranchName ? ` at ${t(cleanBranchName)}` : ""}${hospitalName ? ` - ${t(hospitalName)}` : ""}`}
        fill
        priority
        className="object-cover object-center h-96 rounded-lg"
        data-i18n-original={`${cleanName}, ${cleanDesignation || cleanTitle || "Medical Specialist"}${cleanBranchName ? ` at ${cleanBranchName}` : ""}${hospitalName ? ` - ${hospitalName}` : ""}`}
        sizes="(max-width: 512px) 50vw, 25vw"
        suppressHydrationWarning
      />
    );
  };

  return (
    <section className="bg-white py-8 md:py-10">
      <div
        className={`${DESIGN_TOKENS.CONTAINER.BASE} relative ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}
      >
        {/* Soft decorative background shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full opacity-[0.04]"
            style={{ backgroundColor: GREEN }}
          />
        </div>

        <div className="relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 md:gap-10 items-center min-h-[480px] lg:min-h-[560px]">
            {/* Left Side - Doctor Info */}
            <div
              className={`flex flex-col justify-end order-2  lg:order-2 col-span-12 lg:col-span-7  py-10 lg:py-10 bg-white`}
            >
              {/* Doctor Name */}
              <h1 className="text-[clamp(28px,3.5vw,48px)] font-semibold text-gray-900 leading-tight tracking-tight mb-1" data-i18n={nameI18nKey} data-i18n-original={cleanName} data-trans-managed="true">
                {t(cleanName)}
              </h1>
              {(cleanDesignation || cleanTitle) && (
                <p className="md:text-xl text-lg text-gray-900 font-normal md:font-medium  leading-relaxed mb-0 max-w-md" data-i18n={designationI18nKey} data-i18n-original={cleanDesignation || cleanTitle} data-trans-managed="true">
                  {t(cleanDesignation || cleanTitle)}
                </p>
              )}
              {/* Hospital Branches */}
              {cleanHospitalBranches.length > 0 ? (
                <div className="flex flex-col gap-1 my-3 text-gray-700">
                  {cleanHospitalBranches.map((hb, idx) => (
                    <div key={`${hb.toLowerCase()}-${idx}`} className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#29A9B9] flex-shrink-0" />
                      <p className="text-gray-900  font-normal md:font-medium text-base" data-i18n-original={hb} data-trans-managed="true">{t(hb)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                cleanBranchName && (
                  <div className="flex items-center gap-2 mb-2 text-gray-700">
                    <MapPin className="w-4 h-4 text-[#29A9B9] flex-shrink-0" />
                    <p className="text-gray-900 my-2 font-normal md:font-medium text-base" data-i18n-original={cleanBranchName} data-trans-managed="true">{t(cleanBranchName)}</p>
                  </div>
                )
              )}
              <div className="flex flex-wrap gap-2 mb-3 ">
                {/* {cleanSpecialties.length > 0 && (
                  <div className="flex flex-wrap gap-2 ">
                    {cleanSpecialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="inline-block px-3 py-1.5 text-sm font-medium rounded-full border"
                        style={{
                          backgroundColor: `${DESIGN_TOKENS.COLORS.SECONDARY}12`,
                          borderColor: `${DESIGN_TOKENS.COLORS.SECONDARY}40`,
                          color: `${DESIGN_TOKENS.COLORS.SECONDARY}`,
                        }}
                        data-i18n-original={specialty}
                        data-trans-managed="true"
                      >
                        {t(specialty)}
                      </span>
                    ))}
                  </div>
                )} */}
                {experienceYears > 0 && (
                  <p className="text-gray-900  font-medium text-lg" data-i18n-original={`${experienceYears}+ years experience`} data-trans-managed="true">
                    {experienceYears}+ {t("years experience")}
                  </p>
                )}
              </div>

              <div className="w-auto flex items-center gap-4 mt-2">
                <button
                  onClick={handleShare}
                  className="relative flex items-center justify-center gap-2 px-10 py-3 rounded-md border border-gray-300 bg-white transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 group"
                  title={t("Share Profile")}
                  data-i18n="doctor.share-profile"
                  data-i18n-original="Share doctor profile"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-[#29A9B9]" />
                      <span className="text-[#000] font-medium text-[14px]" data-i18n="common.link-copied" data-i18n-original="Link Copied!" data-trans-managed="true">
                        {t("Link Copied!")}
                      </span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-gray-800 group-hover:text-gray-700 transition-colors" />
                      <span className="text-gray-800 group-hover:text-gray-700 font-medium text-base transition-colors" data-i18n="doctor.share-profile" data-i18n-original="Share Profile" data-trans-managed="true">
                        {t("Share Profile")}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Image Container */}
            <div className="relative order-1 lg:order-1 col-span-12 md:col-span-3  min-h-[350px] border-4 border-gray-200 rounded-lg lg:max-h-[360px] w-full md:w-auto mx-auto lg:mx-0 aspect-square overflow-hidden">
              {renderImage()}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
