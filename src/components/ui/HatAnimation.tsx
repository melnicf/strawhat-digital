import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function cubicBezierPoint(
  t: number,
  p0: number,
  p1: number,
  p2: number,
  p3: number
): number {
  const u = 1 - t;
  return (
    u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3
  );
}

interface Waypoint {
  id: string;
  x: number;
  docY: number;
  isFixed: boolean;
  progress: number;
}

// Impact stars effect - appears when scrolling fast
function ImpactStars({
  active,
  x,
  y,
}: {
  active: boolean;
  x: number;
  y: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !active) return;

    const stars = containerRef.current.querySelectorAll(".impact-star");
    const sparkles = containerRef.current.querySelectorAll(".sparkle");

    // Animate stars bursting outward
    stars.forEach((star, i) => {
      const el = star as HTMLElement;
      const angle = i * 45 * (Math.PI / 180); // 8 directions
      const distance = 40 + Math.random() * 30;

      gsap.fromTo(
        el,
        {
          opacity: 0,
          scale: 0,
          x: 0,
          y: 0,
          rotation: 0,
        },
        {
          opacity: 1,
          scale: 1 + Math.random() * 0.5,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          rotation: Math.random() * 180,
          duration: 0.2,
          ease: "power2.out",
        }
      );

      gsap.to(el, {
        opacity: 0,
        scale: 0.3,
        x: Math.cos(angle) * distance * 2,
        y: Math.sin(angle) * distance * 2,
        duration: 0.3,
        delay: 0.15,
        ease: "power1.in",
      });
    });

    // Animate small sparkles
    sparkles.forEach((sparkle, i) => {
      const el = sparkle as HTMLElement;
      const angle = (i * 30 + 15) * (Math.PI / 180);
      const distance = 25 + Math.random() * 35;

      gsap.fromTo(
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

      gsap.to(el, {
        opacity: 0,
        scale: 0,
        duration: 0.25,
        delay: 0.1 + i * 0.02,
        ease: "power1.in",
      });
    });
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed z-40"
      style={{ left: x, top: y }}
    >
      {/* 4-pointed stars */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
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
          {/* Star shape using CSS */}
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
      ))}

      {/* Smaller sparkle dots */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
        <div
          key={`sparkle-${i}`}
          className="sparkle absolute rounded-full"
          style={{
            width: 4 + Math.random() * 4,
            height: 4 + Math.random() * 4,
            marginLeft: -3,
            marginTop: -3,
            opacity: 0,
            background:
              "radial-gradient(circle, #fff 0%, #fbbf24 50%, transparent 100%)",
            boxShadow: "0 0 4px #fbbf24",
          }}
        />
      ))}
    </div>
  );
}

export default function HatAnimation() {
  const hatRef = useRef<HTMLImageElement>(null);
  const animationRef = useRef<ScrollTrigger | null>(null);
  const navbarPlaceholderRef = useRef<HTMLElement | null>(null);
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const hatPositionRef = useRef({ x: 0, y: 0 });
  const lastImpactTime = useRef(0);
  const [isMobile, setIsMobile] = useState(false);

  const [impactEffect, setImpactEffect] = useState({
    active: false,
    x: 0,
    y: 0,
  });

  // Track scroll velocity and trigger impact stars
  const checkScrollVelocity = useCallback(() => {
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
      // Trigger impact at current hat position
      setImpactEffect({
        active: true,
        x: hatPositionRef.current.x + 56,
        y: hatPositionRef.current.y + 20,
      });

      setTimeout(
        () => setImpactEffect((prev) => ({ ...prev, active: false })),
        500
      );
      lastImpactTime.current = now;
    }

    lastScrollY.current = currentScrollY;
    lastScrollTime.current = now;
  }, []);

  useEffect(() => {
    const hat = hatRef.current;
    if (!hat) return;

    // Detect mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

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

      if (landingElements.length === 0) {
        setTimeout(initAnimation, 100);
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
          const hatWidthOffset = isMobile ? 32 : 35;

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

      // Initial scale should match the anchored scale (1.3)
      gsap.set(hat, {
        x: waypoints[0].x,
        y: waypoints[0].docY,
        rotation: 0,
        scale: 1.3,
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
        scrub: isMobile ? 0.5 : 1.2, // Faster, less smooth on mobile for better performance
        onUpdate: (self) => {
          const currentScrollY = window.scrollY;
          const progress = self.progress;
          const viewportHeight = window.innerHeight;

          // Check scroll velocity for impact effect (only on desktop)
          if (!isMobile) {
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
              scale: 1.3,
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
            const loopRadius = isMobile ? 40 : 140; // Much smaller loop on mobile

            // Base path: smooth travel from A to B
            const baseX = fromX + dx * easedT;
            const baseY = clampedFromY + dy * easedT;

            if (isMobile) {
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
          const turbulenceStrength = isMobile ? 0 : 0.5;
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
          const rotationStrength = isMobile ? 1 : endpointFade; // Full rotation strength on mobile
          const baseRotation = isMobile
            ? swingDir * 360 * easedT // Full 360° rotation on mobile
            : swingDir * 360 * easedT; // Full 360° spin on desktop
          const wobble = isMobile ? 0 : Math.sin(turbulencePhase * 0.7) * 8;
          const rotation =
            baseRotation * rotationStrength +
            wobble * turbulenceStrength * endpointFade;

          // Depth effect - minimal on mobile
          const flightIntensity = isMobile
            ? 0
            : Math.sin(segmentProgress * Math.PI); // No depth change on mobile
          const depthWave = isMobile
            ? 0
            : Math.sin(segmentProgress * Math.PI * 3);

          const anchoredScale = 1.3;
          const flightScale = isMobile ? 1.3 : 1.35 + depthWave * 0.85; // Keep constant scale on mobile

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
          });
        },
      });

      const handleResize = () => {
        if (animationRef.current) animationRef.current.kill();
        checkMobile();
        setTimeout(initAnimation, 100);
      };

      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("resize", checkMobile);
      };
    };

    const timeout = setTimeout(initAnimation, 200);

    return () => {
      clearTimeout(timeout);
      if (animationRef.current) animationRef.current.kill();
      ScrollTrigger.getAll().forEach((st) => st.kill());
      window.removeEventListener("resize", checkMobile);
    };
  }, [checkScrollVelocity, isMobile]);

  return (
    <>
      {!isMobile && (
        <ImpactStars
          active={impactEffect.active}
          x={impactEffect.x}
          y={impactEffect.y}
        />
      )}

      <img
        ref={hatRef}
        src="/hat_logo.png"
        alt=""
        className="pointer-events-none fixed top-0 left-0 z-50 object-contain"
        style={{
          width: isMobile ? "65px" : "70px",
          height: isMobile ? "26px" : "28px",
          willChange: "transform",
          transformOrigin: "center center",
          opacity: 0,
          marginLeft: "0",
        }}
      />
    </>
  );
}
