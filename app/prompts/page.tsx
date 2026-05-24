import { Metadata } from 'next';
import { supabaseServer } from "@/lib/supabase-server";
import type { Database } from "@/lib/database.types";
import PromptsClient from './page.client';

type Prompt = Database['public']['Tables']['prompts']['Row'] & {
  userName?: string;
  list?: string;
  variantCount?: number;
};

export const metadata: Metadata = {
  title: 'Browse Prompts',
  description: 'Discover and explore AI prompts for various purposes including ChatGPT, Claude, and other AI models.',
};

export const revalidate = 60;

async function getInitialPrompts(): Promise<Prompt[]> {
  const { data, error } = await supabaseServer
    .from('prompts')
    .select(`
      id, title, image, tags, likes, created_at, user_id,
      user:users(id, name)
    `)
    .order('created_at', { ascending: false })
    .range(0, 11); // First 12 items

  if (error) throw new Error(`Supabase error fetching prompts: ${error.message}`);
  if (!data || data.length === 0) return [];

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

  return data.map((prompt: any) => ({
    ...prompt,
    userName: prompt.user?.name || "Anonymous",
    list: prompt.tags?.[0] || "General",
    variantCount: variantCounts[prompt.id] || 0
  }));
}

async function getUniqueTags(): Promise<string[]> {
  const { data, error } = await supabaseServer
    .from('prompts')
    .select('tags')
    .limit(500);

  if (error) throw new Error(`Supabase error fetching tags: ${error.message}`);
  
  const tagSet = new Set<string>();
  data?.forEach(row => {
    if (row.tags && Array.isArray(row.tags)) {
      row.tags.forEach((tag: string) => tagSet.add(tag));
    }
  });
  return Array.from(tagSet).sort();
}

export default async function PromptsPage() {
  const [initialPrompts, allTags] = await Promise.all([
    getInitialPrompts(),
    getUniqueTags()
  ]);

  return (
    <PromptsClient 
      initialPrompts={initialPrompts}
      initialTags={allTags}
    />
  );
}