import { ArticleMeta } from "@/lib/types";
import ArticleCard from "./ArticleCard";

interface RelatedArticlesProps {
  articles: ArticleMeta[];
  title?: string;
}

export default function RelatedArticles({
  articles,
  title = "Related Articles",
}: RelatedArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-2xl font-bold text-navy mb-6">{title}</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </section>
  );
}
