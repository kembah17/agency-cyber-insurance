import { Metadata } from "next";

const SITE_URL = "https://agencycyberinsurance.com";
const SITE_NAME = "AgencyCyberInsurance";
const SITE_DESCRIPTION =
  "Cyber insurance decoded by the agencies who buy it. Expert cyber liability insurance guidance for digital agencies — compare policies, understand coverage, and protect your agency from cyber threats.";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export function createMetadata({
  title,
  description,
  path = "",
  ogImage,
  type = "website",
  publishedTime,
  modifiedTime,
  tags,
}: {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
}): Metadata {
  const url = `${SITE_URL}${path}`;
  const fullTitle = path === "" ? title : `${title} | ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      type: type === "article" ? "article" : "website",
      images: [
        {
          url: ogImage || DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(tags && { tags }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage || DEFAULT_OG_IMAGE],
    },
  };
}

export function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      url: `${SITE_URL}/contact`,
    },
  };
}

export function getArticleJsonLd({
  title,
  description,
  slug,
  date,
  updated,
  image,
}: {
  title: string;
  description: string;
  slug: string;
  date: string;
  updated?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: `${SITE_URL}/blog/${slug}`,
    datePublished: date,
    dateModified: updated || date,
    image: image || DEFAULT_OG_IMAGE,
    author: {
      "@type": "Organization",
      name: "The AgencyCyberInsurance Team",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
  };
}

export function getBreadcrumbJsonLd(
  items: { name: string; url?: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.url && { item: item.url }),
    })),
  };
}

export function getFAQJsonLd(
  questions: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}

export { SITE_URL, SITE_NAME, SITE_DESCRIPTION };
