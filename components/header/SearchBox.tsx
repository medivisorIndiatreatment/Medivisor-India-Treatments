'use client';

import { Search, X } from 'lucide-react';
import { Trans } from '@/lib/i18n/Trans';
import { useTranslatedString } from '@/lib/i18n';

export default function SearchBox({
  value,
  onChange,
  placeholder,
  onClear,
  showClear = true,
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onClear?: () => void;
  showClear?: boolean;
  className?: string;
}) {
  const clearSearchLabel = useTranslatedString('Clear search');

  return (
    <div className="relative">
      <Search
        className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir="ltr"
        className={`w-full ps-9 pe-3 py-2 text-sm text-black border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#74BF44]/30 focus:border-[#74BF44]/50 bg-white placeholder:text-black text-start ${className}`}
        aria-label={placeholder}
        data-i18n-original={placeholder}
      />
      {showClear && value && (
        <button
          type="button"
          onClick={() => onClear?.()}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        aria-label={clearSearchLabel}
          data-i18n-original="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
