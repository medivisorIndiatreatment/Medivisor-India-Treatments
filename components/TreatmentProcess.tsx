"use client";

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { FileText, UserCheck, Plane, MapPin, CheckCircle } from "lucide-react"
import { useTranslatedStrings } from "@/lib/i18n"

export default function TreatmentProcessPage() {
  const steps = useMemo(() => [
    {
      id: 1,
      icon: FileText,
      title: "Get a Quote",
      description:
        "Send us your medical reports, and we'll provide a comprehensive quotation that includes a detailed treatment plan and the overall cost, covering treatment, travel, accommodation, and food expenses.",
      image: "/services/quatation.jpg",
      features: ["Detailed treatment plan", "Transparent pricing", "No hidden costs", "Quick 24-hour response"],
    },
    {
      id: 2,
      icon: UserCheck,
      title: "Talk to the Doctor",
      description:
        "Let us know if you'd like to speak with the doctor, and we'll connect you with the appropriate specialist to discuss your personalized treatment plan and expected outcomes in detail.",
      image: "/services/one-gorund.jpg",
      features: [
        "Board-certified specialist",
        "Video consultations",
        "Personalized treatment plans",
        "Multiple language support",
      ],
    },
    {
      id: 3,
      icon: Plane,
      title: "Book a Ticket",
      description:
        "Send us the required documents, and we'll arrange your visa processing. You can then book your flight independently, or if you prefer, we can handle the booking for you. We'll also assist with any flying clearance requirements.",
      image: "/services/visa.jpg",
      features: [
        "Visa processing support",
        "Flight booking assistance",
        "Travel insurance guidance",
        "Medical clearance help",
      ],
    },
    {
      id: 4,
      icon: MapPin,
      title: "Fly to India",
      description:
        "Once you arrive in India, we handle everything else seamlessly, including airport pickup, premium hotel accommodations, hospital visits, currency exchange, and local SIM cards. A dedicated staff member will assist you throughout your entire stay.",
      image: "/services/Fly to India.jpg",
      features: [
        "Airport pickup service",
        "Premium accommodations",
        "Dedicated care coordinator",
        "24/7 emergency support",
      ],
    },
], [])

  const allStrings = useMemo(() => {
    const strings: string[] = []
    steps.forEach((step) => {
      strings.push(step.title, step.description, ...step.features)
    })
    strings.push("What's Included")
    return strings
  }, [steps])

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
    <section className="min-h-screen bg-white">
      <div className="space-y-0">
        {steps.map((step, index) => {
          const IconComponent = step.icon
          const isEven = index % 2 === 0
          const sectionBg = isEven ? "md:bg-gray-50" : "md:bg-white bg-gray-50"
          const cardBg = isEven ? "bg-white" : "bg-gray-50"
          const cardBgInner = isEven ? "bg-gray-50" : "bg-white"

          return (
            <div key={step.id} className={`${sectionBg} py-10 sm:py-14 relative`}>
              <div className="container mx-auto px-5 sm:px-6 lg:px-0">
                <div
                  className={`flex md:border-0 flex-col ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-6 sm:gap-10 lg:gap-12`}
                >
                  {/* Image + Number + Icon Overlay */}
                  <div className="flex-1 relative group w-full">
                    <div className="relative overflow-hidden rounded-md shadow-none sm:shadow-sm">
                      <img
                        src={step.image || "/placeholder.svg"}
alt={t(step.title)}
                        className="w-full h-[220px] sm:h-[280px] md:h-[380px] lg:h-[420px] object-cover"
                      />
                      {/* Step Number Overlay */}
                      <div className="absolute top-4 left-4 md:top-6 md:left-6 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[#241d1f] font-bold text-lg sm:text-xl z-20 shadow-lg">
                          <IconComponent className="w-7 h-7 sm:w-8 sm:h-8" />
                      </div>
                      {/* Icon Overlay */}
                     
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 w-full px-1 sm:px-3 md:px-0 space-y-3 md:space-y-5 relative z-10">
                    {/* Heading with Step Number */}
                    <h2 className="heading-sm flex items-center gap-3 ">
                      <span className="text-[#241d1f] bg-white rounded-full w-9 h-9 flex items-center justify-center text-sm sm:text-xl font-bold shadow-md">
                        {step.id}
                      </span>
{t(step.title)}
                    </h2>

                    <p className="description">
                      {t(step.description)}
                    </p>

                    {/* Inner Card */}
                    <div
                      className={`rounded-md overflow-hidden ${cardBg} border-0 sm:border sm:border-gray-100 shadow-none sm:shadow-sm`}
                    >
                      {/* Header */}
                      <div className="px-0 pt-3 mb-4 md:mb-2 sm:px-5">
<h3 className="title-text">{t("What's Included")}</h3>
                      </div>

                      {/* Features List */}
                      <div className="md:p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {step.features.map((feature, featureIndex) => (
                          <div
                            key={featureIndex}
                            className={`flex items-center gap-2 px-2 sm:px-3 py-2 rounded-md hover:bg-gray-100 transition ${cardBgInner}`}
                          >
                            <CheckCircle className="w-5 h-5 sm:w-5 sm:h-5 text-[#29A9B9] flex-shrink-0" />
<span className="description">{t(feature)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
