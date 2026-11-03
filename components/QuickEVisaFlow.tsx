"use client";

import { useMemo } from "react"
import { CheckCircle } from "lucide-react"
import Image from "next/image"
import { useTranslatedStrings } from "@/lib/i18n"

export default function PatientFlowSection() {
  const texts = useMemo(() => [
    "Patient Journey Process",
    "Our comprehensive patient flow system ensures seamless care from arrival to discharge, with dedicated medical staff supporting you at every step of your treatment journey.",
    "From the moment you arrive at Delhi Airport to your safe return, our structured workflow ensures every aspect of your medical treatment is carefully coordinated and monitored.",
    "Key Process Highlights",
    "Airport Reception & Assessment",
    "Immediate medical condition evaluation upon arrival",
    "Express Consultation & Testing",
    "Rapid diagnostic services and specialist consultations",
    "Treatment & Recovery",
    "Comprehensive care with admission or outpatient options",
    "Safe Departure",
    "Coordinated discharge and airport transfer",
    "Patient Flow Chart - Complete medical treatment process from arrival to discharge",
  ], [])

  const translated = useTranslatedStrings(texts)
  const t = (index: number) => translated[index] ?? texts[index]
  return (
    <section className="py-0 bg-gray-50">
      <div className="container mx-auto">
        <div className="">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-start">
            {/* Left Side - Workflow Chart */}
            <div className="p-2 md:p-6 lg:p-8">
              <div className="md:min-h-[800px]">
                <Image
                  src="/patient-workflow.png"
alt={t(12)}
                  width={800}
                  height={1000}
                  className="w-full h-auto rounded-lg"
                  priority
                />
              </div>
            </div>

            {/* Right Side - Workflow Information */}
            <div className="relative p-2 mt-5 md:mt-0 md:p-6 lg:p-8  md:min-h-[800px]">
              <div className="sticky top-20 max-h-screen overflow-y-auto">
                <div className="space-y-8">
                  <div className="text-left mb-2">
<h2 className="heading-sm mb-3">{t(0)}</h2>
                    <p className="description">
                      {t(1)}
                    </p>
                  </div>

                  <div>
                    <p className="description">
{t(2)}
                    </p>
                  </div>

                  {/* Key Workflow Steps */}
                  <div className="space-y-4">
<h4 className="title-text">{t(3)}</h4>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="text-[#29A9B9] mt-1 flex-shrink-0" />
                        <div>
<p className="description">{t(4)}</p>
                          <p className="description-1">{t(5)}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircle className="text-[#29A9B9] mt-1 flex-shrink-0" />
                        <div>
<p className="description">{t(6)}</p>
                          <p className="description-1">
                            {t(7)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircle className="text-[#29A9B9] mt-1 flex-shrink-0" />
                        <div>
<p className="description">{t(8)}</p>
                          <p className="description-1">
                            {t(9)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircle className="text-[#29A9B9] mt-1 flex-shrink-0" />
                        <div>
<p className="description">{t(10)}</p>
                          <p className="description-1">{t(11)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
