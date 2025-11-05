"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/helpers";
import { deleteNewsletter as deleteNewsletterDb } from "./newsletter";

// ============================================
// DELETE NEWSLETTER ACTION
// ============================================

/**
 * Deletes a newsletter for the authenticated user
 *
 * This action:
 * 1. Verifies user authentication
 * 2. Checks authorization (newsletter belongs to user)
 * 3. Deletes the newsletter from database
 * 4. Revalidates the cache to update UI
 *
 * @param newsletterId - ID of the newsletter to delete
 * @returns Success status
 */
export async function deleteNewsletterAction(newsletterId: string) {
  try {
    // Get authenticated user
    const user = await getCurrentUser();

    // Delete the newsletter (includes authorization check)
    await deleteNewsletterDb(newsletterId, user.id);

    // Revalidate the history page cache to update the list
    revalidatePath("/dashboard/history");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete newsletter:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete newsletter",
    );
  }
}
