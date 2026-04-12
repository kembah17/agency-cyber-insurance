import { createMetadata } from "@/lib/metadata";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import JsonLd from "@/components/JsonLd";
import { getBreadcrumbJsonLd, SITE_URL } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Our Research Methodology",
  description:
    "How we research, evaluate, and compare cyber liability insurance providers for digital agencies. Our transparent methodology explained.",
  path: "/methodology",
});

export default function MethodologyPage() {
  return (
    <>
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "Methodology", url: `${SITE_URL}/methodology` },
        ])}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <BreadcrumbNav items={[{ label: "Methodology" }]} />

        <div className="mt-8">
          <h1 className="text-4xl font-bold text-navy mb-6">
            How We Research &amp; Compare Policies
          </h1>

          <div className="prose max-w-none">
            <p className="text-lg text-warm-gray leading-relaxed">
              We believe in full transparency about how we evaluate cyber
              liability insurance providers. Here’s our methodology, step by
              step.
            </p>

            <h2>1. Provider Identification</h2>
            <p>
              We start by identifying all major cyber insurance providers that
              serve digital agencies in the US and UK markets. This includes
              both traditional insurers with cyber products and insurtech
              companies built specifically for technology businesses.
            </p>
            <p>
              We look at providers recommended by industry associations,
              insurance brokers specializing in tech companies, and those
              frequently mentioned in agency communities and forums.
            </p>

            <h2>2. Policy Document Analysis</h2>
            <p>
              For each provider, we obtain and carefully read the actual policy
              documents—not just the marketing materials. We pay special
              attention to:
            </p>
            <ul>
              <li>Coverage scope and limits</li>
              <li>Exclusions and limitations</li>
              <li>Definitions of key terms (like “cyber incident”)</li>
              <li>Waiting periods and retroactive dates</li>
              <li>Sub-limits on specific coverage types</li>
              <li>Conditions that could void coverage</li>
            </ul>

            <h2>3. Agency-Specific Evaluation Criteria</h2>
            <p>
              We evaluate every provider against criteria specifically relevant
              to digital agencies:
            </p>

            <div className="bg-warm-gray-lightest rounded-xl p-6 my-6">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    title: "Client Data Protection",
                    desc: "Coverage for breaches involving client data you store or process",
                  },
                  {
                    title: "Business Interruption",
                    desc: "Lost income when a cyber event disrupts your operations",
                  },
                  {
                    title: "Social Engineering",
                    desc: "Protection against phishing, BEC, and impersonation fraud",
                  },
                  {
                    title: "Regulatory Defense",
                    desc: "Legal costs for GDPR, CCPA, and other regulatory actions",
                  },
                  {
                    title: "Third-Party Liability",
                    desc: "Claims from clients whose data was compromised through your systems",
                  },
                  {
                    title: "Incident Response",
                    desc: "Access to forensics, legal counsel, and PR support after a breach",
                  },
                ].map((item) => (
                  <div key={item.title} className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-navy text-sm">
                      {item.title}
                    </h4>
                    <p className="text-xs text-warm-gray mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <h2>4. Pricing Research</h2>
            <p>
              We gather pricing information through multiple channels: direct
              quotes, broker consultations, published rate information, and
              community-reported pricing. We present pricing ranges rather than
              exact figures, since premiums vary significantly based on agency
              size, revenue, and risk profile.
            </p>

            <h2>5. Claims Process Evaluation</h2>
            <p>
              A policy is only as good as its claims process. We research each
              provider’s claims handling by reviewing:
            </p>
            <ul>
              <li>Published claims procedures and timelines</li>
              <li>Customer reviews and testimonials about claims experiences</li>
              <li>Industry ratings and financial stability scores</li>
              <li>Availability of 24/7 incident response</li>
            </ul>

            <h2>6. Rating System</h2>
            <p>
              Our ratings are based on a weighted scoring system across five
              dimensions:
            </p>
            <ul>
              <li><strong>Coverage Breadth (30%):</strong> How comprehensive is the policy for agency-specific risks?</li>
              <li><strong>Value for Money (25%):</strong> How does pricing compare to coverage provided?</li>
              <li><strong>Claims Experience (20%):</strong> How smooth and reliable is the claims process?</li>
              <li><strong>Ease of Purchase (15%):</strong> How simple is it to get a quote and bind a policy?</li>
              <li><strong>Additional Services (10%):</strong> What extras are included (risk monitoring, training, etc.)?</li>
            </ul>

            <h2>7. Regular Updates</h2>
            <p>
              The cyber insurance market evolves rapidly. We review and update
              our content on a quarterly basis, or sooner when providers make
              significant changes to their offerings. Every article and
              comparison page shows its last-updated date.
            </p>

            <h2>Editorial Independence</h2>
            <p>
              While we do earn affiliate commissions from some providers, our
              editorial process is completely independent of our commercial
              relationships. Commission rates never influence our ratings or
              recommendations. We have recommended providers with no affiliate
              program when they offer the best value for agencies.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
