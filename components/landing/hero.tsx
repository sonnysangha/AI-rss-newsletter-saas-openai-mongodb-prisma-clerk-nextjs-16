import { ArrowDown, ArrowRight, Rss, Sparkles } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-white to-gray-50 dark:from-black dark:to-gray-950 py-20 sm:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 ">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <Badge variant="secondary" className="mb-6 px-4 py-1.5">
            <Sparkles className="mr-2 size-4" />
            AI-Powered Newsletter Creation
          </Badge>

          {/* Headline */}
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl">
            Generate Professional Newsletters in{" "}
            <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Minutes, Not Hours
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400 sm:text-xl">
            Stop spending hours curating content. Let AI transform your RSS
            feeds into engaging newsletters with perfect titles, subject lines,
            and content.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/sign-up">
                Get Started <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Link href="#pricing">View Pricing</Link>
            </Button>
          </div>

          {/* Social Proof */}
          <p className="mt-8 text-sm text-gray-500 dark:text-gray-500">
            Join 1,000+ newsletter creators saving 5+ hours every week ·
            Starting at $9/month
          </p>
        </div>

        {/* Hero visual - RSS Feeds → Newsletter Transformation */}
        <div className="relative mx-auto mt-16 max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            {/* Left side - RSS Feed Orbs */}
            <div className="relative shrink-0 w-full lg:w-auto">
              <div className="grid grid-cols-3 gap-2 lg:gap-6 max-w-xs mx-auto lg:max-w-none">
                {/* RSS Feed Orb 1 */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative size-16 lg:size-24 rounded-full bg-linear-to-br from-blue-500 to-blue-600 shadow-lg flex items-center justify-center animate-pulse">
                    <Rss className="size-6 lg:size-10 text-white" />
                  </div>
                  <span className="text-[10px] lg:text-xs text-gray-500 dark:text-gray-400">
                    Feed 1
                  </span>
                </div>

                {/* RSS Feed Orb 2 */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="relative size-16 lg:size-24 rounded-full bg-linear-to-br from-purple-500 to-purple-600 shadow-lg flex items-center justify-center animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  >
                    <Rss className="size-6 lg:size-10 text-white" />
                  </div>
                  <span className="text-[10px] lg:text-xs text-gray-500 dark:text-gray-400">
                    Feed 2
                  </span>
                </div>

                {/* RSS Feed Orb 3 */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="relative size-16 lg:size-24 rounded-full bg-linear-to-br from-indigo-500 to-indigo-600 shadow-lg flex items-center justify-center animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  >
                    <Rss className="size-6 lg:size-10 text-white" />
                  </div>
                  <span className="text-[10px] lg:text-xs text-gray-500 dark:text-gray-400">
                    Feed 3
                  </span>
                </div>
              </div>
            </div>

            {/* Middle - Arrows & AI Badge */}
            <div className="flex flex-col items-center gap-4 my-6 lg:my-0">
              {/* Mobile: Vertical arrows pointing down */}
              <div className="flex flex-col items-center gap-2 lg:hidden">
                <ArrowDown className="size-6 text-blue-600 dark:text-blue-400 animate-bounce" />
              </div>

              {/* Desktop: Horizontal arrows pointing right */}
              <div className="hidden lg:flex lg:flex-col items-center gap-2">
                <ArrowRight className="size-10 text-blue-600 dark:text-blue-400 animate-pulse" />
                <ArrowRight
                  className="size-10 text-purple-600 dark:text-purple-400 animate-pulse"
                  style={{ animationDelay: "0.3s" }}
                />
                <ArrowRight
                  className="size-10 text-indigo-600 dark:text-indigo-400 animate-pulse"
                  style={{ animationDelay: "0.6s" }}
                />
              </div>

              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-blue-600 to-purple-600 shadow-lg">
                <Sparkles className="size-4 text-white" />
                <span className="text-xs font-semibold text-white">
                  AI Processing
                </span>
              </div>
            </div>

            {/* Right side - Consolidated Newsletter */}
            <div className="flex-1 w-full">
              <div className="rounded-xl border-2 border-blue-600 dark:border-blue-500 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
                {/* Newsletter header */}
                <div className="bg-linear-to-r from-blue-600 to-purple-600 px-6 py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="size-4 text-white" />
                    <span className="text-xs font-medium text-white/80">
                      Your Newsletter
                    </span>
                  </div>
                  <div className="h-4 w-3/4 rounded bg-white/90 mb-2" />
                  <div className="h-3 w-1/2 rounded bg-white/70" />
                </div>

                {/* Newsletter content */}
                <div className="p-6 space-y-4">
                  {/* Titles */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="size-1.5 rounded-full bg-blue-600" />
                      <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        5 Titles
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2 w-full rounded bg-gray-200 dark:bg-gray-800" />
                      <div className="h-2 w-5/6 rounded bg-gray-200 dark:bg-gray-800" />
                    </div>
                  </div>

                  {/* Body */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="size-1.5 rounded-full bg-purple-600" />
                      <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Full Body
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2 w-full rounded bg-gray-200 dark:bg-gray-800" />
                      <div className="h-2 w-full rounded bg-gray-200 dark:bg-gray-800" />
                      <div className="h-2 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
                    </div>
                  </div>

                  {/* Top 5 */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded border border-gray-200 dark:border-gray-800 p-2 bg-blue-50 dark:bg-blue-950/30">
                      <div className="h-2 w-3/4 rounded bg-blue-300/50 dark:bg-blue-700/50" />
                    </div>
                    <div className="rounded border border-gray-200 dark:border-gray-800 p-2 bg-purple-50 dark:bg-purple-950/30">
                      <div className="h-2 w-3/4 rounded bg-purple-300/50 dark:bg-purple-700/50" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
