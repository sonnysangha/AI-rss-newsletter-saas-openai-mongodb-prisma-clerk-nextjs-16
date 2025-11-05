"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type DateRange, DateRangePicker } from "./date-range-picker";

interface RssFeed {
  id: string;
  title: string | null;
  url: string;
}

interface NewsletterFormProps {
  feeds: RssFeed[];
}

export function NewsletterForm({ feeds }: NewsletterFormProps) {
  const router = useRouter();
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [userInput, setUserInput] = React.useState("");
  const [selectedFeeds, setSelectedFeeds] = React.useState<string[]>([]);

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

  const handleGenerate = () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Please select a date range");
      return;
    }

    if (selectedFeeds.length === 0) {
      toast.error("Please select at least one RSS feed");
      return;
    }

    // Navigate to generation page with parameters
    const params = new URLSearchParams({
      feedIds: JSON.stringify(selectedFeeds),
      startDate: dateRange.from.toISOString(),
      endDate: dateRange.to.toISOString(),
    });

    if (userInput.trim()) {
      params.append("userInput", userInput.trim());
    }

    router.push(`/dashboard/generate?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <Card className="transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Generate Newsletter</CardTitle>
          <CardDescription className="text-base">
            Select date range, feeds, and add context to generate your
            AI-powered newsletter
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-base font-semibold">Date Range</Label>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Select Feeds</Label>
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
            <Label htmlFor="user-input" className="text-base font-semibold">
              Additional Context{" "}
              <span className="text-muted-foreground font-normal">
                (Optional)
              </span>
            </Label>
            <Textarea
              id="user-input"
              placeholder="Add any specific instructions, tone preferences, target audience details, or topics to focus on... (e.g., 'Include issue number 99', 'Focus on security topics', 'Keep it casual')"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Your instructions will be prioritized and incorporated into the
              newsletter. Default settings from the Settings page will also be
              applied.
            </p>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={selectedFeeds.length === 0}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            size="lg"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Newsletter
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
