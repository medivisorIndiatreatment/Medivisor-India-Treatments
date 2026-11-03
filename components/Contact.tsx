"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { submitContact } from "@/app/api/submit-form/route"
import countryList from "country-list"
import { getCountryCallingCode } from "libphonenumber-js"
import { DESIGN_TOKENS } from "@/components/design-tokens"
import { MapPin } from "lucide-react"
import { Trans } from "@/lib/i18n/Trans";
import { useI18n, useTranslatedStrings } from "@/lib/i18n";

type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "success"; message: string }
  | { state: "error"; message: string }

type CountryRow = { name: string; iso: string; dial: string }

export default function ContactForm() {
  const { t } = useI18n();
  const [translatedValidationMessages] = useTranslatedStrings([
    "Please enter your name.",
    "Please enter a valid email.",
    "Enter a valid country code (e.g., +1, +44, +91).",
    "Enter a valid WhatsApp number (6-15 digits).",
    "Please enter a message.",
    "Something went wrong. Please try again.",
    "Unexpected error. Please try again.",
  ]);
  const staticTexts = useMemo(
    () => [
      "Jane Doe",
      "jane@example.com",
      "5551234567",
      "How can we help you?",
      "Country",
      "Country code",
      "WhatsApp number",
      "Medivisor House Location Map",
    ],
    []
  );
  const [translatedStatic] = useTranslatedStrings(staticTexts);
  const staticMap = useMemo(() => {
    const map = new Map<string, string>();
    staticTexts.forEach((s, i) => map.set(s, translatedStatic[i] ?? s));
    return map;
  }, [staticTexts, translatedStatic]);
  const tStatic = (text: string): string => staticMap.get(text) ?? text;

  const [status, setStatus] = useState<Status>({ state: "idle" })

  // Build country dataset and helpers (client-side)
   const countries = useMemo<CountryRow[]>(() => {
      const base = (countryList as any).getData()
        .map((c:any) => {
          let dial = ""
          try {
            dial = `+${getCountryCallingCode(c.code)}`
          } catch {
            dial = ""
          }
          return { name: c.name, iso: c.code, dial }
        })
        .filter((c:any) => c.dial)
       .sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name));
      return base
    }, [])

  const uniqueDialCodes = useMemo(() => {
    const set = new Set<string>()
    for (const c of countries) set.add(c.dial)
    return Array.from(set).sort((a, b) => Number(a.replace("+", "")) - Number(b.replace("+", "")))
  }, [countries])

  const defaultCountry = useMemo<CountryRow>(() => {
    return countries.find((c) => c.iso === "US") || countries[0] || { name: "United States", iso: "US", dial: "+1" }
  }, [countries])

  const [form, setForm] = useState({
    name: "",
    email: "",
    countryIso: defaultCountry?.iso || "US",
    countryName: defaultCountry?.name || "United States",
    countryCode: defaultCountry?.dial || "+1",
    whatsapp: "",
    message: "",
  })

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const onCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const iso = e.target.value
    const match = countries.find((c) => c.iso === iso)
    if (!match) return
    setForm((f) => ({
      ...f,
      countryIso: match.iso,
      countryName: match.name,
      countryCode: match.dial, // sync dial code with selected country
    }))
  }

  const onDialCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dial = e.target.value
    setForm((f) => ({ ...f, countryCode: dial }))
  }

  const validate = () => {
if (!form.name.trim()) return translatedValidationMessages[0]
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return translatedValidationMessages[1]
    if (!/^\+\d{1,4}$/.test(form.countryCode)) return translatedValidationMessages[2]
    if (!/^[0-9]{6,15}$/.test(form.whatsapp)) return translatedValidationMessages[3]
    if (!form.message.trim()) return translatedValidationMessages[4]
    return null
  }

const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const error = validate();
  if (error) {
    setStatus({ state: "error", message: error });
    return;
  }
  setStatus({ state: "submitting" });
  try {
    const countryCodeNormalized = form.countryCode.startsWith("+") ? form.countryCode : `+${form.countryCode}`;
    const whatsappNormalized = form.whatsapp.replace(/\D/g, "");
    
    const res = await submitContact({
      name: form.name.trim(),
      email: form.email.trim(),
      countryName: form.countryName,
      countryCode: countryCodeNormalized,
      whatsapp: whatsappNormalized,
      message: form.message.trim(),
    });
    
    if (res?.ok) {
      // Redirect to the thank you page
      window.location.href = '/thank-you';
    } else {
setStatus({ state: "error", message: res?.error || translatedValidationMessages[5] });
     }
   } catch (err: any) {
     setStatus({ state: "error", message: err?.message || translatedValidationMessages[6] });
  }
};

  return (
    <section className="bg-gray-50 py-12 md:py-16">
      <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8 items-start">
          {/* Left Section: Company Info & Map (spans 2 columns on large screens) */}
          <aside className="lg:col-span-2 space-y-6">
            {/* Company Info Card - Updated theme */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
<h3 className="text-xl font-bold text-gray-900 mb-3" data-i18n="contact.address-title" data-i18n-original="Our Office Address">
                <Trans id="contact.address-title">Our Office Address</Trans>
              </h3>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#29A9B9] flex-shrink-0 mt-0.5" />
                <p className={`${DESIGN_TOKENS.TYPOGRAPHY.BODY_BASE} text-gray-700 leading-relaxed`} data-i18n="contact.address" data-i18n-original="Medivisor House 359, Sector 1, Vaishali, Ghaziabad, (Delhi/NCR) India">
                  <Trans id="contact.address">Medivisor House 359, Sector 1, Vaishali, Ghaziabad, (Delhi/NCR) India</Trans>
                </p>
              </div>
            </div>
            {/* Embedded Map Card - Same place as info */}
            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm min-h-[200px] md:min-h-[480px] bg-white">
<iframe
                 src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.8047131916287!2d77.33048667550091!3d28.635614475663065!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfb00e7555807%3A0x6dee23139fc9b750!2sMedivisor%20House!5e0!3m2!1sen!2sin!4v1747405592425!5m2!1sen!2sin"
                 className="w-full h-full"
                 loading="lazy"
                 title={tStatic("Medivisor House Location Map")}
                 allowFullScreen
                 allow="geolocation; picture-in-picture"
                 style={{ minHeight: '480px' }}
               />
            </div>
          </aside>

          {/* Right Section: Form (spans 1 column) */}
          <main className="lg:col-span-1 w-full">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="p-4 md:p-5 border-b border-gray-100">
<h3 className="text-xl md:text-2xl font-medium text-gray-900" data-i18n="contact.form-title" data-i18n-original="How can we help you?">
                  <Trans id="contact.form-title">How can we help you?</Trans>
                </h3>
              </div>
              <div className="p-4 md:p-6">
                <form onSubmit={onSubmit} className="space-y-5" noValidate>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
<Label htmlFor="name" className="text-sm font-medium text-gray-700" data-i18n="contact.label-name" data-i18n-original="Full name">
                        <Trans id="contact.label-name">Full name</Trans>
                      </Label>
                      <Input className="border-gray-300 focus:border-[#29A9B9] focus:ring-[#29A9B9]" id="name" name="name" value={form.name} onChange={onChange} placeholder={tStatic("Jane Doe")} required data-i18n="contact.name" data-i18n-original="Jane Doe" data-trans-managed="true" />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700" data-i18n="contact.label-email" data-i18n-original="Email">
                        <Trans id="contact.label-email">Email</Trans>
                      </Label>
                      <Input
                        className="border-gray-300 focus:border-[#29A9B9] focus:ring-[#29A9B9]"
                        id="email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={onChange}
placeholder={tStatic("jane@example.com")}
                        required
                        data-i18n="contact.email" data-i18n-original="jane@example.com" data-trans-managed="true"
                      />
                    </div>

                    <div className="grid">
<Label className="text-sm font-medium text-gray-700" data-i18n="contact.label-country" data-i18n-original="Country and Code">
                        <Trans id="contact.label-country">Country and Code</Trans>
                      </Label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <select
                          aria-label={tStatic("Country")}
                          value={form.countryIso}
                          onChange={onCountryChange}
                          className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#29A9B9] focus:border-transparent"
                        >
                          {countries.map((c) => (
                            <option key={c.iso} value={c.iso}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                        <select
aria-label={tStatic("Country code")}
                          value={form.countryCode}
                          onChange={onDialCodeChange}
                          className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#29A9B9] focus:border-transparent"
                        >
                          {uniqueDialCodes.map((dial) => (
                            <option key={dial} value={dial}>
                              {dial}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-2">
<Label htmlFor="whatsapp" className="text-sm font-medium text-gray-700" data-i18n="contact.label-whatsapp" data-i18n-original="WhatsApp">
                        <Trans id="contact.label-whatsapp">WhatsApp</Trans>
                      </Label>
                      <div className="flex gap-x-3">
                        <select
                          aria-label={tStatic("Country code")}
                          value={form.countryCode}
                          onChange={onDialCodeChange}
                          className="h-10 w-24 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#29A9B9] focus:border-transparent"
                        >
                          {uniqueDialCodes.map((dial) => (
                            <option key={dial} value={dial}>
                              {dial}
                            </option>
                          ))}
                        </select>
                        <Input
                          className="border-gray-300 focus:border-[#29A9B9] focus:ring-[#29A9B9]"
                          id="whatsapp"
                          name="whatsapp"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={form.whatsapp}
                          onChange={onChange}
placeholder={tStatic("5551234567")}
                          aria-label={tStatic("WhatsApp number")}
                          data-i18n="contact.whatsapp" data-i18n-original="5551234567" data-trans-managed="true"
                        />
                      </div>
                      <p className="text-xs text-gray-500" data-i18n="contact.whatsapp-hint" data-i18n-original="Enter digits only. We'll combine it with the selected code.">
                        <Trans id="contact.whatsapp-hint">Enter digits only. We'll combine it with the selected code.</Trans>
                      </p>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="message" className="text-sm font-medium text-gray-700" data-i18n="contact.label-message" data-i18n-original="Message">
                        <Trans id="contact.label-message">Message</Trans>
                      </Label>
                      <Textarea
                        className="border-gray-300 focus:border-[#29A9B9] focus:ring-[#29A9B9]"
                        id="message"
                        name="message"
                        value={form.message}
                        onChange={onChange}
placeholder={tStatic("How can we help you?")}
                        rows={5}
                        required
                         data-i18n="contact.message" data-i18n-original="How can we help you?" data-trans-managed="true"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      type="submit"
                      disabled={status.state === "submitting"}
className="w-full bg-[#29A9B9] hover:bg-[#1F8A96] text-white font-medium py-2 px-4 rounded-md shadow-sm transition-all duration-300"
                       data-trans-managed="true"
                    >
                      {status.state === "submitting" ? (
                        <Trans id="contact.sending">Sending…</Trans>
                      ) : (
                        <Trans id="contact.send-message">Send message</Trans>
                      )}
                    </Button>
                    <p
                      className={cn(
                        "text-sm",
                        status.state === "success"
                          ? "text-green-600"
                          : status.state === "error"
                            ? "text-red-600"
                            : "text-gray-500",
                      )}
                      role="status"
                      aria-live="polite"
                    >
                      {status.state === "success" || status.state === "error" ? status.message : null}
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </section>
  )
}
