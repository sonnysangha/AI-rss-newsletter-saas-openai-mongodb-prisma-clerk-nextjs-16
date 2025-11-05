"use client";

import { ArrowLeft, Calendar, Clock, FileText, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { deleteNewsletterAction } from "@/actions/delete-newsletter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NewsletterDisplay } from "./newsletter-display";

interface Newsletter {
  id: string;
  userId: string;
  suggestedTitles: string[];
  suggestedSubjectLines: string[];
  body: string;
  topAnnouncements: string[];
  additionalInfo: string | null;
  startDate: Date;
  endDate: Date;
  userInput: string | null;
  feedsUsed: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface NewsletterHistoryViewProps {
  newsletter: Newsletter;
}

export function NewsletterHistoryView({
  newsletter,
}: NewsletterHistoryViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const handleBackToHistory = () => {
    router.push("/dashboard/history");
  };

  const handleDelete = () => {
    const title = newsletter.suggestedTitles[0] || "this newsletter";
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    startTransition(async () => {
      try {
        await deleteNewsletterAction(newsletter.id);
        toast.success("Newsletter deleted successfully");
        router.push("/dashboard/history");
      } catch (error) {
        console.error("Failed to delete newsletter:", error);
        toast.error("Failed to delete newsletter");
      }
    });
  };

  // No-op save function since newsletter is already saved
  const handleSave = async () => {
    // Newsletter is already saved, this is just for component compatibility
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-950">
      <div className="container mx-auto py-12 px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToHistory}
              className="hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to History
            </Button>
            <div className="h-4 w-px bg-border" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Newsletter
              </h1>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
            className="hover:bg-destructive/90 transition-all"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>

        {/* Metadata Card */}
        <Card className="transition-all hover:shadow-lg border-2 border-blue-600/20 dark:border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-xl">Newsletter Information</CardTitle>
            <CardDescription className="text-base">
              Generated on{" "}
              {new Date(newsletter.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="flex items-start gap-3">
                <div className="inline-flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-purple-600 text-white shrink-0 mt-0.5">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-base">Date Range</p>
                  <p className="text-muted-foreground">
                    {new Date(newsletter.startDate).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}{" "}
                    -{" "}
                    {new Date(newsletter.endDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="inline-flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-purple-600 text-white shrink-0 mt-0.5">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-base">Feeds Used</p>
                  <p className="text-muted-foreground">
                    {newsletter.feedsUsed.length} RSS feed
                    {newsletter.feedsUsed.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {newsletter.userInput && (
                <div className="flex items-start gap-3">
                  <div className="inline-flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-purple-600 text-white shrink-0 mt-0.5">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-base">Custom Context</p>
                    <p className="text-muted-foreground line-clamp-2">
                      {newsletter.userInput}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Newsletter Display (without save button) */}
        <NewsletterDisplay
          newsletter={{
            suggestedTitles: newsletter.suggestedTitles,
            suggestedSubjectLines: newsletter.suggestedSubjectLines,
            body: newsletter.body,
            topAnnouncements: newsletter.topAnnouncements,
            additionalInfo: newsletter.additionalInfo ?? undefined,
          }}
          onSave={handleSave}
          isGenerating={false}
          hideSaveButton={true}
        />
      </div>
    </div>
  );
}
