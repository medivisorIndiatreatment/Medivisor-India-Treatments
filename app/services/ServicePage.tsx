"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { CircleCheckBig } from "lucide-react"
import Banner from "@/components/BannerService"
import ContactModal from '@/components/ContactModal';
import SectionHeading from "@/components/ui/SectionHeading"
import CtaSection from "@/components/CtaSection"
import { getBestCoverImage, getWixScaledToFillImageUrl } from "@/lib/wixMedia"
import { DESIGN_TOKENS } from "@/components/design-tokens"
import { Trans, useTranslatedStrings } from '@/lib/i18n';
const COLLECTION_ID = "Import1"

interface Service {
    _id?: string
    title: string
    description: string
    richContent?: string
    shortDescription?: string
    image: string
    images?: string[]
    benefits: string[]
    features?: string[]
    price?: string
    duration?: string
    category?: string
    tags?: string[]
    order?: number
    isPopular?: boolean
    ctaText?: string
    ctaLink?: string
    richContentNodes?: any[]
}

const LoadingSkeleton = () => (
    <section
        className={`${DESIGN_TOKENS.BACKGROUNDS.GRAY_LIGHT} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}
        id="Services"
    >
        <div
            className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}
        >
            <div className="space-y-2 mb-8">
                <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[...Array(3)].map((_, index) => (
                    <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-xl h-[280px] md:h-[320px]"
                    >
                        <div className="w-full h-48 md:h-56 bg-gray-200 rounded-t-xl animate-pulse" />
                        <div className="p-4 md:p-5 space-y-3">
                            <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
                            <div className="space-y-2">
                                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
                            </div>
                            <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
)

const ServiceCard = ({ service, onEnquire }: { service: Service; onEnquire?: () => void }) => {
    const allStrings = useTranslatedStrings([
        service.title,
        service.category || '',
        service.shortDescription || service.description,
        ...service.benefits.slice(0, 3),
        service.ctaText || "Enquire Now",
    ]);
    const translatedTitle = allStrings[0];
    const translatedCategory = allStrings[1];
    const translatedShortDesc = allStrings[2];
    const translatedBenefits = allStrings.slice(3, 3 + Math.min(service.benefits.length, 3));
    const translatedCta = allStrings[3 + Math.min(service.benefits.length, 3)];

    return (
        <div
            className="group bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col h-full min-h-[280px] md:min-h-[320px] hover:shadow-xl hover:border-gray-300 transition-all duration-300 cursor-pointer"
        >
            <div className="relative w-full h-60 md:h-60 overflow-hidden bg-gray-50">
                <Image
                    src={service.image || "/placeholder.svg"}
alt={translatedTitle}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    width={400}
                    height={460}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.dataset.fallbackAttempted) {
                            target.dataset.fallbackAttempted = "true";
                            target.src = `/placeholder.svg?height=250&width=400&query=${encodeURIComponent(service.title + " medical service")}`;
                        }
                    }}
                />
                {service.category && (
<div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded" data-i18n-original={service.category} data-trans-managed="true">
                        {translatedCategory}
                    </div>
                )}
            </div>
            <div className="p-4 md:p-5 flex flex-col flex-1">
<h3 className={`mb-2 transition-colors ${DESIGN_TOKENS.TYPOGRAPHY.H3}`} data-i18n-original={service.title} data-trans-managed="true">
                    <span className="w-full">{translatedTitle}</span>
                </h3>
                <p className={`mb-4 mt-0  ${DESIGN_TOKENS.TYPOGRAPHY.CARD_DESC} line-clamp-4 `} data-i18n-original={service.shortDescription || service.description} data-trans-managed="true">
                    {translatedShortDesc}
                </p>
                <div className="mt-auto">
                    {service.benefits.length > 0 ? (
                        <ul className="space-y-1.5">
                            {service.benefits.slice(0, 3).map((benefit, benefitIndex) => (
                                <li
                                    key={benefitIndex}
                                    className="flex items-start hover:translate-x-1 transition-transform duration-200"
                                >
                                    <CircleCheckBig className="w-4 h-4 text-[#29A9B9] mr-2 mt-0.5 flex-shrink-0" />
<span className={`${DESIGN_TOKENS.TYPOGRAPHY.BODY_BASE} text-gray-900 line-clamp-1 transition-colors hover:text-[#29A9B9] font-medium`} data-i18n-original={benefit} data-trans-managed="true">
                                        {translatedBenefits[benefitIndex]}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
<p className={`${DESIGN_TOKENS.TYPOGRAPHY.DESCRIPTION} text-gray-900`} data-i18n-original={service.shortDescription || service.description} data-trans-managed="true">
                            {translatedShortDesc}
                        </p>
                    )}
                </div>
                
            </div>
            <footer className="border-t border-gray-100 mx-2 mb-2 pt-3 mt-auto">
                <button
                    className="flex items-center cursor-pointer justify-center w-full gap-2 text-base font-medium text-white bg-[#23366E] px-4 py-2.5 rounded-lg shadow-sm hover:bg-[#1A2650] hover:shadow-md active:scale-[0.98] transition-all duration-200"
                    onClick={onEnquire}
data-i18n-original={service.ctaText || "Enquire Now"}
                    data-trans-managed="true"
                >
                    {translatedCta}
                </button>
            </footer>
        </div>
    );
};

export default function Services() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedServiceTitle, setSelectedServiceTitle] = useState<string | null>(null);

    const [translatedError] = useTranslatedStrings(["Unable to load services data"]);

    const openModal = (serviceTitle?: string) => {
        setSelectedServiceTitle(serviceTitle || null);
        setIsModalOpen(true);
    };

    const processWixImageUrl = (item: any): string => {
        const directImage = typeof item === "string" ? item : item?.image;
        if (
            directImage &&
            typeof directImage === "string" &&
            (directImage.startsWith("http://") || directImage.startsWith("https://"))
        ) {
            return directImage;
        }

        const bestImage = getBestCoverImage(item);
        if (bestImage) {
            return bestImage;
        }

        const imageFields = ["image", "photo", "picture", "mainImage", "featuredImage", "coverImage", "thumbnail"];

        for (const field of imageFields) {
            if (item[field]) {
                let imageUrl = null;

                if (typeof item[field] === "string" && item[field].startsWith("wix:image://")) {
                    imageUrl = item[field];
                } else if (item[field]?.url && item[field].url.startsWith("wix:image://")) {
                    imageUrl = item[field].url;
                } else if (item[field]?.src && item[field].src.startsWith("wix:image://")) {
                    imageUrl = item[field].src;
                }

                if (imageUrl) {
                    const processedUrl = getWixScaledToFillImageUrl(imageUrl, 400, 300);
                    if (processedUrl) {
                        return processedUrl;
                    }
                }
            }
        }

        return `/placeholder.svg?height=200&width=400&query=medical service`;
    };

    const parseRichContent = (content: any): { text: string; nodes?: any[] } => {
        if (!content) return { text: "" };

        if (typeof content === "string") {
            return { text: content };
        }

        if (content.nodes && Array.isArray(content.nodes)) {
            const extractedText = extractTextFromNodes(content.nodes);
            return {
                text: extractedText,
                nodes: content.nodes,
            };
        }

        if (content.html) {
            return { text: content.html };
        }

        if (content.plainText) {
            return { text: content.plainText };
        }

        if (content.text) {
            return { text: content.text };
        }

        return { text: "" };
    };

    const extractTextFromNodes = (nodes: any[]): string => {
        let text = "";

        for (const node of nodes) {
            if (node.type === "TEXT" && node.textData?.text) {
                text += node.textData.text;
            } else if (node.type === "PARAGRAPH" && node.nodes) {
                text += extractTextFromNodes(node.nodes) + " ";
            } else if (node.type === "LIST_ITEM" && node.nodes) {
                text += "• " + extractTextFromNodes(node.nodes) + " ";
            } else if (node.nodes && Array.isArray(node.nodes)) {
                text += extractTextFromNodes(node.nodes);
            }
        }

        return text.trim();
    };

    const extractBenefitsFromRichContent = (richContent: any): string[] => {
        if (!richContent?.nodes) return [];

        const benefits: string[] = [];

        const findListItems = (nodes: any[]) => {
            for (const node of nodes) {
                if (node.type === "LIST_ITEM" && node.nodes) {
                    const itemText = extractTextFromNodes(node.nodes);
                    if (itemText.trim()) {
                        benefits.push(itemText.trim());
                    }
                } else if (node.nodes && Array.isArray(node.nodes)) {
                    findListItems(node.nodes);
                }
            }
        };

        findListItems(richContent.nodes);
        return benefits;
    };

    const parseArrayField = (field: any, fallback: string[] = []): string[] => {
        if (!field) return fallback;

        if (Array.isArray(field)) {
            return field.filter(Boolean);
        }

        if (typeof field === "string") {
            return field
                .split(/[,\n]/)
                .map((item) => item.trim())
                .filter(Boolean);
        }

        return fallback;
    };

    const fetchServices = async () => {
        try {
            const response = await fetch("/api/services")
            if (!response.ok) {
                throw new Error(`Failed to fetch services: ${response.status}`)
            }
            const data = await response.json()
            const servicesData: Service[] = (data.items || []).map((item: any, originalIndex: number) => {
                const parsedRichContent = parseRichContent(item.richcontent || item.richContent);
                const parsedDescription = parseRichContent(item.description);

                const richContentBenefits = extractBenefitsFromRichContent(item.richcontent || item.richContent);
                const fallbackBenefits = parseArrayField(item.benefits, [
                    "Professional service",
                    "Expert care",
                    "Quality assured",
                ]);

                return {
                    _id: item._id || item.ID,
                    title: item.title || item.name || item.serviceName || "Service",
                    description: parsedDescription.text || "Service description",
                    richContent: parsedRichContent.text,
                    richContentNodes: parsedRichContent.nodes,
                    shortDescription: parseRichContent(item.shortDescription || item.summary).text,
                    image: processWixImageUrl(item),
                    images: item.images
                        ? parseArrayField(item.images).map((img: any) => processWixImageUrl({ image: img }))
                        : undefined,
                    benefits: richContentBenefits.length > 0 ? richContentBenefits : fallbackBenefits,
                    features: parseArrayField(item.features),
                    price: item.price || item.cost || item.pricing,
                    duration: item.duration || item.timeRequired || item.estimatedTime,
                    category: item.category || item.serviceCategory || item.type,
                    tags: parseArrayField(item.tags),
                    order: Number.parseInt(item.order) || Number.parseInt(item.Order) || originalIndex,
                    isPopular: item.isPopular || item.featured || item.popular || false,
                    ctaText: item.ctaText || item.buttonText || "Enquire Now",
                    ctaLink: item.ctaLink || item.bookingLink || item.contactLink,
                };
            });

            return servicesData.sort((a, b) => (a.order || 0) - (b.order || 0));
        } catch (error: any) {
            console.error("[Services] API Error:", error);
            throw error;
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await fetchServices();
                setServices(result);
            } catch (err: any) {
                setError(translatedError);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return <LoadingSkeleton />;
    }

    if (services.length === 0) {
        return (
            <section
                className={`${DESIGN_TOKENS.BACKGROUNDS.GRAY_LIGHT} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}
                id="Services"
            >
                <div
                    className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING} text-center max-w-2xl mx-auto`}
                >
                    <SectionHeading title="Our Services" align="center" data-i18n-original="Our Services" />
                    <p className={`${DESIGN_TOKENS.TYPOGRAPHY.BODY_BASE}`} data-i18n="services-page.empty" data-i18n-original="No services available at the moment." data-trans-managed="true">
                        <Trans id="services-page.empty">No services available at the moment.</Trans>
                    </p>
                </div>
            </section>
        );
    }

    return (
        <>
   


            <Banner
                topSpanText="Our Services"
                title="Complete Medical Tourism Services in India for International Patients"
                description="Medivisor India Treatment helps international patients access quality medical treatment in India with personalized support at every step. From finding the right hospitals and experienced doctors to treatment planning, medical travel assistance, and post-treatment support, we make your medical journey to India simpler and more comfortable."
                buttonText="Contact Our Team"
                buttonLink="/contact"
                  bannerBgImage="/banner/service.png"
                mainImageSrc="/banner/faq-banner.png"
                mainImageAlt="Medical services banner"
                data-i18n-original-top="Our Services"
                data-i18n-original-title="Complete Medical Tourism Services in India for International Patients"
                data-i18n-original-desc="Medivisor India Treatment helps international patients access quality medical treatment in India with personalized support at every step. From finding the right hospitals and experienced doctors to treatment planning, medical travel assistance, and post-treatment support, we make your medical journey to India simpler and more comfortable."
                data-i18n-original-btn="Contact Our Team"
            />

            <section
                className={`${DESIGN_TOKENS.BACKGROUNDS.GRAY_LIGHT} ${DESIGN_TOKENS.SECTION_SPACING.PY}`}
                id="Services"
            >
                <div
                    className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}
                >
                    {error && (
                        <p
                            className={`${DESIGN_TOKENS.TYPOGRAPHY.BODY_SM} text-amber-600 mb-2`}
                            data-i18n-original={error}
                            data-trans-managed="true"
                        >
                            {error}
                        </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {services.map((service) => (
                            <ServiceCard
                                key={service._id || service.title}
                                service={service}
                                onEnquire={() => openModal(service.title)}
                            />
                        ))}
                    </div>
                    <ContactModal
                        isOpen={isModalOpen}
                        onClose={() => {
                            setIsModalOpen(false);
                            setSelectedServiceTitle(null);
                        }}
                        serviceTitle={selectedServiceTitle}
                    />
                </div>
            </section>

           
        </>
    );
}
