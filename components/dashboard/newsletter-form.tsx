"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { DateRangePicker, type DateRange } from "./date-range-picker";
import {
  saveGeneratedNewsletter,
  type GeneratedNewsletter,
} from "@/actions/generate-newsletter";
import { NewsletterDisplay } from "./newsletter-display";

interface RssFeed {
  id: string;
  title: string | null;
  url: string;
}

interface NewsletterFormProps {
  feeds: RssFeed[];
}

export function NewsletterForm({ feeds }: NewsletterFormProps) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [userInput, setUserInput] = React.useState("");
  const [selectedFeeds, setSelectedFeeds] = React.useState<string[]>([]);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [newsletter, setNewsletter] =
    React.useState<GeneratedNewsletter | null>(null);

  // Initialize with all feeds selected
  React.useEffect(() => {
    setSelectedFeeds(feeds.map((f) => f.id));
  }, [feeds]);

  const allSelected = selectedFeeds.length === feeds.length;

  const handleSelectAll = () => setSelectedFeeds(feeds.map((f) => f.id));
  const handleDeselectAll = () => setSelectedFeeds([]);
  const handleToggleFeed = (feedId: string) => {
    setSelectedFeeds((prev) =>
      prev.includes(feedId)
        ? prev.filter((id) => id !== feedId)
        : [...prev, feedId],
    );
  };

  const handleGenerate = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Please select a date range");
      return;
    }

    if (selectedFeeds.length === 0) {
      toast.error("Please select at least one RSS feed");
      return;
    }

    try {
      setIsGenerating(true);
      setNewsletter(null);

      // Show generating toast
      toast.info(
        `Preparing ${selectedFeeds.length} feed${selectedFeeds.length > 1 ? "s" : ""}...`,
      );

      // Fetch streaming response
      const response = await fetch("/api/newsletter/generate-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedIds: selectedFeeds,
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString(),
          userInput: userInput.trim() || undefined,
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
      let articlesAnalyzed = 0;

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

              if (data.type === "metadata") {
                articlesAnalyzed = data.articlesAnalyzed;
                toast.info(`Analyzing ${articlesAnalyzed} articles...`);
              } else if (data.type === "partial") {
                // Update newsletter with partial data
                setNewsletter(data.data);
              } else if (data.type === "complete") {
                toast.success(
                  `Newsletter generated from ${articlesAnalyzed} articles!`,
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
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!newsletter || !dateRange?.from || !dateRange?.to) {
      return;
    }

    try {
      await saveGeneratedNewsletter({
        newsletter,
        feedIds: selectedFeeds,
        startDate: dateRange.from,
        endDate: dateRange.to,
        userInput: userInput.trim() || undefined,
      });

      toast.success("Newsletter saved to history!");
    } catch (error) {
      console.error("Failed to save newsletter:", error);
      toast.error("Failed to save newsletter");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Newsletter</CardTitle>
          <CardDescription>
            Select date range, feeds, and add context to generate your
            AI-powered newsletter
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Date Range</Label>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Select Feeds</Label>
              {!allSelected && (
                <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                  Select All
                </Button>
              )}
              {allSelected && (
                <Button variant="ghost" size="sm" onClick={handleDeselectAll}>
                  Deselect All
                </Button>
              )}
            </div>
            <div className="border rounded-lg p-4 space-y-3 max-h-60 overflow-y-auto">
              {feeds.map((feed) => (
                <div key={feed.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={feed.id}
                    checked={selectedFeeds.includes(feed.id)}
                    onCheckedChange={() => handleToggleFeed(feed.id)}
                  />
                  <Label
                    htmlFor={feed.id}
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {feed.title || feed.url}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedFeeds.length} of {feeds.length} feeds selected
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-input">
              Additional Context{" "}
              <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Textarea
              id="user-input"
              placeholder="Add any specific instructions, tone preferences, target audience details, or topics to focus on..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              rows={4}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || selectedFeeds.length === 0}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                Generating Newsletter...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Newsletter
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {newsletter && (
        <NewsletterDisplay newsletter={newsletter} onSave={handleSave} />
      )}
    </div>
  );
}
