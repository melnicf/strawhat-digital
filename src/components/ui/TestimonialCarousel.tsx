import { useEffect, useRef, useState, useCallback } from "react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  image?: string;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  autoPlayInterval?: number;
}

export default function TestimonialCarousel({
  testimonials,
  autoPlayInterval = 6000,
}: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const carouselRef = useRef<HTMLDivElement>(null);

  const totalSlides = testimonials.length;

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 500);
    },
    [isTransitioning]
  );

  const nextSlide = useCallback(() => {
    goToSlide((currentIndex + 1) % totalSlides);
  }, [currentIndex, totalSlides, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentIndex - 1 + totalSlides) % totalSlides);
  }, [currentIndex, totalSlides, goToSlide]);

  // Auto-advance logic
  useEffect(() => {
    if (isHovering || isPaused) {
      if (autoAdvanceTimerRef.current) {
        clearInterval(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
      return;
    }

    autoAdvanceTimerRef.current = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => {
      if (autoAdvanceTimerRef.current) {
        clearInterval(autoAdvanceTimerRef.current);
      }
    };
  }, [isHovering, isPaused, autoPlayInterval, nextSlide]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStart.x;
    const deltaY = e.changedTouches[0].clientY - touchStart.y;

    // Only trigger swipe if horizontal movement is greater than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!carouselRef.current?.contains(document.activeElement)) return;

      if (e.key === "ArrowLeft") {
        prevSlide();
      } else if (e.key === "ArrowRight") {
        nextSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  if (totalSlides === 0) return null;

  return (
    <div
      ref={carouselRef}
      className="relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Testimonials carousel"
      aria-roledescription="carousel"
      tabIndex={0}
    >
      {/* Main carousel container */}
      <div className="relative overflow-hidden">
        {/* Slides container */}
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="w-full shrink-0 px-4"
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${totalSlides}`}
              aria-hidden={index !== currentIndex}
            >
              <div className="mx-auto max-w-3xl">
                {/* Quote */}
                <blockquote className="relative text-center">
                  <p className="text-strawhat-text relative text-xl leading-relaxed font-light md:text-2xl">
                    {/* Opening quote mark - inline before text */}
                    <span
                      className="text-strawhat-yellow/30 mr-1 -mb-2 inline-block align-top font-serif text-3xl leading-none md:-mb-3 md:text-4xl"
                      aria-hidden
                    >
                      "
                    </span>
                    {testimonial.quote}
                    {/* Closing quote mark - inline at the end of text */}
                    <span
                      className="text-strawhat-yellow/30 -mb-2 ml-1 inline-block align-top font-serif text-3xl leading-none md:-mb-3 md:text-4xl"
                      aria-hidden
                    >
                      "
                    </span>
                  </p>
                </blockquote>

                {/* Author info */}
                <div className="mt-8 flex items-center justify-center gap-4">
                  {/* Photo */}
                  <div className="border-strawhat-yellow/30 size-14 shrink-0 overflow-hidden rounded-full border-2">
                    {testimonial.image ? (
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="bg-strawhat-yellow/10 flex h-full w-full items-center justify-center">
                        <span className="text-strawhat-yellow text-lg font-medium">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Name and role */}
                  <div>
                    <div className="text-strawhat-text font-medium">
                      {testimonial.name}
                    </div>
                    <div className="text-strawhat-text-light text-sm font-light">
                      {testimonial.role}
                      {testimonial.company && ` at ${testimonial.company}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      {totalSlides > 1 && (
        <div className="mt-10 flex items-center justify-center gap-6">
          {/* Previous button */}
          <button
            onClick={prevSlide}
            className="text-strawhat-text-light hover:text-strawhat-yellow group flex size-10 items-center justify-center rounded-full border border-zinc-200/60 transition-all hover:border-zinc-300/80 dark:border-zinc-800/60 dark:hover:border-zinc-700/80"
            aria-label="Previous testimonial"
          >
            <svg
              className="size-5 transition-transform group-hover:-translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-strawhat-yellow w-6"
                    : "bg-strawhat-text-light/30 hover:bg-strawhat-text-light/50 w-2"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
                aria-current={index === currentIndex ? "true" : "false"}
              />
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={nextSlide}
            className="text-strawhat-text-light hover:text-strawhat-yellow group flex size-10 items-center justify-center rounded-full border border-zinc-200/60 transition-all hover:border-zinc-300/80 dark:border-zinc-800/60 dark:hover:border-zinc-700/80"
            aria-label="Next testimonial"
          >
            <svg
              className="size-5 transition-transform group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Pause/Play indicator (visible on hover) */}
      <div
        className={`pointer-events-none absolute top-4 right-4 transition-opacity duration-300 ${
          isHovering ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="text-strawhat-text-light/50 text-xs font-light">
          {isHovering ? "Paused" : "Auto-playing"}
        </div>
      </div>
    </div>
  );
}
