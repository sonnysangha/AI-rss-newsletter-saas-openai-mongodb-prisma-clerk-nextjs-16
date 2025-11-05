"use client";

import { useAuth } from "@clerk/nextjs";
import { Crown, Sparkles } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Badge } from "@/components/ui/badge";

export function PlanBadge() {
  const { has } = useAuth();
  const [isPro, setIsPro] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkPlan = async () => {
      if (has) {
        const proStatus = await has({ plan: "pro" });
        setIsPro(proStatus);
      }
    };
    checkPlan();
  }, [has]);

  if (isPro === null) {
    return null;
  }

  return (
    <Link href="/dashboard/pricing">
      {isPro ? (
        <Badge className="gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 transition-all cursor-pointer">
          <Crown className="h-3.5 w-3.5" />
          <span className="font-semibold">Pro</span>
        </Badge>
      ) : (
        <Badge
          variant="secondary"
          className="gap-1.5 px-3 py-1.5 hover:bg-secondary/80 transition-all cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="font-semibold">Starter</span>
        </Badge>
      )}
    </Link>
  );
}
