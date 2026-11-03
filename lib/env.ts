// lib/env.ts
// Environment variable validation and guards

export function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export function getOptionalEnv(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue
}

export function getBooleanEnv(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key]
  if (!value) return defaultValue
  return value.toLowerCase() === 'true' || value === '1'
}

export function getNumberEnv(key: string, defaultValue: number = 0): number {
  const value = process.env[key]
  if (!value) return defaultValue
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

// Server-side only check
export function isServerSide(): boolean {
  return typeof window === 'undefined'
}

// Client-side only check
export function isClientSide(): boolean {
  return typeof window !== 'undefined'
}

// Check if running in production
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

// Check if running in development
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

// Vercel-specific checks
export function isVercel(): boolean {
  return !!process.env.VERCEL
}

export function getDeploymentUrl(): string | undefined {
  return process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL
}

// AWS-specific checks
export function isAWS(): boolean {
  return !!process.env.AWS_LAMBDA_FUNCTION_NAME
}