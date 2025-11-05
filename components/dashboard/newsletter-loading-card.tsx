import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Displays a simple loading state during newsletter generation
 */
export function NewsletterLoadingCard() {
  return (
    <Card className="transition-all hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          Generating your newsletter...
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          AI is crafting your personalized newsletter. This may take a minute.
        </p>
      </CardContent>
    </Card>
  );
}
