// components/ScrollRestoration.tsx
// Ensures scroll-to-top on every route change for consistent navigation behavior
"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

export default function ScrollRestoration() {
  const pathname = usePathname()

  useEffect(() => {
    // Scroll to top on every route change
    // Using requestAnimationFrame to ensure DOM is ready
    const handleScroll = () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }

    // Small delay to allow page content to render
    const timer = setTimeout(handleScroll, 100)

    return () => clearTimeout(timer)
  }, [pathname])

  return null
}
