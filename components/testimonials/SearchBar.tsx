"use client"

import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import { useTranslatedString } from "@/lib/i18n"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  loading?: boolean
}

export function SearchBar({ value, onChange, loading = false }: SearchBarProps) {
  const placeholder = useTranslatedString("Search patient stories, treatments, conditions...")

  return (
    <div className="relative w-full">
      <Search className={`absolute top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 left-4`} />
      {loading && (
        <Loader2 className={`absolute top-1/2 transform -translate-y-1/2 text-red-500 h-5 w-5 animate-spin right-4`} />
      )}
       <Input
         type="text"
         placeholder={placeholder}
         value={value}
         dir="ltr"
         onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
         className="pl-12 pr-12 py-5 w-full bg-white border-gray-200 rounded-md focus:ring-1 focus:ring-[#74BF44]/30 focus:border-[#74BF44]/50 shadow-xs text-base placeholder:text-gray-400 transition-all text-left"
       />
    </div>
  )
}
