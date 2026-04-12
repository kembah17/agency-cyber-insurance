import Link from "next/link";
import { ArticleMeta } from "@/lib/types";

interface ArticleCardProps {
  article: ArticleMeta;
  featured?: boolean;
}

export default function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const formattedDate = new Date(article.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article
      className={`group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow ${
        featured ? "md:flex" : ""
      }`}
    >
      {/* Thumbnail placeholder */}
      <div
        className={`bg-warm-gray-lighter flex items-center justify-center ${
          featured ? "md:w-2/5 h-48 md:h-auto" : "h-48"
        }`}
      >
        <svg
          className="w-12 h-12 text-warm-gray-light"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
          />
        </svg>
      </div>

      {/* Content */}
      <div className={`p-5 ${featured ? "md:w-3/5 md:p-6" : ""}`}>
        {/* Category & Read Time */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal bg-teal/10 px-2 py-1 rounded">
            {article.category}
          </span>
          <span className="text-xs text-warm-gray">
            {article.read_time} min read
          </span>
        </div>

        {/* Title */}
        <h3
          className={`font-bold text-navy group-hover:text-teal transition-colors mb-2 ${
            featured ? "text-xl md:text-2xl" : "text-lg"
          }`}
        >
          <Link href={`/blog/${article.slug}`} className="after:absolute after:inset-0 relative">
            {article.title}
          </Link>
        </h3>

        {/* Description */}
        <p className="text-warm-gray text-sm leading-relaxed mb-4 line-clamp-2">
          {article.description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-2 text-xs text-warm-gray-light">
          <time dateTime={article.date}>{formattedDate}</time>
          {article.tags.length > 0 && (
            <>
              <span>&middot;</span>
              <span>{article.tags[0]}</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
