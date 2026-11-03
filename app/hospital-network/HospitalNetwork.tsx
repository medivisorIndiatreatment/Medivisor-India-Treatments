"use client"

import { useState } from "react"
import Image from "next/image"
import { MapPin, Phone, Globe, Users, Building2, Award, Stethoscope, Heart, Bone, Baby } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Partners from "@/components/Partners"
import Banner from "@/components/BannerService"
import ContactModal from '@/components/ContactModal';
import WhyChooseUsSection from "@/components/StatsSection"
import CtaSection from "@/components/CtaSection"
import { DESIGN_TOKENS } from "@/components/design-tokens"
import { useTranslatedStrings } from "@/lib/i18n"

// Types
interface Hospital {
  id: string
  name: string
  logo: string
  image: string
  location: string
  phone: string
  website: string
  beds: number
  established: number
  specialties: string[]
  description: string
  achievements: string[]
  category: "multi-specialty" | "cardiac" | "cancer" | "orthopedic" | "pediatric"
}

interface SpecialtyCategory {
  id: string
  name: string
  icon: any
  color: string
}

interface PartnershipBenefit {
  icon: any
  title: string
  description: string
}

// Data
const HOSPITALS: Hospital[] = [
  {
    id: "apollo",
    name: "Apollo Hospitals",
    logo: "/hospital-logo/apollo.svg",
    image: "/hospital-logo/apollo-hospital.webp",
    location: "Multiple Locations across India",
    phone: "+91-1860-500-1066",
    website: "apollohospitals.com",
    beds: 10000,
    established: 1983,
    specialties: ["Cardiology", "Oncology", "Neurology", "Orthopedics", "Transplants"],
    description:
      "Apollo Hospitals is a leading healthcare provider in India, operating over 70 hospitals across 13 countries, offering advanced medical treatments and patient-focused care with top medical teams.",
    achievements: [
      "First hospital in India to perform heart transplant",
      "JCI Accredited",
      "NABH Certified"
    ],
    category: "multi-specialty",
  },
  {
    id: "fortis",
    name: "Fortis Healthcare",
    logo: "/hospital-logo/fortis.png",
    image: "/hospital-logo/Fortis.jpg",
    location: "Pan India Network",
    phone: "+91-92-1234-5678",
    website: "fortishealthcare.com",
    beds: 4500,
    established: 2001,
    specialties: ["Cardiac Sciences", "Neurosciences", "Oncology", "Renal Sciences", "Orthopedics"],
    description:
      "Fortis Healthcare is a leading hospital network in India, with 36 hospitals nationwide, providing high-quality medical services, advanced treatments, and patient-centered care across all specialties.",
    achievements: [
      "NABH Accredited",
      "Green OT Certified",
      "ISO 9001:2015 Certified"
    ],
    category: "multi-specialty",
  },
  {
    id: "max",
    name: "Max Healthcare",
    logo: "/hospital-logo/max-hospital.svg",
    image: "/hospital-logo/max-super-specialit.webp",
    location: "North & West India",
    phone: "+91-92-6666-6666",
    website: "maxhealthcare.in",
    beds: 3500,
    established: 2000,
    specialties: ["Oncology", "Neurosciences", "Cardiac Sciences", "Orthopedics", "Gastroenterology"],
    description:
      "Max Healthcare operates 17 hospitals across North and West India, providing world-class medical services, advanced technologies, and patient-centered care with a team of expert healthcare professionals.",
    achievements: [
      "JCI Accredited",
      "NABL Certified Labs",
      "NABH Accredited"
    ],
    category: "multi-specialty",
  },
  {
    id: "medanta",
    name: "Medanta - The Medicity",
    logo: "/hospital-logo/medanta.svg",
    image: "/hospital-logo/medanta.jpg",
    location: "Gurugram, Delhi NCR",
    phone: "+91-124-414-1414",
    website: "medanta.org",
    beds: 1600,
    established: 2009,
    specialties: ["Cardiac Sciences", "Neurosciences", "Oncology", "Digestive & Hepatobiliary Sciences", "Orthopedics"],
    description:
      "Medanta is a multi-specialty hospital in Gurugram with 1600 beds, offering advanced medical care, cutting-edge technology, and patient-focused treatments across a wide range of specialties.",
    achievements: [
      "JCI Accredited",
      "NABH Certified",
      "NABL Accredited Labs"
    ],
    category: "multi-specialty",
  },
  {
    id: "manipal",
    name: "Manipal Hospitals",
    logo: "/hospital-logo/manipal-hospitals.webp",
    image: "/hospital-logo/manipal.jpeg",
    location: "Pan India Network",
    phone: "+91-80-2502-4444",
    website: "manipalhospitals.com",
    beds: 6000,
    established: 1953,
    specialties: ["Cardiology", "Neurology", "Oncology", "Orthopedics", "Gastroenterology"],
    description:
      "Manipal Hospitals is a leading healthcare provider in India, operating 28 hospitals across 15 cities, offering expert medical care, advanced treatments, and patient-focused services across all specialties.",
    achievements: [
      "NABH Accredited",
      "JCI Accredited Units",
      "NABL Certified"
    ],
    category: "multi-specialty",
  },
  {
    id: "artemis",
    name: "Artemis Hospital",
    logo: "/hospital-logo/artemis-logo1.png",
    image: "/hospital-logo/artemis.jpeg",
    location: "Gurugram, Delhi NCR",
    phone: "+91-124-451-1111",
    website: "artemishospitals.com",
    beds: 600,
    established: 2007,
    specialties: ["Cardiac Sciences", "Neurosciences", "Oncology", "Orthopedics", "Gastroenterology"],
    description:
      "Artemis Hospital is a modern multi-specialty hospital in Gurugram with 600 beds, providing advanced medical care, innovative treatments, and patient-centered services across multiple specialties.",
    achievements: [
      "JCI Accredited",
      "NABH Certified",
      "NABL Accredited"
    ],
    category: "multi-specialty",
  },
];


  // Utils
  const filterHospitals = (hospitals: Hospital[], searchTerm: string, selectedCategory: string) => {
    return hospitals.filter((hospital) => {
      const matchesSearch =
        hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.specialties.some((specialty) => specialty.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCategory = selectedCategory === "all" || hospital.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }

// Components
const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => {
  const [translatedTitle, translatedSubtitle] = useTranslatedStrings([title, subtitle]);
  return (
  <div className="text-center mb-8">
    <h2 className="text-2xl md:text-4xl font-semibold text-[#241d1f] leading-tight tracking-tight mb-2" data-i18n-original={title} data-trans-managed="true">
      {translatedTitle}
    </h2>
    <p className="text-base md:text-lg text-[#241d1f] leading-relaxed max-w-3xl mx-auto" data-i18n-original={subtitle} data-trans-managed="true">
      {translatedSubtitle}
    </p>
  </div>
  )
};

const SpecialtyCard = ({
  category,
  isSelected,
  onClick,
}: {
  category: SpecialtyCategory
  isSelected: boolean
  onClick: () => void
}) => {
  const IconComponent = category.icon
  const [translatedName] = useTranslatedStrings([category.name]);

  return (
    <Card
      className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${isSelected ? "ring-2 ring-blue-500 shadow-xl scale-105" : "hover:shadow-lg"
        }`}
      onClick={onClick}
    >
      <CardContent className="p-6 text-center">
        <div
          className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}
        >
          <IconComponent className="h-8 w-8 text-white" />
        </div>
<h3 className="font-semibold text-gray-900 text-sm" data-i18n-original={category.name} data-trans-managed="true">{translatedName}</h3>
      </CardContent>
    </Card>
  )
}

const HospitalCard = ({ hospital, openModal }: { hospital: Hospital, openModal: () => void }) => {
  const allStrings = useTranslatedStrings([
    hospital.name,
    hospital.location,
    hospital.description,
    "Enquire Now",
  ]);
  const translatedName = allStrings[0];
  const translatedLocation = allStrings[1];
  const translatedDescription = allStrings[2];
  const translatedEnquireNow = allStrings[3];

  return (
  <Card className="overflow-hidden hover:shadow-md transition-all duration-300 group border border-gray-100 bg-white">
    <div className="relative h-60 overflow-hidden">
      <Image
        src={hospital.image || "/placeholder.svg"}
alt={translatedName}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>

    <CardHeader className="pb-3 px-4 md:px-4">
      <div className="flex items-center space-x-3 mb-2">
<CardTitle className="text-xl md:text-xl font-medium text-[#241d1f] leading-tight" data-i18n-original={hospital.name} data-trans-managed="true">
          {translatedName}
        </CardTitle>
      </div>
      <CardDescription className="flex items-center text-base text-[#241d1f]">
        <MapPin className="h-4 w-4 mr-1 text-[#E22026]" />
<span data-i18n-original={hospital.location} data-trans-managed="true">{translatedLocation}</span>
      </CardDescription>
    </CardHeader>

    <CardContent className="pt-0 px-4 md:px-4">
<p className="text-base md:text-lg text-[#241d1f] leading-relaxed mb-4" data-i18n-original={hospital.description} data-trans-managed="true">{translatedDescription}</p>
      <Button
        onClick={openModal}
        className="w-full bg-[#241d1f] hover:bg-[#E22026] text-white font-medium py-2 px-4 rounded-md transition-all"
        data-i18n-original="Enquire Now"
        data-trans-managed="true"
      >
        {translatedEnquireNow}
      </Button>
    </CardContent>
  </Card>
  )
}

const BenefitCard = ({ benefit, index }: { benefit: PartnershipBenefit; index: number }) => {
  const IconComponent = benefit.icon

  return (
    <Card className="text-center hover:shadow-lg transition-all duration-300 border border-gray-100 bg-white">
      <CardContent className="p-6">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <IconComponent className="h-8 w-8 text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-[#241d1f]">{benefit.title}</h3>
        <p className="text-base text-gray-600 leading-relaxed">{benefit.description}</p>
      </CardContent>
    </Card>
  )
}

// Main Component
export default function MediviosHospitalPartners() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  // 👇️ State for controlling the modal's open/close status
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 👇️ Functions to open and close the modal
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

const filteredHospitals = filterHospitals(HOSPITALS, searchTerm, selectedCategory)

  const allStrings = useTranslatedStrings([
    "No hospitals found",
    "Try adjusting your search criteria or category filter",
  ]);

  const translatedNoHospitals = allStrings[0];
  const translatedTryAdjusting = allStrings[1];

  return (
    <>
      <Banner
        topSpanText="Explore Our Hospital Network"
        title="Connecting You to India's Leading Hospitals"
        description="Medivisor India Treatment partners with trusted hospitals across India — from multi-specialty centers to super-specialty institutes. With advanced facilities and expert doctors, you get the right care at the right place. Check below to explore our hospital network."
        buttonText="Find a Hospital"
        buttonLink="#hospital-partners"
        mainImageSrc="/about-main-1.png"
        mainImageAlt="Medivisor India Treatment Hospital Network"
      />

      <Partners />

      {/* Featured Hospital Partners Section */}
      <section className="bg-white py-12 md:py-16" id="hospital-partners">
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
          <SectionHeader
            title="Our Hospital Partners"
            subtitle="Connecting you to India's leading hospitals with advanced facilities and expert doctors"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {filteredHospitals.map((hospital) => (
              <HospitalCard key={hospital.id} hospital={hospital} openModal={openModal} />
            ))}
          </div>
          {filteredHospitals.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Building2 className="h-16 w-16 mx-auto" />
              </div>
<h3 className="text-xl font-semibold text-[#241d1f] mb-2" data-i18n-original="No hospitals found" data-trans-managed="true">{translatedNoHospitals}</h3>
              <p className="text-gray-500" data-i18n-original="Try adjusting your search criteria or category filter" data-trans-managed="true">{translatedTryAdjusting}</p>
            </div>
          )}
        </div>
      </section>

      <WhyChooseUsSection />
      <CtaSection />

      <ContactModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  )
}