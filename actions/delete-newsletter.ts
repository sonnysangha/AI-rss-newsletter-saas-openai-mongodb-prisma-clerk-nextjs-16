"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { deleteNewsletter as deleteNewsletterDb } from "./newsletter";
import { getUserByClerkId } from "./user";

// ============================================
// DELETE NEWSLETTER ACTION
// ============================================

/**
 * Deletes a newsletter for the authenticated user
 * Includes authorization check and cache revalidation
 */
export async function deleteNewsletterAction(newsletterId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    // Get user from database
    const user = await getUserByClerkId(userId);
    if (!user) {
      throw new Error("User not found in database");
    }

    // Delete the newsletter
    await deleteNewsletterDb(newsletterId, user.id);

    // Revalidate the history page to update the list
    revalidatePath("/dashboard/history");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete newsletter:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete newsletter"
    );
  }
}
