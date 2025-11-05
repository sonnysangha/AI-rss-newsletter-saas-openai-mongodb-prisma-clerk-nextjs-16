import { auth } from "@clerk/nextjs/server";
import { getRssFeedsByUserId } from "@/actions/rss-feed";
import { upsertUserFromClerk } from "@/actions/user";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NewsletterForm } from "./newsletter-form";

export async function NewsletterGenerator() {
  const { userId } = await auth();
  const user = await upsertUserFromClerk(userId!);
  const feeds = await getRssFeedsByUserId(user.id);

  if (feeds.length === 0) {
    return (
      <Card className="transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Generate Newsletter</CardTitle>
          <CardDescription className="text-base">
            Add RSS feeds first to generate newsletters
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <NewsletterForm
      feeds={feeds.map((f) => ({
        id: f.id,
        title: f.title,
        url: f.url,
      }))}
    />
  );
}
