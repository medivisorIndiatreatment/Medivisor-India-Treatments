"use client";

import type React from "react";
import { useMemo, useState, useEffect, useCallback } from "react";
import { DESIGN_TOKENS } from "@/components/design-tokens";
import { useI18n, useTranslatedStrings } from "@/lib/i18n";

// --- Types ---
type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "success"; message: string }
  | { state: "error"; message: string };

type CountryRow = { name: string; iso: string; dial: string };
type ConnectionTab = "medivisor" | "hospital" | "doctor" | "group_hospital";

type SubmissionPayload = {
  connectionType: string;
  name: string;
  email: string;
  countryName: string;
  countryCode: string;
  whatsapp: string;
  message: string;
};

// --- Constants ---
const BUTTON_BG_CLASS = `${DESIGN_TOKENS.TRANSITIONS.BASE} text-gray-700 bg-gray-300 hover:bg-gray-400 focus:ring-1 focus:ring-[#74BF44]/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`;
const TAB_ACTIVE_CLASS = "border-[#74BF44] text-[#241d1f] font-medium";  
const INPUT_BASE_CLASS = `${DESIGN_TOKENS.COMPONENT.INPUT.BASE} h-11 md:h-12`;

// --- Mock Data ---
const MOCK_COUNTRY_DATA: { name: string; code: string; dial: string }[] = [
  { name: "United States", code: "US", dial: "+1" },
  { name: "United Kingdom", code: "GB", dial: "+44" },
  { name: "India", code: "IN", dial: "+91" },
  { name: "Canada", code: "CA", dial: "+1" },
  { name: "Australia", code: "AU", dial: "+61" },
  { name: "Germany", code: "DE", dial: "+49" },
  { name: "Brazil", code: "BR", dial: "+55" },
  { name: "Japan", code: "JP", dial: "+81" },
  { name: "Mexico", code: "MX", dial: "+52" },
  { name: "South Africa", code: "ZA", dial: "+27" },
];

// --- Utility Functions ---
const cn = (...classes: (string | boolean | undefined | null)[]) => 
  classes.filter(Boolean).join(' ');

const submitContact = async (payload: SubmissionPayload) => {
  try {
    const response = await fetch('/api/submit-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    
    if (response.ok && data.ok) {
      return { ok: true };
    } else {
      return { ok: false, error: data.error || 'Submission failed. Please try again.' };
    }
  } catch (error) {
    console.error('Contact form submission error:', error);
    return { ok: false, error: 'Network error. Please check your connection and try again.' };
  }
};

// --- Icons ---
const BuildingIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
    <path d="M9 22v-4h6v4"/>
    <path d="M12 10V6"/>
    <path d="M15 10V6"/>
    <path d="M9 10V6"/>
  </svg>
);

const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const StethoscopeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.8 2.3A1 1 0 1 0 6 4a6.56 6.56 0 0 1 5.5 6v.5a7 7 0 0 0 2 5.5a7 7 0 0 0 5.5 2a7 7 0 0 0 5.5-2a7 7 0 0 0 2-5.5v-.5A6.56 6.56 0 0 1 22 4a1 1 0 1 0 1.2-1.7A9 9 0 0 0 18 0a9 9 0 0 0-5.2 2.3A9 9 0 0 0 7.8.3 9 9 0 0 0 2.6.8 1 1 0 0 0 4.8 2.3Z"/>
    <circle cx="18" cy="16" r="4"/>
  </svg>
);

const UserPlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <line x1="19" x2="19" y1="8" y2="14"/>
    <line x1="22" x2="16" y1="11" y2="11"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

// --- Reusable Components ---
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
  <input className={cn(INPUT_BASE_CLASS, className)} {...props} />
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...props }) => (
  <textarea className={cn(INPUT_BASE_CLASS, "min-h-[120px] resize-y py-3", className)} {...props} />
);

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, children, ...props }) => (
  <button className={cn(
    `${DESIGN_TOKENS.COMPONENT.BUTTON.BASE} ${DESIGN_TOKENS.COMPONENT.BUTTON.PRIMARY} w-full`,
    className
  )} {...props}>
    {children}
  </button>
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className, children, ...props }) => (
  <div className="relative">
    <select className={cn(INPUT_BASE_CLASS, "appearance-none pe-10 cursor-pointer", className)} {...props}>
      {children}
    </select>
    <div className="absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none">
      <ChevronDownIcon />
    </div>
  </div>
);

// --- Main Component ---
export default function ContactForm() {
  const [status, setStatus] = useState<Status>({ state: "idle" });
  // Countries data
  const countries = useMemo<CountryRow[]>(() => 
    MOCK_COUNTRY_DATA.map(c => ({
      name: c.name,
      iso: c.code,
      dial: c.dial,
    })).sort((a, b) => a.name.localeCompare(b.name))
  , []);

  const uniqueDialCodes = useMemo(() => 
    Array.from(new Set(countries.map(c => c.dial)))
      .sort((a, b) => Number(a.replace("+", "")) - Number(b.replace("+", "")))
  , [countries]);

  const defaultCountry = useMemo<CountryRow>(() => 
    countries.find(c => c.iso === "IN") || countries[0] || { name: "India", iso: "IN", dial: "+91" }
  , [countries]);

  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    countryIso: defaultCountry.iso,
    countryName: defaultCountry.name,
    countryCode: defaultCountry.dial,
    whatsapp: "",
    message: "",
  });

  // Auto-detect user country
  useEffect(() => {
    const controller = new AbortController();
    
    const fetchUserCountry = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/', {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data = await response.json();
        const match = countries.find(c => c.iso === data.country_code);
        if (match && !controller.signal.aborted) {
          setForm(prev => ({
            ...prev,
            countryIso: match.iso,
            countryName: match.name,
            countryCode: match.dial,
          }));
        }
      } catch (e) { 
        if ((e as Error).name !== 'AbortError') {
          // Silent fail for other errors
        }
      }
    };
    if (countries.length > 0) fetchUserCountry();
    
    return () => {
      controller.abort();
    };
  }, [countries]);

  // Handlers
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }, []);

  const handleCountryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const iso = e.target.value;
    const match = countries.find(c => c.iso === iso);
    if (match) {
      setForm(f => ({
        ...f,
        countryIso: match.iso,
        countryName: match.name,
        countryCode: match.dial,
      }));
    }
  }, [countries]);

  const handleDialCodeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm(f => ({ ...f, countryCode: e.target.value }));
  }, []);

  // Validation
const { t: tGlobal } = useI18n();
  const staticStrings = useMemo(
    () => [
      "May we help you?",
      "WhatsApp Number (preferred)",
      "Enter digits only (6-15 digits). We'll add your country code.",
      "Sending...",
      "Submit Details",
      "We typically respond within 1 business day.",
      "Enter your full name",
      "Enter your email address",
      "WhatsApp number",
      "Tell us about your query or requirements...",
      "Please enter your full name.",
      "Please enter a valid email address.",
      "Please enter a valid country code (e.g., +1, +44, +91).",
      "Please enter a valid WhatsApp number (6-15 digits).",
      "Please enter a message.",
      "Network error. Please check your connection and try again.",
      "Submission failed. Please try again.",
      "Connect to Medivisor",
      "Request sent successfully! We'll contact you within 1 business day.",
      "Unexpected error. Please try again.",
    ],
    []
  );
  const staticTranslated = useTranslatedStrings(staticStrings);
  const staticTranslationMap = useMemo(() => {
    const map = new Map<string, string>();
    staticStrings.forEach((original, i) => {
      map.set(original, staticTranslated[i] ?? original);
    });
    return map;
  }, [staticStrings, staticTranslated]);
  const t = useCallback(
    (text: string): string => {
      if (!text) return text;
      return staticTranslationMap.get(text) || tGlobal(text);
    },
    [staticTranslationMap, tGlobal],
  );
  const validate = useCallback((): string | null => {
    if (!form.name.trim()) return t("Please enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return t("Please enter a valid email address.");
    if (!/^\+\d{1,4}$/.test(form.countryCode)) return t("Please enter a valid country code (e.g., +1, +44, +91).");
    if (!/^[0-9]{6,15}$/.test(form.whatsapp.replace(/\D/g, ""))) return t("Please enter a valid WhatsApp number (6-15 digits).");
    if (!form.message.trim()) return t("Please enter a message.");
    return null;
  }, [form, t]);

  // Submit
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      setStatus({ state: "error", message: error });
      return;
    }

    setStatus({ state: "submitting" });
    try {
      const payload: SubmissionPayload = {
connectionType: t("Connect to Medivisor"),
        name: form.name.trim(),
        email: form.email.trim(),
        countryName: form.countryName,
        countryCode: form.countryCode,
        whatsapp: form.whatsapp.replace(/\D/g, ""),
        message: form.message.trim(),
      };

      const res = await submitContact(payload);
      if (res.ok) {
setStatus({ state: "success", message: t("Request sent successfully! We'll contact you within 1 business day.") });
        setForm(prev => ({ ...prev, name: "", email: "", whatsapp: "", message: "" }));
      } else {
        setStatus({ state: "error", message: t(res.error || "Submission failed. Please try again.") });
      }
    } catch {
      setStatus({ state: "error", message: t("Network error. Please check your connection and try again.") });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto" data-trans-managed="true" data-i18n-html>
      <div className={`${DESIGN_TOKENS.COMPONENT.CARD.BASE }  border border-[#23366E] rounded-lg shadow-lg overflow-hidden`}>
        {/* Heading */}
        <div className={`px-4 md:px-6 py-3 md:py-4 border-b ${DESIGN_TOKENS.BACKGROUNDS.PRIMARY} border-gray-200 text-white`}>
          <h2 className={`${DESIGN_TOKENS.TYPOGRAPHY.H5} text-center text-${DESIGN_TOKENS.COLORS.WHITE}`} data-i18n="contact.heading" data-i18n-original="May we help you?" data-trans-managed="true">
            {t("May we help you?")}
          </h2>
        </div>

        {/* Form */}
        <div className="p-4 md:p-6">
          <form onSubmit={onSubmit} className={`space-y-4 md:space-y-5`} noValidate>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
placeholder={t("Enter your full name")}
              required
              disabled={status.state === "submitting"}
               data-i18n="contact.name"
               data-i18n-original="Enter your full name"
               data-trans-managed="true"
            />

            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
placeholder={t("Enter your email address")}
              required
              disabled={status.state === "submitting"}
               data-i18n="contact.email"
               data-i18n-original="Enter your email address"
               data-trans-managed="true"
            />

            <div className="space-y-2">
              <label className={DESIGN_TOKENS.TYPOGRAPHY.LABEL} htmlFor="whatsapp" data-i18n="contact.whatsapp-label" data-i18n-original="WhatsApp Number (preferred)" data-trans-managed="true">
                {t("WhatsApp Number (preferred)")}
              </label>

              <div className="flex gap-2">
                  <Select
                    value={form.countryCode}
                    onChange={handleDialCodeChange}
                    className="w-24 flex-shrink-0 h-11 md:h-10"
                    disabled={status.state === "submitting"}
                  >
                    {uniqueDialCodes.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </Select>

                  <Input
id="whatsapp"
                    name="whatsapp"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={form.whatsapp}
                    onChange={handleChange}
                     placeholder={t("WhatsApp number")}
                    className="flex-1 h-11 md:h-10"
                    disabled={status.state === "submitting"}
                     data-i18n="contact.whatsapp"
                     data-i18n-original="WhatsApp number"
                     data-trans-managed="true"
                   />
            
              </div>
              <p className={DESIGN_TOKENS.TYPOGRAPHY.CAPTION} data-i18n="contact.digits-only" data-i18n-original="Enter digits only (6-15 digits). We'll add your country code." data-trans-managed="true">
                {t("Enter digits only (6-15 digits). We'll add your country code.")}
              </p>
            </div>

<Textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder={t("Tell us about your query or requirements...")}
                rows={3}
                className="border-gray-300 focus:border-[#29A9b9] focus:ring-[#29A9b9]/20 rounded-md resize-y text-sm"
                 disabled={status.state === "submitting"}
                 data-i18n="contact.message"
                 data-i18n-original="Tell us about your query or requirements..."
                 data-trans-managed="true"
              />

            <div className="space-y-2 pt-1">
       <Button
         className="font-normal h-11 md:h-12 text-sm md:text-base"
         type="submit"
         disabled={status.state === "submitting"}
         data-trans-managed="true"
       >
        {status.state === "submitting" ? (
          t("Sending...")
        ) : (
          t("Submit Details")
        )}
      </Button>

              {status.state !== "idle" && (
                <p className={cn(
                  "text-sm text-center p-3 rounded-md",
                  status.state === "success" && "bg-green-50 text-green-700",
                  status.state === "error" && "bg-red-50 text-red-600"
)} role="status" aria-live="polite" data-trans-managed="true">
                  {status.state === "success" || status.state === "error" 
                    ? status.message 
                    : t("We typically respond within 1 business day.")}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Global Styles for consistent typography */}
      
    </div>
  );
}