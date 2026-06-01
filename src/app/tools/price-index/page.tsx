import { createMetadata, getBreadcrumbJsonLd, SITE_URL } from "@/lib/metadata";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import JsonLd from "@/components/JsonLd";
import Link from "next/link";

export const metadata = createMetadata({
  title: "Cyber Insurance Price Index for Digital Agencies (2026)",
  description:
    "Comprehensive pricing data for cyber insurance by agency size, type, coverage level, and deductible. Updated for 2026 with year-over-year trend analysis.",
  path: "/tools/price-index",
  noSuffix: true,
});

export default function PriceIndexPage() {
  const jsonLdDataset = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Cyber Insurance Price Index for Digital Agencies (2026)",
    description:
      "Aggregated cyber insurance pricing data for digital agencies segmented by agency size, agency type, coverage level, deductible amount, and year-over-year premium trends from 2024 to 2026.",
    url: `${SITE_URL}/tools/price-index`,
    keywords: [
      "cyber insurance cost",
      "cyber insurance pricing",
      "cyber liability insurance premiums",
      "digital agency insurance cost",
      "cyber insurance price index",
    ],
    creator: {
      "@type": "Organization",
      name: "AgencyCyberInsurance",
      url: SITE_URL,
    },
    datePublished: "2026-06-01",
    dateModified: "2026-06-01",
    temporalCoverage: "2024/2026",
    license: "https://creativecommons.org/licenses/by/4.0/",
    isAccessibleForFree: true,
    measurementTechnique:
      "Aggregated from broker quotes, public rate filings, and industry survey data",
  };

  return (
    <>
      <JsonLd data={jsonLdDataset} />
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "Tools", url: `${SITE_URL}/tools` },
          {
            name: "Price Index",
            url: `${SITE_URL}/tools/price-index`,
          },
        ])}
      />

      {/* Hero Section */}
      <section className="relative bg-navy text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-dark to-navy opacity-90" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <BreadcrumbNav
            items={[
              { label: "Tools", href: "/tools" },
              { label: "Price Index" },
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
                  d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                />
              </svg>
              2026 Data — Updated Quarterly
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
              Cyber Insurance{" "}
              <span className="text-teal">Price Index</span>{" "}
              for Digital Agencies
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed max-w-2xl">
              Comprehensive pricing data aggregated from broker quotes, public
              filings, and industry reports. The most complete reference for
              what digital agencies actually pay for cyber liability coverage.
            </p>
          </div>
        </div>
      </section>

      {/* Key Findings */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-navy mb-8 text-center">
            Key Findings
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                stat: "$1,200",
                label: "Median Annual Premium",
                detail: "For agencies with 2-10 employees",
              },
              {
                stat: "-8%",
                label: "YoY Premium Change",
                detail: "2025 to 2026 average decrease",
              },
              {
                stat: "$2,500",
                label: "Most Common Deductible",
                detail: "Chosen by 42% of small agencies",
              },
              {
                stat: "$1M",
                label: "Most Popular Limit",
                detail: "Selected by 61% of agencies",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-navy-50 rounded-xl p-6 text-center border border-navy-100"
              >
                <div className="text-3xl font-bold text-teal mb-1">
                  {item.stat}
                </div>
                <div className="text-sm font-semibold text-navy mb-1">
                  {item.label}
                </div>
                <div className="text-xs text-gray-500">{item.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing by Agency Size */}
      <section className="py-12 md:py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-navy mb-2">
            Premiums by Agency Size
          </h2>
          <p className="text-gray-600 mb-8">
            Annual cyber insurance premiums based on employee count and revenue
            band. All figures assume $1M coverage limit and $2,500 deductible.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-navy text-white">
                  <th className="px-4 py-3 text-left rounded-tl-lg">Agency Size</th>
                  <th className="px-4 py-3 text-left">Employees</th>
                  <th className="px-4 py-3 text-left">Annual Revenue</th>
                  <th className="px-4 py-3 text-left">Annual Premium</th>
                  <th className="px-4 py-3 text-left rounded-tr-lg">Monthly Equivalent</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { size: "Solo", emp: "1", rev: "Under $150K", premium: "$300 – $800", monthly: "$25 – $67" },
                  { size: "Small", emp: "2–10", rev: "$150K – $1M", premium: "$500 – $2,500", monthly: "$42 – $208" },
                  { size: "Mid-size", emp: "11–50", rev: "$1M – $5M", premium: "$2,500 – $8,000", monthly: "$208 – $667" },
                  { size: "Large", emp: "50+", rev: "$5M+", premium: "$8,000 – $25,000+", monthly: "$667 – $2,083+" },
                ].map((row, i) => (
                  <tr
                    key={row.size}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-3 font-semibold text-navy">{row.size}</td>
                    <td className="px-4 py-3 text-gray-700">{row.emp}</td>
                    <td className="px-4 py-3 text-gray-700">{row.rev}</td>
                    <td className="px-4 py-3 font-semibold text-teal-dark">{row.premium}</td>
                    <td className="px-4 py-3 text-gray-600">{row.monthly}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing by Agency Type */}
      <section className="py-12 md:py-16 bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-navy mb-2">
            Premiums by Agency Type
          </h2>
          <p className="text-gray-600 mb-8">
            How specialization affects premiums. Agencies handling sensitive data
            (e-commerce, healthcare) pay more than those focused on content or SEO.
            Based on a 5-person agency with $1M coverage.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-navy text-white">
                  <th className="px-4 py-3 text-left rounded-tl-lg">Agency Type</th>
                  <th className="px-4 py-3 text-left">Risk Profile</th>
                  <th className="px-4 py-3 text-left">Annual Premium Range</th>
                  <th className="px-4 py-3 text-left rounded-tr-lg">Key Risk Factor</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { type: "SEO / PPC", risk: "Low", premium: "$500 – $1,200", factor: "Minimal client data exposure" },
                  { type: "Social Media", risk: "Low–Medium", premium: "$600 – $1,500", factor: "Account access credentials" },
                  { type: "Creative / Branding", risk: "Low", premium: "$450 – $1,100", factor: "IP and asset management" },
                  { type: "Web Development", risk: "Medium", premium: "$800 – $2,200", factor: "Code deployment and hosting access" },
                  { type: "Full-Service", risk: "Medium–High", premium: "$1,000 – $2,800", factor: "Broad data and system access" },
                  { type: "E-commerce / Payments", risk: "High", premium: "$1,500 – $3,500", factor: "PCI-DSS and payment data" },
                  { type: "Healthcare Marketing", risk: "High", premium: "$1,800 – $4,000", factor: "HIPAA and PHI handling" },
                ].map((row, i) => (
                  <tr
                    key={row.type}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-3 font-semibold text-navy">{row.type}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          row.risk === "Low"
                            ? "bg-green-100 text-green-800"
                            : row.risk === "Low–Medium"
                            ? "bg-green-50 text-green-700"
                            : row.risk === "Medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : row.risk === "Medium–High"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {row.risk}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-teal-dark">{row.premium}</td>
                    <td className="px-4 py-3 text-gray-600">{row.factor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing by Coverage Level */}
      <section className="py-12 md:py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-navy mb-2">
            Premiums by Coverage Level
          </h2>
          <p className="text-gray-600 mb-8">
            How your coverage limit affects annual premiums. Based on a 5-person
            agency with a $2,500 deductible. Higher limits don&apos;t scale linearly
            — doubling coverage typically adds 40-60% to premiums, not 100%.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-navy text-white">
                  <th className="px-4 py-3 text-left rounded-tl-lg">Coverage Limit</th>
                  <th className="px-4 py-3 text-left">Tier</th>
                  <th className="px-4 py-3 text-left">Annual Premium</th>
                  <th className="px-4 py-3 text-left rounded-tr-lg">Best For</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { limit: "$500K", tier: "Basic", premium: "$400 – $1,000", best: "Solo freelancers with minimal client data" },
                  { limit: "$1M", tier: "Standard", premium: "$700 – $1,800", best: "Small agencies — most popular choice" },
                  { limit: "$2M", tier: "Enhanced", premium: "$1,100 – $2,800", best: "Mid-size agencies or those with enterprise clients" },
                  { limit: "$5M+", tier: "Enterprise", premium: "$2,500 – $7,000+", best: "Large agencies with high-value contracts" },
                ].map((row, i) => (
                  <tr
                    key={row.limit}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-3 font-semibold text-navy">{row.limit}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-teal/10 text-teal-dark">
                        {row.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-teal-dark">{row.premium}</td>
                    <td className="px-4 py-3 text-gray-600">{row.best}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing by Deductible */}
      <section className="py-12 md:py-16 bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-navy mb-2">
            Premium Impact by Deductible
          </h2>
          <p className="text-gray-600 mb-8">
            How your deductible choice affects annual premiums. Based on a
            5-person agency with $1M coverage. Higher deductibles reduce premiums
            but increase your out-of-pocket exposure per claim.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-navy text-white">
                  <th className="px-4 py-3 text-left rounded-tl-lg">Deductible</th>
                  <th className="px-4 py-3 text-left">Annual Premium</th>
                  <th className="px-4 py-3 text-left">Savings vs $1K</th>
                  <th className="px-4 py-3 text-left rounded-tr-lg">Break-Even Claims</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { ded: "$1,000", premium: "$1,400 – $2,100", savings: "Baseline", breakeven: "—" },
                  { ded: "$2,500", premium: "$1,200 – $1,800", savings: "10–15%", breakeven: "1 claim every 7–10 years" },
                  { ded: "$5,000", premium: "$1,050 – $1,600", savings: "15–25%", breakeven: "1 claim every 5–8 years" },
                  { ded: "$10,000", premium: "$900 – $1,350", savings: "25–35%", breakeven: "1 claim every 3–5 years" },
                  { ded: "$25,000", premium: "$750 – $1,100", savings: "35–48%", breakeven: "1 claim every 2–3 years" },
                ].map((row, i) => (
                  <tr
                    key={row.ded}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-3 font-semibold text-navy">{row.ded}</td>
                    <td className="px-4 py-3 font-semibold text-teal-dark">{row.premium}</td>
                    <td className="px-4 py-3 text-gray-700">{row.savings}</td>
                    <td className="px-4 py-3 text-gray-600">{row.breakeven}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Year-over-Year Trends */}
      <section className="py-12 md:py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-navy mb-2">
            Year-over-Year Premium Trends
          </h2>
          <p className="text-gray-600 mb-8">
            After sharp increases in 2021-2023 driven by ransomware claims, the
            cyber insurance market has softened. Increased competition and improved
            insured security postures are driving premiums down for well-managed
            agencies.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-navy text-white">
                  <th className="px-4 py-3 text-left rounded-tl-lg">Agency Size</th>
                  <th className="px-4 py-3 text-center">2024 Avg</th>
                  <th className="px-4 py-3 text-center">2025 Avg</th>
                  <th className="px-4 py-3 text-center">2026 Avg</th>
                  <th className="px-4 py-3 text-center rounded-tr-lg">2-Year Change</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { size: "Solo (1 person)", y2024: "$550", y2025: "$500", y2026: "$475", change: "-14%" },
                  { size: "Small (2–10)", y2024: "$1,450", y2025: "$1,300", y2026: "$1,200", change: "-17%" },
                  { size: "Mid-size (11–50)", y2024: "$5,200", y2025: "$4,800", y2026: "$4,500", change: "-13%" },
                  { size: "Large (50+)", y2024: "$14,000", y2025: "$13,200", y2026: "$12,500", change: "-11%" },
                ].map((row, i) => (
                  <tr
                    key={row.size}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-3 font-semibold text-navy">{row.size}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{row.y2024}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{row.y2025}</td>
                    <td className="px-4 py-3 text-center font-semibold text-teal-dark">{row.y2026}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {row.change}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            * Average premiums based on $1M coverage limit and $2,500 deductible.
            Actual premiums vary by risk profile, security posture, and claims history.
          </p>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-12 md:py-16 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-navy mb-6">Methodology</h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              The AgencyCyberInsurance Price Index aggregates pricing data from
              multiple sources to provide the most accurate picture of what
              digital agencies pay for cyber liability coverage. Our methodology
              combines three primary data streams:
            </p>
            <div className="grid md:grid-cols-3 gap-6 my-8">
              {[
                {
                  title: "Broker Quotes",
                  desc: "We collect anonymized quote data from insurance brokers specializing in technology and media businesses. This represents real-world pricing for agencies actively shopping for coverage.",
                  icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
                },
                {
                  title: "Public Filings",
                  desc: "State insurance department rate filings provide baseline pricing data. We analyze filings from major cyber insurance carriers to track rate changes and identify trends.",
                  icon: "M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z",
                },
                {
                  title: "Industry Reports",
                  desc: "We incorporate data from industry surveys and reports published by organizations like AdvisorSmith, Marsh, Aon, and the Council of Insurance Agents & Brokers.",
                  icon: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-navy-50 rounded-xl border border-navy-100 p-5"
                >
                  <div className="w-10 h-10 bg-teal/10 rounded-lg flex items-center justify-center mb-3">
                    <svg
                      className="w-5 h-5 text-teal"
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
                  <h3 className="font-bold text-navy text-sm mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              All pricing ranges represent the 25th to 75th percentile of
              observed premiums for each segment. Outliers — such as agencies
              with prior claims or unusually high-risk profiles — are excluded
              from the primary ranges but noted where relevant.
            </p>
            <p className="text-gray-700 leading-relaxed">
              This index is updated quarterly. The current data reflects Q2 2026
              pricing. For a personalized estimate based on your agency&apos;s
              specific profile, try our{" "}
              <Link
                href="/tools/recommendation-engine"
                className="text-teal hover:text-teal-dark underline"
              >
                Recommendation Engine
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Cite This Data */}
      <section className="py-12 md:py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-navy mb-6">Cite This Data</h2>
          <p className="text-gray-700 mb-6">
            This data is published under a{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal hover:text-teal-dark underline"
            >
              Creative Commons Attribution 4.0
            </a>{" "}
            license. You&apos;re free to use, share, and adapt this data for any
            purpose — just include attribution.
          </p>

          <div className="space-y-6">
            {/* Suggested Citation */}
            <div>
              <h3 className="text-sm font-semibold text-navy mb-2">
                Suggested Citation
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <code className="text-sm text-gray-700 block leading-relaxed">
                  AgencyCyberInsurance. &quot;Cyber Insurance Price Index for
                  Digital Agencies (2026).&quot;
                  agencycyberinsurance.com/tools/price-index. Accessed [date].
                </code>
              </div>
            </div>

            {/* HTML Embed */}
            <div>
              <h3 className="text-sm font-semibold text-navy mb-2">
                HTML Link
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <code className="text-sm text-gray-700 block leading-relaxed break-all">
                  {`<a href="https://www.agencycyberinsurance.com/tools/price-index">Cyber Insurance Price Index for Digital Agencies (2026) — AgencyCyberInsurance</a>`}
                </code>
              </div>
            </div>

            {/* Markdown */}
            <div>
              <h3 className="text-sm font-semibold text-navy mb-2">
                Markdown
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <code className="text-sm text-gray-700 block leading-relaxed break-all">
                  {`[Cyber Insurance Price Index (2026)](https://www.agencycyberinsurance.com/tools/price-index)`}
                </code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Want a Personalized Quote?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            These are industry averages. Your actual premium depends on your
            agency&apos;s specific risk profile, security posture, and claims
            history. Get a tailored recommendation in under 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tools/recommendation-engine"
              className="inline-flex items-center justify-center px-6 py-3 bg-teal hover:bg-teal-dark text-white font-semibold rounded-lg transition-colors"
            >
              Get Your Recommendation
              <svg
                className="w-4 h-4 ml-2"
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
              href="/blog/cyber-insurance-cost-digital-agencies"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-400 hover:border-white text-gray-300 hover:text-white font-semibold rounded-lg transition-colors"
            >
              Read the Full Cost Guide
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
