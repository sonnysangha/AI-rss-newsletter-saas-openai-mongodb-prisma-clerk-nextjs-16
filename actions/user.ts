"use server";

import { wrapDatabaseOperation } from "@/lib/database/error-handler";
import { prisma } from "@/lib/prisma";

// ============================================
// USER ACTIONS
// ============================================

/**
 * Fetches a user by their Clerk user ID
 *
 * @param clerkUserId - The Clerk authentication ID
 * @returns User record or null if not found
 */
export async function getUserByClerkId(clerkUserId: string) {
  return wrapDatabaseOperation(async () => {
    return await prisma.user.findUnique({
      where: { clerkUserId },
    });
  }, "fetch user by Clerk ID");
}

/**
 * Creates a user if they don't exist, or returns the existing user
 * Updates the timestamp when user already exists (tracks last activity)
 *
 * @param clerkUserId - The Clerk authentication ID
 * @returns User record (either created or existing)
 */
export async function upsertUserFromClerk(clerkUserId: string) {
  return wrapDatabaseOperation(async () => {
    return await prisma.user.upsert({
      where: { clerkUserId },
      update: {
        updatedAt: new Date(),
      },
      create: {
        clerkUserId,
      },
    });
  }, "upsert user");
}
