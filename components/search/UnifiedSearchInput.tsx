/**
 * UnifiedSearchInput Component
 * A reusable search input with dropdown functionality
 * Combines SearchInput and TreatmentSearchInput into a single component
 * Supports different search modes: general, treatments-only
 */

"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Search, X, Building2, User, Pill, Stethoscope, Briefcase, ChevronRight, ChevronLeft, Loader2 } from "lucide-react"
import { generateSlug, cleanSlug } from "@/lib/slug-utils"
import { useLang } from "@/lib/i18n"

// =============================================================================
// TYPES
// =============================================================================

export type SearchMode = "general" | "treatments"

export interface UnifiedSearchInputProps {
  mode?: SearchMode
  value: string
  onChange: (value: string) => void
  // For general mode
  view?: "hospitals" | "doctors" | "treatments"
  branches?: unknown[]
  doctors?: unknown[]
  treatments?: unknown[]
  subDepartments?: unknown[]
  // For treatments mode
  treatmentList?: TreatmentItem[]
}

interface TreatmentItem {
  _id: string
  name?: string
  description?: string
  category?: string
  treatmentImage?: string
  cost?: string
  duration?: string
  popular?: boolean
}

interface SearchItem {
  id: string
  name: string
  type: string
  subInfo?: string
  icon: string
  slug?: string
}

// =============================================================================
// ICONS
// =============================================================================

const ICON_COMPONENTS: Record<string, React.ReactNode> = {
  department: <Briefcase className="w-4 h-4" />,
  subDepartment: <Briefcase className="w-4 h-4" />,
  specialist: <Stethoscope className="w-4 h-4" />,
  treatment: <Pill className="w-4 h-4" />,
  hospital: <Building2 className="w-4 h-4" />,
  doctor: <User className="w-4 h-4" />,
}

function resolveIcon(iconType: string): React.ReactNode {
  return ICON_COMPONENTS[iconType] ?? <Briefcase className="w-4 h-4" />
}

// =============================================================================
// DEBOUNCE HOOK
// =============================================================================

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function UnifiedSearchInput({
  mode = "general",
  value,
  onChange,
  view = "hospitals",
  branches = [],
  doctors = [],
  treatments = [],
  subDepartments = [],
  treatmentList = [],
}: UnifiedSearchInputProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { dir } = useLang()

  // State
  const [showDropdown, setShowDropdown] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Debounce for performance
  const debouncedValue = useDebounce(value, 150)

  // =============================================================================
  // FILTER LOGIC BASED ON MODE
  // =============================================================================

  const filteredItems = useMemo((): SearchItem[] => {
    if (mode === "treatments") {
      // Treatment-only mode
      const list = treatmentList.length > 0 ? treatmentList : (treatments as TreatmentItem[])
      
       if (!debouncedValue.trim()) {
         // Show popular treatments when no search
         return list
           .filter(t => t.popular)
           .slice(0, 8)
           .map(t => ({
             id: t._id,
             name: t.name || "Treatment",
             type: "Treatment",
             subInfo: t.category,
             icon: "treatment",
             slug: generateSlug(t.name || ""),
           }))
       }
       
       const query = debouncedValue.toLowerCase().trim()
       return list
         .filter(t => t.name?.toLowerCase().includes(query))
         .slice(0, 10)
         .map(t => ({
           id: t._id,
           name: t.name || "Treatment",
           type: "Treatment",
           subInfo: t.category,
           icon: "treatment",
           slug: generateSlug(t.name || ""),
         }))
    }

    // General search mode
    const items: SearchItem[] = []
    const query = debouncedValue.toLowerCase().trim()

       // Add branches/hospitals
     if (view === "hospitals" || view === "doctors") {
       ;(branches as { _id?: string; branchName?: string; hospitalName?: string; city?: { cityName: string }[] }[]).forEach(branch => {
         const name = branch.branchName || branch.hospitalName || ""
         if (name && (!query || name.toLowerCase().includes(query))) {
           items.push({
             id: branch._id || "",
             name,
             type: "Hospital",
             subInfo: branch.city?.[0]?.cityName,
             icon: "hospital",
             slug: generateSlug(name),
           })
         }
       })
     }

       // Add doctors - comprehensive search across multiple fields
       if (view === "doctors") {
          ;(doctors as { _id?: string; doctorName?: string; name?: string; slug?: string; specialization?: { name: string }[]; qualification?: string; hospitalName?: string; branchName?: string }[]).forEach(doc => {
           const name = doc.doctorName || doc.name || ""
           const specializationNames = Array.isArray(doc.specialization)
             ? doc.specialization.map((s) => (typeof s === 'string' ? s : s?.name || "")).filter(Boolean)
             : (doc.specialization ? [String(doc.specialization)] : [])
           const specialization = specializationNames.join(", ")
          const qualification = doc.qualification || ""
          const hospital = doc.hospitalName || doc.branchName || ""
          
          // Search across name, specialization, qualification, and hospital
          const matchesQuery = !query || 
            name.toLowerCase().includes(query) ||
            specialization.toLowerCase().includes(query) ||
            qualification.toLowerCase().includes(query) ||
            hospital.toLowerCase().includes(query)
          
          if (name && matchesQuery) {
            items.push({
              id: doc._id || "",
              name,
              type: "Doctor",
              subInfo: specialization || qualification || hospital,
              icon: "doctor",
              slug: doc.slug || generateSlug(name),
            })
          }
        })
      }

     // Add treatments
     if (view === "hospitals" || view === "treatments") {
       ;(treatments as { _id?: string; name?: string; category?: string }[]).forEach(treatment => {
         const name = treatment.name || ""
         if (name && (!query || name.toLowerCase().includes(query))) {
           items.push({
             id: treatment._id || "",
             name,
             type: "Treatment",
             subInfo: treatment.category,
             icon: "treatment",
             slug: generateSlug(name),
           })
         }
       })
     }

    // Add sub-departments
    if (view === "hospitals" && subDepartments.length > 0) {
      ;(subDepartments as { _id?: string; name?: string }[]).forEach(subDept => {
        const name = subDept.name || ""
        if (name && (!query || name.toLowerCase().includes(query))) {
          items.push({
            id: subDept._id || "",
            name,
            type: "SubDepartment",
            icon: "subDepartment",
          })
        }
      })
    }

    return items.slice(0, 10)
  }, [mode, treatmentList, treatments, debouncedValue, view, branches, doctors, subDepartments])

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setShowDropdown(false)
    }
  }, [])

  const handleSelectItem = useCallback((item: SearchItem) => {
    setIsRedirecting(true)
    
    let redirectUrl = "/search"
    
    if (mode === "treatments") {
      redirectUrl = `/treatment/${generateSlug(item.name)}`
    } else {
      // General mode - redirect based on type
      switch (item.type) {
        case "Hospital":
          redirectUrl = `/hospital-branches/${item.slug || generateSlug(item.name)}`
          break
        case "Doctor":
          // Use clean slug: clean stored slug if present, otherwise generate from name
          const doctorSlug = item.slug ? cleanSlug(item.slug) : generateSlug(item.name)
          redirectUrl = `/doctors/${doctorSlug}`
          break
        case "Treatment":
          redirectUrl = `/treatment/${item.slug || generateSlug(item.name)}`
          break
        case "SubDepartment":
          redirectUrl = `/treatment-service`
          break
      }
    }
    
    router.push(redirectUrl)
    
    setTimeout(() => {
      setIsRedirecting(false)
    }, 500)
  }, [mode, router])

  const handleClear = useCallback(() => {
    onChange("")
    setShowDropdown(true)
    setIsRedirecting(false)
    inputRef.current?.focus()
  }, [onChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showDropdown) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setShowDropdown(true)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setFocusedIndex(prev => 
          prev < filteredItems.length - 1 ? prev + 1 : 0
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : filteredItems.length - 1
        )
        break
      case "Enter":
        e.preventDefault()
        if (focusedIndex >= 0 && filteredItems[focusedIndex]) {
          handleSelectItem(filteredItems[focusedIndex])
        } else if (value && filteredItems.length > 0) {
          handleSelectItem(filteredItems[0])
        }
        break
      case "Escape":
        setShowDropdown(false)
        setFocusedIndex(-1)
        break
    }
  }, [showDropdown, filteredItems, focusedIndex, value, handleSelectItem])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    setShowDropdown(true)
    setFocusedIndex(-1)
  }, [onChange])

  const handleFocus = useCallback(() => {
    setShowDropdown(true)
  }, [])

  // =============================================================================
  // EFFECTS
  // =============================================================================

  useEffect(() => {
    setIsRedirecting(false)
  }, [])

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [handleClickOutside])

  useEffect(() => {
    setFocusedIndex(-1)
  }, [filteredItems.length])

  // =============================================================================
  // RENDER
  // =============================================================================

  const showDropdownContent = showDropdown && !isRedirecting
  const hasResults = filteredItems.length > 0
  const placeholder = mode === "treatments" ? "Search Treatments" : "Search hospitals, departments..."

  return (
    <div ref={dropdownRef} className="relative flex-1">
       {/* Input Field */}
       <div className="relative">
          <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700 left-3`} />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
           dir="ltr"
           className={`pl-10 pr-10 py-2 border border-gray-200 placeholder-gray-700 rounded-md text-base focus:outline-none focus:ring-1 focus:ring-[#74BF44]/30 focus:border-[#74BF44]/50 bg-white w-full shadow-xs transition-all text-left`}
          aria-label="Search"
          aria-expanded={showDropdown}
          aria-controls="search-dropdown"
          role="combobox"
        />
        
        {/* Loading spinner or clear button */}
        {isRedirecting ? (
          <Loader2 className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin right-3`} />
        ) : value && (
          <button
            onClick={handleClear}
            className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 right-3`}
            aria-label="Clear search"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown Content */}
      {showDropdownContent && hasResults && (
        <div 
          id="search-dropdown"
          className="absolute z-50 mt-1 w-full min-w-[320px] bg-white border border-gray-100 rounded-md shadow-md max-h-96 overflow-y-auto"
          role="listbox"
        >
          {/* Header */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 sticky top-0">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {mode === "treatments" 
                ? (value ? `Results for "${value}"` : "Popular Treatments")
                : (value ? `Results for "${value}"` : "Search hospitals, departments, specialists...")
              }
            </span>
          </div>

          {/* Items */}
          {filteredItems.map((item, index) => (
            <button
              key={`${item.type}-${item.id}`}
              onClick={() => handleSelectItem(item)}
              className={`w-full px-4 py-3 text-start flex items-center gap-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0 ${
                index === focusedIndex ? "bg-gray-100" : ""
              }`}
              role="option"
              aria-selected={index === focusedIndex}
            >
              <span className="text-gray-400 flex-shrink-0">
                {resolveIcon(item.icon)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-900 font-medium truncate">
                  {item.name}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-100">
                    {item.type}
                  </span>
                  {item.subInfo && (
                    <span className="truncate">{item.subInfo}</span>
                  )}
                </div>
              </div>
              {dir === 'rtl' ? (
                <ChevronLeft className="w-4 h-4 text-gray-300 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              )}
            </button>
          ))}

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 sticky bottom-0">
            <span className="text-xs text-gray-400">
              {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} • Press Enter to view
            </span>
          </div>
        </div>
      )}

      {/* No Results Message */}
      {showDropdownContent && !hasResults && (
        <div className="absolute z-50 mt-1 w-full min-w-[280px] bg-white border border-gray-100 rounded-md shadow-md p-4 text-center">
          <p className="text-sm text-gray-500">
            {mode === "treatments" 
              ? `No treatments found for "${value}"`
              : `No results found for "${value}"`
            }
          </p>
        </div>
      )}
    </div>
  )
}
