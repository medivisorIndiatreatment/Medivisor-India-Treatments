/**
 * Standardized API route handler factory
 * Replaces 29 duplicate API routes with consistent patterns
 *
 * Usage:
 * export const GET = createApiRoute({
 *   queryFn: () => getDepartmentsData(),
 *   schema: departmentFilterSchema,
 * })
 */

import { NextRequest, NextResponse } from 'next/server'
import { handleError, apiErrorResponse } from '@/lib/errors/error-handler'

export interface ApiRouteConfig<T = any> {
  // Function to handle the main logic
  queryFn: (req: NextRequest, params: Record<string, any>) => Promise<T>

  // Zod schema for request validation (optional)
  schema?: any

  // Custom error handler (optional)
  onError?: (error: unknown) => any

  // Cache headers to set on response (optional)
  cacheControl?: string

  // Enable CORS (optional)
  cors?: boolean

  // Additional response headers (optional)
  headers?: Record<string, string>
}

export interface ApiRouteOptions {
  methods?: ('GET' | 'POST' | 'PUT' | 'DELETE')[]
}

/**
 * Create a standardized API route handler
 * Handles error catching, response formatting, caching headers
 */
export function createApiRoute<T>({
  queryFn,
  schema,
  onError,
  cacheControl = 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
  cors = false,
  headers = {},
}: ApiRouteConfig<T>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Parse query parameters
      const params: Record<string, any> = {}
      req.nextUrl.searchParams.forEach((value, key) => {
        params[key] = isNaN(Number(value)) ? value : Number(value)
      })

      // Validate against schema if provided
      if (schema) {
        try {
          schema.parse(params)
        } catch (err: any) {
          return NextResponse.json(
            apiErrorResponse(new Error(`Validation error: ${err.message}`)),
            { status: 400 }
          )
        }
      }

      // Execute query function
      const data = await queryFn(req, params)

      // Build response headers
      const responseHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'Cache-Control': cacheControl,
        ...headers,
      }

      if (cors) {
        responseHeaders['Access-Control-Allow-Origin'] = '*'
      }

      return NextResponse.json(data, {
        headers: responseHeaders,
      })
    } catch (error) {
      const appError = onError
        ? onError(error)
        : apiErrorResponse(error)

      return NextResponse.json(appError, {
        status: appError.statusCode || 500,
      })
    }
  }
}

/**
 * Create handlers for multiple HTTP methods
 */
export function createApiHandlers<T = any>(
  config: Record<string, ApiRouteConfig<T>>
) {
  return Object.entries(config).reduce(
    (acc, [method, cfg]) => {
      acc[method as 'GET' | 'POST' | 'PUT' | 'DELETE'] = createApiRoute(cfg)
      return acc
    },
    {} as Record<'GET' | 'POST' | 'PUT' | 'DELETE', (req: NextRequest) => Promise<NextResponse>>
  )
}

/**
 * Create standardized paginated response
 */
export function paginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
) {
  return {
    items,
    total,
    page,
    pageSize,
    hasMore: (page + 1) * pageSize < total,
    totalPages: Math.ceil(total / pageSize),
  }
}

/**
 * Parse pagination params from request
 */
export function parsePaginationParams(
  params: Record<string, any>,
  defaults = { page: 0, pageSize: 20 }
) {
  const page = Math.max(0, parseInt(String(params.page || defaults.page), 10))
  const pageSize = Math.min(
    200, // Max page size
    Math.max(1, parseInt(String(params.pageSize || defaults.pageSize), 10))
  )

  return { page, pageSize }
}

/**
 * Parse filter params (for search/filtering)
 */
export function parseFilterParams(
  params: Record<string, any>,
  allowedFields: string[]
) {
  const filters: Record<string, any> = {}

  allowedFields.forEach((field) => {
    if (params[field] !== undefined) {
      filters[field] = params[field]
    }
  })

  return filters
}

export default {
  createApiRoute,
  createApiHandlers,
  paginatedResponse,
  parsePaginationParams,
  parseFilterParams,
}
