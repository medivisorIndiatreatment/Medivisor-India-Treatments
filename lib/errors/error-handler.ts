/**
 * Centralized error handling and user-friendly message mapping
 * Replaces scattered error handling across 29+ API routes and components
 */

export type ErrorCategory =
  | 'network'
  | 'validation'
  | 'notfound'
  | 'unauthorized'
  | 'forbidden'
  | 'server'
  | 'timeout'
  | 'unknown'

export interface AppError {
  category: ErrorCategory
  message: string
  userMessage: string
  statusCode?: number
  details?: any
}

const errorMessages: Record<ErrorCategory, string> = {
  network: 'Unable to connect. Please check your internet connection.',
  validation: 'Please check your input and try again.',
  notfound: 'The requested item was not found.',
  unauthorized: 'You need to log in to access this.',
  forbidden: 'You do not have permission to access this.',
  server: 'Something went wrong. Our team has been notified.',
  timeout: 'Request took too long. Please try again.',
  unknown: 'An unexpected error occurred. Please try again.',
}

/**
 * Categorize and map errors to user-friendly messages
 */
export function handleError(error: unknown): AppError {
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return {
        category: 'network',
        message: error.message,
        userMessage: errorMessages.network,
        statusCode: 0,
      }
    }

    // Timeout errors
    if (error.message.includes('timeout') || error.name === 'AbortError') {
      return {
        category: 'timeout',
        message: error.message,
        userMessage: errorMessages.timeout,
        statusCode: 408,
      }
    }

    // Validation errors
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return {
        category: 'validation',
        message: error.message,
        userMessage: errorMessages.validation,
        statusCode: 400,
      }
    }

    return {
      category: 'unknown',
      message: error.message,
      userMessage: errorMessages.unknown,
    }
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as any
    const status = err.status || err.statusCode

    // HTTP error status codes
    if (status === 404) {
      return {
        category: 'notfound',
        message: err.message || 'Not found',
        userMessage: errorMessages.notfound,
        statusCode: 404,
      }
    }

    if (status === 401) {
      return {
        category: 'unauthorized',
        message: err.message || 'Unauthorized',
        userMessage: errorMessages.unauthorized,
        statusCode: 401,
      }
    }

    if (status === 403) {
      return {
        category: 'forbidden',
        message: err.message || 'Forbidden',
        userMessage: errorMessages.forbidden,
        statusCode: 403,
      }
    }

    if (status >= 500) {
      return {
        category: 'server',
        message: err.message || 'Server error',
        userMessage: errorMessages.server,
        statusCode: status,
      }
    }

    if (status >= 400) {
      return {
        category: 'validation',
        message: err.message || 'Bad request',
        userMessage: errorMessages.validation,
        statusCode: status,
      }
    }

    if (err.message) {
      return {
        category: 'unknown',
        message: err.message,
        userMessage: errorMessages.unknown,
        details: err,
      }
    }
  }

  return {
    category: 'unknown',
    message: String(error),
    userMessage: errorMessages.unknown,
  }
}

/**
 * Log error with context for analytics/debugging
 */
export function logError(
  error: AppError,
  context?: {
    component?: string
    action?: string
    userId?: string
    metadata?: any
  }
) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    category: error.category,
    message: error.message,
    statusCode: error.statusCode,
    context,
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[AppError]', errorLog)
  }

  // TODO: Send to error tracking service (Sentry, etc.)
  // sendToErrorTracking(errorLog)
}

/**
 * Retry helper with exponential backoff
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number
    backoffMs?: number
    backoffMultiplier?: number
    shouldRetry?: (error: Error) => boolean
  }
): Promise<T> {
  const {
    maxRetries = 3,
    backoffMs = 1000,
    backoffMultiplier = 2,
    shouldRetry = () => true,
  } = options || {}

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < maxRetries && shouldRetry(lastError)) {
        const delay = backoffMs * Math.pow(backoffMultiplier, attempt)
        await new Promise((resolve) => setTimeout(resolve, delay))
      } else {
        break
      }
    }
  }

  throw lastError
}

/**
 * Transform error for API response
 */
export function apiErrorResponse(error: unknown) {
  const appError = handleError(error)
  logError(appError)

  return {
    ok: false,
    error: appError.userMessage,
    code: appError.category,
    statusCode: appError.statusCode || 500,
  }
}
