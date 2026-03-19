import { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase-server";
import PromptDetailClient from "./prompt-detail-client";

// Revalidate every 60 seconds for ISR
export const revalidate = 60;

// Server-safe prompt fetching
async function getPromptById(id: string) {
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (!id || !uuidRegex.test(id)) return null;

  const { data, error } = await supabaseServer
    .from('prompts')
    .select(`
      *,
      user:users(id, name, avatar_url, username)
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

// Dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string; slug: string }> }): Promise<Metadata> {
  try {
    const { id, slug } = await params;
    const prompt = await getPromptById(id);

    if (!prompt) {
      return {
        title: "Prompt Not Found",
        description: "The prompt you're looking for doesn't exist.",
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://freeprompts.store';
    const promptUrl = `${baseUrl}/prompt/${prompt.id}/${slug}`;

    return {
      title: `${prompt.title} - AI Prompt`,
      description: prompt.content.length > 160
        ? `${prompt.content.substring(0, 157)}...`
        : prompt.content,
      keywords: prompt.tags,
      alternates: {
        canonical: promptUrl,
      },
      openGraph: {
        title: `${prompt.title} - AI Prompt`,
        description: prompt.content.length > 160
          ? `${prompt.content.substring(0, 157)}...`
          : prompt.content,
        url: promptUrl,
        type: 'article',
        images: prompt.image ? [{
          url: prompt.image,
          width: 1200,
          height: 630,
          alt: prompt.title,
        }] : [{
          url: `${baseUrl}/og-default.jpg`,
          width: 1200,
          height: 630,
          alt: prompt.title,
        }],
        authors: ['Anonymous'],
        tags: prompt.tags,
        publishedTime: prompt.created_at,
        modifiedTime: prompt.created_at,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${prompt.title} - AI Prompt`,
        description: prompt.content.length > 160
          ? `${prompt.content.substring(0, 157)}...`
          : prompt.content,
        images: prompt.image ? [prompt.image] : [`${baseUrl}/og-default.jpg`],
      },
      other: {
        'prompt-id': prompt.id,
        'prompt-tags': prompt.tags.join(', '),
        'prompt-views': prompt.views?.toString() || '0',
        'prompt-likes': prompt.likes?.toString() || '0',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: "Prompt - Error Loading",
      description: "An error occurred while loading the prompt metadata.",
    };
  }
}

export default async function PromptDetailPage({ params }: { params: Promise<{ id: string; slug: string }> }) {
  let prompt = null;
  let error = null;
  const { id, slug } = await params;

  try {
    prompt = await getPromptById(id);
    if (!prompt) {
      error = 'Prompt not found';
    }
  } catch (err: any) {
    console.error('Error loading prompt:', err?.message);
    error = null; // Let client component try to load the data
  }

  // Pass data to client component
  return (
    <PromptDetailClient
      params={{ id, slug }}
      initialPrompt={prompt}
      error={error}
    />
  );
}