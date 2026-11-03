"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  getStoredLanguage,
  applyDirAttribute,
  initiatePageTranslation,
  subscribeToLangChange,
  type LanguageCode,
} from "@/lib/googleTranslate";
import { useI18n } from "@/lib/i18n";

export default function TranslationRunner() {
  const pathname = usePathname();
  const { lang, setLangVersion } = useI18n();
  const observerRef = useRef<MutationObserver | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTranslatedLangRef = useRef<LanguageCode>('en');
  const lastPathRef = useRef<string>(pathname);

  const runTranslation = useRef((targetLang: LanguageCode) => {
    lastTranslatedLangRef.current = targetLang;
    initiatePageTranslation(targetLang)
      .then(() => {
        setLangVersion((v) => v + 1)
      })
      .catch(() => {});
  });

  useEffect(() => {
    const unsub = subscribeToLangChange((newLang) => {
      lastTranslatedLangRef.current = newLang;
    });

    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    if (pathname === lastPathRef.current && lang === lastTranslatedLangRef.current) {
      return;
    }

    lastPathRef.current = pathname;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (lang !== 'en') {
        runTranslation.current(lang);
      }
    }, 150);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [pathname, lang, setLangVersion]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') return;

    let timeout: ReturnType<typeof setTimeout> | null = null;

    const observer = new MutationObserver((mutations) => {
      let hasNewDataI18n = false;
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          const el = node as Element;
          if (el.hasAttribute?.('data-i18n') || el.hasAttribute?.('data-i18n-original')) {
            hasNewDataI18n = true;
            break;
          }
          if (el.querySelector?.(' [data-i18n], [data-i18n-original]')) {
            hasNewDataI18n = true;
            break;
          }
        }
        if (hasNewDataI18n) break;
      }

      if (hasNewDataI18n) {
        const currentLang = getStoredLanguage();
        if (currentLang !== 'en') {
          if (timeout) clearTimeout(timeout);
          timeout = setTimeout(() => {
            runTranslation.current(currentLang);
          }, 300);
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    observerRef.current = observer;

    return () => {
      observer.disconnect();
      observerRef.current = null;
      if (timeout) clearTimeout(timeout);
    };
  }, [])

  return null;
}
