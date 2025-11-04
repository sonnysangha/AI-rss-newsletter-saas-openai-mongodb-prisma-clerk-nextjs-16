"use server";

import { streamObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createNewsletter } from "./newsletter";
import { getUserByClerkId } from "./user";
import { getUserSettingsByUserId } from "./user-settings";
import { prepareFeedsAndArticles } from "@/lib/rss/feed-refresh";
import {
  buildArticleSummaries,
  buildNewsletterPrompt,
} from "@/lib/newsletter/prompt-builder";

// ============================================
// NEWSLETTER GENERATION ACTIONS
// ============================================

/**
 * Newsletter generation result schema
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
 * Prepares feeds and articles for newsletter generation
 * Returns prepared data needed for AI generation
 */
export async function prepareFeedsForGeneration(params: {
  feedIds: string[];
  startDate: Date;
  endDate: Date;
  userInput?: string;
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Get user from database
  const user = await getUserByClerkId(userId);
  if (!user) {
    throw new Error("User not found in database");
  }

  // Fetch user settings
  const settings = await getUserSettingsByUserId(user.id);

  // Prepare feeds and fetch articles
  const articles = await prepareFeedsAndArticles(params);

  return {
    user,
    settings,
    articles,
  };
}

/**
 * Generates an AI-powered newsletter with streaming (real-time updates)
 * Returns a stream that progressively sends newsletter parts as they're generated
 */
export async function generateNewsletterWithAIStream(params: {
  feedIds: string[];
  startDate: Date;
  endDate: Date;
  userInput?: string;
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Get user from database
  const user = await getUserByClerkId(userId);
  if (!user) {
    throw new Error("User not found in database");
  }

  // Fetch user settings
  const settings = await getUserSettingsByUserId(user.id);

  // Prepare feeds and fetch articles
  const articles = await prepareFeedsAndArticles(params);

  // Build AI prompt
  const articleSummaries = buildArticleSummaries(articles);
  const prompt = buildNewsletterPrompt({
    startDate: params.startDate,
    endDate: params.endDate,
    articleSummaries,
    articleCount: articles.length,
    userInput: params.userInput,
    settings,
  });

  // Generate newsletter using AI streaming
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
 * Generates newsletter from pre-prepared data (used for streaming with status updates)
 */
export async function generateNewsletterFromPreparedData(params: {
  articles: Awaited<ReturnType<typeof prepareFeedsAndArticles>>;
  settings: Awaited<ReturnType<typeof getUserSettingsByUserId>>;
  startDate: Date;
  endDate: Date;
  userInput?: string;
}) {
  // Build AI prompt
  const articleSummaries = buildArticleSummaries(params.articles);
  const prompt = buildNewsletterPrompt({
    startDate: params.startDate,
    endDate: params.endDate,
    articleSummaries,
    articleCount: params.articles.length,
    userInput: params.userInput,
    settings: params.settings,
  });

  // Generate newsletter using AI streaming
  const { partialObjectStream } = await streamObject({
    model: openai("gpt-4o"),
    schema: NewsletterSchema,
    prompt,
  });

  return {
    stream: partialObjectStream,
    articlesAnalyzed: params.articles.length,
  };
}

/**
 * Saves a generated newsletter (for Pro users)
 */
export async function saveGeneratedNewsletter(params: {
  newsletter: GeneratedNewsletter;
  feedIds: string[];
  startDate: Date;
  endDate: Date;
  userInput?: string;
}) {
  const { userId, has } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const isPro = await has({ plan: "pro" });
  if (!isPro) {
    throw new Error("Pro plan required to save newsletters");
  }

  const user = await getUserByClerkId(userId);
  if (!user) {
    throw new Error("User not found in database");
  }

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
