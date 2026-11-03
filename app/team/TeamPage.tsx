"use client"

import { useState, useEffect } from "react"
import { Users, Mail, Globe, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import CtaSection from "@/components/CtaSection"
import Banner from "@/components/BannerService"
import { generateSlug, generateUniqueSlug } from "@/lib/slug-utils"
import { DESIGN_TOKENS } from "@/components/design-tokens"
import { Trans, useTranslatedStrings, useTranslatedHtmlString } from '@/lib/i18n';

const COLLECTION_ID = "Team1"

interface TeamMember {
    _id?: string
    name: string
    role: string
    image: string
    bio: string
    shortDescription: string
    longDescription: string
    order: number
    "link-team-1-title": string
    email?: string
    linkedin?: string
    twitter?: string
    website?: string
    rawData?: any
}

const SkeletonCard = () => (
    <Card className="overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
        <div className="aspect-[4/5] bg-gray-200 animate-pulse" />
        <div className="p-6 space-y-4">
            <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded-lg animate-pulse w-3/4 mx-auto" />
                <div className="h-4 bg-gray-200 rounded-lg animate-pulse w-1/2 mx-auto" />
            </div>
            <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-5/6" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-4/5" />
            </div>
            <div className="flex gap-2 justify-center">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                ))}
            </div>
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
        </div>
    </Card>
);

const fetchTeamMembers = async () => {
    try {
        const response = await fetch("/api/team")
        if (!response.ok) {
            throw new Error(`Failed to fetch team: ${response.status}`)
        }
        const data = await response.json()
        const teamMembersData: TeamMember[] = (data.items || []).map((item: any) => {
            const itemData = item.data || item;
            return {
                _id: item._id || item.ID,
                name: itemData.title || item.title || item.Name || item.name || "Team Member",
                role: itemData.jobTitle || item.jobTitle || item["Job Title"] || item.role || item.position || "Team Member",
                image: itemData.image || '/placeholder.svg?height=500&width=400&query=team member portrait',
                bio: itemData.longDescription || item.longDescription || item["Long Description"] || item.bio || item.description || "Dedicated team member.",
                shortDescription: itemData.shortDescription || item.shortDescription || item["Short Description"] || item.excerpt || "",
                longDescription: itemData.longDescription || item.longDescription || item["Long Description"] || item.bio || item.description || "",
                order: Number.parseInt(itemData.order) || Number.parseInt(item.order) || Number.parseInt(item.Order) || 0,
                "link-team-1-title": itemData["link-team-1-title"] || item["link-team-1-title"] || item.link || item.profileUrl || item.website || "#",
                email: itemData.email || item.email || item.Email || "",
                linkedin: itemData.linkedin || item.linkedin || item.LinkedIn || "",
                twitter: itemData.twitter || item.twitter || item.Twitter || "",
                website: itemData.website || item.website || item.Website || "",
                rawData: item,
            };
        });
        return teamMembersData.sort((a, b) => a.order - b.order);
    } catch (error: any) {
        console.error("Error fetching team members:", error);
        throw error;
    }
};

const loadData = async (setTeamMembers: any, setLoading: any) => {
    try {
        setLoading(true);
        const result = await fetchTeamMembers();
        setTeamMembers(result);
    } catch (error) {
        console.error("Failed to load team data:", error);
    } finally {
        setLoading(false);
    }
};

const TeamMemberCard = ({ member }: { member: TeamMember }) => {
    const profileUrl = `/team/${generateUniqueSlug(member.name, member._id)}`;

    const rawDesc = member.shortDescription || member.bio;
    const translatedHtmlDesc = useTranslatedHtmlString(rawDesc || "");
    const [translatedName, translatedRole] = useTranslatedStrings([
        member.name,
        member.role,
    ]);
    return (
        <Card className="group relative overflow-hidden transition-all duration-300 border border-gray-100 shadow-sm bg-white hover:shadow-md">
            <Link href={profileUrl} className="absolute inset-0 z-10" />

            <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">
                <img
                    src={member.image || "/placeholder.svg"}
alt={translatedName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `/placeholder.svg?height=500&width=400&query=${encodeURIComponent(member.name + " team member")}`;
                    }}
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="p-5">
                <div className="mb-1">
<h3 className={`${DESIGN_TOKENS.TYPOGRAPHY.H3} text-[#241d1f] leading-snug`} data-i18n-original={member.name} data-trans-managed="true">
                        {translatedName}
                    </h3>
                    <p className={`${DESIGN_TOKENS.TYPOGRAPHY.H4} mt-1 text-[#241d1f] leading-relaxed line-clamp-1`} data-i18n-original={member.role} data-trans-managed="true">
                        {translatedRole}
                    </p>
                </div>
                <div
                    className={`${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC} text-[#241d1f] leading-relaxed mb-4 line-clamp-3`}
                    data-i18n-original={rawDesc}
                    data-trans-managed="true"
                    dangerouslySetInnerHTML={{ __html: translatedHtmlDesc }}
                />
                <div className="flex gap-2 mt-3">
                    {member.email && (
                        <a href={`mailto:${member.email}`} onClick={(e) => e.stopPropagation()} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-300 hover:scale-110 relative">
                            <Mail className="w-4 h-4 text-gray-600" />
                        </a>
                    )}
                    {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-300 hover:scale-110 relative">
                            <ExternalLink className="w-4 h-4 text-[#0A66C2]" />
                        </a>
                    )}
                    {member.twitter && (
                        <a href={member.twitter} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-300 hover:scale-110 relative">
                            <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-600"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor"/></svg>
                        </a>
                    )}
                    {member.website && (
                        <a href={member.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-300 hover:scale-110 relative">
                            <Globe className="w-4 h-4 text-gray-600" />
                        </a>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default function TeamPage() {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData(setTeamMembers, setLoading);
    }, []);

    if (loading) {
        return (
            <section className="bg-white py-12 md:py-16">
                <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
                    <div className="text-center mb-12">
                        <div className="h-12 bg-gray-200 rounded-lg animate-pulse w-64 mx-auto mb-4" />
                        <div className="h-6 bg-gray-200 rounded-lg animate-pulse w-96 mx-auto" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                        {[...Array(8)].map((_, index) => <SkeletonCard key={index} />)}
                    </div>
                </div>
            </section>
        );
    }

    if (teamMembers.length === 0) {
        return (
            <section className="bg-gray-50 py-12 md:py-16">
                <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
                    <div className="text-center max-w-2xl mx-auto">
                        <div className="inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-full mb-8">
                            <Users className="h-12 w-12 sm:h-16 sm:w-16 text-gray-500" />
                        </div>
<h2 className="text-3xl md:text-4xl font-bold text-[#241d1f] leading-tight tracking-tight mb-6" data-i18n="team.empty-title" data-i18n-original="Our Amazing Team" data-trans-managed="true">
                            <Trans id="team.empty-title">Our Amazing Team</Trans>
                        </h2>
                        <p className="text-base sm:text-lg text-[#241d1f] leading-relaxed" data-i18n="team.empty-desc" data-i18n-original="Our team information is currently being updated. Check back soon to meet our incredible professionals!" data-trans-managed="true">
                            <Trans id="team.empty-desc">Our team information is currently being updated. Check back soon to meet our incredible professionals!</Trans>
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <>
        


            <Banner
                topSpanText="Meet Our Team"
                title="Meet Our Medical Tourism Team in India"
                description="Our dedicated team at Medivisor India Treatment helps international patients find the right hospitals, experienced doctors, and suitable treatment options in India. From your first enquiry to treatment coordination and travel assistance, we are here to make your medical journey easier, smoother, and more comfortable."
                buttonText="Meet Our Team"
                buttonLink="/contact"
                  bannerBgImage="/banner/service.png"
                mainImageSrc="/banner/team-banner.png"
                mainImageAlt="Medivisor India Treatment Team"
                data-i18n-original-top="Meet Our Team"
                data-i18n-original-title="Meet Our Medical Tourism Team in India"
                data-i18n-original-desc="Our dedicated team at Medivisor India Treatment helps international patients find the right hospitals, experienced doctors, and suitable treatment options in India. From your first enquiry to treatment coordination and travel assistance, we are here to make your medical journey easier, smoother, and more comfortable."
                data-i18n-original-btn="Meet Our Team"
            />
            <section className="bg-white py-12 md:py-16">
                <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-4">
                        {teamMembers.map((member) => (
                            <TeamMemberCard key={member._id} member={member} />
                        ))}
                    </div>
                </div>
            </section>
          
        </>
    );
}
