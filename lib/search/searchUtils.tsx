"use client"

import type { DepartmentCardData, SearchOption } from "@/components/DepartmentServices"
import type { DoctorCardData } from "@/components/cards/types"
import type { NormalizedLocation } from "@/lib/services/homepage/transformers"

export interface UnifiedSearchOption {
  id: string
  name: string
  slug: string
  type: "department" | "treatment" | "doctor" | "hospital" | "technology"
  departmentId?: string
  departmentName?: string
  hospitalName?: string
  description?: string
  score?: number
}

export interface SearchMatch {
  term: string
  field: string
  matchType: "exact" | "startsWith" | "contains" | "wordMatch"
}

export interface SearchResult {
  options: UnifiedSearchOption[]
  suggestions: UnifiedSearchOption[]
  totalResults: number
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function computeScore(fullText: string, term: string, tokens: string[], bigrams: string[]): number {
  const lowered = fullText.toLowerCase()
  if (lowered === term) return 100
  if (lowered.startsWith(term)) return 80
  const words: string[] = lowered.match(/\b\w+\b/gi) || []
  if (tokens.length > 0 && tokens.every(token => words.includes(token))) return 60
  if (tokens.some(token => lowered.includes(token))) return 40
  if (bigrams.some(bigram => lowered.includes(bigram))) return 36
  return 0
}

/**
 * Unified search function that searches across all data sections
 */
export function unifiedSearch(
  query: string,
  departments: DepartmentCardData[],
  doctors: DoctorCardData[],
  hospitals: NormalizedLocation[],
  technologies: Array<{ _id: string; heading: string; slug: string; description?: string }>
): SearchResult {
  if (!query || !query.trim()) {
    return { options: [], suggestions: [], totalResults: 0 }
  }

  const searchTerm = query.toLowerCase().trim()
  const tokens = searchTerm.split(/\s+/).filter(Boolean)

  const allOptions: UnifiedSearchOption[] = []

  for (const dept of departments) {
    if (!dept.departmentName) continue
    const deptScore = computeScore(dept.departmentName, searchTerm, tokens, [dept.departmentName])
    if (deptScore > 0) {
      allOptions.push({
        id: `dept-${dept._id}`,
        name: dept.departmentName,
        slug: dept.departmentSlug,
        type: "department",
        score: deptScore,
      })
    }

    for (const treatment of dept.allTreatments || []) {
      if (!treatment.name) continue
      const treatScore = computeScore(treatment.name, searchTerm, tokens, [treatment.name])
      if (treatScore > 0) {
        allOptions.push({
          id: `treat-${treatment._id}`,
          name: treatment.name,
          slug: treatment.slug || treatment.name.toLowerCase().replace(/\s+/g, "-"),
          type: "treatment",
          departmentId: dept._id,
          departmentName: dept.departmentName,
          score: treatScore * 0.9,
        })
      }
    }
  }

  for (const doctor of doctors) {
    const doctorName = doctor.doctorName || doctor.name || ""
    if (!doctorName) continue
    const nameScore = computeScore(doctorName, searchTerm, tokens, [doctorName])
    const specializedText = (Array.isArray(doctor.specialization) ? doctor.specialization.join(' ') : '')
    const additionalScore = Math.max(
      computeScore(specializedText, searchTerm, tokens, []) * 30,
      (doctor.hospitalName || '').toLowerCase().includes(searchTerm) ? 25 : 0,
      (doctor.branchName || '').toLowerCase().includes(searchTerm) ? 20 : 0
    )

    if (nameScore > 0 || additionalScore > 0) {
      allOptions.push({
        id: `doc-${doctor._id}`,
        name: doctorName,
        slug: doctor.doctorSlug || doctor.slug || doctorName.toLowerCase().replace(/\s+/g, "-"),
        type: "doctor",
        hospitalName: doctor.hospitalName,
        description: doctor.branchName || doctor.location,
        score: nameScore + additionalScore,
      })
    }
  }

  for (const hospital of hospitals) {
    const hospitalName = hospital.hospitalName || hospital.name || ""
    const branchName = hospital.name?.trim() ? hospital.name : ""
    const location = hospital.location || ""

    const nameScore = computeScore(hospitalName, searchTerm, tokens, [hospitalName, ...(Array.isArray(hospital.specialty) ? hospital.specialty.map(s => typeof s === 'string' ? s : s?.name || '') : [])])
    const branchScore = computeScore(branchName, searchTerm, tokens, [branchName])
    const locationScore = computeScore(location, searchTerm, tokens, [location])
    const combinedScore = Math.max(nameScore, branchScore, locationScore)

    let specialtyScore = 0
    if (hospital.specialty && Array.isArray(hospital.specialty) && hospital.specialty.length > 0) {
      const specialtyText = typeof hospital.specialty[0] === 'string' ? hospital.specialty[0] : hospital.specialty[0]?.name || ''
      if (specialtyText.toLowerCase().includes(searchTerm)) {
        specialtyScore = 35
      }
    }

    if (combinedScore > 0 || specialtyScore > 0) {
      allOptions.push({
        id: `hosp-${hospital._id}`,
        name: hospitalName,
        slug: hospital.slug || hospitalName.toLowerCase().replace(/\s+/g, "-"),
        type: "hospital",
        description: branchName || location,
        score: combinedScore + specialtyScore,
      })
    }
  }

  for (const tech of technologies) {
    if (!tech.heading) continue
    const score = computeScore(tech.heading, searchTerm, tokens, [tech.heading, tech.description || ''].filter(Boolean))
    if (score > 0) {
      allOptions.push({
        id: `tech-${tech._id}`,
        name: tech.heading,
        slug: tech.slug,
        type: "technology",
        description: tech.description,
        score,
      })
    }
  }

  allOptions.sort((a, b) => {
    if (b.score !== a.score) return (b.score || 0) - (a.score || 0)
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  })

  const options = allOptions.slice(0, 15)
  const suggestions = allOptions.slice(15, 25)

  return {
    options,
    suggestions,
    totalResults: allOptions.length,
  }
}

/**
 * Generate search suggestions based on partial matches
 */
export function getSearchSuggestions(
  query: string,
  departments: DepartmentCardData[],
  doctors: DoctorCardData[],
  hospitals: NormalizedLocation[],
  technologies: Array<{ _id: string; heading: string; slug: string }>
): UnifiedSearchOption[] {
  const result = unifiedSearch(query, departments, doctors, hospitals, technologies)
  return result.suggestions.slice(0, 5)
}

/**
 * Find related items across sections for a given search term
 */
export function findRelatedAcrossSections(
  searchTerm: string,
  departments: DepartmentCardData[],
  doctors: DoctorCardData[],
  hospitals: NormalizedLocation[],
  technologies: Array<{ _id: string; heading: string; slug: string }>
): {
  departments: DepartmentCardData[]
  doctors: DoctorCardData[]
  hospitals: NormalizedLocation[]
  treatments: { _id: string; name: string; slug: string; departmentName: string }[]
} {
  const term = searchTerm.toLowerCase()

  const matchingDepts = departments.filter(dept =>
    dept.departmentName?.toLowerCase().includes(term) ||
    dept.allTreatments?.some(t => t.name?.toLowerCase().includes(term))
  )

  const matchingDocs = doctors.filter(doc => {
    const name = (doc.doctorName || doc.name || "").toLowerCase()
    const spec = Array.isArray(doc.specialization)
      ? doc.specialization.map((s: any) => typeof s === "string" ? s : s?.name || "").join(" ").toLowerCase()
      : ""
    return name.includes(term) || spec.includes(term) || (doc.hospitalName || "").toLowerCase().includes(term)
  })

  const matchingHospitals = hospitals.filter(hosp =>
    (hosp.hospitalName || "").toLowerCase().includes(term) ||
    (hosp.name || "").toLowerCase().includes(term) ||
    (hosp.location || "").toLowerCase().includes(term)
  )

  const treatments: { _id: string; name: string; slug: string; departmentName: string }[] = []
  for (const dept of matchingDepts) {
    for (const treat of dept.allTreatments || []) {
      if (treat.name?.toLowerCase().includes(term)) {
        treatments.push({
          _id: treat._id,
          name: treat.name,
          slug: treat.slug || treat.name.toLowerCase().replace(/\s+/g, "-"),
          departmentName: dept.departmentName,
        })
      }
    }
  }

  return {
    departments: matchingDepts,
    doctors: matchingDocs,
    hospitals: matchingHospitals,
    treatments,
  }
}

/**
 * Highlight matching text for display
 */
export function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text

  const searchWords = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
  if (searchWords.length === 0) return text

  const escapedWords = searchWords.map(w => escapeRegex(w))
  const regex = new RegExp(`(${escapedWords.join("|")})`, "gi")

  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  regex.lastIndex = 0

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    parts.push(
      <mark key={match.index} className="bg-gray-200 text-gray-900 font-medium rounded px-0.5">
        {match[0]}
      </mark>
    )
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : text
}
