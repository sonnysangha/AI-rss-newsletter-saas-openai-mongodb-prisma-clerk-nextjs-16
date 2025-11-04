"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { NewsletterDisplay } from "./newsletter-display";
import { NewsletterLoadingCard } from "./newsletter-loading-card";
import {
  saveGeneratedNewsletter,
  type GeneratedNewsletter,
} from "@/actions/generate-newsletter";

interface GenerationParams {
  feedIds: string[];
  startDate: string;
  endDate: string;
  userInput?: string;
}

type LoadingPhase =
  | "idle"
  | "refreshing"
  | "analyzing"
  | "generating"
  | "complete";

export function NewsletterGenerationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [loadingPhase, setLoadingPhase] = React.useState<LoadingPhase>("idle");
  const [newsletter, setNewsletter] =
    React.useState<Partial<GeneratedNewsletter> | null>(null);
  const [articlesAnalyzed, setArticlesAnalyzed] = React.useState(0);
  const [feedCount, setFeedCount] = React.useState(0);
  const hasStartedRef = React.useRef(false);

  // Parse generation params from URL search params
  const params = React.useMemo<GenerationParams | null>(() => {
    const feedIds = searchParams.get("feedIds");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const userInput = searchParams.get("userInput");

    if (!feedIds || !startDate || !endDate) {
      return null;
    }

    try {
      return {
        feedIds: JSON.parse(feedIds),
        startDate,
        endDate,
        userInput: userInput || undefined,
      };
    } catch {
      return null;
    }
  }, [searchParams]);

  const handleGenerate = React.useCallback(
    async (generationParams: GenerationParams) => {
      try {
        setIsGenerating(true);
        setNewsletter(null);
        setArticlesAnalyzed(0);
        setFeedCount(0);
        setLoadingPhase("idle");

        // Fetch streaming response
        const response = await fetch("/api/newsletter/generate-stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            feedIds: generationParams.feedIds,
            startDate: generationParams.startDate,
            endDate: generationParams.endDate,
            userInput: generationParams.userInput,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to generate newsletter");
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        // Read the stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let localArticlesAnalyzed = 0;

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          // Decode the chunk
          const chunk = decoder.decode(value, { stream: true });

          // Parse SSE messages (format: "data: {json}\n\n")
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.type === "refreshing") {
                  setLoadingPhase("refreshing");
                  setFeedCount(data.feedCount);
                } else if (data.type === "analyzing") {
                  setLoadingPhase("analyzing");
                  setFeedCount(data.feedCount);
                } else if (data.type === "metadata") {
                  localArticlesAnalyzed = data.articlesAnalyzed;
                  setArticlesAnalyzed(localArticlesAnalyzed);
                  setLoadingPhase("generating");
                } else if (data.type === "partial") {
                  // Update newsletter with partial data
                  setNewsletter(data.data);
                  setLoadingPhase("generating");
                } else if (data.type === "complete") {
                  setLoadingPhase("complete");
                  toast.success(
                    `Newsletter generated from ${localArticlesAnalyzed} articles!`,
                  );
                } else if (data.type === "error") {
                  throw new Error(data.error);
                }
              } catch (parseError) {
                // Skip malformed JSON (could be incomplete chunks)
                console.warn("Failed to parse SSE chunk:", parseError);
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to generate newsletter:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to generate newsletter",
        );
        setNewsletter(null);
        setLoadingPhase("idle");
      } finally {
        setIsGenerating(false);
      }
    },
    [],
  );

  // Start generation automatically when component mounts
  React.useEffect(() => {
    if (!params || hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;
    handleGenerate(params);
  }, [params, handleGenerate]);

  // Navigation guard - warn before leaving during generation
  React.useEffect(() => {
    if (!isGenerating) {
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
  }, [isGenerating]);

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
              disabled={isGenerating}
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
          {isGenerating && (
            <div className="flex items-center gap-2 text-base">
              <div className="inline-flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-purple-600 text-white animate-pulse">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-medium">
                Generating
                {articlesAnalyzed > 0 && ` (${articlesAnalyzed} articles)`}
              </span>
            </div>
          )}
        </div>

        {/* Show loading card during preparation phases */}
        {isGenerating &&
          !newsletter &&
          (loadingPhase === "refreshing" ||
            loadingPhase === "analyzing" ||
            loadingPhase === "generating") && (
            <div className="transition-opacity duration-300 ease-in-out">
              <NewsletterLoadingCard
                phase={loadingPhase}
                feedCount={feedCount}
                articlesAnalyzed={articlesAnalyzed}
              />
            </div>
          )}

        {/* Newsletter display with smooth transition */}
        {newsletter && (
          <div className="transition-opacity duration-500 ease-in-out animate-in fade-in">
            <NewsletterDisplay
              newsletter={newsletter}
              onSave={handleSave}
              isGenerating={isGenerating}
            />
          </div>
        )}

        {/* If generation hasn't started yet */}
        {!isGenerating && !newsletter && loadingPhase === "idle" && (
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
