import { useEffect, useState, useRef } from "react";

const HINT_SEEN_KEY = "strawhat-dark-mode-hint-seen";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    setMounted(true);

    // Initialize theme
    const theme = localStorage.getItem("theme");
    const initialTheme = theme || "light";

    const isDarkMode = initialTheme === "dark";
    setIsDark(isDarkMode);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const hintSeen = localStorage.getItem(HINT_SEEN_KEY) === "true";

    const handleScroll = () => {
      if (hasScrolledRef.current) return;
      hasScrolledRef.current = true;

      scrollTimeoutRef.current = setTimeout(() => {
        const theme =
          document.documentElement.getAttribute("data-theme") || "light";
        if (theme === "light" && !hintSeen) {
          setShowHint(true);
        }
        scrollTimeoutRef.current = null;
      }, 3000);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [mounted]);

  const dismissHint = () => {
    setShowHint(false);
    localStorage.setItem(HINT_SEEN_KEY, "true");
  };

  const toggleTheme = () => {
    const newIsDark = !isDark;
    const newTheme = newIsDark ? "dark" : "light";

    setIsDark(newIsDark);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);

    if (showHint) dismissHint();
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="relative">
        <button
          type="button"
          className="ml-6 flex h-8 w-8 items-center justify-center rounded-md transition-colors"
          style={{
            color: "var(--strawhat-text-light)",
          }}
          aria-label="Toggle theme"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleTheme}
        className="ml-6 flex h-8 w-8 items-center justify-center rounded-md transition-colors"
        style={{
          color: "var(--strawhat-text-light)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--strawhat-yellow)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--strawhat-text-light)";
        }}
        aria-label="Toggle theme"
      >
        {isDark ? (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        ) : (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        )}
      </button>

      {showHint && (
        <div
          role="status"
          className="border-strawhat-text/10 bg-strawhat-bg absolute left-1/2 z-50 mt-2 w-52 -translate-x-1/2 rounded-lg border px-3 py-2 pr-6 shadow-lg backdrop-blur-sm transition-opacity duration-300"
        >
          <p className="text-strawhat-text-light text-xs leading-snug">
            Getting blinded by the bright light?{" "}
            <button
              type="button"
              onClick={toggleTheme}
              className="text-strawhat-yellow hover:text-strawhat-amber font-medium underline underline-offset-2 transition-colors"
            >
              Turn on dark mode
            </button>
          </p>
          <button
            type="button"
            onClick={dismissHint}
            className="text-strawhat-text/60 hover:text-strawhat-text absolute top-1.5 right-1.5 text-[10px] transition-colors"
            aria-label="Dismiss hint"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
