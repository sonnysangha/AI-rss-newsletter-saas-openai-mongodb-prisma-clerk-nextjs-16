"use server";

import { prisma } from "@/lib/prisma";
import {
  wrapDatabaseOperation,
  isPrismaError,
} from "@/lib/database/error-handler";
import {
  ARTICLE_WITH_FEED_INCLUDE,
  ARTICLE_ORDER_BY_DATE_DESC,
} from "@/lib/database/prisma-helpers";
import type { ArticleCreateData, BulkOperationResult } from "@/lib/rss/types";

// ============================================
// RSS ARTICLE ACTIONS
// ============================================

/**
 * Creates a single RSS article with automatic deduplication using guid
 * If article already exists, adds the current feedId to sourceFeedIds for multi-source tracking
 */
export async function createRssArticle(data: ArticleCreateData) {
  return wrapDatabaseOperation(async () => {
    return await prisma.rssArticle.upsert({
      where: { guid: data.guid },
      update: {
        sourceFeedIds: {
          push: data.feedId,
        },
      },
      create: {
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
  articles: ArticleCreateData[]
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
  limit = 100
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
    return articles.map((article) => ({
      ...article,
      sourceCount: article.sourceFeedIds.length,
    }));
  }, "fetch articles by feeds and date range");
}
