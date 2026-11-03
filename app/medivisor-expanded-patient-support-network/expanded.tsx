'use client'

import PNGBanner from "@/components/extend-banner";
import MedivisorForm from "@/components/EspeForm";
import { useTranslatedStrings } from "@/lib/i18n";
import Image from "next/image";

const staticStrings = [
  "Become a Partner",
  "Bridging the Gap",
  "Community-Driven Support",
  "What You Will Do",
  "You will:",
  "Meet and listen to patients and their families living in your community",
  "Collect medical reports and share them with us via WhatsApp at +91 8368247758",
  "Receive the treatment plan and cost quotation from us and help families understand the details clearly",
  "Guide patients through documentation and travel processes (Medivisor will support you at every step)",
  "Stay connected with families throughout the treatment journey",
  "Act as their trusted local support and guidance point",
  "How Medivisor India Supports You",
  "Medivisor India will:",
  "Review and guide all medical cases",
  "Provide clear treatment plans and cost breakdowns for each case",
  "Plan and manage treatment in India",
  "Organise visa and travel",
  "Handle hospital coordination, stay, and local support",
  "Provide training, guidance, and working materials",
  "Stand with you in every patient case",
  "You are never alone in this journey.",
  "Sustainability",
  "Not commission-driven",
  "Not sales-based",
  "Who Can Join?",
  "We welcome individuals and organizations who:",
  "Are socially motivated and respected in their community",
  "Have a service-oriented mindset",
  "Preferably have medical or social sector exposure",
  "Believe in ethical, patient-first work",
  "Value blessings, goodwill, and long-term respect over money",
  "Want to build something meaningful for their community",
  "What Medivisor Health Ambassadors Will Receive",
  "Respect and recognition in your community",
  "Prayers and blessings from the families you help",
  "Deep satisfaction from guiding families in their hardest moments",
  "A transparent, fixed support amount (200 USD) per patient",
  "The honour of being known as a Medivisor Health Ambassador",
  "Membership in a regional and international Medivisor network",
  "Recognition at Medivisor annual events and programmes",
  "You will earn respect, purpose, skills, and a sustainable livelihood — while helping save lives.",
  "Together, We Are the Bridge",
  "Medivisor Health Ambassador Testimonials",
  "Hear from our amazing Health Ambassadors making a difference",
  "— Medivisor Health Ambassador",
  "Patient Testimonials",
  "Stories of hope and healing from families we served",
];

const dynamicContentStrings = [
  "Before joining Medivisor, many patients in my area didn't know where to go for serious treatment. Today, I feel proud that I can guide families with confidence. Medivisor supports us at every step, and seeing patients return home healthier gives me deep satisfaction.",
  "This is not just work — it is service. Families come scared and confused, and we help them find hope. Medivisor truly lives by its promise: Hands That Help. Hearts That Care.",
  "Being part of the Medivisor Expanded Patient Support Network has changed how my community looks at healthcare. People trust us because we guide them honestly. I feel blessed to be part of something that saves lives.",
  "Medivisor makes everything simple — from reports to treatment planning. I am never alone in any case. But the biggest reward is when families thank you after successful treatment. That feeling cannot be explained.",
  "We were confused and scared because no one could guide us properly. Medivisor helped us understand everything — from reports to treatment in India. Today my husband is recovering well. We will always be thankful.",
  "Dicksy Ruenguma",
  "Before Medivisor, we went to many places without answers. Through their Health Ambassador, we finally found the right doctors. They treated us like family. God bless the whole team.",
  "Steven Peters",
  "My child needed urgent treatment and we had no idea where to go. Medivisor guided us step by step. From hospital selection to stay in India, everything was handled with care. Today my child is smiling again.",
  "Linda Koi",
  "Medivisor gave us hope when we had none. They explained everything clearly and supported us throughout the journey. We are grateful beyond words.",
  "Frank Minok",
  "Because of Medivisor and our local Health Ambassador, many families in our area now know where to seek proper treatment. They truly live by their promise — Hands That Help. Hearts That Care.",
  "Johnny Andale",
];

const allContentStrings = [
  "Across many parts of the world, thousands of patients continue to suffer in silence — not because treatment is unavailable, and not always because they cannot afford care abroad — but because they simply do not know where to go, whom to trust, or how to begin the process of seeking proper treatment internationally.",
  "Many families struggle without guidance, reliable contacts, or the confidence to navigate overseas healthcare systems. Often, there is no one to help them understand medical reports, explain treatment options, compare hospitals, or support them in making informed and timely decisions.",
  "The Medivisor Expanded Patient Support Network (MEPSN) was created to address this very gap.",
  "MEPSN is a growing, community-based support network comprising more than 200 Community Health Partners and Health Ambassadors across the Pacific Islands, Africa, CIS countries, and other regions. Together, they work to assist patients who face delays or limitations in accessing specialised or advanced medical care due to local resource constraints.",
  "Through this network, patients and their families receive compassionate guidance, clear direction, and structured support to access affordable, world-class medical treatment in India.",
  "MEPSN functions at the grassroots level — within villages, churches, religious institutions, and community groups — serving as trusted guiding hands for families who might otherwise feel lost or overwhelmed.",
  "Lack of information",
  " Limited access to reliable contacts",
  "Absence of trusted guidance",
  "Limited digital literacy",
  "As the Network continues to expand, we invite compassionate, service-oriented individuals and organizations to join us as Medivisor Community Health Partners and Health Ambassadors.",
  "If you believe that access to the right medical guidance can transform lives, we welcome you to be part of this mission.",
  "Together, we can continue building a trusted bridge between communities and world-class medical care.",
  "To help Community Health Partners serve patients full-time and continue this work sustainably, Medivisor provides a simple and transparent support structure (200 USD) per patient.",
  "It is a dignified and ethical system designed to keep this service alive and accessible.",
  " Every patient deserves a chance to heal. Every family deserves guidance and hope. Through the Medivisor Expanded Patient Support Network, we come together as one compassionate community — reaching into villages, churches, and neighbourhoods to ensure that no one suffers in silence. We are more than a network. We are hands that help, hearts that care.",
  "If you feel called to serve, to guide families, and to be a source of hope in your community, we invite you to walk this journey with us. Join the Medivisor Expanded Patient Support Network today.",
];

export default function Home() {
  const strings = useTranslatedStrings([
    ...staticStrings,
    ...dynamicContentStrings,
    ...allContentStrings,
  ]);
  const stringMap: Record<string, string> = {};
  const allStrings = [
    ...staticStrings,
    ...dynamicContentStrings,
    ...allContentStrings,
  ];
  allStrings.forEach((s, i) => {
    stringMap[s] = strings[i] ?? s;
  });
  const t = (s: string) => stringMap[s] ?? s;
  return (
    <main className="md:min-h-screen h-full bg-white md:bg-gray-50">
      {/* Header */}
      <PNGBanner />

      {/* Main Content */}
      <div className="mx-auto container px-4 md:px-6" id="join-us-form">
        <div className="grid gap-8 py-8 md:py-12 lg:grid-cols-4">
          {/* Left Column - Content Sections */}
          <div className="lg:col-span-3  space-y-8">
            {/* Section 1: An Invitation to Serve */}
            <section className="md:rounded-x md:bg-white p-0 md:p-8 md:shadow-sm md:border border-gray-100">
              <div className="mb-4">
                <h2
                  className="text-2xl md:text-4xl font-semibold text-gray-900 leading-tight tracking-tight"
                  data-trans-managed="true"
                >
                  {t("Become a Partner")}
                </h2>
              </div>

              <div className="space-y-3 text-gray-700 leading-relaxed text-base md:text-lg font-normal">
                <p>
                  {t(
                    "Across many parts of the world, thousands of patients continue to suffer in silence — not because treatment is unavailable, and not always because they cannot afford care abroad — but because they simply do not know where to go, whom to trust, or how to begin the process of seeking proper treatment internationally.",
                  )}
                </p>

                <p>
                  {t(
                    "Many families struggle without guidance, reliable contacts, or the confidence to navigate overseas healthcare systems. Often, there is no one to help them understand medical reports, explain treatment options, compare hospitals, or support them in making informed and timely decisions.",
                  )}
                </p>

                <h2
                   className="text-xl md:text-2xl font-normal pt-5 text-gray-900 leading-tight"
                  data-trans-managed="true"
                >
                  {t("Bridging the Gap")}
                </h2>
                <p>
                  {t(
                    "The Medivisor Expanded Patient Support Network (MEPSN) was created to address this very gap.",
                  )}
                </p>

                <p>
                  {t(
                    "MEPSN is a growing, community-based support network comprising more than 200 Community Health Partners and Health Ambassadors across the Pacific Islands, Africa, CIS countries, and other regions. Together, they work to assist patients who face delays or limitations in accessing specialised or advanced medical care due to local resource constraints.",
                  )}
                </p>

                <p>
                  {t(
                    "Through this network, patients and their families receive compassionate guidance, clear direction, and structured support to access affordable, world-class medical treatment in India.",
                  )}
                </p>

                <h2
                   className="text-xl md:text-2xl font-normal pt-5 text-gray-900 leading-tight"
                  data-trans-managed="true"
                >
                  {t("Community-Driven Support")}
                </h2>
                <p>
                  {t(
                    "MEPSN functions at the grassroots level — within villages, churches, religious institutions, and community groups — serving as trusted guiding hands for families who might otherwise feel lost or overwhelmed.",
                  )}
                </p>
              </div>

              <ul className="space-y-3 mt-5 text-gray-700 text-base font-normal md:text-lg ">
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-gray-600"></div>
                  </div>
                  <span className="flex-1" data-trans-managed="true">
                    {t("Lack of information")}
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-gray-600"></div>
                  </div>
                  <span className="flex-1" data-trans-managed="true">
                    {t(" Limited access to reliable contacts")}
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-gray-600"></div>
                  </div>
                  <span className="flex-1" data-trans-managed="true">
                    {t("Absence of trusted guidance")}
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-gray-600"></div>
                  </div>
                  <span className="flex-1" data-trans-managed="true">
                    {t("Limited digital literacy")}
                  </span>
                </li>
              </ul>

              <div className="space-y-3 text-gray-700 leading-relaxed text-base md:text-lg font-normal mt-6">
                <h2
                  className="text-xl md:text-2xl font-normal pt-5 text-gray-900 leading-tight"
                  data-trans-managed="true"
                >
                  {t("Join the Network")}
                </h2>
                <p>
                  {t(
                    "As the Network continues to expand, we invite compassionate, service-oriented individuals and organizations to join us as Medivisor Community Health Partners and Health Ambassadors.",
                  )}
                </p>

                <p>
                  {t(
                    "If you believe that access to the right medical guidance can transform lives, we welcome you to be part of this mission.",
                  )}
                </p>

                <p>
                  {t(
                    "Together, we can continue building a trusted bridge between communities and world-class medical care.",
                  )}
                </p>
              </div>
            </section>

            {/* Section 4: What You Will Do */}
            <section className="md:rounded-x md:bg-white p-0 md:p-8 md:shadow-sm md:border border-gray-100">
              <div className="mb-4">
                <h2
                  className="text-xl md:text-3xl font-semibold text-gray-900 leading-tight tracking-tight"
                  data-trans-managed="true"
                >
                  {t("What You Will Do")}
                </h2>
              </div>
              <div className="space-y-3 text-gray-700 leading-relaxed text-base md:text-lg font-normal">
                <p>
                  {t(
                    "As a Medivisor Community Health Partner and Health Ambassador, you will be not just performing a role — you will be serving a purpose.",
                  )}
                </p>
                <p
                  className="font-normal text-gray-900 mt-8"
                  data-trans-managed="true"
                >
                  {t("You will:")}
                </p>
                <div className="space-y-4 text-base md:text-lg mt-4">
                  {[
                    "Meet and listen to patients and their families living in your community",
                    "Collect medical reports and share them with us via WhatsApp at +91 8368247758",
                    "Receive the treatment plan and cost quotation from us and help families understand the details clearly",
                    "Guide patients through documentation and travel processes (Medivisor will support you at every step)",
                    "Stay connected with families throughout the treatment journey",
                    "Act as their trusted local support and guidance point",
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                        <div className="h-2 w-2 rounded-full bg-gray-600"></div>
                      </div>
                      <span
                        className="text-gray-700 flex-1 text-base md:text-lg"
                        data-trans-managed="true"
                      >
                        {t(item)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 5: How Medivisor Supports You */}
            <section className="md:rounded-x md:bg-white p-0 md:p-8 md:shadow-sm md:border border-gray-100">
              <div className="mb-4">
                <h2
                  className="text-xl md:text-3xl font-semibold text-gray-900 leading-tight tracking-tight"
                  data-trans-managed="true"
                >
                  {t("How Medivisor India Supports You")}
                </h2>
              </div>
              <div className="space-y-3 text-gray-700 leading-relaxed text-base md:text-lg font-normal">
                <p
                  className="font-normal text-gray-900"
                  data-trans-managed="true"
                >
                  {t("Medivisor India will:")}
                </p>
                <ul className="space-y-4 text-base md:text-lg mt-4">
                  {[
                    "Review and guide all medical cases",
                    "Provide clear treatment plans and cost breakdowns for each case",
                    "Plan and manage treatment in India",
                    "Organise visa and travel",
                    "Handle hospital coordination, stay, and local support",
                    "Provide training, guidance, and working materials",
                    "Stand with you in every patient case",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                        <div className="h-2 w-2 rounded-full bg-gray-600"></div>
                      </div>
                      <span className="text-gray-700 flex-1 text-base md:text-lg" data-trans-managed="true">
                        {t(item)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <p
                    className="font-normal text-gray-900"
                    data-trans-managed="true"
                  >
                    {t("You are never alone in this journey.")}
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6: Sustainability */}
            <section className="md:rounded-x md:bg-white p-0 md:p-8 md:shadow-sm md:border border-gray-100">
              <div className="mb-4">
                <h2
                  className="text-xl md:text-3xl font-semibold text-gray-900 leading-tight tracking-tight"
                  data-trans-managed="true"
                >
                  {t("Sustainability")}
                </h2>
              </div>
              <div className="space-y-3 text-gray-700 leading-relaxed text-base md:text-lg font-normal">
                <p>
                  {t(
                    "To help Community Health Partners serve patients full-time and continue this work sustainably, Medivisor provides a simple and transparent support structure (200 USD) per patient.",
                  )}
                </p>
                <div className=" sm:space-x-8 my-6 gap-4">
                  <div className="flex items-center">
                    <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                      <div className="h-2 w-2 rounded-full bg-gray-600"></div>
                    </div>
                    <span className="text-gray-700 text-base md:text-lg" data-trans-managed="true">
                      {t("Not commission-driven")}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                      <div className="h-2 w-2 rounded-full bg-gray-600"></div>
                    </div>
                    <span className="text-gray-700 text-base md:text-lg" data-trans-managed="true">
                      {t("Not sales-based")}
                    </span>
                  </div>
                </div>
                <p>
                  {t(
                    "It is a dignified and ethical system designed to keep this service alive and accessible.",
                  )}
                </p>
              </div>
            </section>

            {/* Section 7: Who Can Join? */}
            <section className="md:rounded-x md:bg-white p-0 md:p-8 md:shadow-sm md:border border-gray-100">
              <div className="mb-4">
                <h2
                  className="text-xl md:text-3xl font-semibold text-gray-900 leading-tight tracking-tight"
                  data-trans-managed="true"
                >
                  {t("Who Can Join?")}
                </h2>
              </div>
              <div className="space-y-3 text-gray-700 leading-relaxed text-base md:text-lg font-normal">
                <p
                  className="font-normal text-gray-900"
                  data-trans-managed="true"
                >
                  {t("We welcome individuals and organizations who:")}
                </p>
                <div className="space-y-4 text-base md:text-lg mt-4">
                  {[
                    "Are socially motivated and respected in their community",
                    "Have a service-oriented mindset",
                    "Preferably have medical or social sector exposure",
                    "Believe in ethical, patient-first work",
                    "Value blessings, goodwill, and long-term respect over money",
                    "Want to build something meaningful for their community",
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                        <div className="h-2 w-2 rounded-full bg-gray-600"></div>
                      </div>
                      <span
                        className="text-gray-700 flex-1 text-base md:text-lg"
                        data-trans-managed="true"
                      >
                        {t(item)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 8: What Health Ambassadors Will Receive */}
            <section className="md:rounded-x md:bg-white p-0 md:p-8 md:shadow-sm md:border border-gray-100">
              <div className="mb-4">
                <h2
                  className="text-xl md:text-3xl font-semibold text-gray-900 leading-tight tracking-tight"
                  data-trans-managed="true"
                >
                  {t("What Medivisor Health Ambassadors Will Receive")}
                </h2>
              </div>
              <div className="space-y-8">
                <ul className="space-y-4 font-normal text-base md:text-lg">
                  {[
                    "Respect and recognition in your community",
                    "Prayers and blessings from the families you help",
                    "Deep satisfaction from guiding families in their hardest moments",
                    "A transparent, fixed support amount (200 USD) per patient",
                    "The honour of being known as a Medivisor Health Ambassador",
                    "Membership in a regional and international Medivisor network",
                    "Recognition at Medivisor annual events and programmes",
                  ].map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                        <div className="h-2 w-2 rounded-full bg-gray-600"></div>
                      </div>
                      <span
                        className="text-gray-700 flex-1 text-base md:text-lg"
                        data-trans-managed="true"
                      >
                        {t(item)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <p
                  className="text-gray-700 text-base md:text-lg font-normal"
                  data-trans-managed="true"
                >
                  {t(
                    "You will earn respect, purpose, skills, and a sustainable livelihood — while helping save lives.",
                  )}
                </p>
              </div>
            </section>

            {/* Section 9: Together, We Are the Bridge */}
            <section className="md:rounded-x md:bg-white p-0 md:p-8 md:shadow-sm md:border border-gray-100">
              <div className="mb-4">
                <h2
                  className="text-xl md:text-3xl font-semibold text-gray-900 leading-tight tracking-tight"
                  data-trans-managed="true"
                >
                  {t("Together, We Are the Bridge")}
                </h2>
              </div>
              <div className="space-y-3 text-gray-700 leading-relaxed text-base md:text-lg font-normal">
                <p>
                  {" "}
                  {t(
                    " Every patient deserves a chance to heal. Every family deserves guidance and hope. Through the Medivisor Expanded Patient Support Network, we come together as one compassionate community — reaching into villages, churches, and neighbourhoods to ensure that no one suffers in silence. We are more than a network. We are hands that help, hearts that care.",
                  )}
                </p>
                <p>
                  {" "}
                  {t(
                    "If you feel called to serve, to guide families, and to be a source of hope in your community, we invite you to walk this journey with us. Join the Medivisor Expanded Patient Support Network today.",
                  )}
                </p>
              </div>
            </section>

            {/* UPDATED Section 10: MHA Testimonials - Using exact content */}
            <section className="md:rounded-x md:bg-white p-0 md:p-8 md:shadow-sm md:border border-gray-100">
              <div className="mb-4">
                <h2
                  className="text-xl md:text-3xl font-semibold text-gray-900 leading-tight tracking-tight"
                  data-trans-managed="true"
                >
                  {t("Medivisor Health Ambassador Testimonials")}
                </h2>
                <p
                  className="text-gray-600 mt-2 text-base md:text-lg"
                  data-trans-managed="true"
                >
                  {t(
                    "Hear from our amazing Health Ambassadors making a difference",
                  )}
                </p>
                <div className="w-20 h-1 bg-gray-300 mt-4"></div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* MHA Testimonial 1 (Community Focus) */}
                <div className="relative p-6 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all duration-300 group">
                  <div className="absolute -top-2 -left-2 text-5xl text-gray-200 group-hover:text-[#75c044] transition-colors">
                    "
                  </div>
                  <div className="relative">
                     <p className="text-gray-600 leading-relaxed text-base md:text-lg mb-4 italic font-normal">
                       {t(
                        "Before joining Medivisor, many patients in my area didn't know where to go for serious treatment. Today, I feel proud that I can guide families with confidence. Medivisor supports us at every step, and seeing patients return home healthier gives me deep satisfaction.",
                      )}
                    </p>
                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-x-4">
                      <Image
                        src="/png-testimonial/p-7.jpg"
                        alt="Testimonial"
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-full object-cover"
                        loading="lazy"
                      />
                      <p
                        className="text-gray-900 font-normal text-sm"
                        data-trans-managed="true"
                      >
                        {t("— Medivisor Health Ambassador")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* MHA Testimonial 2 (Faith / Service Tone) */}
                <div className="relative p-6 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all duration-300 group">
                  <div className="absolute -top-2 -left-2 text-5xl text-gray-200 group-hover:text-[#75c044] transition-colors">
                    "
                  </div>
                  <div className="relative">
                     <p className="text-gray-600 leading-relaxed text-base md:text-lg mb-4 italic">
                       {t(
                        "This is not just work — it is service. Families come scared and confused, and we help them find hope. Medivisor truly lives by its promise: Hands That Help. Hearts That Care.",
                      )}
                    </p>
                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-x-4">
                      <Image
                        src="/png-testimonial/partner-2.jpg"
                        alt="Testimonial"
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-full object-cover"
                        loading="lazy"
                      />
                      <p className="text-gray-900 font-normal text-sm">
                        {t("— Medivisor Health Ambassador")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* MHA Testimonial 3 (Impact-Oriented) */}
                <div className="relative p-6 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all duration-300 group">
                  <div className="absolute -top-2 -left-2 text-5xl text-gray-200 group-hover:text-[#75c044] transition-colors">
                    "
                  </div>
                  <div className="relative">
                     <p className="text-gray-600 leading-relaxed text-base md:text-lg mb-4 italic">
                       {t(
                        "Being part of the Medivisor Expanded Patient Support Network has changed how my community looks at healthcare. People trust us because we guide them honestly. I feel blessed to be part of something that saves lives.",
                      )}
                    </p>
                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-x-4">
                      <Image
                        src="/png-testimonial/A2.jpg"
                        alt="Testimonial"
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-full object-cover"
                        loading="lazy"
                      />
                      <p className="text-gray-900 font-normal text-sm">
                        {t("— Medivisor Health Ambassador")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* MHA Testimonial 4 (Practical + Emotional) */}
                <div className="relative p-6 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all duration-300 group">
                  <div className="absolute -top-2 -left-2 text-5xl text-gray-200 group-hover:text-[#75c044] transition-colors">
                    "
                  </div>
                  <div className="relative">
                     <p className="text-gray-600 leading-relaxed text-base md:text-lg mb-4 italic">
                       {t(
                        "Medivisor makes everything simple — from reports to treatment planning. I am never alone in any case. But the biggest reward is when families thank you after successful treatment. That feeling cannot be explained.",
                      )}
                    </p>
                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-x-4">
                      <Image
                        src="/png-testimonial/A1.jpg"
                        alt="Testimonial"
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-full object-cover"
                        loading="lazy"
                      />
                      <p className="text-gray-900 font-normal text-sm">
                        {t("— Medivisor Health Ambassador")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* UPDATED Section 11: Patient Testimonials - Using exact content */}
            <section className="md:rounded-x md:bg-white p-0 md:p-8 md:shadow-sm md:border border-gray-100">
              <div className="mb-4">
                <h2
                  className="text-xl md:text-3xl font-semibold text-gray-900 leading-tight tracking-tight"
                  data-trans-managed="true"
                >
                  {t("Patient Testimonials")}
                </h2>
                <p
                  className="text-gray-600 mt-2 text-base md:text-lg"
                  data-trans-managed="true"
                >
                  {t("Stories of hope and healing from families we served")}
                </p>
                <div className="w-20 h-1 bg-gray-300 mt-4"></div>
              </div>

              <div className="space-y-6">
                {/* Patient Testimonial 1 – Family Relief */}
                <div className="relative p-6 bg-gray-50 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-300 border border-transparent hover:border-gray-200">
                  <div className="flex gap-4">
                    <div className="block">
                      <Image
                        className="w-20 h-20 rounded-full object-cover"
                        src="/png-testimonial/p2.jpg"
                        alt="Testimonial"
                        width={80}
                        height={80}
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 leading-relaxed text-base md:text-lg font-normal mb-3">
                        {t(
                          "We were confused and scared because no one could guide us properly. Medivisor helped us understand everything — from reports to treatment in India. Today my husband is recovering well. We will always be thankful.",
                        )}
                      </p>
                      <div className="flex items-center gap-3 text-base">
                        <span className="font-normal text-gray-900">
                          {t("Dicksy Ruenguma")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient Testimonial 2 – Trust & Guidance */}
                <div className="relative p-6 bg-gray-50 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-300 border border-transparent hover:border-gray-200">
                  <div className="flex gap-4">
                    <div className="hidden sm:block">
                      <Image
                        className="w-20 h-20 rounded-full object-cover"
                        src="/png-testimonial/p3.jpg"
                        alt="Testimonial"
                        width={80}
                        height={80}
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 leading-relaxed text-base md:text-lg font-normal mb-3">
                        {t(
                          "Before Medivisor, we went to many places without answers. Through their Health Ambassador, we finally found the right doctors. They treated us like family. God bless the whole team.",
                        )}
                      </p>
                      <div className="flex items-center gap-3 text-base">
                        <span className="font-normal text-gray-900">
                          {t("Steven Peters")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient Testimonial 3 – Child's Treatment */}
                <div className="relative p-6 bg-gray-50 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-300 border border-transparent hover:border-gray-200">
                  <div className="flex gap-4">
                    <div className="hidden sm:block">
                      <Image
                        className="w-20 h-20 rounded-full object-cover"
                        src="/png-testimonial/p4.jpg"
                        alt="Testimonial"
                        width={80}
                        height={80}
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 leading-relaxed text-base md:text-lg font-normal mb-3">
                        {t(
                          "My child needed urgent treatment and we had no idea where to go. Medivisor guided us step by step. From hospital selection to stay in India, everything was handled with care. Today my child is smiling again.",
                        )}
                      </p>
                      <div className="flex items-center gap-3 text-base">
                        <span className="font-normal text-gray-900">
                          {t("Linda Koi")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient Testimonial 4 – Simple & Emotional */}
                <div className="relative p-6 bg-gray-50 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-300 border border-transparent hover:border-gray-200">
                  <div className="flex gap-4">
                    <div className="hidden sm:block">
                      <Image
                        className="w-20 h-20 rounded-full object-cover"
                        src="/png-testimonial/p5.jpg"
                        alt="Testimonial"
                        width={80}
                        height={80}
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 leading-relaxed text-base md:text-lg font-normal mb-3">
                        {t(
                          "Medivisor gave us hope when we had none. They explained everything clearly and supported us throughout the journey. We are grateful beyond words.",
                        )}
                      </p>
                      <div className="flex items-center gap-3 text-base">
                        <span className="font-normal text-gray-900">
                          {t("Frank Minok")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient Testimonial 5 – Community Impact */}
                <div className="relative p-6 bg-gray-50 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-300 border border-transparent hover:border-gray-200">
                  <div className="flex gap-4">
                    <div className="hidden sm:block">
                      <Image
                        className="w-20 h-20 rounded-full object-cover"
                        src="/png-testimonial/p6.jpg"
                        alt="Testimonial"
                        width={80}
                        height={80}
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 leading-relaxed text-base md:text-lg font-normal mb-3">
                        {t(
                          "Because of Medivisor and our local Health Ambassador, many families in our area now know where to seek proper treatment. They truly live by their promise — Hands That Help. Hearts That Care.",
                        )}
                      </p>
                      <div className="flex items-center gap-3 text-base">
                        <span className="font-normal text-gray-900">
                          {t("Johnny Andale")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Form */}
          <div className="lg:col-span-1 sticky top-24">
            <MedivisorForm />
          </div>
        </div>
      </div>
    </main>
  );
}
