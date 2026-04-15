"use client";

import { ReactNode } from "react";
import { trackAffiliateClick } from "@/lib/analytics";

interface AffiliateLinkProps {
  href: string;
  provider: string;
  children: ReactNode;
  className?: string;
  source?: string;
  /** Article slug for tracking context */
  articleSlug?: string;
  /** Link position: header, body, footer, sidebar, cta-box, comparison-table */
  position?: string;
}

export default function AffiliateLink({
  href,
  provider,
  children,
  className = "",
  source = "article",
  articleSlug = "unknown",
  position = "body",
}: AffiliateLinkProps) {
  const handleClick = () => {
    if (typeof window !== "undefined") {
      try {
        // Store in localStorage for basic tracking (fallback)
        const event = {
          provider,
          source,
          url: href,
          articleSlug,
          position,
          timestamp: new Date().toISOString(),
        };
        const clicks = JSON.parse(
          localStorage.getItem("affiliate_clicks") || "[]"
        );
        clicks.push(event);
        localStorage.setItem("affiliate_clicks", JSON.stringify(clicks));

        // Fire GA4 event via analytics helper
        trackAffiliateClick(provider, articleSlug, position);
      } catch {
        // Silently fail tracking
      }
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}
