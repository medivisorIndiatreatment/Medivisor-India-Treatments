"use client"

import { useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslatedString } from "@/lib/i18n"

interface PremiumVideoModalProps {
  videoId: string | null
  title: string
  onClose: () => void
}

export function PremiumVideoModal({ videoId, title, onClose }: PremiumVideoModalProps) {
  const closeLabel = useTranslatedString("Close video")
  const nowPlaying = useTranslatedString("Now Playing")

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (!videoId) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [videoId, onClose])

  return (
    <AnimatePresence>
      {videoId && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Video: ${title}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Backdrop with blur */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={handleBackdropClick}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />

          {/* Modal container */}
          <motion.div
            className={cn(
              "relative w-full max-w-5xl",
              "bg-white/10 backdrop-blur-xl",
              "border border-white/20",
              "rounded-3xl shadow-2xl",
              "p-3 sm:p-4 md:p-6"
            )}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Close button */}
            <motion.button
              type="button"
              onClick={onClose}
              className={cn(
                "absolute -top-3 -right-3 sm:-top-4 sm:-right-4 z-10",
                "flex items-center justify-center",
                "h-10 w-10 sm:h-12 sm:w-12",
                "rounded-full",
                "bg-white/90 backdrop-blur-md",
                "border border-white/50",
                "text-slate-700",
                "shadow-lg hover:shadow-xl",
                "transition-colors duration-300",
                "hover:bg-white",
                "focus:outline-none focus:ring-2 focus:ring-[#29A9B9]/50"
              )}
aria-label={closeLabel}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
            </motion.button>

            {/* Video container */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/40 shadow-inner">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&color=white`}
                title={title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-white/80">
              <div className="h-1.5 w-1.5 rounded-full bg-[#29A9B9] animate-pulse" />
<span className="font-medium">{nowPlaying}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
