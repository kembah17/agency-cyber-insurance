import { AffiliateProvider } from "./types";

/**
 * Centralized affiliate link and provider management.
 * All affiliate URLs are managed here for easy updates.
 */

export const AFFILIATE_PROVIDERS: Record<string, AffiliateProvider> = {
  "coalition": {
    name: "Coalition",
    slug: "coalition",
    url: "https://www.coalitioninc.com/cyber-insurance?ref=agencycyberinsurance",
    description: "AI-powered cyber insurance built for technology companies. Coalition offers comprehensive coverage with active risk monitoring and threat intelligence.",
    rating: 4.8,
    pros: [
      "Active risk monitoring included",
      "AI-powered threat detection",
      "Fast online quoting process",
      "Tailored for tech companies",
      "Incident response team included"
    ],
    cons: [
      "Premium pricing for smaller agencies",
      "US-focused coverage"
    ],
    features: {
      "Coverage Limit": "Up to $15M",
      "Deductible Options": "$1K - $50K",
      "Risk Monitoring": true,
      "Incident Response": true,
      "Regulatory Defense": true,
      "Business Interruption": true,
      "Social Engineering": true,
      "Best For": "Tech-savvy agencies wanting proactive protection"
    },
    pricing: "~$100/mo",
    cta_text: "Get a Coalition Quote",
    commission_note: "We may earn a commission if you purchase through this link."
  },
  "hiscox": {
    name: "Hiscox",
    slug: "hiscox",
    url: "https://www.hiscox.com/cyber-insurance?ref=agencycyberinsurance",
    description: "Established insurer with specialized small business cyber coverage. Hiscox offers flexible policies that scale with your agency.",
    rating: 4.5,
    pros: [
      "Strong reputation and financial stability",
      "Flexible policy customization",
      "Good for small to mid-size agencies",
      "UK and US coverage available",
      "Competitive pricing"
    ],
    cons: [
      "Less tech-focused than newer providers",
      "Quoting process can be slower"
    ],
    features: {
      "Coverage Limit": "Up to $5M",
      "Deductible Options": "$1K - $25K",
      "Risk Monitoring": false,
      "Incident Response": true,
      "Regulatory Defense": true,
      "Business Interruption": true,
      "Social Engineering": true,
      "Best For": "Established agencies wanting reliable coverage"
    },
    pricing: "~$65/mo",
    cta_text: "Get a Hiscox Quote",
    commission_note: "We may earn a commission if you purchase through this link."
  },
  "embroker": {
    name: "Embroker",
    slug: "embroker",
    url: "https://www.embroker.com/cyber-liability?ref=agencycyberinsurance",
    description: "Modern digital-first insurance platform designed for startups and tech companies. Embroker streamlines the entire insurance process.",
    rating: 4.6,
    pros: [
      "Fully digital application process",
      "Bundled coverage options",
      "Startup-friendly pricing",
      "Fast policy issuance",
      "Excellent customer portal"
    ],
    cons: [
      "Newer company, less track record",
      "US-only coverage"
    ],
    features: {
      "Coverage Limit": "Up to $10M",
      "Deductible Options": "$2.5K - $25K",
      "Risk Monitoring": false,
      "Incident Response": true,
      "Regulatory Defense": true,
      "Business Interruption": true,
      "Social Engineering": true,
      "Best For": "Digital-first agencies wanting a modern experience"
    },
    pricing: "~$80/mo",
    cta_text: "Get an Embroker Quote",
    commission_note: "We may earn a commission if you purchase through this link."
  },
  "chubb": {
    name: "Chubb",
    slug: "chubb",
    url: "https://www.chubb.com/cyber-insurance?ref=agencycyberinsurance",
    description: "Global insurance leader with enterprise-grade cyber coverage. Chubb provides the most comprehensive policies for agencies handling sensitive client data.",
    rating: 4.7,
    pros: [
      "Industry-leading coverage breadth",
      "Global coverage available",
      "Excellent claims handling",
      "Strong financial ratings (A++)",
      "Comprehensive risk management resources"
    ],
    cons: [
      "Higher premiums",
      "More complex application process",
      "Better suited for larger agencies"
    ],
    features: {
      "Coverage Limit": "Up to $25M+",
      "Deductible Options": "$5K - $100K",
      "Risk Monitoring": true,
      "Incident Response": true,
      "Regulatory Defense": true,
      "Business Interruption": true,
      "Social Engineering": true,
      "Best For": "Larger agencies needing enterprise-grade protection"
    },
    pricing: "~$150/mo",
    cta_text: "Get a Chubb Quote",
    commission_note: "We may earn a commission if you purchase through this link."
  }
};

/**
 * Get affiliate provider by key
 */
export function getProvider(key: string): AffiliateProvider | undefined {
  return AFFILIATE_PROVIDERS[key];
}

/**
 * Get all providers as array
 */
export function getAllProviders(): AffiliateProvider[] {
  return Object.values(AFFILIATE_PROVIDERS);
}

/**
 * Get provider URL with tracking parameters
 */
export function getAffiliateUrl(providerKey: string, source?: string): string {
  const provider = AFFILIATE_PROVIDERS[providerKey];
  if (!provider) return "#";
  const url = new URL(provider.url);
  if (source) url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", "affiliate");
  url.searchParams.set("utm_campaign", "agencycyberinsurance");
  return url.toString();
}
