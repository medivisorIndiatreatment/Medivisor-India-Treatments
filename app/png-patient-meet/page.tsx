import type { Metadata } from "next";
import { schedule, formatScheduleDetails } from "@/lib/schedule";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { DESIGN_TOKENS } from "@/components/design-tokens";

import Registration from "@/components/registration-form";
import StickySidebar from "@/components/stickySidebar";
import FaqSection from "@/components/FaqSection";
import Banner from "@/components/PacificBanner";
import { CalendarDays } from "lucide-react";

const PNG_LOCATION = schedule.find((loc) => loc.id === "png");
const PNG_DATE_RANGE = (() => {
  if (!PNG_LOCATION || PNG_LOCATION.dates.length === 0)
    return "Sep 22–26, 2026";
  const first = new Date(PNG_LOCATION.dates[0] + "T00:00:00");
  const last = new Date(
    PNG_LOCATION.dates[PNG_LOCATION.dates.length - 1] + "T00:00:00",
  );
  const month = first.toLocaleDateString(undefined, { month: "short" });
  return `${month} ${first.getDate()}–${last.getDate()}, ${first.getFullYear()}`;
})();

const PNG_LOCATION_LABEL = PNG_LOCATION?.label ?? "Papua New Guinea";
const PNG_CITY = PNG_LOCATION?.city ?? "Port Moresby & Lae";
const PNG_FEE = PNG_LOCATION?.feeLabel ?? "PGK 150";
const PNG_EVENT_CLOSED = PNG_LOCATION?.isEventClosed ?? false;
const PNG_ALL_SLOTS_BOOKED = PNG_LOCATION?.availableSlots
  ? PNG_LOCATION.availableSlots.every((slots) =>
      slots.every((slot) => !slot.isAvailable),
    )
  : false;

function flagForLabel(label: string) {
  const value = label.toLowerCase();

  if (value.includes("png") || value.includes("papua")) {
    return {
      src: "/icon/flag/png.png",
      alt: "Flag of Papua New Guinea",
    };
  }

  if (value.includes("solomon")) {
    return {
      src: "/icon/flag/solomon-flag.png",
      alt: "Flag of Solomon Islands",
    };
  }

  if (value.includes("vanuatu")) {
    return {
      src: "/icon/flag/vanuatu.png",
      alt: "Flag of Vanuatu",
    };
  }

  if (value.includes("fiji")) {
    return {
      src: "/icon/flag/fiji.png",
      alt: "Flag of Fiji",
    };
  }

  return {
    src: "/icon/flag/fiji.png",
    alt: "Country flag",
  };
}

export const metadata: Metadata = {
  title: `Medivisor PNG Patient Meet | ${PNG_DATE_RANGE} | ${PNG_LOCATION_LABEL}`,
  description: `Meet the Medivisor and medical team in ${PNG_LOCATION_LABEL} (${PNG_CITY}) from ${PNG_DATE_RANGE}. Explore advanced treatment options in India with a consultation. Meeting fee: ${PNG_FEE}.`,
  keywords: [
    "Papua New Guinea",
    "PNG",
    "Medivisor PNG Patient Meet",
    "medical consultation PNG",
    "treatment in India",
    "medical tourism PNG",
    "Medivisor",
    " Hospitals",
    "Port Moresby",
    "Lae",
    "free medical consultation",
    "international patient",
    "Sep 22-26",
  ],
  robots: "noindex, follow",

  alternates: {
    canonical: "https://medivisorindiatreatment.com/png-patient-meet",
  },

  openGraph: {
    title: `Medivisor PNG Patient Meet | ${PNG_DATE_RANGE} | ${PNG_LOCATION_LABEL}`,
    description: `Meet the Medivisor and medical team in ${PNG_LOCATION_LABEL} (${PNG_CITY}) from ${PNG_DATE_RANGE}. Explore advanced treatment options in India with a consultation. Meeting fee: ${PNG_FEE}.`,
    url: "https://medivisorindiatreatment.com/png-meet.jpg",
    siteName: "Medivisor India Treatment",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://medivisorindiatreatment.com/png-meet.jpg",
        width: 1200,
        height: 630,
        alt: `Medivisor PNG Patient Meet - ${PNG_DATE_RANGE} in ${PNG_LOCATION_LABEL}`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `Medivisor PNG Patient Meet | ${PNG_DATE_RANGE} | ${PNG_LOCATION_LABEL}`,
    description: `Meet the Medivisor and medical team in ${PNG_LOCATION_LABEL} (${PNG_CITY}) from ${PNG_DATE_RANGE}. Explore advanced treatment options in India with a consultation. Meeting fee: ${PNG_FEE}.`,
    site: "@MedivisorIndiatreatment",
    creator: "@MedivisorIndiatreatment",
    images: ["https://medivisorindiatreatment.com/png-meet.jpg"],
  },

  other: {
    "whatsapp-title":
      "Medivisor PNG Patient Meet | Medivisor Director in Pacific Islands",
    "whatsapp-description": `Meet the Medivisor team for expert medical guidance. Free consultation available ${PNG_DATE_RANGE} in ${PNG_LOCATION_LABEL}. Limited slots. Register now.`,
  },
};

const idealPatients = [
  "You have been advised to seek treatment overseas.",
  "You are struggling to get your condition diagnosed or treated locally.",
  "You are considering treatment in India and want to understand your options.",
  "You would like to explore a second opinion or advanced treatment options.",
];

const learnItems = [
  "Treatment options available in India",
  "Suitable hospitals and specialists",
  "Estimated treatment costs",
  "Expected treatment timeframe",
  "India travel requirements",
  "How Medivisor can assist you throughout your treatment journey",
];

const bookingSteps = [
  {
    step: "01",
    title: "Register",
    description:
      "Register by providing your contact details and selecting your preferred location and appointment time.",
  },
  {
    step: "02",
    title: "Share Your Reports",
    description:
      "Share your medical reports, scans, prescriptions, and other relevant documents with us for review.",
  },
  {
    step: "03",
    title: "Pay the Consultation Fee",
    description:
      "Pay the PGK 150 consultation fee to Medivisor's PNG Representative, Ms Shirley Waira.",
  },
];

export default function Page() {
  return (
    <div className="w-full bg-white text-gray-900">
      {/* Hero */}
      <Banner />

       <section className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.SECTION_SPACING.PY_LG} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}
        >
          {/* KEY FIX: lg:items-start makes flex children size to their own
              content height instead of stretching — required for sticky. */}
          <div className="mx-auto w-full relative flex flex-col lg:flex-row lg:gap-8 lg:items-start">
            {/* =========================================================
                LEFT CONTENT
            ========================================================= */}
            <div className="min-w-0 space-y-6 w-full lg:w-[60%]">
              {/* Is This Meeting for You? */}
              <section>
                <div className="mb-4">
                  <h2
                    className={`${DESIGN_TOKENS.TYPOGRAPHY.H2} text-gray-900`}
                  >
                    Is This Meeting for You?
                  </h2>

                  <p
                    className={`mt-2 ${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC} text-[#29A9B9]`}
                  >
                    You should consider meeting us if:
                  </p>
                </div>

                <div
                  className={`${DESIGN_TOKENS.COMPONENT.CARD.BASE} ${DESIGN_TOKENS.COMPONENT.CARD.PADDING}`}
                >
                  <ul
                    className={`space-y-2.5 ${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC} text-gray-900`}
                  >
                    {idealPatients.map((patient) => (
                      <li key={patient} className="flex items-start gap-3">
                        <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-[#29A9B9]" />
                        <span>{patient}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* When & Where to Meet */}
              <section>
                <div className="mb-4">
                  <h2
                    className={`${DESIGN_TOKENS.TYPOGRAPHY.H2} text-gray-900`}
                  >
                    When &amp; Where to Meet
                  </h2>

                  <p
                    className={`mt-2 ${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC} text-gray-900`}
                  >
                    Meet the Medivisor team at our scheduled patient meetings in
                    Port Moresby and Lae.
                  </p>
                </div>

                <div className={`space-y-5 ${DESIGN_TOKENS.SECTION_SPACING.GAP}`}>
                  {schedule
                    .filter((loc) => loc.id === "png")
                    .map((location) => {
                      const flag = flagForLabel(location.label);
                      const details = formatScheduleDetails(location);

                      return (
                        <Card
                          key={location.id}
                          className="
                  group relative
                  rounded-xl border border-gray-200
                  bg-white shadow-sm
                  transition-all duration-200
                  hover:border-[#29A9B9]/40
                  hover:shadow-md
                "
                        >
                          <CardHeader className="p-5 sm:p-6">
                            <div className="flex items-center gap-4">
                              <div
                                className="
                        relative h-14 w-20 shrink-0
                        overflow-hidden rounded-lg
                        border border-gray-200
                        bg-gray-50 shadow-sm
                        sm:h-16 sm:w-24
                      "
                              >
                                <img
                                  src={flag.src}
                                  alt={flag.alt}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <CalendarDays className="h-4 w-4 shrink-0 text-[#29A9B9]" />

                                  <CardTitle
                                    className={`
                            ${DESIGN_TOKENS.TYPOGRAPHY.CARD_TITLE}
                            tracking-tight text-gray-900
                          `}
                                  >
                                    {location.label}
                                  </CardTitle>
                                </div>

                                {location.city && (
                                  <p
                                    className={`
                            mt-1
                            ${DESIGN_TOKENS.TYPOGRAPHY.CARD_SUBTITLE}
                            text-gray-900
                          `}
                                  >
                                    {location.city}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="p-5 sm:p-6">
                            <div
                              className={`
                      space-y-2
                      ${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC}
                      text-gray-900
                    `}
                            >
                              {details.map((detail, index) => (
                                <div
                                  key={`${location.id}-detail-${index}`}
                                  className="flex items-start gap-3"
                                >
                                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#29A9B9]" />

                                  <p
                                    className={DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC}
                                  >
                                    {detail}
                                  </p>
                                </div>
                              ))}
                            </div>

                            <div
                              className="
                      mt-4 grid gap-4
                      border-t border-gray-100
                      pt-4 sm:grid-cols-2
                    "
                            >
                              <div />

                              {location.localContact && (
                                <div className="sm:text-right">
                                  <p
                                    className={`
                            ${DESIGN_TOKENS.TYPOGRAPHY.CAPTION}
                            uppercase tracking-wide text-gray-400
                          `}
                                  >
                                    Local Contact
                                  </p>

                                  {(() => {
                                    const raw = location.localContact || "";

                                    const phoneMatch =
                                      raw.match(/(\+[\d\s-]{7,})/);

                                    const phone = phoneMatch
                                      ? phoneMatch[0].trim()
                                      : "";

                                    const name = phone
                                      ? raw
                                        .replace(phone, "")
                                        .replace(/-\s*$/, "")
                                        .trim()
                                      : raw;

                                    return (
                                      <p
                                        className={`
                                mt-1
                                ${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC}
                                font-medium text-gray-700
                              `}
                                      >
                                        <img
                                          src="/png-testimonial/A2.jpg"
                                          alt={flag.alt}
                                          className="
                                  mr-2 mb-1
                                  inline-block h-10 w-10
                                  rounded-full object-cover
                                "
                                        />

                                        {name}

                                        {phone && (
                                          <>
                                            {" - "}
                                            <a
                                              href={`tel:${phone.replace(/\s/g, "")}`}
                                              className="text-[#29A9B9] hover:underline"
                                            >
                                              {phone}
                                            </a>
                                          </>
                                        )}
                                      </p>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </section>

              {/* What You Will Learn */}
              <section
                className={`${DESIGN_TOKENS.COMPONENT.CARD.BASE}`}
              >
                <div className={DESIGN_TOKENS.COMPONENT.CARD.PADDING}>
                  <div className="mb-5">
                    <h2
                      className={`${DESIGN_TOKENS.TYPOGRAPHY.H2} text-gray-900`}
                    >
                      What You Will Learn?
                    </h2>

                    <p className={`mt-2 ${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC}`}>
                      At the meeting, you can understand:
                    </p>
                  </div>

                  <ul className="grid gap-2.5">
                    {learnItems.map((item) => (
                      <li
                        key={item}
                        className={`
                  ${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC}
                  flex items-start gap-3 rounded-lg
                  border border-gray-100
                  bg-gray-50/80 p-3
                  font-normal leading-6 text-gray-900
                  transition-all duration-200
                  hover:border-gray-300 hover:bg-white
                `}
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#29A9B9] text-xs text-white">
                          ✓
                        </span>

                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Who You Will Meet */}
              <section>
                <div className="mb-4">
                  <h2
                    className={`${DESIGN_TOKENS.TYPOGRAPHY.H2} text-gray-900`}
                  >
                    Who You Will Meet
                  </h2>
                   
                </div>

                <div
                  className={`${DESIGN_TOKENS.COMPONENT.CARD.BASE} ${DESIGN_TOKENS.COMPONENT.CARD.PADDING}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-50 shadow-sm">
                      <img
                        src="/teams/sushant.png"
                        alt="Mr. Kumar Sushant - Founder, CEO &amp; MD, Medivisor India Treatment"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <CardTitle
                        className={`${DESIGN_TOKENS.TYPOGRAPHY.CARD_TITLE} tracking-tight text-gray-900`}
                      >
                        Mr. Kumar Sushant
                      </CardTitle>

                      <p
                        className={`mt-1 ${DESIGN_TOKENS.TYPOGRAPHY.CARD_SUBTITLE} text-gray-700`}
                      >
                        Founder, CEO &amp; MD — Medivisor India Treatment
                      </p>
                    </div>
                  </div>

                  <p
                    className={`mt-4 ${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC} text-gray-900`}
                  >
                    Meet directly with the person leading Medivisor and discuss
                    your medical treatment journey to India.
                  </p>
                </div>
              </section>

              {/* How to Book */}
              <section
                className={`
          rounded-xl border border-gray-200
          bg-gray-50
          shadow-sm
          transition-shadow duration-200
          hover:shadow-md
          ${DESIGN_TOKENS.COMPONENT.CARD.PADDING}
        `}
              >
                <div className="mb-5">
                  <h2 className={DESIGN_TOKENS.TYPOGRAPHY.H2}>
                    How to Book Your Appointment
                  </h2>
                   <p className={`mt-2 ${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC}`}>
                     You can book your appointment in three simple steps:
                    </p>
                </div>

                <div className="space-y-4">
                  {bookingSteps.map((step) => (
                    <div key={step.step} className="flex items-start gap-4">
                      <span
                        className="
                  mt-0.5 flex h-8 w-8 shrink-0
                  items-center justify-center
                  rounded-full border-2 border-[#29A9B9]
                  bg-white text-sm font-bold text-[#29A9B9]
                "
                      >
                        {step.step}
                      </span>

                      <div className="flex-1 space-y-0.5">
                        <p
                          className={`
                    ${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC}
                    font-semibold text-gray-900
                  `}
                        >
                          {step.title}
                        </p>

                        <p
                          className={`
                    ${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC}
                    text-gray-900
                  `}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}

                  <div>
                    <div className="flex flex-col gap-4 pl-12 sm:flex-row sm:gap-8">
                      <div>
                        <p
                          className={`${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC} text-gray-900`}
                        >
                          Account Holder Name
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          Shirley Waira
                        </p>
                      </div>

                      <div>
                        <p
                          className={`${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC} text-gray-900`}
                        >
                          Contact Number
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          +675 7437 6546
                        </p>
                      </div>

                      <div>
                        <p
                          className={`${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC} text-gray-900`}
                        >
                          Account Number
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          7021910158
                        </p>
                      </div>

                      <div>
                        <p
                          className={`${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC} text-gray-900`}
                        >
                          Bank Name
                        </p>
                        <p className="text-sm font-medium text-gray-900">BSP</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-gray-200 bg-white p-5">
                  <p
                    className={`
              mt-2.5
              ${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC}
              text-gray-900
            `}
                  >
                    Your appointment will be confirmed once the payment is
                    received.
                    <br />

                  </p>
                </div>
              </section>
            </div>

            {/* =========================================================
                RIGHT REGISTRATION — STICKY SIDEBAR
            ========================================================= */}
            <StickySidebar
              className="min-w-0 w-full mt-8 lg:mt-0 lg:w-[40%]"
              topOffset={96}
              enableAtWidth={1024}
            >
              <div
                id="pngfrom"
                className={`
                  scroll-mt-24
                  rounded-xl
                  border border-gray-200
                  bg-white
                  ${DESIGN_TOKENS.SHADOWS.LG}
                `}
              >
                {PNG_ALL_SLOTS_BOOKED ? (
                  <div
                    className={`
                      ${DESIGN_TOKENS.COMPONENT.CARD.PADDING}
                      flex flex-col items-center justify-center gap-5 py-14 text-center
                    `}
                  >
                    <span
                      className="
                        flex h-16 w-16 shrink-0 items-center justify-center
                        rounded-full bg-[#29A9B9]/10 text-[#29A9B9]
                      "
                    >
                      <CalendarDays className="h-8 w-8" />
                    </span>

                    <div className="space-y-2.5">
                      <span
                        className={`
                          inline-block rounded-full bg-[#29A9B9]/10 px-3 py-1
                          ${DESIGN_TOKENS.TYPOGRAPHY.OVERLINE}
                        `}
                      >
                        Bookings Closed
                      </span>

                      <p
                        className={`
                          ${DESIGN_TOKENS.TYPOGRAPHY.H2}
                          text-gray-900
                        `}
                      >
                        All appointment slots are fully booked.
                      </p>

                      <p
                        className={`
                          mx-auto max-w-sm
                          ${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC}
                          text-gray-600
                        `}
                      >
                        Please check back for future events or
                        contact our local representative directly.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="border-b px-4 sm:px-6 pt-5 pb-2 border-gray-100 bg-gray-50 rounded-t-xl">
                      <h2
                        className={`
                    ${DESIGN_TOKENS.TYPOGRAPHY.H2}
                    text-gray-900

                  `}
                      >
                        Ready to Take the First Step?
                      </h2>
                     
                      <p
                        className={`
                    ${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC} text-gray-900 my-2
                  `}
                      >
                        Complete the registration form below to request your
                        appointment.
                      </p>
                    </div>
                    <div
                      className={`
                    ${DESIGN_TOKENS.COMPONENT.CARD.PADDING}
                  `}
                    >

                      <Registration isEventClosed={PNG_EVENT_CLOSED} />
                    </div>
                  </>
                )}
              </div>
            </StickySidebar>
          </div>
        </section>
    </div>
  );
}