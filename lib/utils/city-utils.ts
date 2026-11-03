// lib/utils/city-utils.ts
// City utility functions for handling Delhi NCR and city formatting

// Delhi NCR cities that should be grouped together
// These are the core NCR cities that will show as individual options
// while also being filterable by the "Delhi NCR" group option
export const DELHI_NCR_CITIES = new Set([
  'delhi', 'new delhi', 'gurgaon', 'gurugram', 'gurgaan', 'noida', 'greater noida',
  'faridabad', 'ghaziabad', 'meerut', 'panipat', 'rohtak', 'bulandshahr', 'hapur',
  'sahibabad', 'vasundhara', 'indirapuram', 'raj nagar', 'dc',
  'sonipat', 'kharkhoda', 'bahadurgarh', 'jhajjar', 'rewari', 'palwal', 'nuh', 'karnal', 'sampla', 'kundli',
  'modinagar', 'muradnagar', 'shahpur', 'pilot'
])

// Core NCR cities for displaying as individual options (subset of DELHI_NCR_CITIES)
export const CORE_NCR_CITIES = new Set([
  'delhi', 'new delhi', 'gurgaon', 'gurugram', 'noida', 'greater noida',
  'faridabad', 'ghaziabad', 'meerut', 'panipat', 'rohtak'
])

// Display names for NCR cities - maps lowercase key to proper display name
export const NCR_CITY_DISPLAY_NAMES: Record<string, string> = {
  'delhi': 'Delhi',
  'new delhi': 'New Delhi',
  'gurgaon': 'Gurgaon',
  'gurugram': 'Gurugram',
  'gurgaan': 'Gurgaon',
  'noida': 'Noida',
  'greater noida': 'Greater Noida',
  'faridabad': 'Faridabad',
  'ghaziabad': 'Ghaziabad',
  'meerut': 'Meerut',
  'panipat': 'Panipat',
  'rohtak': 'Rohtak',
  'bulandshahr': 'Bulandshahr',
  'hapur': 'Hapur',
  'sahibabad': 'Sahibabad',
  'vasundhara': 'Vasundhara',
  'indirapuram': 'Indirapuram',
  'raj nagar': 'Raj Nagar',
  'dc': 'Delhi',
  'delhi ncr': 'Delhi NCR',
}

/**
 * Get the display name for a city (proper capitalization)
 * For NCR cities, returns the proper display name
 * For other cities, returns the original name with first letter capitalized
 */
export function getCityDisplayName(cityName: string): string {
  if (!cityName) return ''
  const normalized = cityName.toLowerCase().trim()
  
  // Check if it's an NCR city with a display name
  if (NCR_CITY_DISPLAY_NAMES[normalized]) {
    return NCR_CITY_DISPLAY_NAMES[normalized]
  }
  
  // For non-NCR cities, capitalize first letter
  return cityName.charAt(0).toUpperCase() + cityName.slice(1).toLowerCase()
}

/**
 * Check if a city is part of Delhi NCR region
 */
export function isDelhiNCR(cityName: string): boolean {
  if (!cityName) return false
  const normalized = cityName.toLowerCase().trim()
  return normalized === 'delhi ncr' || normalized === 'delhi-ncr' || DELHI_NCR_CITIES.has(normalized)
}

/**
 * Check if a city is one of the core NCR cities (for displaying as individual options)
 * Core NCR cities are the main cities that make up Delhi NCR region
 */
export function isCoreNCRCity(cityName: string): boolean {
  if (!cityName) return false
  const normalized = cityName.toLowerCase().trim()
  return CORE_NCR_CITIES.has(normalized)
}

/**
 * Map a city to "Delhi NCR" group name - only used for grouping/filtering
 * For display purposes, use getCityDisplayName instead
 */
export function mapToDelhiNCR(cityName: string): string {
  if (!cityName) return cityName
  if (isDelhiNCR(cityName)) {
    return 'Delhi NCR'
  }
  return cityName
}

/**
 * Get display location string — returns "Delhi NCR" for NCR cities, city name otherwise
 */
export function getDisplayLocation(city: string | null | undefined): string {
  if (!city) return '';
  const normalizedCity = city.toLowerCase().trim();
  if (DELHI_NCR_CITIES.has(normalizedCity)) {
    return 'Delhi NCR';
  }
  return city;
}

/**
 * Check if a city filter query is for Delhi NCR
 */
export function getCityNameWithNCR(city: any): string {
  if (!city) return ''
  const cityName = city.cityName || city.name || ''
  return getCityDisplayName(cityName)
}

/**
 * Format city with state - shows "City, Delhi NCR" or "City, State"
 */
export function formatCityWithState(cityName: string, state: string): string {
  if (!cityName) return cityName
  const displayName = getCityDisplayName(cityName)
  if (isDelhiNCR(cityName)) {
    return `${displayName}, Delhi NCR`
  }
  if (state) {
    return `${displayName}, ${state}`
  }
  return displayName
}

/**
 * Check if a city filter query is for Delhi NCR
 */
export function isDelhiNCRFilter(cityQuery: string): boolean {
  if (!cityQuery) return false
  const normalized = cityQuery.toLowerCase().trim()
  return normalized === 'delhi ncr' || normalized === 'delhi-ncr' || normalized === 'ncr'
}

/**
 * Get normalized city name from city object (handles various formats)
 */
export function getNormalizedCityName(city: any): string {
  if (!city) return ''
  const cityName = city.cityName || city.name || ''
  return cityName.toLowerCase().trim()
}
