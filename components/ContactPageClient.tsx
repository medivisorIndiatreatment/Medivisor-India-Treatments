"use client";

import { useMemo } from "react";
import { MapPin, Phone, Mail, Clock, Globe } from "lucide-react";
import Banner from "@/components/BannerService";
import Contact from "@/components/Contact";
import { getSectionClasses } from "@/components/design-tokens";
import { useTranslatedStrings } from "@/lib/i18n";
import { Trans } from "@/lib/i18n/Trans";
import ContactFaqSection from "@/components/ContactFaqSection";

interface GlobalOffice {
  country: string;
  subtitle: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  isHeadOffice: boolean;
  info: string;
}

interface ContactMethod {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  link: string;
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const globalOffices: GlobalOffice[] = [
  {
    country: "India",
    subtitle: "Head Office",
    address:
      "Medivisor House 359, Sector 1, Vaishali, Ghaziabad, (Delhi/NCR) India",
    phone: "+91 8368 247 758",
    email: "info@medivisorhealth.com",
    hours: "24/7 Support Available",
    isHeadOffice: true,
    info: "As our head office, this location serves as the central hub for all operations. Our dedicated team here coordinates patient logistics, handles international partnerships, and provides round-the-clock support to ensure a seamless medical journey for every patient.",
  },
  {
    country: "Mauritius",
    subtitle: "Regional Office",
    address: "Port Louis, Mauritius",
    phone: "+230 5828 5542",
    email: "mauritius@medivisorhealth.com",
    hours: "Mon-Fri: 9:00 AM - 6:00 PM",
    isHeadOffice: false,
    info: "Our Mauritius office is a key point of contact for patients in the region. We offer personalized consultations, help with visa applications, and provide pre-trip support to make your medical travel from Mauritius to India as smooth as possible.",
  },
  {
    country: "Fiji",
    subtitle: "Regional Office",
    address: "Suva, Fiji",
    phone: "+679 9470588 (Suva), +679 9470527 (Lautoka), +679 9789990 (Labasa)",
    email: "fiji@medivisorhealth.com",
    hours: "Mon-Fri: 8:00 AM - 5:00 PM",
    isHeadOffice: false,
    info: "With multiple contact points across Fiji, we provide extensive local support for patients. Our team assists with medical consultations, helps coordinate travel arrangements, and offers on-the-ground support to ensure your medical journey is well-managed from start to finish.",
  },
  {
    country: "Vanuatu",
    subtitle: "Regional Office",
    address: "Port Vila, Vanuatu",
    phone: "+678 7627430, +678 5213197, +678 7743083",
    email: "vanuatu@medivisorhealth.com",
    hours: "Mon-Fri: 8:00 AM - 5:00 PM",
    isHeadOffice: false,
    info: "The Vanuatu office provides comprehensive medical tourism services, including initial case evaluations and travel planning. Our team is committed to making the process of seeking advanced medical care abroad simple and stress-free for our clients.",
  },
  {
    country: "Solomon Islands",
    subtitle: "Regional Office",
    address: "Honiara, Solomon Islands",
    phone: "+677 7618955",
    email: "solomon@medivisorhealth.com",
    hours: "Mon-Fri: 8:00 AM - 5:00 PM",
    isHeadOffice: false,
    info: "Located in Honiara, our Solomon Islands office specializes in providing medical guidance and logistical support. We help patients connect with top hospitals in India and handle all the necessary arrangements for a safe and comfortable trip.",
  },
  {
    country: "Papua New Guinea",
    subtitle: "Regional Office",
    address: "Port Moresby, PNG",
    phone: "+675 74376546",
    email: "png@medivisorhealth.com",
    hours: "Mon-Fri: 8:00 AM - 5:00 PM",
    isHeadOffice: false,
    info: "Our office in Port Moresby is dedicated to serving patients from Papua New Guinea. We offer expert advice on medical treatments and facilitate all aspects of your medical journey, from arranging doctor appointments to coordinating travel and stay.",
  },
];

const contactMethods: ContactMethod[] = [
  {
    icon: <Phone className="w-7 h-7" />,
    title: "Call Our Medical Advisors",
    description:
      "For immediate assistance or to discuss a medical case, call our dedicated line. Our medical advisors are available 24/7 to provide personalized guidance on your treatment options and help with urgent inquiries. This is the fastest way to get a direct and professional consultation with our expert team.",
    action: "Call Now",
    link: "tel:+918368247758",
  },
  {
    icon: <Mail className="w-7 h-7" />,
    title: "Send Your Medical Reports",
    description:
      "If you have medical records or reports to share, please email us directly. This allows our clinical team to conduct a comprehensive and confidential review of your case. We will get back to you with the most suitable treatment plans, cost estimates, and a list of recommended hospitals, all tailored to your specific needs.",
    action: "Send Email",
    link: "mailto:info@medivisorhealth.com",
  },
  {
    icon: <Globe className="w-7 h-7" />,
    title: "Chat with Us on WhatsApp",
    description:
      "Get quick support and chat with our team on WhatsApp for any questions or help you need. This is the most convenient and instant way to communicate. Whether you have a quick query about our services or need to follow up on an existing case, our support staff is ready to assist you on the go.",
    action: "Chat Now",
    link: "https://wa.me/918340780250",
  },
];

const faqData: FaqItem[] = [
  {
    id: "1",
    question: "How do I book a consultation?",
    answer:
      "Fill out our contact form with your details and medical reports, or call our 24/7 helpline. Our medical advisors will review your case and get back to you within 24 hours.",
  },
  {
    id: "2",
    question: "What information should I include when contacting you?",
    answer:
      "Please share your medical reports, preferred treatment, and any questions you have. Our team will assess your case and provide a detailed treatment plan with cost estimates.",
  },
  {
    id: "3",
    question: "Do you provide support in my local language?",
    answer:
      "Yes, our multilingual support team assists patients in several languages. Contact us to confirm the languages available for your region.",
  },
  {
    id: "4",
    question: "Can I get help with travel and accommodation?",
    answer:
      "Absolutely. Our team arranges airport pickup, hotel stays, local transport, and visa assistance to make your medical journey seamless.",
  },
  {
    id: "5",
    question: "Where are your offices located?",
    answer:
      "We have a head office in India and regional offices in Mauritius, Fiji, Vanuatu, Solomon Islands, and Papua New Guinea. See our global offices section for full addresses and contact details.",
  },
];

const BANNER_TEXTS = {
  topSpan: "Get in Touch with Us",
  title: "We're Here to Assist You Anytime",
  description:
    "Have questions, need support, or want to learn more about our healthcare services? Reach out to Medivisor India and our team will be happy to guide you with the right information and assistance.",
};

const FAQ_TITLE = "Frequently Asked Questions";

export default function ContactPageClient() {
  const allStrings = useMemo(() => {
    const strings: string[] = [];
    globalOffices.forEach((o) => {
      strings.push(o.country, o.subtitle, o.address, o.hours, o.info);
    });
    contactMethods.forEach((m) => {
      strings.push(m.title, m.description, m.action);
    });
    strings.push(
      "Connect with Our Global Offices",
      "We have a dedicated team ready to assist you in multiple locations around the world.",
      "HEAD OFFICE",
      BANNER_TEXTS.topSpan,
      BANNER_TEXTS.title,
      BANNER_TEXTS.description,
      FAQ_TITLE,
    );
    faqData.forEach((f) => {
      strings.push(f.question, f.answer);
    });
    return strings;
  }, []);

  const translated = useTranslatedStrings(allStrings);

  const translationMap = useMemo(() => {
    const map = new Map<string, string>();
    allStrings.forEach((original, i) => {
      map.set(original, translated[i] ?? original);
    });
    return map;
  }, [allStrings, translated]);

  const t = (text: string): string => {
    if (!text) return text;
    return translationMap.get(text) ?? text;
  };

  const translatedGlobalTitle = t("Connect with Our Global Offices");
  const translatedGlobalSubtitle = t(
    "We have a dedicated team ready to assist you in multiple locations around the world."
  );
  const translatedHeadOffice = t("HEAD OFFICE");
  const translatedFaqTitle = t(FAQ_TITLE);

  return (
    <div className="min-h-screen bg-gray-50">
      <Banner
        topSpanText={BANNER_TEXTS.topSpan}
        title={BANNER_TEXTS.title}
        description={BANNER_TEXTS.description}
        mainImageSrc="/about-main-1.png"
        mainImageAlt="Contact Medivisor India Support"
      />

      <section className={getSectionClasses(0, { py: "lg" })}>
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {contactMethods.map(({ icon, title, description, action, link }, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md p-8 text-center transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto mb-6 text-[#29A9B9] transition-all duration-300">
                  {icon}
                </div>
                <h3
                  className="text-xl font-bold text-gray-900 mb-3"
                  data-i18n-original={title}
                  data-trans-managed="true"
                >
                  {t(title)}
                </h3>
                <p
                  className="text-gray-700 mb-6 leading-relaxed"
                  data-i18n-original={description}
                  data-trans-managed="true"
                >
                  {t(description)}
                </p>
                <a
                  href={link}
                  className="inline-flex items-center justify-center bg-gray-100 text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-200 transition-all duration-300 font-medium shadow-sm hover:shadow-md"
                  data-i18n-original={action}
                  data-trans-managed="true"
                >
                  {t(action)}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="bg-gray-50">
        <Contact />
      </div>

      <section className={getSectionClasses(1, { py: "lg" })} id="global-offices">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2
              className="text-3xl md:text-4xl mb-3 font-bold text-gray-900 tracking-tight"
              data-i18n-original="Connect with Our Global Offices"
              data-trans-managed="true"
            >
              {translatedGlobalTitle}
            </h2>
            <p
              className="text-lg text-gray-600 max-w-3xl mx-auto"
              data-i18n-original="We have a dedicated team ready to assist you in multiple locations around the world."
              data-trans-managed="true"
            >
              {translatedGlobalSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {globalOffices.map(
              (
                {
                  country,
                  subtitle,
                  address,
                  phone,
                  email,
                  hours,
                  isHeadOffice,
                  info,
                },
                index
              ) => (
                <div
                  key={index}
                  className={`group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-5 relative ${
                    isHeadOffice ? "border-gray-200" : ""
                  }`}
                >
                  {isHeadOffice && (
                      <div
                      className="absolute top-0 inset-inline-start bg-[#23366E] text-white text-xs font-bold px-3 py-1.5 rounded-b-lg"
                      data-i18n-original="HEAD OFFICE"
                      data-trans-managed="true"
                    >
                      {translatedHeadOffice}
                    </div>
                  )}
                  <div className="flex flex-col mb-4 mt-6">
                    <h3
                      className={`text-2xl font-bold mb-1 ${
                        isHeadOffice ? "text-[#23366E]" : "text-gray-900"
                      }`}
                      data-i18n-original={country}
                      data-trans-managed="true"
                    >
                      {t(country)}
                    </h3>
                    <span
                      className="text-sm font-medium text-gray-500 uppercase tracking-wide"
                      data-i18n-original={subtitle}
                      data-trans-managed="true"
                    >
                      {t(subtitle)}
                    </span>
                  </div>

                  <div className="mb-6">
                    <p
                      className="text-gray-700 leading-relaxed text-sm"
                      data-i18n-original={info}
                      data-trans-managed="true"
                    >
                      {t(info)}
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center me-4 group-hover:bg-gray-100 transition-all duration-300">
                        <MapPin className="w-5 h-5 text-gray-500" />
                      </div>
                      <p
                        className="text-gray-700 leading-relaxed font-medium mt-1"
                        data-i18n-original={address}
                        data-trans-managed="true"
                      >
                        {t(address)}
                      </p>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center me-4 group-hover:bg-gray-100 transition-all duration-300">
                        <Phone className="w-5 h-5 text-gray-500" />
                      </div>
                       <div className="space-y-1 mt-1">
                         {phone.includes(",")
                           ? phone
                               .split(",")
                               .map((p, idx) => (
                                 <a
                                   key={idx}
                                   href={`tel:${p.trim().split(" ")[0]}`}
                                   className="block text-gray-700 hover:text-[#29A9B9] transition-colors duration-300 font-medium"
                                 >
                                   {p.trim()}
                                 </a>
                               ))
                           : (
                             <a
                               href={`tel:${phone}`}
                               className="block text-gray-700 hover:text-[#29A9B9] transition-colors duration-300 font-medium"
                             >
                               {phone}
                             </a>
                           )}
                      </div>
                    </div>

                     <div className="flex items-start">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center me-4 group-hover:bg-gray-100 transition-all duration-300">
                        <Mail className="w-5 h-5 text-gray-500" />
                      </div>
                      <a
                        href={`mailto:${email}`}
                        className="text-gray-700 hover:text-[#29A9B9] transition-colors duration-300 font-medium mt-1"
                      >
                        {email}
                      </a>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center me-4 group-hover:bg-gray-100 transition-all duration-300">
                        <Clock className="w-5 h-5 text-gray-500" />
                      </div>
                      <p
                        className={`font-semibold mt-1 ${
                          isHeadOffice ? "text-[#23366E]" : "text-gray-700"
                        }`}
                        data-i18n-original={hours}
                        data-trans-managed="true"
                      >
                        {t(hours)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <ContactFaqSection faqData={faqData} title={FAQ_TITLE} />
    </div>
  );
}
