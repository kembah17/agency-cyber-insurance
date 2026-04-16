import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Payment Cancelled | AgencyCyberInsurance",
  robots: { index: false, follow: false },
};

export default function CheckoutCancelPage() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        {/* Neutral Icon */}
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-gray-500"
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
        </div>

        <h1 className="text-3xl font-bold text-navy mb-3">
          Payment Cancelled
        </h1>
        <p className="text-gray-600 text-lg mb-2">
          No charges were made to your account.
        </p>
        <p className="text-gray-500 mb-8">
          If you changed your mind or ran into an issue, feel free to try again
          or reach out to our support team.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/pricing"
            className="px-6 py-3 bg-teal text-white font-semibold rounded-lg hover:bg-teal/90 transition-colors"
          >
            Return to Pricing
          </Link>
          <Link
            href="/contact"
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </main>
  );
}
