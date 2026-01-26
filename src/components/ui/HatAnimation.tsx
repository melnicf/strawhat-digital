import { useEffect, useRef, useCallback, memo, useMemo, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugin once at module level
gsap.registerPlugin(ScrollTrigger);

interface Waypoint {
  id: string;
  x: number;
  docY: number;
  isFixed: boolean;
  progress: number;
}

// Pre-calculate static values for stars/sparkles to avoid runtime calculations
const STAR_ANGLES = Array.from(
  { length: 8 },
  (_, i) => i * 45 * (Math.PI / 180)
);
const SPARKLE_ANGLES = Array.from(
  { length: 12 },
  (_, i) => (i * 30 + 15) * (Math.PI / 180)
);
// Pre-calculate random values to avoid recalculating on each render
const STAR_DISTANCES = Array.from({ length: 8 }, () => 40 + Math.random() * 30);
const STAR_SCALES = Array.from({ length: 8 }, () => 1 + Math.random() * 0.5);
const STAR_ROTATIONS = Array.from({ length: 8 }, () => Math.random() * 180);
const SPARKLE_DISTANCES = Array.from(
  { length: 12 },
  () => 25 + Math.random() * 35
);
const SPARKLE_SIZES = Array.from({ length: 12 }, () => 4 + Math.random() * 4);

// Memoized Impact stars effect - appears when scrolling fast
const ImpactStars = memo(function ImpactStars({
  active,
  x,
  y,
}: {
  active: boolean;
  x: number;
  y: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationsRef = useRef<gsap.core.Tween[]>([]);

  useEffect(() => {
    if (!containerRef.current || !active) return;

    // Kill previous animations to prevent memory leaks
    animationsRef.current.forEach((anim) => anim.kill());
    animationsRef.current = [];

    const stars = containerRef.current.querySelectorAll(".impact-star");
    const sparkles = containerRef.current.querySelectorAll(".sparkle");

    // Animate stars bursting outward - use pre-calculated values
    stars.forEach((star, i) => {
      const el = star as HTMLElement;
      const angle = STAR_ANGLES[i];
      const distance = STAR_DISTANCES[i];

      const anim1 = gsap.fromTo(
        el,
        { opacity: 0, scale: 0, x: 0, y: 0, rotation: 0 },
        {
          opacity: 1,
          scale: STAR_SCALES[i],
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          rotation: STAR_ROTATIONS[i],
          duration: 0.2,
          ease: "power2.out",
        }
      );

      const anim2 = gsap.to(el, {
        opacity: 0,
        scale: 0.3,
        x: Math.cos(angle) * distance * 2,
        y: Math.sin(angle) * distance * 2,
        duration: 0.3,
        delay: 0.15,
        ease: "power1.in",
      });

      animationsRef.current.push(anim1, anim2);
    });

    // Animate small sparkles
    sparkles.forEach((sparkle, i) => {
      const el = sparkle as HTMLElement;
      const angle = SPARKLE_ANGLES[i];
      const distance = SPARKLE_DISTANCES[i];

      const anim1 = gsap.fromTo(
        el,
        { opacity: 0, scale: 0, x: 0, y: 0 },
        {
          opacity: 1,
          scale: 1,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          duration: 0.15,
          delay: i * 0.02,
          ease: "power2.out",
        }
      );

      const anim2 = gsap.to(el, {
        opacity: 0,
        scale: 0,
        duration: 0.25,
        delay: 0.1 + i * 0.02,
        ease: "power1.in",
      });

      animationsRef.current.push(anim1, anim2);
    });

    return () => {
      animationsRef.current.forEach((anim) => anim.kill());
      animationsRef.current = [];
    };
  }, [active]);

  // Memoize star and sparkle elements to prevent recreation
  const starElements = useMemo(
    () =>
      STAR_ANGLES.map((_, i) => (
        <div
          key={`star-${i}`}
          className="impact-star absolute"
          style={{
            width: 12,
            height: 12,
            marginLeft: -6,
            marginTop: -6,
            opacity: 0,
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(45deg, transparent 40%, #fbbf24 40%, #fbbf24 60%, transparent 60%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(-45deg, transparent 40%, #fbbf24 40%, #fbbf24 60%, transparent 60%)",
            }}
          />
        </div>
      )),
    []
  );

  const sparkleElements = useMemo(
    () =>
      SPARKLE_SIZES.map((size, i) => (
        <div
          key={`sparkle-${i}`}
          className="sparkle absolute rounded-full"
          style={{
            width: size,
            height: size,
            marginLeft: -3,
            marginTop: -3,
            opacity: 0,
            background:
              "radial-gradient(circle, #fff 0%, #fbbf24 50%, transparent 100%)",
            boxShadow: "0 0 4px #fbbf24",
          }}
        />
      )),
    []
  );

  if (!active) return null;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed z-40"
      style={{ left: x, top: y, contain: "layout style paint" }}
    >
      {starElements}
      {sparkleElements}
    </div>
  );
});

// Check if running in browser
const isBrowser = typeof window !== "undefined";

// Detect mobile once at module level for SSR safety
const getIsMobile = () => isBrowser && window.innerWidth < 768;

export default function HatAnimation() {
  const hatRef = useRef<HTMLImageElement>(null);
  const animationRef = useRef<ScrollTrigger | null>(null);
  const navbarPlaceholderRef = useRef<HTMLElement | null>(null);
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const hatPositionRef = useRef({ x: 0, y: 0 });
  const lastImpactTime = useRef(0);
  const navbarUpdateHandlerRef = useRef<(() => void) | null>(null);

  // Use refs for animation state to avoid re-renders during scroll
  const isMobileRef = useRef(getIsMobile());
  const impactEffectRef = useRef({ active: false, x: 0, y: 0 });

  // Single state to trigger impact star renders - minimizes re-renders
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_impactTrigger, setImpactTrigger] = useState(0);

  // Track scroll velocity and trigger impact stars - optimized
  const checkScrollVelocity = useCallback(() => {
    // Skip on mobile for performance
    if (isMobileRef.current) return;

    const now = Date.now();
    const currentScrollY = window.scrollY;
    const deltaTime = now - lastScrollTime.current;
    const deltaScroll = Math.abs(currentScrollY - lastScrollY.current);

    // Calculate velocity (pixels per millisecond)
    const velocity = deltaTime > 0 ? deltaScroll / deltaTime : 0;

    // Trigger impact stars if scrolling fast enough and enough time has passed
    const velocityThreshold = 2; // pixels per ms
    const cooldown = 400; // ms between impacts

    if (
      velocity > velocityThreshold &&
      now - lastImpactTime.current > cooldown
    ) {
      // Update ref first, then trigger single state update
      impactEffectRef.current = {
        active: true,
        x: hatPositionRef.current.x + 56,
        y: hatPositionRef.current.y + 20,
      };

      setImpactTrigger((prev) => prev + 1);

      setTimeout(() => {
        impactEffectRef.current.active = false;
        setImpactTrigger((prev) => prev + 1);
      }, 500);

      lastImpactTime.current = now;
    }

    lastScrollY.current = currentScrollY;
    lastScrollTime.current = now;
  }, []);

  useEffect(() => {
    const hat = hatRef.current;
    if (!hat) return;

    // Detect mobile with debounced resize
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const checkMobile = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        isMobileRef.current = window.innerWidth < 768;
      }, 100);
    };

    isMobileRef.current = getIsMobile();
    window.addEventListener("resize", checkMobile, { passive: true });

    const initAnimation = () => {
      const navbar = document.querySelector("nav");
      const navbarPlaceholder = navbar?.querySelector(
        "[data-hat-start]"
      ) as HTMLElement | null;

      if (!navbarPlaceholder) {
        setTimeout(initAnimation, 100);
        return;
      }

      navbarPlaceholderRef.current = navbarPlaceholder;

      const landingElements = document.querySelectorAll("[data-hat-landing]");
      const isHomePage = window.location.pathname === "/";

      // On non-home pages, just position hat in navbar and keep it there
      if (landingElements.length === 0 || !isHomePage) {
        const navRect = navbarPlaceholder.getBoundingClientRect();
        gsap.set(hat, {
          x: navRect.left,
          y: navRect.top,
          rotation: 0,
          scale: 1.0,
          opacity: 1,
        });
        hatPositionRef.current = { x: navRect.left, y: navRect.top };

        // Update position on scroll/resize to keep it in navbar
        const updateNavbarPosition = () => {
          if (navbarPlaceholderRef.current) {
            const rect = navbarPlaceholderRef.current.getBoundingClientRect();
            gsap.set(hat, {
              x: rect.left,
              y: rect.top,
            });
            hatPositionRef.current = { x: rect.left, y: rect.top };
          }
        };

        navbarUpdateHandlerRef.current = updateNavbarPosition;
        window.addEventListener("scroll", updateNavbarPosition, {
          passive: true,
        });
        window.addEventListener("resize", updateNavbarPosition, {
          passive: true,
        });

        return;
      }

      const totalScrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollY = window.scrollY;

      const waypoints: Waypoint[] = [];

      const navRect = navbarPlaceholder.getBoundingClientRect();
      waypoints.push({
        id: "navbar",
        x: navRect.left,
        docY: navRect.top,
        isFixed: true,
        progress: 0,
      });

      const isMobile = isMobileRef.current;

      landingElements.forEach((el) => {
        const sectionId = el.getAttribute("data-hat-landing");

        if (sectionId === "hero") return;

        const section = document.getElementById(sectionId || "");
        if (section) {
          const elRect = el.getBoundingClientRect();
          const sectionTop = section.offsetTop;

          // Hat arrives when section is scrolled to top (matching navbar scroll behavior)
          // Account for navbar height (4rem = 64px) and scroll-margin-top
          const navbarHeight = 64;
          const arrivalScroll = sectionTop - navbarHeight;
          const arrivalProgress = Math.max(
            0.05,
            arrivalScroll / totalScrollHeight
          );

          // Adjust offset based on mobile/desktop hat size (smaller hat)
          const hatWidthOffset = isMobile ? 26 : 28;

          waypoints.push({
            id: sectionId || "",
            x: elRect.left + elRect.width / 2 - hatWidthOffset,
            docY:
              sectionTop +
              (elRect.top - section.getBoundingClientRect().top) +
              elRect.height / 2 -
              (isMobile ? 13 : 14),
            isFixed: false,
            progress: Math.min(0.95, arrivalProgress),
          });
        }
      });

      waypoints.sort((a, b) => a.progress - b.progress);

      // Initial scale should match the anchored scale (1.0)
      gsap.set(hat, {
        x: waypoints[0].x,
        y: waypoints[0].docY,
        rotation: 0,
        scale: 1.0,
        opacity: 1,
      });

      hatPositionRef.current = { x: waypoints[0].x, y: waypoints[0].docY };

      if (animationRef.current) {
        animationRef.current.kill();
      }

      const getViewportY = (
        waypoint: Waypoint,
        currentScrollY: number
      ): number => {
        if (waypoint.isFixed) {
          if (waypoint.id === "navbar" && navbarPlaceholderRef.current) {
            return navbarPlaceholderRef.current.getBoundingClientRect().top;
          }
          return waypoint.docY;
        }
        return waypoint.docY - currentScrollY;
      };

      animationRef.current = ScrollTrigger.create({
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        // Scrub acts as a scroll buffer - higher values = smoother/more delayed
        // Mobile: 1.0s smoothing for butter-smooth scrolling, Desktop: 1.2s for dramatic effect
        scrub: isMobile ? 1.0 : 1.2,
        onUpdate: (self) => {
          const currentScrollY = window.scrollY;
          const progress = self.progress;
          const viewportHeight = window.innerHeight;
          const currentIsMobile = isMobileRef.current;

          // Check scroll velocity for impact effect (only on desktop)
          if (!currentIsMobile) {
            checkScrollVelocity();
          }

          let fromWaypoint = waypoints[0];
          let toWaypoint = waypoints[1] || waypoints[0];
          let segmentProgress = 0;

          for (let i = 0; i < waypoints.length - 1; i++) {
            if (
              progress >= waypoints[i].progress &&
              progress <= waypoints[i + 1].progress
            ) {
              fromWaypoint = waypoints[i];
              toWaypoint = waypoints[i + 1];
              const segmentLength = toWaypoint.progress - fromWaypoint.progress;
              segmentProgress =
                segmentLength > 0
                  ? (progress - fromWaypoint.progress) / segmentLength
                  : 0;
              break;
            } else if (progress > waypoints[i + 1].progress) {
              fromWaypoint = waypoints[i + 1];
              toWaypoint = waypoints[i + 2] || waypoints[i + 1];
            }
          }

          if (progress >= waypoints[waypoints.length - 1].progress) {
            const last = waypoints[waypoints.length - 1];
            const lastY = getViewportY(last, currentScrollY);
            gsap.set(hat, {
              x: last.x,
              y: lastY,
              rotation: 0,
              scale: 1.0,
              opacity: 1,
            });
            hatPositionRef.current = { x: last.x, y: lastY };
            return;
          }

          const fromX = fromWaypoint.x;
          const fromViewY = getViewportY(fromWaypoint, currentScrollY);
          const toX = toWaypoint.x;
          const toViewY = getViewportY(toWaypoint, currentScrollY);

          const isFirstSegment = fromWaypoint.id === "navbar";

          const minY = 20;
          const maxY = viewportHeight - 80;

          const clampedFromY = isFirstSegment
            ? fromViewY
            : Math.min(maxY, Math.max(minY, fromViewY));
          const clampedToY = Math.min(maxY, Math.max(minY, toViewY));

          const dx = toX - fromX;
          const dy = clampedToY - clampedFromY;
          const segmentIndex = waypoints.indexOf(fromWaypoint);
          const swingDir = segmentIndex % 2 === 0 ? 1 : -1;

          const t = segmentProgress;
          const easedT = t * t * (3 - 2 * t);

          let x: number;
          let y: number;

          if (isFirstSegment) {
            // FROM NAVBAR: Simple curved descent, no loop
            const swingAmp = Math.min(Math.abs(dx) * 0.4, 150);
            const swingOffset =
              Math.sin(easedT * Math.PI) * swingAmp * swingDir;

            x = fromX + dx * easedT + swingOffset;
            y = clampedFromY + dy * easedT;
          } else {
            // SECTION TO SECTION: Simplified on mobile, full loop on desktop
            const loopRadius = currentIsMobile ? 40 : 140; // Much smaller loop on mobile

            // Base path: smooth travel from A to B
            const baseX = fromX + dx * easedT;
            const baseY = clampedFromY + dy * easedT;

            if (currentIsMobile) {
              // Mobile: Simple straight line with minimal arc
              const arcHeight = Math.sin(easedT * Math.PI) * 20; // Small gentle arc
              x = baseX;
              y = baseY - arcHeight; // Slight upward arc
            } else {
              // Desktop: Full loop animation
              // Loop is centered at 50% of the journey
              // Use a bell curve to fade the loop in and out
              const loopCenter = 0.5;
              const loopWidth = 0.35; // How wide the loop effect extends

              // Bell curve: peaks at loopCenter, fades to 0 at edges
              const distFromCenter = Math.abs(t - loopCenter);
              const loopStrength = Math.max(0, 1 - distFromCenter / loopWidth);
              const smoothStrength =
                loopStrength * loopStrength * (3 - 2 * loopStrength);

              // The loop angle goes from 0 to 2*PI as t goes from (center-width) to (center+width)
              const loopStartT = loopCenter - loopWidth;
              const loopEndT = loopCenter + loopWidth;
              let loopAngle = 0;

              if (t >= loopStartT && t <= loopEndT) {
                const loopProgress = (t - loopStartT) / (loopEndT - loopStartT);
                loopAngle = loopProgress * Math.PI * 2;
              } else if (t > loopEndT) {
                loopAngle = Math.PI * 2;
              }

              // Loop offset - starts and ends at 0 due to smoothStrength fade
              // sin for horizontal swing, -cos+1 for vertical (goes UP then DOWN)
              const loopOffsetX =
                Math.sin(loopAngle) * loopRadius * swingDir * smoothStrength;
              const loopOffsetY =
                -(1 - Math.cos(loopAngle)) * loopRadius * smoothStrength;

              x = baseX + loopOffsetX;
              y = baseY + loopOffsetY;
            }
          }

          // Subtle wind movement - reduced on mobile for performance
          const turbulenceStrength = currentIsMobile ? 0 : 0.5;
          const turbulencePhase = segmentProgress * Math.PI * 2;
          const endpointFade = Math.sin(segmentProgress * Math.PI);

          // Gentle floating motion
          const swirl1 = Math.sin(turbulencePhase) * 8;
          const swirl2 = Math.cos(turbulencePhase * 1.3) * 6;

          const turbX = (swirl1 + swirl2) * turbulenceStrength * endpointFade;
          const turbY =
            (swirl2 + Math.sin(turbulencePhase * 0.8) * 4) *
            turbulenceStrength *
            endpointFade;

          // Rotation - full rotation on mobile, dramatic spin on desktop
          const rotationStrength = currentIsMobile ? 1 : endpointFade; // Full rotation strength on mobile
          const baseRotation = currentIsMobile
            ? swingDir * 360 * easedT // Full 360° rotation on mobile
            : swingDir * 360 * easedT; // Full 360° spin on desktop
          const wobble = currentIsMobile
            ? 0
            : Math.sin(turbulencePhase * 0.7) * 8;
          const rotation =
            baseRotation * rotationStrength +
            wobble * turbulenceStrength * endpointFade;

          // Depth effect - minimal on mobile
          const flightIntensity = currentIsMobile
            ? 0
            : Math.sin(segmentProgress * Math.PI); // No depth change on mobile
          const depthWave = currentIsMobile
            ? 0
            : Math.sin(segmentProgress * Math.PI * 3);

          const anchoredScale = 1.0;
          const flightScale = currentIsMobile ? 1.0 : 1.05 + depthWave * 0.65; // Keep constant scale on mobile

          const scale =
            anchoredScale + (flightScale - anchoredScale) * flightIntensity;

          const finalX = x + turbX;
          const finalY =
            isFirstSegment && segmentProgress < 0.1
              ? y + turbY
              : Math.min(maxY, Math.max(minY, y + turbY));

          // Store current position for impact effect
          hatPositionRef.current = { x: finalX, y: finalY };

          gsap.set(hat, {
            x: finalX,
            y: finalY,
            rotation: rotation,
            scale: Math.max(0.5, Math.min(2.2, scale)),
            opacity: 1,
            force3D: true, // GPU-accelerated transforms for butter-smooth animation
          });
        },
      });

      // Debounced resize handler to prevent excessive reinitializations
      let resizeDebounce: ReturnType<typeof setTimeout>;
      const handleResize = () => {
        clearTimeout(resizeDebounce);
        resizeDebounce = setTimeout(() => {
          if (animationRef.current) animationRef.current.kill();
          isMobileRef.current = getIsMobile();
          initAnimation();
        }, 150);
      };

      window.addEventListener("resize", handleResize, { passive: true });
      return () => {
        clearTimeout(resizeDebounce);
        window.removeEventListener("resize", handleResize);
      };
    };

    const timeout = setTimeout(initAnimation, 200);

    return () => {
      clearTimeout(timeout);
      clearTimeout(resizeTimeout);
      if (animationRef.current) animationRef.current.kill();
      ScrollTrigger.getAll().forEach((st) => st.kill());
      window.removeEventListener("resize", checkMobile);
      if (navbarUpdateHandlerRef.current) {
        window.removeEventListener("scroll", navbarUpdateHandlerRef.current);
        window.removeEventListener("resize", navbarUpdateHandlerRef.current);
        navbarUpdateHandlerRef.current = null;
      }
    };
  }, [checkScrollVelocity]);

  // Memoize hat image styles to prevent recalculation
  const hatStyle = useMemo(
    () => ({
      width: isMobileRef.current ? "52px" : "56px",
      height: isMobileRef.current ? "21px" : "22px",
      willChange: "transform",
      transformOrigin: "center center",
      opacity: 0,
      marginLeft: "0",
      contain: "layout style paint" as const,
    }),
    []
  );

  return (
    <>
      {/* Impact stars only render on desktop when active */}
      {!isMobileRef.current && (
        <ImpactStars
          active={impactEffectRef.current.active}
          x={impactEffectRef.current.x}
          y={impactEffectRef.current.y}
        />
      )}

      <img
        ref={hatRef}
        src="/hat_logo.png"
        alt=""
        className="pointer-events-none fixed top-0 left-0 z-50 object-contain"
        style={hatStyle}
        loading="eager"
        decoding="async"
      />
    </>
  );
}
