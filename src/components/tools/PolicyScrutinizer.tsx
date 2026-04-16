"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AFFILIATE_PROVIDERS, getAffiliateUrl } from "@/lib/affiliates";
import { trackToolUsage, trackCTAClick } from "@/lib/analytics";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type Severity = "Critical" | "High" | "Medium" | "Low";

interface CoverageArea {
  id: string;
  name: string;
  category: "first-party" | "third-party" | "policy-terms";
  keywords: string[];
  severity: Severity;
  financialExposure: string;
  recommendation: string;
  providerKey: string;
}

interface AnalysisResult {
  area: CoverageArea;
  found: boolean;
  matchedKeywords: string[];
}

interface AnalysisSummary {
  overallScore: number;
  results: AnalysisResult[];
  covered: AnalysisResult[];
  gaps: AnalysisResult[];
  criticalGaps: number;
  highGaps: number;
  mediumGaps: number;
  lowGaps: number;
}

/* ------------------------------------------------------------------ */
/*  Coverage Areas Database                                            */
/* ------------------------------------------------------------------ */
const COVERAGE_AREAS: CoverageArea[] = [
  // --- First-Party Coverage ---
  {
    id: "data-breach-response",
    name: "Data Breach Response Costs",
    category: "first-party",
    keywords: ["breach response", "data breach", "breach cost", "breach expense", "incident response cost", "breach remediation", "data compromise"],
    severity: "Critical",
    financialExposure: "$100K–$1M+",
    recommendation: "Data breach response coverage is essential. The average cost of a data breach is $4.45M. Ensure your policy covers forensic investigation, legal counsel, and notification expenses.",
    providerKey: "coalition",
  },
  {
    id: "business-interruption",
    name: "Business Interruption / System Downtime",
    category: "first-party",
    keywords: ["business interruption", "system downtime", "loss of income", "lost revenue", "business income", "network interruption", "system failure", "operational disruption"],
    severity: "Critical",
    financialExposure: "$50K–$500K",
    recommendation: "Business interruption coverage replaces lost income during a cyber event. For agencies billing hourly, even a few days of downtime can be devastating. Look for policies with waiting periods under 12 hours.",
    providerKey: "coalition",
  },
  {
    id: "ransomware-extortion",
    name: "Ransomware / Cyber Extortion",
    category: "first-party",
    keywords: ["ransomware", "cyber extortion", "extortion", "ransom payment", "ransom demand", "malicious encryption", "extortion threat", "crypto payment"],
    severity: "Critical",
    financialExposure: "$100K–$2M+",
    recommendation: "Ransomware attacks on agencies are surging. Ensure your policy covers ransom payments, negotiation costs, and system restoration. Some policies exclude ransomware — check carefully.",
    providerKey: "chubb",
  },
  {
    id: "data-recovery",
    name: "Data Recovery Costs",
    category: "first-party",
    keywords: ["data recovery", "data restoration", "data reconstruct", "system restoration", "backup restoration", "data recreation"],
    severity: "High",
    financialExposure: "$25K–$250K",
    recommendation: "Data recovery can be extremely expensive, especially for client campaign data and creative assets. Ensure coverage includes both electronic data restoration and recreation of lost data.",
    providerKey: "embroker",
  },
  {
    id: "crisis-management",
    name: "Crisis Management / PR Costs",
    category: "first-party",
    keywords: ["crisis management", "public relations", "reputation", "crisis communication", "media response", "pr expense", "reputational harm", "brand damage"],
    severity: "High",
    financialExposure: "$25K–$200K",
    recommendation: "A data breach can destroy client trust overnight. Crisis management coverage pays for PR firms, communication campaigns, and reputation repair — critical for client-facing agencies.",
    providerKey: "chubb",
  },
  {
    id: "notification-costs",
    name: "Notification Costs (Regulatory)",
    category: "first-party",
    keywords: ["notification cost", "breach notification", "notify affected", "notification expense", "regulatory notification", "notice requirement", "notification obligation"],
    severity: "High",
    financialExposure: "$50K–$500K",
    recommendation: "Most states require breach notification within 30-72 hours. Notification costs include legal review, mailing, call centers, and regulatory filings. At $1-3 per record, costs escalate quickly.",
    providerKey: "coalition",
  },
  {
    id: "credit-monitoring",
    name: "Credit Monitoring for Affected Individuals",
    category: "first-party",
    keywords: ["credit monitoring", "identity monitoring", "identity protection", "identity theft", "credit protection", "identity restoration"],
    severity: "Medium",
    financialExposure: "$10K–$100K",
    recommendation: "If you handle PII, you may be required to offer credit monitoring to affected individuals. At $10-25 per person per year, this adds up fast with large client databases.",
    providerKey: "hiscox",
  },
  {
    id: "forensic-investigation",
    name: "Forensic Investigation Costs",
    category: "first-party",
    keywords: ["forensic", "investigation cost", "forensic investigation", "forensic analysis", "digital forensic", "incident investigation", "root cause analysis"],
    severity: "High",
    financialExposure: "$50K–$500K",
    recommendation: "Forensic investigations determine how a breach occurred and what data was compromised. These specialized services typically cost $200-500/hour and are required for regulatory compliance.",
    providerKey: "coalition",
  },
  {
    id: "bricking-coverage",
    name: "Bricking Coverage (Hardware Damage)",
    category: "first-party",
    keywords: ["bricking", "hardware damage", "device damage", "equipment damage", "physical damage", "hardware replacement", "bricked device"],
    severity: "Medium",
    financialExposure: "$10K–$100K",
    recommendation: "Some cyber attacks can permanently damage hardware (\"bricking\"). This coverage pays to replace equipment rendered unusable by malware or cyber attacks. Often overlooked but increasingly important.",
    providerKey: "chubb",
  },
  {
    id: "social-engineering",
    name: "Social Engineering / Funds Transfer Fraud",
    category: "first-party",
    keywords: ["social engineering", "funds transfer", "wire fraud", "phishing", "impersonation fraud", "business email compromise", "bec", "invoice fraud", "payment diversion"],
    severity: "Critical",
    financialExposure: "$25K–$1M+",
    recommendation: "BEC and invoice fraud are the #1 cyber threat to agencies. Attackers impersonate clients or vendors to redirect payments. Ensure your policy explicitly covers social engineering with adequate sublimits.",
    providerKey: "coalition",
  },
  {
    id: "dependent-bi",
    name: "Dependent Business Interruption (Vendor Outage)",
    category: "first-party",
    keywords: ["dependent business", "vendor outage", "service provider", "third-party outage", "supply chain", "contingent business", "dependent system", "cloud outage"],
    severity: "High",
    financialExposure: "$25K–$300K",
    recommendation: "If AWS, Google Cloud, or a key SaaS tool goes down, your agency stops working. Dependent BI coverage protects against losses from your vendors\' outages — critical for cloud-dependent agencies.",
    providerKey: "embroker",
  },
  {
    id: "voluntary-shutdown",
    name: "Voluntary Shutdown Coverage",
    category: "first-party",
    keywords: ["voluntary shutdown", "proactive shutdown", "voluntary suspension", "precautionary shutdown", "self-imposed", "voluntary interruption"],
    severity: "Medium",
    financialExposure: "$10K–$150K",
    recommendation: "Sometimes you need to shut down systems proactively to prevent a breach from spreading. Without voluntary shutdown coverage, you absorb those losses. This is increasingly important as threat response evolves.",
    providerKey: "coalition",
  },
  // --- Third-Party Coverage ---
  {
    id: "privacy-liability",
    name: "Privacy Liability (Client Data Breach)",
    category: "third-party",
    keywords: ["privacy liability", "privacy claim", "data protection", "personal information", "privacy breach", "privacy violation", "data subject", "privacy wrongful act"],
    severity: "Critical",
    financialExposure: "$100K–$2M+",
    recommendation: "As an agency handling client data, you face direct liability for privacy breaches. This coverage defends against lawsuits from individuals whose data was compromised through your systems.",
    providerKey: "chubb",
  },
  {
    id: "network-security-liability",
    name: "Network Security Liability",
    category: "third-party",
    keywords: ["network security", "security liability", "security breach", "unauthorized access", "network attack", "security failure", "cyber liability", "security wrongful act"],
    severity: "Critical",
    financialExposure: "$100K–$1M+",
    recommendation: "If a breach at your agency spreads to client systems, you\u0027re liable. Network security liability covers claims arising from your failure to prevent unauthorized access, malware transmission, or denial of service.",
    providerKey: "coalition",
  },
  {
    id: "media-liability",
    name: "Media Liability / Content Errors",
    category: "third-party",
    keywords: ["media liability", "content liability", "defamation", "copyright", "intellectual property", "advertising injury", "media wrongful act", "content error", "plagiarism"],
    severity: "Medium",
    financialExposure: "$25K–$250K",
    recommendation: "Agencies creating content face risks of defamation, copyright infringement, and advertising injury claims. Media liability coverage is especially important for content, social media, and PR agencies.",
    providerKey: "hiscox",
  },
  {
    id: "regulatory-defense",
    name: "Regulatory Defense & Penalties",
    category: "third-party",
    keywords: ["regulatory", "regulatory defense", "regulatory proceeding", "regulatory penalty", "regulatory fine", "government investigation", "regulatory inquiry", "compliance penalty", "gdpr fine", "ccpa penalty"],
    severity: "High",
    financialExposure: "$50K–$1M+",
    recommendation: "GDPR fines can reach 4% of global revenue. CCPA penalties are $7,500 per intentional violation. Regulatory defense coverage pays for legal representation and, where insurable, the fines themselves.",
    providerKey: "chubb",
  },
  {
    id: "pci-dss",
    name: "PCI-DSS Fines & Assessments",
    category: "third-party",
    keywords: ["pci", "pci-dss", "payment card", "card brand", "pci fine", "pci assessment", "card industry", "payment processor"],
    severity: "High",
    financialExposure: "$50K–$500K",
    recommendation: "If you process or store payment card data, PCI-DSS fines can be $5,000-$100,000 per month until compliance is achieved. Ensure your policy covers PCI fines and assessments explicitly.",
    providerKey: "coalition",
  },
  {
    id: "contractual-liability",
    name: "Contractual Liability",
    category: "third-party",
    keywords: ["contractual liability", "contractual obligation", "indemnification", "hold harmless", "contractual penalty", "breach of contract", "service level", "sla"],
    severity: "Medium",
    financialExposure: "$25K–$500K",
    recommendation: "Many agency contracts include cyber-related indemnification clauses. Contractual liability coverage ensures your policy responds when you\u0027re held liable under contract terms for a cyber event.",
    providerKey: "embroker",
  },
  // --- Key Policy Terms ---
  {
    id: "retroactive-date",
    name: "Retroactive Date",
    category: "policy-terms",
    keywords: ["retroactive date", "retro date", "retroactive", "prior acts", "full prior acts", "inception date", "unlimited retroactive"],
    severity: "High",
    financialExposure: "$50K–$500K",
    recommendation: "The retroactive date determines how far back your coverage extends. Ideally, it should be \"unlimited\" or your original policy inception date. A recent retroactive date leaves gaps for undiscovered breaches.",
    providerKey: "chubb",
  },
  {
    id: "waiting-period",
    name: "Waiting Period for Business Interruption",
    category: "policy-terms",
    keywords: ["waiting period", "hour waiting", "hour deductible", "time deductible", "time retention", "hours before", "8 hour", "12 hour", "24 hour"],
    severity: "High",
    financialExposure: "$10K–$100K",
    recommendation: "The waiting period is the time before business interruption coverage kicks in. Look for 8 hours or less — a 24-hour waiting period means you absorb the first day of losses entirely.",
    providerKey: "coalition",
  },
  {
    id: "sublimits",
    name: "Sublimits on Coverage",
    category: "policy-terms",
    keywords: ["sublimit", "sub-limit", "sub limit", "maximum payable", "aggregate sublimit", "inner limit", "coverage limit of", "not to exceed"],
    severity: "High",
    financialExposure: "$25K–$500K",
    recommendation: "Sublimits cap specific coverages below your overall policy limit. A $1M policy with a $50K ransomware sublimit provides far less protection than it appears. Negotiate to remove or increase sublimits on critical coverages.",
    providerKey: "chubb",
  },
  {
    id: "coinsurance",
    name: "Coinsurance Requirements",
    category: "policy-terms",
    keywords: ["coinsurance", "co-insurance", "cost sharing", "percentage payable", "insured share", "retained percentage"],
    severity: "Medium",
    financialExposure: "$10K–$200K",
    recommendation: "Coinsurance means you pay a percentage of every claim beyond the deductible. A 20% coinsurance on a $500K claim means you pay $100K out of pocket. Avoid policies with coinsurance if possible.",
    providerKey: "hiscox",
  },
  {
    id: "war-exclusion",
    name: "War / Terrorism Exclusion Scope",
    category: "policy-terms",
    keywords: ["war exclusion", "terrorism", "act of war", "hostile act", "nation state", "state-sponsored", "cyber war", "cyber terrorism", "warlike"],
    severity: "High",
    financialExposure: "$100K–$5M+",
    recommendation: "Broad war exclusions can void coverage for state-sponsored attacks (like NotPetya). Look for policies that narrowly define war exclusions and explicitly cover state-sponsored cyber attacks that aren\u0027t part of armed conflict.",
    providerKey: "coalition",
  },
  {
    id: "infrastructure-exclusion",
    name: "Infrastructure Exclusion (Cloud Outages)",
    category: "policy-terms",
    keywords: ["infrastructure exclusion", "infrastructure failure", "utility failure", "cloud provider", "internet service", "power failure", "telecommunications", "aws outage", "azure outage"],
    severity: "Medium",
    financialExposure: "$10K–$200K",
    recommendation: "Some policies exclude losses from infrastructure provider outages (AWS, Azure, ISPs). Since most agencies are cloud-dependent, ensure your policy covers or doesn\u0027t broadly exclude infrastructure failures.",
    providerKey: "embroker",
  },
  {
    id: "unencrypted-exclusion",
    name: "Unencrypted Device Exclusion",
    category: "policy-terms",
    keywords: ["unencrypted", "encryption requirement", "encryption exclusion", "unencrypted device", "unencrypted data", "lack of encryption", "failure to encrypt"],
    severity: "Medium",
    financialExposure: "$25K–$250K",
    recommendation: "Many policies exclude claims involving unencrypted devices or data. Ensure all company devices use full-disk encryption and that your policy\u0027s encryption requirements are clearly defined and achievable.",
    providerKey: "coalition",
  },
  {
    id: "prior-acts-exclusion",
    name: "Prior Acts Exclusion",
    category: "policy-terms",
    keywords: ["prior acts", "prior knowledge", "known circumstance", "prior notice", "known claim", "existing condition", "pre-existing"],
    severity: "High",
    financialExposure: "$50K–$500K",
    recommendation: "Prior acts exclusions deny coverage for incidents that occurred or were known before the policy period. When switching insurers, ensure continuous coverage with no prior acts gaps.",
    providerKey: "chubb",
  },
  {
    id: "consent-to-settle",
    name: "Consent-to-Settle Clause",
    category: "policy-terms",
    keywords: ["consent to settle", "settlement consent", "hammer clause", "settlement approval", "right to settle", "settlement authority"],
    severity: "Low",
    financialExposure: "$10K–$100K",
    recommendation: "A consent-to-settle (\"hammer\") clause means the insurer can settle claims without your approval, or penalize you for refusing a settlement. Look for policies giving you meaningful input on settlement decisions.",
    providerKey: "hiscox",
  },
];

const SEVERITY_CONFIG: Record<Severity, { color: string; bgColor: string; borderColor: string; order: number }> = {
  Critical: { color: "text-red-700", bgColor: "bg-red-50", borderColor: "border-red-200", order: 0 },
  High: { color: "text-orange-700", bgColor: "bg-orange-50", borderColor: "border-orange-200", order: 1 },
  Medium: { color: "text-yellow-700", bgColor: "bg-yellow-50", borderColor: "border-yellow-200", order: 2 },
  Low: { color: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", order: 3 },
};

const SEVERITY_BADGE: Record<Severity, string> = {
  Critical: "bg-red-100 text-red-800 border-red-300",
  High: "bg-orange-100 text-orange-800 border-orange-300",
  Medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Low: "bg-blue-100 text-blue-800 border-blue-300",
};

const CATEGORY_LABELS: Record<string, string> = {
  "first-party": "First-Party Coverage",
  "third-party": "Third-Party Coverage",
  "policy-terms": "Key Policy Terms",
};

const PLACEHOLDER_TEXT = `Paste your cyber insurance policy text here...

Example snippet:
"This policy provides coverage for Data Breach Response Costs,
including forensic investigation, notification expenses, and
credit monitoring services. Business Interruption coverage
applies after a 12-hour waiting period with a sublimit of
$250,000. Ransomware and Cyber Extortion coverage is included
up to the full policy limit. Social Engineering coverage is
subject to a $100,000 sublimit..."

Tip: Copy and paste your entire policy document for the most
accurate analysis. The more text you provide, the better
our analysis will be.`;

/* ------------------------------------------------------------------ */
/*  Analysis Engine                                                    */
/* ------------------------------------------------------------------ */
function analyzePolicy(policyText: string): AnalysisSummary {
  const normalizedText = policyText.toLowerCase();

  const results: AnalysisResult[] = COVERAGE_AREAS.map((area) => {
    const matchedKeywords = area.keywords.filter((kw) =>
      normalizedText.includes(kw.toLowerCase())
    );
    return {
      area,
      found: matchedKeywords.length > 0,
      matchedKeywords,
    };
  });

  const covered = results.filter((r) => r.found);
  const gaps = results.filter((r) => !r.found);

  // Sort gaps by severity
  gaps.sort(
    (a, b) =>
      SEVERITY_CONFIG[a.area.severity].order -
      SEVERITY_CONFIG[b.area.severity].order
  );

  const criticalGaps = gaps.filter((g) => g.area.severity === "Critical").length;
  const highGaps = gaps.filter((g) => g.area.severity === "High").length;
  const mediumGaps = gaps.filter((g) => g.area.severity === "Medium").length;
  const lowGaps = gaps.filter((g) => g.area.severity === "Low").length;

  // Score: weighted by severity
  const weights: Record<Severity, number> = {
    Critical: 8,
    High: 5,
    Medium: 3,
    Low: 1,
  };
  const totalWeight = COVERAGE_AREAS.reduce(
    (sum, a) => sum + weights[a.severity],
    0
  );
  const coveredWeight = covered.reduce(
    (sum, r) => sum + weights[r.area.severity],
    0
  );
  const overallScore = Math.round((coveredWeight / totalWeight) * 100);

  return {
    overallScore,
    results,
    covered,
    gaps,
    criticalGaps,
    highGaps,
    mediumGaps,
    lowGaps,
  };
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */
function ScoreGauge({ score }: { score: number }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let scoreColor = "text-red-500";
  let strokeColor = "#ef4444";
  let label = "Poor";
  if (score >= 80) {
    scoreColor = "text-green-500";
    strokeColor = "#22c55e";
    label = "Excellent";
  } else if (score >= 60) {
    scoreColor = "text-teal";
    strokeColor = "#0d9488";
    label = "Good";
  } else if (score >= 40) {
    scoreColor = "text-yellow-500";
    strokeColor = "#eab308";
    label = "Fair";
  } else if (score >= 20) {
    scoreColor = "text-orange-500";
    strokeColor = "#f97316";
    label = "Weak";
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg className="w-48 h-48 -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold ${scoreColor}`}>{score}</span>
          <span className="text-sm text-gray-500">out of 100</span>
        </div>
      </div>
      <div className={`mt-2 text-lg font-semibold ${scoreColor}`}>{label}</div>
      <div className="text-sm text-gray-500">Coverage Score</div>
    </div>
  );
}

function GapCard({
  result,
  showFull,
  onAffiliateClick,
}: {
  result: AnalysisResult;
  showFull: boolean;
  onAffiliateClick: (provider: string) => void;
}) {
  const { area } = result;
  const config = SEVERITY_CONFIG[area.severity];
  const provider = AFFILIATE_PROVIDERS[area.providerKey];

  return (
    <div
      className={`rounded-xl border-2 ${config.borderColor} ${config.bgColor} p-5 transition-all`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4 className="font-bold text-navy text-base">{area.name}</h4>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${SEVERITY_BADGE[area.severity]}`}
            >
              {area.severity}
            </span>
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">
            {CATEGORY_LABELS[area.category]}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-gray-500">Est. Exposure</div>
          <div className={`font-bold text-sm ${config.color}`}>
            {area.financialExposure}
          </div>
        </div>
      </div>

      {showFull && (
        <>
          <p className="text-sm text-gray-700 mb-3 leading-relaxed">
            {area.recommendation}
          </p>
          {provider && (
            <div className="flex items-center gap-3 pt-3 border-t border-gray-200/50">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
                <span className="text-sm font-bold text-navy">
                  {provider.name[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500">Recommended Provider</div>
                <div className="text-sm font-medium text-navy truncate">
                  {provider.name}
                </div>
              </div>
              <a
                href={getAffiliateUrl(area.providerKey, "policy-scrutinizer")}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onAffiliateClick(provider.name)}
                className="text-xs font-semibold text-teal hover:text-teal-dark whitespace-nowrap"
              >
                Get Quote →
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CoveredItem({ result }: { result: AnalysisResult }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <svg
        className="w-5 h-5 text-green-500 shrink-0"
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
      <div className="flex-1">
        <span className="text-sm font-medium text-navy">{result.area.name}</span>
        <span className="text-xs text-gray-400 ml-2">
          ({result.matchedKeywords.length} keyword{result.matchedKeywords.length !== 1 ? "s" : ""} found)
        </span>
      </div>
    </div>
  );
}

function AnalysisProgress({ progress }: { progress: number }) {
  const stages = [
    "Parsing policy document...",
    "Checking first-party coverages...",
    "Checking third-party coverages...",
    "Analyzing policy terms & exclusions...",
    "Calculating coverage score...",
    "Generating gap analysis...",
  ];
  const stageIndex = Math.min(
    Math.floor((progress / 100) * stages.length),
    stages.length - 1
  );

  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <div className="w-16 h-16 mx-auto mb-6 relative">
        <div className="absolute inset-0 border-4 border-gray-200 rounded-full" />
        <div
          className="absolute inset-0 border-4 border-teal rounded-full animate-spin"
          style={{ borderTopColor: "transparent", borderRightColor: "transparent" }}
        />
      </div>
      <h3 className="text-xl font-bold text-navy mb-2">Analyzing Your Policy</h3>
      <p className="text-sm text-gray-500 mb-6">{stages[stageIndex]}</p>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
        <div
          className="bg-teal h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-400">
        Checking {COVERAGE_AREAS.length} coverage areas
      </p>
    </div>
  );
}

function EmailGateModal({
  onSubmit,
  onClose,
}: {
  onSubmit: (email: string) => void;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    onSubmit(email);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-navy mb-2">
            Unlock Your Full Report
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Get the complete gap analysis with detailed recommendations,
            financial exposure estimates, and provider suggestions for all{" "}
            {COVERAGE_AREAS.length} coverage areas.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {[
            "Complete analysis of all coverage gaps",
            "Specific recommendations per gap",
            "Estimated financial exposure breakdown",
            "Provider recommendations for each gap",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <svg className="w-4 h-4 text-teal shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-700">{item}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="your@agency-email.com"
              className={`w-full px-4 py-3 rounded-lg border-2 text-sm focus:outline-none transition-colors ${
                error
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-200 focus:border-teal"
              }`}
            />
            {error && (
              <p className="text-xs text-red-600 mt-1">{error}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full px-6 py-3 bg-teal text-white font-semibold rounded-lg hover:bg-teal/90 transition-colors"
          >
            Get Full Report — Free
          </button>
          <p className="text-xs text-gray-400 text-center mt-3">
            No spam. Unsubscribe anytime. We may send relevant cyber insurance tips.
          </p>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function PolicyScrutinizer() {
  const [policyText, setPolicyText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<AnalysisSummary | null>(null);
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [showFullReport, setShowFullReport] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Check localStorage for previous email capture
  useEffect(() => {
    trackToolUsage("policy_scrutinizer", "opened");
    const stored = localStorage.getItem("policy_scrutinizer_email");
    if (stored) {
      setEmailCaptured(true);
      setShowFullReport(true);
    }
  }, []);

  const handleAnalyze = useCallback(() => {
    if (!policyText.trim() || policyText.trim().length < 50) return;

    trackToolUsage("policy_scrutinizer", "analysis_started");
    setAnalyzing(true);
    setProgress(0);
    setSummary(null);

    // Animated progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15 + 5;
      if (currentProgress >= 95) {
        currentProgress = 95;
        clearInterval(interval);
      }
      setProgress(Math.min(Math.round(currentProgress), 95));
    }, 200);

    // Actual analysis after brief delay for UX
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);

      const result = analyzePolicy(policyText);

      setTimeout(() => {
        setAnalyzing(false);
        setSummary(result);
        trackToolUsage(
          "policy_scrutinizer",
          "analysis_complete",
          String(result.overallScore)
        );

        // Scroll to results
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      }, 400);
    }, 2000);
  }, [policyText]);

  const handleEmailSubmit = useCallback(
    (email: string) => {
      localStorage.setItem("policy_scrutinizer_email", email);
      setEmailCaptured(true);
      setShowFullReport(true);
      setShowEmailGate(false);
      trackToolUsage("policy_scrutinizer", "email_captured", email);
    },
    []
  );

  const handleAffiliateClick = useCallback((providerName: string) => {
    trackCTAClick("affiliate_link", providerName, "policy_scrutinizer");
  }, []);

  const handleUnlockClick = useCallback(() => {
    if (emailCaptured) {
      setShowFullReport(true);
    } else {
      setShowEmailGate(true);
    }
  }, [emailCaptured]);

  const handleReset = useCallback(() => {
    setPolicyText("");
    setSummary(null);
    setShowFullReport(false);
    trackToolUsage("policy_scrutinizer", "restarted");
  }, []);

  /* ---------- Analyzing state ---------- */
  if (analyzing) {
    return <AnalysisProgress progress={progress} />;
  }

  /* ---------- Results view ---------- */
  if (summary) {
    const topGaps = summary.gaps.slice(0, 5);
    const remainingGaps = summary.gaps.slice(5);

    return (
      <div ref={resultsRef}>
        {/* Score Overview */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-teal/10 text-teal font-semibold px-4 py-2 rounded-full text-sm mb-4">
            <svg
              className="w-5 h-5"
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
            Analysis Complete
          </div>
          <h2 className="text-3xl font-bold text-navy mb-2">
            Your Policy Gap Analysis
          </h2>
          <p className="text-gray-600">
            We checked your policy against {COVERAGE_AREAS.length} critical
            coverage areas.
          </p>
        </div>

        {/* Score + Stats Row */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="md:col-span-1 bg-white rounded-xl border border-gray-200 p-6 flex justify-center">
            <ScoreGauge score={summary.overallScore} />
          </div>
          <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-navy mb-4">Coverage Summary</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {summary.covered.length}
                </div>
                <div className="text-xs text-gray-500">Areas Covered</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {summary.gaps.length}
                </div>
                <div className="text-xs text-gray-500">Gaps Found</div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-2 bg-red-50 rounded-lg">
                <div className="text-lg font-bold text-red-700">
                  {summary.criticalGaps}
                </div>
                <div className="text-xs text-gray-500">Critical</div>
              </div>
              <div className="text-center p-2 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-700">
                  {summary.highGaps}
                </div>
                <div className="text-xs text-gray-500">High</div>
              </div>
              <div className="text-center p-2 bg-yellow-50 rounded-lg">
                <div className="text-lg font-bold text-yellow-700">
                  {summary.mediumGaps}
                </div>
                <div className="text-xs text-gray-500">Medium</div>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-700">
                  {summary.lowGaps}
                </div>
                <div className="text-xs text-gray-500">Low</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top 5 Critical Gaps (Free) */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-navy mb-1">
            Top {topGaps.length} Most Critical Gaps
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            These are the highest-priority coverage gaps in your policy.
          </p>
          <div className="space-y-4">
            {topGaps.map((result) => (
              <GapCard
                key={result.area.id}
                result={result}
                showFull={true}
                onAffiliateClick={handleAffiliateClick}
              />
            ))}
          </div>
        </div>

        {/* What's Covered (Free) */}
        {summary.covered.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-10">
            <h3 className="font-bold text-navy mb-3 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-500"
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
              What Your Policy Covers ({summary.covered.length} areas)
            </h3>
            <div className="divide-y divide-gray-100">
              {summary.covered.map((result) => (
                <CoveredItem key={result.area.id} result={result} />
              ))}
            </div>
          </div>
        )}

        {/* Remaining Gaps — Gated */}
        {remainingGaps.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-navy">
                  {showFullReport
                    ? `All Remaining Gaps (${remainingGaps.length})`
                    : `${remainingGaps.length} More Gaps Found`}
                </h3>
                {!showFullReport && (
                  <p className="text-sm text-gray-500">
                    Unlock the full report to see all gaps with recommendations.
                  </p>
                )}
              </div>
              {!showFullReport && (
                <button
                  onClick={handleUnlockClick}
                  className="px-5 py-2.5 bg-teal text-white font-semibold rounded-lg hover:bg-teal/90 transition-colors text-sm whitespace-nowrap"
                >
                  Unlock Full Report
                </button>
              )}
            </div>

            {showFullReport ? (
              <div className="space-y-4">
                {remainingGaps.map((result) => (
                  <GapCard
                    key={result.area.id}
                    result={result}
                    showFull={true}
                    onAffiliateClick={handleAffiliateClick}
                  />
                ))}
              </div>
            ) : (
              <div className="relative">
                <div className="space-y-4 opacity-40 pointer-events-none select-none">
                  {remainingGaps.slice(0, 3).map((result) => (
                    <GapCard
                      key={result.area.id}
                      result={result}
                      showFull={false}
                      onAffiliateClick={handleAffiliateClick}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white flex items-end justify-center pb-8">
                  <button
                    onClick={handleUnlockClick}
                    className="px-8 py-4 bg-navy text-white font-semibold rounded-xl hover:bg-navy/90 transition-colors shadow-lg"
                  >
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                        />
                      </svg>
                      Unlock Full Report — Free with Email
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CTA Section */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <a
            href={getAffiliateUrl("coalition", "policy-scrutinizer")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleAffiliateClick("Coalition")}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-teal text-white font-semibold rounded-lg hover:bg-teal/90 transition-colors"
          >
            Get a Better Policy Quote
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
                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>
          </a>
          <button
            onClick={handleReset}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-colors"
          >
            Analyze Another Policy
          </button>
        </div>

        {/* Disclaimer */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            <strong>Disclaimer:</strong> This tool provides a general analysis
            based on keyword matching and should not be considered professional
            insurance advice. Policy language is complex and context-dependent.
            Always consult with a licensed insurance broker for definitive
            coverage analysis. Affiliate links may earn us a commission at no
            cost to you.
          </p>
        </div>

        {/* Email Gate Modal */}
        {showEmailGate && (
          <EmailGateModal
            onSubmit={handleEmailSubmit}
            onClose={() => setShowEmailGate(false)}
          />
        )}
      </div>
    );
  }

  /* ---------- Input view ---------- */
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-navy mb-1">
            Paste Your Cyber Insurance Policy
          </h3>
          <p className="text-sm text-gray-500">
            Copy and paste your policy document text below. We&apos;ll analyze it
            against {COVERAGE_AREAS.length} critical coverage areas and identify
            gaps.
          </p>
        </div>

        <textarea
          value={policyText}
          onChange={(e) => setPolicyText(e.target.value)}
          placeholder={PLACEHOLDER_TEXT}
          rows={16}
          className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-teal focus:outline-none transition-colors text-sm text-navy leading-relaxed resize-y min-h-[200px] font-mono"
        />

        <div className="flex items-center justify-between mt-4">
          <div className="text-xs text-gray-400">
            {policyText.length > 0 ? (
              <>
                {policyText.trim().split(/\s+/).length.toLocaleString()} words ·{" "}
                {policyText.length.toLocaleString()} characters
              </>
            ) : (
              "Paste your policy text above"
            )}
          </div>
          <button
            onClick={handleAnalyze}
            disabled={!policyText.trim() || policyText.trim().length < 50}
            className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
              policyText.trim() && policyText.trim().length >= 50
                ? "bg-teal text-white hover:bg-teal/90"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Analyze My Policy
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        {[
          {
            icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
            title: "27 Coverage Areas",
            desc: "We check first-party, third-party, and key policy terms.",
          },
          {
            icon: "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z",
            title: "100% Private",
            desc: "Your policy text is analyzed locally and never stored.",
          },
          {
            icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
            title: "Instant Results",
            desc: "Get your coverage score and top gaps in seconds.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-center"
          >
            <div className="w-10 h-10 bg-teal/10 rounded-lg flex items-center justify-center mx-auto mb-3">
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
            <h4 className="font-bold text-navy text-sm mb-1">{item.title}</h4>
            <p className="text-xs text-gray-500">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
