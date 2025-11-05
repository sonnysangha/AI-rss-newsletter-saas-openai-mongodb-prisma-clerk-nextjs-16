import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function CTAButtons() {
  const { has, userId } = await auth();
  const hasPaidPlan =
    (await has({ plan: "pro" })) || (await has({ plan: "starter" }));

  return (
    <>
      {/* Signed out users */}
      <SignedOut>
        <SignInButton mode="modal" forceRedirectUrl="/#pricing">
          <Button size="lg" className="w-full sm:w-auto">
            Get Started <ArrowRight className="ml-2 size-4" />
          </Button>
        </SignInButton>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="w-full sm:w-auto"
        >
          <Link href="#pricing">View Pricing</Link>
        </Button>
      </SignedOut>

      {/* Signed in users with a plan */}
      {userId && hasPaidPlan && (
        <SignedIn>
          <Button size="lg" className="w-full sm:w-auto" asChild>
            <Link
              href="/dashboard"
              className="flex items-center justify-center"
            >
              Go to Dashboard <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </SignedIn>
      )}

      {/* Signed in users without a plan */}
      {userId && !hasPaidPlan && (
        <SignedIn>
          <Button size="lg" className="w-full sm:w-auto" asChild>
            <Link href="/#pricing" className="flex items-center justify-center">
              Choose a Plan <ArrowRight className="ml-2 size-4" />
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
        </SignedIn>
      )}
    </>
  );
}

export default CTAButtons;
