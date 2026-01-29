import { useEffect, useRef, useState, useCallback } from "react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  image?: string;
  website?: string;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  autoPlayInterval?: number;
}

export default function TestimonialCarousel({
  testimonials,
  autoPlayInterval = 10000,
}: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
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

  useEffect(() => {
    if (isHovering) {
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
  }, [isHovering, autoPlayInterval, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStart.x;
    const deltaY = e.changedTouches[0].clientY - touchStart.y;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }
  };

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
      {/* Navigation at top */}
      {totalSlides > 1 && (
        <div className="mb-6 flex items-center justify-end gap-3">
          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-strawhat-yellow w-5"
                    : "w-1.5 bg-zinc-400 hover:bg-zinc-500 dark:bg-zinc-500 dark:hover:bg-zinc-400"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
                aria-current={index === currentIndex ? "true" : "false"}
              />
            ))}
          </div>

          {/* Previous button */}
          <button
            onClick={prevSlide}
            className="hover:text-strawhat-yellow group hover:border-strawhat-yellow/60 flex size-8 items-center justify-center rounded-full border border-zinc-300 text-zinc-500 transition-all dark:border-zinc-600 dark:text-zinc-400"
            aria-label="Previous testimonial"
          >
            <svg
              className="size-4 transition-transform group-hover:-translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next button */}
          <button
            onClick={nextSlide}
            className="hover:text-strawhat-yellow group hover:border-strawhat-yellow/60 flex size-8 items-center justify-center rounded-full border border-zinc-300 text-zinc-500 transition-all dark:border-zinc-600 dark:text-zinc-400"
            aria-label="Next testimonial"
          >
            <svg
              className="size-4 transition-transform group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Main carousel container */}
      <div className="relative overflow-hidden">
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
              {/* Card */}
              <div className="mx-auto max-w-3xl">
                <article className="group relative">
                  <div className="relative rounded-2xl border border-zinc-200/60 bg-white/70 px-6 py-6 backdrop-blur-sm transition-all duration-300 hover:border-zinc-300/80 hover:bg-white/90 hover:shadow-lg hover:shadow-zinc-200/50 md:px-8 md:py-8 dark:border-zinc-800/60 dark:bg-zinc-900/70 dark:hover:border-zinc-700/80 dark:hover:bg-zinc-900/90 dark:hover:shadow-zinc-900/50">
                    {/* Quote content */}
                    <div className="space-y-5">
                      <div className="flex gap-2">
                        <span className="text-strawhat-yellow/50 shrink-0 font-serif text-2xl leading-none">
                          "
                        </span>
                        <div
                          className="testimonial-content [&_strong]:font-medium [&_strong]:text-zinc-900 [&_strong]:dark:text-white [&>p]:mb-3 [&>p]:text-sm [&>p]:leading-relaxed [&>p]:font-light [&>p]:text-zinc-700 md:[&>p]:text-base [&>p]:dark:text-zinc-200 [&>p:last-child]:mb-0"
                          dangerouslySetInnerHTML={{
                            __html: testimonial.content,
                          }}
                        />
                      </div>

                      {/* Author section */}
                      <div className="flex items-center gap-3 border-t border-zinc-200/60 pt-5 dark:border-zinc-800/60">
                        {/* Photo */}
                        <div className="border-strawhat-yellow/30 size-10 shrink-0 overflow-hidden rounded-full border-2 md:size-12">
                          {testimonial.image ? (
                            <img
                              src={testimonial.image}
                              alt={testimonial.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="bg-strawhat-yellow/10 flex h-full w-full items-center justify-center">
                              <span className="text-strawhat-yellow text-base font-medium">
                                {testimonial.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Name and role */}
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                            {testimonial.website ? (
                              <a
                                href={testimonial.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-strawhat-yellow transition-colors"
                              >
                                {testimonial.name}
                              </a>
                            ) : (
                              testimonial.name
                            )}
                          </div>
                          <div className="truncate text-xs font-light text-zinc-500 dark:text-zinc-400">
                            {testimonial.role}
                            {testimonial.company && (
                              <span className="text-strawhat-yellow/80">
                                {" "}
                                · {testimonial.company}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
