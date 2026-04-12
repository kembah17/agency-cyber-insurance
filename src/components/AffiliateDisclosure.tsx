import Link from "next/link";

interface AffiliateDisclosureProps {
  compact?: boolean;
}

export default function AffiliateDisclosure({ compact = false }: AffiliateDisclosureProps) {
  if (compact) {
    return (
      <p className="text-xs text-warm-gray-light italic">
        This article contains affiliate links. We may earn a commission at no
        cost to you.{" "}
        <Link href="/disclaimer" className="underline hover:text-navy">
          Learn more
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="bg-amber/10 border border-amber/30 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 text-amber shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
        <div>
          <p className="text-sm text-gray-700 font-medium">Affiliate Disclosure</p>
          <p className="text-sm text-warm-gray mt-1 leading-relaxed">
            Some of the links in this article are affiliate links, meaning we may
            earn a commission if you click through and make a purchase. This comes
            at no additional cost to you and helps us keep this resource free. We
            only recommend products and services we have thoroughly researched.
            Read our{" "}
            <Link href="/disclaimer" className="text-teal underline hover:text-teal-dark">
              full affiliate disclaimer
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
