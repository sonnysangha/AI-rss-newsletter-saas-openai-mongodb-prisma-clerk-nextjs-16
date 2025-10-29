"use server";

import { prisma } from "@/lib/prisma";
import { wrapDatabaseOperation } from "@/lib/database/error-handler";

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
  return wrapDatabaseOperation(async () => {
    return await prisma.newsletter.create({
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
  }, "create newsletter");
}
