"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { Search, X, MapPin, ChevronDown } from "lucide-react"
import { useTranslatedStrings } from "@/lib/i18n"
import { useI18n } from "@/lib/i18n"

interface SearchDropdownOption {
  id: string
  name: string
  type?: "city" | "branch" | "treatment" | "doctor" | "specialty" | "department"
  departmentName?: string
}

interface SearchDropdownProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  placeholderI18nKey?: string
  options: SearchDropdownOption[]
  onOptionSelect: (id: string) => void
  onClear: () => void
  type: "city" | "branch" | "treatment" | "doctor" | "specialty" | "department"
  maxHeight?: number
  showAllOnFocus?: boolean
  'data-i18n'?: string
  'data-i18n-original'?: string
}

const DEBOUNCE_DELAY = 150

export default function SearchDropdown({
  value,
  onChange,
  placeholder,
  placeholderI18nKey,
  options,
  onOptionSelect,
  onClear,
  type,
  maxHeight = 400,
  showAllOnFocus = false,
  ...rest
}: SearchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localValue, setLocalValue] = useState(value)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [hasMoreAbove, setHasMoreAbove] = useState(false)
  const [hasMoreBelow, setHasMoreBelow] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const itemHeightRef = useRef<number>(42)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const optionNames = useMemo(() => {
    const names = options.map((opt) => opt.name)
    const deptNames = options
      .map((opt) => opt.departmentName)
      .filter((d): d is string => !!d)
    return Array.from(new Set([...names, ...deptNames, placeholder, "Scroll for more", "Showing all matches", "No results found", "Try a different search term"]))
  }, [options, placeholder])

  const { t: tGlobal } = useI18n()
  const translatedNames = useTranslatedStrings(optionNames)
  const nameTranslationMap = useMemo(() => {
    const map = new Map<string, string>()
    optionNames.forEach((original, i) => {
      map.set(original, translatedNames[i] ?? original)
    })
    return map
  }, [optionNames, translatedNames])

  const useTranslatedText = useCallback((text: string): string => {
    if (!text) return text
    return nameTranslationMap.get(text) || tGlobal(text)
  }, [nameTranslationMap, tGlobal])

  const translatedOptions = useMemo<SearchDropdownOption[]>(
    () =>
      options.map((opt) => ({
        ...opt,
        name: useTranslatedText(opt.name),
        departmentName: opt.departmentName ? useTranslatedText(opt.departmentName) : opt.departmentName,
      })),
    [options, useTranslatedText]
  )

  const originalOptionMap = useMemo(() => {
    const map = new Map<string, { name: string; departmentName?: string }>()
    options.forEach((opt) => {
      map.set(opt.id, { name: opt.name, departmentName: opt.departmentName })
    })
    return map
  }, [options])

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const filteredOptions = useMemo(() => {
if (!localValue) return showAllOnFocus ? translatedOptions : []

    const search = localValue.toLowerCase().trim()
    if (!search) return showAllOnFocus ? translatedOptions : []

    const searchWords = search.split(/\s+/).filter(Boolean)

    const scoredOptions = translatedOptions
      .map(option => {
        const name = option.name.toLowerCase()
        let score = 0

        // Exact match gets highest score
        if (name === search) {
          score = 100
        }
        // Starts with query
        else if (name.startsWith(search)) {
          score = 80
        }
        // All search words found at word boundaries
        else if (searchWords.every(word => new RegExp(`\\b${word}`, 'i').test(name))) {
          score = 60
        }
        // All search words found anywhere
        else if (searchWords.every(word => name.includes(word))) {
          score = 40
        }
        // Some search words found
        else if (searchWords.some(word => name.includes(word))) {
          score = 20
        }
        // No match
        else {
          return null
        }

        // Bonus for shorter names (more relevant)
        score += Math.max(0, 30 - name.length)

        // Bonus for word boundary matches
        const wordBoundaryMatches = searchWords.filter(word =>
          new RegExp(`\\b${word}`, 'i').test(name)
        ).length
        score += wordBoundaryMatches * 10

        return { ...option, score }
      })
.filter((item): item is (SearchDropdownOption & { score: number }) => item !== null)

    // Sort by score (descending), then alphabetically
    return scoredOptions.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase(), undefined, { sensitivity: "base" })
    })
  }, [localValue, options, showAllOnFocus])

  const hasTypeInfo = useMemo(() => {
    return options.some(opt => opt.type !== undefined)
  }, [options])

  const inputId = useMemo(() => `search-dropdown-${type}`, [type])

  const totalItems = filteredOptions.length
  const displayedOptions = filteredOptions

  useEffect(() => {
    updateScrollIndicators()
  }, [scrollPosition, displayedOptions.length])

  const updateScrollIndicators = useCallback(() => {
    if (!listRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = listRef.current
    setScrollPosition(scrollTop)
    setHasMoreAbove(scrollTop > 10)
    setHasMoreBelow(scrollTop + clientHeight < scrollHeight - 10)
  }, [])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    updateScrollIndicators()
  }, [updateScrollIndicators])

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
      setIsOpen(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [handleClickOutside])

  const handleSelect = useCallback((option: SearchDropdownOption) => {
    onOptionSelect(option.id)
    setIsOpen(false)
  }, [onOptionSelect])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    setIsOpen(true)
    setScrollPosition(0)

    // Debounce the onChange callback
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      onChange(newValue)
    }, DEBOUNCE_DELAY)
  }, [onChange])

  const handleClear = useCallback(() => {
    setLocalValue("")
    onClear()
    setIsOpen(false)
  }, [onClear])

  const handleFocus = useCallback(() => {
    setIsOpen(true)
    // Reset scroll position on focus
    if (listRef.current) {
      listRef.current.scrollTop = 0
    }
  }, [])

  const Icon = useMemo(() => {
    return type === "city" ? MapPin : Search
  }, [type])

  // Highlight matching text in search results
  const highlightMatch = useCallback((text: string, query: string): React.ReactNode => {
    if (!query) return text

    const searchWords = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
    if (searchWords.length === 0) return text

    // Escape special regex characters and create pattern
    const escapedWords = searchWords.map(w =>
      w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    )
    const regex = new RegExp(`(${escapedWords.join('|')})`, 'gi')

    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null

    // Reset regex lastIndex for consistent results
    regex.lastIndex = 0

    while ((match = regex.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index))
      }
      // Add highlighted match
      parts.push(
        <mark key={match.index} className="bg-gray-200 text-gray-900 font-medium rounded px-0.5">
          {match[0]}
        </mark>
      )
      lastIndex = regex.lastIndex
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex))
    }

    return parts.length > 0 ? parts : text
  }, [])

  const showDropdown = isOpen && displayedOptions.length > 0
  const showNoResults = isOpen && displayedOptions.length === 0 && localValue

  return (
    <div ref={wrapperRef} className="relative w-full">
<label htmlFor={inputId} className="sr-only" data-i18n={placeholderI18nKey} data-i18n-original={placeholder} data-trans-managed="true">{useTranslatedText(placeholder)}</label>
      <div className="relative">
         <Icon className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none left-3`} />
         <input
           id={inputId}
           type="text"
           value={localValue}
           onChange={handleInputChange}
           onFocus={handleFocus}
           placeholder={useTranslatedText(placeholder)}
           data-i18n={placeholderI18nKey}
           data-i18n-original={placeholder}
           data-trans-managed="true"
            dir="ltr"
            autoComplete="off"
            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all duration-200 text-left"
           {...rest}
         />
        {localValue && (
          <button
            onClick={handleClear}
            className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 right-3`}
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div 
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden"
          style={{ maxHeight: `${maxHeight + 20}px` }}
        >
          {hasMoreAbove && (
            <div className="sticky top-0 z-10 bg-gradient-to-b from-white to-gray-50 py-1.5 text-center border-b border-gray-100">
              <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
<ChevronDown className="w-3 h-3 rotate-180" />
                <span data-i18n="common.scroll-more" data-i18n-original="Scroll for more" data-trans-managed="true">
                  {useTranslatedText("Scroll for more")}
                </span>
              </div>
            </div>
          )}
          
          <div
            ref={listRef}
            onScroll={handleScroll}
            className="overflow-y-auto scroll-smooth"
            style={{ maxHeight: `${maxHeight}px` }}
          >
            {displayedOptions.map((option, index) => (
              <button
                key={option.id}
                onClick={() => handleSelect(option)}
                className="w-full px-4 py-3 text-start hover:bg-blue-50 active:bg-blue-100 flex items-center gap-3 text-sm transition-colors duration-100 border-b border-gray-50 last:border-b-0"
                style={{ minHeight: `${itemHeightRef.current}px` }}
              >
<div className="flex-1 min-w-0">
                  <span className="block truncate text-gray-800" data-i18n-original={originalOptionMap.get(option.id)?.name || option.name} data-trans-managed="true">
                    {highlightMatch(option.name, localValue)}
                  </span>
                  {option.departmentName && (
                    <span className="block text-xs text-gray-400 truncate mt-0.5" data-i18n-original={`in ${originalOptionMap.get(option.id)?.departmentName ?? option.departmentName}`} data-trans-managed="true">
                      in {option.departmentName}
                    </span>
                  )}
               </div>
              </button>
            ))}
          </div>
          
          {hasMoreBelow && (
            <div className="sticky bottom-0 z-10 bg-gradient-to-t from-white to-gray-50 py-1.5 text-center border-t border-gray-100">
              <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
<span data-i18n="common.scroll-more" data-i18n-original="Scroll for more" data-trans-managed="true">
                  {useTranslatedText("Scroll for more")}
                </span>
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>
          )}
          
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
<span data-i18n="search.results-count" data-i18n-original={`${totalItems} result${totalItems !== 1 ? 's' : ''}`} data-trans-managed="true">
              {totalItems} result{totalItems !== 1 ? 's' : ''}
            </span>
            {localValue && (
              <span data-i18n="search.showing-all" data-i18n-original="Showing all matches" data-trans-managed="true">
                {useTranslatedText("Showing all matches")}
              </span>
            )}
          </div>
        </div>
      )}

      {showNoResults && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-md shadow-xl p-8 text-center">
          <div className="text-gray-400 mb-2">
            <Search className="w-8 h-8 mx-auto" />
          </div>
<p className="text-gray-600 font-medium" data-i18n="search.no-results" data-i18n-original="No results found" data-trans-managed="true">
            {useTranslatedText("No results found")}
           </p>
           <p className="text-gray-400 text-sm mt-1" data-i18n="search.try-different" data-i18n-original="Try a different search term" data-trans-managed="true">
            {useTranslatedText("Try a different search term")}
           </p>
        </div>
      )}
    </div>
  )
}
