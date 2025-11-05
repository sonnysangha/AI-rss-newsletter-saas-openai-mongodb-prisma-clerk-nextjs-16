"use client";

import { formatDistanceToNow } from "date-fns";
import { Calendar, ChevronRight, FileText, Trash2 } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";
import { deleteNewsletterAction } from "@/actions/delete-newsletter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Newsletter {
  id: string;
  suggestedTitles: string[];
  suggestedSubjectLines: string[];
  body: string;
  topAnnouncements: string[];
  additionalInfo?: string | null;
  startDate: Date;
  endDate: Date;
  userInput?: string | null;
  feedsUsed: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface NewsletterHistoryListProps {
  newsletters: Newsletter[];
}

export function NewsletterHistoryList({
  newsletters,
}: NewsletterHistoryListProps) {
  const [isPending, startTransition] = React.useTransition();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleDelete = (
    e: React.MouseEvent,
    newsletterId: string,
    newsletterTitle: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = window.confirm(
      `Are you sure you want to delete "${newsletterTitle}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setDeletingId(newsletterId);

    startTransition(async () => {
      try {
        await deleteNewsletterAction(newsletterId);
        toast.success("Newsletter deleted successfully");
        setDeletingId(null);
      } catch (error) {
        console.error("Failed to delete newsletter:", error);
        toast.error("Failed to delete newsletter");
        setDeletingId(null);
      }
    });
  };

  if (newsletters.length === 0) {
    return (
      <Card className="transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">No Newsletters Yet</CardTitle>
          <CardDescription className="text-base">
            You haven't saved any newsletters yet. Generate and save your first
            newsletter to see it here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              Go to Dashboard to generate a newsletter →
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {newsletters.map((newsletter) => {
        const title = newsletter.suggestedTitles[0] || "Untitled Newsletter";
        const isDeleting = deletingId === newsletter.id || isPending;

        return (
          <Card
            key={newsletter.id}
            className="h-full hover:shadow-lg transition-all group relative border-2 hover:border-blue-600 dark:hover:border-blue-500"
          >
            <Link href={`/dashboard/history/${newsletter.id}`}>
              <div className="cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-2 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                        {title}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={(e) => handleDelete(e, newsletter.id, title)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDistanceToNow(new Date(newsletter.createdAt), {
                      addSuffix: true,
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Date Range */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge
                      variant="outline"
                      className="text-xs border-purple-600 text-purple-600"
                    >
                      {new Date(newsletter.startDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                        },
                      )}{" "}
                      -{" "}
                      {new Date(newsletter.endDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </Badge>
                  </div>

                  {/* Preview Text */}
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {newsletter.suggestedSubjectLines[0] ||
                      `${newsletter.body.substring(0, 100)}...`}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      <span>{newsletter.feedsUsed.length} feeds</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>
                        {newsletter.topAnnouncements.length} announcements
                      </span>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Link>
          </Card>
        );
      })}
    </div>
  );
}
