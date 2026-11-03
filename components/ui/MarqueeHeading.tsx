"use client"

import { ReactNode, useState, useEffect, useRef, useMemo } from "react"

interface MarqueeHeadingProps {
  children: ReactNode
  isHovered: boolean
  className?: string
  gap?: number
  speed?: number
}

export default function MarqueeHeading({
  children,
  isHovered,
  className = "",
  gap = 50,
  speed = 50,
}: MarqueeHeadingProps) {
  const [shouldShowMarquee, setShouldShowMarquee] = useState(false)
  const [textWidth, setTextWidth] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)
  const marqueeRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<Animation | null>(null)

  useEffect(() => {
    const measure = () => {
      if (containerRef.current && measureRef.current) {
        const containerW = containerRef.current.offsetWidth
        const textW = measureRef.current.scrollWidth
        setShouldShowMarquee(textW > containerW && textW > 0 && containerW > 0)
        setTextWidth(textW)
        setContainerWidth(containerW)
        setIsReady(true)
      }
    }

    measure()
    const timeout = setTimeout(measure, 100)

    const resizeObserver = new ResizeObserver(measure)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    window.addEventListener("resize", measure)

    return () => {
      clearTimeout(timeout)
      window.removeEventListener("resize", measure)
      resizeObserver.disconnect()
    }
  }, [children])

  useEffect(() => {
    if (!shouldShowMarquee || !marqueeRef.current) return

    const unitWidth = textWidth + gap
    const duration = Math.max(5, unitWidth / speed) * 1000

    if (animationRef.current) {
      animationRef.current.cancel()
    }

    animationRef.current = marqueeRef.current.animate(
      [
        { transform: "translateX(0)" },
        { transform: `translateX(-${unitWidth}px)` },
      ],
      {
        duration,
        iterations: Infinity,
        easing: "linear",
      }
    )

    if (!isHovered) {
      animationRef.current.pause()
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.cancel()
        animationRef.current = null
      }
    }
  }, [shouldShowMarquee, textWidth, gap, speed])

  useEffect(() => {
    if (!animationRef.current) return
    if (isHovered) {
      animationRef.current.currentTime = 0
      animationRef.current.play()
    } else {
      animationRef.current.pause()
      animationRef.current.currentTime = 0
    }
  }, [isHovered])

  const unitWidth = useMemo(() => textWidth + gap, [textWidth, gap])

  const copies = useMemo(() => {
    if (!shouldShowMarquee || unitWidth <= 0 || containerWidth <= 0) return 3
    return Math.max(3, Math.ceil(containerWidth / unitWidth) + 2)
  }, [shouldShowMarquee, unitWidth, containerWidth])

  const duration = useMemo(() => {
    if (!shouldShowMarquee || unitWidth <= 0) return 5
    return Math.max(5, unitWidth / speed)
  }, [shouldShowMarquee, unitWidth, speed])

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden whitespace-nowrap w-full ${className}`}
      style={{ maxWidth: "100%", opacity: isReady ? 1 : 0, transition: "opacity 0.2s ease-in" }}
    >
      <span
        ref={measureRef}
        className="fixed -left-[9999px] whitespace-nowrap pointer-events-none"
        aria-hidden="true"
      >
        {children}
      </span>

      {isReady && !shouldShowMarquee && (
        <div className="inline-flex items-center w-full">
          <span className="block truncate">{children}</span>
        </div>
      )}

      {isReady && shouldShowMarquee && (
        <div
          ref={marqueeRef}
          className={`inline-flex items-center whitespace-nowrap`}
        >
          {Array.from({ length: copies }).map((_, i) => (
            <span
              key={i}
              className="inline-block"
              style={{
                whiteSpace: "nowrap",
                marginRight: i < copies - 1 ? `${gap}px` : 0,
              }}
            >
              {children}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
