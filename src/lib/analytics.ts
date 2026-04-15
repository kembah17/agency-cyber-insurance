/**
 * Analytics helper functions for GA4 event tracking.
 * All functions gracefully degrade if gtag is not loaded.
 */

// Ensure gtag type is available
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Safely call gtag if it exists on window.
 */
function safeGtag(command: string, eventName: string, params: Record<string, unknown>): void {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag(command, eventName, params);
  }
}

/**
 * Track affiliate link clicks.
 * Used by AffiliateLink.tsx component.
 */
export function trackAffiliateClick(
  provider: string,
  article: string,
  position: string
): void {
  safeGtag("event", "affiliate_click", {
    event_category: "affiliate",
    event_label: provider,
    provider_name: provider,
    article_slug: article,
    link_position: position,
    value: 1,
  });
}

/**
 * Track recommendation engine interactions.
 */
export function trackToolUsage(
  toolName: string,
  action: string,
  value?: string
): void {
  safeGtag("event", "tool_usage", {
    event_category: "tools",
    event_label: `${toolName}_${action}`,
    tool_name: toolName,
    tool_action: action,
    tool_value: value ?? "",
  });
}

/**
 * Track article page views with metadata.
 */
export function trackArticleRead(
  slug: string,
  category: string,
  wordCount: number
): void {
  safeGtag("event", "article_read", {
    event_category: "content",
    event_label: slug,
    article_slug: slug,
    article_category: category,
    word_count: wordCount,
    estimated_read_time: Math.ceil(wordCount / 200),
  });
}

/**
 * Track scroll depth milestones (25%, 50%, 75%, 100%).
 */
export function trackScrollDepth(slug: string, depth: number): void {
  safeGtag("event", "scroll_depth", {
    event_category: "engagement",
    event_label: `${slug}_${depth}`,
    article_slug: slug,
    scroll_percentage: depth,
  });
}

/**
 * Track outbound (non-affiliate) link clicks.
 */
export function trackOutboundClick(url: string, linkText: string): void {
  safeGtag("event", "outbound_click", {
    event_category: "outbound",
    event_label: url,
    link_url: url,
    link_text: linkText,
  });
}

/**
 * Track CTA button/link interactions.
 */
export function trackCTAClick(
  ctaType: string,
  ctaText: string,
  location: string
): void {
  safeGtag("event", "cta_click", {
    event_category: "cta",
    event_label: `${ctaType}_${location}`,
    cta_type: ctaType,
    cta_text: ctaText,
    cta_location: location,
  });
}

/**
 * Track search/filter usage.
 */
export function trackSearch(query: string, resultsCount: number): void {
  safeGtag("event", "search", {
    event_category: "search",
    event_label: query,
    search_term: query,
    results_count: resultsCount,
  });
}

/**
 * Track article completion (75%+ scroll depth).
 */
export function trackArticleComplete(slug: string, category: string): void {
  safeGtag("event", "article_complete", {
    event_category: "engagement",
    event_label: slug,
    article_slug: slug,
    article_category: category,
  });
}
