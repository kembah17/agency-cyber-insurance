export interface PillarVideoConfig {
  videoSrc: string;
  posterSrc: string;
  title: string;
  description: string;
  duration: string;
  uploadDate: string;
  pageType: 'blog' | 'compare';
}

export const pillarVideos: Record<string, PillarVideoConfig> = {
  'cyber-insurance-social-media-agencies': {
    videoSrc: '/videos/pillar/cyber-insurance-social-media-agencies-explainer-1080p.mp4',
    posterSrc: '/videos/pillar/cyber-insurance-social-media-agencies-explainer-1080p-poster.jpg',
    title: 'Cyber Insurance for Social Media Agencies Explained',
    description: 'Learn why social media agencies need cyber insurance, what it covers, and how to choose the right policy to protect your agency from data breaches and client lawsuits.',
    duration: 'PT39S',
    uploadDate: '2026-04-19',
    pageType: 'blog',
  },
  'cyber-insurance-web-development-agencies': {
    videoSrc: '/videos/pillar/cyber-insurance-web-development-agencies-explainer-1080p.mp4',
    posterSrc: '/videos/pillar/cyber-insurance-web-development-agencies-explainer-1080p-poster.jpg',
    title: 'Cyber Insurance for Web Development Agencies Explained',
    description: 'Discover the essential cyber insurance coverage web development agencies need to protect against code vulnerabilities, client data breaches, and professional liability claims.',
    duration: 'PT38S',
    uploadDate: '2026-04-19',
    pageType: 'blog',
  },
  'cyber-insurance-application-checklist': {
    videoSrc: '/videos/pillar/cyber-insurance-application-checklist-explainer-1080p.mp4',
    posterSrc: '/videos/pillar/cyber-insurance-application-checklist-explainer-1080p-poster.jpg',
    title: 'Cyber Insurance Application Checklist Explained',
    description: 'Walk through the complete cyber insurance application process step by step. Know exactly what documentation and security controls you need before applying.',
    duration: 'PT39S',
    uploadDate: '2026-04-19',
    pageType: 'blog',
  },
  'best-cyber-insurance-digital-agencies': {
    videoSrc: '/videos/pillar/best-cyber-insurance-digital-agencies-explainer-1080p.mp4',
    posterSrc: '/videos/pillar/best-cyber-insurance-digital-agencies-explainer-1080p-poster.jpg',
    title: 'Best Cyber Insurance for Digital Agencies Explained',
    description: 'Compare the top cyber insurance providers for digital agencies. See which carriers offer the best coverage, pricing, and claims experience for agency-specific risks.',
    duration: 'PT43S',
    uploadDate: '2026-04-19',
    pageType: 'compare',
  },
  'how-to-file-cyber-insurance-claim': {
    videoSrc: '/videos/pillar/how-to-file-cyber-insurance-claim-explainer-1080p.mp4',
    posterSrc: '/videos/pillar/how-to-file-cyber-insurance-claim-explainer-1080p-poster.jpg',
    title: 'How to File a Cyber Insurance Claim Explained',
    description: 'Step-by-step guide to filing a cyber insurance claim after a breach. Learn the timeline, documentation requirements, and common mistakes that delay payouts.',
    duration: 'PT40S',
    uploadDate: '2026-04-19',
    pageType: 'blog',
  },
};
