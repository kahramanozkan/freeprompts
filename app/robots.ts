import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://freeprompts.store';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/auth/',
        '/add-',
        '/edit/',
        '/manage/',
        '/notifications/',
        '/list-edit/',
        '/prompt-edit/',
        '/*.json$',
      ],
    },
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap-prompts.xml`,
      `${baseUrl}/sitemap-lists.xml`,
    ],
    host: baseUrl,
  };
}