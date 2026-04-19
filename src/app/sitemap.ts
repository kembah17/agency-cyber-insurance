import { MetadataRoute } from "next";
import { getAllPosts, getAllComparisons } from "@/lib/content";
import { pillarVideos } from "@/lib/pillar-videos";

const SITE_URL = "https://agencycyberinsurance.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const comparisons = getAllComparisons();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/compare`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/tools/recommendation-engine`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/methodology`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/disclaimer`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const blogPages: MetadataRoute.Sitemap = posts.map((post) => {
    const video = pillarVideos[post.slug];
    return {
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.updated || post.date),
      changeFrequency: "weekly" as const,
      priority: post.featured ? 0.9 : 0.8,
      ...(video && {
        videos: [
          {
            title: video.title,
            thumbnail_loc: `${SITE_URL}${video.posterSrc}`,
            description: video.description,
            content_loc: `${SITE_URL}${video.videoSrc}`,
            duration: parseInt(video.duration.replace(/\D/g, ""), 10),
            publication_date: video.uploadDate,
          },
        ],
      }),
    };
  });

  const comparisonPages: MetadataRoute.Sitemap = comparisons.map(
    (comparison) => {
      const video = pillarVideos[comparison.slug];
      return {
        url: `${SITE_URL}/compare/${comparison.slug}`,
        lastModified: new Date(comparison.updated || comparison.date),
        changeFrequency: "weekly" as const,
        priority: 0.8,
        ...(video && {
          videos: [
            {
              title: video.title,
              thumbnail_loc: `${SITE_URL}${video.posterSrc}`,
              description: video.description,
              content_loc: `${SITE_URL}${video.videoSrc}`,
              duration: parseInt(video.duration.replace(/\D/g, ""), 10),
              publication_date: video.uploadDate,
            },
          ],
        }),
      };
    }
  );

  return [...staticPages, ...blogPages, ...comparisonPages];
}
