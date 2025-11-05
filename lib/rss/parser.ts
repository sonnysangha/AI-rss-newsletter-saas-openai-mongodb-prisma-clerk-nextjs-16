import Parser from "rss-parser";
import type { ArticleData, FeedMetadata } from "./types";

// Re-export types for convenience
export type { ArticleData, FeedMetadata };

// ============================================
// RSS PARSER UTILITIES
// ============================================

/**
 * Type definition for RSS category as returned by xml2js parser
 * RSS feeds use xml2js which parses <category domain="...">Value</category> as:
 * { _: "Value", $: { domain: "..." } }
 */
interface RssCategoryObject {
  _: string; // The actual category text
  $?: Record<string, string>; // Optional attributes like domain
}

/**
 * Categories can be strings (simple RSS) or objects (RSS with attributes)
 */
type RssCategory = string | RssCategoryObject;

/**
 * Normalizes categories from various RSS formats to string array
 * Handles both simple string categories and XML-parsed category objects
 *
 * @param rawCategories - Categories in any format from RSS parser
 * @returns Array of category strings, filtered and trimmed
 */
function normalizeCategories(
  rawCategories: RssCategory[] | undefined,
): string[] {
  if (!Array.isArray(rawCategories)) {
    return [];
  }

  return rawCategories
    .map((cat) => {
      // Simple string category
      if (typeof cat === "string") {
        return cat.trim();
      }

      // XML-parsed category object with text content in _ property
      if (
        typeof cat === "object" &&
        cat !== null &&
        typeof cat._ === "string"
      ) {
        return cat._.trim();
      }

      // Unexpected format - log warning and skip
      console.warn("Unexpected category format:", cat);
      return "";
    })
    .filter((cat) => cat.length > 0);
}

const parser = new Parser({
  timeout: 10000, // 10 second timeout
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; RSS Newsletter Bot/1.0)",
  },
});

/**
 * Validates if a URL returns a valid RSS feed
 */
export async function validateFeedUrl(url: string): Promise<boolean> {
  try {
    await parser.parseURL(url);
    return true;
  } catch (error) {
    console.error("Invalid RSS feed URL:", error);
    return false;
  }
}

/**
 * Parses an RSS feed from URL and returns the complete feed object
 */
export async function parseFeedUrl(url: string) {
  try {
    const feed = await parser.parseURL(url);
    return feed;
  } catch (error) {
    console.error("Failed to parse RSS feed:", error);
    throw new Error(
      `Failed to fetch or parse RSS feed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

/**
 * Extracts feed-level metadata from parsed RSS feed
 */
export function extractFeedMetadata(
  feed: Parser.Output<unknown>,
): FeedMetadata {
  const feedAny = feed as any;
  return {
    title: feed.title || "Untitled Feed",
    description: feed.description,
    link: feed.link,
    imageUrl: feed.image?.url,
    language: feedAny.language,
  };
}

/**
 * Extracts and normalizes article data from RSS feed items
 */
export function extractArticles(
  feed: Parser.Output<unknown>,
  feedId: string,
): ArticleData[] {
  return feed.items.map((item) => {
    // Type assertion for fields not in Parser.Item type definition
    const itemAny = item as any;

    // Use guid if available, fallback to link for deduplication
    const guid = item.guid || item.link || `${feedId}-${item.title}`;

    // Extract publication date with fallbacks
    const pubDate = item.isoDate
      ? new Date(item.isoDate)
      : item.pubDate
        ? new Date(item.pubDate)
        : new Date();

    // Extract content - try various common RSS fields
    const content =
      item.content ||
      itemAny["content:encoded"] ||
      itemAny.description ||
      itemAny.summary;

    // Extract summary - prefer contentSnippet over description
    const summary =
      item.contentSnippet || itemAny.description || itemAny.summary;

    // Extract author - try various common RSS fields
    const author = item.creator || itemAny.author;

    // Normalize categories - handles both string arrays and xml2js objects
    const rawCategories = (item.categories ||
      itemAny.category ||
      []) as RssCategory[];
    const categories = normalizeCategories(rawCategories);

    // Extract image from enclosure if available
    let imageUrl: string | undefined;
    if (item.enclosure?.url && item.enclosure?.type?.startsWith("image/")) {
      imageUrl = item.enclosure.url;
    }

    return {
      guid,
      title: item.title || "Untitled",
      link: item.link || "",
      content,
      summary,
      pubDate,
      author,
      categories,
      imageUrl,
    };
  });
}

/**
 * Complete RSS feed fetch and parse operation
 * Returns both feed metadata and articles
 */
export async function fetchAndParseFeed(url: string, feedId: string) {
  try {
    const feed = await parseFeedUrl(url);
    const metadata = extractFeedMetadata(feed);
    const articles = extractArticles(feed, feedId);

    return {
      metadata,
      articles,
      itemCount: feed.items.length,
    };
  } catch (error) {
    console.error("Failed to fetch and parse feed:", error);
    throw error;
  }
}
