'use client';

import { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import HomepageCarousel from "@/components/ui/HomepageCarousel";
import { DESIGN_TOKENS, getAlternatingBackground } from "@/components/design-tokens";
import SectionHeading from "@/components/ui/SectionHeading";
import { getWixImageUrl } from "@/lib/wixMedia"
import { fetcher } from "@/lib/utils/swr"
import type { Post } from "@/lib/utils/blog"

interface BlogPostCarouselProps {
  category: string;
  title: string;
  description: string;
  sectionIndex: number; // For alternating background
}

export default function BlogPostCarousel({ category, title, description, sectionIndex }: BlogPostCarouselProps) {
  const { data, error, isLoading } = useSWR(
    `/api/wix-posts?limit=12&offset=0&category=${category}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
    }
  );

  const posts = Array.isArray(data?.posts)
    ? data.posts.map((post: any) => ({
        title: post.title,
        description: post.excerpt || "Celebrating moments of care and joy.",
        image: getWixImageUrl(post.media?.wixMedia?.image || post.coverMedia?.image) || "/placeholder.svg",
        slug: post.slug,
      }))
    : [];

  if (isLoading) {
    return (
      <section className={`${getAlternatingBackground(sectionIndex)} ${DESIGN_TOKENS.SECTION_SPACING.PY} overflow-hidden relative`}>
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING} relative`}>
         <div className="md:text-center md:mb-8 mb-4 max-w-3xl mx-auto">
           <h2 className={DESIGN_TOKENS.TYPOGRAPHY.H2 + " mb-2"}>
             {title}<br className="md:hidden block" />
           </h2>
           <p className={DESIGN_TOKENS.TYPOGRAPHY.BODY_BASE}>
             {description}
           </p>
         </div>
         <div className="flex justify-center items-center py-12">
           <div className="animate-pulse flex space-x-4">
             <div className="rounded-lg bg-gray-300 h-56 w-80"></div>
             <div className="rounded-lg bg-gray-300 h-56 w-80"></div>
             <div className="rounded-lg bg-gray-300 h-56 w-80"></div>
           </div>
         </div>
       </div>
     </section>
   );
 }

 if (error || posts.length === 0) {
   return null; // Don't show section if there's an error or no posts
 }

  return (
    <section className={`${getAlternatingBackground(sectionIndex)} ${DESIGN_TOKENS.SECTION_SPACING.PY} overflow-hidden relative`}>
      <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING} relative`}>
         {/* Heading */}
         <div className="md:text-center mb-2 md:mb-4max-w-3xl mx-auto">
           <SectionHeading title={title} align="center" />
           <p className={DESIGN_TOKENS.TYPOGRAPHY.BODY_BASE}>
             {description}
           </p>
        </div>

{/* Carousel */}
         <HomepageCarousel
           showControls={true}
           autoplay
         >
         {posts.map((post: any, index: number) => (
           <div key={post.slug || index} className="h-full">
             <Link href={`/blog/${post.slug}`} className="block h-full">
               <div className="relative group cursor-pointer overflow-hidden rounded-xs shadow h-full">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover rounded-md transition-transform duration-500 group-hover:scale-105"
                  />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                 <div className="absolute bottom-4 left-4 right-4 text-white">
                   <h2 className="w-full inline-flex text-2xl md:text-2xl font-medium leading-tight text-white group-hover:text-primary transition-colors tracking-tight">
                     {post.title}
                   </h2>
                 </div>
               </div>
             </Link>
           </div>
         ))}
       </HomepageCarousel>
     </div>
   </section>
  );
}