"use client";

import { useEffect, useRef } from "react";
import {
  trackArticleRead,
  trackScrollDepth,
  trackArticleComplete,
} from "@/lib/analytics";

interface ArticleTrackerProps {
  slug: string;
  category: string;
  wordCount: number;
}

/**
 * Client component that tracks article engagement:
 * - Fires article_read on mount with metadata
 * - Tracks scroll depth at 25%, 50%, 75%, 100% milestones via IntersectionObserver
 * - Fires article_complete when user reaches 75% scroll depth
 * - Calculates estimated read time (wordCount / 200 wpm)
 */
export default function ArticleTracker({
  slug,
  category,
  wordCount,
}: ArticleTrackerProps) {
  const firedMilestones = useRef<Set<number>>(new Set());
  const articleCompleted = useRef(false);

  useEffect(() => {
    // Track article page view on mount
    trackArticleRead(slug, category, wordCount);

    // Create sentinel elements for scroll depth tracking
    const article = document.querySelector("article");
    if (!article) return;

    const milestones = [25, 50, 75, 100];
    const sentinels: HTMLDivElement[] = [];

    milestones.forEach((pct) => {
      const sentinel = document.createElement("div");
      sentinel.setAttribute("data-scroll-milestone", String(pct));
      sentinel.style.height = "1px";
      sentinel.style.width = "1px";
      sentinel.style.position = "absolute";
      sentinel.style.left = "0";
      sentinel.style.pointerEvents = "none";
      sentinel.style.opacity = "0";

      // Position sentinel at the appropriate percentage of article height
      const articleHeight = article.scrollHeight;
      const topOffset = Math.floor((articleHeight * pct) / 100);
      sentinel.style.top = `${topOffset}px`;

      article.style.position = "relative";
      article.appendChild(sentinel);
      sentinels.push(sentinel);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const milestone = Number(
            (entry.target as HTMLElement).dataset.scrollMilestone
          );
          if (!milestone || firedMilestones.current.has(milestone)) return;

          firedMilestones.current.add(milestone);
          trackScrollDepth(slug, milestone);

          // Fire article_complete at 75% scroll depth
          if (milestone >= 75 && !articleCompleted.current) {
            articleCompleted.current = true;
            trackArticleComplete(slug, category);
          }
        });
      },
      {
        threshold: 0,
        rootMargin: "0px",
      }
    );

    sentinels.forEach((s) => observer.observe(s));

    return () => {
      observer.disconnect();
      sentinels.forEach((s) => s.remove());
    };
  }, [slug, category, wordCount]);

  // This component renders nothing — it's purely for side effects
  return null;
}
