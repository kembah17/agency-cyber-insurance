import Link from "next/link";
import { BreadcrumbItem } from "@/lib/types";

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
}

export default function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-warm-gray">
      <ol className="flex items-center flex-wrap gap-1">
        <li className="flex items-center">
          <Link href="/" className="hover:text-navy transition-colors">
            Home
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <svg
              className="w-4 h-4 mx-1 text-warm-gray-light"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
            {item.href ? (
              <Link href={item.href} className="hover:text-navy transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-navy font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
