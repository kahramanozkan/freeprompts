import { Metadata } from 'next';
import { supabaseServer } from "@/lib/supabase-server";
import ListsClient from "./page.client";

export const metadata: Metadata = {
  title: 'Browse Lists',
  description: 'Discover curated collections of AI prompts organized by categories and themes.',
};

export const revalidate = 60;

export default async function ListsPage() {
  const { data: initialLists, error } = await supabaseServer
    .from('lists')
    .select('id, name, slug, description, image, prompt_ids, likes, views, created_at, user_id, updated_at')
    .order('created_at', { ascending: false })
    .limit(18); // Fetch enough for the first few rows

  if (error) {
    throw new Error(`Supabase error fetching lists: ${error.message}`);
  }

  return <ListsClient initialLists={initialLists || []} />;
}