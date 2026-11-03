// components/ui/AccordionSection.tsx
// Reusable accordion component for doctor detail page sections

import { ChevronDown, ChevronUp } from "lucide-react";
import { DESIGN_TOKENS } from "@/components/design-tokens";

interface AccordionItem {
  label: string;
  icon: React.ReactNode;
}

interface AccordionSectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: AccordionItem[];
  isOpen: boolean;
  onToggle: (id: string) => void;
}

export default function AccordionSection({
  id,
  title,
  icon,
  items,
  isOpen,
  onToggle,
}: AccordionSectionProps) {
  const hasItems = items.length > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-shadow duration-300 hover:shadow-md">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:bg-gray-50"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-[#29A9B9]">
            {icon}
          </span>
          <div>
            <h2 className="text-2xl font-medium text-gray-900">
              {title}
            </h2>
          </div>
        </div>
        <span
          className={`shrink-0 text-gray-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        >
          {isOpen ? (
            <ChevronUp className="w-7 h-7" />
          ) : (
            <ChevronDown className="w-7 h-7" />
          )}
        </span>
      </button>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-200 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className={`px-6 pb-6 ${isOpen ? "pt-4" : "pt-0"}`}>
          {hasItems ? (
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-100 transition-all duration-200"
                >
                  <span className="shrink-0 mt-0.5 text-[#29A9B9]">
                    {item.icon}
                  </span>
                  <span className="text-base text-gray-900 leading-relaxed">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4 text-base">
              No {title.toLowerCase()} available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}