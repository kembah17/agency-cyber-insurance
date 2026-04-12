import Link from "next/link";

const FOOTER_LINKS = {
  Resources: [
    { label: "Blog", href: "/blog" },
    { label: "Compare Policies", href: "/compare" },
    { label: "Methodology", href: "/methodology" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Affiliate Disclaimer", href: "/disclaimer" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-teal rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  />
                </svg>
              </div>
              <span className="text-lg font-bold">AgencyCyberInsurance</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Helping digital agencies navigate cyber liability insurance with
              honest, research-driven guidance.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
                {heading}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Affiliate Disclosure */}
        <div className="mt-10 pt-8 border-t border-gray-700">
          <p className="text-xs text-gray-500 leading-relaxed">
            <strong>Affiliate Disclosure:</strong> Some links on this site are
            affiliate links. If you click through and make a purchase, we may
            earn a commission at no additional cost to you. This helps us
            maintain this resource. We only recommend products we have
            thoroughly researched. See our{" "}
            <Link href="/disclaimer" className="text-gray-400 underline hover:text-white">
              full disclaimer
            </Link>
            .
          </p>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} AgencyCyberInsurance. All rights
            reserved.
          </p>
          <p className="text-xs text-gray-500">
            Content is for informational purposes only and does not constitute
            insurance advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
