// lib/utils/index.ts
// Centralized export for all utility functions

export * from '../utils'
export * from './performance'

// Re-export commonly used utilities for convenience
export {
  debounce,
  throttle,
  isBrowser,
  isMobile,
  isTablet,
  isDesktop,
  preloadImage,
  createLazyImageLoader,
  createLazyLoader,
  measureWebVitals,
  measurePerformance,
  formatCompactNumber,
  getTimeSince,
  memoizeWithTTL,
  createMemoizedSelector,
  clearAllCaches,
} from './performance'
