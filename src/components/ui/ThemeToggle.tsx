import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Initialize theme
    const theme = localStorage.getItem("theme");
    const initialTheme = theme || "light";

    const isDarkMode = initialTheme === "dark";
    setIsDark(isDarkMode);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    const newTheme = newIsDark ? "dark" : "light";

    setIsDark(newIsDark);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
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
    );
  }

  return (
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
  );
}
