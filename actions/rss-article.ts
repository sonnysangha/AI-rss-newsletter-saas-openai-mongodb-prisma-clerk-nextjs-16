"use server";

import {
  isPrismaError,
  wrapDatabaseOperation,
} from "@/lib/database/error-handler";
import {
  ARTICLE_ORDER_BY_DATE_DESC,
  ARTICLE_WITH_FEED_INCLUDE,
} from "@/lib/database/prisma-helpers";
import { prisma } from "@/lib/prisma";
import type { ArticleCreateData, BulkOperationResult } from "@/lib/rss/types";

// ============================================
// RSS ARTICLE ACTIONS
// ============================================

/**
 * Creates a single RSS article with automatic deduplication using guid
 * If article already exists, adds the current feedId to sourceFeedIds for multi-source tracking
 * Uses MongoDB's $addToSet to prevent duplicate feedIds in the sourceFeedIds array
 */
export async function createRssArticle(data: ArticleCreateData) {
  return wrapDatabaseOperation(async () => {
    // First, try to find existing article
    const existing = await prisma.rssArticle.findUnique({
      where: { guid: data.guid },
      select: { id: true, sourceFeedIds: true },
    });

    if (existing) {
      // Article exists - only update if feedId not already in sourceFeedIds
      if (!existing.sourceFeedIds.includes(data.feedId)) {
        return await prisma.rssArticle.update({
          where: { guid: data.guid },
          data: {
            sourceFeedIds: {
              push: data.feedId,
            },
          },
        });
      }
      // Return existing article if feedId already present
      return await prisma.rssArticle.findUnique({
        where: { guid: data.guid },
      });
    }

    // Article doesn't exist - create new
    return await prisma.rssArticle.create({
      data: {
        feedId: data.feedId,
        guid: data.guid,
        sourceFeedIds: [data.feedId],
        title: data.title,
        link: data.link,
        content: data.content,
        summary: data.summary,
        pubDate: data.pubDate,
        author: data.author,
        categories: data.categories || [],
        imageUrl: data.imageUrl,
      },
    });
  }, "create RSS article");
}

/**
 * Bulk creates multiple RSS articles, automatically skipping duplicates based on guid
 */
export async function bulkCreateRssArticles(
  articles: ArticleCreateData[],
): Promise<BulkOperationResult> {
  const results: BulkOperationResult = {
    created: 0,
    skipped: 0,
    errors: 0,
  };

  for (const article of articles) {
    try {
      await createRssArticle(article);
      results.created++;
    } catch (error) {
      if (isPrismaError(error) && error.code === "P2002") {
        results.skipped++;
      } else {
        results.errors++;
        console.error(`Failed to create article ${article.guid}:`, error);
      }
    }
  }

  return results;
}

/**
 * Fetches articles by selected feeds and date range with importance scoring
 * Importance is calculated by the number of sources (sourceFeedIds length)
 */
export async function getArticlesByFeedsAndDateRange(
  feedIds: string[],
  startDate: Date,
  endDate: Date,
  limit = 100,
) {
  return wrapDatabaseOperation(async () => {
    const articles = await prisma.rssArticle.findMany({
      where: {
        OR: [
          { feedId: { in: feedIds } },
          {
            sourceFeedIds: {
              hasSome: feedIds,
            },
          },
        ],
        pubDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: ARTICLE_WITH_FEED_INCLUDE,
      orderBy: ARTICLE_ORDER_BY_DATE_DESC,
      take: limit,
    });

    // Add sourceCount for reference
    return articles.map((article: (typeof articles)[number]) => ({
      ...article,
      sourceCount: article.sourceFeedIds.length,
    }));
  }, "fetch articles by feeds and date range");
}
