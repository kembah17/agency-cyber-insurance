"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { AFFILIATE_PROVIDERS, getAffiliateUrl } from "@/lib/affiliates";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Answers {
  employeeRange: string;
  revenueRange: string;
  dataTypes: string[];
  adAccountAccess: string;
  mfaStatus: string;
  edrStatus: string;
  securityTraining: string;
  securityFramework: string;
  priorIncident: string;
  clientRequirement: string;
  clientMinCoverage: string;
  deductiblePref: string;
  budgetRange: string;
}

interface Recommendation {
  primary: string;
  alternative: string;
  riskScore: "Low" | "Medium" | "High" | "Critical";
  riskColor: string;
  estimatedAnnualLow: number;
  estimatedAnnualHigh: number;
  recommendedLimit: string;
  recommendedDeductible: string;
  actionItems: string[];
}

const INITIAL_ANSWERS: Answers = {
  employeeRange: "",
  revenueRange: "",
  dataTypes: [],
  adAccountAccess: "",
  mfaStatus: "",
  edrStatus: "",
  securityTraining: "",
  securityFramework: "",
  priorIncident: "",
  clientRequirement: "",
  clientMinCoverage: "",
  deductiblePref: "",
  budgetRange: "",
};

const STEP_TITLES = [
  "Agency Size",
  "Data & Risk",
  "Security Posture",
  "Coverage Needs",
  "Budget",
];

/* ------------------------------------------------------------------ */
/*  Recommendation logic                                               */
/* ------------------------------------------------------------------ */
function computeRecommendation(a: Answers): Recommendation {
  // --- risk score ---
  let risk = 0;
  // data sensitivity
  const highRiskData = ["payment_pci", "health_hipaa", "ssn", "financial"];
  const hasHighRisk = a.dataTypes.some((d) => highRiskData.includes(d));
  if (hasHighRisk) risk += 3;
  if (a.dataTypes.includes("login_credentials")) risk += 1;
  if (a.adAccountAccess === "yes") risk += 1;
  // security posture (lower is worse)
  if (a.mfaStatus === "no") risk += 3;
  else if (a.mfaStatus === "partial") risk += 1;
  if (a.edrStatus === "no" || a.edrStatus === "not_sure") risk += 2;
  if (a.securityTraining === "no") risk += 2;
  else if (a.securityTraining === "yes_annual") risk += 1;
  if (a.securityFramework === "none") risk += 2;
  // history
  if (a.priorIncident === "yes") risk += 2;
  // size factor
  const sizeMap: Record<string, number> = {
    solo_5: 0, "5_10": 1, "10_25": 2, "25_50": 3, "50_plus": 4,
  };
  risk += sizeMap[a.employeeRange] ?? 0;

  let riskScore: Recommendation["riskScore"];
  let riskColor: string;
  if (risk <= 4) { riskScore = "Low"; riskColor = "text-green-600"; }
  else if (risk <= 8) { riskScore = "Medium"; riskColor = "text-yellow-600"; }
  else if (risk <= 13) { riskScore = "High"; riskColor = "text-orange-600"; }
  else { riskScore = "Critical"; riskColor = "text-red-600"; }

  // --- provider selection ---
  const isSmall = ["solo_5", "5_10"].includes(a.employeeRange);
  const isMid = ["10_25", "25_50"].includes(a.employeeRange);
  const isLarge = a.employeeRange === "50_plus";
  const isBudgetConscious = ["under_50", "50_100"].includes(a.budgetRange);
  const wantsMonitoring = a.edrStatus === "yes" || a.securityFramework !== "none";

  let primary = "coalition";
  let alternative = "hiscox";

  if (hasHighRisk) {
    primary = "coalition"; alternative = "chubb";
  } else if (isLarge || a.clientRequirement === "yes") {
    primary = "chubb"; alternative = "embroker";
  } else if (isMid && wantsMonitoring) {
    primary = "embroker"; alternative = "coalition";
  } else if (isBudgetConscious && isSmall) {
    primary = "hiscox"; alternative = "coalition";
  } else if (wantsMonitoring) {
    primary = "coalition"; alternative = "embroker";
  }

  // --- premium estimate ---
  const basePremiums: Record<string, [number, number]> = {
    solo_5: [500, 1200],
    "5_10": [1000, 2000],
    "10_25": [1500, 3500],
    "25_50": [2500, 6000],
    "50_plus": [5000, 15000],
  };
  let [low, high] = basePremiums[a.employeeRange] ?? [1000, 2500];
  if (hasHighRisk) { low *= 1.35; high *= 1.35; }
  if (a.mfaStatus === "yes" && a.edrStatus === "yes") { low *= 0.8; high *= 0.85; }
  if (a.priorIncident === "yes") { low *= 1.3; high *= 1.3; }
  if (a.securityFramework !== "none") { low *= 0.9; high *= 0.9; }
  low = Math.round(low / 100) * 100;
  high = Math.round(high / 100) * 100;

  // --- coverage limit ---
  let recommendedLimit = "$1M";
  if (isLarge || a.clientRequirement === "yes") recommendedLimit = "$3M–$5M";
  else if (isMid) recommendedLimit = "$2M";
  else if (hasHighRisk) recommendedLimit = "$2M";

  // --- deductible ---
  const deductibleMap: Record<string, string> = {
    low: "$2,500", medium: "$5,000", high: "$10,000",
  };
  const recommendedDeductible = deductibleMap[a.deductiblePref] ?? "$2,500";

  // --- action items ---
  const actionItems: string[] = [];
  if (a.mfaStatus !== "yes")
    actionItems.push("Implement Multi-Factor Authentication (MFA) on all business systems — this alone can reduce premiums by 10–15%.");
  if (a.edrStatus !== "yes")
    actionItems.push("Deploy Endpoint Detection and Response (EDR) software like CrowdStrike or Microsoft Defender for Business.");
  if (a.securityTraining === "no")
    actionItems.push("Start quarterly security awareness training with simulated phishing exercises (e.g., KnowBe4).");
  if (a.securityFramework === "none")
    actionItems.push("Adopt the NIST Cybersecurity Framework as your baseline — it\u0027s free and widely recognized by insurers.");
  if (actionItems.length === 0)
    actionItems.push("Your security posture is strong! Consider increasing your deductible to save 10–20% on premiums.");
  // always add quote tip
  actionItems.push("Get quotes from at least 3 providers — pricing can vary by 40% or more for identical coverage.");
  // cap at 3
  const finalActions = actionItems.slice(0, 3);

  return {
    primary, alternative, riskScore, riskColor,
    estimatedAnnualLow: low, estimatedAnnualHigh: high,
    recommendedLimit, recommendedDeductible, actionItems: finalActions,
  };
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */
function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = ((step + 1) / total) * 100;
  return (
    <div className="mb-8">
      <div className="flex justify-between text-sm text-gray-500 mb-2">
        <span>Step {step + 1} of {total}</span>
        <span>{STEP_TITLES[step]}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-teal h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        {STEP_TITLES.map((t, i) => (
          <span
            key={t}
            className={`text-xs hidden sm:block ${
              i <= step ? "text-teal font-medium" : "text-gray-400"
            }`}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function RadioOption({
  name, value, label, sublabel, selected, onChange,
}: {
  name: string; value: string; label: string; sublabel?: string;
  selected: boolean; onChange: (v: string) => void;
}) {
  return (
    <label
      className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
        selected
          ? "border-teal bg-teal/5 shadow-sm"
          : "border-gray-200 hover:border-gray-300 bg-white"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={selected}
        onChange={() => onChange(value)}
        className="mt-0.5 accent-teal"
      />
      <div>
        <div className="font-medium text-navy">{label}</div>
        {sublabel && <div className="text-sm text-gray-500 mt-0.5">{sublabel}</div>}
      </div>
    </label>
  );
}

function CheckboxOption({
  value, label, checked, onChange,
}: {
  value: string; label: string; checked: boolean;
  onChange: (v: string, c: boolean) => void;
}) {
  return (
    <label
      className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
        checked
          ? "border-teal bg-teal/5 shadow-sm"
          : "border-gray-200 hover:border-gray-300 bg-white"
      }`}
    >
      <input
        type="checkbox"
        value={value}
        checked={checked}
        onChange={(e) => onChange(value, e.target.checked)}
        className="accent-teal"
      />
      <span className="font-medium text-navy">{label}</span>
    </label>
  );
}

function SummarySidebar({ answers }: { answers: Answers }) {
  const labels: Record<string, Record<string, string>> = {
    employeeRange: { solo_5: "Solo / 1–5", "5_10": "5–10", "10_25": "10–25", "25_50": "25–50", "50_plus": "50+" },
    revenueRange: { under_500k: "Under $500K", "500k_1m": "$500K–$1M", "1m_3m": "$1M–$3M", "3m_10m": "$3M–$10M", "10m_plus": "$10M+" },
    budgetRange: { under_50: "Under $50/mo", "50_100": "$50–$100/mo", "100_200": "$100–$200/mo", "200_500": "$200–$500/mo", "500_plus": "$500+/mo" },
  };
  const items: { label: string; value: string }[] = [];
  if (answers.employeeRange) items.push({ label: "Employees", value: labels.employeeRange[answers.employeeRange] || answers.employeeRange });
  if (answers.revenueRange) items.push({ label: "Revenue", value: labels.revenueRange[answers.revenueRange] || answers.revenueRange });
  if (answers.dataTypes.length > 0) items.push({ label: "Data types", value: `${answers.dataTypes.length} selected` });
  if (answers.mfaStatus) items.push({ label: "MFA", value: answers.mfaStatus === "yes" ? "Yes" : answers.mfaStatus === "partial" ? "Partial" : "No" });
  if (answers.budgetRange) items.push({ label: "Budget", value: labels.budgetRange[answers.budgetRange] || answers.budgetRange });

  if (items.length === 0) return null;
  return (
    <div className="hidden lg:block w-72 shrink-0">
      <div className="sticky top-24 bg-gray-50 rounded-xl border border-gray-200 p-5">
        <h3 className="font-bold text-navy text-sm mb-4 uppercase tracking-wider">Your Selections</h3>
        <dl className="space-y-3">
          {items.map((item) => (
            <div key={item.label}>
              <dt className="text-xs text-gray-500">{item.label}</dt>
              <dd className="text-sm font-medium text-navy">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function RecommendationEngine() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(INITIAL_ANSWERS);
  const [result, setResult] = useState<Recommendation | null>(null);
  const [animating, setAnimating] = useState(false);

  const update = useCallback(
    <K extends keyof Answers>(key: K, value: Answers[K]) => {
      setAnswers((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const toggleDataType = useCallback((val: string, checked: boolean) => {
    setAnswers((prev) => ({
      ...prev,
      dataTypes: checked
        ? [...prev.dataTypes, val]
        : prev.dataTypes.filter((d) => d !== val),
    }));
  }, []);

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return !!answers.employeeRange && !!answers.revenueRange;
      case 1: return answers.dataTypes.length > 0 && !!answers.adAccountAccess;
      case 2: return !!answers.mfaStatus && !!answers.edrStatus && !!answers.securityTraining && !!answers.securityFramework;
      case 3: return !!answers.priorIncident && !!answers.clientRequirement && !!answers.deductiblePref;
      case 4: return !!answers.budgetRange;
      default: return false;
    }
  };

  const goNext = () => {
    if (step < 4) {
      setAnimating(true);
      setTimeout(() => { setStep(step + 1); setAnimating(false); }, 200);
    } else {
      setResult(computeRecommendation(answers));
    }
  };

  const goBack = () => {
    if (step > 0) {
      setAnimating(true);
      setTimeout(() => { setStep(step - 1); setAnimating(false); }, 200);
    }
  };

  const restart = () => {
    setStep(0);
    setAnswers(INITIAL_ANSWERS);
    setResult(null);
  };

  /* ---------- Results view ---------- */
  if (result) {
    const primary = AFFILIATE_PROVIDERS[result.primary];
    const alt = AFFILIATE_PROVIDERS[result.alternative];
    const monthlyLow = Math.round(result.estimatedAnnualLow / 12);
    const monthlyHigh = Math.round(result.estimatedAnnualHigh / 12);

    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-teal/10 text-teal font-semibold px-4 py-2 rounded-full text-sm mb-4">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Analysis Complete
          </div>
          <h2 className="text-3xl font-bold text-navy mb-2">Your Personalized Recommendation</h2>
          <p className="text-gray-600">Based on your agency profile, here{"\u0027"}s what we recommend.</p>
        </div>

        {/* Risk Score Banner */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-sm text-gray-500 mb-1">Risk Level</div>
              <div className={`text-2xl font-bold ${result.riskColor}`}>{result.riskScore}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Est. Annual Premium</div>
              <div className="text-2xl font-bold text-navy">${result.estimatedAnnualLow.toLocaleString()}–${result.estimatedAnnualHigh.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Recommended Limit</div>
              <div className="text-2xl font-bold text-navy">{result.recommendedLimit}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Recommended Deductible</div>
              <div className="text-2xl font-bold text-navy">{result.recommendedDeductible}</div>
            </div>
          </div>
        </div>

        {/* Primary Recommendation */}
        <div className="bg-white rounded-xl border-2 border-teal p-6 mb-6 relative">
          <div className="absolute -top-3 left-6 bg-teal text-white text-xs font-bold px-3 py-1 rounded-full">
            Best Match
          </div>
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="w-16 h-16 bg-navy/5 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-navy">{primary.name[0]}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-navy mb-1">{primary.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{primary.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {primary.pros.slice(0, 4).map((pro) => (
                  <span key={pro} className="inline-flex items-center gap-1 text-xs bg-teal/10 text-teal px-2 py-1 rounded-full">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {pro}
                  </span>
                ))}
              </div>
              <div className="text-sm text-gray-500 mb-4">
                Typical cost: <strong className="text-navy">{primary.pricing}</strong> &middot;
                Coverage up to <strong className="text-navy">{primary.features["Coverage Limit"]}</strong>
              </div>
              <a
                href={getAffiliateUrl(result.primary, "recommendation-engine")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-teal text-white font-semibold rounded-lg hover:bg-teal/90 transition-colors"
              >
                {primary.cta_text}
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
              <p className="text-xs text-gray-400 mt-2">Affiliate link — we may earn a commission at no cost to you.</p>
            </div>
          </div>
        </div>

        {/* Alternative */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-gray-600">{alt.name[0]}</span>
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Alternative Option</div>
              <h3 className="text-lg font-bold text-navy mb-1">{alt.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{alt.description}</p>
              <div className="text-sm text-gray-500 mb-4">
                Typical cost: <strong className="text-navy">{alt.pricing}</strong> &middot;
                Coverage up to <strong className="text-navy">{alt.features["Coverage Limit"]}</strong>
              </div>
              <a
                href={getAffiliateUrl(result.alternative, "recommendation-engine")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-5 py-2.5 border-2 border-navy text-navy font-semibold rounded-lg hover:bg-navy hover:text-white transition-colors text-sm"
              >
                {alt.cta_text}
              </a>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-navy mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            Action Items to Reduce Your Premium
          </h3>
          <ol className="space-y-3">
            {result.actionItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-gray-700">{item}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link
            href="/compare"
            className="flex-1 text-center px-6 py-3 bg-navy text-white font-semibold rounded-lg hover:bg-navy/90 transition-colors"
          >
            Compare All Providers
          </Link>
          <button
            onClick={restart}
            className="flex-1 text-center px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-colors"
          >
            Start Over
          </button>
        </div>

        {/* Email capture placeholder */}
        <div className="bg-navy rounded-xl p-8 text-center text-white">
          <h3 className="text-xl font-bold mb-2">Want Your Full Report?</h3>
          <p className="text-gray-300 text-sm mb-4">Get a detailed PDF with your risk assessment, coverage recommendations, and premium reduction roadmap.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-lg text-navy text-sm focus:outline-none focus:ring-2 focus:ring-teal"
            />
            <button className="px-6 py-3 bg-teal text-white font-semibold rounded-lg hover:bg-teal/90 transition-colors text-sm whitespace-nowrap">
              Get Report
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    );
  }

  /* ---------- Questionnaire steps ---------- */
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-navy mb-1">How many employees does your agency have?</h3>
              <p className="text-sm text-gray-500 mb-4">Include full-time, part-time, and contractors with system access.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { v: "solo_5", l: "Solo / 1–5 employees", s: "Freelancer or small team" },
                  { v: "5_10", l: "5–10 employees", s: "Small agency" },
                  { v: "10_25", l: "10–25 employees", s: "Mid-size agency" },
                  { v: "25_50", l: "25–50 employees", s: "Growth-stage agency" },
                  { v: "50_plus", l: "50+ employees", s: "Large agency" },
                ].map((o) => (
                  <RadioOption key={o.v} name="employeeRange" value={o.v} label={o.l} sublabel={o.s}
                    selected={answers.employeeRange === o.v} onChange={(v) => update("employeeRange", v)} />
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-navy mb-1">What is your annual revenue range?</h3>
              <p className="text-sm text-gray-500 mb-4">This is the biggest factor in premium pricing.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { v: "under_500k", l: "Under $500K" },
                  { v: "500k_1m", l: "$500K – $1M" },
                  { v: "1m_3m", l: "$1M – $3M" },
                  { v: "3m_10m", l: "$3M – $10M" },
                  { v: "10m_plus", l: "$10M+" },
                ].map((o) => (
                  <RadioOption key={o.v} name="revenueRange" value={o.v} label={o.l}
                    selected={answers.revenueRange === o.v} onChange={(v) => update("revenueRange", v)} />
                ))}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-navy mb-1">What types of client data do you handle?</h3>
              <p className="text-sm text-gray-500 mb-4">Select all that apply. Higher-sensitivity data increases your risk profile.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { v: "marketing_analytics", l: "Marketing analytics" },
                  { v: "login_credentials", l: "Login credentials" },
                  { v: "payment_pci", l: "Payment / PCI data" },
                  { v: "health_hipaa", l: "Health / HIPAA data" },
                  { v: "ssn", l: "Social Security numbers" },
                  { v: "financial", l: "Financial records" },
                ].map((o) => (
                  <CheckboxOption key={o.v} value={o.v} label={o.l}
                    checked={answers.dataTypes.includes(o.v)} onChange={toggleDataType} />
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-navy mb-1">Do you manage client ad accounts with billing access?</h3>
              <p className="text-sm text-gray-500 mb-4">This includes Meta, Google Ads, LinkedIn, etc. with payment methods attached.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <RadioOption name="adAccountAccess" value="yes" label="Yes" selected={answers.adAccountAccess === "yes"} onChange={(v) => update("adAccountAccess", v)} />
                <RadioOption name="adAccountAccess" value="no" label="No" selected={answers.adAccountAccess === "no"} onChange={(v) => update("adAccountAccess", v)} />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-navy mb-1">Do you use MFA on all business systems?</h3>
              <p className="text-sm text-gray-500 mb-4">Multi-Factor Authentication is the #1 factor insurers evaluate.</p>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { v: "yes", l: "Yes, everywhere" },
                  { v: "partial", l: "Partial" },
                  { v: "no", l: "No" },
                ].map((o) => (
                  <RadioOption key={o.v} name="mfaStatus" value={o.v} label={o.l}
                    selected={answers.mfaStatus === o.v} onChange={(v) => update("mfaStatus", v)} />
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-navy mb-1">Do you have endpoint detection software?</h3>
              <p className="text-sm text-gray-500 mb-4">EDR goes beyond antivirus to actively monitor for threats.</p>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { v: "yes", l: "Yes" },
                  { v: "no", l: "No" },
                  { v: "not_sure", l: "Not sure" },
                ].map((o) => (
                  <RadioOption key={o.v} name="edrStatus" value={o.v} label={o.l}
                    selected={answers.edrStatus === o.v} onChange={(v) => update("edrStatus", v)} />
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-navy mb-1">Do you run security awareness training?</h3>
              <p className="text-sm text-gray-500 mb-4">Regular training with phishing simulations reduces your risk profile.</p>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { v: "yes_quarterly", l: "Yes, quarterly" },
                  { v: "yes_annual", l: "Yes, annually" },
                  { v: "no", l: "No" },
                ].map((o) => (
                  <RadioOption key={o.v} name="securityTraining" value={o.v} label={o.l}
                    selected={answers.securityTraining === o.v} onChange={(v) => update("securityTraining", v)} />
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-navy mb-1">Do you follow a security framework?</h3>
              <p className="text-sm text-gray-500 mb-4">Framework alignment signals maturity to underwriters.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { v: "nist", l: "NIST CSF", s: "Free, flexible, widely recognized" },
                  { v: "soc2", l: "SOC 2", s: "Rigorous, enterprise-grade" },
                  { v: "cis", l: "CIS Controls", s: "Prioritized, actionable" },
                  { v: "none", l: "None", s: "No formal framework" },
                ].map((o) => (
                  <RadioOption key={o.v} name="securityFramework" value={o.v} label={o.l} sublabel={o.s}
                    selected={answers.securityFramework === o.v} onChange={(v) => update("securityFramework", v)} />
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-navy mb-1">Have you had a cyber incident or claim before?</h3>
              <p className="text-sm text-gray-500 mb-4">Prior claims can increase premiums by 20–50%.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <RadioOption name="priorIncident" value="yes" label="Yes" selected={answers.priorIncident === "yes"} onChange={(v) => update("priorIncident", v)} />
                <RadioOption name="priorIncident" value="no" label="No" selected={answers.priorIncident === "no"} onChange={(v) => update("priorIncident", v)} />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-navy mb-1">Do enterprise clients require minimum coverage?</h3>
              <p className="text-sm text-gray-500 mb-4">Many enterprise clients require $1M+ in cyber liability coverage.</p>
              <div className="grid sm:grid-cols-3 gap-3">
                <RadioOption name="clientRequirement" value="yes" label="Yes" selected={answers.clientRequirement === "yes"} onChange={(v) => update("clientRequirement", v)} />
                <RadioOption name="clientRequirement" value="no" label="No" selected={answers.clientRequirement === "no"} onChange={(v) => update("clientRequirement", v)} />
                <RadioOption name="clientRequirement" value="not_sure" label="Not sure" selected={answers.clientRequirement === "not_sure"} onChange={(v) => update("clientRequirement", v)} />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-navy mb-1">Preferred deductible level?</h3>
              <p className="text-sm text-gray-500 mb-4">Higher deductibles lower your premium but increase out-of-pocket costs.</p>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { v: "low", l: "Low (~$2,500)", s: "Lower out-of-pocket" },
                  { v: "medium", l: "Medium (~$5,000)", s: "Balanced" },
                  { v: "high", l: "High (~$10,000)", s: "Lower premium" },
                ].map((o) => (
                  <RadioOption key={o.v} name="deductiblePref" value={o.v} label={o.l} sublabel={o.s}
                    selected={answers.deductiblePref === o.v} onChange={(v) => update("deductiblePref", v)} />
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h3 className="text-lg font-bold text-navy mb-1">What is your monthly budget for cyber insurance?</h3>
            <p className="text-sm text-gray-500 mb-4">This helps us match you with the right provider tier.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { v: "under_50", l: "Under $50/month", s: "Basic coverage" },
                { v: "50_100", l: "$50 – $100/month", s: "Good coverage for small agencies" },
                { v: "100_200", l: "$100 – $200/month", s: "Comprehensive coverage" },
                { v: "200_500", l: "$200 – $500/month", s: "Premium coverage" },
                { v: "500_plus", l: "$500+/month", s: "Enterprise-grade coverage" },
              ].map((o) => (
                <RadioOption key={o.v} name="budgetRange" value={o.v} label={o.l} sublabel={o.s}
                  selected={answers.budgetRange === o.v} onChange={(v) => update("budgetRange", v)} />
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex gap-8">
      <div className="flex-1 min-w-0">
        <ProgressBar step={step} total={5} />

        <div className={`transition-opacity duration-200 ${animating ? "opacity-0" : "opacity-100"}`}>
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={goBack}
            disabled={step === 0}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              step === 0
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-600 hover:text-navy hover:bg-gray-100"
            }`}
          >
            ← Back
          </button>
          <button
            onClick={goNext}
            disabled={!canProceed()}
            className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
              canProceed()
                ? "bg-teal text-white hover:bg-teal/90"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {step === 4 ? "Get My Recommendation" : "Next →"}
          </button>
        </div>
      </div>

      <SummarySidebar answers={answers} />
    </div>
  );
}
