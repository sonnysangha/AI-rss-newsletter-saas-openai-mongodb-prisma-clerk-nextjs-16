"use server";

import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { z } from "zod";
import { checkIsProUser, getCurrentUser } from "@/lib/auth/helpers";
import {
  buildArticleSummaries,
  buildNewsletterPrompt,
} from "@/lib/newsletter/prompt-builder";
import { prepareFeedsAndArticles } from "@/lib/rss/feed-refresh";
import { createNewsletter } from "./newsletter";
import { getUserSettingsByUserId } from "./user-settings";

// ============================================
// NEWSLETTER GENERATION ACTIONS
// ============================================

/**
 * Newsletter generation result schema
 *
 * Defines the structure of AI-generated newsletters.
 * The AI SDK validates responses against this schema.
 */
const NewsletterSchema = z.object({
  suggestedTitles: z.array(z.string()).length(5),
  suggestedSubjectLines: z.array(z.string()).length(5),
  body: z.string(),
  topAnnouncements: z.array(z.string()).length(5),
  additionalInfo: z.string().optional(),
});

export type GeneratedNewsletter = z.infer<typeof NewsletterSchema>;

/**
 * Generates a newsletter with AI streaming
 *
 * This is the main function for newsletter generation. It:
 * 1. Authenticates the user
 * 2. Fetches user settings for customization
 * 3. Prepares feeds and retrieves articles
 * 4. Builds an AI prompt with all context
 * 5. Streams the AI-generated newsletter in real-time
 *
 * @param params - Feed IDs, date range, and optional user instructions
 * @returns Object with the stream and article count
 */
export async function generateNewsletterStream(params: {
  feedIds: string[];
  startDate: Date;
  endDate: Date;
  userInput?: string;
}) {
  // Get authenticated user from database
  const user = await getCurrentUser();

  // Get user's newsletter settings (tone, branding, etc.)
  const settings = await getUserSettingsByUserId(user.id);

  // Fetch and refresh articles from RSS feeds
  const articles = await prepareFeedsAndArticles(params);

  // Build the AI prompt with articles and settings
  const articleSummaries = buildArticleSummaries(articles);
  const prompt = buildNewsletterPrompt({
    startDate: params.startDate,
    endDate: params.endDate,
    articleSummaries,
    articleCount: articles.length,
    userInput: params.userInput,
    settings,
  });

  // Generate newsletter using AI with streaming for real-time updates
  const { partialObjectStream } = await streamObject({
    model: openai("gpt-4o"),
    schema: NewsletterSchema,
    prompt,
  });

  return {
    stream: partialObjectStream,
    articlesAnalyzed: articles.length,
  };
}

/**
 * Saves a generated newsletter to the database
 *
 * Only Pro users can save newsletters to their history.
 * This allows them to reference past newsletters and track their content.
 *
 * @param params - Newsletter data and generation parameters
 * @returns Saved newsletter record
 * @throws Error if user is not Pro or not authenticated
 */
export async function saveGeneratedNewsletter(params: {
  newsletter: GeneratedNewsletter;
  feedIds: string[];
  startDate: Date;
  endDate: Date;
  userInput?: string;
}) {
  // Check if user has Pro plan (required for saving)
  const isPro = await checkIsProUser();
  if (!isPro) {
    throw new Error("Pro plan required to save newsletters");
  }

  // Get authenticated user
  const user = await getCurrentUser();

  // Save newsletter to database
  const savedNewsletter = await createNewsletter({
    userId: user.id,
    suggestedTitles: params.newsletter.suggestedTitles,
    suggestedSubjectLines: params.newsletter.suggestedSubjectLines,
    body: params.newsletter.body,
    topAnnouncements: params.newsletter.topAnnouncements,
    additionalInfo: params.newsletter.additionalInfo,
    startDate: params.startDate,
    endDate: params.endDate,
    userInput: params.userInput,
    feedsUsed: params.feedIds,
  });

  return savedNewsletter;
}
