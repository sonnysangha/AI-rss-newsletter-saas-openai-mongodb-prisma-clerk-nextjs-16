import { Check, X } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const plans = [
  {
    name: "Starter",
    price: "$9",
    priceSubtext: "/month",
    description: "Perfect for getting started",
    badge: null,
    features: [
      { text: "Up to 3 RSS feeds", included: true },
      { text: "Generate unlimited newsletters", included: true },
      { text: "5 title suggestions", included: true },
      { text: "5 subject line suggestions", included: true },
      { text: "Full newsletter body", included: true },
      { text: "Top 5 announcements", included: true },
      { text: "Newsletter history", included: false },
      { text: "Unlimited RSS feeds", included: false },
    ],
    cta: "Get Started",
    href: "/sign-up?plan=starter",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    priceSubtext: "/month",
    description: "For serious newsletter creators",
    badge: "Most Popular",
    features: [
      { text: "Unlimited RSS feeds", included: true },
      { text: "Everything in Starter", included: true },
      { text: "Save newsletter history", included: true },
      { text: "Access past newsletters anytime", included: true },
      { text: "Priority support", included: true },
      { text: "AI chat feature", included: true, comingSoon: true },
    ],
    cta: "Get Pro",
    href: "/sign-up?plan=pro",
    popular: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 sm:py-32 bg-white dark:bg-black">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Choose the plan that works best for you. Cancel or upgrade anytime.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${
                plan.popular
                  ? "border-2 border-blue-600 shadow-xl scale-105"
                  : "border-gray-200 dark:border-gray-800"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-linear-to-r from-blue-600 to-purple-600 text-white">
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  {plan.priceSubtext && (
                    <span className="text-lg text-gray-600 dark:text-gray-400">
                      {plan.priceSubtext}
                    </span>
                  )}
                </div>
                <CardDescription className="mt-2 text-base">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="size-5 shrink-0 text-green-600" />
                      ) : (
                        <X className="size-5 shrink-0 text-gray-400" />
                      )}
                      <span
                        className={`text-sm ${
                          feature.included
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-500 dark:text-gray-500"
                        }`}
                      >
                        {feature.text}
                        {"comingSoon" in feature && feature.comingSoon && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Coming Soon
                          </Badge>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  asChild
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-500">
          All plans include unlimited newsletter generation. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
