export type Locale = "en" | "it" | "ro";

export const SUPPORTED_LOCALES: readonly Locale[] = ["en", "it", "ro"];
export const DEFAULT_LOCALE: Locale = "en";

/**
 * Flatten nested object to dot-notation keys for easy lookup.
 */
function flattenKeys(
  obj: Record<string, unknown>,
  prefix = ""
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(
        result,
        flattenKeys(value as Record<string, unknown>, fullKey)
      );
    } else if (typeof value === "string") {
      result[fullKey] = value;
    }
  }
  return result;
}

import en from "../i18n/en.json";
import it from "../i18n/it.json";
import ro from "../i18n/ro.json";

const translationsByLocale: Record<Locale, Record<string, unknown>> = {
  en: en as Record<string, unknown>,
  it: it as Record<string, unknown>,
  ro: ro as Record<string, unknown>,
};

let flattenedCache: Partial<Record<Locale, Record<string, string>>> = {};

function loadTranslations(locale: Locale): Record<string, string> {
  if (flattenedCache[locale]) {
    return flattenedCache[locale]!;
  }
  const data =
    translationsByLocale[locale] ?? translationsByLocale[DEFAULT_LOCALE];
  const flat = flattenKeys(data || {});
  flattenedCache[locale] = flat;
  return flat;
}

/**
 * Get translation function for a locale.
 * Use dot-notation keys: t('nav.home') => "Home"
 */
export function getTranslations(locale: Locale): (key: string) => string {
  const dict = loadTranslations(locale);
  const fallback =
    locale !== DEFAULT_LOCALE ? loadTranslations(DEFAULT_LOCALE) : dict;
  return (key: string): string => {
    return dict[key] ?? fallback[key] ?? key;
  };
}

/**
 * Base path for the locale (empty for default locale, e.g. '/it' for Italian).
 * Use for building localized links: `${basePath(locale)}/privacy` => '/privacy' or '/it/privacy'
 */
export function basePath(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? "" : `/${locale}`;
}

/**
 * Get current locale from Astro (when using i18n routing).
 */
export function getLocaleFromUrl(pathname: string): Locale {
  const segment = pathname.split("/")[1];
  if (segment && SUPPORTED_LOCALES.includes(segment as Locale)) {
    return segment as Locale;
  }
  return DEFAULT_LOCALE;
}
