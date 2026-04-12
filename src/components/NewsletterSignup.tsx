"use client";

import { useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with email service (Brevo, ConvertKit, etc.)
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-teal/10 border border-teal/30 rounded-xl p-6 text-center">
        <svg
          className="w-10 h-10 text-teal mx-auto mb-3"
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
        <h3 className="text-lg font-bold text-navy">You’re on the list!</h3>
        <p className="text-warm-gray text-sm mt-1">
          We’ll send you our best cyber insurance insights. No spam, ever.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-navy rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-1">
        Stay Protected, Stay Informed
      </h3>
      <p className="text-gray-400 text-sm mb-4">
        Get our latest cyber insurance guides, policy comparisons, and risk
        management tips delivered to your inbox.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 px-4 py-3 rounded-lg text-sm bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-teal text-white font-semibold rounded-lg hover:bg-teal-light transition-colors text-sm whitespace-nowrap"
        >
          Subscribe
        </button>
      </form>
      <p className="text-xs text-gray-500 mt-3">
        No spam. Unsubscribe anytime. We respect your privacy.
      </p>
    </div>
  );
}
