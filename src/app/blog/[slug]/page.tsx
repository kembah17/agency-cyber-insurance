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
  getBreadcrumbJsonLd,
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
    modifiedTime: post.meta.updated,
    tags: post.meta.tags,
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
  const relatedPosts = getRelatedPosts(
    slug,
    post.meta.category,
    post.meta.tags
  );

  const formattedDate = new Date(post.meta.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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

      <article className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
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
            {post.meta.updated && post.meta.updated !== post.meta.date && (
              <>
                <span>&middot;</span>
                <span>
                  Updated{" "}
                  {new Date(post.meta.updated).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </>
            )}
          </div>
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

        {/* Content Layout */}
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0 max-w-3xl">
            <MDXContent source={post.content} />

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
