import { createMetadata, getBreadcrumbJsonLd, SITE_URL } from "@/lib/metadata";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import JsonLd from "@/components/JsonLd";
import PolicyScrutinizer from "@/components/tools/PolicyScrutinizer";
import Image from "next/image";

export const metadata = createMetadata({
  title: "Cyber Insurance Policy Scrutinizer — Find Coverage Gaps",
  description:
    "Paste your cyber insurance policy and instantly discover coverage gaps, missing protections, and money-saving recommendations. Free analysis for digital agencies.",
  path: "/tools/policy-scrutinizer",
});

export default function PolicyScrutinizerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Cyber Insurance Policy Scrutinizer",
    description:
      "Interactive tool that analyzes cyber insurance policies against 27 critical coverage areas to identify gaps, missing protections, and financial exposure for digital agencies.",
    url: `${SITE_URL}/tools/policy-scrutinizer`,
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
            name: "Policy Scrutinizer",
            url: `${SITE_URL}/tools/policy-scrutinizer`,
          },
        ])}
      />

      {/* Hero Section */}
      <section className="relative bg-navy text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/images/hero-tools.jpg"
            alt="Cyber insurance policy analysis"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <BreadcrumbNav
            items={[
              { label: "Tools", href: "/tools" },
              { label: "Policy Scrutinizer" },
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
                  d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5.66 13.84A2.25 2.25 0 005 15.432v.318a2.25 2.25 0 002.25 2.25h9.5A2.25 2.25 0 0019 15.75v-.318a2.25 2.25 0 00-.659-1.591l-3.432-3.432a2.25 2.25 0 01-.659-1.591V3.104"
                />
              </svg>
              Free Tool — No signup required
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
              Scrutinize Your{" "}
              <span className="text-teal">Cyber Insurance</span> Policy
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed max-w-2xl">
              Paste your policy text and instantly discover coverage gaps,
              missing protections, and financial exposure across 27 critical
              areas. Built specifically for digital agencies.
            </p>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <PolicyScrutinizer />
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-navy mb-2">
              How the Policy Scrutinizer Works
            </h2>
            <p className="text-gray-600">
              Our analysis engine checks your policy against industry best
              practices.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
                title: "Paste Your Policy",
                desc: "Copy and paste your cyber insurance policy document. The more text you include, the more accurate the analysis.",
              },
              {
                icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
                title: "Gap Detection",
                desc: "We scan for 27 coverage areas across first-party, third-party, and key policy terms using intelligent keyword matching.",
              },
              {
                icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
                title: "Actionable Report",
                desc: "Get a scored report with severity ratings, financial exposure estimates, and specific provider recommendations for each gap.",
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
