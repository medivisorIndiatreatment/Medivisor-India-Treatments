/**
 * FilterDropdown Component
 * A reusable dropdown filter component with search functionality
 * Provides accessible filtering with clear selection states
 */

"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { ChevronDown, X, Search } from "lucide-react"
import { FilterValue } from "@/types/search"
import { useLang } from "@/lib/i18n"

interface FilterOption {
  id: string
  name: string
  state?: string
}

interface FilterDropdownProps {
  placeholder: string
  filterKey: string
  filters: Record<string, FilterValue>
  updateSubFilter: (key: string, subKey: string, value: string) => void
  options: FilterOption[]
}

/**
 * FilterDropdown provides a searchable dropdown for filtering content
 * Features: search, clear selection, keyboard navigation, accessible
 */
export default function FilterDropdown({
  placeholder,
  filterKey,
  filters,
  updateSubFilter,
  options = [],
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const wrapperRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Get current filter value
  const currentValue = filters[filterKey]?.query || ""

  // Filter options based on search query
  const filteredOptions = useMemo((): FilterOption[] => {
    if (!search) return options
    const searchLower = search.toLowerCase()
    return options.filter((opt) =>
      opt.name.toLowerCase().includes(searchLower)
    )
  }, [options, search])

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handle escape key to close dropdown
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  // Reset search when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearch("")
    }
  }, [isOpen])

  // Toggle dropdown open/close
  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  // Handle option selection
  const handleSelect = useCallback(
    (option: FilterOption) => {
      updateSubFilter(filterKey, "id", option.id)
      updateSubFilter(filterKey, "query", option.name)
      setIsOpen(false)
      setSearch("")
      setTimeout(() => {
        buttonRef.current?.focus()
      }, 0)
    },
    [filterKey, updateSubFilter]
  )

  // Clear selection
  const handleClear = useCallback(() => {
    updateSubFilter(filterKey, "id", "")
    updateSubFilter(filterKey, "query", "")
    setIsOpen(false)
    setSearch("")
    setTimeout(() => {
      buttonRef.current?.focus()
    }, 0)
  }, [filterKey, updateSubFilter])

  // Handle keyboard navigation in dropdown
  const handleOptionKeyDown = useCallback(
    (e: React.KeyboardEvent, option: FilterOption) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        handleSelect(option)
      }
    },
    [handleSelect]
  )

  return (
    <div ref={wrapperRef} className="relative w-auto overflow-visible">
      {/* Dropdown trigger button */}
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation()
          handleToggle()
        }}
        onMouseDown={(e) => e.stopPropagation()}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={currentValue || placeholder}
        className={`
          flex items-center gap-2 px-3 py-2.5 border rounded-md
          transition-colors duration-200 min-w-[180px] justify-between shadow-xs
          ${
            currentValue
              ? "bg-white border-gray-300 text-gray-900"
              : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
          }
        `}
      >
        <span className="truncate text-sm">{currentValue || placeholder}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown content */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-1 top-full start-0 md:end-0 md:start-auto w-[280px] bg-white border border-gray-100 rounded-md shadow-md`}
          role="listbox"
          aria-label={`${placeholder} options`}
        >
          {/* Search input */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
               <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 left-3`} />
               <input
                 ref={inputRef}
                 type="text"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 placeholder="Search..."
                 aria-label={`Search ${placeholder}`}
                 dir="ltr"
                 className={`w-full ps-9 pe-8 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#74BF44]/30 focus:border-[#74BF44]/50 text-start`}
                 autoFocus
               />
               {search && (
                 <button
                   type="button"
                   onClick={() => {
                     setSearch("")
                     inputRef.current?.focus()
                   }}
                   className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 right-2`}
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
              <button
                key={option.id}
                onClick={(e) => {
                  e.stopPropagation()
                  handleSelect(option)
                }}
                onKeyDown={(e) => handleOptionKeyDown(e, option)}
                role="option"
                aria-selected={currentValue === option.name}
                className={`
                  w-full px-4 py-2.5 text-start text-sm hover:bg-gray-50
                  focus:bg-gray-50 focus:outline-none transition-colors
                  ${currentValue === option.name ? "text-[#74BF44] bg-green-50" : "text-gray-700"}
                `}
              >
                  {option.name}
                  {option.state && (
                    <span className="ml-1 text-gray-400 text-xs">
                      ({option.state})
                    </span>
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-sm text-gray-500 text-center">
                No options found
              </div>
            )}
          </div>

          {/* Clear button */}
          {currentValue && (
            <div className="p-2 border-t border-gray-100">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleClear()
                }}
                className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear {placeholder}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
