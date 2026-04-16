import type { Metadata } from "next";
import CheckoutButton from "@/components/CheckoutButton";

export const metadata: Metadata = {
  title: "Pricing - Premium Cyber Insurance Services | AgencyCyberInsurance",
  description:
    "Get premium policy analysis, security readiness assessments, and annual cyber insurance reviews. Plans starting at $49. Money-back guarantee.",
  openGraph: {
    title: "Pricing - Premium Cyber Insurance Services",
    description:
      "Get premium policy analysis, security readiness assessments, and annual cyber insurance reviews. Plans starting at $49.",
    url: "https://agencycyberinsurance.com/pricing",
  },
};

const TIERS = [
  {
    name: "Premium Policy Analysis",
    price: "$49",
    frequency: "one-time",
    description:
      "Deep-dive analysis of your cyber insurance policy with personalized recommendations.",
    priceId: "price_premium_analysis",
    mode: "payment" as const,
    featured: false,
    features: [
      "Detailed PDF report with personalized recommendations",
      "Priority coverage gap analysis",
      "Provider-specific suggestions",
      "30-day email support",
    ],
  },
  {
    name: "Security Readiness Assessment",
    price: "$199",
    frequency: "one-time",
    description:
      "Comprehensive security audit to lower your premiums and strengthen your posture.",
    priceId: "price_security_assessment",
    mode: "payment" as const,
    featured: true,
    features: [
      "Comprehensive security audit questionnaire",
      "Custom risk score with benchmarking",
      "Remediation roadmap",
      "30-min consultation booking",
      "90-day email support",
    ],
  },
  {
    name: "Annual Cyber Insurance Review",
    price: "$149",
    frequency: "/year",
    description:
      "Ongoing monitoring and optimization of your cyber insurance coverage.",
    priceId: "price_annual_review",
    mode: "subscription" as const,
    featured: false,
    features: [
      "Quarterly policy reviews",
      "Market rate monitoring",
      "Renewal optimization alerts",
      "Priority support",
      "Annual savings report",
    ],
  },
];

const FAQS = [
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express) and debit cards through our secure Stripe payment processor.",
  },
  {
    question: "Is there a money-back guarantee?",
    answer:
      "Yes! We offer a 30-day money-back guarantee on all one-time purchases. If you\u0027re not satisfied with your report or assessment, contact us for a full refund.",
  },
  {
    question: "How quickly will I receive my report?",
    answer:
      "Premium Policy Analysis reports are delivered within 24 hours. Security Readiness Assessments take 3-5 business days to complete thoroughly.",
  },
  {
    question: "Can I cancel my annual subscription?",
    answer:
      "Absolutely. You can cancel your Annual Cyber Insurance Review subscription at any time. You\u0027ll continue to have access until the end of your billing period.",
  },
  {
    question: "Do you offer discounts for multiple policies?",
    answer:
      "Yes, we offer volume discounts for agencies managing multiple policies. Contact us for custom pricing.",
  },
  {
    question: "Is my payment information secure?",
    answer:
      "All payments are processed through Stripe, a PCI Level 1 certified payment processor. We never store your card details on our servers.",
  },
];

export default function PricingPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-navy via-navy/95 to-white pt-20 pb-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Protect Your Agency with Confidence
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Expert cyber insurance analysis and security assessments tailored
            for digital agencies. Choose the plan that fits your needs.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="-mt-20 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {TIERS.map((tier) => (
              <div
                key={tier.priceId}
                className={`relative bg-white rounded-2xl shadow-lg p-8 flex flex-col ${
                  tier.featured
                    ? "border-2 border-teal ring-1 ring-teal/20 scale-[1.02] md:scale-105"
                    : "border border-gray-200"
                }`}
              >
                {tier.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-4 py-1.5 bg-teal text-white text-xs font-bold rounded-full uppercase tracking-wider">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-navy mb-2">
                    {tier.name}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-navy">
                    {tier.price}
                  </span>
                  <span className="text-gray-500 ml-1">
                    {tier.frequency}
                  </span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-teal shrink-0 mt-0.5"
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
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <CheckoutButton
                  priceId={tier.priceId}
                  mode={tier.mode}
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-center transition-colors ${
                    tier.featured
                      ? "bg-teal text-white hover:bg-teal/90"
                      : "bg-navy text-white hover:bg-navy/90"
                  }`}
                >
                  {tier.mode === "subscription"
                    ? "Subscribe Now"
                    : "Get Started"}
                </CheckoutButton>
              </div>
            ))}
          </div>

          {/* Money-back guarantee */}
          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-5 py-2.5">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-medium text-green-800">
                30-day money-back guarantee on all one-time purchases
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600">
              Everything you need to know about our services and pricing.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq) => (
              <div
                key={faq.question}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <h3 className="font-bold text-navy mb-2">{faq.question}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-gray-500 text-sm">
              Still have questions?{" "}
              <a
                href="/contact"
                className="text-teal font-semibold hover:underline"
              >
                Contact our team
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
