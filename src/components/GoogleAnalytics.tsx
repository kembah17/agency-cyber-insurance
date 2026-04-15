"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Google Analytics 4 component.
 * - Only renders if NEXT_PUBLIC_GA_MEASUREMENT_ID is set
 * - Checks cookie consent before loading (localStorage "cookie_consent")
 * - Uses next/script with afterInteractive strategy
 * - Sets anonymize_ip for privacy
 */
export default function GoogleAnalytics() {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (consent === "accepted") {
      setHasConsent(true);
    }

    // Listen for consent changes (from CookieConsent component)
    const handleConsentChange = () => {
      const updated = localStorage.getItem("cookie_consent");
      setHasConsent(updated === "accepted");
    };

    window.addEventListener("cookie_consent_update", handleConsentChange);
    return () => {
      window.removeEventListener("cookie_consent_update", handleConsentChange);
    };
  }, []);

  // Don't render if no measurement ID or no consent
  if (!GA_MEASUREMENT_ID || !hasConsent) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics-config"
        strategy="afterInteractive"
      >
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            anonymize_ip: true,
            cookie_flags: 'SameSite=None;Secure'
          });
        `}
      </Script>
    </>
  );
}
