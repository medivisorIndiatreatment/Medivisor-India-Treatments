"use client";

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Stethoscope, Clock, CreditCard, FileText, MessageCircle, Plane, MapPin, Users, Headphones, Heart } from 'lucide-react';
import { Trans } from '@/lib/i18n/Trans';
import { useTranslatedStrings } from '@/lib/i18n';
import { DESIGN_TOKENS } from "@/components/design-tokens";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  icon: React.ElementType;
}

interface FAQSectionProps {
  faqSectionRef?: React.RefObject<HTMLDivElement>;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'Who is the Indian eye specialist visiting Fiji?',
    answer: 'Dr. Rahul Bhatia, an experienced ophthalmologist from Sharp Sight Eye Hospitals, New Delhi (India), specializing in retina, cornea, cataract, and glaucoma, is visiting Fiji as part of the Medivisor Eye Test Programme.',
    category: 'Doctor',
    icon: Stethoscope
  },
  {
    id: '2',
    question: 'What will happen during the consultation?',
    answer: 'The doctor will review your symptoms or reports, assess your condition, and guide you on the best treatment options available in India, including cost estimates and recovery timelines.',
    category: 'Consultation',
    icon: Clock
  },
  {
    id: '3',
    question: 'How much does the consultation cost?',
    answer: 'The consultation fee is 150 FJD per person, payable on the spot during your appointment.',
    category: 'Consultation',
    icon: CreditCard
  },
  {
    id: '4',
    question: 'How can I register?',
    answer: 'Simply fill out the registration form in the comment section or call your nearest representative:\n\n📍 Reshmi Kumar (Suva) – 9470588\n\n📍 Ashwin Kumar (Lautoka) – 9470527',
    category: 'Registration',
    icon: FileText
  },
  {
    id: '5',
    question: 'What happens after registration?',
    answer: 'You will receive a confirmation call from our team to confirm your appointment time and venue.',
    category: 'Registration',
    icon: MessageCircle
  },
  {
    id: '6',
    question: 'Do I need to bring any medical reports?',
    answer: 'Yes, please bring your latest eye test reports, prescription glasses, and any related medical documents. This helps the doctor understand your condition better.',
    category: 'Requirements',
    icon: FileText
  },
  {
    id: '7',
    question: 'What if I need surgery or advanced treatment?',
    answer: 'If surgery or advanced care is needed, Medivisor will assist you with hospital selection, travel arrangements, visa guidance, and estimated treatment costs in India.',
    category: 'Treatment',
    icon: Plane
  },
  {
    id: '8',
    question: 'Is treatment done in Fiji or India?',
    answer: 'Consultation will be done in Fiji, but the treatment (if required) will be done in India. You may choose any of our empanelled hospitals, including Sharp Sight Eye Hospital, where the visiting doctor, Dr. Rahul Bhatia, is based.',
    category: 'Treatment',
    icon: MapPin
  },
  {
    id: '9',
    question: 'Can I bring a family member with me?',
    answer: 'Absolutely! You can bring a family member or friend along for support during your consultation.',
    category: 'Consultation',
    icon: Users
  },
  {
    id: '10',
    question: 'Will there be follow-up support after the consultation?',
    answer: 'Yes. Our Medivisor team will remain in touch to guide you through the next steps — including travel planning, hospital arrangements, and post-treatment support.',
    category: 'Support',
    icon: Headphones
  },
  {
    id: '11',
    question: 'Why should I choose India for eye treatment?',
    answer: 'India offers world-class eye care with highly experienced doctors, advanced technology, and affordable costs — often at a fraction of what it costs elsewhere.',
    category: 'Treatment',
    icon: Heart
  }
];

const allStrings = [
  'Frequently Asked Questions (FAQs)',
  'questions found',
  ...faqData.flatMap(item => [item.question, item.answer]),
];

export default function FAQSection({ faqSectionRef }: FAQSectionProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const translated = useTranslatedStrings(allStrings);
  const translationMap = useMemo(() => {
    const map = new Map<string, string>();
    allStrings.forEach((original, i) => {
      map.set(original, translated[i] ?? original);
    });
    return map;
  }, [translated]);

  const t = (text: string): string => {
    if (!text) return text;
    return translationMap.get(text) ?? text;
  };
  const toggleItem = (id: string) => {
    setOpenItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className={`w-full ${DESIGN_TOKENS.BACKGROUNDS.GRAY_LIGHT} ${DESIGN_TOKENS.SECTION_SPACING.PX}`} ref={faqSectionRef}>
      <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}>
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`${DESIGN_TOKENS.TYPOGRAPHY.H2} text-[#241d1f]`} data-i18n="faq.title" data-i18n-original="Frequently Asked Questions (FAQs)" data-trans-managed="true">
                {t("Frequently Asked Questions (FAQs)")}
              </h2>
              <p className={`${DESIGN_TOKENS.TYPOGRAPHY.SECTION_SUBTITLE}`} data-i18n="faq.count" data-i18n-original={`${faqData.length} questions found`} data-trans-managed="true">
                {faqData.length} {t("questions found")}
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Items - Full width */}
        <div className={`space-y-4`}>
          {faqData.map((item) => {
            const Icon = item.icon;
            const isOpen = openItems.includes(item.id);

            return (
              <div
                key={item.id}
                className={`${DESIGN_TOKENS.COMPONENT.CARD.BASE} hover:shadow-md`}
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className={`w-full px-6 py-5 text-left flex items-start justify-between ${DESIGN_TOKENS.TRANSITIONS.COLOR}`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`flex-shrink-0 hidden md:block mt-1`}>
                      <div className={`w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 text-[#241d1f]`} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`${DESIGN_TOKENS.TYPOGRAPHY.SECTION_SUBTITLE} font-medium text-[#241d1f]`} data-i18n-original={item.question} data-trans-managed="true">
                        {t(item.question)}
                      </h3>
                    </div>
                  </div>
                  <div className={`flex-shrink-0 ml-4 mt-1`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 ${isOpen ? 'bg-gray-100' : 'bg-gray-100'}`}>
                      {isOpen ? (
                        <ChevronUp className={`w-4 h-4 text-[#241d1f]`} />
                      ) : (
                        <ChevronDown className={`w-4 h-4 text-[#241d1f]`} />
                      )}
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className={`px-6 pb-6 ${DESIGN_TOKENS.TRANSITIONS.FAST}`}>
                    <div className={`md:ml-14 pt-2 border-t border-gray-100`}>
                      <div className={`pt-4`}>
                        {item.answer.split('\n\n').map((paragraph, index) => (
                          <p key={index} className={`${DESIGN_TOKENS.TYPOGRAPHY.SECTION_SUBTITLE}`} data-i18n-original={paragraph} data-trans-managed="true">
                            {t(paragraph)}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
