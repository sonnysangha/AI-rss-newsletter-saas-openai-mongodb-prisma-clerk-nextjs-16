import type { NextRequest } from "next/server";
import {
  prepareFeedsForGeneration,
  generateNewsletterFromPreparedData,
} from "@/actions/generate-newsletter";
import { getFeedsToRefresh } from "@/lib/rss/feed-refresh";

export const maxDuration = 300; // 5 minutes for Vercel Pro

/**
 * POST /api/newsletter/generate-stream
 * Streams newsletter generation in real-time using Server-Sent Events (SSE)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { feedIds, startDate, endDate, userInput } = body;

    // Validate required parameters
    if (!feedIds || !Array.isArray(feedIds) || feedIds.length === 0) {
      return Response.json(
        { error: "feedIds is required and must be a non-empty array" },
        { status: 400 }
      );
    }

    if (!startDate || !endDate) {
      return Response.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    // Create a readable stream that emits status updates and generates newsletter
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // Check which feeds need refreshing
          const feedsToRefresh = await getFeedsToRefresh(feedIds);

          // Send refreshing event if feeds need to be refreshed
          if (feedsToRefresh.length > 0) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "refreshing",
                  feedCount: feedsToRefresh.length,
                })}\n\n`
              )
            );
          }

          // Send analyzing event
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "analyzing",
                feedCount: feedIds.length,
              })}\n\n`
            )
          );

          // Prepare feeds and fetch articles (this does the actual refresh)
          const { settings, articles } = await prepareFeedsForGeneration({
            feedIds,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            userInput,
          });

          // Generate newsletter with streaming
          const { stream, articlesAnalyzed } =
            await generateNewsletterFromPreparedData({
              articles,
              settings,
              startDate: new Date(startDate),
              endDate: new Date(endDate),
              userInput,
            });

          // Send metadata with article count
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "metadata",
                articlesAnalyzed,
              })}\n\n`
            )
          );

          // Stream the partial objects
          for await (const partialObject of stream) {
            const data = JSON.stringify({
              type: "partial",
              data: partialObject,
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }

          // Send completion message
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "complete" })}\n\n`)
          );

          controller.close();
        } catch (error) {
          // Send error message
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: errorMessage,
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    // Return SSE response
    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in generate-stream:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return Response.json(
      { error: `Failed to generate newsletter: ${errorMessage}` },
      { status: 500 }
    );
  }
}
