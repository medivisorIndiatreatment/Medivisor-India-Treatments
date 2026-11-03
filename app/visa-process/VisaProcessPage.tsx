"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Camera,
  StampIcon as Passport,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Download,
  Users,
  Calendar,
} from "lucide-react"
import CtaSection from "@/components/CtaSection"
import Banner from "@/components/BannerService"
import { DESIGN_TOKENS, getSectionClasses } from "@/components/design-tokens"
import { Trans } from '@/lib/i18n/Trans';
import { useTranslatedStrings } from '@/lib/i18n';

const SUCCESS_COLOR = "#10b981"
const ERROR_COLOR = "#ef4444"

export default function VisaPage() {
  const [activeStep, setActiveStep] = useState<number | null>(null)

  const requiredDocuments = [
    {
      id: 1,
      icon: Passport,
      title: "Passport Bio-Page",
      description: "Submit a clear copy of your passport's bio-page.",
      details: [
        "High-quality scan or photo",
        "All text must be clearly readable",
        "Valid for at least 6 months",
        "PDF or JPEG format accepted",
      ],
      image: "/services/visa.jpg",
    },
    {
      id: 2,
      icon: Camera,
      title: "Personal Photo",
      description:
        "Take a 2x2 inches photo of yourself with your mobile phone. Ensure your face and shoulders are clearly visible against a plain background.",
      details: [
        "2x2 inches dimensions",
        "Plain white or light background",
        "Face and shoulders visible",
        "Recent photo (within 6 months)",
      ],
      image: "/male-female-business-executives.jpg",
    },
    {
      id: 3,
      icon: FileText,
      title: "e-Visa Application Form",
      description: "If you haven't received the form from us, please download it from the link provided.",
      details: [
        "Complete all required fields",
        "Use black or blue ink if printed",
        "Sign and date the form",
        "Double-check all information",
      ],
      image: "/visa-application-form.jpg",
    },
  ]

  const importantNotes = [
    {
      icon: Users,
      title: "All Passengers Required",
      description: "All passengers must submit the required documents, regardless of age.",
    },
    {
      icon: Calendar,
      title: "60-Day Validity",
      description: "Your initial free eVisa will be valid for 60 days from the date of issue.",
    },
    {
      icon: DollarSign,
      title: "Extension Available",
      description: "If an extension is needed, we will arrange it. The visa extension will cost $80 per person.",
    },
  ]

  const visaExtensionDetails = [
    {
      icon: CheckCircle,
      title: "Initial Validity",
      description: "60 days",
      detail: "Your initial free eVisa will be valid for 60 days from issue date.",
    },
    {
      icon: CheckCircle,
      title: "Extension Cost",
      description: "$80 per person",
      detail: "If an extension is needed, we will arrange it for you (government fee applies).",
    },
  ]

const allStrings = useMemo(() => {
    const strings: string[] = []
    requiredDocuments.forEach((doc) => {
      strings.push(doc.title, doc.description, ...doc.details)
    })
    importantNotes.forEach((note) => {
      strings.push(note.title, note.description)
    })
    visaExtensionDetails.forEach((item) => {
      strings.push(`${item.title}: ${item.description}`, item.detail)
    })
    strings.push(
      "Visa Made Simple",
      "Stress-Free Medical Visa Assistance",
      "Getting a visa for your medical treatment can be stressful—but it doesn't have to be. At Medivisor, we handle all the paperwork, guide you through each step, and make sure your journey is smooth and worry-free. Focus on your health, and let us take care of the rest.",
      "Start Your Visa Process",
      "Requirements:",
      "Download e-Visa Application Form",
      "If you haven't received the e-Visa form, download it directly below.",
      "Download Form",
      "Visa Extension Information",
      "Important Information"
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
    <>
      <Banner
        topSpanText={t("Visa Made Simple")}
        title={t("Stress-Free Medical Visa Assistance")}
        description={t("Getting a visa for your medical treatment can be stressful—but it doesn't have to be. At Medivisor, we handle all the paperwork, guide you through each step, and make sure your journey is smooth and worry-free. Focus on your health, and let us take care of the rest.")}
        buttonText={t("Start Your Visa Process")}
        buttonLink="#visa-support"
          bannerBgImage="/banner/service.png"
        mainImageSrc="/about-main-1.png"
        mainImageAlt="Friendly assistance for medical travel visas"
      />
Planning to travel to India for medical treatment? Medivisor India Treatment helps international patients understand the Indian medical visa process and prepare for their medical journey. Our team provides guidance on visa-related documentation and travel coordination, helping you navigate the necessary steps before travelling to India for treatment.
Explore the Visa Process

      {/* Required Documents - Alternating Sections */}
      {requiredDocuments.map((document, index) => {
        const IconComponent = document.icon
        const isEven = index % 2 === 0
        const sectionClasses = getSectionClasses(index)

        return (
          <section key={document.id} id={index === 0 ? "visa-support" : undefined} className={sectionClasses}>
            <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
              <div
                className={`flex flex-col ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-6 lg:gap-12`}
              >
                {/* Image Section */}
                <div className="flex-1 relative group w-full">
                  <div className={`relative overflow-hidden ${DESIGN_TOKENS.BORDER_RADIUS.MD} ${DESIGN_TOKENS.SHADOWS.SM} border border-gray-200`}>
                    <img
                      src={document.image || "/placeholder.svg"}
alt={t(document.title)}
                      className="w-full h-[200px] sm:h-[250px] md:h-[400px] object-cover"
                    />
                  </div>
                  <div className={`absolute -top-4 -left-3 sm:-top-5 sm:-left-4 md:w-14 w-10 md:h-14 h-10 bg-white flex items-center justify-center ${DESIGN_TOKENS.SHADOWS.MD} border border-gray-200 ${DESIGN_TOKENS.BORDER_RADIUS.FULL}`}>
                    <IconComponent className="md:w-7 w-5 md:h-7 h-5 text-[#241d1f]" />
                  </div>
                </div>

                {/* Text Section */}
                <div className="flex-1 space-y-2 w-full">
<h2 className={`${DESIGN_TOKENS.TYPOGRAPHY.H3} text-[#241d1f]`} data-i18n-original={`Step ${index + 1}: ${document.title}`}>
                    Step {index + 1}: {t(document.title)}
                  </h2>
                  <p className={`${DESIGN_TOKENS.TYPOGRAPHY.BODY_LG} text-[#241d1f]`} data-i18n-original={document.description}>{t(document.description)}</p>

                  <div className={`${DESIGN_TOKENS.BORDER_RADIUS.MD} border border-gray-100 ${DESIGN_TOKENS.SHADOWS.SM} overflow-hidden bg-white mt-4`}>
                    <div className="px-4 sm:px-5 pt-3">
                      <h3 className={`${DESIGN_TOKENS.TYPOGRAPHY.H5} text-[#241d1f]`} data-i18n-original="Requirements:">
                        {t("Requirements:")}
                      </h3>
                    </div>
                    <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {document.details.map((detail, detailIndex) => (
                        <div
                          key={detailIndex}
                          className={`flex items-center gap-2 px-3 py-2 ${DESIGN_TOKENS.BORDER_RADIUS.MD} bg-gray-50 ${DESIGN_TOKENS.TRANSITIONS.COLOR} hover:bg-gray-100`}
                        >
                          <CheckCircle className="w-5 h-5 text-[#29A9B9] flex-shrink-0" />
<span className={`${DESIGN_TOKENS.TYPOGRAPHY.BODY_SM} text-[#241d1f]`} data-i18n-original={detail}>{t(detail)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )
      })}

      {/* Download + Visa Extension */}
      <section className={getSectionClasses(3)}>
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Box */}
            <div>
              <div className={`bg-gray-50 ${DESIGN_TOKENS.BORDER_RADIUS.MD} p-6 sm:p-8 md:p-10 h-full flex flex-col justify-center ${DESIGN_TOKENS.SHADOWS.SM} border border-gray-100`}>
                <Download className="w-10 h-10 sm:w-12 sm:h-12 text-[#29A9B9] mb-4" />
<h3 className={`${DESIGN_TOKENS.TYPOGRAPHY.H3} text-[#241d1f] mb-2`} data-i18n-original="Download e-Visa Application Form">
                  {t("Download e-Visa Application Form")}
                </h3>
                <p className={`${DESIGN_TOKENS.TYPOGRAPHY.BODY_LG} text-[#241d1f] mb-6`} data-i18n-original="If you haven't received the e-Visa form, download it directly below.">
                  {t("If you haven't received the e-Visa form, download it directly below.")}
                </p>
                <a href="/e-Visa Application Form.docx" className="w-full sm:w-auto">
                 <Button variant="primary" className="w-auto [px-5]" data-i18n-original="Download Form">
                   {t("Download Form")}
                 </Button>
                </a>
              </div>
            </div>

            {/* Right Box */}
            <div>
              <div className={`h-full ${DESIGN_TOKENS.BORDER_RADIUS.MD} border border-gray-200 bg-[#23366E] ${DESIGN_TOKENS.SHADOWS.SM}`}>
                <div className="p-4 sm:p-8 md:p-10">
                  <div className="pb-4 flex justify-center md:justify-start">
                    <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                  </div>
<h4 className="text-xl sm:text-2xl font-semibold text-white mb-6" data-i18n-original="Visa Extension Information">
                    {t("Visa Extension Information")}
                  </h4>

                  <div className="space-y-6">
                    {visaExtensionDetails.map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center md:flex-row md:items-start gap-3 pb-4 border-b border-[#29A9B9] text-center md:text-left last:border-b-0 last:pb-0">
                        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-green-100">
                          <item.icon className="w-6 h-6 text-[#29A9B9]" />
                        </div>
                        <div>
<p className="font-semibold text-lg md:text-xl text-white" data-i18n-original={`${item.title}: ${item.description}`}>
                            {t(`${item.title}: ${item.description}`)}
                          </p>
                          <p className="text-base md:text-lg text-gray-100" data-i18n-original={item.detail}>
                            {t(item.detail)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Important Information */}
      <section className={getSectionClasses(4)}>
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
<h3 className={`${DESIGN_TOKENS.TYPOGRAPHY.SECTION_HEADING} text-center pb-4 mb-8`} data-i18n-original="Important Information">
            {t("Important Information")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {importantNotes.map((note, index) => {
              const IconComponent = note.icon
              return (
                <div key={index} className={`bg-white ${DESIGN_TOKENS.BORDER_RADIUS.MD} p-6 border border-gray-100 ${DESIGN_TOKENS.SHADOWS.SM} text-center`}>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#23366E] rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
<h4 className={`${DESIGN_TOKENS.TYPOGRAPHY.H4} text-[#241d1f] mb-2`} data-i18n-original={note.title}>{t(note.title)}</h4>
                  <p className={`${DESIGN_TOKENS.TYPOGRAPHY.BODY_BASE} text-[#241d1f]`} data-i18n-original={note.description}>{t(note.description)}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

    
    </>
  )
}
