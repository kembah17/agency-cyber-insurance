import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { ArticleMeta, ComparisonMeta } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "src/content");

/**
 * Get all blog post metadata, sorted by date descending
 */
export function getAllPosts(): ArticleMeta[] {
  const dir = path.join(CONTENT_DIR, "blog");
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));

  const posts = files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, "");
    const filePath = path.join(dir, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);
    const stats = readingTime(content);

    return {
      ...data,
      slug,
      read_time: data.read_time || Math.ceil(stats.minutes),
    } as ArticleMeta;
  });

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Get a single blog post by slug
 */
export function getPostBySlug(slug: string) {
  const filePath = path.join(CONTENT_DIR, "blog", `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);
  const stats = readingTime(content);

  return {
    meta: {
      ...data,
      slug,
      read_time: data.read_time || Math.ceil(stats.minutes),
    } as ArticleMeta,
    content,
  };
}

/**
 * Get all blog post slugs for static generation
 */
export function getAllPostSlugs(): string[] {
  const dir = path.join(CONTENT_DIR, "blog");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

/**
 * Get all comparison page metadata
 */
export function getAllComparisons(): ComparisonMeta[] {
  const dir = path.join(CONTENT_DIR, "compare");
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));

  const comparisons = files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, "");
    const filePath = path.join(dir, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(fileContent);

    return {
      ...data,
      slug,
    } as ComparisonMeta;
  });

  return comparisons.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Get a single comparison page by slug
 */
export function getComparisonBySlug(slug: string) {
  const filePath = path.join(CONTENT_DIR, "compare", `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  return {
    meta: {
      ...data,
      slug,
    } as ComparisonMeta,
    content,
  };
}

/**
 * Get all comparison slugs for static generation
 */
export function getAllComparisonSlugs(): string[] {
  const dir = path.join(CONTENT_DIR, "compare");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

/**
 * Get posts by category
 */
export function getPostsByCategory(category: string): ArticleMeta[] {
  return getAllPosts().filter(
    (p) => p.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Get all unique categories
 */
export function getAllCategories(): string[] {
  const posts = getAllPosts();
  const cats = new Set(posts.map((p) => p.category));
  return Array.from(cats).sort();
}

/**
 * Get featured posts
 */
export function getFeaturedPosts(limit = 3): ArticleMeta[] {
  return getAllPosts()
    .filter((p) => p.featured)
    .slice(0, limit);
}

/**
 * Get related posts by matching tags/category
 */
export function getRelatedPosts(
  currentSlug: string,
  category: string,
  tags: string[],
  limit = 3
): ArticleMeta[] {
  const allPosts = getAllPosts().filter((p) => p.slug !== currentSlug);

  const scored = allPosts.map((post) => {
    let score = 0;
    if (post.category === category) score += 2;
    const commonTags = post.tags.filter((t) => tags.includes(t));
    score += commonTags.length;
    return { post, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.post);
}
