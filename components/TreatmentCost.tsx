"use client";

import {
  FileText,
  Stethoscope,
  Building2,
  Calculator,
  Globe,
  Heart,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfessionalTreatmentCost() {
  return (
    <section className="relative bg-gray-50 py-10 px-4">
      {/* Background Decorations */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(to_top,white,rgba(255,255,255,0.3))] -z-10" />
      <div className="absolute top-10 right-0 w-96 h-96 bg-red-200/30 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto">
        <div className="grid lg:grid-cols-5 gap-6">
             {/* RIGHT COLUMN - SCROLLABLE STICKY AREA */}
          <div className="col-span-3">
            <div className="max-h-[800px] overflow-auto sticky top-20 space-y-8 pr-2">
              {/* Hero Image */}
              <div className="rounded-xs overflow-hidden shadow-xs">
                <img
                  src="/senior-patient-with-neck.jpg"
                  alt="Medical Planning"
                  className="w-full h-[400px] object-cover"
                />
              </div>

             
            </div>
          </div>
          {/* LEFT COLUMN - PREMIUM DESIGN */}
          <div className="flex flex-col gap-6 col-span-2 text-neutral-900">
            {/* Intro */}
            <div>
              <h2 className="text-3xl font-semibold tracking-tight leading-tight text-[#241d1f]">
                Understand Your Treatment Investment
              </h2>
              <p className="mt-2 text-lg leading-relaxed text-[#241d1f]">
                At Medivisor India Treatment, we believe in absolute transparency. Our experienced advisors help
                you understand what drives your treatment cost and how to make confident, informed decisions.
              </p>
            </div>
            {/* Cost Drivers */}
            <Card className="bg-white shadow border border-gray-50 rounded-xs">
              <CardHeader>
                <div className="flex items-start gap-5">
                  <div className="p-4 bg-gray-100">
                    <Stethoscope className="text-[#241d1f] w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-medium text-[#241d1f]">
                      What Affects Your Treatment Cost?
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1 leading-snug">
                      Know the key cost drivers and plan with confidence
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <ul className="space-y-3 text-[#241d1f] text-base leading-relaxed">
                  <li className="flex items-start gap-4">
                    <FileText className="text-[#241d1f] w-6 h-6 mt-1" />
                    <span className="text-sm">
                      <strong className="text-[#241d1f] text-base">Procedure Type:</strong> Costs depend on the complexity and nature of your treatment.
                    </span> 
                  </li>
                  <li className="flex items-start gap-4">
                    <Heart className="text-[#241d1f] w-6 h-6 mt-1" />
                    <span className="text-sm">
                      <strong className="text-[#241d1f] text-base">Condition Severity:</strong> Advanced or chronic conditions may require additional care.
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <Building2 className="text-[#241d1f] w-6 h-6 mt-1" />
                    <span className="text-sm">
                      <strong className="text-[#241d1f] text-base">Hospital & Location:</strong> Facility quality, location, and specialization affect the pricing.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Medivisor Trust */}
            <Card className="bg-white shadow border border-gray-50 rounded-xs">
              <CardHeader>
                <div className="flex items-start gap-5">
                  <div className="p-4 bg-gray-100">
                    <Globe className="text-[#241d1f] w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-medium text-[#241d1f]">
                      Why Choose Medivisor?
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1 leading-snug">
                      A global medical travel partner you can trust
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-[#241d1f] leading-relaxed">
                From medical consultations and expert surgeon matching to hospital coordination and personalized travel support — Medivisor ensures you’re fully taken care of at every step.
                <br />
                <span className="mt-3 block">
                  Share your reports at <strong className="text-[#E22026]">info@medivisorhealth.com</strong> or WhatsApp us at{" "}
                  <strong className="text-[#241d1f]">+91-9643015697</strong>.
                </span>
              </CardContent>
            </Card>

          </div>

       
        </div>
      </div>
    </section>
  );
}



