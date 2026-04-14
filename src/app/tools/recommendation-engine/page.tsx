import { createMetadata, getBreadcrumbJsonLd, SITE_URL } from "@/lib/metadata";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import JsonLd from "@/components/JsonLd";
import RecommendationEngine from "@/components/tools/RecommendationEngine";
import Image from "next/image";

export const metadata = createMetadata({
  title: "Cyber Insurance Recommendation Engine — Find Your Best Policy",
  description:
    "Answer 5 quick questions about your digital agency and get a personalized cyber insurance recommendation with estimated pricing, coverage limits, and action items.",
  path: "/tools/recommendation-engine",
});

export default function RecommendationEnginePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Cyber Insurance Recommendation Engine",
    description:
      "Interactive tool that recommends the best cyber insurance provider for digital agencies based on agency size, risk profile, security posture, and budget.",
    url: `${SITE_URL}/tools/recommendation-engine`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    creator: {
      "@type": "Organization",
      name: "AgencyCyberInsurance",
      url: SITE_URL,
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "Tools", url: `${SITE_URL}/tools` },
          {
            name: "Recommendation Engine",
            url: `${SITE_URL}/tools/recommendation-engine`,
          },
        ])}
      />

      {/* Hero Section */}
      <section className="relative bg-navy text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/images/hero-tools.jpg"
            alt="Digital agency professional"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <BreadcrumbNav
            items={[
              { label: "Tools", href: "/tools" },
              { label: "Recommendation Engine" },
            ]}
          />
          <div className="mt-6">
            <div className="inline-flex items-center gap-2 bg-teal/20 text-teal-light px-3 py-1 rounded-full text-sm font-medium mb-4">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                />
              </svg>
              Free Tool — No signup required
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
              Find Your Perfect{" "}
              <span className="text-teal">Cyber Insurance</span> Policy
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed max-w-2xl">
              Answer 5 quick questions about your agency and we'll recommend
              the best provider, estimate your premium, and show you how to
              reduce costs.
            </p>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <RecommendationEngine />
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-navy mb-2">
              How Our Recommendations Work
            </h2>
            <p className="text-gray-600">
              Our engine analyzes your agency profile across multiple dimensions.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6",
                title: "Risk Assessment",
                desc: "We evaluate your data sensitivity, security controls, and claims history to calculate your risk score.",
              },
              {
                icon: "M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z",
                title: "Provider Matching",
                desc: "We match your profile against provider strengths — budget, monitoring, tech focus, or enterprise needs.",
              },
              {
                icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z",
                title: "Premium Estimation",
                desc: "We calculate estimated costs based on industry data, adjusted for your size, risk, and security posture.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-xl border border-gray-200 p-6 text-center"
              >
                <div className="w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-teal"
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
                <h3 className="font-bold text-navy mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
