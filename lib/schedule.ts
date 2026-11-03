// schedule.ts
export type LocationId = "png";

export type ScheduleLocation = {
  id: LocationId;
  label: string;
  country: string;
  city: string;
  dates: string[];
  times: string[];
  venues: string[];
  feeLabel: string;
  localContact?: string;
  availableSlots?: TimeSlot[][];
  isEventClosed?: boolean;
};

export type TimeSlot = {
  time: string;
  displayTime: string;
  isAvailable: boolean;
};

export const schedule: ScheduleLocation[] = [
  {
    id: "png",
    label: "Papua New Guinea",
    country: "Papua New Guinea",
    city: "Port Moresby & Lae",
    dates: [
      "2026-09-22",
      "2026-09-23",
      "2026-09-24",
      "2026-09-25",
      "2026-09-26",
    ],
    times: [
      "4 PM to 6 PM",
      "4 PM to 6 PM",
      "4 PM to 6 PM",
      "1 PM to 7 PM",
      "11 AM to 7 PM",
    ],
    venues: [
      "Hotel Crown, Port Moresby",
      "Hotel Crown, Port Moresby",
      "Hotel Crown, Port Moresby",
      "Hotel Huon Gulf, Lae",
      "Hotel Crown, Port Moresby",
    ],
    feeLabel: "PGK 150",
    localContact: "Shirley Waira - +675 7437 6546",
    availableSlots: [
      [
        { time: "16:00", displayTime: "4:00 PM to 5:00 PM", isAvailable: false },
        { time: "17:00", displayTime: "5:00 PM to 6:00 PM", isAvailable: false },
      ],
      [
        { time: "16:00", displayTime: "4:00 PM to 5:00 PM", isAvailable: false },
        { time: "17:00", displayTime: "5:00 PM to 6:00 PM", isAvailable: false },
      ],
      [
        { time: "16:00", displayTime: "4:00 PM to 5:00 PM", isAvailable: false },
        { time: "17:00", displayTime: "5:00 PM to 6:00 PM", isAvailable: false },
      ],
      [
        { time: "13:00", displayTime: "1:00 PM to 2:00 PM", isAvailable: false },
        { time: "14:00", displayTime: "2:00 PM to 3:00 PM", isAvailable: false },
        { time: "15:00", displayTime: "3:00 PM to 4:00 PM", isAvailable: false },
        { time: "16:00", displayTime: "4:00 PM to 5:00 PM", isAvailable: false },
        { time: "17:00", displayTime: "5:00 PM to 6:00 PM", isAvailable: false },
        { time: "18:00", displayTime: "6:00 PM to 7:00 PM", isAvailable: false },
      ],
      [
        {
          time: "11:00",
          displayTime: "11:00 AM to 12:00 PM",
          isAvailable: false,
        },
        {
          time: "12:00",
          displayTime: "12:00 PM to 1:00 PM",
          isAvailable: false,
        },
        { time: "13:00", displayTime: "1:00 PM to 2:00 PM", isAvailable: false },
        { time: "14:00", displayTime: "2:00 PM to 3:00 PM", isAvailable: false },
        { time: "15:00", displayTime: "3:00 PM to 4:00 PM", isAvailable: false },
        { time: "16:00", displayTime: "4:00 PM to 5:00 PM", isAvailable: false },
        { time: "17:00", displayTime: "5:00 PM to 6:00 PM", isAvailable: false },
        { time: "18:00", displayTime: "6:00 PM to 7:00 PM", isAvailable: false },
      ],
    ],
    isEventClosed: false,
  },
];

// Default time slots structure
export const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { time: "09:00", displayTime: "9:00 AM to 10:00 AM", isAvailable: true },
  { time: "10:00", displayTime: "10:00 AM to 11:00 AM", isAvailable: true },
  { time: "11:00", displayTime: "11:00 AM to 12:00 PM", isAvailable: true },
  { time: "14:00", displayTime: "2:00 PM to 3:00 PM", isAvailable: true },
  { time: "15:00", displayTime: "3:00 PM to 4:00 PM", isAvailable: true },
  { time: "16:00", displayTime: "4:00 PM to 5:00 PM", isAvailable: true },
  { time: "17:00", displayTime: "5:00 PM to 6:00 PM", isAvailable: true },
];

// --- Core Dynamic Filtering Logic (Used ONLY for the Form) ---

/**
 * Filters the location data to include only dates that are strictly in the future.
 * This function is used to prepare data for the form's date selector.
 * @param location The ScheduleLocation object to filter.
 * @returns A new ScheduleLocation object with only future dates and corresponding data.
 */
function getFutureDatesForLocation(
  location: ScheduleLocation,
): ScheduleLocation {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const futureDates: string[] = [];
  const futureTimes: string[] = [];
  const futureVenues: string[] = [];
  const futureSlots: TimeSlot[][] = [];

  location.dates.forEach((dateString, index) => {
    const scheduledDate = new Date(dateString + "T00:00:00");
    scheduledDate.setHours(0, 0, 0, 0);

    if (scheduledDate >= tomorrow) {
      futureDates.push(dateString);
      if (location.times[index]) futureTimes.push(location.times[index]);
      if (location.venues[index]) futureVenues.push(location.venues[index]);
      if (location.availableSlots && location.availableSlots[index]) {
        futureSlots.push(location.availableSlots[index]);
      }
    }
  });

  return {
    ...location,
    dates: futureDates,
    times: futureTimes,
    venues: futureVenues,
    availableSlots: futureSlots,
  };
}

// --- Utility Functions ---

export function formatDateFriendly(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTimeFriendly(t24: string) {
  const [h, m] = t24.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Formats schedule details for display.
 */
export function formatScheduleDetails(location: ScheduleLocation): string[] {
  return location.dates.map((date, index) => {
    const formattedDate = formatDateFriendly(date);
    const venue = location.venues[index] || "";
    const time = location.times[index] || "";

    if (time && venue) return `${formattedDate}, ${time}, ${venue}`;
    if (time) return `${formattedDate}, ${time}`;
    if (venue) return `${formattedDate}, ${venue}`;
    return formattedDate;
  });
}

export function getFlagEmoji(locationId: LocationId): string {
  const flags: Record<LocationId, string> = {
    png: "🇵🇬",
  };
  return flags[locationId] || "🏳️";
}

/**
 * Returns the ScheduleLocation data, filtered to only include dates that
 * are strictly in the future (tomorrow onwards). This is used EXCLUSIVELY
 * to populate the form's date dropdown.
 */
export function getLocationById(id: LocationId): ScheduleLocation | undefined {
  const location = schedule.find((loc) => loc.id === id);
  if (location) {
    const filteredLocation = getFutureDatesForLocation(location);
    if (filteredLocation.dates.length === 0) return undefined;
    return filteredLocation;
  }
  return undefined;
}

/**
 * Returns only the LocationIds that still have at least one future date available.
 * This is used to populate the Country dropdown in the form.
 */
export function getAllLocationIds(): LocationId[] {
  return schedule
    .filter((loc) => {
      const filteredLoc = getFutureDatesForLocation(loc);
      return filteredLoc.dates.length > 0;
    })
    .map((loc) => loc.id);
}

/**
 * Returns available time slots for a specific date index within the filtered location.
 * This filters for slots where isAvailable is true, implementing the "hide unavailable option" logic.
 */
export function getTimeSlotsForDate(
  location: ScheduleLocation,
  dateIndex: number,
): TimeSlot[] {
  if (location.availableSlots && location.availableSlots[dateIndex]) {
    return location.availableSlots[dateIndex].filter(
      (slot) => slot.isAvailable,
    );
  }
  return DEFAULT_TIME_SLOTS.filter((slot) => slot.isAvailable);
}

export function isTimeSlotAvailable(
  location: ScheduleLocation,
  dateIndex: number,
  time: string,
): boolean {
  const slots = getTimeSlotsForDate(location, dateIndex);
  return slots.some((slot) => slot.time === time && slot.isAvailable);
}
