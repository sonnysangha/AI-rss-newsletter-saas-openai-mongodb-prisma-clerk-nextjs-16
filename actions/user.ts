"use server";

import { prisma } from "@/lib/prisma";

// ============================================
// USER ACTIONS
// ============================================

/**
 * Creates a new user from Clerk authentication data
 */
export async function createUserFromClerk(clerkUserId: string) {
  try {
    const user = await prisma.user.create({
      data: {
        clerkUserId,
      },
    });
    return user;
  } catch (error) {
    console.error("Failed to create user from Clerk:", error);
    throw new Error("Failed to create user in database");
  }
}

/**
 * Fetches a user by their Clerk user ID
 */
export async function getUserByClerkId(clerkUserId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
    });
    return user;
  } catch (error) {
    console.error("Failed to fetch user by Clerk ID:", error);
    throw new Error("Failed to fetch user from database");
  }
}

/**
 * Fetches a user by their database ID
 */
export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return user;
  } catch (error) {
    console.error("Failed to fetch user by ID:", error);
    throw new Error("Failed to fetch user from database");
  }
}

/**
 * Fetches a user with their RSS feed and newsletter statistics
 */
export async function getUserWithStats(clerkUserId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      include: {
        _count: {
          select: {
            rssFeeds: true,
            newsletters: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error(`User with Clerk ID ${clerkUserId} not found`);
    }

    return user;
  } catch (error) {
    console.error("Failed to fetch user with stats:", error);
    throw new Error("Failed to fetch user statistics from database");
  }
}

/**
 * Creates a user if they don't exist, or returns the existing user
 */
export async function upsertUserFromClerk(clerkUserId: string) {
  try {
    const user = await prisma.user.upsert({
      where: { clerkUserId },
      update: {
        updatedAt: new Date(),
      },
      create: {
        clerkUserId,
      },
    });
    return user;
  } catch (error) {
    console.error("Failed to upsert user:", error);
    throw new Error("Failed to upsert user in database");
  }
}
