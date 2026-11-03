/**
 * Query builders to optimize API requests and prevent N+1 queries
 * Pre-define which related data to fetch with each query
 */

export interface QueryOptions {
  includeRelations?: string[]
  fields?: string[]
  filters?: Record<string, any>
  sort?: { field: string; order: 'asc' | 'desc' }[]
  pagination?: { page: number; pageSize: number }
}

/**
 * Build optimized query for doctors with all related data
 */
export function buildDoctorQuery(options: QueryOptions = {}) {
  return {
    includeRelations: [
      'specializations',
      'hospitals',
      'branches',
      'qualifications',
      ...(options.includeRelations || []),
    ],
    fields: [
      'id',
      'name',
      'specializations',
      'qualification',
      'experience',
      'hospitals',
      'branches',
      'cities',
      'image',
      'popular',
      'slug',
      ...(options.fields || []),
    ],
    filters: options.filters,
    sort: options.sort || [{ field: 'name', order: 'asc' }],
    pagination: options.pagination || { page: 0, pageSize: 20 },
  }
}

/**
 * Build optimized query for departments with all related data
 */
export function buildDepartmentQuery(options: QueryOptions = {}) {
  return {
    includeRelations: [
      'subDepartments',
      'specialists',
      'treatments',
      'branches',
      ...(options.includeRelations || []),
    ],
    fields: [
      'id',
      'name',
      'subDepartments',
      'specialists',
      'treatments',
      'branches',
      'description',
      'image',
      'slug',
      ...(options.fields || []),
    ],
    filters: options.filters,
    sort: options.sort || [{ field: 'name', order: 'asc' }],
    pagination: options.pagination || { page: 0, pageSize: 20 },
  }
}

/**
 * Build optimized query for branches with all related data
 */
export function buildBranchQuery(options: QueryOptions = {}) {
  return {
    includeRelations: [
      'hospital',
      'doctors',
      'departments',
      'treatments',
      'cities',
      ...(options.includeRelations || []),
    ],
    fields: [
      'id',
      'name',
      'hospital',
      'doctors',
      'departments',
      'treatments',
      'address',
      'cities',
      'image',
      'beds',
      'slug',
      ...(options.fields || []),
    ],
    filters: options.filters,
    sort: options.sort || [{ field: 'name', order: 'asc' }],
    pagination: options.pagination || { page: 0, pageSize: 20 },
  }
}

/**
 * Build optimized query for treatments with related data
 */
export function buildTreatmentQuery(options: QueryOptions = {}) {
  return {
    includeRelations: [
      'departments',
      'branches',
      'doctors',
      ...(options.includeRelations || []),
    ],
    fields: [
      'id',
      'name',
      'description',
      'departments',
      'branches',
      'doctors',
      'cost',
      'duration',
      'image',
      'popular',
      'slug',
      ...(options.fields || []),
    ],
    filters: options.filters,
    sort: options.sort || [{ field: 'name', order: 'asc' }],
    pagination: options.pagination || { page: 0, pageSize: 20 },
  }
}

/**
 * Convert query object to URL parameters
 */
export function queryToParams(query: ReturnType<typeof buildDoctorQuery>): URLSearchParams {
  const params = new URLSearchParams()

  if (query.includeRelations?.length) {
    params.append('include', query.includeRelations.join(','))
  }

  if (query.fields?.length) {
    params.append('fields', query.fields.join(','))
  }

  if (query.filters) {
    Object.entries(query.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(`filter[${key}]`, String(value))
      }
    })
  }

  if (query.sort?.length) {
    const sortStr = query.sort
      .map((s) => `${s.order === 'desc' ? '-' : ''}${s.field}`)
      .join(',')
    params.append('sort', sortStr)
  }

  if (query.pagination) {
    params.append('page', String(query.pagination.page))
    params.append('pageSize', String(query.pagination.pageSize))
  }

  return params
}

/**
 * Build URL with query parameters
 */
export function buildQueryUrl(
  baseUrl: string,
  query: ReturnType<typeof buildDoctorQuery>
): string {
  const params = queryToParams(query)
  return `${baseUrl}?${params.toString()}`
}

export default {
  buildDoctorQuery,
  buildDepartmentQuery,
  buildBranchQuery,
  buildTreatmentQuery,
  queryToParams,
  buildQueryUrl,
}
