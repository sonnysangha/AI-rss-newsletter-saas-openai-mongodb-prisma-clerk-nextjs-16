"use server";

import { prisma } from "@/lib/prisma";

// ============================================
// NEWSLETTER ACTIONS
// ============================================

/**
 * Creates and saves a generated newsletter
 */
export async function createNewsletter(data: {
  userId: string;
  suggestedTitles: string[];
  suggestedSubjectLines: string[];
  body: string;
  topAnnouncements: string[];
  additionalInfo?: string;
  startDate: Date;
  endDate: Date;
  userInput?: string;
  feedsUsed: string[];
}) {
  try {
    const newsletter = await prisma.newsletter.create({
      data: {
        userId: data.userId,
        suggestedTitles: data.suggestedTitles,
        suggestedSubjectLines: data.suggestedSubjectLines,
        body: data.body,
        topAnnouncements: data.topAnnouncements,
        additionalInfo: data.additionalInfo,
        startDate: data.startDate,
        endDate: data.endDate,
        userInput: data.userInput,
        feedsUsed: data.feedsUsed,
      },
    });
    return newsletter;
  } catch (error) {
    console.error("Failed to create newsletter:", error);
    throw new Error("Failed to create newsletter in database");
  }
}

/**
 * Fetches all newsletters for a user (Pro feature - history)
 */
export async function getNewslettersByUserId(userId: string, limit = 50) {
  try {
    const newsletters = await prisma.newsletter.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });
    return newsletters;
  } catch (error) {
    console.error("Failed to fetch newsletters:", error);
    throw new Error("Failed to fetch newsletters from database");
  }
}

/**
 * Fetches a single newsletter by ID with all details
 */
export async function getNewsletterById(newsletterId: string) {
  try {
    const newsletter = await prisma.newsletter.findUnique({
      where: { id: newsletterId },
      include: {
        user: {
          select: {
            id: true,
            clerkUserId: true,
          },
        },
      },
    });

    if (!newsletter) {
      throw new Error(`Newsletter with ID ${newsletterId} not found`);
    }

    return newsletter;
  } catch (error) {
    console.error("Failed to fetch newsletter:", error);
    throw new Error("Failed to fetch newsletter from database");
  }
}

/**
 * Permanently deletes a newsletter
 */
export async function deleteNewsletter(newsletterId: string) {
  try {
    await prisma.newsletter.delete({
      where: { id: newsletterId },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to delete newsletter:", error);
    throw new Error("Failed to delete newsletter from database");
  }
}

/**
 * Counts the total number of newsletters for a user
 */
export async function getNewsletterCount(userId: string) {
  try {
    const count = await prisma.newsletter.count({
      where: {
        userId,
      },
    });
    return count;
  } catch (error) {
    console.error("Failed to count newsletters:", error);
    throw new Error("Failed to count newsletters from database");
  }
}

/**
 * Fetches newsletters within a date range for a user
 */
export async function getNewslettersByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  try {
    const newsletters = await prisma.newsletter.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return newsletters;
  } catch (error) {
    console.error("Failed to fetch newsletters by date range:", error);
    throw new Error("Failed to fetch newsletters from database");
  }
}

/**
 * Fetches the most recent newsletter for a user
 */
export async function getLatestNewsletter(userId: string) {
  try {
    const newsletter = await prisma.newsletter.findFirst({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return newsletter;
  } catch (error) {
    console.error("Failed to fetch latest newsletter:", error);
    throw new Error("Failed to fetch latest newsletter from database");
  }
}
