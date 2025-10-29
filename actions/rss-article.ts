"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// ============================================
// RSS ARTICLE ACTIONS
// ============================================

/**
 * Creates a single RSS article with automatic deduplication using guid
 */
export async function createRssArticle(data: {
  feedId: string;
  guid: string;
  title: string;
  link: string;
  content?: string;
  summary?: string;
  pubDate: Date;
  author?: string;
  categories?: string[];
  imageUrl?: string;
}) {
  try {
    // Check if article already exists
    const existing = await prisma.rssArticle.findUnique({
      where: { guid: data.guid },
    });

    if (existing) {
      return existing; // Return existing article instead of creating duplicate
    }

    const article = await prisma.rssArticle.create({
      data: {
        feedId: data.feedId,
        guid: data.guid,
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
    return article;
  } catch (error) {
    console.error("Failed to create RSS article:", error);
    throw new Error("Failed to create RSS article in database");
  }
}

/**
 * Bulk creates multiple RSS articles, automatically skipping duplicates based on guid
 */
export async function bulkCreateRssArticles(
  articles: Array<{
    feedId: string;
    guid: string;
    title: string;
    link: string;
    content?: string;
    summary?: string;
    pubDate: Date;
    author?: string;
    categories?: string[];
    imageUrl?: string;
  }>
) {
  try {
    const results = {
      created: 0,
      skipped: 0,
      errors: 0,
    };

    // Process articles in batches to avoid overwhelming the database
    for (const article of articles) {
      try {
        await createRssArticle(article);
        results.created++;
      } catch (error) {
        // If it's a unique constraint error, it's a duplicate - skip it
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          results.skipped++;
        } else {
          results.errors++;
          console.error(`Failed to create article ${article.guid}:`, error);
        }
      }
    }

    return results;
  } catch (error) {
    console.error("Failed to bulk create RSS articles:", error);
    throw new Error("Failed to bulk create RSS articles in database");
  }
}

/**
 * Fetches all articles for a specific RSS feed
 */
export async function getArticlesByFeedId(feedId: string, limit = 100) {
  try {
    const articles = await prisma.rssArticle.findMany({
      where: { feedId },
      orderBy: {
        pubDate: "desc",
      },
      take: limit,
    });
    return articles;
  } catch (error) {
    console.error("Failed to fetch articles by feed ID:", error);
    throw new Error("Failed to fetch articles from database");
  }
}

/**
 * Fetches articles within a specific date range
 */
export async function getArticlesByDateRange(
  startDate: Date,
  endDate: Date,
  feedIds?: string[]
) {
  try {
    const articles = await prisma.rssArticle.findMany({
      where: {
        pubDate: {
          gte: startDate,
          lte: endDate,
        },
        ...(feedIds && feedIds.length > 0 && { feedId: { in: feedIds } }),
      },
      include: {
        feed: {
          select: {
            id: true,
            title: true,
            url: true,
          },
        },
      },
      orderBy: {
        pubDate: "desc",
      },
    });
    return articles;
  } catch (error) {
    console.error("Failed to fetch articles by date range:", error);
    throw new Error("Failed to fetch articles from database");
  }
}

/**
 * Fetches articles from multiple feeds
 */
export async function getArticlesByFeedIds(feedIds: string[], limit = 100) {
  try {
    const articles = await prisma.rssArticle.findMany({
      where: {
        feedId: {
          in: feedIds,
        },
      },
      include: {
        feed: {
          select: {
            id: true,
            title: true,
            url: true,
          },
        },
      },
      orderBy: {
        pubDate: "desc",
      },
      take: limit,
    });
    return articles;
  } catch (error) {
    console.error("Failed to fetch articles by feed IDs:", error);
    throw new Error("Failed to fetch articles from database");
  }
}

/**
 * Checks if an article exists by its guid (for deduplication)
 */
export async function getArticleByGuid(guid: string) {
  try {
    const article = await prisma.rssArticle.findUnique({
      where: { guid },
    });
    return article;
  } catch (error) {
    console.error("Failed to fetch article by guid:", error);
    throw new Error("Failed to fetch article from database");
  }
}

/**
 * Fetches the most recent articles across all feeds for a user
 */
export async function getRecentArticles(userId: string, limit = 50) {
  try {
    const articles = await prisma.rssArticle.findMany({
      where: {
        feed: {
          userId,
          isActive: true,
        },
      },
      include: {
        feed: {
          select: {
            id: true,
            title: true,
            url: true,
          },
        },
      },
      orderBy: {
        pubDate: "desc",
      },
      take: limit,
    });
    return articles;
  } catch (error) {
    console.error("Failed to fetch recent articles:", error);
    throw new Error("Failed to fetch recent articles from database");
  }
}

/**
 * Fetches a single article by ID
 */
export async function getArticleById(articleId: string) {
  try {
    const article = await prisma.rssArticle.findUnique({
      where: { id: articleId },
      include: {
        feed: {
          select: {
            id: true,
            title: true,
            url: true,
          },
        },
      },
    });

    if (!article) {
      throw new Error(`Article with ID ${articleId} not found`);
    }

    return article;
  } catch (error) {
    console.error("Failed to fetch article by ID:", error);
    throw new Error("Failed to fetch article from database");
  }
}
