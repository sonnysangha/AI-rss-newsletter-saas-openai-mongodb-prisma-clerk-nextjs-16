import { Sparkles } from "lucide-react";
import { NewsletterGenerator } from "@/components/dashboard/newsletter-generator";
import { PageHeader } from "@/components/dashboard/page-header";
import { RssFeedManager } from "@/components/dashboard/rss-feed-manager";

async function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-950">
      <div className="container mx-auto py-12 px-6 lg:px-8 space-y-12">
        {/* Page Header */}
        <PageHeader
          icon={Sparkles}
          title="Dashboard"
          description="Manage your RSS feeds and generate AI-powered newsletters"
        />

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - RSS Feed Manager */}
          <div>
            <RssFeedManager />
          </div>

          {/* Right Column - Newsletter Generator */}
          <div>
            <NewsletterGenerator />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
