import { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { promptsWithUserApi, combinedApi, promptVariantsApi } from "@/lib/supabase-queries";
import type { Database } from "@/lib/database.types";
import PromptsClient from './page.client';

type Prompt = Database['public']['Tables']['prompts']['Row'] & {
  userName?: string;
  list?: string;
  variantCount?: number;
};

// Cached data fetching functions
const getCachedInitialPrompts = unstable_cache(
  async () => {
    try {
      const data = await promptsWithUserApi.getPaginatedWithUsers(1, 12);
      if (data && data.length > 0) {
        // Get variant counts for all prompts in batch
        const promptIds = data.map(p => p.id);
        let variantCounts: Record<string, number> = {};
        try {
          variantCounts = await promptVariantsApi.countByPromptIds(promptIds);
        } catch (err) {
          console.warn('Batch variant count failed, falling back to 0', err);
          promptIds.forEach(id => variantCounts[id] = 0);
        }

        // Transform data to match our interface
        const transformedPrompts: Prompt[] = data.map((prompt: any) => ({
          ...prompt,
          userName: prompt.user?.name || "Anonymous",
          list: prompt.tags?.[0] || "General",
          variantCount: variantCounts[prompt.id] || 0
        }));
        return transformedPrompts;
      }
      return [];
    } catch (error) {
      console.error('Error fetching cached initial prompts:', error);
      return [];
    }
  },
  ['initial-prompts'],
  { revalidate: 60 }
);

const getCachedUniqueTags = unstable_cache(
  async () => {
    try {
      return await combinedApi.getUniqueTags();
    } catch (error) {
      console.error('Error fetching cached unique tags:', error);
      return [];
    }
  },
  ['unique-tags'],
  { revalidate: 300 } // 5 minutes
);

export const metadata: Metadata = {
  title: 'Browse Prompts',
  description: 'Discover and explore AI prompts for various purposes including ChatGPT, Claude, and other AI models.',
};

export const revalidate = 60;

export default async function PromptsPage() {
  // Fetch initial data in parallel
  const [initialPrompts, allTags] = await Promise.all([
    getCachedInitialPrompts(),
    getCachedUniqueTags()
  ]);

  console.error('Prompts page server data:', {
    promptsCount: initialPrompts.length,
    tagsCount: allTags.length
  });

  return (
    <PromptsClient 
      initialPrompts={initialPrompts}
      initialTags={allTags}
    />
  );
}