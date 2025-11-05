import { UserProfile } from "@clerk/nextjs";
import { User } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-950">
      <div className="container mx-auto py-12 px-6 lg:px-8 space-y-8">
        <PageHeader
          icon={User}
          title="Account Settings"
          description="Manage your account settings and profile information"
        />

        <UserProfile
          routing="hash"
          appearance={{
            elements: {
              rootBox: {
                width: "100%",
              },
              card: {
                boxShadow: "none",
                border: "1px solid hsl(var(--border))",
              },
            },
          }}
        />
      </div>
    </div>
  );
}
