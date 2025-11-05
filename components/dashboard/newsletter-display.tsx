"use client";

import { useAuth } from "@clerk/nextjs";
import { Check, Copy, Download, Save } from "lucide-react";
import * as React from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import type { GeneratedNewsletter } from "@/actions/generate-newsletter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface NewsletterDisplayProps {
  newsletter: Partial<GeneratedNewsletter>;
  onSave: () => Promise<void>;
  isGenerating?: boolean;
  hideSaveButton?: boolean;
}

export function NewsletterDisplay({
  newsletter,
  onSave,
  isGenerating = false,
  hideSaveButton = false,
}: NewsletterDisplayProps) {
  const { has } = useAuth();
  const [isPro, setIsPro] = React.useState(false);

  React.useEffect(() => {
    const checkPlan = async () => {
      if (has) {
        const proStatus = await has({ plan: "pro" });
        setIsPro(proStatus);
      }
    };
    checkPlan();
  }, [has]);
  const [copiedSection, setCopiedSection] = React.useState<string | null>(null);

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedSection(null), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const downloadNewsletter = () => {
    const formatSection = (title: string, items: string[]) =>
      `${title}:\n${items.map((item, i) => `${i + 1}. ${item}`).join("\n")}`;

    const sections = [
      "NEWSLETTER",
      "",
      formatSection("TITLE OPTIONS", newsletter.suggestedTitles ?? []),
      "",
      formatSection(
        "SUBJECT LINE OPTIONS",
        newsletter.suggestedSubjectLines ?? [],
      ),
      "",
      "NEWSLETTER BODY:",
      newsletter.body ?? "",
      "",
      formatSection("TOP 5 ANNOUNCEMENTS", newsletter.topAnnouncements ?? []),
    ];

    if (newsletter.additionalInfo) {
      sections.push("", "ADDITIONAL INFORMATION:", newsletter.additionalInfo);
    }

    const content = sections.join("\n").trim();
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `newsletter-${new Date().toISOString().split("T")[0]}.txt`;
    link.click();

    URL.revokeObjectURL(url);
    toast.success("Newsletter downloaded!");
  };

  return (
    <Card className="transition-all hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Generated Newsletter</CardTitle>
            <CardDescription className="text-base">
              Copy sections individually or download the full newsletter
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {isPro && !hideSaveButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSave}
                disabled={isGenerating}
                className="hover:bg-blue-50 dark:hover:bg-blue-950 transition-all"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={downloadNewsletter}
              disabled={isGenerating}
              className="hover:bg-purple-50 dark:hover:bg-purple-950 transition-all"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Single unified responsive grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[300px_1fr_300px] gap-6">
          {/* Title Options */}
          <div className="xl:row-start-1">
            <NewsletterSection
              title="Newsletter Title Options"
              items={newsletter.suggestedTitles ?? []}
              onCopy={(text) => copyToClipboard(text, "titles")}
              isCopied={copiedSection === "titles"}
              isGenerating={isGenerating}
              compact
            />
          </div>

          {/* Subject Line Options */}
          <div className="xl:col-start-1 xl:row-start-2">
            <NewsletterSection
              title="Email Subject Line Options"
              items={newsletter.suggestedSubjectLines ?? []}
              onCopy={(text) => copyToClipboard(text, "subjects")}
              isCopied={copiedSection === "subjects"}
              isGenerating={isGenerating}
              compact
            />
          </div>

          {/* Top 5 Announcements */}
          <div className="md:col-span-2 xl:col-span-1 xl:col-start-3 xl:row-start-1">
            <NewsletterSection
              title="Top 5 Announcements"
              items={newsletter.topAnnouncements ?? []}
              onCopy={(text) => copyToClipboard(text, "announcements")}
              isCopied={copiedSection === "announcements"}
              isGenerating={isGenerating}
              compact
            />
          </div>

          {/* Newsletter Body */}
          <div className="space-y-3 md:col-span-2 xl:col-span-1 xl:col-start-2 xl:row-start-1 xl:row-span-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Label className="text-lg font-bold">Newsletter Body</Label>
                {newsletter.body && (
                  <Badge
                    variant="outline"
                    className="text-xs border-purple-600 text-purple-600"
                  >
                    {newsletter.body.split(/\s+/).filter(Boolean).length} words
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  newsletter.body && copyToClipboard(newsletter.body, "body")
                }
                disabled={!newsletter.body}
                className="hover:bg-accent transition-all"
              >
                {copiedSection === "body" ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="border rounded-lg p-6 prose prose-sm max-w-none dark:prose-invert min-h-[400px]">
              {newsletter.body ? (
                <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                  <ReactMarkdown>{newsletter.body}</ReactMarkdown>
                </div>
              ) : (
                <div className="space-y-3">
                  <span className="text-muted-foreground italic">
                    {isGenerating
                      ? "Generating newsletter body..."
                      : "No newsletter body available"}
                  </span>
                  {isGenerating && (
                    <div className="space-y-3">
                      <div className="h-4 bg-muted animate-pulse rounded" />
                      <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
                      <div className="h-4 bg-muted animate-pulse rounded w-4/5" />
                      <div className="h-4 bg-muted animate-pulse rounded w-full" />
                      <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info - Full Width Below */}
        {newsletter.additionalInfo && (
          <div className="space-y-3 mt-6">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-bold">
                Additional Information
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  newsletter.additionalInfo &&
                  copyToClipboard(newsletter.additionalInfo, "additional")
                }
                className="hover:bg-accent transition-all"
              >
                {copiedSection === "additional" ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="border rounded-lg p-6 prose prose-sm max-w-none dark:prose-invert">
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <ReactMarkdown>{newsletter.additionalInfo}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface NewsletterSectionProps {
  title: string;
  items: string[];
  onCopy: (text: string) => void;
  isCopied: boolean;
  isGenerating?: boolean;
  compact?: boolean;
}

function NewsletterSection({
  title,
  items,
  onCopy,
  isCopied,
  isGenerating = false,
  compact = false,
}: NewsletterSectionProps) {
  const safeItems = items ?? [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label
          className={compact ? "text-base font-bold" : "text-lg font-bold"}
        >
          {title}
        </Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCopy(safeItems.join("\n"))}
          disabled={safeItems.length === 0}
          className="hover:bg-accent transition-all"
        >
          {isCopied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div
        className={`border rounded-lg ${compact ? "p-3" : "p-4"} space-y-2 ${compact ? "max-h-[500px] overflow-y-auto" : ""}`}
      >
        {safeItems.length === 0 ? (
          <div className="space-y-2">
            <p className="text-muted-foreground italic text-sm">
              {isGenerating
                ? `Generating ${title.toLowerCase()}...`
                : `No ${title.toLowerCase()} available`}
            </p>
            {isGenerating && (
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-4/5" />
                <div className="h-4 bg-muted animate-pulse rounded w-3/5" />
              </div>
            )}
          </div>
        ) : (
          safeItems.map((item, index) => (
            <div
              key={`${title}-${item.substring(0, 20)}-${index}`}
              className="flex items-start gap-2 animate-in fade-in slide-in-from-left-2 duration-300"
            >
              <Badge
                variant="outline"
                className={`${compact ? "text-xs" : ""} border-purple-600 text-purple-600`}
              >
                {index + 1}
              </Badge>
              <p className={`flex-1 ${compact ? "text-sm" : ""}`}>{item}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
