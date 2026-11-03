import { batchTranslate, initBatcher } from './translationBatcher'

export const GT_LANG_STORAGE_KEY = 'medivisor-lang';
export const GT_LANG_COOKIE = 'medivisor-lang';

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸', dir: 'ltr' as const },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' as const },
  { code: 'ar', label: 'العربية', flag: '🇸🇦', dir: 'rtl' as const },
  { code: 'fr', label: 'Français', flag: '🇫🇷', dir: 'ltr' as const },
  { code: 'es', label: 'Español', flag: '🇪🇸', dir: 'ltr' as const },
  { code: 'pt', label: 'Português', flag: '🇵🇹', dir: 'ltr' as const },
  { code: 'ru', label: 'Русский', flag: '🇷🇺', dir: 'ltr' as const },
  { code: 'zh-CN', label: '中文 (简体)', flag: '🇨🇳', dir: 'ltr' as const },
  { code: 'sw', label: 'Kiswahili', flag: '🇰🇪', dir: 'ltr' as const },
  { code: 'am', label: 'አማርኛ', flag: '🇪🇹', dir: 'ltr' as const },
  { code: 'ha', label: 'Hausa', flag: '🇳🇬', dir: 'ltr' as const },
  { code: 'fa', label: 'فارسی', flag: '🇮🇷', dir: 'rtl' as const },
  { code: 'ur', label: 'اردو', flag: '🇵🇰', dir: 'rtl' as const },
  { code: 'uz', label: "O'zbek", flag: '🇺🇿', dir: 'ltr' as const },
  { code: 'bn', label: 'বাংলা', flag: '🇧🇩', dir: 'ltr' as const },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', dir: 'ltr' as const },
  { code: 'ja', label: '日本語', flag: '🇯🇵', dir: 'ltr' as const },
  { code: 'it', label: 'Italiano', flag: '🇮🇹', dir: 'ltr' as const },
  { code: 'pl', label: 'Polski', flag: '🇵🇱', dir: 'ltr' as const },
  { code: 'id', label: 'Indonesia', flag: '🇮🇩', dir: 'ltr' as const },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

const TRANSLATION_CACHE_PREFIX = 'medivisor-translation-cache-';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;
const isDev = process.env.NODE_ENV !== 'production';

// =============================================================================
// IN-MEMORY SYNC CACHE
// Allows synchronous translation lookups during React render.
// Hydrated from localStorage on module load; populated on fetch.
// =============================================================================

interface SyncCacheEntry {
  translations: Map<string, string>;
  expiresAt: number;
}

// Keyed by language code for quick lookup
const syncCache = new Map<LanguageCode, SyncCacheEntry>();

// Pub/sub for language changes — lets the TranslationRunner and Trans component
// react instantly to language switches without polling.
const langSubscribers = new Set<(lang: LanguageCode) => void>();

// =============================================================================
// CENTRALIZED BATCHER
// Accumulates translation requests from all callers (React hooks, DOM
// translation, HTML content translation) within BATCH_WINDOW_MS and dispatches
// a single API call per target language. See lib/translationBatcher.ts
// =============================================================================

initBatcher(
  // API call function — translateViaApi is a hoisted function declaration below
  (texts, target) => translateViaApi(texts, target),
  // Cache get — getCachedTranslation is a hoisted function declaration below
  (target, text) => getCachedTranslation(target, text),
  // Cache set — populates both sync cache and localStorage
  (target, translations) => {
    const syncEntry = syncCache.get(target)
    if (syncEntry && isCacheValid(syncEntry)) {
      for (const [k, v] of translations) {
        syncEntry.translations.set(k, v)
      }
    } else {
      syncCache.set(target, {
        translations: new Map(translations),
        expiresAt: Date.now() + CACHE_TTL,
      })
    }
    const cacheKey = `${TRANSLATION_CACHE_PREFIX}${target}`
    const existing = loadTranslationCache(cacheKey) || new Map<string, string>()
    for (const [k, v] of translations) {
      existing.set(k, v)
    }
    saveTranslationCache(cacheKey, existing)
  }
)

function isCacheValid(entry: SyncCacheEntry): boolean {
  return Date.now() < entry.expiresAt;
}

function hydrateSyncCache(): void {
  if (typeof window === 'undefined') return;

  for (const lang of LANGUAGES) {
    if (lang.code === 'en') continue;
    const cacheKey = `${TRANSLATION_CACHE_PREFIX}${lang.code}`;
    const map = loadTranslationCache(cacheKey);
    if (map && map.size > 0) {
      syncCache.set(lang.code, {
        translations: map,
        expiresAt: Date.now() + CACHE_TTL,
      });
    }
  }
}

// Hydrate on module load (browser only)
if (typeof window !== 'undefined') {
  // Defer hydration to avoid blocking initial render
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(hydrateSyncCache, { timeout: 2000 });
  } else {
    setTimeout(hydrateSyncCache, 100);
  }
}

/**
 * Synchronous translation lookup from the in-memory cache.
 * Returns the translation if cached, or the original text if not found / English.
 */
export function getCachedTranslation(
  lang: LanguageCode,
  text: string
): string | null {
  if (lang === 'en') return text;
  if (!text) return null;

  const entry = syncCache.get(lang);
  if (!entry || !isCacheValid(entry)) return null;

  return entry.translations.get(text) || null;
}

/**
 * Check if a translation is cached (synchronous).
 */
export function isTranslated(lang: LanguageCode, text: string): boolean {
  return getCachedTranslation(lang, text) !== null;
}

/**
 * Subscribe to language changes. Called when the user selects a new language.
 * Returns an unsubscribe function.
 */
export function subscribeToLangChange(
  callback: (lang: LanguageCode) => void
): () => void {
  langSubscribers.add(callback);
  return () => {
    langSubscribers.delete(callback);
  };
}

/**
 * Notify all subscribers that the language has changed.
 */
export function notifyLangChange(lang: LanguageCode): void {
  langSubscribers.forEach((cb) => {
    try {
      cb(lang);
    } catch {
      // Subscriber error should not crash others
    }
  });
}

// =============================================================================
// PERSISTENT STORAGE
// =============================================================================

export function getStoredLanguage(): LanguageCode {
  if (typeof window === 'undefined') return getLanguageFromCookie();
  try {
    const stored = localStorage.getItem(GT_LANG_STORAGE_KEY);
    if (stored && LANGUAGES.some((l) => l.code === stored)) {
      return stored as LanguageCode;
    }
  } catch {
    // localStorage unavailable
  }
  return getLanguageFromCookie();
}

export function getLanguageFromCookie(cookieHeader?: string): LanguageCode {
  let cookieStr: string;
  if (cookieHeader !== undefined) {
    cookieStr = cookieHeader;
  } else if (typeof document !== 'undefined') {
    cookieStr = document.cookie;
  } else {
    return 'en';
  }

  const match = cookieStr.match(new RegExp(`${GT_LANG_COOKIE}=([^;]+)`));
  if (match && match[1] && LANGUAGES.some((l) => l.code === match[1])) {
    return match[1] as LanguageCode;
  }
  return 'en';
}

export function setStoredLanguage(lang: LanguageCode) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GT_LANG_STORAGE_KEY, lang);
  } catch {
    // localStorage unavailable
  }
  document.cookie = `${GT_LANG_COOKIE}=${lang};path=/;max-age=31536000;samesite=lax`;
}

export function getLanguageByCode(code: string) {
  return LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
}

export const isRtlLanguage = (lang: LanguageCode): boolean => {
  return getLanguageByCode(lang).dir === 'rtl';
};

// =============================================================================
// BATCH TRANSLATION FETCH (with centralized batching + caching)
// =============================================================================

/**
 * Fetch translations for text strings, using cache for already-translated strings.
 * Uses the centralized translation batcher to combine concurrent requests from
 * all callers (React hooks, DOM translation, HTML content) into a single API call.
 * Returns a Map of original → translated text.
 */
export async function fetchTranslations(
  texts: string[],
  target: LanguageCode
): Promise<Map<string, string>> {
  if (typeof window === 'undefined' || !texts.length) {
    return new Map();
  }

  if (target === 'en') {
    return new Map(texts.map((t) => [t, t]));
  }

  // Delegate to the centralized batcher which accumulates concurrent requests
  // across all callers and dispatches a single API call per language.
  const result = await batchTranslate(target, texts);

  if (isDev) {
    const uncached = texts.filter(
      (t) => t && t.trim() && !getCachedTranslation(target, t)
    ).length;
    console.log(`[translate] fetchTranslations(${target}):`, {
      requested: texts.length,
      cached: texts.length - uncached,
      fetched: uncached,
    });
  }

  return result;
}

/**
 * Translate an array of strings. Deduplicates concurrent requests for the same
 * language. Returns an array of translated strings in the same order as input.
 */
export async function translateStrings(
  texts: string[],
  target: LanguageCode
): Promise<string[]> {
  if (!texts.length) return [];
  const map = await fetchTranslations(texts, target);
  return texts.map((t) => map.get(t) || t);
}

const RETRYABLE_STATUSES = new Set([408, 429, 503, 504]);
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 500;
const RATE_LIMIT_RETRY_DELAY_MS = 3000;
const REQUEST_TIMEOUT_MS = 15000;

const MAX_BATCH_SIZE = 100;
const MAX_CONCURRENT_BATCHES = 5;

function isServerRetryable(status: number, retryable?: boolean): boolean {
  if (retryable === true) return true;
  return RETRYABLE_STATUSES.has(status);
}

async function translateViaApi(
  texts: string[],
  target: LanguageCode
): Promise<Map<string, string>> {
  // Safety: filter empty strings (server also handles this, but reduce payload)
  const validTexts = texts.filter((t) => t && t.trim());
  const fallback = new Map(texts.map((t) => [t, t]));

  if (validTexts.length === 0) {
    return fallback;
  }

  // Scale timeout with text count — server batches internally
  const estimatedBatches = Math.ceil(validTexts.length / MAX_BATCH_SIZE);
  const parallelGroups = Math.ceil(estimatedBatches / MAX_CONCURRENT_BATCHES);
  const timeoutMs = Math.max(REQUEST_TIMEOUT_MS, parallelGroups * 10000);

  if (isDev && validTexts.length >= MAX_BATCH_SIZE) {
    console.log(
      `[translate] ${validTexts.length} texts → ~${estimatedBatches} batches, ` +
        `${parallelGroups} parallel groups, timeout ${timeoutMs}ms`
    );
  }

  let lastError: any;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: validTexts,
          target,
          source: 'en',
          format: 'text',
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        let errorMessage = errorText;
        let retryable = false;
        try {
          const parsed = JSON.parse(errorText);
          errorMessage = parsed?.error?.message || errorText;
          retryable = parsed?.retryable === true;
        } catch {
          // keep raw text
        }

        // 403 "User Rate Limit Exceeded" and quota errors are transient —
        // retry with backoff. Other 403s (invalid key, access denied) are permanent.
        const isRateLimit403 =
          response.status === 403 &&
          /rate|limit|quota|user rate/i.test(errorMessage);
        const shouldRetry =
          RETRYABLE_STATUSES.has(response.status) ||
          isRateLimit403 ||
          /timed out|timeout|unavailable/i.test(errorMessage);

        if (shouldRetry && attempt < MAX_RETRIES) {
          const delay =
            RATE_LIMIT_RETRY_DELAY_MS * Math.pow(2, attempt) + Math.random() * 1000;
          if (isDev) console.warn(`[translate] Retryable error (${response.status}), attempt ${attempt + 1}/${MAX_RETRIES} after ${Math.round(delay)}ms:`, errorMessage);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        if (isDev) console.error(`[translate] API error ${response.status}:`, errorMessage);
        return fallback;
      }

      const data = await response.json();
      const translations = data.translations || [];

      const result = new Map<string, string>();
      for (let i = 0; i < validTexts.length; i++) {
        const translated = translations[i];
        if (translated && translated.trim() !== '') {
          result.set(validTexts[i], translated);
        } else {
          result.set(validTexts[i], validTexts[i]);
        }
      }

      return result;
    } catch (error: any) {
      lastError = error;
      if (error?.name === 'AbortError') {
        if (attempt < MAX_RETRIES) {
          const delay = RATE_LIMIT_RETRY_DELAY_MS * Math.pow(2, attempt) + Math.random() * 1000;
          if (isDev) console.warn(`[translate] Request timed out, retrying (${attempt + 1}/${MAX_RETRIES}) after ${Math.round(delay)}ms`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        if (isDev) console.warn('[translate] Request timed out after all retries, returning originals');
      } else {
        const shouldRetry =
          /network|fetch|econn|etimedout|temporarily|unavailable/i.test(
            error?.message || ''
          );
        if (shouldRetry && attempt < MAX_RETRIES) {
          const delay = RATE_LIMIT_RETRY_DELAY_MS * Math.pow(2, attempt) + Math.random() * 1000;
          if (isDev) console.warn(`[translate] Network error, retrying (${attempt + 1}/${MAX_RETRIES}) after ${Math.round(delay)}ms`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        if (isDev) console.error('[translate] Request failed:', error?.message ?? error);
      }
      return fallback;
    } finally {
      clearTimeout(timer);
    }
  }

  if (isDev) console.error('[translate] All retries exhausted:', lastError?.message ?? lastError);
  return fallback;
}

function loadTranslationCache(
  cacheKey: string
): Map<string, string> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(cacheKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const expiresAt = parsed._expiresAt || 0;
    if (Date.now() > expiresAt) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    const map = new Map<string, string>();
    delete parsed._expiresAt;
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === 'string') {
        map.set(k, v);
      }
    }
    return map;
  } catch {
    return null;
  }
}

function saveTranslationCache(
  cacheKey: string,
  translations: Map<string, string>
) {
  if (typeof window === 'undefined') return;
  try {
    const obj: Record<string, string | number> = {
      _expiresAt: Date.now() + CACHE_TTL,
    };
    translations.forEach((v, k) => {
      obj[k] = v;
    });
    localStorage.setItem(cacheKey, JSON.stringify(obj));
  } catch {
    // localStorage unavailable (quota exceeded, private mode, etc.)
  }
}

// =============================================================================
// DOM-BASED TRANSLATION APPLICATION
// =============================================================================

/**
 * Collect all unique original texts from [data-i18n] elements on the page.
 * Returns the texts that still need translation (not in cache).
 */
export function collectUntranslatedTexts(
  targetLang: LanguageCode
): string[] {
  if (typeof document === 'undefined') return [];
  if (targetLang === 'en') return [];

  // Query elements with EITHER data-i18n (key-based) OR data-i18n-original (text-based)
  const elements = document.querySelectorAll('[data-i18n], [data-i18n-original]');
  const textsToTranslate: string[] = [];

  elements.forEach((el) => {
    let originalText: string | null = null;
    let key = el.getAttribute('data-i18n');

    // If data-i18n is present, use it as key and data-i18n-original as text
    if (key) {
      originalText = el.getAttribute('data-i18n-original') || key;
    } else {
      // If only data-i18n-original is present, use it as both key and text
      originalText = el.getAttribute('data-i18n-original');
      if (originalText) {
        key = originalText;
      }
    }

    if (!key || !originalText) return;

    // Skip if already cached
    if (getCachedTranslation(targetLang, originalText)) return;

    if (!textsToTranslate.includes(originalText)) {
      textsToTranslate.push(originalText);
    }
  });

  return textsToTranslate;
}

/**
 * Apply translations to all [data-i18n] elements in the DOM.
 * First tries synchronous cache reads, then fetches any missing translations.
 */
export async function applyTranslations(
  targetLang: LanguageCode
): Promise<void> {
  if (typeof document === 'undefined') return;
  if (targetLang === 'en') {
    restoreOriginalTexts();
    return;
  }

  try {
    // Query elements with EITHER data-i18n OR data-i18n-original
    const elements = document.querySelectorAll('[data-i18n], [data-i18n-original]');
    const textMap = new Map<string, string>();
    const textsToTranslate: string[] = [];

    elements.forEach((el) => {
      let key = el.getAttribute('data-i18n');
      let originalText: string | null = null;

      if (key) {
        originalText = el.getAttribute('data-i18n-original') || key;
      } else {
        originalText = el.getAttribute('data-i18n-original');
        if (originalText) {
          key = originalText;
        }
      }

      if (!key || !originalText) return;

      // Try sync cache first
      const cached = getCachedTranslation(targetLang, originalText);
      if (cached) {
        textMap.set(originalText, cached);
      } else if (!textsToTranslate.includes(originalText)) {
        textsToTranslate.push(originalText);
      }
    });

    if (textsToTranslate.length === 0) {
      // All cached — apply from cache
      elements.forEach((el) => {
        applyTranslationToElement(el, targetLang);
      });
      notifyLangChange(targetLang);
      return;
    }

    // Batch fetch remaining missing translations
    const translations = await fetchTranslations(textsToTranslate, targetLang);

    // Merge with cached results
    for (const [k, v] of translations) {
      textMap.set(k, v);
    }

    // Apply all translations to DOM
    elements.forEach((el) => {
      applyTranslationToElement(el, targetLang, textMap);
    });

    // Notify subscribers (Trans components) to re-render
    notifyLangChange(targetLang);
  } catch {
    // Translation failed — keep original texts
  }
}

function applyTranslationToElement(
  el: Element,
  lang: LanguageCode,
  textMap?: Map<string, string>
): void {
  let key = el.getAttribute('data-i18n');
  let originalText: string | null = null;

  if (key) {
    originalText = el.getAttribute('data-i18n-original') || key;
  } else {
    originalText = el.getAttribute('data-i18n-original');
    if (originalText) {
      key = originalText;
    }
  }

  if (!key || !originalText) return;

  const translated =
    textMap?.get(originalText) || getCachedTranslation(lang, originalText);

  if (translated !== null && translated !== undefined && translated !== originalText) {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      (el as HTMLInputElement).placeholder = translated;
    } else {
      // Only set textContent if it differs from what React would render
      // (for elements managed by Trans component, React handles it)
      if (el.getAttribute('data-trans-managed') !== 'true') {
        // Safety: skip elements that have child elements — setting textContent
        // would destroy React-managed children (e.g. MarqueeHeading, icons, etc.)
        if (el.childElementCount === 0) {
          el.textContent = translated;
        }
      }
    }
  }
}

function restoreOriginalTexts() {
  if (typeof document === 'undefined') return;
  const elements = document.querySelectorAll('[data-i18n], [data-i18n-original]');
  elements.forEach((el) => {
    let originalText: string | null = null;
    const key = el.getAttribute('data-i18n');

    if (key) {
      originalText = el.getAttribute('data-i18n-original') || key;
    } else {
      originalText = el.getAttribute('data-i18n-original');
    }

    if (originalText) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        (el as HTMLInputElement).placeholder = originalText;
      } else {
        if (el.getAttribute('data-trans-managed') !== 'true') {
          if (el.childElementCount === 0) {
            el.textContent = originalText;
          }
        }
      }
    }
  });
}

/**
 * Initiate translation for the current page. Collects ALL texts from both
 * [data-i18n] and [data-i18n-html] elements, fetches translations for the
 * combined set in a SINGLE batched API call, then applies them to the DOM.
 * Used by TranslationRunner on route changes and after dynamic content loads.
 */
  const pageTranslationInFlight = new Map<LanguageCode, Promise<void>>();
  // Keep the source text for DOM text nodes so route/content re-renders never
  // attempt to translate an already translated value.
  const htmlNodeOriginals = new WeakMap<Text, string>();

  /**
 * Translate the current DOM once per language at a time. Language changes can
 * be observed by both I18nProvider and TranslationRunner; sharing this promise
 * prevents those independent observers from issuing duplicate API requests.
 */
export function initiatePageTranslation(targetLang: LanguageCode): Promise<void> {
  const existing = pageTranslationInFlight.get(targetLang);
  if (existing) return existing;

  const request = initiatePageTranslationInternal(targetLang).finally(() => {
    if (pageTranslationInFlight.get(targetLang) === request) {
      pageTranslationInFlight.delete(targetLang);
    }
  });
  pageTranslationInFlight.set(targetLang, request);
  return request;
}

async function initiatePageTranslationInternal(
  targetLang: LanguageCode
): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  applyDirAttribute(targetLang);

  if (targetLang === 'en') {
    restoreOriginalTexts();
    notifyLangChange(targetLang);
    return;
  }

  try {
    // === Phase 1: Collect ALL untranslated texts from the entire page ===
    // This combines both [data-i18n]-managed elements AND [data-i18n-html]
    // rich-text containers into a single list so they are all translated
    // together in one batched API call.

    const i18nElements = document.querySelectorAll('[data-i18n], [data-i18n-original]');
    const htmlElements = document.querySelectorAll('[data-i18n-html]');

    const textsToTranslate: string[] = [];
    const seenTexts = new Set<string>();

    // Helper to add a text if not cached and not yet collected
    function addIfUncached(text: string): boolean {
      if (!text || !text.trim()) return false;
      if (seenTexts.has(text)) return false;
      if (getCachedTranslation(targetLang, text)) return false;
      seenTexts.add(text);
      textsToTranslate.push(text);
      return true;
    }

    // Collect texts from [data-i18n] elements
    i18nElements.forEach((el) => {
      let key = el.getAttribute('data-i18n');
      let originalText: string | null = null;

      if (key) {
        originalText = el.getAttribute('data-i18n-original') || key;
      } else {
        originalText = el.getAttribute('data-i18n-original');
        if (originalText) {
          key = originalText;
        }
      }

      if (key && originalText) {
        addIfUncached(originalText);
      }
    });

    // Collect texts from [data-i18n-html] elements
    // We need to track the text nodes and their trimmed text so we can
    // apply translations after the batch fetch completes.
    const htmlTextNodes: Array<{
      node: Text;
      original: string;
      trimmed: string;
    }> = [];

    for (const el of Array.from(htmlElements)) {
      const container = el as HTMLElement;
      const html = container.innerHTML;
      if (!html) continue;

      const treeWalker = document.createTreeWalker(container, 0x40, null);
      let textNode: Node | null;
      while ((textNode = treeWalker.nextNode())) {
        const text = textNode as Text;
        const currentText = text.data || '';
        const original = htmlNodeOriginals.get(text) ?? currentText;
        const trimmed = original.trim();
        if (trimmed.length > 0) {
          htmlNodeOriginals.set(text, original);
          htmlTextNodes.push({ node: text, original, trimmed });
          addIfUncached(trimmed);
        }
      }
    }

    // === Phase 2: Single batched fetch for ALL texts ===
    if (textsToTranslate.length > 0) {
      if (isDev) {
        console.log(`[translate] initiatePageTranslation(${targetLang}): batching ${textsToTranslate.length} texts from ${i18nElements.length} i18n + ${htmlElements.length} html elements`);
      }
      await fetchTranslations(textsToTranslate, targetLang);
    } else if (isDev) {
      console.log(`[translate] initiatePageTranslation(${targetLang}): all texts already cached`);
    }

    // === Phase 3: Apply translations to [data-i18n] DOM elements ===
    i18nElements.forEach((el) => {
      applyTranslationToElement(el, targetLang);
    });

    // === Phase 4: Apply translations to [data-i18n-html] text nodes ===
    // Only mutate DOM for containers React does NOT own
    for (const { node, original, trimmed } of htmlTextNodes) {
      const translated = getCachedTranslation(targetLang, trimmed);
      if (translated && translated !== trimmed) {
        node.data = original.replace(trimmed, translated);
      }
    }

    // Notify subscribers (Trans components, useTranslatedStrings hooks) to re-render
    notifyLangChange(targetLang);
  } catch {
    // Translation failed — keep original texts
  }
}

export function applyDirAttribute(lang: LanguageCode) {
  if (typeof document === 'undefined') return;
  document.documentElement.dir = isRtlLanguage(lang) ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
}

/**
 * Check if an element or any of its ancestors has data-trans-managed="true".
 * Elements with this attribute are handled by React-based translation
 * (useTranslatedHtml, useTranslatedRicosContent) and should be skipped
 * by DOM-based translateHtmlContent to prevent double-translation.
 */
function hasReactManagedAncestor(el: Element): boolean {
  let current: Element | null = el
  while (current) {
    if (current.getAttribute('data-trans-managed') === 'true') return true
    current = current.parentElement
  }
  return false
}

/**
 * Translate text content inside HTML elements marked with data-i18n-html.
 * Extracts text from text nodes, translates them, and replaces with translated text
 * while preserving the HTML structure (tags, attributes, etc.).
 *
 * SKIPPED for elements whose ancestor has data-trans-managed="true" — those are
 * handled by React-based translation (useTranslatedHtml / useTranslatedRicosContent)
 * and double-translating them would corrupt already-translated content.
 *
 * Optimized: collects ALL text nodes across ALL HTML containers first, then
 * makes a SINGLE batched fetchTranslations call for the combined unique set,
 * instead of fetching one element's texts at a time sequentially.
 */
export async function translateHtmlContent(
  targetLang: LanguageCode
): Promise<void> {
  if (typeof document === 'undefined') return;
  if (targetLang === 'en') return;

  const htmlElements = document.querySelectorAll('[data-i18n-html]');
  if (htmlElements.length === 0) return;

  // === Phase 1: Collect ALL text nodes across ALL HTML containers ===
  interface CollectedTextNode {
    container: HTMLElement;
    node: Text;
    original: string;
    trimmed: string;
    isReactManaged: boolean;
  }

  const collectedNodes: CollectedTextNode[] = [];
  const textsToTranslate: string[] = [];
  const seenTexts = new Set<string>();

  for (const el of Array.from(htmlElements)) {
    const container = el as HTMLElement;
    const isReactManaged = hasReactManagedAncestor(container);

    const html = container.innerHTML;
    if (!html) continue;

    const treeWalker = document.createTreeWalker(
      container,
      0x40, // NodeFilter.SHOW_TEXT
      null
    );
    let textNode: Node | null;
    while ((textNode = treeWalker.nextNode())) {
        const text = textNode as Text;
        const currentText = text.data || '';
        const original = htmlNodeOriginals.get(text) ?? currentText;
        const trimmed = original.trim();
        if (trimmed.length > 0) {
          htmlNodeOriginals.set(text, original);
          collectedNodes.push({
            container,
            node: text,
            original,
            trimmed,
            isReactManaged,
          });

        // Collect unique uncached texts for batch translation
        if (!seenTexts.has(trimmed) && !getCachedTranslation(targetLang, trimmed)) {
          seenTexts.add(trimmed);
          textsToTranslate.push(trimmed);
        }
      }
    }
  }

  // === Phase 2: Single batched fetch for all collected texts ===
  if (textsToTranslate.length > 0) {
    await fetchTranslations(textsToTranslate, targetLang);
  }

  // === Phase 3: Apply translations to text nodes (skip React-managed) ===
  for (const { node, original, trimmed, isReactManaged } of collectedNodes) {
    if (isReactManaged) continue; // React handles these via useTranslatedHtml*

    const translated = getCachedTranslation(targetLang, trimmed);
    if (translated && translated !== trimmed) {
      node.data = original.replace(trimmed, translated);
    }
  }
}
