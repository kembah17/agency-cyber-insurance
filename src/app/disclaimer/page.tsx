import { createMetadata } from "@/lib/metadata";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import JsonLd from "@/components/JsonLd";
import { getBreadcrumbJsonLd, SITE_URL } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Affiliate Disclaimer",
  description:
    "Full affiliate disclosure and disclaimer for AgencyCyberInsurance.com. Transparency about how we earn revenue and our editorial independence.",
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return (
    <>
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "Affiliate Disclaimer", url: `${SITE_URL}/disclaimer` },
        ])}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <BreadcrumbNav items={[{ label: "Affiliate Disclaimer" }]} />

        <div className="mt-8">
          <h1 className="text-4xl font-bold text-navy mb-6">
            Affiliate Disclaimer &amp; Disclosure
          </h1>

          <div className="prose max-w-none">
            <p className="text-lg text-warm-gray leading-relaxed">
              At AgencyCyberInsurance.com, we believe in complete transparency
              about how we operate and earn revenue. Please read this disclosure
              carefully.
            </p>

            <h2>FTC Compliance Disclosure</h2>
            <p>
              In accordance with the Federal Trade Commission’s guidelines
              concerning the use of endorsements and testimonials in advertising
              (16 CFR Part 255), we disclose the following:
            </p>

            <h2>Affiliate Relationships</h2>
            <p>
              AgencyCyberInsurance.com is a participant in various affiliate
              programs offered by cyber insurance providers and related services.
              This means that some of the links on our website are affiliate
              links. When you click on these links and make a purchase or sign up
              for a service, we may receive a commission at no additional cost to
              you.
            </p>
            <p>
              Affiliate links on our site are identified with appropriate
              disclosures near the link and carry the{" "}
              <code>rel=”nofollow sponsored”</code> attribute.
            </p>

            <h2>Editorial Independence</h2>
            <p>
              Our editorial content is independent of our affiliate
              relationships. Specifically:
            </p>
            <ul>
              <li>
                Commission rates do not influence our ratings, rankings, or
                recommendations.
              </li>
              <li>
                We have recommended and will continue to recommend providers
                that do not offer affiliate programs when they provide the best
                value.
              </li>
              <li>
                Our reviews include both positive and negative aspects of every
                provider.
              </li>
              <li>
                We clearly distinguish between editorial content and sponsored
                content (if any).
              </li>
            </ul>

            <h2>Not Insurance Advice</h2>
            <p>
              The content on AgencyCyberInsurance.com is for informational
              purposes only and should not be construed as insurance advice,
              financial advice, or legal advice. We are not licensed insurance
              brokers, agents, or financial advisors.
            </p>
            <p>
              Every agency’s insurance needs are unique. Before purchasing any
              insurance policy, we strongly recommend consulting with a licensed
              insurance professional who can evaluate your specific situation.
            </p>

            <h2>Accuracy of Information</h2>
            <p>
              We make every effort to ensure the accuracy of the information on
              our website. However, insurance products, pricing, and terms change
              frequently. We cannot guarantee that all information is current at
              the time you read it.
            </p>
            <p>
              Always verify coverage details, pricing, and terms directly with
              the insurance provider before making a purchase decision.
            </p>

            <h2>Testimonials &amp; Reviews</h2>
            <p>
              Any testimonials or reviews on this site reflect the experiences of
              the individuals who provided them. Individual results may vary.
              These testimonials are not intended to represent or guarantee that
              anyone will achieve the same or similar results.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have any questions about this disclosure or our affiliate
              relationships, please contact us through our{" "}
              <a href="/contact">contact page</a>.
            </p>

            <p className="text-sm text-warm-gray-light mt-8">
              Last updated: {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
