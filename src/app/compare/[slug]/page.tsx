import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  getComparisonBySlug,
  getAllComparisonSlugs,
} from "@/lib/content";
import {
  createMetadata,
  getArticleJsonLd,
  getAudioObjectJsonLd,
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
import { audioDurations } from "@/lib/audio-durations";
import { pillarVideos } from "@/lib/pillar-videos";
import ArticleVideo from "@/components/ArticleVideo";

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
    modifiedTime: comparison.meta.update_log?.[0]?.date || comparison.meta.updated,
    noSuffix: true,
  });
}

function extractTOC(content: string): TOCItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
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

  const pillarVideo = pillarVideos[slug];

  const formattedDate = new Date(comparison.meta.date).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const lastUpdatedDate = comparison.meta.update_log?.[0]?.date || comparison.meta.updated;
  const formattedLastUpdated = lastUpdatedDate
    ? new Date(lastUpdatedDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <>
      <JsonLd
        data={getArticleJsonLd({
          title: comparison.meta.title,
          description: comparison.meta.description,
          slug: `compare/${slug}`,
          date: comparison.meta.date,
          updated: comparison.meta.updated,
          updateLog: comparison.meta.update_log,
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

          {/* Last Updated Badge */}
          {formattedLastUpdated && formattedLastUpdated !== formattedDate && (
            <div className="mt-3 inline-flex items-center gap-1.5 text-sm text-teal bg-teal/5 border border-teal/20 px-3 py-1.5 rounded-md">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Last updated: <time dateTime={lastUpdatedDate}>{formattedLastUpdated}</time></span>
            </div>
          )}
        </header>

        {/* Affiliate Disclosure */}
        <div className="mb-8 max-w-3xl">
          <AffiliateDisclosure />
        </div>

        {/* Audio Player */}
        <div className="mb-8 max-w-3xl">
          <AudioPlayer src={`/audio/${slug}.mp3`} />
        </div>

        {/* Pillar Video */}
        {pillarVideo && (
          <div className="mb-8 max-w-3xl">
            <ArticleVideo
              videoSrc={pillarVideo.videoSrc}
              posterSrc={pillarVideo.posterSrc}
              title={pillarVideo.title}
              description={pillarVideo.description}
              duration={pillarVideo.duration}
              uploadDate={pillarVideo.uploadDate}
              articleUrl={`/compare/${slug}`}
            />
          </div>
        )}

        {/* Content Layout */}
        <div className="flex gap-8">
          <div className="flex-1 min-w-0 max-w-3xl">
            <MDXContent source={comparison.content} />

            {/* Update History */}
            {comparison.meta.update_log && comparison.meta.update_log.length > 0 && (
              <div className="mt-12 border-t border-gray-200 pt-8">
                <h2 className="text-xl font-semibold text-navy mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Update History
                </h2>
                <div className="space-y-3">
                  {comparison.meta.update_log.map((entry, index) => (
                    <div key={index} className="flex gap-3 text-sm">
                      <time
                        dateTime={entry.date}
                        className="text-warm-gray-light font-mono whitespace-nowrap min-w-[100px]"
                      >
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                      <span className="text-warm-gray">{entry.change}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
