import { Metadata } from "next";
import { promptsApi, promptsWithUserApi } from "@/lib/supabase-queries";
import PromptDetailClient from "./prompt-detail-client";

// Revalidate every 60 seconds for ISR
export const revalidate = 60;

// Dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string; slug: string }> }): Promise<Metadata> {
  try {
    const { id, slug } = await params;
    const prompt = await promptsApi.getById(id);

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
  // Server component - fetch data on server
  let prompt = null;
  let error = null;
  const { id, slug } = await params;

  try {
    // Check if we have valid Supabase environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase environment variables not configured');
      error = 'Database connection not available';
    } else {
      prompt = await promptsWithUserApi.getByIdWithUser(id);

      if (!prompt) {
        error = 'Prompt not found';
      }
    }
  } catch (err: any) {
    console.error('Error loading prompt:', {
      error: err,
      message: err?.message,
      stack: err?.stack,
      name: err?.name,
      code: err?.code
    });
    // Don't set error to prevent page crash, let client component handle it
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