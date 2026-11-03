'use client'

import * as React from 'react'
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HomepageCarouselProps {
  children: React.ReactNode
  className?: string
  showDots?: boolean
  autoplay?: boolean
  autoplayDelay?: number
  showControls?: boolean
  pauseOnHover?: boolean
  loop?: boolean
  slideClassName?: string
  title?: string
  titleClassName?: string
  centerNavOnSlides?: boolean
  virtualize?: boolean
  virtualizeBuffer?: number
  virtualizeInitial?: number
  direction?: 'ltr' | 'rtl'
  gapClassName?: string
  basisClassName?: string
}

export default function HomepageCarousel({
  children,
  className,
  showDots = false,
  autoplay = true,
  autoplayDelay = 3000,
  showControls = true,
  pauseOnHover = true,
  loop = true,
  slideClassName,
  title,
  titleClassName,
  centerNavOnSlides = false,
  virtualize = false,
  virtualizeBuffer = 4,
  virtualizeInitial = 12,
  direction,
  gapClassName = 'gap-3',
  basisClassName,
}: HomepageCarouselProps) {
  const slides = React.Children.toArray(children)
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([])
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)
  const [slidesInView, setSlidesInView] = React.useState<number[]>([])

  const resolvedDirection = direction ?? (typeof document !== 'undefined' ? (document.documentElement.dir as 'ltr' | 'rtl') : 'ltr')
  const isRtl = resolvedDirection === 'rtl'

  const autoplayPlugin = React.useMemo(
    () =>
      Autoplay({
        delay: autoplayDelay,
        stopOnInteraction: false,
        stopOnMouseEnter: pauseOnHover,
      }),
    [autoplayDelay, pauseOnHover]
  )

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop,
      align: 'start',
      skipSnaps: false,
      direction: resolvedDirection,
      slidesToScroll: 1,
      duration: 25,
      dragFree: true,
    },
    autoplay ? [autoplayPlugin] : []
  )

  React.useEffect(() => {
    if (!emblaApi) return

    const updateState = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
      setScrollSnaps(emblaApi.scrollSnapList())
      setCanScrollPrev(emblaApi.canScrollPrev())
      setCanScrollNext(emblaApi.canScrollNext())
      setSlidesInView(emblaApi.slidesInView())
    }

    updateState()
    emblaApi.on('select', updateState)
    emblaApi.on('reInit', updateState)
    emblaApi.on('slidesInView', updateState)

    return () => {
      emblaApi.off('select', updateState)
      emblaApi.off('reInit', updateState)
      emblaApi.off('slidesInView', updateState)
    }
  }, [emblaApi])

  const renderWindow = React.useMemo(() => {
    if (!virtualize) return null
    const total = slides.length
    if (total === 0) return new Set<number>()

    const base =
      slidesInView.length > 0
        ? slidesInView
        : Array.from({ length: Math.min(virtualizeInitial, total) }, (_, i) => i)

    const set = new Set<number>()
    for (const inView of base) {
      for (let offset = -virtualizeBuffer; offset <= virtualizeBuffer; offset++) {
        const idx = loop
          ? (((inView + offset) % total) + total) % total
          : inView + offset
        if (idx >= 0 && idx < total) set.add(idx)
      }
    }
    return set
  }, [virtualize, slidesInView, slides.length, virtualizeBuffer, virtualizeInitial, loop])

  const scrollPrev = React.useCallback(() => {
    emblaApi?.scrollPrev()
  }, [emblaApi])

  const scrollNext = React.useCallback(() => {
    emblaApi?.scrollNext()
  }, [emblaApi])

  const showNavigation = showControls && (canScrollPrev || canScrollNext)

  return (
    <div className={cn('w-full relative', className)}>
      {title && (
        <div className="px-4 sm:px-6 md:px-8 lg:px-10 mb-6">
          <h2 className={cn('text-2xl font-bold', titleClassName)}>{title}</h2>
        </div>
      )}

      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className={cn('flex', gapClassName)}>
            {slides.map((child, index) => {
              const shouldRender = !renderWindow || renderWindow.has(index)
              return (
                <div
                  key={index}
                  className={cn(
                    'min-w-0 shrink-0 grow-0',
                    basisClassName || 'basis-full sm:basis-[calc(50%-6px)] md:basis-[calc(33.333%-8px)] lg:basis-[calc(25%-9px)]',
                    slideClassName
                  )}
                >
                  {shouldRender ? (
                    child
                  ) : (
                    <div
                      className="h-full w-full min-h-[300px]"
                      aria-hidden="true"
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {showNavigation && (
          <>
            <Button
              onClick={isRtl ? scrollNext : scrollPrev}
              className={cn(
                'absolute left-0 sm:left-2 z-10 bg-white text-[#241d1f] p-2 rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-200 border border-gray-300 hidden md:flex',
                centerNavOnSlides
                  ? 'top-28 md:top-32 -translate-y-1/2'
                  : 'top-1/2 -translate-y-1/2 -mt-10'
              )}
              variant="outline"
              size="icon"
              aria-label="Previous slide"
              disabled={!canScrollPrev}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              onClick={isRtl ? scrollPrev : scrollNext}
              className={cn(
                'absolute right-0 sm:right-2 z-10 bg-white text-[#241d1f] p-2 rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-200 border border-gray-300 hidden md:flex',
                centerNavOnSlides
                  ? 'top-28 md:top-32 -translate-y-1/2'
                  : 'top-1/2 -translate-y-1/2 -mt-10'
              )}
              variant="outline"
              size="icon"
              aria-label="Next slide"
              disabled={!canScrollNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>

      {showDots && scrollSnaps.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-4">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-200 cursor-pointer bg-gray-300',
                index === selectedIndex
                  ? 'w-6 bg-[#E22026]'
                  : 'w-1.5 hover:bg-gray-400'
              )}
              aria-label={`Go to slide ${index + 1}`}
              type="button"
            />
          ))}
        </div>
      )}
    </div>
  )
}
