import { useEffect, useRef, useState } from "react";

interface MediaItem {
  type: "image" | "video";
  src: string;
  srcMobile?: string;
  alt: string;
  caption?: string;
  poster?: string;
}

interface CaseStudySlideshowProps {
  media: MediaItem[];
}

export default function CaseStudySlideshow({ media }: CaseStudySlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentDevice, setCurrentDevice] = useState<"desktop" | "mobile">(
    "desktop"
  );
  const [isHovering, setIsHovering] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const slideshowRef = useRef<HTMLDivElement>(null);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const AUTO_ADVANCE_INTERVAL = 5000; // 5 seconds
  const totalSlides = media.length;

  // Check if any media items have mobile versions
  const hasMobileVersions = media.some((item) => item.srcMobile);

  const shouldPause = () => isHovering || isVideoPlaying;

  const showSlide = (index: number) => {
    setCurrentIndex(index);
    // Pause all videos
    const videos = slideshowRef.current?.querySelectorAll("video");
    videos?.forEach((video) => video.pause());
  };

  const nextSlide = () => {
    showSlide((currentIndex + 1) % totalSlides);
  };

  const prevSlide = () => {
    showSlide((currentIndex - 1 + totalSlides) % totalSlides);
  };

  const startAutoAdvance = () => {
    if (autoAdvanceTimerRef.current) return;
    autoAdvanceTimerRef.current = setInterval(() => {
      if (!shouldPause()) nextSlide();
    }, AUTO_ADVANCE_INTERVAL);
  };

  const stopAutoAdvance = () => {
    if (autoAdvanceTimerRef.current) {
      clearInterval(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  };

  const resetAutoAdvance = () => {
    stopAutoAdvance();
    startAutoAdvance();
  };

  const handleVideoPlay = () => setIsVideoPlaying(true);
  const handleVideoPause = () => setIsVideoPlaying(false);
  const handleVideoEnded = () => {
    setIsVideoPlaying(false);
    nextSlide();
    resetAutoAdvance();
  };

  const switchDevice = (device: "desktop" | "mobile") => {
    setCurrentDevice(device);
  };

  // Touch/swipe navigation
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStart.x;
    const deltaY = touchEndY - touchStart.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    const minSwipeDistance = 50;

    if (absDeltaX > absDeltaY && absDeltaX > minSwipeDistance) {
      if (deltaX > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
      resetAutoAdvance();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!slideshowRef.current) return;
      const rect = slideshowRef.current.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.key === "ArrowRight") {
        nextSlide();
        resetAutoAdvance();
      }
      if (e.key === "ArrowLeft") {
        prevSlide();
        resetAutoAdvance();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  // Intersection observer for auto-advance
  useEffect(() => {
    if (!slideshowRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startAutoAdvance();
          } else {
            stopAutoAdvance();
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(slideshowRef.current);

    return () => {
      observer.disconnect();
      stopAutoAdvance();
    };
  }, [isHovering, isVideoPlaying, currentIndex]);

  const currentMediaSrc =
    currentDevice === "mobile" && media[currentIndex].srcMobile
      ? media[currentIndex].srcMobile
      : media[currentIndex].src;

  return (
    <div
      ref={slideshowRef}
      className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8"
    >
      {/* Device Toggle Buttons - Desktop only */}
      {hasMobileVersions && (
        <div className="mb-6 hidden items-center justify-center gap-3 md:flex">
          <button
            type="button"
            onClick={() => switchDevice("desktop")}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
              currentDevice === "desktop"
                ? "border-strawhat-yellow bg-strawhat-yellow hover:border-strawhat-amber hover:bg-strawhat-amber text-white"
                : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            }`}
            aria-label="Show desktop view"
          >
            <svg
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            Desktop
          </button>
          <button
            type="button"
            onClick={() => switchDevice("mobile")}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
              currentDevice === "mobile"
                ? "border-strawhat-yellow bg-strawhat-yellow hover:border-strawhat-amber hover:bg-strawhat-amber text-white"
                : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            }`}
            aria-label="Show mobile view"
          >
            <svg
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <line x1="12" y1="18" x2="12" y2="18" />
            </svg>
            Phone
          </button>
        </div>
      )}

      {/* Mobile: Simple full-width media without frame */}
      <div className="group/slideshow relative flex items-center md:hidden">
        {/* Full-width media container */}
        <div className="relative w-full overflow-hidden rounded-lg">
          <div
            className="relative aspect-video w-full bg-black"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {media.map((item, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentIndex
                    ? "opacity-100"
                    : "pointer-events-none opacity-0"
                }`}
              >
                {item.type === "video" ? (
                  <video
                    controls
                    muted
                    preload="metadata"
                    playsInline
                    poster={item.poster}
                    className="slideshow-video size-full object-contain"
                    onPlay={handleVideoPlay}
                    onPause={handleVideoPause}
                    onEnded={handleVideoEnded}
                  >
                    <source src={currentMediaSrc} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={currentMediaSrc}
                    alt={item.alt}
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    decoding="async"
                    className="size-full object-contain"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: Screen mockup with nav arrows */}
      <div
        className="group/slideshow relative hidden items-center md:flex"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Left arrow */}
        <button
          type="button"
          onClick={() => {
            prevSlide();
            resetAutoAdvance();
          }}
          className={`hover:bg-strawhat-yellow absolute z-30 flex size-12 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 opacity-0 shadow-md transition-all duration-200 group-hover/slideshow:opacity-100 hover:scale-110 hover:border-transparent hover:text-white hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 ${
            currentDevice === "mobile"
              ? "left-24 sm:left-32 md:left-40 lg:left-48 xl:left-56"
              : "-left-6"
          }`}
          aria-label="Previous slide"
        >
          <svg
            className="size-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Device Frame - Desktop */}
        {currentDevice === "desktop" && (
          <div className="w-full">
            {/* Lid / Screen assembly */}
            <div className="relative rounded-t-2xl bg-linear-to-b from-zinc-700 to-zinc-800 p-[3px] shadow-xl sm:rounded-t-3xl sm:p-1 dark:from-zinc-800 dark:to-zinc-900">
              {/* Inner bezel */}
              <div className="rounded-t-[13px] bg-zinc-900 p-2 sm:rounded-t-[20px] sm:p-2.5 md:p-3">
                {/* Camera notch */}
                <div className="mx-auto mb-1.5 flex items-center justify-center gap-1 sm:mb-2">
                  <div className="size-1.5 rounded-full bg-zinc-800 ring-1 ring-zinc-700 sm:size-2" />
                </div>
                {/* Screen */}
                <div className="relative aspect-video w-full overflow-hidden rounded bg-black sm:rounded-md">
                  {media.map((item, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-500 ${
                        index === currentIndex
                          ? "opacity-100"
                          : "pointer-events-none opacity-0"
                      }`}
                    >
                      {item.type === "video" ? (
                        <video
                          controls
                          muted
                          preload="metadata"
                          playsInline
                          poster={item.poster}
                          className="slideshow-video size-full object-contain"
                          onPlay={handleVideoPlay}
                          onPause={handleVideoPause}
                          onEnded={handleVideoEnded}
                        >
                          <source src={item.src} type="video/mp4" />
                        </video>
                      ) : (
                        <img
                          src={item.src}
                          alt={item.alt}
                          className="size-full object-contain"
                        />
                      )}
                    </div>
                  ))}
                  {/* Screen reflection */}
                  <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/[0.07] via-transparent to-transparent" />
                </div>
              </div>
            </div>

            {/* Base / Keyboard deck */}
            <div className="relative">
              {/* Hinge */}
              <div className="h-1.5 bg-linear-to-b from-zinc-500 to-zinc-400 sm:h-2 dark:from-zinc-700 dark:to-zinc-600" />
              {/* Notch indent */}
              <div className="absolute top-0 left-1/2 h-1.5 w-14 -translate-x-1/2 rounded-b bg-zinc-400 sm:h-2 sm:w-20 dark:bg-zinc-600" />
              {/* Keyboard base */}
              <div className="h-3 rounded-b-lg border-x border-b border-zinc-300 bg-linear-to-b from-zinc-200 to-zinc-100 shadow-sm sm:h-4 sm:rounded-b-xl md:h-5 dark:border-zinc-800 dark:from-zinc-700 dark:to-zinc-800" />
            </div>

            {/* Shadow */}
            <div className="mx-auto mt-2 h-4 w-4/5 rounded-full bg-black/15 blur-xl sm:mt-3 dark:bg-black/30" />
          </div>
        )}

        {/* Device Frame - Mobile */}
        {currentDevice === "mobile" && (
          <div className="w-full">
            <div className="mx-auto flex w-56 items-center justify-center sm:w-64 md:w-72 lg:w-80">
              {/* iPhone frame container */}
              <div className="relative w-full">
                {/* Side buttons */}
                {/* Left side - Volume buttons and mute switch */}
                <div className="absolute top-20 -left-1 z-10 space-y-2">
                  <div className="h-5 w-0.5 rounded-r-sm bg-zinc-700 dark:bg-zinc-800" />
                  <div className="h-8 w-0.5 rounded-r-sm bg-zinc-700 dark:bg-zinc-800" />
                  <div className="h-8 w-0.5 rounded-r-sm bg-zinc-700 dark:bg-zinc-800" />
                </div>
                {/* Right side - Power button */}
                <div className="absolute top-28 -right-0.5 z-10">
                  <div className="h-14 w-0.5 rounded-l-sm bg-zinc-700 dark:bg-zinc-800" />
                </div>

                {/* Outer frame / Bezel */}
                <div className="relative rounded-[3rem] bg-gradient-to-br from-zinc-800 via-zinc-900 to-black p-3 shadow-2xl ring-1 ring-white/10 dark:from-zinc-900 dark:via-black dark:to-zinc-950">
                  {/* Screen container */}
                  <div className="relative overflow-hidden rounded-[2.5rem] bg-black">
                    {/* Screen content */}
                    <div className="relative aspect-[9/19.5] w-full">
                      {media.map((item, index) => {
                        const imageSrc = item.srcMobile || item.src;
                        return (
                          <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-500 ${
                              index === currentIndex
                                ? "opacity-100"
                                : "pointer-events-none opacity-0"
                            }`}
                          >
                            {item.type === "video" ? (
                              <video
                                controls
                                muted
                                preload="metadata"
                                playsInline
                                poster={item.poster}
                                className="slideshow-video size-full object-cover"
                                onPlay={handleVideoPlay}
                                onPause={handleVideoPause}
                                onEnded={handleVideoEnded}
                              >
                                <source src={imageSrc} type="video/mp4" />
                              </video>
                            ) : (
                              <img
                                src={imageSrc}
                                alt={item.alt}
                                className="size-full object-cover"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Screen reflection/glare */}
                    <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/[0.05] via-transparent to-transparent" />
                  </div>
                </div>

                {/* Device shadow */}
                <div className="absolute -inset-6 -z-10 rounded-full bg-black/30 blur-3xl" />
              </div>
            </div>
          </div>
        )}

        {/* Right arrow */}
        <button
          type="button"
          onClick={() => {
            nextSlide();
            resetAutoAdvance();
          }}
          className={`hover:bg-strawhat-yellow absolute z-30 flex size-12 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 opacity-0 shadow-md transition-all duration-200 group-hover/slideshow:opacity-100 hover:scale-110 hover:border-transparent hover:text-white hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 ${
            currentDevice === "mobile"
              ? "right-24 sm:right-32 md:right-40 lg:right-48 xl:right-56"
              : "-right-6"
          }`}
          aria-label="Next slide"
        >
          <svg
            className="size-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Caption + dots */}
      <div className="mt-5 flex flex-col gap-4 sm:mt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-h-12 flex-1 sm:min-h-14">
          {media.map((item, index) => (
            <p
              key={index}
              className={`text-strawhat-text-light text-sm/relaxed font-light md:text-base/relaxed ${
                index === currentIndex ? "block" : "hidden"
              }`}
            >
              {item.caption || item.alt}
            </p>
          ))}
        </div>

        {/* Dots */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {media.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                showSlide(index);
                resetAutoAdvance();
              }}
              className={`flex items-center justify-center rounded-full transition-all ${
                item.type === "video" ? "size-6 sm:size-5" : "size-4 sm:size-3"
              } ${
                index === currentIndex
                  ? "active bg-strawhat-yellow text-white"
                  : "bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-600 dark:hover:bg-zinc-500"
              } ${
                item.type === "image" && index === currentIndex
                  ? "sm:h-3 sm:w-8"
                  : ""
              }`}
              aria-label={`Go to slide ${index + 1}`}
            >
              {item.type === "video" && (
                <svg
                  className="size-3 sm:size-3"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
