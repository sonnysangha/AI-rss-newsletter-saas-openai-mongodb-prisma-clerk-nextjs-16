import type { ArticleForPrompt, NewsletterPromptParams } from "./types";

// ============================================
// NEWSLETTER PROMPT BUILDERS
// ============================================

/**
 * Builds article summaries for AI prompt
 * Formats articles into a structured text format for AI consumption
 */
export function buildArticleSummaries(articles: ArticleForPrompt[]): string {
  return articles
    .map((article, index) => {
      return `
${index + 1}. "${article.title}"
   Source: ${article.feed.title}
   Published: ${article.pubDate.toLocaleDateString()}
   Summary: ${
     article.summary ||
     article.content?.substring(0, 200) ||
     "No summary available"
   }
   Link: ${article.link}
`;
    })
    .join("\n");
}

/**
 * Builds comprehensive AI prompt for newsletter generation
 * Creates a structured prompt that instructs the AI to generate a professional newsletter
 */
export function buildNewsletterPrompt(
  params: NewsletterPromptParams
): string {
  return `You are an expert newsletter writer. Create a professional, engaging newsletter from these RSS articles.

DATE RANGE: ${params.startDate.toLocaleDateString()} to ${params.endDate.toLocaleDateString()}

${params.userInput ? `USER INSTRUCTIONS:\n${params.userInput}\n\n` : ""}

ARTICLES (${params.articleCount} total):
${params.articleSummaries}

Create a newsletter with:

1. **5 Newsletter Titles**: Creative titles capturing the content period
2. **5 Email Subject Lines**: Compelling subject lines to drive opens
3. **Newsletter Body** (800-1200 words, Markdown format):
   - Strong opening hook
   - Use headings (##, ###) for structure
   - Highlight important stories with context
   - Group related stories thematically
   - Use **bold** and *italics* for emphasis
   - Include blockquotes (>) for key quotes
   - Maintain professional, engaging tone
   - Conclude with forward-looking statement
4. **5 Top Announcements**: Brief, punchy format
5. **Additional Information**: Supplementary notes, trends, recommendations (Markdown)

Return as structured JSON.`;
}

