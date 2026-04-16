import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Payment Successful | AgencyCyberInsurance",
  robots: { index: false, follow: false },
};

function SuccessContent() {
  return (
    <div className="text-center">
      {/* Green Checkmark */}
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-10 h-10 text-green-600"
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
      </div>

      <h1 className="text-3xl font-bold text-navy mb-3">
        Payment Successful!
      </h1>
      <p className="text-gray-600 text-lg mb-2">
        Thank you for your purchase.
      </p>
      <p className="text-gray-500 mb-8">
        You&apos;ll receive a confirmation email shortly with details about your
        order and next steps.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/"
          className="px-6 py-3 bg-teal text-white font-semibold rounded-lg hover:bg-teal/90 transition-colors"
        >
          Return to Home
        </Link>
        <Link
          href="/pricing"
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-colors"
        >
          View Your Dashboard
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-lg mx-auto px-4 py-20">
        <Suspense
          fallback={
            <div className="text-center text-gray-500">Loading...</div>
          }
        >
          <SuccessContent />
        </Suspense>
      </div>
    </main>
  );
}
