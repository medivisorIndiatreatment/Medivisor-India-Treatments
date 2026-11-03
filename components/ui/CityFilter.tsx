"use client"

import { DESIGN_TOKENS } from "@/components/design-tokens"
import { useI18n } from "@/lib/i18n"

interface CityFilterProps {
  cities: string[]
  selectedCity: string
  onCityChange: (city: string) => void
}

export default function CityFilter({ cities, selectedCity, onCityChange }: CityFilterProps) {
  const { t } = useI18n()

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => onCityChange("all")}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          DESIGN_TOKENS.TRANSITIONS.BASE
        } ${
          selectedCity === "all"
            ? "bg-[#23366E] text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
{t("All Cities")}
      </button>
      {cities.map((city) => (
        <button
          key={city}
          onClick={() => onCityChange(city)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            DESIGN_TOKENS.TRANSITIONS.BASE
          } ${
            selectedCity === city
              ? "bg-[#23366E] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {city}
        </button>
      ))}
    </div>
  )
}