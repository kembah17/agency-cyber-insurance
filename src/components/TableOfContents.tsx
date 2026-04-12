"use client";

import { useEffect, useState } from "react";
import { TOCItem } from "@/lib/types";

interface TableOfContentsProps {
  items: TOCItem[];
}

export default function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className="bg-warm-gray-lightest rounded-xl p-5" aria-label="Table of contents">
      <h2 className="text-sm font-bold uppercase tracking-wider text-navy mb-3">
        Table of Contents
      </h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            style={{ paddingLeft: `${(item.level - 2) * 12}px` }}
          >
            <a
              href={`#${item.id}`}
              className={`block text-sm leading-relaxed transition-colors ${
                activeId === item.id
                  ? "text-teal font-medium"
                  : "text-warm-gray hover:text-navy"
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
