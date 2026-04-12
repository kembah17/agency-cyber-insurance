import AffiliateLink from "./AffiliateLink";

interface CTABoxProps {
  title: string;
  description: string;
  href: string;
  provider: string;
  buttonText?: string;
  variant?: "primary" | "secondary";
}

export default function CTABox({
  title,
  description,
  href,
  provider,
  buttonText = "Get a Quote",
  variant = "primary",
}: CTABoxProps) {
  const isPrimary = variant === "primary";

  return (
    <div
      className={`rounded-xl p-6 my-8 ${
        isPrimary
          ? "bg-navy text-white"
          : "bg-warm-gray-lightest border border-gray-200"
      }`}
    >
      <h3
        className={`text-lg font-bold mb-2 ${
          isPrimary ? "text-white" : "text-navy"
        }`}
      >
        {title}
      </h3>
      <p
        className={`text-sm mb-4 leading-relaxed ${
          isPrimary ? "text-gray-300" : "text-warm-gray"
        }`}
      >
        {description}
      </p>
      <AffiliateLink
        href={href}
        provider={provider}
        className={`inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-lg text-sm transition-colors ${
          isPrimary
            ? "bg-teal text-white hover:bg-teal-light"
            : "bg-teal text-white hover:bg-teal-dark"
        }`}
      >
        {buttonText}
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
      </AffiliateLink>
      <p
        className={`text-xs mt-3 ${
          isPrimary ? "text-gray-400" : "text-warm-gray-light"
        }`}
      >
        Affiliate link &mdash; we may earn a commission at no cost to you.
      </p>
    </div>
  );
}
