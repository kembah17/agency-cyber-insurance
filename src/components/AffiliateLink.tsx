"use client";

import { ReactNode } from "react";

interface AffiliateLinkProps {
  href: string;
  provider: string;
  children: ReactNode;
  className?: string;
  source?: string;
}

export default function AffiliateLink({
  href,
  provider,
  children,
  className = "",
  source = "article",
}: AffiliateLinkProps) {
  const handleClick = () => {
    // Track affiliate click
    if (typeof window !== "undefined") {
      try {
        const event = {
          provider,
          source,
          url: href,
          timestamp: new Date().toISOString(),
        };
        // Store in localStorage for basic tracking
        const clicks = JSON.parse(
          localStorage.getItem("affiliate_clicks") || "[]"
        );
        clicks.push(event);
        localStorage.setItem("affiliate_clicks", JSON.stringify(clicks));

        // If analytics is available, fire event
        if (typeof window.gtag === "function") {
          window.gtag("event", "affiliate_click", {
            event_category: "affiliate",
            event_label: provider,
            value: 1,
          });
        }
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

// Type augmentation for gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}
