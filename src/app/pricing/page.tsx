import type { Metadata } from "next";
import CheckoutButton from "@/components/CheckoutButton";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing - Free & Premium Cyber Insurance Analysis | AgencyCyberInsurance",
  description:
    "Analyze your cyber insurance policy for free or unlock a detailed 27-area gap analysis with our Premium Report. One-time $39 purchase with money-back guarantee.",
  openGraph: {
    title: "Pricing - Free & Premium Cyber Insurance Analysis",
    description:
      "Analyze your cyber insurance policy for free or unlock a detailed 27-area gap analysis with our Premium Report. One-time $39.",
    url: "https://agencycyberinsurance.com/pricing",
  },
};

const COMPARISON_FEATURES = [
  { feature: "Coverage areas analyzed", free: "Top 5 gaps", premium: "All 27 areas" },
  { feature: "Overall risk score", free: true, premium: true },
  { feature: "Gap severity ratings", free: "High-level", premium: "Detailed per-area" },
  { feature: "Provider recommendations", free: "Generic", premium: "Tailored to your gaps" },
  { feature: "Remediation steps", free: false, premium: true },
  { feature: "Coverage comparison matrix", free: false, premium: true },
  { feature: "Dollar-amount risk exposure", free: false, premium: true },
  { feature: "Downloadable PDF report", free: false, premium: true },
  { feature: "Broker-ready summary", free: false, premium: true },
  { feature: "Priority action roadmap", free: false, premium: true },
];

const FAQS = [
  {
    question: "What do I get with the free analysis?",
    answer:
      "Our free Policy Scrutinizer gives you an overall risk score and identifies your top 5 coverage gaps with general recommendations. It’s a great starting point to understand where your policy might fall short.",
  },
  {
    question: "What’s included in the Premium Report?",
    answer:
      "The Premium Report is a comprehensive PDF covering all 27 coverage areas. You get detailed gap analysis, dollar-amount risk exposure estimates, a provider comparison matrix tailored to your needs, step-by-step remediation guidance, and a broker-ready summary you can take directly to your insurance provider.",
  },
  {
    question: "How quickly will I receive my report?",
    answer:
      "Premium Reports are generated instantly after purchase. You’ll receive a downloadable PDF within seconds of completing your payment.",
  },
  {
    question: "Is there a money-back guarantee?",
    answer:
      "Yes. We offer a 30-day money-back guarantee. If the Premium Report doesn’t help you identify actionable improvements to your coverage, contact us for a full refund.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit and debit cards (Visa, Mastercard, American Express) through Stripe, a PCI Level 1 certified payment processor. We never store your card details.",
  },
  {
    question: "Is this a subscription?",
    answer:
      "No. The Premium Report is a one-time purchase. No recurring charges, no hidden fees. Pay once, download your report, and use it however you need.",
  },
];

export default function PricingPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-navy via-navy/95 to-gray-50 pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Know Exactly Where Your Policy Falls Short
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Start with a free analysis. Upgrade to the Premium Report when you’re ready for the full picture.
          </p>
        </div>
      </section>

      {/* Pricing Cards - Side by Side */}
      <section className="-mt-8 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free Tier */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-navy mb-1">Free Analysis</h3>
                <p className="text-sm text-gray-500">Quick snapshot of your coverage gaps</p>
              </div>
              <div className="mb-5">
                <span className="text-4xl font-bold text-navy">$0</span>
                <span className="text-gray-500 ml-1 text-sm">forever free</span>
              </div>
              <ul className="space-y-2.5 mb-6 flex-1">
                <li className="flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-teal shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-700">Overall risk score</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-teal shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-700">Top 5 coverage gaps identified</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-teal shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-700">General provider recommendations</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-teal shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-700">High-level severity ratings</span>
                </li>
              </ul>
              <Link
                href="/tools/scrutinizer"
                className="w-full py-3 px-6 rounded-lg font-semibold text-center transition-colors bg-gray-100 text-navy hover:bg-gray-200 block"
              >
                Try Free Analysis
              </Link>
            </div>

            {/* Premium Tier */}
            <div className="relative bg-white rounded-2xl border-2 border-teal shadow-lg p-6 flex flex-col ring-1 ring-teal/20">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center px-4 py-1 bg-teal text-white text-xs font-bold rounded-full uppercase tracking-wider">
                  Best Value
                </span>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-navy mb-1">Premium Gap Analysis</h3>
                <p className="text-sm text-gray-500">Complete 27-area deep dive with actionable report</p>
              </div>
              <div className="mb-5">
                <span className="text-4xl font-bold text-navy">$39</span>
                <span className="text-gray-500 ml-1 text-sm">one-time</span>
              </div>
              <ul className="space-y-2.5 mb-6 flex-1">
                <li className="flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-teal shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-700"><strong>Everything in Free</strong>, plus:</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-teal shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-700">All 27 coverage areas analyzed in detail</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-teal shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-700">Dollar-amount risk exposure estimates</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-teal shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-700">Provider comparison matrix for your needs</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-teal shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-700">Step-by-step remediation roadmap</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-teal shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-gray-700">Downloadable PDF — broker-ready</span>
                </li>
              </ul>
              <CheckoutButton
                priceId="price_premium_analysis"
                mode="payment"
                className="w-full py-3 px-6 rounded-lg font-semibold text-center transition-colors bg-teal text-white hover:bg-teal/90"
              >
                Get Premium Report — $39
              </CheckoutButton>
            </div>
          </div>

          {/* Money-back guarantee */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-5 py-2">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-green-800">
                30-day money-back guarantee · No subscription · Instant delivery
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-navy text-center mb-8">
            Feature Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 pr-4 text-sm font-semibold text-gray-600">Feature</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600 w-28">Free</th>
                  <th className="text-center py-3 pl-4 text-sm font-semibold text-teal w-28">Premium</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="py-3 pr-4 text-sm text-gray-700">{row.feature}</td>
                    <td className="py-3 px-4 text-center">
                      {row.free === true ? (
                        <svg className="w-5 h-5 text-teal mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : row.free === false ? (
                        <svg className="w-5 h-5 text-gray-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : (
                        <span className="text-xs text-gray-500">{row.free}</span>
                      )}
                    </td>
                    <td className="py-3 pl-4 text-center">
                      {row.premium === true ? (
                        <svg className="w-5 h-5 text-teal mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-xs text-teal font-medium">{row.premium}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-navy text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <div key={faq.question} className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-bold text-navy mb-1.5 text-sm">{faq.question}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Still have questions?{" "}
              <a href="/contact" className="text-teal font-semibold hover:underline">
                Get in touch
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
