import { createMetadata } from "@/lib/metadata";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import JsonLd from "@/components/JsonLd";
import { getBreadcrumbJsonLd, SITE_URL } from "@/lib/metadata";
import Link from "next/link";
import Image from "next/image";

export const metadata = createMetadata({
  title: "About Us",
  description:
    "We’re a digital agency team that spent months researching cyber liability insurance. Now we share what we learned to help fellow agency owners.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "About Us", url: `${SITE_URL}/about` },
        ])}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <BreadcrumbNav items={[{ label: "About Us" }]} />

        <div className="mt-8">
          <h1 className="text-4xl font-bold text-navy mb-6">
            About AgencyCyberInsurance
          </h1>

          <div className="prose max-w-none">
            <p className="text-lg text-warm-gray leading-relaxed">
              We’re not insurance brokers or financial advisors. We’re a team of
              digital agency operators who went through the often confusing,
              time-consuming process of finding the right cyber liability
              insurance for our own business.
            </p>

            <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden my-8">
              <Image
                src="/images/about-team.jpg"
                alt="The AgencyCyberInsurance team collaborating in a modern office"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
                priority
              />
            </div>

            <h2>Why We Built This Resource</h2>
            <p>
              When we started looking into cyber liability insurance for our
              agency, we were overwhelmed. The jargon was dense, the policies
              were complex, and most comparison sites seemed to be written by
              people who had never actually run an agency or filed a claim.
            </p>
            <p>
              We spent weeks reading policy documents, talking to brokers,
              comparing quotes, and trying to understand what coverage we
              actually needed. Along the way, we realized that thousands of
              other agency owners were going through the same frustrating
              process.
            </p>
            <p>
              So we decided to document everything we learned and share it
              publicly. AgencyCyberInsurance is the resource we wish existed
              when we started our search.
            </p>

            <h2>Our Approach</h2>
            <p>
              Everything on this site comes from our real experience as agency
              owners evaluating cyber insurance options. We focus on:
            </p>
            <ul>
              <li>
                <strong>Practical relevance:</strong> We evaluate policies
                through the lens of what actually matters for running a digital
                agency—client data protection, business interruption, social
                engineering fraud, and regulatory compliance.
              </li>
              <li>
                <strong>Honest comparisons:</strong> We highlight both strengths
                and weaknesses of every provider we review. No provider is
                perfect, and we believe you deserve the full picture.
              </li>
              <li>
                <strong>Plain language:</strong> Insurance is complicated enough
                without unnecessary jargon. We explain everything in terms that
                agency owners can actually understand.
              </li>
              <li>
                <strong>Regular updates:</strong> The cyber insurance landscape
                changes frequently. We revisit our reviews and comparisons
                regularly to keep them current.
              </li>
            </ul>

            <h2>How We Make Money</h2>
            <p>
              Transparency matters to us. Some of the links on this site are
              affiliate links, which means we may earn a commission if you
              purchase a policy through our links. This comes at no additional
              cost to you.
            </p>
            <p>
              Importantly, affiliate relationships never influence our
              recommendations. We recommend providers based on our research and
              experience, not on commission rates. You can read our full{" "}
              <Link href="/disclaimer">affiliate disclaimer</Link> for more
              details.
            </p>

            <h2>Who We Are</h2>
            <p>
              The AgencyCyberInsurance Team is a small group of digital agency
              professionals with combined experience spanning web development,
              digital marketing, and business operations. We’ve managed client
              data, dealt with security incidents, and navigated the insurance
              buying process firsthand.
            </p>
            <p>
              We’re based in the US and UK, giving us perspective on cyber
              insurance markets in both regions—which is particularly relevant
              for agencies with international clients.
            </p>

            <h2>Get in Touch</h2>
            <p>
              Have questions, suggestions, or feedback? We’d love to hear from
              you. Visit our{" "}
              <Link href="/contact">contact page</Link> to get in touch.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
