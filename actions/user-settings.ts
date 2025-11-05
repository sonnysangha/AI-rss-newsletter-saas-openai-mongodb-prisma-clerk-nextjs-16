"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import type { UserSettings } from "@prisma/client";

// ============================================
// USER SETTINGS ACTIONS
// ============================================

/**
 * User settings input type for upsert operations
 */
export interface UserSettingsInput {
  // Basic Settings
  newsletterName?: string | null;
  description?: string | null;
  targetAudience?: string | null;
  defaultTone?: string | null;

  // Branding
  brandVoice?: string | null;
  companyName?: string | null;
  industry?: string | null;

  // Additional Information
  disclaimerText?: string | null;
  defaultTags?: string[];
  customFooter?: string | null;
  senderName?: string | null;
  senderEmail?: string | null;
}

/**
 * Fetches user settings for the authenticated user
 */
export async function getCurrentUserSettings() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const settings = await prisma.userSettings.findFirst({
      where: {
        user: {
          clerkUserId: userId,
        },
      },
    });

    return settings;
  } catch (error) {
    console.error("Failed to fetch user settings:", error);
    throw new Error("Failed to fetch user settings");
  }
}

/**
 * Fetches user settings by database user ID
 */
export async function getUserSettingsByUserId(userId: string) {
  try {
    const settings = await prisma.userSettings.findUnique({
      where: {
        userId,
      },
    });

    return settings;
  } catch (error) {
    console.error("Failed to fetch user settings by user ID:", error);
    throw new Error("Failed to fetch user settings");
  }
}

/**
 * Creates or updates user settings for the authenticated user
 */
export async function upsertUserSettings(
  data: UserSettingsInput
): Promise<UserSettings> {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get the database user
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found in database");
    }

    // Upsert the settings
    const settings = await prisma.userSettings.upsert({
      where: {
        userId: user.id,
      },
      update: {
        newsletterName: data.newsletterName,
        description: data.description,
        targetAudience: data.targetAudience,
        defaultTone: data.defaultTone,
        brandVoice: data.brandVoice,
        companyName: data.companyName,
        industry: data.industry,
        disclaimerText: data.disclaimerText,
        defaultTags: data.defaultTags || [],
        customFooter: data.customFooter,
        senderName: data.senderName,
        senderEmail: data.senderEmail,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        newsletterName: data.newsletterName,
        description: data.description,
        targetAudience: data.targetAudience,
        defaultTone: data.defaultTone,
        brandVoice: data.brandVoice,
        companyName: data.companyName,
        industry: data.industry,
        disclaimerText: data.disclaimerText,
        defaultTags: data.defaultTags || [],
        customFooter: data.customFooter,
        senderName: data.senderName,
        senderEmail: data.senderEmail,
      },
    });

    return settings;
  } catch (error) {
    console.error("Failed to upsert user settings:", error);
    throw new Error("Failed to save user settings");
  }
}

/**
 * Deletes user settings for the authenticated user
 */
export async function deleteUserSettings(): Promise<void> {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get the database user
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found in database");
    }

    // Delete the settings if they exist
    await prisma.userSettings.deleteMany({
      where: {
        userId: user.id,
      },
    });
  } catch (error) {
    console.error("Failed to delete user settings:", error);
    throw new Error("Failed to delete user settings");
  }
}
