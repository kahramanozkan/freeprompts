import { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import ListDetailClient from "./list-detail-client";

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

// Fetch list from Supabase on the server side
async function getListById(id: string) {
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (!id || !uuidRegex.test(id)) return null;

  const { data, error } = await supabaseServer
    .from('lists')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

// Fetch exact list prompts from Supabase
async function getListPrompts(promptIds: string[]) {
  if (!promptIds || !promptIds.length) return [];

  const { data, error } = await supabaseServer
    .from('prompts')
    .select(`
      *,
      user:users(id, name, avatar_url)
    `)
    .in('id', promptIds)
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map((prompt: any) => ({
    ...prompt,
    userName: prompt.user?.name || "Anonymous"
  }));
}

// Dynamic metadata for SEO & Social Cards
export async function generateMetadata({ params }: { params: Promise<{ id: string; slug: string }> }): Promise<Metadata> {
  try {
    const { id, slug } = await params;
    const list = await getListById(id);

    if (!list) {
      return {
        title: "List Not Found",
        description: "The curated AI prompt collection you are looking for doesn't exist.",
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://freeprompts.store';
    const listUrl = `${baseUrl}/list/${list.id}/${slug}`;
    const promptCount = list.prompt_ids?.length || 0;
    
    // Dynamic List OG Image URL
    const ogImageUrl = `${baseUrl}/api/og?type=list&title=${encodeURIComponent(list.name)}&count=${promptCount}`;

    return {
      title: `${list.name} - Curated AI Prompt Collection`,
      description: list.description || `Explore this curated collection containing ${promptCount} ready-to-use free AI prompt templates on FreePrompts.`,
      alternates: {
        canonical: listUrl,
      },
      openGraph: {
        title: `${list.name} - Curated AI Prompt Collection`,
        description: list.description || `Explore this curated collection containing ${promptCount} ready-to-use free AI prompt templates on FreePrompts.`,
        url: listUrl,
        type: 'website',
        images: [{
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: list.name,
        }],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${list.name} - Curated AI Prompt Collection`,
        description: list.description || `Explore this curated collection containing ${promptCount} ready-to-use free AI prompt templates on FreePrompts.`,
        images: [ogImageUrl],
      },
    };
  } catch (error) {
    console.error('Error generating list metadata:', error);
    return {
      title: "AI Prompt List - Error Loading",
      description: "An error occurred while loading the list metadata.",
    };
  }
}

export default async function ListDetailPage({ params }: { params: Promise<{ id: string; slug: string }> }) {
  const { id, slug } = await params;
  const list = await getListById(id);

  if (!list) {
    notFound();
  }

  const prompts = await getListPrompts(list.prompt_ids || []);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://freeprompts.store';

  // Dynamic FAQ Page questions for lists (GEO Optimization)
  const faqQuestions = [
    {
      question: `What is the "${list.name}" prompt list?`,
      answer: `The "${list.name}" list is a hand-picked, curated collection of ${prompts.length} high-quality, copy-paste AI prompt templates available on FreePrompts.store.`
    },
    {
      question: `Are the prompts in this collection free to use?`,
      answer: "Yes, all prompt templates in this curated list are 100% free to copy, modify, and use in your personal or commercial AI projects (ChatGPT, Claude, Midjourney, etc.)."
    },
    {
      question: `How do I use a prompt from this list?`,
      answer: "Simply click on any prompt card in the collection to open its detail page. Click 'Copy Prompt' to copy the template to your clipboard, fill in any placeholder fields, and paste it directly into your target AI model."
    }
  ];

  return (
    <>
      {/* JSON-LD Structured Data (Sitemaps / SEO & GEO) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": list.name,
            "description": list.description,
            "url": `${baseUrl}/list/${list.id}/${slug}`,
            "dateCreated": list.created_at,
            "mainEntity": {
              "@type": "ItemList",
              "name": `${list.name} - AI Prompts Collection`,
              "description": list.description,
              "numberOfItems": prompts.length,
              "itemListElement": prompts.slice(0, 20).map((prompt, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                  "@type": "Product",
                  "name": prompt.title,
                  "description": prompt.content?.substring(0, 160),
                  "url": `${baseUrl}/prompt/${prompt.id}/${prompt.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                  "sku": prompt.id,
                  "brand": {
                    "@type": "Brand",
                    "name": "FreePrompts"
                  },
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD",
                    "availability": "https://schema.org/InStock"
                  }
                }
              }))
            },
            "isPartOf": {
              "@type": "Collection",
              "name": "FreePrompts AI Prompt Lists",
              "url": `${baseUrl}/lists`
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": `${baseUrl}`
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Lists",
                  "item": `${baseUrl}/lists`
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": list.name,
                  "item": `${baseUrl}/list/${list.id}/${slug}`
                }
              ]
            }
          })
        }}
      />

      {/* FAQPage Schema (GEO Search Engine Optimization) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqQuestions.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          })
        }}
      />

      <ListDetailClient initialList={list} initialPrompts={prompts} />
    </>
  );
}
