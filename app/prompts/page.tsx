import { Metadata } from 'next';
import { supabaseServer } from "@/lib/supabase-server";
import type { Database } from "@/lib/database.types";
import PromptsClient from './page.client';

type Prompt = Database['public']['Tables']['prompts']['Row'] & {
  userName?: string;
  list?: string;
  variantCount?: number;
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    tag?: string;
    theme?: string;
    group?: string;
    q?: string;
  }>;
}): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const { category, tag, theme, group, q } = resolvedParams;

  let title = "Browse AI Prompts";
  let description = "Discover and explore AI prompts for various purposes including ChatGPT, Claude, and other AI models.";

  const filters = [];
  if (category) filters.push(category);
  if (tag) filters.push(`#${tag}`);
  if (theme) filters.push(theme);
  if (group) filters.push(group);

  if (filters.length > 0) {
    const filterText = filters.join(" ");
    title = `Free ${filterText} AI Prompts & Ready to Use Templates`;
    description = `Discover and copy free ${filterText.toLowerCase()} AI prompts. Ready-to-use templates for ChatGPT, Claude, Gemini, and Midjourney.`;
  } else if (q) {
    title = `Search Results for "${q}" AI Prompts`;
    description = `Browse AI prompts matching "${q}". Find and copy free templates for ChatGPT, Claude, Gemini, and Midjourney.`;
  }

  return {
    title,
    description,
  };
}

export const revalidate = 60;

async function getInitialPrompts(): Promise<{ prompts: Prompt[], totalCount: number }> {
  const { data, count, error } = await supabaseServer
    .from('prompts')
    .select(`
      id, title, image, tags, likes, created_at, user_id, sort_order,
      user:users(id, name)
    `, { count: 'exact' })
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(0, 11); // First 12 items

  if (error) throw new Error(`Supabase error fetching prompts: ${error.message}`);
  if (!data || data.length === 0) return { prompts: [], totalCount: 0 };

  // Get variant counts
  const promptIds = data.map(p => p.id);
  let variantCounts: Record<string, number> = {};
  
  const { data: variants, error: variantsError } = await supabaseServer
    .from('prompt_variants')
    .select('prompt_id')
    .in('prompt_id', promptIds);

  if (variantsError) {
    console.warn('Error fetching variant counts:', variantsError);
  } else {
    promptIds.forEach(id => variantCounts[id] = 0);
    variants?.forEach(row => {
      variantCounts[row.prompt_id] = (variantCounts[row.prompt_id] || 0) + 1;
    });
  }

  const prompts = data.map((prompt: any) => ({
    ...prompt,
    userName: prompt.user?.name || "Anonymous",
    list: prompt.tags?.[0] || "General",
    variantCount: variantCounts[prompt.id] || 0
  }));

  return { prompts, totalCount: count || 0 };
}

async function getUniqueMetadata(): Promise<{ tags: string[], categories: string[], themes: string[], groups: string[] }> {
  // We fetch up to 1000 items to extract unique metadata
  const { data, error } = await supabaseServer
    .from('prompts')
    .select('tags, category, theme, group')
    .limit(1000);

  if (error) throw new Error(`Supabase error fetching metadata: ${error.message}`);
  
  const tagSet = new Set<string>();
  const categorySet = new Set<string>();
  const themeSet = new Set<string>();
  const groupSet = new Set<string>();

  data?.forEach(row => {
    if (row.tags && Array.isArray(row.tags)) {
      row.tags.forEach((tag: string) => tagSet.add(tag));
    }
    if (row.category) categorySet.add(row.category);
    if (row.theme) themeSet.add(row.theme);
    if (row.group) groupSet.add(row.group);
  });
  
  return {
    tags: Array.from(tagSet).sort(),
    categories: Array.from(categorySet).sort(),
    themes: Array.from(themeSet).sort(),
    groups: Array.from(groupSet).sort()
  };
}

export default async function PromptsPage() {
  const [initialData, metadata] = await Promise.all([
    getInitialPrompts(),
    getUniqueMetadata()
  ]);

  const initialPrompts = initialData.prompts;
  const initialTotalCount = initialData.totalCount;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Browse AI Prompts",
            "description": "Discover and explore AI prompts for various purposes including ChatGPT, Claude, and other AI models.",
            "url": "https://freeprompts.store/prompts",
            "mainEntity": {
              "@type": "ItemList",
              "name": "AI Prompts Collection",
              "description": "A curated collection of AI prompts for different use cases",
              "numberOfItems": initialPrompts.length,
              "itemListElement": initialPrompts.slice(0, 20).map((prompt, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                  "@type": "CreativeWork",
                  "name": prompt.title,
                  "description": prompt.content?.substring(0, 160) || "",
                  "url": `https://freeprompts.store/prompt/${prompt.id}/${prompt.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                  "creator": {
                    "@type": "Person",
                    "name": prompt.userName || "Anonymous"
                  },
                  "dateCreated": prompt.created_at,
                  "keywords": prompt.tags?.join(", "),
                  "interactionStatistic": {
                    "@type": "InteractionCounter",
                    "interactionType": "https://schema.org/LikeAction",
                    "userInteractionCount": prompt.likes || 0
                  }
                }
              }))
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://freeprompts.store"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Prompts",
                  "item": "https://freeprompts.store/prompts"
                }
              ]
            }
          })
        }}
      />
      <PromptsClient 
        initialPrompts={initialPrompts}
        initialTotalCount={initialTotalCount}
        initialTags={metadata.tags}
        initialCategories={metadata.categories}
        initialThemes={metadata.themes}
        initialGroups={metadata.groups}
      />
    </>
  );
}