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
    <>
      {prompt && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "CreativeWork",
                "name": prompt.title,
                "description": prompt.content.length > 160
                  ? `${prompt.content.substring(0, 157)}...`
                  : prompt.content,
                "url": `https://freeprompts.store/prompt/${prompt.id}/${slug}`,
                "author": {
                  "@type": "Person",
                  "name": "Anonymous",
                  "@id": "https://freeprompts.store/users/anonymous"
                },
                "dateCreated": prompt.created_at,
                "dateModified": prompt.updated_at,
                "keywords": prompt.tags?.join(", "),
                "image": prompt.image ? [prompt.image] : [],
                "genre": "AI Prompt",
                "about": [
                  { "@type": "Thing", "name": "Artificial Intelligence" },
                  { "@type": "Thing", "name": "Prompt Engineering" }
                ],
                "interactionStatistic": [
                  {
                    "@type": "InteractionCounter",
                    "interactionType": "https://schema.org/LikeAction",
                    "userInteractionCount": prompt.likes || 0
                  },
                  {
                    "@type": "InteractionCounter",
                    "interactionType": "https://schema.org/ViewAction",
                    "userInteractionCount": prompt.views || 0
                  }
                ],
                "isPartOf": {
                  "@type": "Collection",
                  "name": "FreePrompts AI Prompts",
                  "url": "https://freeprompts.store"
                },
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": `https://freeprompts.store/prompt/${prompt.id}/${slug}`
                }
              })
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
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
                  },
                  {
                    "@type": "ListItem",
                    "position": 3,
                    "name": prompt.title,
                    "item": `https://freeprompts.store/prompt/${prompt.id}/${slug}`
                  }
                ]
              })
            }}
          />
        </>
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "FreePrompts",
            "url": "https://freeprompts.store",
            "logo": {
              "@type": "ImageObject",
              "url": "https://freeprompts.store/logo.png"
            },
            "sameAs": [
              "https://twitter.com/freeprompts",
              "https://github.com/freeprompts"
            ],
            "description": "Free AI Prompt Marketplace - Discover, share, and use high-quality free AI prompts"
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "FreePrompts",
            "url": "https://freeprompts.store",
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://freeprompts.store/prompts?q={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
      <PromptDetailClient
        params={{ id, slug }}
        initialPrompt={prompt}
        error={error}
      />
    </>
  );
}