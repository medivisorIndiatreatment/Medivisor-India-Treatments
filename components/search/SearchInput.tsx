// File: components/search/SearchInput.tsx
// Improved SearchInput component with better performance and maintainability

"use client"

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, X, Building2, User, Pill, Stethoscope, Briefcase, ChevronRight, ChevronLeft, Loader2 } from "lucide-react"

import type { SearchInputProps, SearchItem, ViewType, IconType } from "@/types/searchInput"
import { getAllData, filterItems, getRedirectUrl } from "@/lib/utils/search"
import { SEARCH_PLACEHOLDER, DROPDOWN_HEADER_TEXT, RESULT_COUNT_TEXT, NO_RESULTS_TEXT } from "@/types/searchInput"
import { useLang } from "@/lib/i18n"

// ===========================================
// Icon Resolution
// ===========================================

const ICON_COMPONENTS: Record<IconType, React.ReactNode> = {
  department: <Briefcase className="w-4 h-4" />,
  subDepartment: <Briefcase className="w-4 h-4" />,
  specialist: <Stethoscope className="w-4 h-4" />,
  treatment: <Pill className="w-4 h-4" />,
  hospital: <Building2 className="w-4 h-4" />,
  hospitalGroup: <Building2 className="w-4 h-4" />,
  doctor: <User className="w-4 h-4" />,
}

/**
 * Resolve icon type to actual icon component
 */
function resolveIcon(iconType: IconType): React.ReactNode {
  return ICON_COMPONENTS[iconType] ?? <Briefcase className="w-4 h-4" />
}

// ===========================================
// Custom Hooks
// ===========================================

/**
 * Debounce hook for search input
 */
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

// ===========================================
// Main Component
// ===========================================

export default function SearchInput({ 
  value, 
  onChange, 
  view, 
  branches, 
  doctors, 
  treatments, 
  subDepartments = [],
  hierarchicalData,
  hospitalGroups = [],
}: SearchInputProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { dir } = useLang()

  // State management
  const [showDropdown, setShowDropdown] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Debounce search value to improve performance
  const debouncedValue = useDebounce(value, 150)

  // Get all data items (memoized)
  const allItems = useMemo(() => 
    getAllData(view, branches, doctors, treatments, subDepartments, hierarchicalData, hospitalGroups),
    [view, branches, doctors, treatments, subDepartments, hierarchicalData, hospitalGroups]
  )

  // Filter items based on search query (uses debounced value)
  const filteredItems = useMemo(() => 
    filterItems(allItems, debouncedValue),
    [allItems, debouncedValue]
  )

  // Memoize placeholder
  const placeholder = useMemo(() => SEARCH_PLACEHOLDER, [])

  // ===========================================
  // Event Handlers
  // ===========================================

  /**
   * Handle click outside to close dropdown
   */
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setShowDropdown(false)
    }
  }, [])

  /**
   * Reset focused index when filtered items change
   */
  const resetFocusedIndex = useCallback(() => {
    setFocusedIndex(-1)
  }, [])

  /**
   * Handle redirect based on item type
   */
  const handleRedirect = useCallback((item: SearchItem) => {
    // Show loading indicator but keep input active
    setIsRedirecting(true)
    const redirectUrl = getRedirectUrl(item, view)
    
    // Use replace: false to allow browser back navigation
    router.push(redirectUrl)
    
    // Reset redirecting state after a short delay
    // This ensures the loading indicator shows briefly but doesn't get stuck
    setTimeout(() => {
      setIsRedirecting(false)
    }, 500)
  }, [view, router])

  /**
   * Handle item selection
   */
  const handleSelectItem = useCallback((item: SearchItem) => {
    // For Hospital type, redirect directly without setting search query
    // This prevents the search page from showing filtered results
    if (item.type === 'Hospital') {
      setShowDropdown(false)
      setFocusedIndex(-1)
      handleRedirect(item)
      return
    }
    
    // For other types, update search query and redirect
    onChange(item.name)
    setShowDropdown(false)
    setFocusedIndex(-1)
    handleRedirect(item)
  }, [onChange, handleRedirect])

  /**
   * Clear input and reset state
   */
  const handleClear = useCallback(() => {
    onChange("")
    setShowDropdown(true)
    setIsRedirecting(false)
    inputRef.current?.focus()
  }, [onChange])

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle arrow keys and enter when dropdown is not shown
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
        } else if (value) {
          setShowDropdown(false)
        }
        break
      case "Escape":
        setShowDropdown(false)
        setFocusedIndex(-1)
        break
    }
  }, [showDropdown, filteredItems, focusedIndex, value, handleSelectItem])

  /**
   * Handle input change
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    setShowDropdown(true)
    setFocusedIndex(-1)
  }, [onChange])

  /**
   * Handle input focus
   */
  const handleFocus = useCallback(() => {
    setShowDropdown(true)
  }, [])

  // ===========================================
  // Effects
  // ===========================================

  // Reset redirecting state on mount (handles browser back navigation)
  useEffect(() => {
    setIsRedirecting(false)
  }, [])

  // Add/remove click outside listener
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [handleClickOutside])

  // Reset focused index when filtered items change
  useEffect(() => {
    setFocusedIndex(-1)
  }, [filteredItems.length])

  // ===========================================
  // Render Helpers
  // ===========================================

  const showDropdownContent = showDropdown && !isRedirecting
  const hasResults = filteredItems.length > 0

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
              {DROPDOWN_HEADER_TEXT(value)}
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
              {RESULT_COUNT_TEXT(filteredItems.length)}
            </span>
          </div>
        </div>
      )}

      {/* No Results Message */}
      {showDropdownContent && !hasResults && (
        <div className="absolute z-50 mt-1 w-full min-w-[280px] bg-white border border-gray-200 rounded-xs shadow-lg p-4 text-center">
          <p className="text-sm text-gray-500">
            {NO_RESULTS_TEXT(value)}
          </p>
        </div>
      )}
    </div>
  )
}
