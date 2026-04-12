export interface ArticleFrontmatter {
  title: string;
  description: string;
  date: string;
  updated?: string;
  author: string;
  category: string;
  tags: string[];
  featured_image?: string;
  affiliate_links?: AffiliateReference[];
  read_time?: number;
  seo_title?: string;
  seo_description?: string;
  featured?: boolean;
}

export interface AffiliateReference {
  provider: string;
  url_key: string;
}

export interface ArticleMeta extends ArticleFrontmatter {
  slug: string;
  read_time: number;
}

export interface ComparisonFrontmatter {
  title: string;
  description: string;
  date: string;
  updated?: string;
  providers: string[];
  category: string;
  seo_title?: string;
  seo_description?: string;
}

export interface ComparisonMeta extends ComparisonFrontmatter {
  slug: string;
}

export interface AffiliateProvider {
  name: string;
  slug: string;
  url: string;
  description: string;
  rating: number;
  pros: string[];
  cons: string[];
  features: Record<string, string | boolean>;
  cta_text: string;
  pricing: string;
  logo?: string;
  commission_note?: string;
}

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
