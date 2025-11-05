import type { NextRequest } from "next/server";
import { getArticlesByFeedsAndDateRange } from "@/actions/rss-article";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getFeedsToRefresh } from "@/lib/rss/feed-refresh";

export const maxDuration = 60;

/**
 * POST /api/newsletter/prepare
 *
 * Quick metadata endpoint to check feeds and articles before generation.
 * Returns information for user feedback (toasts) without starting AI generation.
 *
 * @returns Metadata about feeds and articles to be used
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { feedIds, startDate, endDate } = body;

    // Validate required parameters
    if (!feedIds || !Array.isArray(feedIds) || feedIds.length === 0) {
      return Response.json(
        { error: "feedIds is required and must be a non-empty array" },
        { status: 400 },
      );
    }

    if (!startDate || !endDate) {
      return Response.json(
        { error: "startDate and endDate are required" },
        { status: 400 },
      );
    }

    // Verify user authentication
    await getCurrentUser();

    // Check which feeds need refreshing
    const feedsToRefresh = await getFeedsToRefresh(feedIds);

    // Get article count without fetching full content
    const articles = await getArticlesByFeedsAndDateRange(
      feedIds,
      new Date(startDate),
      new Date(endDate),
      100, // Same limit as generation
    );

    return Response.json({
      feedsToRefresh: feedsToRefresh.length,
      articlesFound: articles.length,
    });
  } catch (error) {
    console.error("Error in prepare:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return Response.json(
      { error: `Failed to prepare newsletter: ${errorMessage}` },
      { status: 500 },
    );
  }
}
