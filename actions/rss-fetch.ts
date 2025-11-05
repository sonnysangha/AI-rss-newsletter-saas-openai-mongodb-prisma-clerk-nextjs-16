"use server";

import { wrapDatabaseOperation } from "@/lib/database/error-handler";
import { prisma } from "@/lib/prisma";
import {
  type ArticleData,
  fetchAndParseFeed,
  validateFeedUrl,
} from "@/lib/rss/parser";
import { bulkCreateRssArticles } from "./rss-article";
import { updateFeedLastFetched } from "./rss-feed";

// ============================================
// RSS FETCH ACTIONS
// ============================================

/**
 * Validates an RSS URL and creates a new feed with initial article fetch
 */
export async function validateAndAddFeed(userId: string, url: string) {
  return wrapDatabaseOperation(async () => {
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
  }, "add RSS feed");
}

/**
 * Fetches an RSS feed and stores new articles
 */
export async function fetchAndStoreFeed(feedId: string) {
  return wrapDatabaseOperation(async () => {
    // Get the feed details
    const feed = await prisma.rssFeed.findUnique({
      where: { id: feedId },
    });

    if (!feed) {
      throw new Error(`Feed with ID ${feedId} not found`);
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
  }, "fetch feed");
}
