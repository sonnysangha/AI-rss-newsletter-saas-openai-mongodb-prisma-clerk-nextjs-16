"use server";

import { prisma } from "@/lib/prisma";

// ============================================
// USER ACTIONS
// ============================================

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
