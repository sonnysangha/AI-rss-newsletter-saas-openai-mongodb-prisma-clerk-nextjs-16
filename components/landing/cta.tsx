import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-blue-600 to-purple-600 py-24 sm:py-32">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-size-[24px_24px]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Ready to Save Hours Every Week?
          </h2>
          <p className="mt-6 text-lg leading-8 text-blue-100">
            Join thousands of newsletter creators who are already using AI to
            streamline their content creation. Plans starting at just $9/month.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100"
            >
              <Link href="/sign-up">
                Get Started <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-white text-white hover:bg-white/10"
            >
              <Link href="#pricing">View Pricing</Link>
            </Button>
          </div>

          {/* Trust signals */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-white">
            <div className="flex items-center justify-center gap-2">
              <Check className="size-5 text-green-300" />
              <span className="text-sm">Starting at $9/month</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Check className="size-5 text-green-300" />
              <span className="text-sm">Cancel anytime</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Check className="size-5 text-green-300" />
              <span className="text-sm">No setup fees</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
