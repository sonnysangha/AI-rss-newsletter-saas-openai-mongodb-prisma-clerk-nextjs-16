import { prisma } from "@/lib/prisma";
import { getArticlesByFeedsAndDateRange } from "@/actions/rss-article";
import { fetchAndStoreFeed } from "@/actions/rss-fetch";
import type { PrepareFeedsParams } from "./types";

// ============================================
// FEED REFRESH UTILITIES
// ============================================

/**
 * Cache window for RSS feeds (currently 3 hours = 3 * 60 * 60 * 1000 ms)
 * Feeds are only refreshed if they haven't been fetched within this window
 */
export const CACHE_WINDOW = 3 * 60 * 60 * 1000;

/**
 * Maximum number of articles to fetch for newsletter generation
 */
export const ARTICLE_LIMIT = 100;

/**
 * Determines which feeds need refreshing (older than 3 hours)
 * Checks globally across all users - if ANY user fetched this URL recently, skip refresh
 * Returns array of feed IDs that should be refreshed
 */
export async function getFeedsToRefresh(feedIds: string[]): Promise<string[]> {
  const now = new Date();

  const feeds = await prisma.rssFeed.findMany({
    where: {
      id: { in: feedIds },
    },
    select: {
      id: true,
      url: true,
      lastFetched: true,
    },
  });

  const feedsToRefresh: string[] = [];

  for (const feed of feeds) {
    // Check if ANY feed with this URL was fetched recently (by any user)
    const mostRecentFetch = await prisma.rssFeed.findFirst({
      where: {
        url: feed.url,
      },
      select: {
        lastFetched: true,
      },
      orderBy: {
        lastFetched: "desc",
      },
    });

    // If no feed with this URL has ever been fetched, refresh it
    if (!mostRecentFetch?.lastFetched) {
      feedsToRefresh.push(feed.id);
      continue;
    }

    // Check if the most recent fetch was beyond the cache window
    const timeSinceLastFetch =
      now.getTime() - mostRecentFetch.lastFetched.getTime();
    if (timeSinceLastFetch > CACHE_WINDOW) {
      feedsToRefresh.push(feed.id);
    }
  }

  return feedsToRefresh;
}

/**
 * Prepares feeds and fetches articles for newsletter generation
 * Refreshes stale feeds and retrieves articles within the specified date range
 */
export async function prepareFeedsAndArticles(params: PrepareFeedsParams) {
  // Only refresh stale feeds (>3 hours old)
  const feedsToRefresh = await getFeedsToRefresh(params.feedIds);

  if (feedsToRefresh.length > 0) {
    console.log(
      `Refreshing ${feedsToRefresh.length} stale feeds (out of ${params.feedIds.length} total)...`
    );
    const refreshResults = await Promise.allSettled(
      feedsToRefresh.map((feedId) => fetchAndStoreFeed(feedId))
    );

    // Log refresh results
    const successful = refreshResults.filter(
      (r) => r.status === "fulfilled"
    ).length;
    const failed = refreshResults.filter((r) => r.status === "rejected").length;
    console.log(
      `Feed refresh complete: ${successful} successful, ${failed} failed`
    );
  } else {
    console.log(
      `All ${params.feedIds.length} feeds are fresh (< 3 hours old), skipping refresh`
    );
  }

  // Fetch articles from selected feeds within date range
  const articles = await getArticlesByFeedsAndDateRange(
    params.feedIds,
    params.startDate,
    params.endDate,
    ARTICLE_LIMIT
  );

  if (articles.length === 0) {
    throw new Error("No articles found for the selected feeds and date range");
  }

  return articles;
}
