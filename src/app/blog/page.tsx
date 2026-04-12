import { getAllPosts, getAllCategories } from "@/lib/content";
import { createMetadata } from "@/lib/metadata";
import ArticleCard from "@/components/ArticleCard";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import JsonLd from "@/components/JsonLd";
import { getBreadcrumbJsonLd, SITE_URL } from "@/lib/metadata";
import NewsletterSignup from "@/components/NewsletterSignup";

export const metadata = createMetadata({
  title: "Blog — Cyber Insurance Guides for Digital Agencies",
  description:
    "Practical guides, comparisons, and insights about cyber liability insurance for digital agencies. Written by agency owners, for agency owners.",
  path: "/blog",
});

export default function BlogPage() {
  const posts = getAllPosts();
  const categories = getAllCategories();

  return (
    <>
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "Blog", url: `${SITE_URL}/blog` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <BreadcrumbNav items={[{ label: "Blog" }]} />

        <div className="mt-8 mb-12">
          <h1 className="text-4xl font-bold text-navy mb-4">
            Cyber Insurance Guides &amp; Insights
          </h1>
          <p className="text-lg text-warm-gray max-w-2xl">
            Practical, research-backed articles to help you understand cyber
            liability insurance and protect your digital agency.
          </p>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <span className="px-4 py-2 bg-navy text-white text-sm font-medium rounded-lg">
              All
            </span>
            {categories.map((cat) => (
              <span
                key={cat}
                className="px-4 py-2 bg-warm-gray-lightest text-warm-gray text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <ArticleCard key={post.slug} article={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-warm-gray-lightest rounded-xl">
            <svg
              className="w-16 h-16 text-warm-gray-light mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
            <h2 className="text-2xl font-bold text-navy mb-2">
              Articles Coming Soon
            </h2>
            <p className="text-warm-gray max-w-md mx-auto">
              We’re working on comprehensive guides about cyber insurance for
              digital agencies. Check back soon or subscribe to get notified.
            </p>
          </div>
        )}

        {/* Newsletter */}
        <div className="mt-16 max-w-xl mx-auto">
          <NewsletterSignup />
        </div>
      </div>
    </>
  );
}
