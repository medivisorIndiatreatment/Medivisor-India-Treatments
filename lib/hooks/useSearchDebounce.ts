"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface SearchDropdownOption {
  id: string
  name: string
  type?: "city" | "branch" | "treatment" | "doctor" | "specialty" | "department"
}

interface UseSearchDebounceProps {
  delay?: number
}

interface UseSearchDebounceReturn {
  inputValue: string
  debouncedValue: string
  setInputValue: (value: string) => void
  clearSearch: () => void
  filteredOptions: (options: SearchDropdownOption[]) => SearchDropdownOption[]
}

export function useSearchDebounce({ delay = 150 }: UseSearchDebounceProps = {}): UseSearchDebounceReturn {
  const [inputValue, setInputValue] = useState("")
  const [debouncedValue, setDebouncedValue] = useState("")
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedValue(inputValue)
    }, delay)
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [inputValue, delay])

  const clearSearch = useCallback(() => {
    setInputValue("")
    setDebouncedValue("")
  }, [])

  const filteredOptions = useCallback((options: SearchDropdownOption[]) => {
    if (!debouncedValue) return []

    const search = debouncedValue.toLowerCase().trim()
    if (!search) return []

    const searchWords = search.split(/\s+/).filter(Boolean)

    const scoredOptions = options
      .map(option => {
        const name = option.name.toLowerCase()
        let score = 0

        if (name === search) {
          score = 100
        } else if (name.startsWith(search)) {
          score = 80
        } else if (searchWords.every(word => new RegExp(`\\b${word}`, 'i').test(name))) {
          score = 60
        } else if (searchWords.every(word => name.includes(word))) {
          score = 40
        } else if (searchWords.some(word => name.includes(word))) {
          score = 20
        } else {
          return null
        }

        score += Math.max(0, 30 - name.length)
        const wordBoundaryMatches = searchWords.filter(word =>
          new RegExp(`\\b${word}`, 'i').test(name)
        ).length
        score += wordBoundaryMatches * 10

        return { ...option, score }
      })
      .filter((item): item is SearchDropdownOption & { score: number } => item !== null)

    return scoredOptions.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase(), undefined, { sensitivity: "base" })
    })
  }, [debouncedValue])

  return {
    inputValue,
    debouncedValue,
    setInputValue,
    clearSearch,
    filteredOptions,
  }
}