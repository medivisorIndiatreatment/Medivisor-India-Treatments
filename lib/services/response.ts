import { NextResponse } from 'next/server'

/**
 * Standard API response format for consistency and error handling
 */
export interface ApiResponse<T = any> {
  ok: boolean
  data?: T
  error?: string
  status?: number
}

/**
 * Create a success response
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json({ ok: true, data }, { status })
}

/**
 * Create an error response
 */
export function errorResponse(
  error: string | Error,
  status: number = 400,
  details?: any
): NextResponse {
  const message = error instanceof Error ? error.message : error

  console.error(`[API Error ${status}] ${message}`, details)

  return NextResponse.json(
    {
      ok: false,
      error: message,
      ...(process.env.NODE_ENV === 'development' && details && { details }),
    },
    { status }
  )
}

/**
 * Handle async API route with error boundary
 */
export async function handleApiRoute<T>(
  handler: () => Promise<T>,
  options: {
    successStatus?: number
    errorStatus?: number
  } = {}
): Promise<NextResponse> {
  try {
    const data = await handler()
    return successResponse(data, options.successStatus || 200)
  } catch (error) {
    const status = options.errorStatus || 500
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred'

    return errorResponse(message, status)
  }
}

/**
 * Validate required request body fields
 */
export function validateRequired(
  body: any,
  fields: string[]
): { ok: true } | { ok: false; error: NextResponse } {
  const missing = fields.filter((field) => !body?.[field])

  if (missing.length > 0) {
    return {
      ok: false,
      error: errorResponse(
        `Missing required fields: ${missing.join(', ')}`,
        400
      ),
    }
  }

  return { ok: true }
}

/**
 * Extract and validate JSON body
 */
export async function parseJsonBody(
  request: Request
): Promise<{ ok: true; body: any } | { ok: false; error: NextResponse }> {
  try {
    const body = await request.json()
    return { ok: true, body }
  } catch (error) {
    return {
      ok: false,
      error: errorResponse('Invalid JSON in request body', 400),
    }
  }
}

/**
 * Create pagination metadata for responses
 */
export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export function createPaginationMeta(
  page: number,
  pageSize: number,
  total: number
): PaginationMeta {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  }
}
