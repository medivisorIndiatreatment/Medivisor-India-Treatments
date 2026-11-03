"use client"
import { useMemo } from "react"
import Image from "next/image"
import { MapPin, CheckCircle, CreditCard, Stethoscope, Shield, Luggage, Navigation, Clock, Armchair } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Banner from "@/components/BannerService"
import CtaSection from "@/components/CtaSection"
import { DESIGN_TOKENS } from "@/components/design-tokens"
import { useTranslatedStrings } from "@/lib/i18n"

export default function TravelGuidePage() {
  const beforeDepartureItems = [
    { icon: <CreditCard className="w-6 h-6" />, title: "Currency Exchange", description: "Convert your currency to USD, potentially at a local forex outlet, and request 100 denomination new notes for better deals." },
    { icon: <Luggage className="w-6 h-6" />, title: "Pack Light", description: "Keep your luggage light, not exceeding 23 kg per person, and consider doing some shopping in India." },
    { icon: <Clock className="w-6 h-6" />, title: "Weather Check", description: "Check the local temperature on Google and pack clothes accordingly." },
    { icon: <Shield className="w-6 h-6" />, title: "Travel Adaptor", description: "Carry a travel adaptor, as plug points at the transit airports and in India may differ from those in your country." },
    { icon: <Armchair className="w-6 h-6" />, title: "Comfort Items", description: "Consider bringing a neck pillow for added comfort." },
    { icon: <Navigation className="w-6 h-6" />, title: "Entertainment", description: "Load movies onto your laptop or mobile phone for entertainment during transit." },
    { icon: <Shield className="w-6 h-6" />, title: "Food Items", description: "Bring tin fish or local food items if desired, as they may not be readily available in India." },
    { icon: <Stethoscope className="w-6 h-6" />, title: "Medical Consultation", description: "Consult your local doctor, and if coming for surgery, stop taking aspirin and other blood thinners one day before departure." },
    { icon: <CheckCircle className="w-6 h-6" />, title: "Medical Reports", description: "Bring all medical reports and any medical imaging CDs (angiogram, MRI, CT)." },
    { icon: <Stethoscope className="w-6 h-6" />, title: "Health Monitoring", description: "Carry a glucometer and strips if needed to check sugar levels regularly; alternatively, purchase them in India." },
    { icon: <CheckCircle className="w-6 h-6" />, title: "Identification", description: "Send photos of the travelers via Viber (+918368247758) or email (info@medivisorhealth.com) for easy identification at the airport." },
  ]

  const transitTips = [
    { title: "Airport Help Desk", description: "Approach the airport help desk if there's confusion about the departure terminal and/or gate.", image: "/businessmen-with-bills-background.jpg" },
    { title: "Currency Exchange", description: "Convert 50-100 USD into Indian rupees; the rest can be exchanged in India for a better rate.", image: "/currency-exchange.jpg" },
    { title: "SIM Card & Connectivity", description: "Purchase a local SIM card (preferably Airtel) for better connectivity, as international roaming may be costly.", image: "/SIM-Card-Connectivity.jpg" },
    { title: "Medical Assistance Desk", description: "Visit the dedicated medical assistance desk at the airport for emergency support, guidance on medical visa queries, or hospital transfers.", image: "/Medical Assistance Desk.jpg" },
  ]

  const arrivalSteps = [
    "Request a wheelchair from airline staff if necessary.",
    "Turn on Wi-Fi and connect to Airport Free WiFi.",
    "Proceed to the Medical Visa Immigration Desk if on a medical visa for a shorter passenger queue.",
    "For patients with Electronic Travel Authorization (ETA), the visa will be issued upon arrival, ensuring it's an e-Medical Visa (not e-Tourist Visa).",
    "Collect your check-in baggage after crossing immigration.",
    "Approach the customs desk/officer if unsure about declaring any goods.",
    "Exit from Gate #5 or Gate #6, take a left, and wait outside KFC; our executive will have a placard of Medivisor Health.",
    "If the executive is not found, wait for some time; in case of significant delays, call 7042408473/9643015697 from a local Airtel phone booth outside Gate #5.",
    "If hungry, pick up food/snacks from the airport restaurant/food point, especially crucial if arriving at night when guest house/hotel kitchens might be closed.",
  ]

const allStrings = useMemo(() => {
    const strings: string[] = []
    beforeDepartureItems.forEach((item) => {
      strings.push(item.title, item.description)
    })
    transitTips.forEach((tip) => {
      strings.push(tip.title, tip.description)
    })
    arrivalSteps.forEach((step) => {
      strings.push(step)
    })
    strings.push(
      "Travel Guide",
      "Your Medical Journey to India Made Easy",
      "Traveling for treatment can feel overwhelming, but we make it simple. From what to pack, where to stay, and how to get around, our guide ensures you and your family feel prepared, comfortable, and confident at every step of your journey.",
      "Explore Travel Tips",
      "Before Departure",
      "A comprehensive checklist to help you prepare for a successful and stress-free medical trip.",
      "At the Transit Airport",
      "Smart strategies to navigate your layover with ease and confidence.",
      "After Arriving at Delhi Airport",
      "Follow these important steps to ensure a smooth arrival and transition for your medical journey in India.",
      "Safe travels, and we look forward to assisting you on your medical journey in India. If you have any further questions or need support, feel free to reach out. Take care and best wishes for a successful and comfortable stay."
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
    <div className="min-h-screen bg-white">
      <Banner
        topSpanText={t("Travel Guide")}
        title={t("Your Medical Journey to India Made Easy")}
        description={t("Traveling for treatment can feel overwhelming, but we make it simple. From what to pack, where to stay, and how to get around, our guide ensures you and your family feel prepared, comfortable, and confident at every step of your journey.")}
        buttonText={t("Explore Travel Tips")}
        buttonLink="/initiatives"
          bannerBgImage="/banner/service.png"
        mainImageSrc="/about-main-1.png"
        mainImageAlt="Friendly Travel Guide for Medical Journey"
      />

      {/* Before Departure Section */}
      <section className="bg-white py-12 md:py-16 border-t border-gray-100">
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-gray-100 rounded-md border border-gray-200">
                <Image src="/icon/air.png" alt="Departure Icon" width={40} height={40} className="w-10 h-10" />
              </div>
            </div>
<h2 className="text-2xl md:text-4xl font-semibold text-[#241d1f] leading-tight mb-2" data-i18n-original="Before Departure">
              {t("Before Departure")}
            </h2>
            <p className="text-base md:text-lg text-[#241d1f] leading-relaxed max-w-2xl mx-auto" data-i18n-original="A comprehensive checklist to help you prepare for a successful and stress-free medical trip.">
              {t("A comprehensive checklist to help you prepare for a successful and stress-free medical trip.")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {beforeDepartureItems.map((item, index) => (
              <Card
                key={index}
                className="bg-gray-50 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-4 p-4 border-b border-gray-100">
                  <div className="flex-shrink-0 p-3 bg-[#29A9B9] rounded-full text-white">
                    {item.icon}
                  </div>
<h3 className={`${DESIGN_TOKENS.TYPOGRAPHY.H4} text-[#241d1f]`} data-i18n-original={item.title}>{t(item.title)}</h3>
                </div>
                <CardContent className="p-4">
                  <p className={`${DESIGN_TOKENS.TYPOGRAPHY.DESCRIPTION} text-[#241d1f]`} data-i18n-original={item.description}>{t(item.description)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* At the Transit Airport Section */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-white rounded-md border border-gray-100">
                <MapPin className="w-10 h-10 text-[#241d1f]" />
              </div>
            </div>
<h2 className="text-2xl md:text-4xl font-semibold text-[#241d1f] leading-tight mb-2" data-i18n-original="At the Transit Airport">
              {t("At the Transit Airport")}
            </h2>
            <p className="text-base md:text-lg text-[#241d1f] leading-relaxed max-w-2xl mx-auto" data-i18n-original="Smart strategies to navigate your layover with ease and confidence.">
              {t("Smart strategies to navigate your layover with ease and confidence.")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {transitTips.map((tip, index) => (
              <Card key={index} className="group overflow-hidden rounded-lg bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="relative h-40 w-full overflow-hidden">
                  <Image src={tip.image} alt={t(tip.title)} width={400} height={160} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <CardHeader className="p-4 pt-3">
                  <h3 className={`${DESIGN_TOKENS.TYPOGRAPHY.H4} mt-2 text-[#241d1f]`} data-i18n-original={tip.title}>{t(tip.title)}</h3>
                </CardHeader>
                <CardContent className="px-4 pt-0">
                  <p className={`${DESIGN_TOKENS.TYPOGRAPHY.DESCRIPTION} text-[#241d1f]`} data-i18n-original={tip.description}>{t(tip.description)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* After Arriving Section */}
      <section className="bg-white py-12 md:py-16 border-t border-gray-200">
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Left Side */}
            <div className="lg:sticky top-20">
              <h2 className="text-2xl md:text-4xl font-semibold text-[#241d1f] leading-tight pb-4" data-i18n-original="After Arriving at Delhi Airport">
                {t("After Arriving at Delhi Airport")}
              </h2>
              <Image src="/social-distance.jpg" alt="Arrival assistance" width={800} height={400} sizes="(max-width: 1024px) 100vw, 800px" className="w-full rounded-md shadow-sm" />
            </div>

            {/* Right Side */}
            <div className="space-y-6">
<p className="text-lg md:text-xl text-[#241d1f] leading-relaxed" data-i18n-original="Follow these important steps to ensure a smooth arrival and transition for your medical journey in India.">
                {t("Follow these important steps to ensure a smooth arrival and transition for your medical journey in India.")}
              </p>
              <div className="space-y-4">
                {arrivalSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#29A9B9] mt-0.5 flex-shrink-0" />
<p className="text-base md:text-lg text-[#241d1f] leading-relaxed" data-i18n-original={step}>{t(step)}</p>
                  </div>
                ))}
              </div>
              <div className="pt-6 border-t border-gray-100">
<p className="text-base md:text-lg text-[#241d1f] leading-relaxed" data-i18n-original="Safe travels, and we look forward to assisting you on your medical journey in India. If you have any further questions or need support, feel free to reach out. Take care and best wishes for a successful and comfortable stay.">
                  {t("Safe travels, and we look forward to assisting you on your medical journey in India. If you have any further questions or need support, feel free to reach out. Take care and best wishes for a successful and comfortable stay.")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
