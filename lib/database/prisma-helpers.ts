import type { Prisma } from "@prisma/client";

// ============================================
// COMMON PRISMA QUERY PATTERNS
// ============================================

/**
 * Include pattern for RSS feed with article count
 * Used in: getRssFeedsByUserId, getRssFeedById, getAllRssFeedsByUserId
 */
export const FEED_WITH_COUNT_INCLUDE = {
  _count: {
    select: {
      articles: true,
    },
  },
} as const satisfies Prisma.RssFeedInclude;

/**
 * Include pattern for article with feed information
 * Used in: getArticlesByDateRange, getArticlesByFeedIds, getRecentArticles, etc.
 */
export const ARTICLE_WITH_FEED_INCLUDE = {
  feed: {
    select: {
      id: true,
      title: true,
      url: true,
    },
  },
} as const satisfies Prisma.RssArticleInclude;

/**
 * Include pattern for newsletter with user information
 * Used in: getNewsletterById
 */
export const NEWSLETTER_WITH_USER_INCLUDE = {
  user: {
    select: {
      id: true,
      clerkUserId: true,
    },
  },
} as const satisfies Prisma.NewsletterInclude;

/**
 * Common orderBy pattern for articles (descending by publication date)
 */
export const ARTICLE_ORDER_BY_DATE_DESC = {
  pubDate: "desc",
} as const satisfies Prisma.RssArticleOrderByWithRelationInput;

/**
 * Common orderBy pattern for feeds (descending by creation date)
 */
export const FEED_ORDER_BY_CREATED_DESC = {
  createdAt: "desc",
} as const satisfies Prisma.RssFeedOrderByWithRelationInput;

/**
 * Common orderBy pattern for newsletters (descending by creation date)
 */
export const NEWSLETTER_ORDER_BY_CREATED_DESC = {
  createdAt: "desc",
} as const satisfies Prisma.NewsletterOrderByWithRelationInput;
