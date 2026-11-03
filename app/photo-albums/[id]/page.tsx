"use client";

import { useState, useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { wixClient } from "@/lib/wix";
import { getBestCoverImage, getWixImageUrl } from "@/lib/wixMedia";
import type { HappyMoment } from "@/types/happy-moment";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MapPin, Tag, Images, Heart, Share2, Download, ZoomIn, X, ChevronLeft, ChevronRight, Star, Clock, User, Sparkles } from "lucide-react";
import { OptimizedImage } from "@/components/optimized-image";
import { RicosContentRenderer } from "@/components/ricos-content-renderer";
import BlogAside from "@/components/blogAside";
import { useTranslatedStrings, useTranslatedHtmlString } from "@/lib/i18n";
import { stripHtmlTags } from "@/lib/cms";
const COLLECTION_ID = "photo-album";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ModernMomentPage({ params }: PageProps) {
  const router = useRouter();
  const [moment, setMoment] = useState<HappyMoment | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [lastVisitedPath, setLastVisitedPath] = useState("/photo-albums");

  useEffect(() => {
    // Store the previous path in state. We check if it's a valid path
    // and not the current one.
    const handleRouteChange = () => {
      if (typeof window !== "undefined") {
setLastVisitedPath(document.referrer || "/photo-albums");
      }
    };

    if (typeof window !== "undefined") {
      // Use document.referrer to get the last page.
      const referrer = document.referrer;
      const isExternalOrSelf =
        referrer === "" || new URL(referrer).origin === window.location.origin;

      if (referrer && isExternalOrSelf) {
        setLastVisitedPath(referrer);
      }
    }

    // This part ensures that even on client-side navigation, the back button
    // logic is preserved correctly.
    const handlePopState = () => {
      // You can implement more sophisticated logic here if needed
      // but for a simple "back" it's not strictly necessary.
};
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    const fetchMoment = async () => {
      try {
const { id } = await params;
        const response = await wixClient.items
          .query(COLLECTION_ID)
          .eq("_id", id)
          .find({ consistentRead: true });

        if (!response || !response.items || response.items.length === 0) {
          notFound();
          return;
        }

        const item = response.items[0];
        let mediaGalleryParsed: HappyMoment["mediagallery"] = [];

        if (item.mediagallery) {
          try {
            const parsedGallery =
typeof item.mediagallery === "string"
                ? JSON.parse(item.mediagallery)
                : item.mediagallery;
            mediaGalleryParsed = parsedGallery.filter(
              (media: any) =>
                media.type === "image" ||
                (media.src && media.src.startsWith("wix:image://")),
            );
          } catch (e) {
            console.error(
              "Failed to parse Media Gallery for item:",
              item._id,
              e,
            );
            mediaGalleryParsed = [];
          }
        }

        const processedMoment = {
          ...item,
          order: item.order?.toString(),
          mediagallery: mediaGalleryParsed,
          coverMedia: item.coverMedia || undefined,
excerpt:
            item.excerpt ||
            item.shortDescription ||
            "No description available.",
          content: item.content || item.detail || "",
          firstPublishedDate:
            item.firstPublishedDate ||
            item.date ||
            (typeof item._createdDate === "string"
              ? item._createdDate
              : item._createdDate?.toISOString?.()),
          _createdDate:
            typeof item._createdDate === "string"
              ? item._createdDate
              : item._createdDate?.toISOString?.(),
          _updatedDate:
            typeof item._updatedDate === "string"
              ? item._updatedDate
              : item._updatedDate?.toISOString?.(),
        };

        setMoment(processedMoment);
        setLikeCount(Math.floor(Math.random() * 50) + 10); // Mock like count
      } catch (error) {
        console.error("Error fetching HappyMoment:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchMoment();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
        <div className="container mx-auto px-6 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-slate-200 rounded-lg w-32"></div>
            <div className="h-96 bg-slate-200 rounded-3xl"></div>
            <div className="space-y-4">
              <div className="h-8 bg-slate-200 rounded-lg w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="h-20 bg-slate-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
);
  }

  if (!moment) {
    notFound();
  }

  const handleBack = () => {
    // Navigate back to the doctors list page. The logic to scroll to the card
    // is on the doctors list page itself.
    window.history.back();
  };

const coverImageUrl = getBestCoverImage(moment);
  const galleryImages = Array.isArray(moment.mediagallery)
    ? moment.mediagallery.filter(
        (media) => media.src && media.src.startsWith("wix:image://"),
      )
    : [];

  const staticStrings = [
    "Happy moment",
    "Happy Moment",
    "Untitled title_fld",
    "Patient Story",
    "A journey of hope and healing",
    "photos",
    "photo",
    "Tags",
    "Share This Story",
    "Help inspire others by sharing this beautiful journey of hope and healing.",
    "Share Story",
    "Save Photos",
    "Back",
    "Photo Gallery",
    "beautiful moments captured",
  ];

  const momentTitle = moment.title_fld || "Untitled title_fld";
  const momentLocation = moment.location || "";
  const momentCategory = moment.category || "";
  const momentTags = moment.tags
    ? moment.tags.split(",").map((t: string) => t.trim())
    : [];
  const momentHashtags = moment.hashtags
    ? moment.hashtags.split(" ").map((h: string) => h.trim())
    : [];
  const galleryTitles = galleryImages.map(
    (m, i) => m.title || m.alt || `Gallery image ${i + 1}`,
  );
  const galleryDescs = galleryImages.map((m) => m.description || "");

  const allDynamicStrings = [
    momentTitle,
    momentLocation,
    momentCategory,
    moment.excerpt || "",
    ...momentTags,
    ...momentHashtags,
    ...galleryTitles,
    ...galleryDescs,
  ];
  const translated = useTranslatedStrings([
    ...staticStrings,
    ...allDynamicStrings,
  ]);
  const strings: Record<string, string> = {};
  const allKeys = [...staticStrings, ...allDynamicStrings];
  allKeys.forEach((s, i) => {
    strings[s] = translated[i] ?? s;
  });

  const translatedHtmlContent = useTranslatedHtmlString(moment.content || "");

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setSelectedImageIndex(null);
  };

  const navigateImage = (direction: "prev" | "next") => {
    if (selectedImageIndex === null) return;

    if (direction === "prev") {
      setSelectedImageIndex(
        selectedImageIndex > 0
          ? selectedImageIndex - 1
          : galleryImages.length - 1,
      );
    } else {
      setSelectedImageIndex(
        selectedImageIndex < galleryImages.length - 1
          ? selectedImageIndex + 1
          : 0,
      );
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
title: strings[momentTitle] || momentTitle,
          text: strings[moment.excerpt || ""] || moment.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        // Handle silently
      }
    } else {
      // Fallback: copy to clipboard
navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="sticky top-0 z-40 border-none  shadow-none py-5">
        <div className="container mx-auto px-4 py-4 md:px-6">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleBack}
              variant="ghost"
              className="flex items-center gap-2 hover:bg-slate-100 bg-white rounded-xs px-2 py-1 md:px-4 md:py-2"
            >
              <ArrowLeft className="h-4 w-4" />
<span
                className="hidden md:inline font-medium"
                data-trans-managed="true"
              >
                {strings["Back"]}
              </span>
              <span className="md:hidden font-medium" data-trans-managed="true">
                {strings["Back"]}
              </span>
            </Button>
            <div className="flex items-center gap-2 md:gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`flex items-center gap-2 rounded-xl px-2 py-1 md:px-4 md:py-2 transition-colors ${isLiked ? "text-rose-600 bg-rose-50 hover:bg-rose-100" : "hover:bg-slate-100"}`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
<span className="font-medium text-xs md:text-base">
                  {likeCount}
                </span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="rounded-xl px-2 py-1 md:px-4 md:py-2"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-0 py-6 md:py-12">
        {/* Hero Section */}
        <div className="mb-6 md:mb-12">
          {coverImageUrl && (
            <div className="relative h-[40vh] md:h-[80vh] overflow-hidden rounded-none md:rounded-md shadow-xs md:shadow-xs mb-8 group">
              <img
                src={coverImageUrl}
alt={strings[momentTitle] || momentTitle}
                className="object-cover object-center w-full h-full transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 inline-flex w-auto left-4 right-4">
                <Card className="w-full bg-white/95 backdrop-blur-xs border-0 shadow-xs md:shadow-lg rounded-xs overflow-hidden">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex-1">
<h1 className="heading-lg" data-trans-managed="true">
                          {strings[momentTitle] || momentTitle}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-slate-600">
                          {moment.firstPublishedDate && (
                            <div className="flex items-center gap-1 md:gap-2">
                              <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                              <span className="description">
{new Date(
                                  moment.firstPublishedDate,
                                ).toLocaleDateString(undefined, {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          )}
                          {moment.location && (
                            <div className="flex items-center gap-1 md:gap-2">
                              <MapPin className="h-3 w-3 md:h-4 md:w-4" />
<span
                                className="description"
                                data-trans-managed="true"
                              >
                                {strings[momentLocation] || momentLocation}
                              </span>
                            </div>
                          )}
                          {galleryImages.length > 0 && (
                            <div className="flex items-center gap-1 md:gap-2">
                              <Images className="h-3 w-3 md:h-4 md:w-4" />
<span
                                className="description"
                                data-trans-managed="true"
                              >
                                {galleryImages.length !== 1
                                  ? `${galleryImages.length} ${strings["photos"]}`
                                  : `1 ${strings["photo"]}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="hidden md:block">
                        {moment.category && (
<Badge
                            className="bg-gradient-to-r from-rose-1000 to-pink-500 text-white border-0 rounded-full px-4 py-2 font-medium shadow-lg"
                            data-trans-managed="true"
                          >
                            <Sparkles className="h-3 w-3 mr-1.5" />
                            {strings[momentCategory] || momentCategory}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 px-2 md:px-0">
          {/* Main Content */}
          <div className="md:col-span-8 lg:col-span-9 space-y-6 md:space-y-12">
            {/* Story Content */}
            {moment.content && moment.content !== moment.shortDescription && (
              <Card className="bg-white/80 border-0 shadow-xs md:shadow-lg rounded-xs overflow-hidden">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-[#E22026] rounded-xs md:rounded-2xl flex items-center justify-center shadow-md">
                      <User className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <div>
<h2 className="title-heading" data-trans-managed="true">
                        {strings["Patient Story"]}
                      </h2>
                      <p className="description" data-trans-managed="true">
                        {strings["A journey of hope and healing"]}
                      </p>
                    </div>
                  </div>
                  <div className="prose prose-sm md:prose-lg prose-slate max-w-none">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: translatedHtmlContent,
                      }}
                      data-trans-managed="true"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Photo Gallery */}
            {galleryImages.length > 0 && (
              <Card className="md:bg-white/80 px-0 md:backdrop-blur-sm border-0 shadow-none md:shadow-xs bg-gray-50 rounded-xs overflow-hidden">
                <CardContent className=" px-0 md:p-8">
                  <div className="flex items-center justify-between mb-5 md:mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 md:w-14 md:h-14 bg-gray-100 rounded-xs md:rounded-xs flex items-center justify-center shadow-xs">
                        <Images className="h-8 w-8 md:h-6 md:w-6 text-[#241d1f]" />
                      </div>
                      <div>
<h2
                          className="title-heading"
                          data-trans-managed="true"
                        >
                          {strings["Photo Gallery"]}
                        </h2>
                        <p
                          className="description"
                          data-trans-managed="true"
                        >
                          {strings["beautiful moments captured"]}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-4">
                    {galleryImages.map((media, index) => {
const imageUrl = getWixImageUrl(media.src);
                      if (!imageUrl) return null;
                      return (
                        <div
                          key={index}
                          className="relative aspect-square overflow-hidden rounded-xs md:rounded-xs bg-slate-100 group cursor-pointer shadow-sm hover:shadow-xs transition-all duration-300"
                          onClick={() => openLightbox(index)}
                        >
                          <OptimizedImage
                            src={imageUrl}
alt={
                              strings[media.alt || media.title || `Gallery image ${index + 1}`] ||
                              media.alt ||
                              media.title ||
                              `Gallery image ${index + 1}`
                            }
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            fallbackSrc="/placeholder.svg?height=300&width=300&text=Beautiful Memory"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 md:p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                <ZoomIn className="h-4 w-4 md:h-5 md:w-5 text-slate-700" />
                              </div>
                            </div>
                            {(media.title || media.description) && (
                              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
{media.title && (
                                  <p className="font-semibold text-xs md:text-sm mb-1" data-trans-managed="true">
                                    {strings[media.title] || media.title}
                                  </p>
                                )}
                                {media.description && (
                                  <p className="text-xs opacity-90 hidden md:block" data-trans-managed="true">
                                    {strings[media.description] || media.description}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
);
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          {/* Desktop Sidebar */}
          <div className="hidden md:block md:col-span-4 lg:col-span-3 space-y-6">
            <div className="sticky top-20">
              <Card className="bg-white/90 backdrop-blur-md border border-gray-100 shadow-xs rounded-xs overflow-hidden">
                <BlogAside />
              </Card>
              {(moment.tags || moment.hashtags || moment.category) && (
                <Card className="bg-white/90 backdrop-blur-md border border-slate-100 shadow-xs rounded-xs overflow-hidden mt-6">
                  <CardContent className="p-6">
<h2
                      className="text-xl font-semibold text-slate-900 flex items-center gap-2 mb-4"
                      data-trans-managed="true"
                    >
                      <Tag className="w-5 h-5 text-blue-500" />
                      {strings["Tags"]}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {moment.category && (
                        <Badge
                          className="bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 border border-rose-200 rounded-full px-3 py-1 text-xs font-medium"
                          data-trans-managed="true"
                        >
                          {strings[momentCategory] || momentCategory}
                        </Badge>
                      )}
                      {moment.tags &&
                        moment.tags.split(",").map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="border border-slate-200 text-slate-600 rounded-full px-3 py-1 text-xs font-medium"
data-trans-managed="true"
                          >
                            {strings[tag.trim()] || tag.trim()}
                          </Badge>
                        ))}
                      {moment.hashtags &&
                        moment.hashtags.split(" ").map((hashtag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="border border-slate-200 text-slate-600 rounded-full px-3 py-1 text-xs font-medium"
data-trans-managed="true"
                          >
                            {strings[hashtag.trim()] || hashtag.trim()}
                          </Badge>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              <Card className="bg-[#E22026] mt-6 text-white border-0 shadow-xs rounded-xs overflow-hidden">
                <CardContent className="p-6">
<h2
                    className="text-2xl font-semibold mb-3"
                    data-trans-managed="true"
                  >
                    {strings["Share This Story"]}
                  </h2>
                  <p
                    className="text-lg text-pink-100 mb-6 leading-relaxed"
                    data-trans-managed="true"
                  >
                    {strings["Help inspire others by sharing this beautiful journey of hope and healing."]}
                  </p>
                  <div className="space-y-3">
                    <Button
                      onClick={handleShare}
                      className="w-full bg-white text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl font-medium"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
<span data-trans-managed="true">
                        {strings["Share Story"]}
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-white text-white hover:bg-white hover:text-rose-600 rounded-xl font-medium"
                    >
                      <Download className="w-4 h-4 mr-2" />
<span data-trans-managed="true">
                        {strings["Save Photos"]}
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        {/* Mobile Sidebar Section at the bottom */}
        <div className="md:hidden px-4 space-y-6 mt-6">
          <Card className="bg-white/90 backdrop-blur-md border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <BlogAside />
          </Card>
{(moment.tags || moment.hashtags || moment.category) && (
            <Card className="bg-white/90 backdrop-blur-md border border-slate-100 shadow-sm rounded-xl overflow-hidden">
              <CardContent className="p-4">
                <h2
                  className="text-xl font-semibold text-slate-900 flex items-center gap-2 mb-3"
                  data-trans-managed="true"
                >
                  <Tag className="w-4 h-4 text-blue-500" />
                  {strings["Tags"]}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {moment.category && (
                    <Badge
                      className="bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 border border-rose-200 rounded-full px-3 py-1 text-xs font-medium"
                      data-trans-managed="true"
                    >
                      {strings[momentCategory] || momentCategory}
                    </Badge>
                  )}
                  {moment.tags &&
                    moment.tags.split(",").map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border border-slate-200 text-slate-600 rounded-full px-3 py-1 text-xs font-medium"
data-trans-managed="true"
                      >
                        {strings[tag.trim()] || tag.trim()}
                      </Badge>
                    ))}
                  {moment.hashtags &&
                    moment.hashtags.split(" ").map((hashtag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border border-slate-200 text-slate-600 rounded-full px-3 py-1 text-xs font-medium"
data-trans-managed="true"
                      >
                        {strings[hashtag.trim()] || hashtag.trim()}
                      </Badge>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
          <Card className="bg-[#E22026] text-white border-0 shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-6">
<h2
                className="text-xl font-semibold mb-3"
                data-trans-managed="true"
              >
                {strings["Share This Story"]}
              </h2>
              <p
                className="text-sm text-pink-100 mb-6 leading-relaxed"
                data-trans-managed="true"
              >
                {strings["Help inspire others by sharing this beautiful journey of hope and healing."]}
              </p>
              <div className="space-y-3">
                <Button
                  onClick={handleShare}
                  className="w-full bg-white text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl font-medium"
                >
                  <Share2 className="w-4 h-4 mr-2" />
<span data-trans-managed="true">
                    {strings["Share Story"]}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-white text-white hover:bg-white hover:text-rose-600 rounded-xl font-medium"
                >
                  <Download className="w-4 h-4 mr-2" />
<span data-trans-managed="true">
                    {strings["Save Photos"]}
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Lightbox */}
      {isLightboxOpen && selectedImageIndex !== null && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full h-full flex items-center justify-center">
            <Button
              onClick={closeLightbox}
              variant="ghost"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/10 rounded-full p-3"
            >
              <X className="h-6 w-6" />
            </Button>
            {galleryImages.length > 1 && (
              <>
                <Button
                  onClick={() => navigateImage("prev")}
                  variant="ghost"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/10 rounded-full p-3"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  onClick={() => navigateImage("next")}
                  variant="ghost"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/10 rounded-full p-3"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
<div className="relative max-w-full max-h-full">
               <OptimizedImage
                 src={
                   getWixImageUrl(galleryImages[selectedImageIndex].src) || ""
                 }
                 alt={
                   galleryImages[selectedImageIndex].alt ||
                   galleryImages[selectedImageIndex].title ||
                   `Gallery image ${selectedImageIndex + 1}`
                 }
                 width={1200}
                 height={800}
                 className="max-w-full max-h-full object-contain rounded-lg"
                 fallbackSrc="/placeholder.svg?height=800&width=1200&text=Image"
               />
             </div>
             {(galleryImages[selectedImageIndex].title ||
               galleryImages[selectedImageIndex].description) && (
               <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-xl p-4 text-white">
                 {galleryImages[selectedImageIndex].title && (
                   <h4 className="font-semibold text-base mb-1" data-trans-managed="true">
                     {strings[galleryImages[selectedImageIndex].title] || galleryImages[selectedImageIndex].title}
                   </h4>
                 )}
                 {galleryImages[selectedImageIndex].description && (
                   <p className="text-sm opacity-90" data-trans-managed="true">
                     {strings[galleryImages[selectedImageIndex].description] || galleryImages[selectedImageIndex].description}
                   </p>
                 )}
               </div>
             )}
            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs font-medium">
              {selectedImageIndex + 1} / {galleryImages.length}
            </div>
          </div>
        </div>
      )}
    </main>
);
}
