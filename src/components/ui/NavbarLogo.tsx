import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";

export default function NavbarLogo() {
  const [hatDeparted, setHatDeparted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const logoPlaceholderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const isScrollingUp = scrollY < lastScrollY;
      lastScrollY = scrollY;

      // Hat departs when scroll > 50px
      // But text starts making room earlier when scrolling UP (at 100px)
      // This gives the hat time to land smoothly
      const departThreshold = 50;
      const returnThreshold = isScrollingUp ? 100 : 50;

      const shouldDepart = scrollY > returnThreshold;
      setHatDeparted(shouldDepart);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Animate the text sliding left when hat departs
  useEffect(() => {
    if (!textContainerRef.current || !logoPlaceholderRef.current) return;

    const hatWidth = isMobile ? 32 : 35;

    if (hatDeparted) {
      // Hat has left - collapse the placeholder and slide text left
      gsap.to(logoPlaceholderRef.current, {
        width: 0,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
      });

      gsap.to(textContainerRef.current, {
        x: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    } else {
      // Hat is back - restore placeholder space (starts earlier so no need to rush)
      gsap.to(logoPlaceholderRef.current, {
        width: hatWidth, // Responsive hat width
        opacity: 0, // Keep invisible (hat image is rendered separately)
        duration: 0.35,
        ease: "power2.out",
      });

      gsap.to(textContainerRef.current, {
        x: 0,
        duration: 0.35,
        ease: "power2.out",
      });
    }
  }, [hatDeparted, isMobile]);

  return (
    <div className="flex h-full items-center">
      {/* Placeholder for hat - takes up space but hat is rendered by HatAnimation */}
      <div
        ref={logoPlaceholderRef}
        data-hat-start
        className="shrink-0 overflow-hidden"
        style={{
          width: isMobile ? 32 : 35,
          height: isMobile ? 26 : 28,
          opacity: 0, // Always invisible - hat is rendered separately
        }}
      />

      {/* Gap between hat and text */}
      <div
        className="shrink-0"
        style={{
          width: hatDeparted ? 0 : isMobile ? 44 : 56,
          transition: hatDeparted
            ? "width 0.5s ease-out"
            : "width 0.35s ease-out",
        }}
      />

      {/* Company name text */}
      <div
        ref={textContainerRef}
        className="flex shrink-0 flex-col items-start gap-0 md:flex-row md:items-baseline md:gap-2"
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
