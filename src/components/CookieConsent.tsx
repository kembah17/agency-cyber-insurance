"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/**
 * Lightweight cookie consent banner.
 * - Shows on first visit (no preference stored)
 * - Stores preference in localStorage as "cookie_consent"
 * - Dispatches custom event "cookie_consent_update" so GoogleAnalytics can react
 * - If declined, GA4 will not load
 */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      // Small delay so it doesn't flash on page load
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
    window.dispatchEvent(new Event("cookie_consent_update"));
  };

  const handleDecline = () => {
    localStorage.setItem("cookie_consent", "declined");
    setVisible(false);
    window.dispatchEvent(new Event("cookie_consent_update"));
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom">
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl shadow-lg p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 text-sm text-gray-600">
          <p>
            We use cookies to analyze site traffic and improve your experience.
            No personal data is sold.{" "}
            <Link
              href="/disclaimer"
              className="text-teal underline hover:text-teal/80"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm font-medium text-white bg-teal rounded-lg hover:bg-teal/90 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
