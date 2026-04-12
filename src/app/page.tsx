import Link from "next/link";
import { getAllPosts, getFeaturedPosts } from "@/lib/content";
import { getAllProviders } from "@/lib/affiliates";
import ArticleCard from "@/components/ArticleCard";
import NewsletterSignup from "@/components/NewsletterSignup";
import RatingStars from "@/components/RatingStars";
import AffiliateLink from "@/components/AffiliateLink";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "AgencyCyberInsurance — Cyber Liability Insurance for Digital Agencies",
  description:
    "Expert cyber liability insurance guidance for digital agencies. Compare policies, understand coverage, and protect your agency from cyber threats.",
});

export default function HomePage() {
  const featuredPosts = getFeaturedPosts(3);
  const recentPosts = getAllPosts().slice(0, 6);
  const providers = getAllProviders().slice(0, 3);

  return (
    <>
      {/* Hero Section */}
      <section className="bg-navy text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm text-gray-300 mb-6">
              <svg
                className="w-4 h-4 text-teal"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
              Trusted by 500+ digital agencies
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Protect Your Agency from{" "}
              <span className="text-teal">Cyber Threats</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8">
              We’re a digital agency that spent months researching cyber liability
              insurance. Now we share everything we learned—honest comparisons,
              real costs, and practical guidance—so you don’t have to start from
              scratch.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/compare"
                className="inline-flex items-center justify-center px-6 py-3 bg-teal text-white font-semibold rounded-lg hover:bg-teal-light transition-colors"
              >
                Compare Policies
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
              >
                Read Our Guides
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="border-b border-gray-200 bg-warm-gray-lightest">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "50+", label: "Policies Reviewed" },
              { value: "4", label: "Top Providers Compared" },
              { value: "12+", label: "In-Depth Guides" },
              { value: "100%", label: "Independent Research" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl md:text-3xl font-bold text-navy">
                  {stat.value}
                </div>
                <div className="text-sm text-warm-gray mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Providers Quick Look */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Top Cyber Insurance Providers for Agencies
            </h2>
            <p className="text-warm-gray max-w-2xl mx-auto">
              We’ve researched and compared the leading cyber liability insurance
              providers. Here are our top picks for digital agencies.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {providers.map((provider, index) => (
              <div
                key={provider.slug}
                className={`relative bg-white rounded-xl border-2 p-6 ${
                  index === 0
                    ? "border-teal shadow-lg"
                    : "border-gray-200 hover:border-gray-300"
                } transition-all`}
              >
                {index === 0 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal text-white text-xs font-bold px-3 py-1 rounded-full">
                    Our Top Pick
                  </div>
                )}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-navy">
                    {provider.name}
                  </h3>
                  <div className="flex justify-center mt-2">
                    <RatingStars rating={provider.rating} size="sm" />
                  </div>
                </div>
                <p className="text-sm text-warm-gray text-center mb-4 leading-relaxed">
                  {provider.description}
                </p>
                <ul className="space-y-2 mb-6">
                  {provider.pros.slice(0, 3).map((pro) => (
                    <li
                      key={pro}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <svg
                        className="w-4 h-4 text-teal shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {pro}
                    </li>
                  ))}
                </ul>
                <AffiliateLink
                  href={provider.url}
                  provider={provider.slug}
                  className="block w-full text-center px-4 py-3 bg-teal text-white font-semibold rounded-lg hover:bg-teal-dark transition-colors text-sm"
                >
                  {provider.cta_text}
                </AffiliateLink>
                <p className="text-xs text-warm-gray-light text-center mt-2">
                  Affiliate link
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/compare"
              className="text-teal font-medium hover:text-teal-dark transition-colors"
            >
              View full comparison →
            </Link>
          </div>
        </div>
      </section>

      {/* Featured / Recent Articles */}
      <section className="py-16 bg-warm-gray-lightest">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Latest Guides &amp; Insights
            </h2>
            <p className="text-warm-gray max-w-2xl mx-auto">
              Practical, research-backed articles to help you understand cyber
              liability insurance and protect your digital agency.
            </p>
          </div>

          {featuredPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <ArticleCard key={post.slug} article={post} />
              ))}
            </div>
          ) : recentPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
                <ArticleCard key={post.slug} article={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <svg
                className="w-12 h-12 text-warm-gray-light mx-auto mb-4"
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
              <h3 className="text-lg font-semibold text-navy mb-2">
                Articles Coming Soon
              </h3>
              <p className="text-warm-gray text-sm">
                We’re working on comprehensive guides about cyber insurance for
                agencies.
              </p>
            </div>
          )}

          {(featuredPosts.length > 0 || recentPosts.length > 0) && (
            <div className="text-center mt-8">
              <Link
                href="/blog"
                className="inline-flex items-center px-6 py-3 bg-navy text-white font-semibold rounded-lg hover:bg-navy-light transition-colors"
              >
                View All Articles
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How We Work */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy mb-4">
              How We Research &amp; Compare
            </h2>
            <p className="text-warm-gray max-w-2xl mx-auto">
              Our methodology ensures every recommendation is backed by thorough
              analysis, not just marketing claims.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
                title: "Deep Research",
                description:
                  "We analyze policy documents, coverage terms, exclusions, and fine print that most comparison sites skip over.",
              },
              {
                icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
                title: "Side-by-Side Comparison",
                description:
                  "We compare providers on the metrics that matter to agencies: coverage scope, pricing, claims process, and tech integration.",
              },
              {
                icon: "M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5",
                title: "Agency-First Perspective",
                description:
                  "As agency owners ourselves, we evaluate everything through the lens of what actually matters for running a digital agency.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-14 h-14 bg-teal/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-7 h-7 text-teal"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={item.icon}
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy mb-2">
                  {item.title}
                </h3>
                <p className="text-warm-gray text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/methodology"
              className="text-teal font-medium hover:text-teal-dark transition-colors"
            >
              Learn about our methodology →
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-warm-gray-lightest">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <NewsletterSignup />
        </div>
      </section>
    </>
  );
}
