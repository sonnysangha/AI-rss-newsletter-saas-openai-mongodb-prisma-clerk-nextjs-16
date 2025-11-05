"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteRssFeed } from "@/actions/rss-feed";
import { Button } from "@/components/ui/button";

interface DeleteFeedButtonProps {
  feedId: string;
  feedTitle: string;
}

export function DeleteFeedButton({ feedId, feedTitle }: DeleteFeedButtonProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${feedTitle}"? This will also delete all associated articles.`,
      )
    ) {
      return;
    }

    try {
      await deleteRssFeed(feedId);
      toast.success("Feed deleted successfully");
      router.refresh(); // Refresh server component
    } catch (error) {
      console.error("Failed to delete feed:", error);
      toast.error("Failed to delete feed");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      className="text-destructive hover:text-destructive hover:bg-destructive/10"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
