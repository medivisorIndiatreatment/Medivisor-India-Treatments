/**
 * Performance monitoring and metrics collection
 * Track key metrics to identify bottlenecks
 */

export interface PerformanceMetric {
  name: string
  duration: number
  timestamp: number
  tags?: Record<string, string>
}

const metrics: PerformanceMetric[] = []

/**
 * Record a performance metric
 */
export function recordMetric(name: string, duration: number, tags?: Record<string, string>) {
  metrics.push({
    name,
    duration,
    timestamp: Date.now(),
    tags,
  })

  // Keep only last 1000 metrics in memory
  if (metrics.length > 1000) {
    metrics.shift()
  }

  // Log slow operations
  if (duration > 1000) {
    console.warn(`Slow operation detected: ${name} took ${duration}ms`, tags)
  }
}

/**
 * Measure async function execution time
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  tags?: Record<string, string>
): Promise<T> {
  const start = performance.now()
  try {
    const result = await fn()
    const duration = performance.now() - start
    recordMetric(name, duration, tags)
    return result
  } catch (error) {
    const duration = performance.now() - start
    recordMetric(`${name} (error)`, duration, tags)
    throw error
  }
}

/**
 * Measure sync function execution time
 */
export function measureSync<T>(
  name: string,
  fn: () => T,
  tags?: Record<string, string>
): T {
  const start = performance.now()
  try {
    const result = fn()
    const duration = performance.now() - start
    recordMetric(name, duration, tags)
    return result
  } catch (error) {
    const duration = performance.now() - start
    recordMetric(`${name} (error)`, duration, tags)
    throw error
  }
}

/**
 * Get metrics summary
 */
export function getMetricsSummary(name?: string): {
  count: number
  average: number
  min: number
  max: number
  total: number
} {
  const filtered = name ? metrics.filter((m) => m.name === name) : metrics
  const durations = filtered.map((m) => m.duration)

  if (durations.length === 0) {
    return { count: 0, average: 0, min: 0, max: 0, total: 0 }
  }

  return {
    count: durations.length,
    average: durations.reduce((a, b) => a + b, 0) / durations.length,
    min: Math.min(...durations),
    max: Math.max(...durations),
    total: durations.reduce((a, b) => a + b, 0),
  }
}

/**
 * Get all recorded metrics
 */
export function getAllMetrics(): PerformanceMetric[] {
  return [...metrics]
}

/**
 * Clear metrics (for testing)
 */
export function clearMetrics() {
  metrics.length = 0
}

/**
 * Measure Core Web Vitals
 */
export interface WebVitals {
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  ttfb?: number // Time to First Byte
}

export const vitals: WebVitals = {}

/**
 * Record Core Web Vital
 */
export function recordWebVital(name: keyof WebVitals, value: number) {
  vitals[name] = value

  // Log concerning values
  const thresholds = {
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    ttfb: 600,
  }

  if (value > (thresholds[name] || 0)) {
    console.warn(`Web Vital ${name} is high: ${value}ms`)
  }
}

/**
 * Get Core Web Vitals
 */
export function getWebVitals(): WebVitals {
  return { ...vitals }
}

/**
 * Track data fetching metrics
 */
export interface DataFetchMetrics {
  url: string
  method: string
  status: number
  duration: number
  cacheHit: boolean
  timestamp: number
}

const fetchMetrics: DataFetchMetrics[] = []

export function recordFetchMetric(
  url: string,
  method: string,
  status: number,
  duration: number,
  cacheHit: boolean
) {
  fetchMetrics.push({
    url,
    method,
    status,
    duration,
    cacheHit,
    timestamp: Date.now(),
  })

  // Keep last 500 fetch metrics
  if (fetchMetrics.length > 500) {
    fetchMetrics.shift()
  }
}

/**
 * Get fetch metrics summary
 */
export function getFetchMetricsSummary(): {
  totalRequests: number
  cacheHitRate: number
  averageDuration: number
  errors: number
} {
  const total = fetchMetrics.length
  const cached = fetchMetrics.filter((m) => m.cacheHit).length
  const errors = fetchMetrics.filter((m) => m.status >= 400).length
  const durations = fetchMetrics.map((m) => m.duration)

  return {
    totalRequests: total,
    cacheHitRate: total > 0 ? (cached / total) * 100 : 0,
    averageDuration: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
    errors,
  }
}

/**
 * Export metrics for analysis
 */
export function exportMetrics() {
  return {
    operationMetrics: metrics,
    webVitals: vitals,
    fetchMetrics: fetchMetrics,
    summary: {
      operationsSummary: getMetricsSummary(),
      fetchSummary: getFetchMetricsSummary(),
    },
  }
}

export default {
  recordMetric,
  measureAsync,
  measureSync,
  getMetricsSummary,
  getAllMetrics,
  clearMetrics,
  recordWebVital,
  getWebVitals,
  recordFetchMetric,
  getFetchMetricsSummary,
  exportMetrics,
}
