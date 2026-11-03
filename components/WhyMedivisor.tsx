"use client"

import { FC, useMemo } from "react"
import { FaHandHoldingMedical } from "react-icons/fa"
import { DESIGN_TOKENS } from "./design-tokens"
import { Trans } from '@/lib/i18n/Trans';
import { useTranslatedStrings } from '@/lib/i18n'

const OverviewSection: FC = () => {
  const allStrings = useMemo(() => [
    "Medical Travel Support",
    "Why Medivisor Matters",
    "Walk into any major hospital in India, and you'll likely find it teeming with patients. This is expected — given India's vast population, the increasing burden of diseases, and the rapid growth of international medical tourism. Amid such overwhelming demand, securing quick, personalized care — especially for international patients — can be extremely difficult.",
    "While many hospitals do operate international patient departments, these are often understaffed and overstretched. The result? Overseas patients face long queues, procedural delays, and minimal emotional or logistical support.",
    "Additionally, due to the lack of a personalized advocate, no one in the hospital is actively monitoring your bills, negotiating discounts, or questioning the necessity of every test or procedure. This can lead to higher costs and confusion.",
    "The challenges don't end here — they extend well beyond the hospital walls.",
    "Once outside, international patients are largely on their own — finding a hotel, arranging local transport, buying medicines, exchanging currency, getting SIM cards, and even exploring local attractions. These activities may enrich their stay but also bring risks like scams, inflated pricing, language issues, and cultural miscommunication.",
    "This is where Medivisor makes a difference.",
    "Medivisor ensures seamless support from start to finish — from arrival in India to departure. It facilitates:",
    "Fast-tracked hospital appointments and priority diagnostics",
    "Monitoring and verification of medical bills",
    "Coordination for second and third medical opinions",
    "Full support outside the hospital — logistics, accommodation, local services, and more",
    "Importantly, Medivisor protects the patient's right to choose. By arranging consultations with multiple hospitals and doctors, patients can compare opinions before committing to treatment. This ensures well-informed, confident decisions about their health.",
    "In short, Medivisor stands by you — inside and outside the hospital — as your trusted advocate, advisor, and companion throughout your medical journey in India.",
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
    <section id="overview" className="bg-white md:py-20 md:px-0 px-2 py-10">
      <div className="container mx-auto ">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Content */}
          <div data-aos="fade-left" data-aos-duration="1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#29A9B9] text-white rounded-full text-base font-medium mb-4">
            <FaHandHoldingMedical/>
<span data-i18n-original="Medical Travel Support">
                {t("Medical Travel Support")}
              </span>
            </div>

            <div className="text-left w-full mx-auto">
             <h2 className={`${DESIGN_TOKENS.TYPOGRAPHY.H2} text-gray-900 leading-tight mb-4`} data-i18n-original="Why Medivisor Matters">
               {t("Why Medivisor Matters")}
             </h2>

             <p className={`${DESIGN_TOKENS.TYPOGRAPHY.DESCRIPTION} text-gray-900 mb-4`} data-i18n-original="Walk into any major hospital in India, and you'll likely find it teeming with patients. This is expected — given India's vast population, the increasing burden of diseases, and the rapid growth of international medical tourism. Amid such overwhelming demand, securing quick, personalized care — especially for international patients — can be extremely difficult.">
               {t("Walk into any major hospital in India, and you'll likely find it teeming with patients. This is expected — given India's vast population, the increasing burden of diseases, and the rapid growth of international medical tourism. Amid such overwhelming demand, securing quick, personalized care — especially for international patients — can be extremely difficult.")}
             </p>

             <p className={`${DESIGN_TOKENS.TYPOGRAPHY.DESCRIPTION} text-gray-900 mb-4`} data-i18n-original="While many hospitals do operate international patient departments, these are often understaffed and overstretched. The result? Overseas patients face long queues, procedural delays, and minimal emotional or logistical support.">
               {t("While many hospitals do operate international patient departments, these are often understaffed and overstretched. The result? Overseas patients face long queues, procedural delays, and minimal emotional or logistical support.")}
             </p>

             <p className={`${DESIGN_TOKENS.TYPOGRAPHY.DESCRIPTION} text-gray-900 mb-4`} data-i18n-original="Additionally, due to the lack of a personalized advocate, no one in the hospital is actively monitoring your bills, negotiating discounts, or questioning the necessity of every test or procedure. This can lead to higher costs and confusion.">
               {t("Additionally, due to the lack of a personalized advocate, no one in the hospital is actively monitoring your bills, negotiating discounts, or questioning the necessity of every test or procedure. This can lead to higher costs and confusion.")}
             </p>

             <p className={`${DESIGN_TOKENS.TYPOGRAPHY.DESCRIPTION} text-gray-900 mb-4`} data-i18n-original="The challenges don't end here — they extend well beyond the hospital walls.">
               {t("The challenges don't end here — they extend well beyond the hospital walls.")}
             </p>

             <p className={`${DESIGN_TOKENS.TYPOGRAPHY.DESCRIPTION} text-gray-900 mb-4`} data-i18n-original="Once outside, international patients are largely on their own — finding a hotel, arranging local transport, buying medicines, exchanging currency, getting SIM cards, and even exploring local attractions. These activities may enrich their stay but also bring risks like scams, inflated pricing, language issues, and cultural miscommunication.">
               {t("Once outside, international patients are largely on their own — finding a hotel, arranging local transport, buying medicines, exchanging currency, getting SIM cards, and even exploring local attractions. These activities may enrich their stay but also bring risks like scams, inflated pricing, language issues, and cultural miscommunication.")}
             </p>

             <p className={`${DESIGN_TOKENS.TYPOGRAPHY.DESCRIPTION} text-gray-900 mb-4`} data-i18n-original="This is where Medivisor makes a difference.">
               {t("This is where Medivisor makes a difference.")}
             </p>

             <p className={`${DESIGN_TOKENS.TYPOGRAPHY.DESCRIPTION} text-gray-900 mb-4`} data-i18n-original="Medivisor ensures seamless support from start to finish — from arrival in India to departure. It facilitates:">
               {t("Medivisor ensures seamless support from start to finish — from arrival in India to departure. It facilitates:")}
             </p>

               <ul className="list-disc list-inside mt-2 description space-y-2">
                 <li data-i18n-original="Fast-tracked hospital appointments and priority diagnostics">{t("Fast-tracked hospital appointments and priority diagnostics")}</li>
                 <li data-i18n-original="Monitoring and verification of medical bills">{t("Monitoring and verification of medical bills")}</li>
                 <li data-i18n-original="Coordination for second and third medical opinions">{t("Coordination for second and third medical opinions")}</li>
                 <li data-i18n-original="Full support outside the hospital — logistics, accommodation, local services, and more">{t("Full support outside the hospital — logistics, accommodation, local services, and more")}</li>
               </ul>

             <p className={`${DESIGN_TOKENS.TYPOGRAPHY.DESCRIPTION} text-gray-900 mb-4`} data-i18n-original="Importantly, Medivisor protects the patient's right to choose. By arranging consultations with multiple hospitals and doctors, patients can compare opinions before committing to treatment. This ensures well-informed, confident decisions about their health.">
               {t("Importantly, Medivisor protects the patient's right to choose. By arranging consultations with multiple hospitals and doctors, patients can compare opinions before committing to treatment. This ensures well-informed, confident decisions about their health.")}
             </p>

             <p className={`${DESIGN_TOKENS.TYPOGRAPHY.DESCRIPTION} text-gray-900 mb-4`} data-i18n-original="In short, Medivisor stands by you — inside and outside the hospital — as your trusted advocate, advisor, and companion throughout your medical journey in India.">
               {t("In short, Medivisor stands by you — inside and outside the hospital — as your trusted advocate, advisor, and companion throughout your medical journey in India.")}
             </p>
            </div>
          </div>

          {/* Right Content - Video */}
          <div className="relative" data-aos="fade-right" data-aos-duration="1000">
            <div className="lg:sticky lg:top-24">
              <div className="rounded-md overflow-hidden border border-gray-200 shadow-xl">
                <iframe
                  className="w-full min-h-[200px] md:min-h-[400px] rounded-md"
                  src="https://www.youtube.com/embed/94RNiXZj8_8?autoplay=1&rel=0&modestbranding=1&showinfo=0"
                  title="Medivisor Overview"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default OverviewSection
