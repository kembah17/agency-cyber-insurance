import { AffiliateProvider } from "@/lib/types";
import RatingStars from "./RatingStars";
import AffiliateLink from "./AffiliateLink";

interface ComparisonTableProps {
  providers: AffiliateProvider[];
  features?: string[];
}

const DEFAULT_FEATURES = [
  "Coverage Limit",
  "Deductible Options",
  "Risk Monitoring",
  "Incident Response",
  "Regulatory Defense",
  "Business Interruption",
  "Social Engineering",
  "Best For",
];

export default function ComparisonTable({
  providers,
  features = DEFAULT_FEATURES,
}: ComparisonTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left p-4 bg-warm-gray-lightest text-navy font-semibold border-b-2 border-gray-200 min-w-[160px]">
              Feature
            </th>
            {providers.map((provider) => (
              <th
                key={provider.slug}
                className="text-center p-4 bg-warm-gray-lightest text-navy font-semibold border-b-2 border-gray-200 min-w-[180px]"
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-lg">{provider.name}</span>
                  <RatingStars rating={provider.rating} size="sm" />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((feature) => (
            <tr key={feature} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="p-4 text-sm font-medium text-gray-700">
                {feature}
              </td>
              {providers.map((provider) => {
                const value = provider.features[feature];
                return (
                  <td key={provider.slug} className="p-4 text-center text-sm">
                    {typeof value === "boolean" ? (
                      value ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-400 rounded-full">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </span>
                      )
                    ) : (
                      <span className="text-gray-700">{value || "—"}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
          {/* CTA Row */}
          <tr>
            <td className="p-4"></td>
            {providers.map((provider) => (
              <td key={provider.slug} className="p-4 text-center">
                <AffiliateLink
                  href={provider.url}
                  provider={provider.slug}
                  className="inline-block px-6 py-3 bg-teal text-white font-semibold rounded-lg hover:bg-teal-dark transition-colors text-sm"
                >
                  {provider.cta_text}
                </AffiliateLink>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
