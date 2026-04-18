import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  getComparisonBySlug,
  getAllComparisonSlugs,
} from "@/lib/content";
import {
  createMetadata,
  getArticleJsonLd,
  getBreadcrumbJsonLd,
  getFAQJsonLd,
  SITE_URL,
} from "@/lib/metadata";
import MDXContent from "@/components/MDXContent";
import TableOfContents from "@/components/TableOfContents";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import JsonLd from "@/components/JsonLd";
import AuthorBox from "@/components/AuthorBox";
import { TOCItem } from "@/lib/types";
import ArticleTracker from "@/components/ArticleTracker";
import AudioPlayer from "@/components/AudioPlayer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllComparisonSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const comparison = getComparisonBySlug(slug);
  if (!comparison) return {};

  return createMetadata({
    title: comparison.meta.seo_title || comparison.meta.title,
    description: comparison.meta.seo_description || comparison.meta.description,
    path: `/compare/${slug}`,
    type: "article",
    publishedTime: comparison.meta.date,
    modifiedTime: comparison.meta.updated,
  });
}

function extractTOC(content: string): TOCItem[] {
  const headingRegex = /^(#{2,3})+(.+)$/gm;
  const items: TOCItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    items.push({ id, text, level });
  }

  return items;
}

export default async function ComparisonPage({ params }: PageProps) {
  const { slug } = await params;
  const comparison = getComparisonBySlug(slug);
  if (!comparison) notFound();

  const tocItems = extractTOC(comparison.content);
  const wordCount = comparison.content.split(/\s+/).length;

  const formattedDate = new Date(comparison.meta.date).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <>
      <JsonLd
        data={getArticleJsonLd({
          title: comparison.meta.title,
          description: comparison.meta.description,
          slug: `compare/${slug}`,
          date: comparison.meta.date,
          updated: comparison.meta.updated,
        })}
      />
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "Compare", url: `${SITE_URL}/compare` },
          {
            name: comparison.meta.title,
            url: `${SITE_URL}/compare/${slug}`,
          },
        ])}
      />
      {comparison.meta.faq && comparison.meta.faq.length > 0 && (
        <JsonLd
          data={getFAQJsonLd(
            comparison.meta.faq.map((f) => ({ question: f.q, answer: f.a }))
          )}
        />
      )}

      <article className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <ArticleTracker slug={slug} category="comparison" wordCount={wordCount} />
        <BreadcrumbNav
          items={[
            { label: "Compare", href: "/compare" },
            { label: comparison.meta.title },
          ]}
        />

        {/* Header */}
        <header className="mt-8 mb-8 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-navy leading-tight mb-4">
            {comparison.meta.title}
          </h1>
          <p className="text-lg text-warm-gray leading-relaxed">
            {comparison.meta.description}
          </p>
          <div className="flex items-center gap-4 mt-4 text-sm text-warm-gray-light">
            <span>By The AgencyCyberInsurance Team</span>
            <span>&middot;</span>
            <time dateTime={comparison.meta.date}>{formattedDate}</time>
          </div>
        </header>

        {/* Affiliate Disclosure */}
        <div className="mb-8 max-w-3xl">
          <AffiliateDisclosure />
        </div>

        {/* Audio Player */}
        <div className="mb-8 max-w-3xl">
          <AudioPlayer src={`/audio/${slug}.mp3`} />
        </div>

        {/* Content Layout */}
        <div className="flex gap-8">
          <div className="flex-1 min-w-0 max-w-3xl">
            <MDXContent source={comparison.content} />

            <div className="mt-12">
              <AuthorBox />
            </div>
          </div>

          {tocItems.length > 0 && (
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24">
                <TableOfContents items={tocItems} />
              </div>
            </aside>
          )}
        </div>
      </article>
    </>
  );
}
