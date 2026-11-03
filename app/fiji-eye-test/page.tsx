// app/fiji-eye-test/page.tsx
import { schedule, formatScheduleDetails } from "@/lib/eye-test";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "Medivisor Eye Test - Fiji | Event Concluded - Thank You!",
  description:
    "Thank you for joining the eye consultation in Fiji. Stay tuned for future events.",
  alternates: {
    canonical: "https://medivisorindiatreatment.com/fiji-eye-test",
  },
  openGraph: {
    title: "Medivisor Eye Test - Fiji | Event Concluded - Thank You!",
    description:
      "Thank you for joining the eye consultation in Fiji. Stay tuned for future events.",
    images: [
      {
        url: "https://medivisorindiatreatment.com/thumbnail/eye-test.jpg",
        width: 1200,
        height: 630,
      },
    ],
    url: "https://medivisorindiatreatment.com/fiji-eye-test",
    siteName: "Medivisor",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Medivisor Eye Test - Fiji | Event Concluded - Thank You!",
    description:
      "Thank you for joining the eye consultation in Fiji. Stay tuned for future events.",
    images: ["https://medivisorindiatreatment.com/thumbnail/eye-test.jpg"],
  },
};

export default function Page() {
  return (
    <section className="bg-white text-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-red-600 to-red-700 text-white py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Fiji Eye Test Event Concluded
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
            Thank you for joining us! Stay tuned for more consultations and eye
            care opportunities.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Column */}
        <div className="space-y-10">
          {/* Introduction */}
          <div className="space-y-5">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Grateful for Your Participation
            </h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              The Medivisor Eye Test with Sharp Sight Eye Hospitals (Oct 27–30,
              2025) has successfully wrapped up. We addressed important vision
              issues such as retina, cornea, cataract, and glaucoma with
              specialist consultations.
            </p>
          </div>

          {/* Event Highlights */}
          <div className="bg-[#e22229] text-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-3 border-l-4 border-white pl-3">
              Event Highlights
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base">
              <li>Expert consultation for major eye conditions</li>
              <li>Guidance for India treatment options</li>
              <li>Transparent cost and travel advice</li>
            </ul>
          </div>

        
      
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-8">
          {/* Contact Card */}
          <Card className="border-gray-200 shadow-md rounded-xl overflow-hidden">
            <CardContent className="p-6 space-y-4 text-center">
              <h3 className="text-xl font-semibold text-gray-900">
                Event Over
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Registration has closed. You can still contact us for
                post-event consultation or India treatment guidance.
              </p>
              <div className="space-y-3">
                <Button
                  asChild
                  className="w-full bg-[#e22229] hover:bg-red-700 text-white text-sm py-2.5 rounded-lg"
                >
                  <Link href="mailto:info@medivisorindiatreatment.com?subject=Eye Care - Fiji Follow-up">
                    Email Us
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="w-full text-sm py-2.5 rounded-lg"
                >
                  <Link href="tel:+91-XXXXXXXXXX">Call Now</Link>
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Stay tuned — new events coming soon.
              </p>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="bg-gray-50 border-gray-200 rounded-md shadow-sm p-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Next Steps
            </h4>
            <ul className="space-y-2 text-sm text-gray-700 ml-2">
              <li>• Review doctor’s recommendations</li>
              <li>• Plan your treatment in India</li>
              <li>• Share feedback with our team</li>
              <li>• Await future event updates</li>
            </ul>
          </Card>
        </div>
      </main>
    </section>
  );
}
