# AgencyCyberInsurance.com

SEO-focused affiliate content website about cyber liability insurance for digital agencies.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript
- **Content:** MDX with frontmatter
- **Rendering:** Static Site Generation (SSG)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Home page
│   ├── about/              # About page
│   ├── methodology/        # Research methodology
│   ├── blog/               # Blog listing + [slug] dynamic pages
│   ├── compare/            # Comparison listing + [slug] dynamic pages
│   ├── contact/            # Contact form
│   ├── disclaimer/         # Affiliate disclosure page
│   ├── layout.tsx          # Root layout with Header/Footer
│   ├── globals.css         # Tailwind + custom styles
│   ├── sitemap.ts          # Dynamic sitemap.xml generation
│   └── robots.ts           # robots.txt configuration
├── components/             # Reusable UI components
│   ├── Header.tsx          # Site header with mobile menu
│   ├── Footer.tsx          # Site footer with affiliate disclosure
│   ├── ArticleCard.tsx     # Blog post card for listings
│   ├── ComparisonTable.tsx # Provider comparison table
│   ├── TableOfContents.tsx # Sticky sidebar TOC
│   ├── AuthorBox.tsx       # Author attribution component
│   ├── AffiliateDisclosure.tsx  # FTC-compliant disclosure
│   ├── AffiliateLink.tsx   # Tracked affiliate link wrapper
│   ├── CTABox.tsx          # Call-to-action component
│   ├── BreadcrumbNav.tsx   # Schema-enabled breadcrumbs
│   ├── NewsletterSignup.tsx # Email capture form (UI only)
│   ├── ProsCons.tsx        # Pros/cons comparison component
│   ├── RatingStars.tsx     # Visual star rating
│   ├── RelatedArticles.tsx # Related content suggestions
│   ├── MDXContent.tsx      # MDX renderer with custom components
│   └── JsonLd.tsx          # Structured data injection
├── content/                # MDX content files
│   ├── blog/               # Blog posts
│   └── compare/            # Comparison articles
└── lib/                    # Utilities and data
    ├── affiliates.ts       # Centralized affiliate provider management
    ├── content.ts          # MDX content loading and parsing
    ├── metadata.ts         # SEO metadata and JSON-LD helpers
    └── types.ts            # TypeScript type definitions
```

## Pages

| Route | Description |
|---|---|
| `/` | Home page with hero, featured articles, trust signals |
| `/about` | Agency persona story and methodology overview |
| `/methodology` | Research and comparison methodology |
| `/blog` | Blog listing with categories |
| `/blog/[slug]` | Individual blog post with TOC, author box |
| `/compare` | Provider comparison listing with table |
| `/compare/[slug]` | Detailed provider comparison article |
| `/contact` | Contact form |
| `/disclaimer` | Full affiliate disclosure |
| `/sitemap.xml` | Auto-generated sitemap |
| `/robots.txt` | Search engine directives |

## Content Management

### Adding a Blog Post

Create a new `.mdx` file in `src/content/blog/`:

```mdx
---
title: "Your Post Title"
description: "Post description for SEO"
date: "2025-01-15"
updated: "2025-01-20"
author: "The AgencyCyberInsurance Team"
category: "Guides"
tags: ["cyber insurance", "digital agencies"]
featured_image: "/images/blog/your-image.jpg"
affiliate_links: ["coalition", "hiscox"]
read_time: 8
seo_title: "SEO-optimized title"
seo_description: "SEO-optimized description"
featured: false
---

Your content here using standard Markdown and MDX components.
```

### Adding a Comparison Page

Create a new `.mdx` file in `src/content/compare/`:

```mdx
---
title: "Provider A vs Provider B"
description: "Comparison description"
date: "2025-02-01"
updated: "2025-02-15"
author: "The AgencyCyberInsurance Team"
category: "Comparisons"
tags: ["comparison"]
providers: ["provider-a", "provider-b"]
seo_title: "SEO title for comparison"
seo_description: "SEO description for comparison"
---

Your comparison content here.
```

### Managing Affiliate Providers

All affiliate providers are centralized in `src/lib/affiliates.ts`. To add a new provider:

1. Add the provider object to `AFFILIATE_PROVIDERS`
2. Include: name, slug, url, description, rating, pros, cons, features, pricing, cta_text
3. The provider will automatically appear on the Compare page

## SEO Features

- **Dynamic sitemap.xml** — Auto-generated from all pages and content
- **robots.txt** — Configured for search engine access
- **JSON-LD structured data** — Organization, Article, BreadcrumbList schemas
- **Open Graph & Twitter Cards** — Social sharing metadata on all pages
- **Canonical URLs** — Proper canonical tags on every page
- **Breadcrumb navigation** — Schema-enabled breadcrumbs

## Affiliate Infrastructure

- **Centralized link management** — All affiliate URLs in `lib/affiliates.ts`
- **AffiliateLink component** — Adds `rel="nofollow sponsored"` automatically
- **FTC disclosure** — Displayed on every page with affiliate links
- **Full disclaimer page** — Comprehensive affiliate disclosure at `/disclaimer`

## Design System

- **Primary:** Navy (#1B2A4A)
- **Accent:** Teal (#0D9488)
- **Background:** White
- **Text:** Warm Gray (#4A4A4A)
- **Typography:** Inter (Google Fonts)
- **Style:** Professional, trustworthy, clean — inspired by Wirecutter/NerdWallet

## Deployment

Optimized for Vercel deployment:

```bash
npm run build   # Generates static pages
vercel deploy   # Deploy to Vercel
```

All pages are statically generated at build time for optimal performance.

## License

Private — All rights reserved.
