"use client"

import type { ReactNode } from "react"
import { Building2, User, Pill, LayoutGrid } from "lucide-react"

export type ViewType = "hospitals" | "doctors" | "treatments"

interface ViewToggleProps {
  view: ViewType
  setView: (view: ViewType) => void
}

const VIEW_OPTIONS: Array<{ value: ViewType; label: string; icon: ReactNode }> = [
  {
    value: "hospitals",
    label: "Hospitals",
    icon: <Building2 className="w-4 h-4" />,
  },
  {
    value: "doctors",
    label: "Doctors",
    icon: <User className="w-4 h-4" />,
  },
  {
    value: "treatments",
    label: "Treatments",
    icon: <Pill className="w-4 h-4" />,
  },
]

export default function ViewToggle({ view, setView }: ViewToggleProps) {
  const handleTabClick = (value: ViewType) => {
    setView(value)
  }

  return (
    <div className="w-full bg-white rounded-lg p-1 shadow-sm border border-gray-200/70">
      <div className="flex w-full">
        {VIEW_OPTIONS.map((option) => {
          const isActive = view === option.value

          return (
            <button
              key={option.value}
              onClick={() => handleTabClick(option.value)}
              onMouseDown={(e) => e.preventDefault()}
              role="tab"
              aria-selected={isActive}
              className={`
                flex-1 flex items-center justify-center gap-2
                px-4 py-2.5 rounded-md
                text-sm font-medium
                transition-all duration-200 ease-out
                focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#74BF44]
                ${
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/50"
                }
              `}
            >
              <span className={`transition-opacity duration-200 ${isActive ? "opacity-100" : "opacity-70"}`}>
                {option.icon}
              </span>
              <span className="hidden sm:inline">{option.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}