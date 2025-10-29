// ============================================
// NEWSLETTER-SPECIFIC TYPE DEFINITIONS
// ============================================

/**
 * Article type for prompt building
 */
export interface ArticleForPrompt {
  title: string;
  feed: { title: string | null };
  pubDate: Date;
  summary?: string | null;
  content?: string | null;
  link: string;
}

/**
 * Parameters for building newsletter prompt
 */
export interface NewsletterPromptParams {
  startDate: Date;
  endDate: Date;
  articleSummaries: string;
  articleCount: number;
  userInput?: string;
}

