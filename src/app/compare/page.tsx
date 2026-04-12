import { getAllComparisons } from "@/lib/content";
import { getAllProviders } from "@/lib/affiliates";
import { createMetadata } from "@/lib/metadata";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import JsonLd from "@/components/JsonLd";
import { getBreadcrumbJsonLd, SITE_URL } from "@/lib/metadata";
import ComparisonTable from "@/components/ComparisonTable";
import RatingStars from "@/components/RatingStars";
import AffiliateLink from "@/components/AffiliateLink";
import Link from "next/link";

export const metadata = createMetadata({
  title: "Compare Cyber Insurance Providers for Digital Agencies",
  description:
    "Side-by-side comparison of the top cyber liability insurance providers for digital agencies. Coverage, pricing, and features compared.",
  path: "/compare",
});

export default function ComparePage() {
  const providers = getAllProviders();
  const comparisons = getAllComparisons();

  return (
    <>
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "Compare Providers", url: `${SITE_URL}/compare` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <BreadcrumbNav items={[{ label: "Compare Providers" }]} />

        <div className="mt-8 mb-12">
          <h1 className="text-4xl font-bold text-navy mb-4">
            Compare Cyber Insurance Providers
          </h1>
          <p className="text-lg text-warm-gray max-w-2xl">
            We&rsquo;ve researched and compared the leading cyber liability insurance
            providers for digital agencies. Here&rsquo;s how they stack up.
          </p>
        </div>

        {/* Quick Comparison Table */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-navy mb-6">
            Quick Comparison
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <ComparisonTable providers={providers} />
          </div>
          <p className="text-xs text-warm-gray-light mt-3 italic">
            * Features and pricing may vary. Always verify directly with the
            provider. Some links are affiliate links.
          </p>
        </section>

        {/* Individual Provider Cards */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-navy mb-6">
            Provider Overviews
          </h2>
          <div className="space-y-6">
            {providers.map((provider, index) => (
              <div
                key={provider.slug}
                className="bg-white rounded-xl border border-gray-200 p-6 md:p-8"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {index === 0 && (
                        <span className="text-xs font-bold bg-teal text-white px-2 py-1 rounded">
                          Top Pick
                        </span>
                      )}
                      <h3 className="text-xl font-bold text-navy">
                        {provider.name}
                      </h3>
                    </div>
                    <div className="mb-3">
                      <RatingStars rating={provider.rating} />
                    </div>
                    <p className="text-warm-gray text-sm leading-relaxed mb-4">
                      {provider.description}
                    </p>

                    {/* Pros & Cons inline */}
                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-semibold text-green-700 mb-2">
                          Strengths
                        </h4>
                        <ul className="space-y-1">
                          {provider.pros.map((pro) => (
                            <li
                              key={pro}
                              className="flex items-start gap-2 text-sm text-gray-700"
                            >
                              <svg
                                className="w-4 h-4 text-green-500 shrink-0 mt-0.5"
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
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-red-700 mb-2">
                          Limitations
                        </h4>
                        <ul className="space-y-1">
                          {provider.cons.map((con) => (
                            <li
                              key={con}
                              className="flex items-start gap-2 text-sm text-gray-700"
                            >
                              <svg
                                className="w-4 h-4 text-red-400 shrink-0 mt-0.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* CTA Sidebar */}
                  <div className="md:w-48 shrink-0 text-center">
                    <div className="bg-warm-gray-lightest rounded-lg p-4">
                      <div className="text-sm text-warm-gray mb-1">Starting from</div>
                      <div className="text-2xl font-bold text-navy mb-3">
                        {provider.pricing}
                      </div>
                      <AffiliateLink
                        href={provider.url}
                        provider={provider.slug}
                        className="block w-full px-4 py-3 bg-teal text-white font-semibold rounded-lg hover:bg-teal-dark transition-colors text-sm"
                      >
                        {provider.cta_text}
                      </AffiliateLink>
                      <p className="text-xs text-warm-gray-light mt-2">
                        Affiliate link
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Detailed Comparison Articles */}
        {comparisons.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-navy mb-6">
              Detailed Comparisons
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {comparisons.map((comp) => (
                <Link
                  key={comp.slug}
                  href={`/compare/${comp.slug}`}
                  className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow group"
                >
                  <h3 className="text-lg font-bold text-navy group-hover:text-teal transition-colors mb-2">
                    {comp.title}
                  </h3>
                  <p className="text-sm text-warm-gray leading-relaxed">
                    {comp.description}
                  </p>
                  <span className="inline-flex items-center text-sm text-teal font-medium mt-3">
                    Read comparison
                    <svg
                      className="w-4 h-4 ml-1"
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
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
