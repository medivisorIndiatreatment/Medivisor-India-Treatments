"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Heart,
  Shield,
  Users,
  Award,
  Phone,
  Mail,
  MapPin,
  Play,
  CheckCircle,
  ArrowRight,
  Stethoscope,
  Activity,
  Brain,
  Zap,
} from "lucide-react";
import CtaSection from "@/components/CtaSection";
import { DESIGN_TOKENS } from "@/components/design-tokens";
export default function CancerTreatmentPage() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <div className="flex flex-1">
        {/* Main Content */}
        <main className="flex-1">
          {/* Hero Section */}
          <section className="bg-gray-50 py-12 md:py-16">
            <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
              <h1 className="text-2xl md:text-4xl font-semibold text-[#241d1f] leading-tight mb-6">
                Cancer Treatment in India – Medivisor India Treatment
              </h1>
              <div className="space-y-4 text-base md:text-lg text-[#241d1f] leading-relaxed">
                <p>
                  Cancer remains one of the leading health challenges worldwide, with millions of new cases diagnosed each year. For many patients, access to advanced treatment options can be limited or prohibitively expensive in their home countries. As a result, more patients are seeking treatment abroad, where they can find world-class care at a fraction of the cost.
                </p>
                <p>
                  India has emerged as a global hub for affordable and high-quality cancer treatment. With state-of-the-art medical infrastructure, internationally trained oncologists, and cutting-edge technologies, India offers comprehensive cancer care comparable to top global standards — at significantly lower costs.
                </p>
                <p>
                  At Medivisor India Treatment, we connect patients to some of the most trusted cancer care providers in India, including Max Healthcare, a leading name in oncology.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Button className="bg-[#E22026] hover:bg-[#74BF44] text-white font-medium px-6 py-3 rounded-md transition-all">
                  Start Your Journey
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-300 text-[#241d1f] hover:bg-gray-100 px-6"
                >
                  Get Second Opinion
                </Button>
              </div>
            </div>
          </section>

          {/* Overview Section */}
          <section id="overview" className="bg-white py-12 md:py-16">
            <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-4xl font-semibold text-[#241d1f] leading-tight mb-3">
                  Why Choose India for Cancer Treatment?
                </h2>
                <p className="text-base md:text-lg text-[#241d1f] leading-relaxed max-w-3xl mx-auto">
                  India has emerged as a global hub for affordable and high-quality cancer treatment, offering
                  comprehensive care comparable to top global standards.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {[
                  { icon: Award, title: "Expert Oncologists", desc: "Internationally trained doctors with decades of experience" },
                  { icon: Zap, title: "Advanced Technology", desc: "State-of-the-art equipment and cutting-edge treatment methods" },
                  { icon: Shield, title: "Affordable Care", desc: "World-class treatment at a fraction of global costs" },
                  { icon: Users, title: "Holistic Support", desc: "Complete patient care from consultation to recovery" },
                ].map((item, index) => (
                  <Card key={index} className="text-center bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="p-4">
                      <div className="inline-flex items-center justify-center w-14 h-14 bg-white border border-gray-200 rounded-full mx-auto mb-3">
                        <item.icon className="h-7 w-7 text-[#241d1f]" />
                      </div>
                      <CardTitle className="text-xl font-medium text-[#241d1f]">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-base text-[#241d1f] leading-relaxed">{item.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Cancer Types Section */}
          <section id="treatments" className="bg-gray-50 py-12 md:py-16">
            <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
              {/* Section Heading */}
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-4xl font-semibold text-[#241d1f] leading-tight mb-3">
                  Types of Cancer We Treat
                </h2>
                <p className="text-base md:text-lg text-[#241d1f] max-w-2xl mx-auto leading-relaxed">
                  Comprehensive, multidisciplinary care across a wide spectrum of cancer types.
                </p>
              </div>

              {/* Cards Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: "Breast Cancer", description: "Surgery, radiation, chemotherapy, hormone therapy" },
                  { name: "Lung Cancer", description: "Surgery, chemotherapy, radiation, targeted therapy" },
                  { name: "Blood Cancers", description: "Chemotherapy, immunotherapy, stem cell transplant" },
                  { name: "Brain Tumors", description: "Surgery, radiation, chemotherapy based on type" },
                  { name: "Colorectal Cancer", description: "Surgery with high success in early stages" },
                  { name: "Prostate Cancer", description: "Surgery, radiation, hormone therapy" },
                  { name: "Liver Cancer", description: "Surgery, transplantation, targeted therapy" },
                  { name: "Pancreatic Cancer", description: "Surgery, chemotherapy, palliative care" },
                  { name: "Ovarian Cancer", description: "Debulking surgery, chemotherapy, targeted therapies" },
                ].map((cancer, index) => (
                  <Card
                    key={index}
                    className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <CardHeader className="p-5 pb-3">
                      <CardTitle className="text-xl flex items-center font-medium text-[#241d1f]">
                        <Activity className="h-10 w-10 bg-gray-100 border border-gray-100 rounded-full p-2 mr-3 text-[#E22026]" />
                        {cancer.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pt-0">
                      <p className="text-base text-[#241d1f] leading-relaxed">
                        {cancer.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>


          {/* Advanced Treatments Section */}
          <section id="services" className="bg-white py-12 md:py-16">
            <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-4xl font-semibold text-[#241d1f] leading-tight mb-3">
                  Advanced Treatment Services
                </h2>
                <p className="text-base md:text-lg text-[#241d1f] leading-relaxed">
                  Precision medicine combining advanced surgical techniques and comprehensive support
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  {[
                    "Targeted Therapy - Attacks specific cancer cells",
                    "Robotic Surgery - Minimally invasive procedures",
                    "Advanced Radiation Therapy - IMRT, IGRT, VMAT",
                    "Precision Oncology - Personalized treatment plans",
                    "Immunotherapy - Activates immune system naturally",
                  ].map((service, index) => (
                    <div key={index} className="flex bg-gray-50 p-3 rounded-md items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-[#74BF44] mt-0.5 flex-shrink-0" />
                      <span className="text-base text-[#241d1f]">{service}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {[
                    "Hormone Therapy - For hormone-dependent cancers",
                    "Cryoablation - Non-surgical tumor destruction",
                    "Stem Cell Transplant - Restores healthy blood cells",
                    "Palliative Care - Pain management and support",
                    "Molecular Profiling - Genetic tumor analysis",
                  ].map((service, index) => (
                    <div key={index} className="flex bg-gray-50 p-3 rounded-md items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-[#74BF44] mt-0.5 flex-shrink-0" />
                      <span className="text-base text-[#241d1f]">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>


          {/* Advanced Treatments Section */}
          <section id="services" className="py-10 px-4 md:px-0 bg-white">
            <div className="container mx-auto ">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Advanced Treatment Services
                </h2>
                <p className="text-lg text-[#241d1f]">
                  Precision medicine combining advanced surgical techniques and comprehensive support
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  {[
                    "Targeted Therapy - Attacks specific cancer cells",
                    "Robotic Surgery - Minimally invasive procedures",
                    "Advanced Radiation Therapy - IMRT, IGRT, VMAT",
                    "Precision Oncology - Personalized treatment plans",
                    "Immunotherapy - Activates immune system naturally",
                  ].map((service, index) => (
                    <div key={index} className="flex bg-gray-50 p-2 rounded-xs items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-[#74bf44] mt-0.5 flex-shrink-0" />
                      <span className="text-[#241d1f] text-lg">{service}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {[
                    "Hormone Therapy - For hormone-dependent cancers",
                    "Cryoablation - Non-surgical tumor destruction",
                    "Stem Cell Transplant - Restores healthy blood cells",
                    "Palliative Care - Pain management and support",
                    "Molecular Profiling - Genetic tumor analysis",
                  ].map((service, index) => (
                    <div key={index} className="flex bg-gray-50 p-2 rounded-xs items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-[#74bf44] mt-0.5 flex-shrink-0" />
                      <span className="text-[#241d1f] text-lg">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* International Patient Support */}
          <section className="bg-white py-12 md:py-16">
            <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-4xl font-semibold text-[#241d1f] leading-tight mb-3">
                  International Patient Support
                </h2>
                <p className="text-base md:text-lg text-[#241d1f] leading-relaxed">
                  End-to-end care to make your treatment journey seamless and stress-free
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {[
                  { icon: Users, title: "Dedicated Coordinators", desc: "Single point of contact for all needs" },
                  { icon: MapPin, title: "Visa & Travel Support", desc: "Complete assistance with documentation" },
                  { icon: Phone, title: "Language Services", desc: "Multilingual interpreters available" },
                  { icon: Stethoscope, title: "Online Consultations", desc: "Expert review before traveling" },
                  { icon: Shield, title: "Transparent Pricing", desc: "Detailed cost estimates upfront" },
                  { icon: Heart, title: "Post-Treatment Care", desc: "Virtual follow-ups after returning home" },
                ].map((support, index) => (
                  <Card key={index} className="text-center bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="p-4 pt-6">
                      <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mx-auto mb-3">
                        <support.icon className="h-7 w-7 text-[#241d1f]" />
                      </div>
                      <CardTitle className="text-lg font-medium text-[#241d1f]">{support.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pb-6">
                      <p className="text-base text-[#241d1f] leading-relaxed">{support.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className="bg-gray-50 py-12 md:py-16">
            <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
              <CtaSection />
            </div>
          </section>
        </main>

        {/* Sticky Video Sidebar */}
        <aside className="hidden lg:block sticky top-20 right-0 w-96 h-[calc(100vh-80px)] overflow-y-auto bg-white border-l border-gray-200">
          <div className="p-6 h-full flex flex-col">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-[#241d1f] mb-2">
                Cancer Treatment in India
              </h3>
              <p className="text-base text-[#241d1f] leading-relaxed">
                Watch our comprehensive guide to cancer treatment options and patient success stories.
              </p>
            </div>
            <div className="relative flex-1 bg-gray-50 rounded-lg overflow-hidden">
              {!isVideoPlaying ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <Button
                    className="bg-gray-800 hover:bg-gray-900 text-white rounded-full w-16 h-16"
                    onClick={() => setIsVideoPlaying(true)}
                  >
                    <Play className="h-6 w-6 ml-1" />
                  </Button>
                </div>
              ) : (
                <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Brain className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">Video Player</p>
                    <p className="text-xs">Treatment Overview</p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 space-y-4">
              <div>
                <h4 className="text-xl font-semibold text-[#241d1f] mb-2">Key Benefits:</h4>
                <ul className="space-y-2">
                  {["Cost-effective treatment", "World-class facilities", "Expert oncologists", "Comprehensive support"].map((benefit, idx) => (
                    <li key={idx} className="flex items-center text-base text-[#241d1f]">
                      <CheckCircle className="h-5 w-5 text-[#74BF44] mr-2" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              <Button className="bg-[#E22026] hover:bg-[#74BF44] text-white font-medium px-6 py-3 rounded-md transition-all w-full">
                Get Free Consultation
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
