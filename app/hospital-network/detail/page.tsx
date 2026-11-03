"use client"
import type React from "react"
import { useState, useEffect } from "react"
import {
    Star,
    MapPin,
    Phone,
    Calendar,
    Clock,
    Award,
    Heart,
    Shield,
    CheckCircle,
    MessageCircle,
    ChevronDown,
    ChevronUp,
    Plane,
    FileText,
    Languages,
    CreditCard,
    Hospital,
    Stethoscope,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ContactModal from "@/components/ContactModal"

interface HospitalProfile {
    _id: string
    name: string
    photo: string
    description: string
    specializations: string[]
    keyServices: string[]
    bedCount: number
    accreditations: string[]
    contactEmail: string
    contactPhone: string
    rating: number
    reviewsCount: number
    establishedYear: number
    location: string
    internationalServices: {
        visaAssistance: boolean
        travelConcierge: boolean
        airportPickup: boolean
        icuFacilities: boolean
        languageInterpreter: string[]
    }
    affiliatedDoctors: Array<{
        id: string
        name: string
        specialty: string
        photo: string
        yearsOfExperience: number
    }>
    faqs: Array<{
        q: string
        a: string
    }>
    testimonials: Array<{
        id: number
        name: string
        country: string
        rating: number
        text: string
    }>
}

const mockHospital: HospitalProfile = {
    _id: "hosp1",
    name: "Global Care Hospital",
    photo:
        "https://images.pexels.com/photos/3324209/pexels-photo-3324209.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    description:
        "Global Care Hospital is a leading multi-specialty healthcare institution committed to providing compassionate and state-of-the-art medical services. With a team of world-class physicians and advanced technology, we offer comprehensive care across a wide range of specialties.",
    specializations: ["Cardiology", "Oncology", "Neurology", "Orthopedics", "Gastroenterology"],
    keyServices: [
        "Emergency Services",
        "Intensive Care Unit (ICU)",
        "Advanced Diagnostics",
        "Robotic Surgery",
        "Telemedicine",
    ],
    bedCount: 500,
    accreditations: ["JCI Accredited", "NABH Certified"],
    contactEmail: "info@globalcare.com",
    contactPhone: "+91 91234 56789",
    rating: 4.8,
    reviewsCount: 1250,
    establishedYear: 2005,
    location: "New Delhi, India",
    internationalServices: {
        visaAssistance: true,
        travelConcierge: true,
        airportPickup: true,
        icuFacilities: true,
        languageInterpreter: ["English", "Arabic", "Russian"],
    },
    affiliatedDoctors: [
        {
            id: "doc1",
            name: "Dr. Sarah Johnson",
            specialty: "Interventional Cardiology",
            photo: "https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=1200",
            yearsOfExperience: 18,
        },
        {
            id: "doc2",
            name: "Dr. Alok Sharma",
            specialty: "Orthopedic Surgeon",
            photo:
                "https://images.pexels.com/photos/6698691/pexels-photo-6698691.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
            yearsOfExperience: 15,
        },
    ],
    faqs: [
        {
            q: "What are the visiting hours?",
            a: "Visiting hours are from 10:00 AM to 1:00 PM and 4:00 PM to 7:00 PM daily. Please check with the ward for specific rules.",
        },
        {
            q: "Do you accept international insurance?",
            a: "Yes, we work with a wide range of international insurance providers. Please contact our international patient services team for details.",
        },
        {
            q: "How can I get a cost estimate for a procedure?",
            a: "You can request a cost estimate by filling out the inquiry form or contacting our patient services team directly via email or phone.",
        },
    ],
    testimonials: [
        {
            id: 1,
            name: "David M.",
            country: "USA",
            rating: 5,
            text: "The care at Global Care Hospital was exceptional. The staff was incredibly supportive and professional.",
        },
        {
            id: 2,
            name: "Layla A.",
            country: "Saudi Arabia",
            rating: 5,
            text: "A truly world-class facility. The seamless process from travel to treatment made everything easy.",
        },
    ],
}

const HospitalDetails: React.FC = () => {
    const [hospital, setHospital] = useState<HospitalProfile | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

    useEffect(() => {
        // Simulate API call
        const timer = setTimeout(() => {
            setHospital(mockHospital)
        }, 500)
        return () => clearTimeout(timer)
    }, [])

    const openModal = () => {
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
    }

    if (!hospital) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[#241d1f] text-lg">Loading hospital profile...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white py-10">
                <div className="container mx-auto px-5 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                        {/* Hospital Image */}
                        <div className="lg:col-span-1">
                            <div className="relative">
                                <img
                                    src={hospital.photo || "/placeholder.svg"}
                                    alt={hospital.name}
                                    className="w-full h-80 rounded-xs object-cover shadow-xs border border-gray-100"
                                />
                                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-xs">
                                    <span className="text-sm font-medium text-[#241d1f]">Est. {hospital.establishedYear}</span>
                                </div>
                            </div>
                        </div>

                        {/* Hospital Information */}
                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3 text-balance">{hospital.name}</h1>
                                <p className="text-xl text-[#241d1f] font-medium mb-4">
                                    {hospital.specializations.slice(0, 3).join(" • ")}
                                </p>

                                <div className="flex flex-wrap items-center gap-2 mb-6">
                                    <div className="flex items-center bg-gray-50 px-4 py-2 rounded-md shadow-xs">
                                        <div className="flex text-yellow-400 mr-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-5 h-5 ${i < Math.floor(hospital.rating) ? "fill-current" : ""}`} />
                                            ))}
                                        </div>
                                        <span className="text-[#241d1f] font-semibold text-lg">{hospital.rating}</span>
                                        <span className="text-gray-500 ml-1">({hospital.reviewsCount} reviews)</span>
                                    </div>

                                    <div className="flex items-center text-[#241d1f] bg-gray-50 px-4 py-2 rounded-md shadow-xs">
                                        <MapPin className="w-5 h-5 mr-2 text-[#241d1f]" />
                                        <span className="font-medium">{hospital.location}</span>
                                    </div>

                                    <div className="flex items-center text-[#241d1f] bg-gray-50 px-4 py-2 rounded-md shadow-xs">
                                        <Hospital className="w-5 h-5 mr-2 text-[#241d1f]" />
                                        <span className="font-medium">{hospital.bedCount} Beds</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[#241d1f] text-lg leading-relaxed mb-8">{hospital.description}</p>


                        </div>
                    </div>
                </div>
            </div>

            <section className="py-10 bg-gray-50">
                <div className="container mx-auto px-5 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-xs p-8 shadow-xs border border-gray-100">
                                <h2 className="text-3xl font-bold text-gray-900 mb-8">Medical Services & Specialties</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                            <Stethoscope className="w-6 h-6 mr-3 text-[#241d1f]" />
                                            Core Specializations
                                        </h3>
                                        <div className="space-y-4">
                                            {hospital.specializations.map((spec, index) => (
                                                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                                    <CheckCircle className="w-5 h-5 text-[#241d1f] mr-3 flex-shrink-0" />
                                                    <span className="text-gray-800 font-medium">{spec}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                            <Hospital className="w-6 h-6 mr-3 text-[#74BF44]" />
                                            Key Services
                                        </h3>
                                        <div className="space-y-4">
                                            {hospital.keyServices.map((service, index) => (
                                                <div key={index} className="flex items-center p-3 bg-[#74BF44]/10 rounded-lg">
                                                    <CheckCircle className="w-5 h-5 text-[#74BF44] mr-3 flex-shrink-0" />
                                                    <span className="text-gray-800 font-medium">{service}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>



                            <div className="bg-white rounded-xs p-8 shadow-xs border border-gray-100">
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">International Patient Services</h2>
                                <p className="text-[#241d1f] text-lg mb-8 leading-relaxed">
                                    Comprehensive support for international patients seeking world-class medical care with personalized
                                    assistance throughout your journey.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 rounded-xs p-6 border border-gray-200">
                                        <div className="flex items-center mb-4">
                                            <div className="w-12 h-12 bg-white rounded-xs flex items-center justify-center mr-4">
                                                <FileText className="w-6 h-6 text-[#241d1f]" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">Visa & Documentation</h3>
                                        </div>
                                        <p className="text-[#241d1f] leading-relaxed">
                                            Complete assistance with medical visa applications, invitation letters, and all required
                                            documentation for seamless travel.
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 rounded-xs p-6 border border-gray-200">
                                        <div className="flex items-center mb-4">
                                            <div className="w-12 h-12 bg-white rounded-xs flex items-center justify-center mr-4">
                                                <Plane className="w-6 h-6 text-[#241d1f]" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">Travel Concierge</h3>
                                        </div>
                                        <p className="text-[#241d1f] leading-relaxed">
                                            Airport transfers, accommodation booking, local transportation, and 24/7 support during your stay.
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 rounded-xs p-6 border border-gray-200">
                                        <div className="flex items-center mb-4">
                                            <div className="w-12 h-12 bg-white rounded-xs flex items-center justify-center mr-4">
                                                <Languages className="w-6 h-6 text-[#241d1f]" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">Language Support</h3>
                                        </div>
                                        <p className="text-[#241d1f] leading-relaxed">
                                            Professional medical interpreters fluent in{" "}
                                            {hospital.internationalServices.languageInterpreter.join(", ")} and more.
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 rounded-xs p-6 border border-gray-200">
                                        <div className="flex items-center mb-4">
                                            <div className="w-12 h-12 bg-white rounded-xs flex items-center justify-center mr-4">
                                                <CreditCard className="w-6 h-6 text-[#241d1f]" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">Insurance & Billing</h3>
                                        </div>
                                        <p className="text-[#241d1f] leading-relaxed">
                                            Insurance verification, transparent pricing, flexible payment options, and direct billing
                                            assistance.
                                        </p>
                                    </div>
                                </div>

                            </div>

                            <div className="bg-white rounded-xs p-8 shadow-xs border border-gray-100">
                                <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
                                <div className="space-y-4">
                                    {hospital.faqs.map((faq, index) => (
                                        <div key={index} className="border border-gray-200 rounded-md overflow-hidden shadow-xs">
                                            <button
                                                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                                className="w-full px-6 py-4 text-left flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                                            >
                                                <span className="font-semibold text-lg text-gray-900">{faq.q}</span>
                                                {expandedFaq === index ? (
                                                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                                )}
                                            </button>
                                            {expandedFaq === index && (
                                                <div className="px-6 py-4 bg-white border-t border-gray-200">
                                                    <p className="text-[#241d1f] leading-relaxed">{faq.a}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1  h-full sticky top-0 space-y-6">
                            {/* Accreditations Card */}
                            <div className="bg-white  rounded-xs p-6 shadow-xs border border-gray-100">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                    <Shield className="w-6 h-6 mr-3 text-[#74BF44]" />
                                    Accreditations
                                </h3>
                                <div className="space-y-4">
                                    {hospital.accreditations.map((accreditation, index) => (
                                        <div key={index} className="flex items-center p-3 bg-[#74BF44]/10 rounded-lg border border-gray-200">
                                            <Award className="w-5 h-5 text-[#74BF44] mr-3 flex-shrink-0" />
                                            <span className="text-gray-800 font-medium">{accreditation}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Info Card */}
                            <div className="bg-white rounded-xs p-6 shadow-xs border border-gray-100">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Information</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                        <MapPin className="w-5 h-5 text-[#241d1f] mr-3" />
                                        <div>
                                            <span className="text-sm text-[#241d1f] block">Location</span>
                                            <span className="text-gray-900 font-medium">{hospital.location}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                        <Hospital className="w-5 h-5 text-[#241d1f] mr-3" />
                                        <div>
                                            <span className="text-sm text-[#241d1f] block">Bed Capacity</span>
                                            <span className="text-gray-900 font-medium">{hospital.bedCount} Beds</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                        <Clock className="w-5 h-5 text-[#241d1f] mr-3" />
                                        <div>
                                            <span className="text-sm text-[#241d1f] block">Established</span>
                                            <span className="text-gray-900 font-medium">{hospital.establishedYear}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Card className="bg-white border-gray-100 shadow-xs">
                                <CardContent className="p-4 text-center">
                                    <Heart className="w-8 h-8 text-[#241d1f] mx-auto mb-3" />
                                    <h3 className="text-2xl font-bold text-[#241d1f] mb-2">Need Medical Consultation?</h3>
                                    <p className="text-[#241d1f] mb-4 text-lg text-pretty">
                                        Book an appointment with Dr. Mithal for expert endocrinology care.
                                    </p>
                                    <button className="w-full flex justify-center bg-primary text-lg text-[#241d1f] hover:bg-primary/90">
                                        <Calendar className="w-6 h-6 mr-2" />
                                        Schedule Appointment
                                    </button>
                                    <div className="mt-4 pt-4 border-t border-gray-300">
                                        <div className="flex items-center justify-center text-[#241d1f] text-lg">
                                            <Phone className="w-5 h-5 mr-1" />
                                            {/* <span>{doctor.contactPhone}</span> */}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Modal */}
            <ContactModal isOpen={isModalOpen} onClose={closeModal} />
        </div>
    )
}

export default HospitalDetails
