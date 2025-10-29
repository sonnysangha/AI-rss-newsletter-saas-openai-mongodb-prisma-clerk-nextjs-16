"use server";

import { prisma } from "@/lib/prisma";

// ============================================
// RSS FEED ACTIONS
// ============================================

/**
 * Creates a new RSS feed for a user
 */
export async function createRssFeed(data: {
  userId: string;
  url: string;
  title?: string;
  description?: string;
}) {
  try {
    const feed = await prisma.rssFeed.create({
      data: {
        userId: data.userId,
        url: data.url,
        title: data.title,
        description: data.description,
      },
    });
    return feed;
  } catch (error) {
    console.error("Failed to create RSS feed:", error);
    throw new Error("Failed to create RSS feed in database");
  }
}

/**
 * Fetches all active RSS feeds for a specific user
 */
export async function getRssFeedsByUserId(userId: string) {
  try {
    const feeds = await prisma.rssFeed.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return feeds;
  } catch (error) {
    console.error("Failed to fetch RSS feeds:", error);
    throw new Error("Failed to fetch RSS feeds from database");
  }
}

/**
 * Fetches a single RSS feed by ID
 */
export async function getRssFeedById(feedId: string) {
  try {
    const feed = await prisma.rssFeed.findUnique({
      where: { id: feedId },
      include: {
        _count: {
          select: {
            articles: true,
          },
        },
      },
    });

    if (!feed) {
      throw new Error(`RSS feed with ID ${feedId} not found`);
    }

    return feed;
  } catch (error) {
    console.error("Failed to fetch RSS feed:", error);
    throw new Error("Failed to fetch RSS feed from database");
  }
}

/**
 * Updates an RSS feed's metadata
 */
export async function updateRssFeed(
  feedId: string,
  data: {
    title?: string;
    description?: string;
    url?: string;
  },
) {
  try {
    const feed = await prisma.rssFeed.update({
      where: { id: feedId },
      data,
    });
    return feed;
  } catch (error) {
    console.error("Failed to update RSS feed:", error);
    throw new Error("Failed to update RSS feed in database");
  }
}

/**
 * Updates the lastFetched timestamp for an RSS feed
 */
export async function updateFeedLastFetched(feedId: string) {
  try {
    const feed = await prisma.rssFeed.update({
      where: { id: feedId },
      data: {
        lastFetched: new Date(),
      },
    });
    return feed;
  } catch (error) {
    console.error("Failed to update feed last fetched:", error);
    throw new Error("Failed to update feed timestamp in database");
  }
}

/**
 * Toggles the isActive status of an RSS feed
 */
export async function toggleFeedActive(feedId: string) {
  try {
    const feed = await prisma.rssFeed.findUnique({
      where: { id: feedId },
      select: { isActive: true },
    });

    if (!feed) {
      throw new Error(`RSS feed with ID ${feedId} not found`);
    }

    const updatedFeed = await prisma.rssFeed.update({
      where: { id: feedId },
      data: {
        isActive: !feed.isActive,
      },
    });

    return updatedFeed;
  } catch (error) {
    console.error("Failed to toggle feed active status:", error);
    throw new Error("Failed to toggle feed status in database");
  }
}

/**
 * Permanently deletes an RSS feed and all its articles (cascade)
 */
export async function deleteRssFeed(feedId: string) {
  try {
    await prisma.rssFeed.delete({
      where: { id: feedId },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to delete RSS feed:", error);
    throw new Error("Failed to delete RSS feed from database");
  }
}

/**
 * Counts the number of active RSS feeds for a user (for plan limit enforcement)
 */
export async function getActiveFeedCount(userId: string) {
  try {
    const count = await prisma.rssFeed.count({
      where: {
        userId,
        isActive: true,
      },
    });
    return count;
  } catch (error) {
    console.error("Failed to count active feeds:", error);
    throw new Error("Failed to count active feeds from database");
  }
}

/**
 * Fetches all RSS feeds for a user including inactive and deleted ones
 */
export async function getAllRssFeedsByUserId(userId: string) {
  try {
    const feeds = await prisma.rssFeed.findMany({
      where: {
        userId,
      },
      include: {
        _count: {
          select: {
            articles: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return feeds;
  } catch (error) {
    console.error("Failed to fetch all RSS feeds:", error);
    throw new Error("Failed to fetch RSS feeds from database");
  }
}
