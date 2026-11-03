"use client"

import { useState, useEffect } from "react"

export function useSearchableItems<T = any>(options: {
  items: T[]
  searchFields?: (item: T) => string[]
  customSearchFn?: (item: T, term: string) => boolean
  debounceMs?: number
}) {
  const { items, searchFields, customSearchFn, debounceMs = 150 } = options
  const [searchValue, setSearchValue] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchValue), debounceMs)
    return () => clearTimeout(timer)
  }, [searchValue, debounceMs])

  const filteredItems = items.filter((item) => {
    if (!debouncedSearch) return true
    const term = debouncedSearch.toLowerCase().trim()
    if (customSearchFn) {
      return customSearchFn(item, term)
    }
    if (searchFields) {
      const fields = searchFields(item)
      return fields.some((field) => field.toLowerCase().includes(term))
    }
    return true
  })

  const searchOptions = items.map((item) => ({
    id: (item as any)._id,
    name: (item as any).name,
  }))

  const clearSearch = () => {
    setSearchValue("")
    setDebouncedSearch("")
  }

  return {
    searchValue,
    setSearchValue,
    debouncedSearch,
    filteredItems,
    searchOptions,
    clearSearch,
  }
}
