import { useEffect, useState, useRef, useCallback, useMemo, memo } from "react";
import { gsap } from "gsap";

// Check if running in browser
const isBrowser = typeof window !== "undefined";
const getIsMobile = () => isBrowser && window.innerWidth < 768;

// Cache for home page check to avoid repeated pathname reads
let cachedIsHomePage: boolean | null = null;
const getIsHomePage = () => {
  if (cachedIsHomePage === null || !isBrowser) {
    cachedIsHomePage = isBrowser ? window.location.pathname === "/" : false;
  }
  return cachedIsHomePage;
};

// Reset cache on navigation (for SPA)
if (isBrowser) {
  window.addEventListener("popstate", () => {
    cachedIsHomePage = null;
  });
}

function NavbarLogoComponent() {
  const [hatDeparted, setHatDeparted] = useState(false);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const logoPlaceholderRef = useRef<HTMLDivElement>(null);
  const gapRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastScrollYRef = useRef(isBrowser ? window.scrollY : 0);

  // Use ref for mobile state to avoid re-renders on resize
  const isMobileRef = useRef(getIsMobile());
  // Track previous departed state to avoid unnecessary animations
  const prevHatDepartedRef = useRef(false);
  // Cache GSAP timeline for reuse
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Memoized scroll handler
  const handleScroll = useCallback(() => {
    // On non-home pages, keep hat visible (don't depart)
    if (!getIsHomePage()) {
      if (prevHatDepartedRef.current !== false) {
        setHatDeparted(false);
        prevHatDepartedRef.current = false;
      }
      return;
    }

    // Cancel any pending RAF
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    // Throttle with requestAnimationFrame for smooth, performant updates
    rafIdRef.current = requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const isScrollingUp = scrollY < lastScrollYRef.current;
      lastScrollYRef.current = scrollY;

      // Hat departs when scroll > 50px
      // But text starts making room earlier when scrolling UP (at 100px)
      const returnThreshold = isScrollingUp ? 100 : 50;
      const shouldDepart = scrollY > returnThreshold;

      // Only update state if value changed
      if (shouldDepart !== prevHatDepartedRef.current) {
        prevHatDepartedRef.current = shouldDepart;
        setHatDeparted(shouldDepart);
      }
    });
  }, []);

  useEffect(() => {
    // Debounced resize handler
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const resizeHandler = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        isMobileRef.current = getIsMobile();
      }, 100);
    };

    window.addEventListener("resize", resizeHandler, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial check
    handleScroll();

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      clearTimeout(resizeTimeout);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", resizeHandler);
      // Kill any active timeline
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [handleScroll]);

  // Animate the text sliding left when hat departs
  // Optimized: Use timeline for batched animations
  useEffect(() => {
    if (
      !textContainerRef.current ||
      !logoPlaceholderRef.current ||
      !gapRef.current
    )
      return;

    const isMobile = isMobileRef.current;
    const hatWidth = isMobile ? 26 : 28;
    const gapWidth = isMobile ? 36 : 44;

    // Kill previous timeline to prevent conflicts
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    // Create new timeline for batched, synchronized animations
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    timelineRef.current = tl;

    if (hatDeparted) {
      // Hat has left - collapse both hat and gap
      const textOffset = isMobile ? 12 : 21;

      tl.to(
        logoPlaceholderRef.current,
        { width: 0, opacity: 0, duration: 0.5 },
        0
      )
        .to(gapRef.current, { width: 0, duration: 0.5 }, 0)
        .to(textContainerRef.current, { x: textOffset, duration: 0.5 }, 0);
    } else {
      // Hat is back - restore
      tl.to(
        logoPlaceholderRef.current,
        { width: hatWidth, opacity: 0, duration: 0.35 },
        0
      )
        .to(gapRef.current, { width: gapWidth, duration: 0.35 }, 0)
        .to(textContainerRef.current, { x: 0, duration: 0.35 }, 0);
    }
  }, [hatDeparted]);

  // Memoize initial styles to prevent recalculation
  const initialIsMobile = useMemo(() => getIsMobile(), []);

  const logoPlaceholderStyle = useMemo(
    () => ({
      width: initialIsMobile ? 26 : 28,
      height: initialIsMobile ? 21 : 22,
      opacity: 0,
      willChange: "width" as const,
    }),
    [initialIsMobile]
  );

  const gapStyle = useMemo(
    () => ({
      width: initialIsMobile ? 36 : 44,
      willChange: "width" as const,
    }),
    [initialIsMobile]
  );

  return (
    <div
      className="flex h-full items-center"
      style={{ contain: "layout style paint" }}
    >
      {/* Placeholder for hat - takes up space but hat is rendered by HatAnimation */}
      <div
        ref={logoPlaceholderRef}
        data-hat-start
        className="shrink-0 overflow-hidden"
        style={logoPlaceholderStyle}
      />

      {/* Gap between hat and text */}
      <div ref={gapRef} className="shrink-0" style={gapStyle} />

      {/* Company name text */}
      <div
        ref={textContainerRef}
        className="flex shrink-0 flex-col items-start gap-0 md:flex-row md:items-baseline md:gap-2"
        style={{ willChange: "transform", contain: "layout style" }}
      >
        <span className="text-strawhat-text text-base leading-tight font-bold tracking-tight md:text-xl">
          STRAW HAT
        </span>
        <span className="text-strawhat-yellow text-xs leading-tight font-light tracking-[0.2em] md:text-sm">
          DIGITAL
        </span>
      </div>
    </div>
  );
}

// Memoize the entire component to prevent re-renders from parent
const NavbarLogo = memo(NavbarLogoComponent);
export default NavbarLogo;
