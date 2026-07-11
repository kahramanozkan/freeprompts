import { supabaseServer } from "@/lib/supabase-server";
import { blogPosts } from "@/lib/blog-data";

export const revalidate = 3600; // Cache feed for 1 hour

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

export async function GET() {
  const baseUrl = "https://freeprompts.store";

  // 1. Fetch prompts from Supabase
  let prompts: any[] = [];
  try {
    const { data, error } = await supabaseServer
      .from("prompts")
      .select("id, title, content, created_at, category")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      prompts = data;
    }
  } catch (err) {
    console.error("Failed to fetch prompts for RSS feed:", err);
  }

  // 2. Prepare items
  const feedItems: Array<{
    title: string;
    link: string;
    description: string;
    pubDate: Date;
    category: string;
  }> = [];

  // Add prompts to items list
  prompts.forEach((prompt) => {
    // Generate clean slug from title
    const slug = prompt.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    feedItems.push({
      title: `${prompt.title} - Free AI Prompt`,
      link: `${baseUrl}/prompt/${prompt.id}/${slug}`,
      description: prompt.content.length > 200 
        ? `${prompt.content.substring(0, 197)}...`
        : prompt.content,
      pubDate: new Date(prompt.created_at),
      category: prompt.category || "AI Prompts",
    });
  });

  // Add blog posts to items list
  blogPosts.forEach((post) => {
    const engContent = post.translations.english;
    feedItems.push({
      title: `${engContent.title} - AI Guide`,
      link: `${baseUrl}/blog/${post.slug}`,
      description: engContent.excerpt,
      pubDate: new Date(post.publishedAt),
      category: "AI Guides",
    });
  });

  // 3. Sort items by date descending
  feedItems.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  // 4. Generate RSS XML string
  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>freeprompts.store - Free AI Prompt Templates &amp; Guides</title>
    <link>${baseUrl}</link>
    <description>Discover, copy, and customize the best free prompt templates for ChatGPT, Midjourney, Claude, and Gemini.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${feedItems
      .map(
        (item) => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.link}</guid>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${item.pubDate.toUTCString()}</pubDate>
      <category>${escapeXml(item.category)}</category>
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800",
    },
  });
}
