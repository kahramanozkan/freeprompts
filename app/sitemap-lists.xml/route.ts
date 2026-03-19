import { NextResponse } from 'next/server';
import { listsApi } from '@/lib/supabase-queries';

export const dynamic = 'force-dynamic'; // Ensure fresh data on each request

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://freeprompts.store';

  try {
    const lists = await listsApi.getAll();
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${lists.map(list => `
  <url>
    <loc>${baseUrl}/list/${list.id}/${list.slug}</loc>
    <lastmod>${new Date(list.created_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating lists sitemap:', error);
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