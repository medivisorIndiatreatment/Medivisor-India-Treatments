"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Heart, Users, Calendar, ChefHat, MapPin } from "lucide-react";
import { Trans } from '@/lib/i18n/Trans';

const initiatives = [
  {
    title: "Dedicated Night Emergency Response Team",
    description: `When managing the diverse challenges of overseas patients, thorough preparation and heightened caution are paramount. This extends beyond routine care to encompass readiness for emergencies, which can occur at any hour, including during the night. It's imperative for the responsible organization to ensure 24/7 availability for patient care.

Recognizing this critical need, Medivisor has implemented a dedicated night emergency response team to swiftly address nighttime medical crises. During daytime hours, our twenty-five member patient care team, strategically stationed in and around the hotel and hospital vicinity, adeptly attends to patients' requirements, ensuring comprehensive support round the clock.`,
    imageUrl: "/night-emergancy.jpg",
    icon: Clock,
    color: "from-red-500 to-red-600",
  },
  {
    title: "Supportive Accommodation for Cancer Patients",
    description: `Battling cancer brings forth not only physical and emotional challenges but also substantial financial strains. In our dedication to alleviating these burdens, we offer a complete waiver of accommodation costs after the initial three-month stay at Medivisor House, our comfortable lodging for patients and caregivers. During the first three months, they only cover 50% of the actual accommodation expenses.`,
    imageUrl: "/breast-cancer-support-fight-care.jpg",
    icon: Heart,
    color: "from-red-500 to-red-600",
  },
  {
    title: "Dedicated Female Staff for Enhanced Patient Comfort",
    description: `Recognizing the significance of ensuring a comfortable journey for our female patients, we exclusively assign female staff to provide on-ground assistance, fostering a nurturing and secure atmosphere throughout their medical experience. Furthermore, for cases involving female patients and attendants, we deploy female staff exclusively for airport pick-up and drop-off services. This initiative is aimed at bolstering the sense of safety and comfort for our female guests right from the outset.`,
    imageUrl: "/female-staff.jpg",
    icon: Users,
    color: "from-red-500 to-red-600",
  },
  {
    title: "Social Events",
    description: `Embracing the belief that maintaining a positive environment and mindset is integral to swifter healing and recovery, we at Medivisor curate a variety of social events regularly. These endeavors are not only geared towards alleviating boredom but also aim to cultivate a vibrant atmosphere that positively impacts the mental and emotional well-being of our patients.`,
    imageUrl: "/holi-celebration.jpg",
    icon: Calendar,
    color: "from-red-500 to-red-600",
  },
  {
    title: "Home-Style Food",
    description: `It can be challenging for patients staying in hotels to find food that suits their needs. The different cooking methods, spice levels, and excessive use of oil may not be to their liking. At Medivisor, we understand the importance of nutrition in promoting quick recovery. That's why we've launched the Medivisor Fiji Kitchen, where a chef skilled in traditional Fijian cuisine prepares authentic meals. Our homemade dishes bring the comfort of home, providing a smooth experience even during long-term treatments.`,
    imageUrl: "/Image-empty-state.avif",
    icon: ChefHat,
    color: "from-red-500 to-red-600",
  },
  {
    title: "Complimentary Taj Mahal Trip",
    description: `Financial limitations often hinder patients and their companions from venturing beyond the confines of their hotel and hospital. We hold the belief that visitors to India, particularly Delhi, should have the chance to experience the Taj Mahal—a renowned wonder of the world, celebrated for its timeless beauty and architectural grandeur. We are committed to ensuring that every patient, irrespective of financial constraints, has the opportunity to behold this breathtaking monument. Thus, we extend a complimentary round trip to the Taj Mahal to all our medical guests.`,
    imageUrl: "/9a90e8_f184415b0c464dbf94c4aefa167ecc74~mv2.avif",
    icon: MapPin,
    color: "from-red-500 to-red-600",
  },
];

export default function OurInitiativesSection() {
  const [active, setActive] = useState(0);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    const last = initiatives.length - 1;
    let next = idx;
    if (e.key === "ArrowRight") next = (idx + 1) % initiatives.length;
    if (e.key === "ArrowLeft") next = (idx - 1 + initiatives.length) % initiatives.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = last;

    if (next !== idx) {
      e.preventDefault();
      setActive(next);
      tabsRef.current[next]?.focus();
    }
  };

  const ActiveIcon = initiatives[active].icon;

  return (
    <section className="py-10">
      <div className="container mx-auto">
        {/* Header */}


        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Tabs */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-0"
            >


            </motion.div>
            <div className="sticky top-10 space-y-3">
<h2 className="text-3xl md:text-4xl font-bold text-[#241d1f] mb-4" data-i18n="initiatives.title" data-i18n-original="Our Initiatives">
                <Trans id="initiatives.title">Our Initiatives</Trans>
              </h2>
              <p className="text-lg text-[#241d1f] max-w-2xl mb-16 mx-auto" data-i18n="initiatives.subtitle" data-i18n-original="Going beyond treatment — our patient-first innovations ensure safety, comfort, and unforgettable care journeys.">
                <Trans id="initiatives.subtitle">Going beyond treatment — our patient-first innovations ensure safety, comfort, and unforgettable care journeys.</Trans>
              </p>
              {initiatives.map((item, i) => {
                const Icon = item.icon;
                const isActive = active === i;
                return (
                  <motion.button
                    key={item.title}
                    ref={(el) => { if (el) tabsRef.current[i] = el }}
                    onClick={() => setActive(i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`panel-${i}`}
                    tabIndex={isActive ? 0 : -1}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className={`flex items-center gap-3 w-full p-4 rounded-md border transition-all duration-300
                      ${isActive
                        ? "bg-white border-red-300 shadow-lg text-red-700"
                        : "bg-white/60 border-gray-200 hover:border-red-200 hover:bg-white"}`}
                  >
                    <div
                      className={`p-2 rounded-lg ${isActive
                          ? `bg-gradient-to-r ${item.color} text-white`
                          : "bg-gray-100 text-gray-500"
                        }`}
                    >
                      <Icon size={20} />
                    </div>
<span className="text-sm md:text-base" data-i18n-original={item.title}>{item.title}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                id={`panel-${active}`}
                role="tabpanel"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${initiatives[active].color} text-white`}>
                    <ActiveIcon size={28} />
                  </div>
<h3 className="text-3xl font-medium text-gray-800" data-i18n-original={initiatives[active].title}>{initiatives[active].title}</h3>
                </div>

                <div className="relative rounded-md overflow-hidden shadow-lg mb-6">
                  <Image
                    src={initiatives[active].imageUrl}
                    alt={initiatives[active].title}
                    width={800}
                    height={400}
                    className="object-cover w-full h-auto"
                  />
                </div>

                <div className="text-[#241d1f] text-lg space-y-4">
                  {initiatives[active].description
                    .split("\n\n")
.map((p, idx) => <p key={idx} data-i18n-original={p}>{p}</p>)}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
