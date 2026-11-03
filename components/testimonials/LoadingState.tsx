"use client"

import { Loader2, Stethoscope } from "lucide-react"
import { DESIGN_TOKENS } from "@/components/design-tokens"
import { useTranslatedString } from "@/lib/i18n"

export function LoadingState() {
  const loadingTitle = useTranslatedString("Loading Patient Stories")
  const loadingDesc = useTranslatedString("Fetching inspiring recovery journeys...")
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-5">
        <div className="relative inline-flex">
          <div className="w-16 h-16 rounded-full border-4 border-gray-200 animate-spin border-t-[#23366E]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Stethoscope className="h-6 w-6 text-[#23366E] animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
<h3 className="text-xl font-semibold text-gray-900">{loadingTitle}</h3>
          <p className="text-sm text-gray-500">{loadingDesc}</p>
        </div>
      </div>
    </div>
  )
}
