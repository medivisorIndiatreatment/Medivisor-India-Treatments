import { HomepageLoadingSkeleton } from "@/components/ui/BannerSkeleton";

export default function Loading() {
  return (
    <div className="relative">
      {/* Instant loading indicator for faster perceived load */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200 overflow-hidden">
        <div className="h-full bg-[#23366E] animate-pulse w-1/3" />
      </div>
      <HomepageLoadingSkeleton />
    </div>
  );
}