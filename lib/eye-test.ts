// schedule.ts
export type LocationId = "fji-eye"

export type ScheduleLocation = {
  id: LocationId
  label: string
  country: string
  city: string
  dates: string[]
  times: string[]
  venues: string[]
  feeLabel: string
  localContact?: string
  availableSlots?: TimeSlot[][]
}

export type TimeSlot = {
  time: string
  displayTime: string
  isAvailable: boolean
}

export const schedule: ScheduleLocation[] = [
  {
    id: "fji-eye",
    label: " Fiji",
    country: "Fiji",
    city: "Suva & Lautoka",
    dates: ["2025-10-27", "2025-10-28", "2025-10-29", "2025-10-30"],
    times: ["2 pm to 5 PM", "9 AM to 5 PM", "9 AM to 5 PM", "9 AM to 5 PM"],
    venues: ["Suva", "Suva", "Lautoka", "Namaka"],
    feeLabel: "150 FJD",
    localContact: "+679 9470588 (Suva), +679 9470527 (Lautoka), +679 9470527 (Namaka)",
    availableSlots: [
      [
        { time: "14:00", displayTime: "2:00 PM to 3:00 PM", isAvailable: false },
        { time: "15:00", displayTime: "3:00 PM to 4:00 PM", isAvailable: false },
        { time: "16:00", displayTime: "4:00 PM to 5:00 PM", isAvailable: false },
     
      ],
      [
        { time: "09:00", displayTime: "9:00 AM to 10:00 AM", isAvailable: true },
        { time: "10:00", displayTime: "10:00 AM to 11:00 AM", isAvailable: true },
        { time: "11:00", displayTime: "11:00 AM to 12:00 PM", isAvailable: true },
        { time: "13:00", displayTime: "1:00 PM to 2:00 PM", isAvailable: true },
        { time: "14:00", displayTime: "2:00 PM to 3:00 PM", isAvailable: true },
        { time: "15:00", displayTime: "3:00 PM to 4:00 PM", isAvailable: true },
        { time: "16:00", displayTime: "4:00 PM to 5:00 PM", isAvailable: true },
       
      ],
      [
        { time: "09:00", displayTime: "9:00 AM to 10:00 AM", isAvailable: true },
        { time: "10:00", displayTime: "10:00 AM to 11:00 AM", isAvailable: true },
        { time: "11:00", displayTime: "11:00 AM to 12:00 PM", isAvailable: true },
        { time: "13:00", displayTime: "1:00 PM to 2:00 PM", isAvailable: true },
        { time: "14:00", displayTime: "2:00 PM to 3:00 PM", isAvailable: true },
        { time: "15:00", displayTime: "3:00 PM to 4:00 PM", isAvailable: true },
        { time: "16:00", displayTime: "4:00 PM to 5:00 PM", isAvailable: true },
        
      ],
      [
        { time: "09:00", displayTime: "9:00 AM to 10:00 AM", isAvailable: true },
        { time: "10:00", displayTime: "10:00 AM to 11:00 AM", isAvailable: true },
        { time: "11:00", displayTime: "11:00 AM to 12:00 PM", isAvailable: true },
        { time: "13:00", displayTime: "1:00 PM to 2:00 PM", isAvailable: true },
        { time: "14:00", displayTime: "2:00 PM to 3:00 PM", isAvailable: true },
        { time: "15:00", displayTime: "3:00 PM to 4:00 PM", isAvailable: true },
        { time: "16:00", displayTime: "4:00 PM to 5:00 PM", isAvailable: true },
        
      ]
    ]
  }
]

// Default time slots
export const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { time: "09:00", displayTime: "9:00 AM to 10:00 AM", isAvailable: true },
  { time: "10:00", displayTime: "10:00 AM to 11:00 AM", isAvailable: true },
  { time: "11:00", displayTime: "11:00 AM to 12:00 PM", isAvailable: true },
  { time: "14:00", displayTime: "2:00 PM to 3:00 PM", isAvailable: true },
  { time: "15:00", displayTime: "3:00 PM to 4:00 PM", isAvailable: true },
  { time: "16:00", displayTime: "4:00 PM to 5:00 PM", isAvailable: true },
  { time: "17:00", displayTime: "5:00 PM to 6:00 PM", isAvailable: true }
]

// ---- Formatting Utilities ----
export function formatDateFriendly(iso: string) {
  const d = new Date(iso + "T00:00:00")
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

export function formatTimeFriendly(t24: string) {
  const [h, m] = t24.split(":").map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
}

// ---- Updated formatScheduleDetails ----
export function formatScheduleDetails(location: ScheduleLocation): string[] {
  return location.dates.map((date, index) => {
    const formattedDate = formatDateFriendly(date)
    const time = location.times[index] || ""
    const venueCity = location.venues[index] || ""
    let venueName = "The Eye Center"
    let phoneNumber = ""

    // Dynamic venue name and phone assignment
    if (venueCity === "Suva") {
      venueName = "The Eye Center"
      phoneNumber = "+679 9470588"
    } else if (venueCity === "Lautoka") {
      venueName = "Laser Eye Center"
      phoneNumber = "+679 9470527 "
    } else if (venueCity === "Namaka") {
      venueName = "The Eye Center"
      phoneNumber = "+679 9470527 "
    }

    // Final formatted line
    const parts = [formattedDate, time, `${venueName} - ${venueCity}`, phoneNumber].filter(Boolean)
    return parts.join(", ")
  })
}

// ---- Helper functions ----
export function getFlagEmoji(locationId: LocationId): string {
  const flags: Record<LocationId, string> = { "fji-eye": "🇫🇯" }
  return flags[locationId] || "🏳️"
}

export function getLocationById(id: LocationId): ScheduleLocation | undefined {
  return schedule.find((loc) => loc.id === id)
}

export function getAllLocationIds(): LocationId[] {
  return schedule.map((loc) => loc.id)
}

export function getTimeSlotsForDate(location: ScheduleLocation, dateIndex: number): TimeSlot[] {
  if (location.availableSlots && location.availableSlots[dateIndex]) {
    return location.availableSlots[dateIndex].filter(slot => slot.isAvailable)
  }
  return DEFAULT_TIME_SLOTS.filter(slot => slot.isAvailable)
}

export function isTimeSlotAvailable(location: ScheduleLocation, dateIndex: number, time: string): boolean {
  const slots = getTimeSlotsForDate(location, dateIndex)
  return slots.some(slot => slot.time === time && slot.isAvailable)
}

export function getAvailableDatesWithIndex(location: ScheduleLocation): Array<{ date: string; index: number; display: string }> {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return location.dates.map((date, index) => {
    const slots = getTimeSlotsForDate(location, index);
    if (date > todayStr && slots.length > 0) {
      const venueCity = location.venues[index] || "";
      const display = `${formatDateFriendly(date)} - ${venueCity}`;
      return { date, index, display };
    }
    return null;
  }).filter(Boolean) as Array<{ date: string; index: number; display: string }>;
}