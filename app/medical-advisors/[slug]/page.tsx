

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { wixServerClient } from "@/lib/wix";
import { getBestCoverImage } from "@/lib/wixMedia";
import { BackButton } from "@/components/BackButton";
import { OptimizedImage } from "@/components/optimized-image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Phone,
    MessageCircle,
    MapPin,
    GraduationCap,
    Award,
    Briefcase,
    Languages,
    Stethoscope,
    Clock,
    Star,
} from "lucide-react";
import Link from "next/link";
import type { MedicalAdvisor } from "@/types/medicalAdvisor";
import { ReadMoreButton } from "@/components/read-more-button";
import { generateSlug } from "@/lib/slug-utils";
import { stripHtmlTags } from "@/lib/cms";

// Helper function to format specialty interests
function formatSpecialtyInterests1(data: any): string[] | null {
  if (!data) return null;
  if (Array.isArray(data)) {
    return data.map((item: any) => item.trim());
  }
  if (typeof data === "string") {
    return data.split("|").map((item: string) => item.trim());
  }
  return null;
}

// Helper to strip HTML from title
function cleanTitle(title: string | undefined | null): string {
  if (!title) return ""
  return stripHtmlTags(title)
}

const COLLECTION_ID = "Import2";

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

// Function to fetch doctor by slug - uses centralized generateSlug
async function getDoctorBySlug(slug: string): Promise<MedicalAdvisor | null> {
    try {
        let response = await wixServerClient.items
            .query(COLLECTION_ID)
            .eq("slug", slug)
            .limit(1)
            .find({ consistentRead: true });

        if (response.items && response.items.length > 0) {
            const item = response.items[0];
            return {
                _id: item._id,
                name: item.name || "Medical Advisor",
                title: item.Title || item.title,
                specialty: item.specialty,
                image: item.image,
                experience: item.experience,
                languages: item.languages,
                hospitals: item.hospitals,
                contactPhone: item.contactPhone,
                whatsapp: item.whatsapp,
                about: item.about,
                workExperience: item.workExperience,
                education: item.education,
                memberships: item.memberships,
                awards: item.awards,
                specialtyInterests1: formatSpecialtyInterests1(item.specialtyInterests1),
                slug: item.slug,
            } as MedicalAdvisor;
        }

        // Fallback if slug is not in the database (less efficient)
        response = await wixServerClient.items
            .query(COLLECTION_ID)
            .limit(100)
            .find({ consistentRead: true });

        if (!response.items) {
            return null;
        }

        const doctor = response.items.find((item: any) => {
            const generatedSlug = generateSlug(item.name || "");
            return generatedSlug === slug;
        });

        if (doctor) {
            return {
                _id: doctor._id,
                name: doctor.name || "Medical Advisor",
                title: doctor.Title || doctor.title,
                specialty: doctor.specialty,
                image: doctor.image,
                experience: doctor.experience,
                languages: doctor.languages,
                hospitals: doctor.hospitals,
                contactPhone: doctor.contactPhone,
                whatsapp: doctor.whatsapp,
                about: doctor.about,
                workExperience: doctor.workExperience,
                education: doctor.education,
                memberships: doctor.memberships,
                awards: doctor.awards,
                specialtyInterests1: formatSpecialtyInterests1(doctor.specialtyInterests1),
                slug: doctor.slug,
            } as MedicalAdvisor;
        }

        return null;
    } catch (error) {
        console.error("Error fetching doctor by slug:", error);
        return null;
    }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const doctor = await getDoctorBySlug(slug);

    if (!doctor) {
        return {
            title: "Doctor Not Found | Medivisor India",
            description: "The requested doctor profile could not be found.",
        };
    }

    const doctorName = doctor.name || "Medical Advisor";
    const specialty = doctor.specialty || "Medical Specialist";
    const specialtyInterests1 = doctor.specialtyInterests1?.join(", ") || "";
    const experience = doctor.experience || "";

    const siteUrl = 'https://medivisorindiatreatment.com';
    const pageUrl = `${siteUrl}/medical-advisors/${slug}`;

    // Process image for OG
    const doctorImage = doctor.image || '';
    let ogImage = '';
    if (doctorImage) {
        if (doctorImage.startsWith('wix:image://')) {
            ogImage = getBestCoverImage(doctor) || doctor.image || '';
        } else if (doctorImage.startsWith('http')) {
            ogImage = doctorImage;
        }
    }
    if (!ogImage) {
        ogImage = `${siteUrl}/logo_medivisor.png`;
    }

    return {
        title: `${doctorName} - ${specialty} | Medivisor India`,
        description: `Meet ${doctorName}, ${specialty} at Medivisor India. ${doctor.about ? doctor.about.substring(0, 160) + "..." : `Expert medical advisor${experience ? ` with ${experience} experience` : ""}.`}`,
        keywords: `${doctorName}, ${specialty}, Medivisor India, medical advisor, healthcare India, ${specialtyInterests1}`,

        metadataBase: new URL(siteUrl),
        alternates: {
            canonical: pageUrl,
        },

        openGraph: {
            type: 'profile',
            locale: 'en_US',
            url: pageUrl,
            siteName: 'Medivisor India Treatment',
            title: `${doctorName} - ${specialty} | Medivisor India`,
            description: `Expert medical advisor at Medivisor India${experience ? ` with ${experience} experience` : ""} in ${specialty}.`,
            images: [{
                url: ogImage,
                secureUrl: ogImage,
                width: 1200,
                height: 630,
                type: 'image/jpeg',
                alt: `${doctorName} - ${specialty} | Medivisor`,
            }],
        },

        twitter: {
            card: 'summary_large_image',
            title: `${doctorName} - ${specialty} | Medivisor`,
            description: `Expert medical advisor at Medivisor India${experience ? ` with ${experience} experience` : ""}.`,
            site: '@medivisorindiatreatment',
            creator: '@medivisorindiatreatment',
            images: [{
                url: ogImage,
                width: 1200,
                height: 630,
                alt: `${doctorName} - ${specialty} | Medivisor`,
            }],
        },

        robots: {
            index: true,
            follow: true,
        },
    };
}

export default async function DoctorDetailPage({ params }: PageProps) {
    const { slug } = await params
    const doctor = await getDoctorBySlug(slug);

    if (!doctor) {
        notFound();
    }

    const imageUrl = getBestCoverImage(doctor) || doctor.image;
    const aboutText = doctor.about || "";
    const specialtyInterests1 = Array.isArray(doctor.specialtyInterests1) ? doctor.specialtyInterests1 : [];

    return (
        <main className="min-h-screen bg-gray-50">


            {/* Content Section */}
            <section className="py-10 md:py-12 md:pt-4 bg-gray-50">
                <div className="container mx-auto px-4 md:px-0">
                    <div className="pb-4">
                        <BackButton />
                    </div>
                    <div className="lg:grid lg:grid-cols-3 lg:gap-4">
                        {/* Sticky Sidebar with Image and Contact */}
                        <div className="lg:col-span-1 lg:sticky lg:top-8 min-h-screen self-start space-y-4 hidden lg:block">
                            {/* Image Card for larger screens */}
                            <Card className="border-gray-100 shadow-none ring-1 ring-gray-100 p-0">
                                <div className="relative w-full aspect-square rounded-xs overflow-hidden border border-gray-200">
                                    {imageUrl ? (
                                        <OptimizedImage
                                            src={imageUrl}
                                            alt={doctor.name || "Medical Advisor"}
                                            fill
                                            className="object-cover"
                                            priority
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center bg-gray-200">
                                            <Stethoscope className="h-20 w-20 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                            </Card>
                            {/* Quick Info */}
                            <Card className="bg-white border border-gray-100 shadow-xs rounded-xs">
                                <CardHeader className="px-5 py-4 border-b border-gray-100">
<CardTitle className="title-heading" data-i18n="advisor.quick-info" data-i18n-original="Quick Information" data-trans-managed="true">
                                        Quick Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-5 py-4 space-y-4">
                                    {doctor.experience && (
                                        <div className="flex items-start gap-3">
                                            <Clock className="h-5 mt-1 w-5 text-gray-500" />
                                            <div>
<p className="title-text" data-i18n="advisor.experience" data-i18n-original="Experience" data-trans-managed="true">Experience</p>
                                                <p className="description" data-i18n-original={doctor.experience}>{doctor.experience}</p>
                                            </div>
                                        </div>
                                    )}

                                    {doctor.languages && (
                                        <div className="flex items-start gap-3">
                                            <Languages className="h-5 mt-1 w-5 text-gray-500" />
                                            <div>
<p className="title-text" data-i18n="advisor.languages" data-i18n-original="Languages" data-trans-managed="true">Languages</p>
                                                <p className="description" data-i18n-original={doctor.languages}>{doctor.languages}</p>
                                            </div>
                                        </div>
                                    )}

                                    {doctor.hospitals && (
                                        <div className="flex items-start gap-3">
                                            <MapPin className="h-5 mt-1 w-5 text-gray-500" />
                                            <div>
<p className="title-text" data-i18n="advisor.hospitals" data-i18n-original="Hospitals" data-trans-managed="true">Hospitals</p>
                                                <p className="description" data-i18n-original={doctor.hospitals}>{doctor.hospitals}</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Memberships */}
                            {doctor.memberships && (
                                <Card className="bg-white border border-gray-100 shadow-xs rounded-xs">
                                    <CardHeader className="px-5 py-4 border-b border-gray-100">
<CardTitle className="title-heading" data-i18n="advisor.memberships" data-i18n-original="Professional Memberships" data-trans-managed="true">
                                            Professional Memberships
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-5 py-4 space-y-3">
                                        {doctor.memberships.split("|").map((membership, index) => (
                                            <div key={index} className="flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2" />
<p className="description" data-i18n-original={membership.trim()}>{membership.trim()}</p>
                                            </div>
                                        ))}
                                    </CardContent>
                                 </Card>
                             )}


                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-2  space-y-4 md:space-y-4">
                            {/* Mobile Contact Card */}


                            {/* About */}
                            {doctor.about && (
                                <Card className="border-gray-100 bg-white p-6 shadow-xs ">

                                    <div className="flex-1 text-center md:text-left space-y-3">
                                        {/* Doctor Name */}
<h1 className="heading-lg" data-i18n-original={doctor.name}>
                                             {doctor.name}
                                         </h1>

{/* Doctor Title */}
                                         {doctor.title && (
                                             <p className="title-text" data-i18n-original={cleanTitle(doctor.title)}>
                                                 {cleanTitle(doctor.title)}
                                             </p>
                                         )}

                                        {/* Specialties */}
                                        {doctor.specialty && (
                                            <div className="flex flex-wrap my-4 justify-center md:justify-start gap-3">

{doctor.specialty.split(",").map((spec, index) => (
                                                     <span
                                                         key={index}
                                                         className="px-4 py-1 rounded-xs bg-gray-100 description-1 border border-gray-200 shadow-xs hover:shadow-xs hover:bg-gray-100 transition-all duration-200"
                                                         data-i18n-original={spec.trim()}
                                                     >
                                                         {spec.trim()}
                                                     </span>
                                                 ))}
                                            </div>
                                        )}


                                    </div>


                                    <CardContent className="px-0 pb-5">
                                        <ReadMoreButton text={aboutText} />
                                    </CardContent>
                                </Card>
                            )}

                            {/* Work Experience */}
                            {doctor.workExperience && (
                                <Card className="border-gray-100 bg-white shadow-none ring-1 ring-gray-100 transition-all duration-300 hover:shadow-sm hover:ring-primary/50">
                                    <CardHeader className="px-5 py-4">
<CardTitle className="title-text flex items-center gap-2" data-i18n="advisor.experience" data-i18n-original="Professional Experience" data-trans-managed="true">
                                             <Briefcase className="h-5 w-5 text-blue-600" />
                                             Professional Experience
                                         </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-5 pb-5">
                                        <div className="space-y-3">
                                            {doctor.workExperience.split("|").map((experience, index) => (
                                                <div key={index} className="flex items-start gap-3">
                                                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
<p className="description" data-i18n-original={experience.trim()}>{experience.trim()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}


                            {/* Education */}
                            {doctor.education && (
                                <Card className="border-gray-100  shadow-xs bg-white">
                                    <CardHeader className="px-5 py-4">
<CardTitle className="title-heading flex items-center gap-2" data-i18n="advisor.education" data-i18n-original="Education & Training" data-trans-managed="true">
                                             <GraduationCap className="h-8 w-8" />
                                             Education & Training
                                         </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-5 pb-5 ml-4">
                                        <div className="space-y-3">
                                            {doctor.education.split("|").map((edu, index) => (
                                                <div key={index} className="flex items-center gap-3">
                                                    <div className="w-2 h-2 bg-gray-500 rounded-full flex-shrink-0"></div>
<p className="description" data-i18n-original={edu.trim()}>{edu.trim()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {specialtyInterests1.length > 0 && (
                                <Card className="bg-white border border-gray-100 shadow-xs rounded-xs">
                                    <CardHeader className="px-5 py-4 border-b border-gray-100">
<CardTitle className="flex items-center gap-2 title-heading" data-i18n="advisor.specialty-interests" data-i18n-original="Specialty Interests" data-trans-managed="true">
                                             <Star className="h-8 w-8 " />
                                             Specialty Interests
                                         </CardTitle>
                                     </CardHeader>
                                     <CardContent className="px-5 py-4 space-y-3 ml-4">
                                         {specialtyInterests1.map((interest, index) => (
                                             <div key={index} className="flex items-start gap-3">
                                                 <div className="w-2 h-2 bg-gray-500 rounded-full mt-2" />
                                                 <p className="description" data-i18n-original={interest.trim()}>{interest.trim()}</p>
                                             </div>
                                         ))}
                                     </CardContent>

                                </Card>
                            )}

                            {/* Awards */}
                            {doctor.awards && (
                                <Card className="bg-white border border-gray-100 shadow-xs rounded-xs">
                                    <CardHeader className="px-5 py-4 border-b border-gray-100">
<CardTitle className="flex items-center  gap-2 title-heading" data-i18n="advisor.awards" data-i18n-original="Awards & Recognition" data-trans-managed="true">
                                             <Award className="h-8 w-8 " />
                                             Awards & Recognition
                                         </CardTitle>
                                     </CardHeader>
                                     <CardContent className="px-5 py-4">
                                         <p className="description" data-i18n-original={doctor.awards}>{doctor.awards}</p>
                                     </CardContent>
                                </Card>
                            )}

                            {/* Mobile sections */}
                            <div className="space-y-6 lg:hidden">
                                {specialtyInterests1.length > 0 && (
                                    <Card className="bg-white border border-gray-100 shadow-xs rounded-xs">
                                        <CardHeader className="px-5 py-4 border-b border-gray-100">
<CardTitle className="flex items-center gap-2 heading-lg" data-i18n="advisor.specialty-interests" data-i18n-original="Specialty Interests" data-trans-managed="true">
                                                 <Star className="h-4 w-4 text-gray-500" />
                                                 Specialty Interests
                                             </CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-5 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {specialtyInterests1.map((interest, index) => (
<Badge
                                                        key={index}
                                                        variant="outline"
                                                        className="border-gray-200 text-[#241d1f] bg-gray-50 hover:bg-gray-100"
                                                        data-i18n-original={interest.trim()}
                                                    >
                                                        {interest.trim()}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {doctor.awards && (
                                    <Card className="bg-white border border-gray-100 shadow-xs rounded-xs">
                                        <CardHeader className="px-5 py-4 border-b border-gray-100">
<CardTitle className="flex items-center gap-2 title-heading" data-i18n="advisor.awards" data-i18n-original="Awards & Recognition" data-trans-managed="true">
                                             <Award className="h-8 w-8 " />
                                             Awards & Recognition
                                         </CardTitle>
                                     </CardHeader>
                                     <CardContent className="px-5 py-4">
                                         <p className="description" data-i18n-original={doctor.awards}>{doctor.awards}</p>
                                        </CardContent>
                                    </Card>
                                )}

                                {doctor.memberships && (
                                    <Card className="bg-white border border-gray-100 shadow-xs rounded-xs">
                                        <CardHeader className="px-5 py-4 border-b border-gray-100">
<CardTitle className="heading-lg" data-i18n="advisor.memberships" data-i18n-original="Professional Memberships" data-trans-managed="true">
                                             Professional Memberships
                                         </CardTitle>
                                     </CardHeader>
                                      <CardContent className="px-5 py-4 space-y-3">
                                          {doctor.memberships.split("|").map((membership, index) => (
                                              <div key={index} className="flex items-start gap-2">
                                                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2" />
                                                  <p className="text-sm text-[#241d1f]" data-i18n-original={membership.trim()}>{membership.trim()}</p>
                                              </div>
                                          ))}
                                      </CardContent>
                                     </Card>
                                )}
                            </div>

                        </div>
                    </div>


                </div>
            </section>
        </main>
    );
}

