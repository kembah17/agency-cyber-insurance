"use client";

import JsonLd from "@/components/JsonLd";

const SITE_URL = "https://www.agencycyberinsurance.com";

interface ArticleVideoProps {
  videoSrc: string;
  posterSrc: string;
  title: string;
  description: string;
  duration: string;
  uploadDate: string;
  articleUrl: string;
}

export default function ArticleVideo({
  videoSrc,
  posterSrc,
  title,
  description,
  duration,
  uploadDate,
  articleUrl,
}: ArticleVideoProps) {
  const videoObjectJsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: title,
    description,
    thumbnailUrl: `${SITE_URL}${posterSrc}`,
    uploadDate,
    duration,
    contentUrl: `${SITE_URL}${videoSrc}`,
    embedUrl: `${SITE_URL}${articleUrl}`,
    publisher: {
      "@type": "Organization",
      name: "AgencyCyberInsurance",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
    hasPart: [
      {
        "@type": "Clip",
        name: "Hook",
        startOffset: 0,
        endOffset: 6,
      },
      {
        "@type": "Clip",
        name: "Essence",
        startOffset: 6,
        endOffset: 18,
      },
      {
        "@type": "Clip",
        name: "Solution",
        startOffset: 18,
        endOffset: 30,
      },
      {
        "@type": "Clip",
        name: "Call to Action",
        startOffset: 30,
        endOffset: parseInt(duration.replace(/\D/g, ""), 10) || 40,
      },
    ],
  };

  return (
    <>
      <JsonLd data={videoObjectJsonLd} />
      <div className="max-w-4xl mx-auto my-8">
        <h2 className="text-lg font-semibold text-navy mb-3">
          Watch: {title}
        </h2>
        <video
          controls
          preload="metadata"
          playsInline
          poster={posterSrc}
          className="w-full rounded-lg shadow-lg"
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </>
  );
}
