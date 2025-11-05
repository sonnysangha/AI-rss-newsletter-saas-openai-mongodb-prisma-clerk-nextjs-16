"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  type GeneratedNewsletter,
  saveGeneratedNewsletter,
} from "@/actions/generate-newsletter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NewsletterDisplay } from "./newsletter-display";
import { NewsletterLoadingCard } from "./newsletter-loading-card";

/**
 * Newsletter schema for client-side streaming
 * Must match the server-side schema in the API route
 */
const newsletterSchema = z.object({
  suggestedTitles: z.array(z.string()).length(5),
  suggestedSubjectLines: z.array(z.string()).length(5),
  body: z.string(),
  topAnnouncements: z.array(z.string()).length(5),
  additionalInfo: z.string().optional(),
});

type NewsletterObject = z.infer<typeof newsletterSchema>;

/**
 * Newsletter Generation Page
 *
 * This component handles the full newsletter generation flow:
 * 1. Reads generation parameters from URL
 * 2. Prepares metadata and shows toast notifications
 * 3. Auto-starts generation using AI SDK's useObject hook
 * 4. Displays the streaming newsletter
 * 5. Allows saving for Pro users
 */
export function NewsletterGenerationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasStartedRef = React.useRef(false);
  const [articlesCount, setArticlesCount] = React.useState(0);

  // Parse generation parameters from URL query string
  const feedIds = searchParams.get("feedIds");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const userInput = searchParams.get("userInput");

  let params: {
    feedIds: string[];
    startDate: string;
    endDate: string;
    userInput?: string;
  } | null = null;

  if (feedIds && startDate && endDate) {
    try {
      params = {
        feedIds: JSON.parse(feedIds),
        startDate,
        endDate,
        userInput: userInput || undefined,
      };
    } catch {
      params = null;
    }
  }

  // Use AI SDK's useObject hook for streaming
  const { object, submit, isLoading } = useObject({
    api: "/api/newsletter/generate-stream",
    schema: newsletterSchema,
  });

  // Type assertion for the newsletter object
  const newsletter = object as Partial<NewsletterObject> | undefined;

  // Auto-start generation with pre-flight metadata check
  React.useEffect(() => {
    if (!params || hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;

    const startGeneration = async () => {
      try {
        // Get metadata for toast notifications
        const response = await fetch("/api/newsletter/prepare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });

        if (response.ok) {
          const data = await response.json();

          // Show toast for feed refresh if needed
          if (data.feedsToRefresh > 0) {
            toast.info(
              `Refreshing ${data.feedsToRefresh} feed${data.feedsToRefresh > 1 ? "s" : ""}...`,
            );
          }

          // Show toast for article analysis
          if (data.articlesFound > 0) {
            toast.info(
              `Analyzing ${data.articlesFound} article${data.articlesFound > 1 ? "s" : ""} from your feeds...`,
            );
            setArticlesCount(data.articlesFound);
          }
        }

        // Start AI generation
        submit(params);
      } catch (error) {
        console.error("Failed to prepare newsletter:", error);
        // Start generation anyway
        submit(params);
      }
    };

    startGeneration();
  }, [params, submit]);

  // Show success toast when generation completes
  React.useEffect(() => {
    if (!isLoading && newsletter?.body && articlesCount > 0) {
      toast.success(`Newsletter generated from ${articlesCount} articles!`);
    }
  }, [isLoading, newsletter?.body, articlesCount]);

  // Navigation guard - warn users before leaving during generation
  // This prevents accidental loss of work if they close the tab
  React.useEffect(() => {
    if (!isLoading) {
      return;
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isLoading]);

  /**
   * Saves the generated newsletter to database (Pro users only)
   */
  const handleSave = async () => {
    if (!newsletter || !params) {
      return;
    }

    try {
      await saveGeneratedNewsletter({
        newsletter: newsletter as GeneratedNewsletter,
        feedIds: params.feedIds,
        startDate: new Date(params.startDate),
        endDate: new Date(params.endDate),
        userInput: params.userInput,
      });

      toast.success("Newsletter saved to history!");
    } catch (error) {
      console.error("Failed to save newsletter:", error);
      toast.error("Failed to save newsletter");
    }
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  // If no params, show error
  if (!params) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-950">
        <div className="container mx-auto py-12 px-6 lg:px-8">
          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">
                Invalid Generation Request
              </CardTitle>
              <CardDescription className="text-base">
                Missing required parameters for newsletter generation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleBackToDashboard}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-950">
      <div className="container mx-auto py-12 px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDashboard}
              disabled={isLoading}
              className="hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="h-4 w-px bg-border" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Newsletter Generation
              </h1>
            </div>
          </div>
          {isLoading && (
            <div className="flex items-center gap-2 text-base">
              <div className="inline-flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-purple-600 text-white animate-pulse">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-medium">Generating newsletter...</span>
            </div>
          )}
        </div>

        {/* Show loading card while generating */}
        {isLoading && !newsletter?.body && (
          <div className="transition-opacity duration-300 ease-in-out">
            <NewsletterLoadingCard />
          </div>
        )}

        {/* Newsletter display with smooth transition */}
        {newsletter?.body && (
          <div className="transition-opacity duration-500 ease-in-out animate-in fade-in">
            <NewsletterDisplay
              newsletter={newsletter}
              onSave={handleSave}
              isGenerating={isLoading}
            />
          </div>
        )}

        {/* If generation hasn't started yet */}
        {!isLoading && !newsletter?.body && (
          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Preparing to Generate</CardTitle>
              <CardDescription className="text-base">
                Setting up newsletter generation...
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
