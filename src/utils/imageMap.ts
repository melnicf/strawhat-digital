// Image mapping utility to resolve public paths to imported images
// This allows us to use string paths in markdown frontmatter while still getting optimization

// Paneglass images
import paneglassHomeHero from "../assets/paneglass/screenshots/home-hero.png";
import paneglassImportModal from "../assets/paneglass/screenshots/import-modal.png";
import paneglassPluginImportButton from "../assets/paneglass/screenshots/plugin-import-button.png";
import paneglassOrganizeWithAi from "../assets/paneglass/screenshots/organize-with-ai-screen.png";
import paneglassUnifiedKnowledgeTree from "../assets/paneglass/screenshots/unified-knowledge-tree.png";
import paneglassExtensionPage from "../assets/paneglass/screenshots/extension-page.png";
import paneglassHomeFeatures from "../assets/paneglass/screenshots/home-features.png";
import paneglassHomeSolutions from "../assets/paneglass/screenshots/home-solutions.png";
import paneglassHomePricing from "../assets/paneglass/screenshots/home-pricing.png";

// Paneglass videos - kept in public/ since videos aren't optimized

// Yonduur desktop images
import yonduurDesktopHomeHero from "../assets/yonduur/desktop/home-hero.png";
import yonduurDesktopListings from "../assets/yonduur/desktop/listings.png";
import yonduurDesktopListingsMapDraw from "../assets/yonduur/desktop/listings-map-draw.png";
import yonduurDesktopListingDetails from "../assets/yonduur/desktop/listing-details.png";
import yonduurDesktopListingDetailsPois from "../assets/yonduur/desktop/listing-details-pois.png";
import yonduurDesktopListingDetailsOwn from "../assets/yonduur/desktop/listing-details-own.png";
import yonduurDesktopHomeAiChat from "../assets/yonduur/desktop/home-ai-chat.png";
import yonduurDesktopAccountListings from "../assets/yonduur/desktop/account-listings.png";
import yonduurDesktopAccountFavorites from "../assets/yonduur/desktop/account-favorites.png";
import yonduurDesktopAccountSavedSearches from "../assets/yonduur/desktop/account-saved-searches.png";

// Yonduur iPhone images
import yonduurIphoneHomeHero from "../assets/yonduur/iphone/home-hero-iphone.png";
import yonduurIphoneListings from "../assets/yonduur/iphone/listings-iphone.png";
import yonduurIphoneListingsMapDraw from "../assets/yonduur/iphone/listings-map-draw-iphone.png";
import yonduurIphoneListingDetails from "../assets/yonduur/iphone/listing-details-iphone.png";
import yonduurIphoneListingDetailsPois from "../assets/yonduur/iphone/listing-details-pois-iphone.png";
import yonduurIphoneListingDetailsOwn from "../assets/yonduur/iphone/listing-details-own-iphone.png";
import yonduurIphoneHomeAiChat from "../assets/yonduur/iphone/home-ai-chat-iphone.png";
import yonduurIphoneAccountListings from "../assets/yonduur/iphone/account-listings-iphone.png";
import yonduurIphoneAccountFavorites from "../assets/yonduur/iphone/account-favorites-iphone.png";
import yonduurIphoneAccountSavedSearches from "../assets/yonduur/iphone/account-saved-searches-iphone.png";

// INVNT desktop images
import invntDesktopHome from "../assets/invnt/desktop/home.png";
import invntDesktopLogin from "../assets/invnt/desktop/login.png";
import invntDesktopAnalytics from "../assets/invnt/desktop/analytics.png";
import invntDesktopCalendar from "../assets/invnt/desktop/calendar.png";
import invntDesktopSpace from "../assets/invnt/desktop/space.png";

// INVNT iPhone images
import invntIphoneHome from "../assets/invnt/iphone/home-phone.png";
import invntIphoneLogin from "../assets/invnt/iphone/login-phone.png";
import invntIphoneAnalytics from "../assets/invnt/iphone/analytics-phone.png";
import invntIphoneSpace from "../assets/invnt/iphone/space-phone.png";

// Other images
import hatLogo from "../assets/hat_logo.png";
import hatLogoDark from "../assets/hat_logo_dark.png";

// Map of public paths to imported images
const imageMap: Record<string, any> = {
  // Paneglass
  "/paneglass/screenshots/home-hero.png": paneglassHomeHero,
  "/paneglass/screenshots/import-modal.png": paneglassImportModal,
  "/paneglass/screenshots/plugin-import-button.png":
    paneglassPluginImportButton,
  "/paneglass/screenshots/organize-with-ai-screen.png": paneglassOrganizeWithAi,
  "/paneglass/screenshots/unified-knowledge-tree.png":
    paneglassUnifiedKnowledgeTree,
  "/paneglass/screenshots/extension-page.png": paneglassExtensionPage,
  "/paneglass/screenshots/home-features.png": paneglassHomeFeatures,
  "/paneglass/screenshots/home-solutions.png": paneglassHomeSolutions,
  "/paneglass/screenshots/home-pricing.png": paneglassHomePricing,
  // Paneglass videos - kept in public/, paths remain as strings
  // Yonduur desktop
  "/yonduur/desktop/home-hero.png": yonduurDesktopHomeHero,
  "/yonduur/desktop/listings.png": yonduurDesktopListings,
  "/yonduur/desktop/listings-map-draw.png": yonduurDesktopListingsMapDraw,
  "/yonduur/desktop/listing-details.png": yonduurDesktopListingDetails,
  "/yonduur/desktop/listing-details-pois.png": yonduurDesktopListingDetailsPois,
  "/yonduur/desktop/listing-details-own.png": yonduurDesktopListingDetailsOwn,
  "/yonduur/desktop/home-ai-chat.png": yonduurDesktopHomeAiChat,
  "/yonduur/desktop/account-listings.png": yonduurDesktopAccountListings,
  "/yonduur/desktop/account-favorites.png": yonduurDesktopAccountFavorites,
  "/yonduur/desktop/account-saved-searches.png":
    yonduurDesktopAccountSavedSearches,
  // Yonduur iPhone
  "/yonduur/iphone/home-hero-iphone.png": yonduurIphoneHomeHero,
  "/yonduur/iphone/listings-iphone.png": yonduurIphoneListings,
  "/yonduur/iphone/listings-map-draw-iphone.png": yonduurIphoneListingsMapDraw,
  "/yonduur/iphone/listing-details-iphone.png": yonduurIphoneListingDetails,
  "/yonduur/iphone/listing-details-pois-iphone.png":
    yonduurIphoneListingDetailsPois,
  "/yonduur/iphone/listing-details-own-iphone.png":
    yonduurIphoneListingDetailsOwn,
  "/yonduur/iphone/home-ai-chat-iphone.png": yonduurIphoneHomeAiChat,
  "/yonduur/iphone/account-listings-iphone.png": yonduurIphoneAccountListings,
  "/yonduur/iphone/account-favorites-iphone.png": yonduurIphoneAccountFavorites,
  "/yonduur/iphone/account-saved-searches-iphone.png":
    yonduurIphoneAccountSavedSearches,
  // INVNT desktop
  "/invnt/desktop/home.png": invntDesktopHome,
  "/invnt/desktop/login.png": invntDesktopLogin,
  "/invnt/desktop/analytics.png": invntDesktopAnalytics,
  "/invnt/desktop/calendar.png": invntDesktopCalendar,
  "/invnt/desktop/space.png": invntDesktopSpace,
  // INVNT iPhone
  "/invnt/iphone/home-phone.png": invntIphoneHome,
  "/invnt/iphone/login-phone.png": invntIphoneLogin,
  "/invnt/iphone/analytics-phone.png": invntIphoneAnalytics,
  "/invnt/iphone/space-phone.png": invntIphoneSpace,
  // Other
  "/hat_logo.png": hatLogo,
  "/hat_logo_dark.png": hatLogoDark,
};

/**
 * Resolves a public path to an imported image
 * Returns the imported image if found, otherwise returns the original path string
 */
export function resolveImage(path: string): any {
  return imageMap[path] || path;
}

/**
 * Gets the src URL for an image (works for both imported images and string paths)
 */
export function getImageSrc(image: any): string {
  if (typeof image === "string") {
    return image;
  }
  // For imported images (ImageMetadata), use the .src property
  return image?.src || image;
}
