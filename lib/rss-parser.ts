import Parser from "rss-parser";

// ============================================
// RSS PARSER UTILITIES
// ============================================

const parser = new Parser({
  timeout: 10000, // 10 second timeout
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; RSS Newsletter Bot/1.0)",
  },
});

/**
 * Feed metadata extracted from RSS feed
 */
export interface FeedMetadata {
  title: string;
  description?: string;
  link?: string;
  imageUrl?: string;
  language?: string;
}

/**
 * Article data extracted from RSS feed item
 */
export interface ArticleData {
  guid: string;
  title: string;
  link: string;
  content?: string;
  summary?: string;
  pubDate: Date;
  author?: string;
  categories: string[];
  imageUrl?: string;
}

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
      }`
    );
  }
}

/**
 * Extracts feed-level metadata from parsed RSS feed
 */
export function extractFeedMetadata(
  feed: Parser.Output<unknown>
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
  feedId: string
): ArticleData[] {
  return feed.items.map((item) => {
    const itemAny = item as any;

    // Use guid if available, fallback to link for deduplication
    const guid = item.guid || item.link || `${feedId}-${item.title}`;

    // Extract publication date
    const pubDate = item.isoDate
      ? new Date(item.isoDate)
      : item.pubDate
      ? new Date(item.pubDate)
      : new Date();

    // Extract content - try various fields
    const content =
      item.content ||
      itemAny["content:encoded"] ||
      itemAny.description ||
      itemAny.summary;

    // Extract summary - prefer contentSnippet over description
    const summary =
      item.contentSnippet || itemAny.description || itemAny.summary;

    // Extract author - try various fields
    const author = item.creator || itemAny.author;

    // Extract categories
    const categories = item.categories || [];

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
