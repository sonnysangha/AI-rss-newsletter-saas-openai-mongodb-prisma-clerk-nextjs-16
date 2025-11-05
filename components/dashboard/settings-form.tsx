"use client";

import { Loader2, Save, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import {
  type UserSettingsInput,
  upsertUserSettings,
} from "@/actions/user-settings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type UserSettings = {
  id: string;
  userId: string;
  newsletterName: string | null;
  description: string | null;
  targetAudience: string | null;
  defaultTone: string | null;
  brandVoice: string | null;
  companyName: string | null;
  industry: string | null;
  disclaimerText: string | null;
  defaultTags: string[];
  customFooter: string | null;
  senderName: string | null;
  senderEmail: string | null;
  createdAt: Date;
  updatedAt: Date;
};

interface SettingsFormProps {
  initialSettings: UserSettings | null;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const [tagInput, setTagInput] = React.useState("");

  // Form state
  const [formData, setFormData] = React.useState<UserSettingsInput>({
    newsletterName: initialSettings?.newsletterName || "",
    description: initialSettings?.description || "",
    targetAudience: initialSettings?.targetAudience || "",
    defaultTone: initialSettings?.defaultTone || "",
    brandVoice: initialSettings?.brandVoice || "",
    companyName: initialSettings?.companyName || "",
    industry: initialSettings?.industry || "",
    disclaimerText: initialSettings?.disclaimerText || "",
    defaultTags: initialSettings?.defaultTags || [],
    customFooter: initialSettings?.customFooter || "",
    senderName: initialSettings?.senderName || "",
    senderEmail: initialSettings?.senderEmail || "",
  });

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Clean up form data: convert empty strings to null
      const cleanedData: UserSettingsInput = {
        newsletterName: formData.newsletterName?.trim() || null,
        description: formData.description?.trim() || null,
        targetAudience: formData.targetAudience?.trim() || null,
        defaultTone: formData.defaultTone?.trim() || null,
        brandVoice: formData.brandVoice?.trim() || null,
        companyName: formData.companyName?.trim() || null,
        industry: formData.industry?.trim() || null,
        disclaimerText: formData.disclaimerText?.trim() || null,
        defaultTags: formData.defaultTags || [],
        customFooter: formData.customFooter?.trim() || null,
        senderName: formData.senderName?.trim() || null,
        senderEmail: formData.senderEmail?.trim() || null,
      };

      await upsertUserSettings(cleanedData);
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (
    field: keyof UserSettingsInput,
    value: string | string[],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.defaultTags?.includes(trimmedTag)) {
      handleChange("defaultTags", [
        ...(formData.defaultTags || []),
        trimmedTag,
      ]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleChange(
      "defaultTags",
      formData.defaultTags?.filter((tag) => tag !== tagToRemove) || [],
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Basic Information */}
      <Card className="transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Basic Information</CardTitle>
          <CardDescription className="text-base">
            Core details about your newsletter that will be used in every
            generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newsletterName">Newsletter Name</Label>
            <Input
              id="newsletterName"
              placeholder="e.g., Tech Weekly Digest"
              value={formData.newsletterName || ""}
              onChange={(e) => handleChange("newsletterName", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of your newsletter's purpose and content"
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience">Target Audience</Label>
            <Input
              id="targetAudience"
              placeholder="e.g., Software developers, tech enthusiasts, startup founders"
              value={formData.targetAudience || ""}
              onChange={(e) => handleChange("targetAudience", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultTone">Default Tone</Label>
            <Input
              id="defaultTone"
              placeholder="e.g., Professional, casual, friendly, informative"
              value={formData.defaultTone || ""}
              onChange={(e) => handleChange("defaultTone", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Brand Identity */}
      <Card className="transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Brand Identity</CardTitle>
          <CardDescription className="text-base">
            Your brand's voice and company information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              placeholder="Your company or organization name"
              value={formData.companyName || ""}
              onChange={(e) => handleChange("companyName", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              placeholder="e.g., Technology, Healthcare, Finance"
              value={formData.industry || ""}
              onChange={(e) => handleChange("industry", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brandVoice">Brand Voice</Label>
            <Textarea
              id="brandVoice"
              placeholder="Describe your brand's unique voice and personality (e.g., witty, authoritative, empathetic)"
              value={formData.brandVoice || ""}
              onChange={(e) => handleChange("brandVoice", e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Details */}
      <Card className="transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Additional Details</CardTitle>
          <CardDescription className="text-base">
            Extra information to enhance your newsletters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultTags">Default Tags</Label>
            <div className="flex gap-2">
              <Input
                id="defaultTags"
                placeholder="Add a tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button type="button" onClick={handleAddTag} variant="secondary">
                Add
              </Button>
            </div>
            {formData.defaultTags && formData.defaultTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.defaultTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="disclaimerText">Disclaimer Text</Label>
            <Textarea
              id="disclaimerText"
              placeholder="Any legal disclaimers or notices to include (will be automatically added at the end of every newsletter)"
              value={formData.disclaimerText || ""}
              onChange={(e) => handleChange("disclaimerText", e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This will be included near the end of every newsletter body before
              the footer
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customFooter">Custom Footer</Label>
            <Textarea
              id="customFooter"
              placeholder="Custom footer content for your newsletters (signature, contact info, social links, etc.)"
              value={formData.customFooter || ""}
              onChange={(e) => handleChange("customFooter", e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              This will be included at the very end of every newsletter body
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sender Information */}
      <Card className="transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Sender Information</CardTitle>
          <CardDescription className="text-base">
            Who is sending these newsletters?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="senderName">Sender Name</Label>
            <Input
              id="senderName"
              placeholder="e.g., John Doe"
              value={formData.senderName || ""}
              onChange={(e) => handleChange("senderName", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senderEmail">Sender Email</Label>
            <Input
              id="senderEmail"
              type="email"
              placeholder="e.g., john@example.com"
              value={formData.senderEmail || ""}
              onChange={(e) => handleChange("senderEmail", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
