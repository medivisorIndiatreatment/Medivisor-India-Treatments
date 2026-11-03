"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  applyDirAttribute,
  getLanguageByCode,
  getStoredLanguage,
  LANGUAGES,
  type LanguageCode,
} from "@/lib/googleTranslate";
import { useI18n } from "@/lib/i18n";
import { Trans } from '@/lib/i18n/Trans';

const ENGLISH_LABELS: Record<string, string> = {
  en: 'English',
  ar: 'العربية',
  fr: 'Français',
  es: 'Español',
  pt: 'Português',
  ru: 'Русский',
  'zh-CN': '中文 (简体)',
  sw: 'Kiswahili',
  am: 'አማርኛ',
  ha: 'Hausa',
  fa: 'فارسی',
  ur: 'اردو',
  uz: "O'zbek",
  bn: 'বাংলা',
  de: 'Deutsch',
  ja: '日本語',
  it: 'Italiano',
  pl: 'Polski',
  id: 'Indonesia',
};

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(lang || "en");
  const [isOpen, setIsOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedLang = getStoredLanguage();
    if (storedLang !== selectedLang) {
      setSelectedLang(storedLang);
    }
  }, [lang]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", handleScroll);
    };
  }, [isOpen]);

  const handleSelect = async (code: LanguageCode) => {
    if (code === selectedLang || isChanging) return;

    setIsChanging(true);
    setSelectedLang(code);

    try {
      await setLang(code);
    } catch {
      applyDirAttribute(code);
    } finally {
      setIsChanging(false);
      setIsOpen(false);
    }
  };

  const current = getLanguageByCode(selectedLang);
  const englishLabel = ENGLISH_LABELS[current.code] || current.label;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isChanging}
        className="flex items-center gap-1.5 text-white hover:text-white/80 transition-colors text-sm font-medium px-2 py-1 rounded-md hover:bg-white/10 border-s border-gray-600 ps-2 first:mt-1 first:border-s-0 disabled:opacity-50"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select language"
        data-i18n-original="Select language"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="text-sm font-medium text-white leading-none" data-i18n-original={englishLabel}>
          <Trans id={`lang.${current.code}`}>{englishLabel}</Trans>
        </span>
        <ChevronDown
          size={14}
          className={`text-white transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className={`absolute end-0 top-full mt-1 z-50 w-52 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden`}>
          <div className="py-1 max-h-64 overflow-y-auto dropdown-scrollbar">
            {LANGUAGES.map((language) => {
              const isSelected = selectedLang === language.code;
              const langEnglishLabel = ENGLISH_LABELS[language.code] || language.label;
              return (
                <button
                  key={language.code}
                  onClick={() => handleSelect(language.code)}
                  disabled={isChanging}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-start transition-colors ${
                    isSelected
                      ? "bg-[#23366E]/5 text-[#23366E] font-medium"
                      : "text-[#241d1f] hover:bg-gray-50"
                  }`}
                  role="option"
                  aria-selected={isSelected}
                  data-i18n-original={langEnglishLabel}
                >
                  <span className="text-base leading-none shrink-0">{language.flag}</span>
                  <span className="truncate">
                    <Trans id={`lang.${language.code}`}>{langEnglishLabel}</Trans>
                  </span>
                  {isSelected && (
                    <span className="ms-auto text-xs text-[#29A9B9] font-semibold" data-i18n-original="Active">
                      <Trans id="nav.active">Active</Trans>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}