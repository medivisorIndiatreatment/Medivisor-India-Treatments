"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { useTranslatedStrings } from "@/lib/i18n";
import { Trans } from "@/lib/i18n/Trans";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface ContactFaqSectionProps {
  faqData: FaqItem[];
  title: string;
}

export default function ContactFaqSection({
  faqData,
  title,
}: ContactFaqSectionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const allStrings = useMemo(() => {
    const strings: string[] = [title];
    faqData.forEach((item) => {
      strings.push(item.question, item.answer);
    });
    return strings;
  }, [faqData, title]);

  const translated = useTranslatedStrings(allStrings);

  const translationMap = useMemo(() => {
    const map = new Map<string, string>();
    allStrings.forEach((original, i) => {
      map.set(original, translated[i] ?? original);
    });
    return map;
  }, [allStrings, translated]);

  const t = (text: string): string => {
    if (!text) return text;
    return translationMap.get(text) ?? text;
  };

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isOpen = (id: string) => openItems.has(id);

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3"
            data-i18n-original={title}
            data-trans-managed="true"
          >
            {t(title)}
          </h2>
          <p
            className="text-lg text-gray-600 max-w-3xl mx-auto"
            data-i18n-original="Find quick answers to common questions about contacting Medivisor India for medical treatment support."
            data-trans-managed="true"
          >
            <Trans id="contact.faq-subtitle">
              Find quick answers to common questions about contacting Medivisor
              India for medical treatment support.
            </Trans>
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqData.map((item) => {
            const open = isOpen(item.id);
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-6 py-4 md:py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                  aria-expanded={open}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-[#29A9B9]">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <h3
                      className="text-lg md:text-xl font-semibold text-gray-900 text-left"
                      data-i18n-original={item.question}
                      data-trans-managed="true"
                    >
                      {t(item.question)}
                    </h3>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-colors duration-200">
                      {open ? (
                        <ChevronUp className="w-4 h-4 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                  </div>
                </button>

                {open && (
                  <div className="px-6 py-4 md:px-8 animate-in slide-in-from-top-1 duration-300">
                    <div className="md:ml-14 border-t border-gray-100 pt-4">
                      <p
                        className="text-gray-700 leading-relaxed text-sm md:text-base"
                        data-i18n-original={item.answer}
                        data-trans-managed="true"
                      >
                        {t(item.answer)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
