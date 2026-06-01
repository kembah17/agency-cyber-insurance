import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeExternalLinks from "rehype-external-links";
import ComparisonTable from "./ComparisonTable";
import CTABox from "./CTABox";
import ProsCons from "./ProsCons";
import RatingStars from "./RatingStars";
import AffiliateLink from "./AffiliateLink";
import AffiliateDisclosure from "./AffiliateDisclosure";
import NewsletterSignup from "./NewsletterSignup";
import ExperienceCallout from "./ExperienceCallout";
import QuickAnswer from "./QuickAnswer";
import KeyStat from "./KeyStat";

const components = {
  ComparisonTable,
  CTABox,
  ProsCons,
  RatingStars,
  AffiliateLink,
  AffiliateDisclosure,
  NewsletterSignup,
  ExperienceCallout,
  QuickAnswer,
  KeyStat,
};

interface MDXContentProps {
  source: string;
}

export default function MDXContent({ source }: MDXContentProps) {
  return (
    <div className="prose max-w-none">
      <MDXRemote
        source={source}
        components={components}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeSlug,
              [rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }],
            ],
          },
        }}
      />
    </div>
  );
}
