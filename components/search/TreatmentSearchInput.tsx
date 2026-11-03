"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ChevronDown, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { generateSlug } from "@/lib/slug-utils";
import { useLang } from "@/lib/i18n";

interface Treatment {
  _id: string;
  name?: string;
  description?: string;
  category?: string;
  treatmentImage?: string;
  cost?: string;
  duration?: string;
  popular?: boolean;
}

interface TreatmentSearchInputProps {
  treatments: Treatment[];
  value?: string;
  onChange?: (value: string) => void;
}

export default function TreatmentSearchInput({
  treatments,
  value: externalValue,
  onChange: externalOnChange,
}: TreatmentSearchInputProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemHeightRef = useRef<number>(42);

  const { dir } = useLang()

  // Use external state if provided, otherwise use internal state
  const [internalValue, setInternalValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [hasMoreAbove, setHasMoreAbove] = useState(false);
  const [hasMoreBelow, setHasMoreBelow] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Use external value if provided, otherwise use internal
  const searchValue = externalValue ?? internalValue;
  const setSearchValue = externalOnChange ?? setInternalValue;

  // Filter and score treatments based on search query
  const filteredTreatments = useMemo(() => {
    if (!searchValue.trim()) return treatments;

    const query = searchValue.toLowerCase().trim();
    const searchWords = query.split(/\s+/).filter(Boolean);

    const scored = treatments
      .map((treatment) => {
        const name = (treatment.name || "").toLowerCase();
        let score = 0;

        if (name === query) {
          score = 100;
        } else if (name.startsWith(query)) {
          score = 80;
        } else if (
          searchWords.every((word) => new RegExp(`\\b${word}`, "i").test(name))
        ) {
          score = 60;
        } else if (searchWords.every((word) => name.includes(word))) {
          score = 40;
        } else if (searchWords.some((word) => name.includes(word))) {
          score = 20;
        } else {
          return null;
        }

        score += Math.max(0, 30 - name.length);
        const wordBoundaryMatches = searchWords.filter((word) =>
          new RegExp(`\\b${word}`, "i").test(name),
        ).length;
        score += wordBoundaryMatches * 10;

        return { ...treatment, score };
      })
      .filter((item): item is { score: number } & Treatment => item !== null);

    return scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a
        .name!.toLowerCase()
        .localeCompare(b.name!.toLowerCase(), undefined, {
          sensitivity: "base",
        });
    });
  }, [treatments, searchValue]);

  const totalItems = filteredTreatments.length;

  const updateScrollIndicators = useCallback(() => {
    if (!listRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    setScrollPosition(scrollTop);
    setHasMoreAbove(scrollTop > 10);
    setHasMoreBelow(scrollTop + clientHeight < scrollHeight - 10);
  }, []);

  // Handle click outside to close dropdown
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setShowDropdown(false);
    }
  }, []);

  // Add/remove click outside listener
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    updateScrollIndicators();
  }, [scrollPosition, filteredTreatments.length, updateScrollIndicators]);

  useEffect(() => {
    setFocusedIndex(-1);
  }, [filteredTreatments.length]);

  // Handle treatment selection - redirect directly to treatment page
  const handleSelectTreatment = useCallback(
    (treatment: Treatment) => {
      if (!treatment.name) return;

      setIsRedirecting(true);
      const slug = generateSlug(treatment.name);
      const redirectUrl = `/treatment/${slug}`;

      router.push(redirectUrl);

      // Reset after short delay
      setTimeout(() => {
        setIsRedirecting(false);
        setShowDropdown(false);
      }, 500);
    },
    [router],
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showDropdown) {
        if (e.key === "ArrowDown" || e.key === "Enter") {
          setShowDropdown(true);
          e.preventDefault();
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev < filteredTreatments.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredTreatments.length - 1,
          );
          break;
        case "Enter":
          e.preventDefault();
          if (focusedIndex >= 0 && filteredTreatments[focusedIndex]) {
            handleSelectTreatment(filteredTreatments[focusedIndex]);
          } else if (searchValue && filteredTreatments.length > 0) {
            handleSelectTreatment(filteredTreatments[0]);
          }
          break;
        case "Escape":
          setShowDropdown(false);
          setFocusedIndex(-1);
          break;
      }
    },
    [
      showDropdown,
      filteredTreatments,
      focusedIndex,
      searchValue,
      handleSelectTreatment,
    ],
  );

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (externalOnChange) {
        externalOnChange(newValue);
      } else {
        setInternalValue(newValue);
      }
      setShowDropdown(true);
      setFocusedIndex(-1);
    },
    [externalOnChange],
  );

  // Handle clear
  const handleClear = useCallback(() => {
    if (externalOnChange) {
      externalOnChange("");
    } else {
      setInternalValue("");
    }
    setShowDropdown(true);
    setIsRedirecting(false);
    inputRef.current?.focus();
  }, [externalOnChange]);

  // Handle focus
  const handleFocus = useCallback(() => {
    setShowDropdown(true);
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, []);

  // Highlight matching text in search results
  const highlightMatch = useCallback(
    (text: string, query: string): React.ReactNode => {
      if (!query) return text;

      const searchWords = query
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      if (searchWords.length === 0) return text;

      const escapedWords = searchWords.map((w) =>
        w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      );
      const regex = new RegExp(`(${escapedWords.join("|")})`, "gi");

      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      regex.lastIndex = 0;

      while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          parts.push(text.slice(lastIndex, match.index));
        }
        parts.push(
          <mark
            key={match.index}
            className="bg-gray-200 text-gray-900 font-medium rounded px-0.5"
          >
            {match[0]}
          </mark>,
        );
        lastIndex = regex.lastIndex;
      }

      if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
      }

      return parts.length > 0 ? parts : text;
    },
    [],
  );

  const showDropdownContent = showDropdown && !isRedirecting;
  const showNoResults =
    showDropdown &&
    !isRedirecting &&
    filteredTreatments.length === 0 &&
    searchValue;
  const handleScroll = useCallback(() => {
    updateScrollIndicators();
  }, [updateScrollIndicators]);

  return (
    <div ref={dropdownRef} className="relative flex-1">
      {/* Search Input Field */}
      <div className="relative">
        <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none left-3`} />
         <input
          ref={inputRef}
          type="text"
          placeholder="Search Treatments"
          value={searchValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          dir="ltr"
          className="w-full pl-10 pr-10 py-2.5 border border-gray-200 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 text-left"
          aria-label="Search Treatments"
          aria-expanded={showDropdown}
          aria-controls="treatment-search-dropdown"
          role="combobox"
        />

        {isRedirecting ? (
          <Loader2 className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin right-3`} />
        ) : (
          searchValue && (
            <button
              onClick={handleClear}
              className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 right-3`}
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          )
        )}
      </div>

      {/* Dropdown Content */}
      {showDropdownContent && filteredTreatments.length > 0 && (
        <div
          id="treatment-search-dropdown"
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden"
          style={{ maxHeight: `${420}px` }}
        >
          {/* Scroll up indicator */}
          {hasMoreAbove && (
            <div className="sticky top-0 z-10 bg-gradient-to-b from-white to-gray-50 py-1.5 text-center border-b border-gray-100">
              <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                <ChevronDown className="w-3 h-3 rotate-180" />
                <span>Scroll for more</span>
              </div>
            </div>
          )}

          <div
            ref={listRef}
            onScroll={handleScroll}
            className="overflow-y-auto scroll-smooth"
            style={{ maxHeight: `400px` }}
          >
            {filteredTreatments.map((treatment, index) => (
              <button
                key={treatment._id}
                onClick={() => handleSelectTreatment(treatment)}
                className={`w-full px-4 py-3 text-start hover:bg-blue-50 active:bg-blue-100 flex items-center gap-3 text-sm transition-colors duration-100 border-b border-gray-50 last:border-b-0 ${index === focusedIndex ? "bg-gray-100" : ""}`}
                style={{ minHeight: `${itemHeightRef.current}px` }}
              >
                <div className="flex-1 min-w-0">
                  <span className="block truncate text-gray-800">
                    {highlightMatch(treatment.name || "", searchValue)}
                  </span>
                </div>
              {dir === 'rtl' ? (
                <ChevronLeft className="w-4 h-5 text-gray-300 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-5 text-gray-300 flex-shrink-0" />
              )}
              </button>
            ))}
          </div>

          {/* Scroll down indicator */}
          {hasMoreBelow && (
            <div className="sticky bottom-0 z-10 bg-gradient-to-t from-white to-gray-50 py-1.5 text-center border-t border-gray-100">
              <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                <span>Scroll for more</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
            <span>
              {totalItems} result{totalItems !== 1 ? "s" : ""}
            </span>
            {searchValue && <span>Showing all matches</span>}
          </div>
        </div>
      )}

      {/* No Results Message */}
      {showDropdown && filteredTreatments.length === 0 && searchValue && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-md shadow-xl p-8 text-center">
          <div className="text-gray-400 mb-2">
            <Search className="w-8 h-8 mx-auto" />
          </div>
          <p className="text-gray-600 font-medium">No results found</p>
          <p className="text-gray-400 text-sm mt-1">
            Try a different search term
          </p>
        </div>
      )}
    </div>
  );
}
