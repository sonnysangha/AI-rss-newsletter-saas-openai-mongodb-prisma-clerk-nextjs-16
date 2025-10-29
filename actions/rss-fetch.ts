"use server";

import { prisma } from "@/lib/prisma";
import {
  fetchAndParseFeed,
  validateFeedUrl,
  type ArticleData,
} from "@/lib/rss-parser";
import { bulkCreateRssArticles } from "./rss-article";
import { updateFeedLastFetched, getRssFeedsByUserId } from "./rss-feed";

// ============================================
// RSS FETCH ACTIONS
// ============================================

/**
 * Validates an RSS URL and creates a new feed with initial article fetch
 */
export async function validateAndAddFeed(userId: string, url: string) {
  try {
    // Validate the RSS feed URL
    const isValid = await validateFeedUrl(url);
    if (!isValid) {
      throw new Error("Invalid RSS feed URL or unable to fetch feed");
    }

    // Create the feed in database
    const feed = await prisma.rssFeed.create({
      data: {
        userId,
        url,
      },
    });

    // Fetch and store initial articles
    try {
      const result = await fetchAndStoreFeed(feed.id);

      // Update feed with metadata from RSS
      await prisma.rssFeed.update({
        where: { id: feed.id },
        data: {
          title: result.metadata.title,
          description: result.metadata.description,
          link: result.metadata.link,
          imageUrl: result.metadata.imageUrl,
          language: result.metadata.language,
        },
      });

      return {
        feed,
        articlesCreated: result.created,
        articlesSkipped: result.skipped,
      };
    } catch (fetchError) {
      // If initial fetch fails, still return the feed
      console.error("Failed to fetch initial articles:", fetchError);
      return {
        feed,
        articlesCreated: 0,
        articlesSkipped: 0,
        error: "Feed created but initial fetch failed",
      };
    }
  } catch (error) {
    console.error("Failed to validate and add feed:", error);
    throw new Error("Failed to add RSS feed");
  }
}

/**
 * Fetches an RSS feed and stores new articles
 */
export async function fetchAndStoreFeed(feedId: string) {
  try {
    // Get the feed details
    const feed = await prisma.rssFeed.findUnique({
      where: { id: feedId },
    });

    if (!feed) {
      throw new Error(`Feed with ID ${feedId} not found`);
    }

    if (!feed.isActive) {
      throw new Error(`Feed ${feedId} is not active`);
    }

    // Fetch and parse the RSS feed
    const { metadata, articles } = await fetchAndParseFeed(feed.url, feedId);

    // Convert ArticleData to format expected by bulkCreateRssArticles
    const articlesToCreate = articles.map((article: ArticleData) => ({
      feedId: feed.id,
      guid: article.guid,
      title: article.title,
      link: article.link,
      content: article.content,
      summary: article.summary,
      pubDate: article.pubDate,
      author: article.author,
      categories: article.categories,
      imageUrl: article.imageUrl,
    }));

    // Store articles with automatic deduplication
    const result = await bulkCreateRssArticles(articlesToCreate);

    // Update the feed's lastFetched timestamp
    await updateFeedLastFetched(feedId);

    return {
      metadata,
      created: result.created,
      skipped: result.skipped,
      errors: result.errors,
    };
  } catch (error) {
    console.error("Failed to fetch and store feed:", error);
    throw new Error(
      `Failed to fetch feed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Fetches all active RSS feeds for a user
 */
export async function fetchAllUserFeeds(userId: string) {
  try {
    const feeds = await getRssFeedsByUserId(userId);

    const results = {
      total: feeds.length,
      successful: 0,
      failed: 0,
      totalArticlesCreated: 0,
      totalArticlesSkipped: 0,
      errors: [] as Array<{ feedId: string; error: string }>,
    };

    for (const feed of feeds) {
      try {
        const result = await fetchAndStoreFeed(feed.id);
        results.successful++;
        results.totalArticlesCreated += result.created;
        results.totalArticlesSkipped += result.skipped;
      } catch (error) {
        results.failed++;
        results.errors.push({
          feedId: feed.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Failed to fetch all user feeds:", error);
    throw new Error("Failed to fetch user feeds");
  }
}

/**
 * Refreshes feed metadata from the RSS source
 */
export async function refreshFeedMetadata(feedId: string) {
  try {
    const feed = await prisma.rssFeed.findUnique({
      where: { id: feedId },
    });

    if (!feed) {
      throw new Error(`Feed with ID ${feedId} not found`);
    }

    // Fetch the RSS feed
    const { metadata } = await fetchAndParseFeed(feed.url, feedId);

    // Update feed with latest metadata
    const updatedFeed = await prisma.rssFeed.update({
      where: { id: feedId },
      data: {
        title: metadata.title,
        description: metadata.description,
        link: metadata.link,
        imageUrl: metadata.imageUrl,
        language: metadata.language,
      },
    });

    return updatedFeed;
  } catch (error) {
    console.error("Failed to refresh feed metadata:", error);
    throw new Error("Failed to refresh feed metadata");
  }
}
