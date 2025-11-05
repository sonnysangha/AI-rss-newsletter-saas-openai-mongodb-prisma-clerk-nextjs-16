// ============================================
// URL UTILITIES
// ============================================

/**
 * Normalizes RSS feed URL by adding https:// prefix if missing
 * Ensures all URLs have a proper protocol for consistent handling
 */
export function normalizeRssUrl(url: string): string {
  const trimmedUrl = url.trim();

  // If URL already has a protocol, return as-is
  if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
    return trimmedUrl;
  }

  // Otherwise, prepend https://
  return `https://${trimmedUrl}`;
}
