import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://resumetion.com',         lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: 'https://resumetion.com/build',   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://resumetion.com/pricing', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://resumetion.com/terms',   lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: 'https://resumetion.com/privacy', lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ]
}
