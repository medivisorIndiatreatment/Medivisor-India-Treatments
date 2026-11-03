"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Mail, Check, AlertCircle, Phone, MessageSquare, X } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import { useI18n, useTranslatedStrings } from "@/lib/i18n";
import { Trans } from "@/lib/i18n/Trans";
import { submitContact } from "@/app/api/submit-form/route"

// FIXED: Avoid SSR issues - only import country libs on client
let countryData: { name: string; iso: string; dial: string }[] = [];
let dialCodeMap: Record<string, string> = {};

if (typeof window !== 'undefined') {
  try {
    const countryList = require('country-list');
    const { getCountryCallingCode } = require('libphonenumber-js');
    countryData = countryList.getData()
      .map((c: any) => {
        let dial = '';
        try { dial = `+${getCountryCallingCode(c.code)}`; } catch { dial = ''; }
        return { name: c.name, iso: c.code, dial };
      })
      .filter((c: any) => c.dial)
      .sort((a: any, b: any) => a.name.localeCompare(b.name));

    dialCodeMap = {};
    for (const c of countryData) {
      dialCodeMap[c.dial] = c.iso;
    }
  } catch {
    countryData = [{ name: 'United States', iso: 'US', dial: '+1' }];
  }
}

type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "success"; message: string }
  | { state: "error"; message: string };

interface ContactModalProps {
   isOpen: boolean;
   onClose: () => void;
   serviceTitle?: string | null;
}

export default function ContactModal({ isOpen, onClose, serviceTitle }: ContactModalProps) {
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [isLocating, setIsLocating] = useState(false);
  const router = useRouter();

  const countries = countryData;
  const uniqueDialCodes = useMemo(() => {
    const set = new Set<string>();
    for (const c of countries) set.add(c.dial);
    return Array.from(set).sort((a, b) => Number(a.replace("+", "")) - Number(b.replace("+", "")));
  }, [countries]);

  const defaultCountry = useMemo(() => {
    return countries.find((c) => c.iso === "US") || countries[0] || { name: "United States", iso: "US", dial: "+1" };
  }, [countries]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    countryIso: defaultCountry.iso,
    countryName: defaultCountry.name,
    countryCode: defaultCountry.dial,
    whatsapp: "",
    message: "",
  });

  // FIXED: Update form when defaultCountry loads
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      countryIso: defaultCountry.iso,
      countryName: defaultCountry.name,
      countryCode: defaultCountry.dial,
    }));
  }, [defaultCountry]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const iso = e.target.value;
    const match = countries.find((c) => c.iso === iso);
    if (!match) return;
    setForm((f) => ({ ...f, countryIso: match.iso, countryName: match.name, countryCode: match.dial }));
  };

  const onDialCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((f) => ({ ...f, countryCode: e.target.value }));
  };

const { t: tGlobal } = useI18n();
  const staticStrings = useMemo(
    () => [
      "Close",
      "Enquire Now",
      "Get a free quote for your treatment",
      "Enter your Name",
      "Enter Your Email",
      "Loading...",
      "WhatsApp Number",
      "Tell us about your medical needs...",
      "Min 10 chars",
      "Send Message",
      "Finding Location...",
      "Sending...",
      "Sent!",
      "Response within 24 hours • Secure & Private",
      "Please enter your name.",
      "Please enter a valid email.",
      "Enter a valid country code (e.g., +1, +44, +91).",
      "Enter a valid WhatsApp number (6-15 digits).",
      "Please enter a message.",
      "Message sent! Redirecting...",
      "Something went wrong.",
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
    [staticTranslationMap, tGlobal]
  );
  const validate = () => {
    if (!form.name.trim()) return t("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return t("Please enter a valid email.");
    if (!/^\+\d{1,4}$/.test(form.countryCode)) return t("Enter a valid country code (e.g., +1, +44, +91).");
    if (!/^[0-9]{6,15}$/.test(form.whatsapp)) return t("Enter a valid WhatsApp number (6-15 digits).");
    if (!form.message.trim()) return t("Please enter a message.");
    return null;
  };

  const handleClose = () => {
    setForm({ name: "", email: "", countryIso: defaultCountry.iso, countryName: defaultCountry.name, countryCode: defaultCountry.dial, whatsapp: "", message: "" });
    setStatus({ state: "idle" });
    onClose();
  };

  // FIXED: Geolocation only in browser, with abort controller and timeout
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!("geolocation" in navigator)) { setIsLocating(false); return; }

    const controller = new AbortController();

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (controller.signal.aborted) return;
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            { signal: controller.signal, headers: { 'User-Agent': 'MedivisorApp/1.0' } }
          );
          const data = await response.json();
          const countryCode = data?.address?.country_code?.toUpperCase();
          if (countryCode && countries.length > 0) {
            const detectedCountry = countries.find(c => c.iso === countryCode);
            if (detectedCountry) {
              setForm(f => ({ ...f, countryIso: detectedCountry.iso, countryName: detectedCountry.name, countryCode: detectedCountry.dial }));
            }
          }
        } catch { /* silent */ } finally {
          if (!controller.signal.aborted) setIsLocating(false);
        }
      },
      () => { setIsLocating(false); },
      { timeout: 10000, enableHighAccuracy: false }
    );

    return () => controller.abort();
  }, [countries]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validate();
    if (error) { setStatus({ state: "error", message: error }); return; }
    setStatus({ state: "submitting" });

    try {
      const res = await submitContact({
        name: form.name.trim(),
        email: form.email.trim(),
        countryName: form.countryName,
        countryCode: form.countryCode.startsWith("+") ? form.countryCode : `+${form.countryCode}`,
        whatsapp: form.whatsapp.replace(/\D/g, ""),
        message: form.message.trim(),
      });

      if (res?.ok) {
setStatus({ state: "success", message: t("Message sent! Redirecting...") });
        setTimeout(() => { router.push('/thank-you'); handleClose(); }, 2000);
      } else {
        setStatus({ state: "error", message: t(res?.error || "Something went wrong.") });
      }
    } catch (err: any) {
      setStatus({ state: "error", message: t(err?.message || "Unexpected error. Please try again.") });
    }
  };

  const isSubmitting = status.state === "submitting" || isLocating || status.state === "success";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
<DialogContent className="w-[95vw] max-w-md h-auto mx-auto p-0 bg-white rounded-md shadow-xl border-0 overflow-y-scroll md:overflow-hidden [&>button]:hidden" data-trans-managed="true" data-i18n-html>
        <div className="relative bg-[#23366E] px-4 pt-6 pb-4">
            <button onClick={handleClose} className="absolute top-2 end-2 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-lg border-2 border-[#23366E] text-[#23366E] group" aria-label={t("Close")} data-i18n="contact.close" data-i18n-original="Close" data-trans-managed="true">
            <X className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
          </button>
          <div className="text-center text-white px-4">
            <div className="flex justify-center mb-2">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
            </div>
<DialogTitle className="text-xl font-semibold text-white" data-i18n-original="Enquire Now" data-trans-managed="true">
              {serviceTitle ? `${serviceTitle} - ${t("Enquire Now")}` : t("Enquire Now")}
            </DialogTitle>
            <p className="text-white/70 text-xs mt-1" data-i18n="contact.free-quote" data-i18n-original="Get a free quote for your treatment">
              <Trans id="contact.free-quote">Get a free quote for your treatment</Trans>
            </p>
          </div>
        </div>

        <div className="px-4 pb-4">
          {status.state === 'success' && (
            <div className="bg-green-50 border border-green-200 text-[#29A9B9] px-3 py-2.5 rounded-lg mb-3 text-sm flex items-center">
              <Check className="w-4 h-4 me-2 flex-shrink-0" />
              <span>{status.message}</span>
            </div>
          )}
          {status.state === 'error' && (
            <div className="bg-red-50 border border-red-200 text-[#23366E] px-3 py-2.5 rounded-lg mb-3 text-sm flex items-center">
              <AlertCircle className="w-4 h-4 me-2 flex-shrink-0" />
              <span>{status.message}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-3.5" noValidate>
 <Input id="name" name="name" value={form.name} onChange={onChange} placeholder={t("Enter your Name")} className="h-9 border-gray-300 focus:border-[#29A9b9] focus:ring-[#29A9b9]/20 rounded-md text-sm" data-i18n="contact.name" data-i18n-original="Enter your Name" data-trans-managed="true" />
            <Input id="email" type="email" name="email" value={form.email} onChange={onChange} placeholder={t("Enter Your Email")} className="h-9 border-gray-300 focus:border-[#29A9b9] focus:ring-[#29A9b9]/20 rounded-md text-sm" data-i18n="contact.email" data-i18n-original="Enter Your Email" data-trans-managed="true" />
            <div>
               <select value={form.countryIso} onChange={onCountryChange} className="h-9 w-full rounded-md border border-gray-300 bg-white px-2 pe-8 text-sm focus:border-[#29A9b9] focus:ring-[#29A9b9]/20 appearance-none cursor-pointer">
               {!countries.length && <option value="">{t("Loading...")}</option>}
                 {countries.map((c) => <option key={c.iso} value={c.iso}>{c.name} ({c.dial})</option>)}
               </select>
             </div>
            <div className="flex gap-2">
              <select value={form.countryCode} onChange={onDialCodeChange} className="h-9 w-16 rounded-md border border-gray-300 bg-white px-1 text-sm focus:border-[#29A9b9] focus:ring-[#29A9b9]/20 cursor-pointer">
                {uniqueDialCodes.map((dial) => <option key={dial} value={dial}>{dial}</option>)}
              </select>
<Input id="whatsapp" name="whatsapp" inputMode="numeric" pattern="[0-9]*" value={form.whatsapp} onChange={onChange} placeholder={t("WhatsApp Number")} className="h-9 border-gray-300 focus:border-[#29A9b9] focus:ring-[#29A9b9]/20 rounded-md text-sm flex-1" data-i18n="contact.whatsapp" data-i18n-original="WhatsApp Number" />
            </div>
             <Textarea id="message" name="message" value={form.message} onChange={onChange} placeholder={t("Tell us about your medical needs...")} rows={3} className="border-gray-300 focus:border-[#29A9b9] focus:ring-[#29A9b9]/20 rounded-md resize-none text-sm" data-i18n="contact.message" data-i18n-original="Tell us about your medical needs..." data-trans-managed="true" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
               <span data-i18n="contact.min-chars" data-i18n-original="Min 10 chars"><Trans id="contact.min-chars">Min 10 chars</Trans></span>
              <span className={cn(form.message.length > 500 ? "text-[#23366E] font-medium" : "text-gray-400")}>{form.message.length || 0}/500</span>
            </div>
            <Button type="submit" disabled={isSubmitting} className={cn("w-full h-10 text-white font-medium text-sm rounded-md shadow-md transition-all duration-200", "bg-[#29A9b9] hover:bg-[#23366E] active:scale-[0.98]", "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#29A9b9]")}>
              {isLocating ? <><Loader2 className="me-2 h-4 w-4 animate-spin" /><Trans id="contact.finding-location">Finding Location...</Trans></>
              : status.state === "submitting" ? <><Loader2 className="me-2 h-4 w-4 animate-spin" /><Trans id="contact.sending">Sending...</Trans></>
              : status.state === "success" ? <><Check className="me-2 h-4 w-4" /><Trans id="contact.sent">Sent!</Trans></>
              : <><Mail className="me-2 h-4 w-4" /><span data-i18n="contact.send" data-i18n-original="Send Message"><Trans id="contact.send">Send Message</Trans></span></>}
            </Button>
          </form>
          <div className="text-center pt-1">
            <p className="text-xs text-gray-400" data-i18n="contact.privacy" data-i18n-original="Response within 24 hours • Secure & Private">
              <Trans id="contact.privacy">Response within 24 hours • Secure & Private</Trans>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}