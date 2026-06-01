import { notFound } from "next/navigation";
import Image from "next/image";
import { Metadata } from "next";
import {
  getPostBySlug,
  getAllPostSlugs,
  getRelatedPosts,
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
import AuthorBox from "@/components/AuthorBox";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import RelatedArticles from "@/components/RelatedArticles";
import JsonLd from "@/components/JsonLd";
import NewsletterSignup from "@/components/NewsletterSignup";
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
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return createMetadata({
    title: post.meta.seo_title || post.meta.title,
    description: post.meta.seo_description || post.meta.description,
    path: `/blog/${slug}`,
    type: "article",
    publishedTime: post.meta.date,
    modifiedTime: post.meta.update_log?.[0]?.date || post.meta.updated,
    tags: post.meta.tags,
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

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const tocItems = extractTOC(post.content);
  const wordCount = post.content.split(/\s+/).length;
  const relatedPosts = getRelatedPosts(
    slug,
    post.meta.category,
    post.meta.tags
  );

  const pillarVideo = pillarVideos[slug];

  const formattedDate = new Date(post.meta.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const lastUpdatedDate = post.meta.update_log?.[0]?.date || post.meta.updated;
  const formattedLastUpdated = lastUpdatedDate
    ? new Date(lastUpdatedDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const hasAffiliateLinks =
    post.meta.affiliate_links && post.meta.affiliate_links.length > 0;

  return (
    <>
      <JsonLd
        data={getArticleJsonLd({
          title: post.meta.title,
          description: post.meta.description,
          slug,
          date: post.meta.date,
          updated: post.meta.updated,
          updateLog: post.meta.update_log,
          image: post.meta.featured_image,
        })}
      />
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "Blog", url: `${SITE_URL}/blog` },
          { name: post.meta.title, url: `${SITE_URL}/blog/${slug}` },
        ])}
      />
      {post.meta.faq && post.meta.faq.length > 0 && (
        <JsonLd
          data={getFAQJsonLd(
            post.meta.faq.map((f) => ({ question: f.q, answer: f.a }))
          )}
        />
      )}

      <article className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <ArticleTracker slug={slug} category={post.meta.category} wordCount={wordCount} />
        <BreadcrumbNav
          items={[
            { label: "Blog", href: "/blog" },
            { label: post.meta.title },
          ]}
        />

        {/* Article Header */}
        <header className="mt-8 mb-8 max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal bg-teal/10 px-2 py-1 rounded">
              {post.meta.category}
            </span>
            <span className="text-sm text-warm-gray">
              {post.meta.read_time} min read
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-navy leading-tight mb-4">
            {post.meta.title}
          </h1>
          <p className="text-lg text-warm-gray leading-relaxed">
            {post.meta.description}
          </p>
          <div className="flex items-center gap-4 mt-4 text-sm text-warm-gray-light">
            <span>By {post.meta.author}</span>
            <span>&middot;</span>
            <time dateTime={post.meta.date}>{formattedDate}</time>
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

        {/* Featured Image */}
        {post.meta.featured_image && (
          <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden mb-8 max-w-3xl">
            <Image
              src={post.meta.featured_image}
              alt={post.meta.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
              priority
            />
          </div>
        )}

        {/* Affiliate Disclosure */}
        {hasAffiliateLinks && (
          <div className="mb-8 max-w-3xl">
            <AffiliateDisclosure />
          </div>
        )}

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
              articleUrl={`/blog/${slug}`}
            />
          </div>
        )}

        {/* Content Layout */}
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0 max-w-3xl">
            <MDXContent source={post.content} />

            {/* Update History */}
            {post.meta.update_log && post.meta.update_log.length > 0 && (
              <div className="mt-12 border-t border-gray-200 pt-8">
                <h2 className="text-xl font-semibold text-navy mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Update History
                </h2>
                <div className="space-y-3">
                  {post.meta.update_log.map((entry, index) => (
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

            {/* Author Box */}
            <div className="mt-12">
              <AuthorBox />
            </div>

            {/* Newsletter */}
            <div className="mt-8">
              <NewsletterSignup />
            </div>

            {/* Related Articles */}
            <RelatedArticles articles={relatedPosts} />
          </div>

          {/* Sidebar - TOC */}
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
