/**
 * Performance utilities for optimized rendering and data fetching
 */

// Cache for memoized values
const memoCache = new Map<string, { value: unknown; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Debounce function to limit the rate of function calls
 * Useful for search inputs and filter updates
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function (...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * Throttle function to limit function calls to once per interval
 * Useful for scroll events and window resize handlers
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Memoize a function with TTL (time-to-live) cache
 */
export function memoizeWithTTL<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ttl: number = CACHE_TTL
): T {
  return ((...args: unknown[]) => {
    const key = JSON.stringify(args)
    const cached = memoCache.get(key)
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.value
    }
    
    const result = fn(...args)
    memoCache.set(key, { value: result, timestamp: Date.now() })
    
    // Limit cache size
    if (memoCache.size > 100) {
      const firstKey = memoCache.keys().next().value
      if (firstKey) memoCache.delete(firstKey)
    }
    
    return result
  }) as T
}

/**
 * Create a memoized selector for expensive computations
 */
export function createMemoizedSelector<T, R>(
  selector: (state: T) => R
): (state: T) => R {
  let cachedResult: R | null = null
  let cachedInput: T | null = null

  return (state: T): R => {
    if (cachedInput && cachedInput === state) {
      return cachedResult!
    }

    const result = selector(state)
    cachedResult = result
    cachedInput = state

    return result
  }
}

/**
 * Calculate the time since a given timestamp
 */
export function getTimeSince(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)

  if (seconds < 60) {
    return 'just now'
  }

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes}m ago`
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours}h ago`
  }

  const days = Math.floor(hours / 24)
  if (days < 30) {
    return `${days}d ago`
  }

  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

/**
 * Format number with K/M suffix for large numbers
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

/**
 * Check if we're in a browser environment
 */
export const isBrowser = typeof window !== 'undefined'

/**
 * Check if device is mobile
 */
export function isMobile(): boolean {
  if (!isBrowser) return false
  return window.innerWidth < 768
}

/**
 * Check if device is tablet
 */
export function isTablet(): boolean {
  if (!isBrowser) return false
  return window.innerWidth >= 768 && window.innerWidth < 1024
}

/**
 * Check if device is desktop
 */
export function isDesktop(): boolean {
  if (!isBrowser) return false
  return window.innerWidth >= 1024
}

/**
 * Preload critical images
 */
export function preloadImage(src: string): void {
  if (!isBrowser) return
  
  const img = new window.Image()
  img.src = src
}

/**
 * Lazy load images with Intersection Observer
 */
export function createLazyImageLoader(
  rootMargin: string = '50px'
): (element: HTMLImageElement) => () => void {
  if (!isBrowser) {
    return () => () => {}
  }

  return (img: HTMLImageElement) => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const src = img.dataset.src
            if (src) {
              img.src = src
              img.removeAttribute('data-src')
              observer.unobserve(img)
            }
          }
        })
      },
      { rootMargin }
    )

    observer.observe(img)

    return () => observer.disconnect()
  }
}

/**
 * Lazy load elements with Intersection Observer (callback version)
 */
export function createLazyLoader(
  callback: () => void,
  options: IntersectionObserverInit = { rootMargin: '50px' }
): (element: Element) => () => void {
  if (!isBrowser) {
    return () => () => {}
  }

  return (element: Element) => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback()
            observer.unobserve(element)
          }
        })
      },
      options
    )

    observer.observe(element)

    return () => observer.disconnect()
  }
}

/**
 * Measure Core Web Vitals (silent measurement for analytics)
 */
export function measureWebVitals(): void {
  if (!isBrowser || !('PerformanceObserver' in window)) return

  // Largest Contentful Paint (LCP)
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number }
      // LCP measured silently for potential analytics
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
  } catch {
    // LCP not supported
  }

  // First Input Delay (FID) / Interaction to Next Paint (INP)
  try {
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const firstEntry = entries[0] as PerformanceEntry & { processingStart?: number }
      // FID/INP measured silently for potential analytics
    })
    fidObserver.observe({ entryTypes: ['first-input', 'event'] })
  } catch {
    // FID not supported
  }

  // Cumulative Layout Shift (CLS)
  try {
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries() as (PerformanceEntry & { value?: number; hadRecentInput?: boolean })[]
      entries.forEach((entry) => {
        if (!entry.hadRecentInput && entry.value) {
          clsValue += entry.value
        }
      })
      // CLS measured silently for potential analytics
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })
  } catch {
    // CLS not supported
  }
}

/**
 * Measure execution time of a function
 */
export function measurePerformance<T extends () => unknown>(
  fn: T,
  label: string = 'Function'
): () => unknown {
  return () => {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    return result
  }
}

/**
 * Clear all memoization caches
 */
export function clearAllCaches(): void {
  memoCache.clear()
}
