"use client"

import { Button } from "@/components/ui/button"
import { SearchX } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslatedString } from "@/lib/i18n"

interface EmptyStateProps {
  onClear?: () => void
  isSearch?: boolean
}

export function EmptyState({ onClear, isSearch = false }: EmptyStateProps) {
  const noStoriesTitle = useTranslatedString(isSearch ? "No Stories Found" : "No Patient Videos Available")
  const noStoriesDesc = useTranslatedString(
    isSearch
      ? "We couldn't find any patient stories matching your search criteria. Try adjusting your search terms."
      : "There are no valid patient testimonial videos available right now. Please check back later."
  )
  const clearButton = useTranslatedString(isSearch ? "Clear Search" : "Refresh Page")

  return (
    <div className="text-center py-16 md:py-24">
      <div className="inline-flex items-center justify-center rounded-full bg-gray-100 p-4 mb-6">
        <SearchX className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">
{noStoriesTitle}
      </h3>
      <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
        {noStoriesDesc}
      </p>
      {onClear && (
        <Button
          onClick={onClear}
          className="bg-[#23366E] hover:bg-[#1A2A52] text-white px-6 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300"
        >
{clearButton}
        </Button>
      )}
    </div>
  )
}
