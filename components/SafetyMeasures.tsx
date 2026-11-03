'use client';

import { useState } from 'react';
import { Hospital, Ambulance, HeartHandshake, Info } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import { DESIGN_TOKENS } from '@/components/design-tokens';
import { useTranslatedStrings } from '@/lib/i18n';

export default function SafetyMeasures() {
  const [activeTab, setActiveTab] = useState('hospital');

  const tabs = [
    { id: 'hospital', label: 'Hospital', icon: Hospital },
    { id: 'emergency', label: 'Emergency', icon: Ambulance },
    { id: 'care', label: 'Care', icon: HeartHandshake },
    { id: 'information', label: 'Information', icon: Info }
  ];

  const tabContent = {
    hospital: {
      title: "Where you are treated matters – we make no compromises.",
      cards: [
        {
          title: "Verified Hospitals & Trusted Doctors",
          description:
            "At Medivisor, we partner only with hospitals and doctors who meet the highest standards of global healthcare safety, ethics, and clinical excellence.",
          details: [
            "Super-speciality tertiary care facilities",
            "Accredited by JCI, AACI, or NABH",
            "350+ beds for multi-specialty management",
            "Centrally located in major cities and medical hubs"
          ]
        },
        {
          title: "Hygiene & Infection Control Vigilance",
          description:
            "We proactively monitor infection control standards at our partner hospitals to ensure a safe and sterile environment for every patient.",
          details: [
            "Proper sterilization of surgical tools and equipment",
            "Strict compliance with staff hygiene protocols, including PPE",
            "Daily inspections for cleanliness in patient rooms, ICUs, and waiting areas"
          ]
        }
      ]
    },
    emergency: {
      title: "We don't wait for help to arrive. We bring it to you.",
      cards: [
        {
          title: "Rapid Emergency Response",
          description:
            "Emergencies require speed, clarity, and coordination—and that's exactly what our system delivers.",
          details: [
            "24/7 Emergency SOS Group created for each patient on WhatsApp and Viber",
            "All accommodations booked within 500 meters of both hospital and our office",
            "Round-the-clock paramedic team trained to respond within minutes"
          ]
        }
      ]
    },
    care: {
      title: "Care doesn't end at the hospital door – it travels with the patient.",
      cards: [
        {
          title: "Continuous Medical Oversight",
          description:
            "Every patient case is continuously supervised by our in-house clinical team.",
          details: [
            "Coordinate and communicate with treating specialist",
            "Review test results, prescriptions, and case notes",
            "Offer a second medical opinion whenever required"
          ]
        },
        {
          title: "Daily Nurse Visits at Accommodation",
          description:
            "Our registered nurses make daily visits to patients' hotels or apartments.",
          details: [
            "Ensure medications are taken on time and in the correct dose",
            "Monitor vital signs like blood pressure, temperature, and oxygen levels",
            "Examine surgical sites for signs of infection or delayed healing"
          ]
        }
      ]
    },
    information: {
      title: "Informed patients make safer choices.",
      cards: [
        {
          title: "Patient Education & Informed Decision-Making",
          description:
            "We actively keep the patient and their family informed at every stage, ensuring they are empowered to make safe, confident choices.",
          details: [
            "Clear explanation of diagnosis, treatment options, and timelines",
            "Disclosure of risks, side effects, and alternatives",
            "Real-time progress updates on the treatment plan",
            "A practical list of Do's and Don'ts during recovery, diet, movement, and hygiene"
          ]
        }
      ]
    }
  };

  const cards = tabContent[activeTab as keyof typeof tabContent].cards;
  const activeContent = tabContent[activeTab as keyof typeof tabContent];

  const tabLabels = useTranslatedStrings(tabs.map(t => t.label));
  const sectionIntroText = "At Medivisor, patient safety isn't just a protocol — it's our promise. From the moment you arrive until the day you return home, every step of your medical journey is safeguarded with robust systems, dedicated care, and unwavering attention to detail.";
  const [translatedIntro] = useTranslatedStrings([sectionIntroText]);

  const allTitles = Object.values(tabContent).map(tc => tc.title);
  const translatedTitles = useTranslatedStrings(allTitles);
  const activeTitleIndex = Object.keys(tabContent).indexOf(activeTab);
  const translatedTitle = translatedTitles[activeTitleIndex] || activeContent.title;
  const translatedCards = cards.map(card => ({
    title: card.title,
    description: card.description,
    details: card.details,
  }));
  const allStrings: string[] = [];
  translatedCards.forEach(card => {
    allStrings.push(card.title);
    allStrings.push(card.description);
    card.details.forEach(d => allStrings.push(d));
  });
  const translatedStrings = useTranslatedStrings(allStrings);
  let strOffset = 0;
  const translatedCardsWithText = translatedCards.map(card => {
    const title = translatedStrings[strOffset++];
    const description = translatedStrings[strOffset++];
    const details = card.details.map(() => translatedStrings[strOffset++]);
    return { title, description, details };
  });

  return (
    <section className={`${DESIGN_TOKENS.BACKGROUNDS.GRAY_LIGHT} min-h-screen ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
      <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <SectionHeading
            title="Our Patient Safety Measures"
            align="center"
            className="mb-4"
          />
<p className={`${DESIGN_TOKENS.TYPOGRAPHY.BODY_LG} max-w-3xl mx-auto`} data-i18n-original={sectionIntroText} data-trans-managed="true">
            {translatedIntro}
          </p>
        </div>

        <div className={`${DESIGN_TOKENS.BACKGROUNDS.WHITE} rounded-xl shadow-sm p-4 md:p-6`}>
          <nav className="flex md:hidden overflow-x-auto gap-3 pb-3 mb-6 -mx-2 px-2 scrollbar-hide" aria-label="Safety measures tabs">
{tabs.map((tab, tabIndex) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`flex items-center ${DESIGN_TOKENS.TYPOGRAPHY.H4} text-sm md:text-lg gap-2 px-4 py-2 whitespace-nowrap rounded-full border transition-all duration-200 ${activeTab === tab.id
                    ? 'bg-[#23366E] text-white border-[#23366E]'
                    : 'bg-white text-[#23366E] border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="w-4 h-4" />
<span data-i18n-original={tab.label} data-trans-managed="true">{tabLabels[tabIndex]}</span>
                </button>
              );
            })}
          </nav>

          <nav className="hidden md:flex flex-wrap justify-center border-b border-gray-200 mb-8" aria-label="Safety measures tabs">
{tabs.map((tab, tabIndex) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`py-3 px-6 ${DESIGN_TOKENS.TYPOGRAPHY.H4} text-lg font-semibold border-b-4 rounded-none transition-all ${activeTab === tab.id
                    ? 'text-[#23366E] border-[#29A9B9]'
                    : 'text-gray-700 border-transparent hover:text-[#23366E]'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="w-4 h-4 inline-block mr-2" />
<span data-i18n-original={tab.label} data-trans-managed="true">{tabLabels[tabIndex]}</span>
                </button>
              );
            })}
          </nav>

<div className="overflow-y-auto ">
              <h2 className={`${DESIGN_TOKENS.TYPOGRAPHY.H3} md:border-none pb-2 border-b border-gray-200 mb-6 text-center`} data-i18n-original={activeContent.title} data-trans-managed="true">
                {translatedTitle}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                {cards.map((card, index) => {
                  const tc = translatedCardsWithText[index];
                  return (
                  <div
                    key={index}
                    className={`${DESIGN_TOKENS.COMPONENT.CARD.BASE} transition-all duration-300 flex flex-col h-full`}
                  >
                    <div className={`${DESIGN_TOKENS.COMPONENT.CARD.HOVER} p-6 md:p-8 flex flex-col h-full`}>
                      <h3 className={`${DESIGN_TOKENS.TYPOGRAPHY.H4} mb-3`} data-i18n-original={card.title} data-trans-managed="true">
                        {tc?.title || card.title}
                      </h3>
                      <p className={`${DESIGN_TOKENS.TYPOGRAPHY.DESCRIPTION} text-gray-900 mb-4 flex-1`} data-i18n-original={card.description} data-trans-managed="true">
                        {tc?.description || card.description}
                      </p>
                      <ul className={`space-y-2.5 ${DESIGN_TOKENS.TYPOGRAPHY.DESCRIPTION} text-gray-900 leading-relaxed`}>
                        {card.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-center gap-2">
                            <span className="text-[#29A9B9] font-bold mt-1">✓</span>
                            <span data-i18n-original={detail} data-trans-managed="true">{tc?.details[detailIndex] || detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
        </div>
      </div>
    </section>
  );
}