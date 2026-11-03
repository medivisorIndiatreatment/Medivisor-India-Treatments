"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { DESIGN_TOKENS } from "@/components/design-tokens";
import { useTranslatedStrings } from "@/lib/i18n";
import {
  schedule,
  getLocationById,
  getTimeSlotsForDate,
  formatDateFriendly,
  formatScheduleDetails,
} from "@/lib/schedule";

type Status =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "success"; message: string }
  | { state: "error"; message: string };

type CountryRow = { name: string; iso: string; dial: string };

function getDialCodeForLocation(id: string): string {
  const map: Record<string, string> = {
    png: "+675",
    slb: "+677",
    vut: "+678",
    fji: "+679",
  };
  return map[id] || "+675";
}

const COUNTRY_DIAL_CODES: {
  iso: string;
  dial: string;
  flag: string;
  label: string;
}[] = [
  { iso: "PG", dial: "+675", flag: "🇵🇬", label: "Papua New Guinea" },
  { iso: "IN", dial: "+91", flag: "🇮🇳", label: "India" },
  { iso: "FJ", dial: "+679", flag: "🇫🇯", label: "Fiji" },
  { iso: "VU", dial: "+678", flag: "🇻🇺", label: "Vanuatu" },
  { iso: "SB", dial: "+677", flag: "🇸🇧", label: "Solomon Islands" },
  { iso: "WS", dial: "+685", flag: "🇼🇸", label: "Samoa" },
  { iso: "TO", dial: "+676", flag: "🇹🇴", label: "Tonga" },
  { iso: "AU", dial: "+61", flag: "🇦🇺", label: "Australia" },
  { iso: "NZ", dial: "+64", flag: "🇳🇿", label: "New Zealand" },
  { iso: "SG", dial: "+65", flag: "🇸🇬", label: "Singapore" },
  { iso: "MY", dial: "+60", flag: "🇲🇾", label: "Malaysia" },
  { iso: "TH", dial: "+66", flag: "🇹🇭", label: "Thailand" },
  { iso: "PH", dial: "+63", flag: "🇵🇭", label: "Philippines" },
  { iso: "KH", dial: "+855", flag: "🇰🇭", label: "Cambodia" },
  { iso: "BN", dial: "+673", flag: "🇧🇳", label: "Brunei" },
  { iso: "LK", dial: "+94", flag: "🇱🇰", label: "Sri Lanka" },
  { iso: "BD", dial: "+880", flag: "🇧🇩", label: "Bangladesh" },
  { iso: "NP", dial: "+977", flag: "🇳🇵", label: "Nepal" },
  { iso: "ID", dial: "+62", flag: "🇮🇩", label: "Indonesia" },
  { iso: "VN", dial: "+84", flag: "🇻🇳", label: "Vietnam" },
  { iso: "MM", dial: "+95", flag: "🇲🇲", label: "Myanmar" },
  { iso: "US", dial: "+1", flag: "🇺🇸", label: "United States" },
  { iso: "GB", dial: "+44", flag: "🇬🇧", label: "United Kingdom" },
  { iso: "CA", dial: "+1", flag: "🇨🇦", label: "Canada" },
  { iso: "DE", dial: "+49", flag: "🇩🇪", label: "Germany" },
  { iso: "FR", dial: "+33", flag: "🇫🇷", label: "France" },
  { iso: "IT", dial: "+39", flag: "🇮🇹", label: "Italy" },
  { iso: "ES", dial: "+34", flag: "🇪🇸", label: "Spain" },
  { iso: "NL", dial: "+31", flag: "🇳🇱", label: "Netherlands" },
];

function getCountryByDial(dial: string): { iso: string; dial: string; flag: string; label: string } {
  return COUNTRY_DIAL_CODES.find((c) => c.dial === dial) || COUNTRY_DIAL_CODES[0];
}

function formatDayDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function RegistrationForm({ isEventClosed = false }: { isEventClosed?: boolean }) {
  const [translatedValidationMessages] = useTranslatedStrings([
    "Please enter your name.",
    "Please enter a valid email.",
    "Enter a valid country code (e.g., +1, +44, +91).",
    "Enter a valid WhatsApp number (6-15 digits).",
    "Please select a date.",
    "Please select a time slot.",
    "Please enter your message.",
    "Something went wrong. Please try again.",
    "Unexpected error. Please try again.",
    "Please Select a preferred venue.",
  ]);

  const staticTexts = useMemo(
    () => [
      "Full Name",
      "Email Address",
      "Country",
      "Country Code",
      "WhatsApp Number",
      "Preferred Visit Location",
      "Preferred Venue",
      "Preferred Date",
      "Preferred Time Slot",
      "Medical Condition / Requirements",
      "Register Now",
      "Sending...",
      "Enter your full name",
      "Enter your email address",
      "Select a location",
      "Select a preferred date",
      "Select a time slot",
      "Tell us about your condition...",
      "Enter your WhatsApp number",
      "No dates available",
      "No time slots available",
      "REGISTRATION",
      "Select your preferred date, time and place to request an appointment.",
      "Select a preferred venue",
    ],
    [],
  );
  const [translatedStatic] = useTranslatedStrings(staticTexts);
  const staticMap = useMemo(() => {
    const map = new Map<string, string>();
    staticTexts.forEach((s, i) => map.set(s, translatedStatic[i] ?? s));
    return map;
  }, [translatedStatic]);
  const tStatic = (text: string): string => staticMap.get(text) ?? text;
  const labelText = (text: string): string => {
    const translated = staticMap.get(text);
    return translated && translated.trim().length > 1 ? translated : text;
  };

  const [status, setStatus] = useState<Status>({ state: "idle" });

  const countries = useMemo<CountryRow[]>(() => {
    return schedule.map((loc) => ({
      name: loc.label,
      iso: loc.id.toUpperCase(),
      dial: getDialCodeForLocation(loc.id),
    }));
  }, []);

  const uniqueDialCodes = useMemo(() => {
    return countries.map((c) => c.dial);
  }, [countries]);

  const locationOptions = useMemo(() => {
    return schedule.map((loc) => ({
      value: loc.id,
      label: `${loc.label.trim()} (${loc.city})`,
    }));
  }, []);

  const defaultCountry = useMemo<CountryRow>(() => {
    const firstLoc = schedule[0];
    return {
      name: firstLoc.label,
      iso: firstLoc.id.toUpperCase(),
      dial: getDialCodeForLocation(firstLoc.id),
    };
  }, []);

  const [selectedLocationId, setSelectedLocationId] = useState<string>(
    locationOptions[0]?.value || "",
  );
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(-1);

  const selectedLocation = useMemo(() => {
    return getLocationById(selectedLocationId as any);
  }, [selectedLocationId]);

  const venueOptions = useMemo(() => {
    if (!selectedLocation) return [];
    const seen = new Set<string>();
    const options: { value: string; label: string }[] = [];
    selectedLocation.dates.forEach((_, i) => {
      const venue = selectedLocation.venues[i] || "";
      if (venue && !seen.has(venue)) {
        seen.add(venue);
        options.push({ value: venue, label: venue });
      }
    });
    return options;
  }, [selectedLocation]);

  const [form, setForm] = useState<{
    name: string;
    email: string;
    countryIso: string;
    countryName: string;
    countryCode: string;
    whatsapp: string;
    location: string;
    venue: string;
    dateIndex: number;
    timeSlot: string;
    message: string;
  }>({
    name: "",
    email: "",
    countryIso: defaultCountry?.iso || "PG",
    countryName: defaultCountry?.name || "Papua New Guinea",
    countryCode: defaultCountry?.dial || "+675",
    whatsapp: "",
    location: locationOptions[0]?.value || "",
    venue: "",
    dateIndex: -1,
    timeSlot: "",
    message: "",
  });

  const availableDates = useMemo(() => {
    if (!selectedLocation) return [];
    const labels = formatScheduleDetails(selectedLocation);
    return selectedLocation.dates.map((date, index) => ({
      index,
      label: labels[index] || formatDateFriendly(date),
      dropdownLabel: formatDayDate(date),
      iso: date,
      time: selectedLocation.times[index] || "",
      venue: selectedLocation.venues[index] || "",
    }));
  }, [selectedLocation]);

  const venueFilteredDates = useMemo(() => {
    if (!form.venue) return availableDates;
    return availableDates.filter((d) => d.venue === form.venue);
  }, [availableDates, form.venue]);

  const availableTimeSlots = useMemo(() => {
    if (!selectedLocation || selectedDateIndex < 0 || availableDates.length === 0) return [];
    const slots = getTimeSlotsForDate(selectedLocation, selectedDateIndex);
    return slots.map((slot) => ({
      value: slot.displayTime,
      label: slot.displayTime,
      available: slot.isAvailable,
    }));
  }, [selectedLocation, selectedDateIndex, availableDates]);

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locId = e.target.value as string;
    const locObj = schedule.find((loc) => loc.id === locId);
    const newDial = locObj ? getDialCodeForLocation(locId) : form.countryCode;
    const newIso = locObj ? locId.toUpperCase() : form.countryIso;
    const newName = locObj ? locObj.label : form.countryName;
    const countryByDial = getCountryByDial(newDial);
    setSelectedLocationId(locId);
    setSelectedDateIndex(-1);
    setForm((f) => ({
      ...f,
      location: locId,
      venue: "",
      dateIndex: -1,
      timeSlot: "",
      countryCode: newDial,
      countryIso: countryByDial.iso,
      countryName: newName,
    }));
  };

  const onCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = COUNTRY_DIAL_CODES.find((c) => c.dial === e.target.value);
    if (selected) {
      setForm((f) => ({
        ...f,
        countryCode: selected.dial,
        countryIso: selected.iso,
        countryName: selected.label,
      }));
    }
  };

  const onVenueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const venue = e.target.value;
    const firstMatchingIndex = availableDates.findIndex(
      (d) => d.venue === venue,
    );
    const nextDateIndex = firstMatchingIndex >= 0 ? firstMatchingIndex : -1;
    setForm((f) => ({
      ...f,
      venue,
      dateIndex: nextDateIndex,
      timeSlot: "",
    }));
    setSelectedDateIndex(nextDateIndex);
  };

  const onDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dateIndex = Number(e.target.value);
    setSelectedDateIndex(dateIndex);
    setForm((f) => ({ ...f, dateIndex, timeSlot: "" }));
  };

  const onTimeSlotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((f) => ({ ...f, timeSlot: e.target.value }));
  };

  const validate = (): string | null => {
    if (!form.name.trim()) return translatedValidationMessages[0];
    if (
      !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(
        form.email,
      )
    )
      return translatedValidationMessages[1];
    if (!/^\+\d{1,4}$/.test(form.countryCode))
      return translatedValidationMessages[2];
    if (!/^[0-9]{6,15}$/.test(form.whatsapp))
      return translatedValidationMessages[3];
    if (!form.venue) return translatedValidationMessages[9];
    if (venueFilteredDates.length === 0) return translatedValidationMessages[4];
    if (!form.timeSlot) return translatedValidationMessages[5];
    if (!form.message.trim()) return translatedValidationMessages[6];
    return null;
  };

  const getSelectedDateLabel = () => {
    const found = venueFilteredDates.find((d) => d.index === form.dateIndex);
    return found?.label || "";
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      setStatus({ state: "error", message: error });
      return;
    }
    setStatus({ state: "submitting" });
    try {
      const countryCodeNormalized = form.countryCode.startsWith("+")
        ? form.countryCode
        : `+${form.countryCode}`;
      const whatsappNormalized = form.whatsapp.replace(/\D/g, "");

      const selectedLocationObj = schedule.find(
        (loc) => loc.id === form.location,
      );
      const locationName = selectedLocationObj?.label.trim() || form.location;
      const venueName = form.venue || "Not selected";
      const dateLabel = getSelectedDateLabel();
      const timeLabel = form.timeSlot || "Not selected";

      const fullMessage = `[Pacific Patient Meet]\nLocation: ${locationName}\nVenue: ${venueName}\nDate: ${dateLabel}\nTime Slot: ${timeLabel}\n\n${form.message.trim()}`;

      const response = await fetch("/api/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          countryName: form.countryName,
          countryCode: countryCodeNormalized,
          whatsapp: whatsappNormalized,
          message: fullMessage,
        }),
      });

      const res = await response.json();

      if (res?.ok) {
        setStatus({
          state: "success",
          message:
            "Registration successful! We'll contact you within 1 business day to confirm your appointment.",
        });
        window.location.href = "/thank-you";
      } else {
        setStatus({
          state: "error",
          message: res?.error || translatedValidationMessages[7],
        });
      }
    } catch (err: any) {
      setStatus({
        state: "error",
        message: translatedValidationMessages[8],
      });
    }
  };

  const inputBase = `${DESIGN_TOKENS.COMPONENT.INPUT.BASE} h-10 text-sm placeholder:text-sm placeholder:font-normal`;
  const selectBase = `${DESIGN_TOKENS.COMPONENT.INPUT.BASE} h-10 appearance-none text-sm`;
  const labelBase = `text-sm font-medium text-gray-700 mb-1 block`;

  if (isEventClosed) {
    return (
      <div className="space-y-3 text-sm" role="status" aria-live="polite">
        <div
          className={cn(
            DESIGN_TOKENS.COMPONENT.CARD.PADDING,
            "text-center py-8",
          )}
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="mt-4 text-lg font-medium text-gray-900">
            Registration for this event is now closed.
          </p>
          <p className="mt-2 text-gray-600">
            Please check back for future events or contact us for more information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 text-sm" >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="name" className={labelBase}>
            {labelText("Full Name")}
          </Label>
          <Input
            id="name"
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder={tStatic("Enter your full name")}
            required
            disabled={status.state === "submitting"}
            className={inputBase}
            data-trans-managed="true"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="email" className={labelBase}>
            {labelText("Email Address")}
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            placeholder={tStatic("Enter your email address")}
            required
            disabled={status.state === "submitting"}
            className={inputBase}
            data-trans-managed="true"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="whatsapp" className={labelBase}>
          {labelText("WhatsApp Number")}
        </Label>
        <div className="flex rounded-lg border border-gray-300 bg-white transition-all focus-within:ring-2 focus-within:ring-[#23366E]/20 focus-within:border-[#23366E]">
          <div className="relative w-40 lg:w-32">
            <select
              id="countryCode"
              name="countryCode"
              value={form.countryCode}
              onChange={onCountryCodeChange}
              className={`${selectBase} rounded-r-none border-r border-gray-200 bg-gray-50 pr-8 text-gray-700`}
              disabled={status.state === "submitting"}
            >
              {COUNTRY_DIAL_CODES.map((c) => (
                <option key={c.iso} value={c.dial}>
                  {c.flag} {c.dial}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>
          <Input
            id="whatsapp"
            name="whatsapp"
            inputMode="numeric"
            pattern="[0-9]*"
            value={form.whatsapp}
            onChange={onChange}
            placeholder={tStatic("Enter your WhatsApp number")}
            required
            disabled={status.state === "submitting"}
            className={`${DESIGN_TOKENS.COMPONENT.INPUT.BASE} h-10 rounded-l-none border-none focus:ring-0 focus:border-none shadow-none text-sm`}
            data-trans-managed="true"
          />
        </div>
        <p className={`text-xs text-gray-500 ml-1`}>
          Digits only (6-15 digits). We&apos;ll combine it with the selected
          code.
        </p>
      </div>

      {/* Separate dropdown inputs: Venue, Date, Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="venue" className={labelBase}>
            {labelText("Preferred Venue")}
          </Label>
          <div className="relative">
            <select
              id="venue"
              name="venue"
              value={form.venue}
              onChange={onVenueChange}
              className={`${selectBase} pr-10 disabled:bg-gray-50 disabled:text-gray-500`}
              disabled={
                venueOptions.length === 0 || status.state === "submitting"
              }
              data-trans-managed="true"
            >
              <option value="">{tStatic("Select a preferred venue")}</option>
              {venueOptions.length === 0 ? (
                <option value="" disabled>{tStatic("No dates available")}</option>
              ) : (
                venueOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              )}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="dateIndex" className={labelBase}>
            {labelText("Preferred Date")}
          </Label>
          <div className="relative">
            <select
              id="dateIndex"
              name="dateIndex"
              value={form.dateIndex}
              onChange={onDateChange}
              disabled={
                !form.venue ||
                venueFilteredDates.length === 0 ||
                status.state === "submitting"
              }
              className={`${selectBase} pr-10 disabled:bg-gray-50 disabled:text-gray-500`}
            >
              <option value="-1">{tStatic("Select a preferred date")}</option>
              {venueFilteredDates.length === 0 ? (
                <option value="" disabled>{tStatic("No dates available")}</option>
              ) : (
                venueFilteredDates.map((date) => (
                  <option key={date.index} value={date.index}>
                    {date.dropdownLabel}
                  
                  </option>
                ))
              )}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="timeSlot" className={labelBase}>
          {labelText("Preferred Time Slot")}
        </Label>
        <div className="relative">
          <select
            id="timeSlot"
            name="timeSlot"
            value={form.timeSlot}
            onChange={onTimeSlotChange}
            disabled={
              availableTimeSlots.length === 0 || status.state === "submitting"
            }
            className={`${selectBase} pr-10 disabled:bg-gray-50 disabled:text-gray-500`}
          >
              <option value="">{tStatic("Select a preferred time slot")}</option>
              {availableTimeSlots.length === 0 ? (
                <option value="" disabled>{tStatic("No time slots available")}</option>
              ) : (
                availableTimeSlots.map((slot) => (
                  <option
                    key={slot.value}
                    value={slot.value}
                    disabled={!slot.available}
                  >
                    {slot.label} {!slot.available ? "(Unavailable)" : ""}
                  </option>
                ))
              )}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="message" className={labelBase}>
          {labelText("Medical Condition / Requirements")}
        </Label>
        <Textarea
          id="message"
          name="message"
          value={form.message}
          onChange={onChange}
          placeholder={tStatic("Tell us about your condition...")}
          rows={3}
          required
          disabled={status.state === "submitting"}
          className={`${DESIGN_TOKENS.COMPONENT.INPUT.BASE} resize-y text-sm`}
          data-trans-managed="true"
        />
      </div>

      <div className="pt-0.5">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          className="w-full"
          disabled={status.state === "submitting"}
          data-trans-managed="true"
        >
          {status.state === "submitting" ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="h-4 w-4 animate-spin text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {tStatic("Sending...")}
            </span>
          ) : (
            tStatic("REGISTER")
          )}
        </Button>

        {status.state !== "idle" && (
          <p
            className={cn(
              `text-xs text-center mt-2 font-medium`,
              status.state === "success" ? "text-emerald-700" : "text-red-600",
            )}
            role="status"
            aria-live="polite"
          >
            {status.state === "success" || status.state === "error"
              ? status.message
              : null}
          </p>
        )}
      </div>
    </form>
  );
}
