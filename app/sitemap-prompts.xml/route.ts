import { NextResponse } from 'next/server';
import { promptsApi } from '@/lib/supabase-queries';

export const dynamic = 'force-dynamic'; // Ensure fresh data on each request

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://freeprompts.store';

  try {
    const prompts = await promptsApi.getAll();
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${prompts.map(prompt => `
  <url>
    <loc>${baseUrl}/prompt/${prompt.id}/${prompt.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}</loc>
    <lastmod>${new Date(prompt.created_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating prompts sitemap:', error);
    // Fallback empty sitemap
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300',
      },
    });
  }
}