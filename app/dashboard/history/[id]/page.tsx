import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { getNewsletterById } from "@/actions/newsletter";
import { upsertUserFromClerk } from "@/actions/user";
import { NewsletterHistoryView } from "@/components/dashboard/newsletter-history-view";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function NewsletterDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { userId, has } = await auth();

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-950">
        <div className="container mx-auto py-12 px-6 lg:px-8">
          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">
                Authentication Required
              </CardTitle>
              <CardDescription className="text-base">
                Please sign in to view this newsletter.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  const isPro = await has({ plan: "pro" });

  if (!isPro) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-950">
        <div className="container mx-auto py-12 px-6 lg:px-8">
          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Pro Plan Required</CardTitle>
              <CardDescription className="text-base">
                Upgrade to Pro to access your newsletter history.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  const user = await upsertUserFromClerk(userId);
  const newsletter = await getNewsletterById(id, user.id);

  if (!newsletter) {
    notFound();
  }

  return <NewsletterHistoryView newsletter={newsletter} />;
}
