import type { ArticleForPrompt, NewsletterPromptParams } from "./types";

// ============================================
// NEWSLETTER PROMPT BUILDERS
// ============================================

/**
 * Builds article summaries for AI prompt
 *
 * Formats articles into a numbered list that's easy for AI to process.
 * Each article includes title, source, date, summary, and link.
 *
 * @param articles - Array of articles to summarize
 * @returns Formatted string with all article summaries
 */
export function buildArticleSummaries(articles: ArticleForPrompt[]): string {
  return articles
    .map((article, index) => {
      const summary =
        article.summary ||
        article.content?.substring(0, 200) ||
        "No summary available";

      return `
${index + 1}. "${article.title}"
   Source: ${article.feed.title}
   Published: ${article.pubDate.toLocaleDateString()}
   Summary: ${summary}
   Link: ${article.link}
`;
    })
    .join("\n");
}

/**
 * Builds settings context from user settings
 *
 * Extracts non-empty settings and formats them for the AI prompt.
 * Settings guide the AI on tone, branding, and required content.
 *
 * @param settings - User's newsletter settings
 * @returns Formatted settings string, or empty if no settings
 */
function buildSettingsContext(
  settings?: NewsletterPromptParams["settings"],
): string {
  if (!settings) {
    return "";
  }

  // Collect all setting lines (only if they have values)
  const settingLines: string[] = [];

  // Helper to add a setting if it exists
  const addSetting = (label: string, value: string | undefined | null) => {
    if (value) {
      settingLines.push(`${label}: ${value}`);
    }
  };

  // Basic Settings
  addSetting("Newsletter Name", settings.newsletterName);
  addSetting("Newsletter Description", settings.description);
  addSetting("Target Audience", settings.targetAudience);
  addSetting("Tone", settings.defaultTone);

  // Branding
  addSetting("Brand Voice", settings.brandVoice);
  addSetting("Company", settings.companyName);
  addSetting("Industry", settings.industry);

  // Contact Information
  addSetting("Sender Name", settings.senderName);
  addSetting("Sender Email", settings.senderEmail);

  // Tags
  if (settings.defaultTags && settings.defaultTags.length > 0) {
    settingLines.push(`Tags: ${settings.defaultTags.join(", ")}`);
  }

  // Required Content (disclaimer and footer)
  if (settings.disclaimerText) {
    settingLines.push(
      `Required disclaimer text to include at the end: "${settings.disclaimerText}"`,
    );
  }
  if (settings.customFooter) {
    settingLines.push(
      `Required footer content to include at the very end: "${settings.customFooter}"`,
    );
  }

  // Return empty if no settings were collected
  if (settingLines.length === 0) {
    return "";
  }

  return `NEWSLETTER SETTINGS:\n${settingLines.join("\n")}\n\n`;
}

/**
 * Builds user instructions section if provided
 */
function buildUserInstructionsSection(userInput?: string): string {
  const trimmedInput = userInput?.trim();
  if (!trimmedInput) {
    return "";
  }

  return `🔴 CRITICAL USER INSTRUCTIONS (MUST FOLLOW):\n${trimmedInput}\n\n`;
}

/**
 * Builds the newsletter body requirements
 */
function buildBodyRequirements(params: NewsletterPromptParams): string[] {
  const requirements = [
    "Strong opening hook",
    "Use headings (##, ###) for structure",
    "Highlight important stories with context",
    "Group related stories thematically",
    "Use **bold** and *italics* for emphasis",
    "Include blockquotes (>) for key quotes",
    "Maintain professional, engaging tone",
    "Conclude with forward-looking statement",
  ];

  // Add disclaimer requirement if present
  if (params.settings?.disclaimerText) {
    requirements.push(
      'Near the end, naturally incorporate the required disclaimer text WITHOUT using labels like "Disclaimer:" or "Note:" - just include the text seamlessly',
    );
  }

  // Add footer requirement if present
  if (params.settings?.customFooter) {
    requirements.push(
      'At the very end, include the required footer content WITHOUT labels like "Footer:" or "Custom Footer:" - just include the content naturally with appropriate formatting (e.g., add a horizontal rule "---" before it)',
    );
  }

  return requirements;
}

/**
 * Builds the important notes section
 */
function buildImportantNotes(params: NewsletterPromptParams): string[] {
  const hasUserInput = params.userInput?.trim();
  const hasDisclaimer = params.settings?.disclaimerText;
  const hasFooter = params.settings?.customFooter;

  const notes = [
    "Use ALL the newsletter settings provided above to inform the style, tone, and content",
  ];

  if (hasUserInput) {
    notes.push(
      "🔴 CRITICAL: The USER INSTRUCTIONS above are MANDATORY and MUST be incorporated into the newsletter",
    );
  }

  if (hasDisclaimer) {
    notes.push(
      'Include the required disclaimer text near the end WITHOUT adding labels like "Disclaimer:" - weave it in naturally',
    );
  }

  if (hasFooter) {
    notes.push(
      'Include the required footer content at the very end WITHOUT labels like "Custom Footer:" or "Footer:" - format it naturally (use "---" separator if appropriate)',
    );
  }

  notes.push(
    "Ensure the newsletter aligns with the target audience and brand voice specified",
    "Follow the tone and style guidelines provided in the settings",
  );

  if (hasUserInput) {
    notes.push(
      "The user's specific instructions take precedence and should be clearly reflected in the content",
    );
  }

  return notes;
}

/**
 * Builds comprehensive AI prompt for newsletter generation
 *
 * Creates a structured prompt that instructs the AI on:
 * - Date range and context
 * - User settings (tone, branding, required content)
 * - Articles to summarize
 * - Expected output format
 *
 * @param params - All parameters needed for prompt generation
 * @returns Complete prompt string ready for AI
 */
export function buildNewsletterPrompt(params: NewsletterPromptParams): string {
  const settingsContext = buildSettingsContext(params.settings);
  const userInstructions = buildUserInstructionsSection(params.userInput);
  const bodyRequirements = buildBodyRequirements(params);
  const importantNotes = buildImportantNotes(params);

  // Assemble the prompt using an array for clarity
  const promptSections = [
    "You are an expert newsletter writer. Create a professional, engaging newsletter from these RSS articles.",
    "",
    `DATE RANGE: ${params.startDate.toLocaleDateString()} to ${params.endDate.toLocaleDateString()}`,
    "",
    settingsContext,
    userInstructions,
    `ARTICLES (${params.articleCount} total):`,
    params.articleSummaries,
    "",
    "Create a newsletter with:",
    "",
    "1. **5 Newsletter Titles**: Creative titles capturing the content period",
    "2. **5 Email Subject Lines**: Compelling subject lines to drive opens",
    "3. **Newsletter Body** (1200-2000 words, Markdown format):",
    ...bodyRequirements.map((req) => `   - ${req}`),
    "4. **5 Top Announcements**: Brief, punchy format",
    "5. **Additional Information**: Supplementary notes, trends, recommendations (Markdown)",
    "",
    "IMPORTANT:",
    ...importantNotes.map((note) => `- ${note}`),
    "",
    "Return as structured JSON.",
  ];

  return promptSections.join("\n");
}
