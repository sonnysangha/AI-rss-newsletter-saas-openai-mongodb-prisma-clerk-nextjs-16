import { auth } from "@clerk/nextjs/server";
import { Crown, History as HistoryIcon } from "lucide-react";
import { getNewslettersByUserId } from "@/actions/newsletter";
import { upsertUserFromClerk } from "@/actions/user";
import { NewsletterHistoryList } from "@/components/dashboard/newsletter-history-list";
import { PageHeader } from "@/components/dashboard/page-header";
import { PricingCards } from "@/components/dashboard/pricing-cards";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function HistoryPage() {
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
                Please sign in to view your newsletter history.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  const isPro = await has({ plan: "pro" });
  const user = await upsertUserFromClerk(userId);
  const newsletters = isPro ? await getNewslettersByUserId(user.id) : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-950">
      <div className="container mx-auto py-12 px-6 lg:px-8 space-y-12">
        {/* Header */}
        <PageHeader
          icon={HistoryIcon}
          title="Newsletter History"
          description="View and manage your saved newsletters"
        />

        {/* Free User Upgrade Prompt */}
        {!isPro && (
          <Card className="border-2 border-blue-600 dark:border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="inline-flex size-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                  <Crown className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Upgrade to Pro
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    Save and access your newsletter history with a Pro plan
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="space-y-4 flex-1">
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  Pro users can save unlimited newsletters and access them
                  anytime from their history, including:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="inline-flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-purple-600 text-white shrink-0 mt-0.5">
                      <HistoryIcon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-foreground font-medium">
                      Unlimited newsletter storage and history access
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="inline-flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-purple-600 text-white shrink-0 mt-0.5">
                      <HistoryIcon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-foreground font-medium">
                      Search and filter through past newsletters
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="inline-flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-purple-600 text-white shrink-0 mt-0.5">
                      <HistoryIcon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-foreground font-medium">
                      Export and reuse successful newsletter templates
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="inline-flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-purple-600 text-white shrink-0 mt-0.5">
                      <HistoryIcon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-foreground font-medium">
                      Never lose a great newsletter again
                    </span>
                  </li>
                </ul>
              </div>

              {/* Pricing Cards */}
              <div className="w-full lg:w-auto lg:flex-1">
                <PricingCards compact />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Newsletter List */}
        {isPro && <NewsletterHistoryList newsletters={newsletters} />}
      </div>
    </div>
  );
}
