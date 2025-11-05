import { auth } from "@clerk/nextjs/server";
import { Crown } from "lucide-react";
import { PricingCards } from "@/components/dashboard/pricing-cards";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function PricingPage() {
  const { has } = await auth();

  const isPro = await has({ plan: "pro" });

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plans & Pricing</h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription and explore available plans
          </p>
        </div>
      </div>

      {/* Main Content: Subscription Management + Pricing Cards */}
      <div className="flex flex-col xl:flex-row gap-8 items-start">
        {/* Subscription Management Info */}
        <Card className="w-full xl:w-auto xl:flex-1">
          <CardHeader>
            <CardTitle>Subscription Management</CardTitle>
            <CardDescription>
              Manage your billing and subscription details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isPro
                ? "To manage your subscription, update payment methods, or cancel your plan, click on your current plan card or contact support."
                : "Upgrade to Pro to unlock unlimited RSS feeds, save your newsletter history, and access custom settings. Click on the Pro plan card to get started."}
            </p>
            {isPro && (
              <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                <Crown
                  className="h-5 w-5 mt-0.5 shrink-0"
                  style={{ color: "#6A47FB" }}
                />
                <div className="space-y-1">
                  <p className="font-medium">
                    Thank you for being a Pro member!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your support helps us continue to improve Newsletter AI and
                    provide the best experience possible.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing Cards Section */}
        <div className="w-full xl:w-auto xl:flex-1 space-y-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {isPro ? "Your Plan" : "Upgrade to Pro"}
            </h2>
            <p className="text-muted-foreground mt-1">
              {isPro
                ? "Manage your Pro subscription below"
                : "Choose a plan that works best for you"}
            </p>
          </div>

          <PricingCards />
        </div>
      </div>
    </div>
  );
}
