import { Calendar, Rss, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const steps = [
  {
    number: "01",
    icon: Rss,
    title: "Connect Your RSS Feeds",
    description:
      "Add up to 3 RSS feeds on Starter ($9/month), or unlimited with Pro ($19/month). We'll automatically fetch and organize content from all your sources.",
  },
  {
    number: "02",
    icon: Calendar,
    title: "Choose Timeframe & Add Context",
    description:
      "Select your newsletter timeframe (weekly, monthly, or custom dates) and add any personal context or notes for the AI.",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Get AI-Generated Content",
    description:
      "Instantly receive 5 title options, 5 subject lines, a complete newsletter body, and top 5 announcements. Copy and paste into any email platform.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-24 sm:py-32 bg-gray-50 dark:bg-gray-950"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            Simple Process
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Create professional newsletters in three simple steps
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative">
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-12 left-1/2 hidden h-0.5 w-full bg-linear-to-r from-blue-600 to-purple-600 lg:block" />
                  )}

                  <div className="relative flex flex-col items-center text-center">
                    {/* Number badge */}
                    <div className="mb-4 flex size-24 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-purple-600 text-2xl font-bold text-white shadow-lg">
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className="mb-4 flex size-16 items-center justify-center rounded-lg bg-white dark:bg-gray-900 shadow-md border border-gray-200 dark:border-gray-800">
                      <Icon className="size-8 text-blue-600" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
