import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface NewsletterLoadingCardProps {
  phase: "refreshing" | "analyzing" | "generating";
  feedCount?: number;
  articlesAnalyzed?: number;
}

/**
 * Displays loading state during newsletter generation phases
 */
export function NewsletterLoadingCard({
  phase,
  feedCount,
  articlesAnalyzed,
}: NewsletterLoadingCardProps) {
  const getPhaseMessage = () => {
    switch (phase) {
      case "refreshing":
        return feedCount
          ? `Refreshing ${feedCount} feed${feedCount > 1 ? "s" : ""}...`
          : "Refreshing feeds...";
      case "analyzing":
        return articlesAnalyzed
          ? `Analyzing ${articlesAnalyzed} article${articlesAnalyzed > 1 ? "s" : ""}...`
          : "Analyzing articles...";
      case "generating":
        return articlesAnalyzed
          ? `Generating newsletter from ${articlesAnalyzed} article${articlesAnalyzed > 1 ? "s" : ""}...`
          : "Generating newsletter...";
      default:
        return "Preparing newsletter...";
    }
  };

  const getPhaseDescription = () => {
    switch (phase) {
      case "refreshing":
        return "Fetching the latest articles from your RSS feeds";
      case "analyzing":
        return "Processing articles and preparing content";
      case "generating":
        return "AI is crafting your personalized newsletter";
      default:
        return "Please wait while we prepare your content";
    }
  };

  return (
    <Card className="transition-all hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          {getPhaseMessage()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{getPhaseDescription()}</p>
      </CardContent>
    </Card>
  );
}

