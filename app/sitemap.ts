import { MetadataRoute } from 'next';
import { promptsApi, listsApi } from '@/lib/supabase-queries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://freeprompts.store';

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return basic sitemap if Supabase is not configured
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];
  }
  
  try {
    // Get all prompts and lists for sitemap
    const [prompts, lists] = await Promise.all([
      promptsApi.getAll().catch(() => []),
      listsApi.getAll().catch(() => [])
    ]);

    const staticPages: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/prompts`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/lists`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/faq`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/privacy`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.3,
      },
      {
        url: `${baseUrl}/terms`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.3,
      },
    ];

    const promptPages: MetadataRoute.Sitemap = prompts.map((prompt) => ({
      url: `${baseUrl}/prompt/${prompt.id}/${prompt.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      lastModified: new Date(prompt.created_at),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    const listPages: MetadataRoute.Sitemap = lists.map((list) => ({
      url: `${baseUrl}/list/${list.id}/${list.slug}`,
      lastModified: new Date(list.created_at),
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

    return [...staticPages, ...promptPages, ...listPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return basic sitemap if there's an error
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];
  }
}