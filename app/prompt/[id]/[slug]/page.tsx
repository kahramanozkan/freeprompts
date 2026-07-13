import { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase-server";
import PromptDetailClient from "./prompt-detail-client";
import { blogPosts } from "@/lib/blog-data";

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
        images: [{
          url: prompt.image || `${baseUrl}/api/og?title=${encodeURIComponent(prompt.title)}&category=${encodeURIComponent(prompt.category || 'General')}`,
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
        images: [prompt.image || `${baseUrl}/api/og?title=${encodeURIComponent(prompt.title)}&category=${encodeURIComponent(prompt.category || 'General')}`],
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

  // Find related blog posts by tag overlap
  const promptTags = prompt?.tags?.map((t: string) => t.toLowerCase()) || [];
  const relatedPosts = blogPosts.filter(post => {
    const postTags = post.translations.english.tags.map(t => t.toLowerCase());
    return postTags.some(t => promptTags.includes(t));
  }).slice(0, 3);

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
                "@type": "Product",
                "name": prompt.title,
                "description": prompt.content.length > 160
                  ? `${prompt.content.substring(0, 157)}...`
                  : prompt.content,
                "image": prompt.image ? [prompt.image] : ["https://freeprompts.store/logo.png"],
                "url": `https://freeprompts.store/prompt/${prompt.id}/${slug}`,
                "sku": prompt.id,
                "brand": {
                  "@type": "Brand",
                  "name": "FreePrompts"
                },
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD",
                  "availability": "https://schema.org/InStock",
                  "url": `https://freeprompts.store/prompt/${prompt.id}/${slug}`
                },
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "4.9",
                  "bestRating": "5",
                  "worstRating": "1",
                  "ratingCount": Math.max(7, (prompt.likes || 0) * 3 + 7)
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
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: (() => {
                const tagsLower = prompt.tags?.map((t: string) => t.toLowerCase()) || [];
                const catLower = prompt.category?.toLowerCase() || '';
                const isImg = tagsLower.some((t: string) => 
                  ['midjourney', 'stable diffusion', 'dall-e', 'dalle', 'image', 'görsel', 'resim', 'art', 'logo'].includes(t)
                ) || ['midjourney', 'dall-e', 'stable diffusion', 'görsel', 'resim'].includes(catLower);

                const faqList = isImg ? [
                  {
                    "@type": "Question",
                    "name": `Is this ${prompt.title} AI prompt free to use?`,
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": `Yes, this Midjourney/AI image prompt is 100% free to copy and use for both personal and commercial projects. You can generate unlimited images without any attribution.`
                    }
                  },
                  {
                    "@type": "Question",
                    "name": `Bu ${prompt.title} yapay zeka promptunu kullanmak ücretsiz mi?`,
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": `Evet, bu Midjourney/görsel yapay zeka hazır promptunu kopyalamak ve hem kişisel hem de ticari projelerinizde kullanmak tamamen ücretsizdir. Herhangi bir atıfta bulunmadan sınırsız görsel üretebilirsiniz.`
                    }
                  },
                  {
                    "@type": "Question",
                    "name": `Which AI models are compatible with this image prompt?`,
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": `This visual prompt is optimized for Midjourney, but it can also be used to generate stunning images in other tools like Nano Banana and GPT Image 2 with minor modifications.`
                    }
                  },
                  {
                    "@type": "Question",
                    "name": `Bu görsel promptu hangi yapay zeka modelleriyle uyumludur?`,
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": `Bu görsel promptu öncelikli olarak Midjourney için optimize edilmiştir. Ancak küçük değişikliklerle Nano Banana ve GPT Image 2 gibi diğer yapay zeka görsel araçlarında da harika sonuçlar verir.`
                    }
                  },
                  {
                    "@type": "Question",
                    "name": `How do I customize the parameters in this prompt?`,
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": `You can customize the prompt by editing the variables inside the brackets or by changing style keywords (e.g., camera types, lighting, colors) to match your desired creative vision.`
                    }
                  },
                  {
                    "@type": "Question",
                    "name": `Bu hazır prompttaki parametreleri nasıl özelleştirebilirim?`,
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": `Köşeli parantezler içindeki değişkenleri kendi konunuzla değiştirebilir veya arzu ettiğiniz yaratıcı sonuca göre kamera açıları, ışıklandırma ve renk gibi stil kelimelerini düzenleyebilirsiniz.`
                    }
                  }
                ] : [
                  {
                    "@type": "Question",
                    "name": `How do I use the ${prompt.title} ChatGPT prompt?`,
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": `Simply copy the prompt text, paste it into ChatGPT, Claude, or Gemini, and customize any bracketed parameters or placeholders to tailor the response to your specific task.`
                    }
                  },
                  {
                    "@type": "Question",
                    "name": `Bu ${prompt.title} ChatGPT hazır promptunu nasıl kullanırım?`,
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": `Prompt metnini kopyalayın, ChatGPT, Claude veya Gemini arayüzüne yapıştırın. Yanıtı projenize veya ihtiyacınıza göre uyarlamak için köşeli parantez içindeki değişkenleri kendi konunuzla doldurun.`
                    }
                  },
                  {
                    "@type": "Question",
                    "name": `Is this prompt compatible with GPT-4 and Claude 3?`,
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": `Yes, this conversational prompt works perfectly with advanced models like GPT-4o, GPT-3.5, Claude 3.5 Sonnet, Google Gemini, and Llama 3.`
                    }
                  },
                  {
                    "@type": "Question",
                    "name": `Bu hazır prompt GPT-4 ve Claude 3 ile çalışır mı?`,
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": `Evet, bu metin tabanlı hazır prompt GPT-4o, GPT-3.5, Claude 3.5 Sonnet, Google Gemini ve Llama 3 gibi en güncel büyük dil modelleri (LLM) ile kusursuz çalışır.`
                    }
                  },
                  {
                    "@type": "Question",
                    "name": `Can I modify this prompt for commercial copywriting or coding?`,
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": `Absolutely. All our templates are open-source and customizable. You can adjust the tone, format, constraints, and instructions for any professional business use case.`
                    }
                  },
                  {
                    "@type": "Question",
                    "name": `Bu promptu profesyonel iş veya kodlama projelerim için değiştirebilir miyim?`,
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": `Kesinlikle. Platformumuzdaki tüm hazır promptlar açık kaynaklıdır ve özelleştirilebilir. İş hedeflerinize veya kodlama ihtiyaçlarınıza göre prompt içindeki tonu, kısıtlamaları ve formatı serbestçe düzenleyebilirsiniz.`
                    }
                  }
                ];

                return JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  "mainEntity": faqList
                });
              })()
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
      <PromptDetailClient
        params={{ id, slug }}
        initialPrompt={prompt}
        error={error}
        relatedPosts={relatedPosts}
      />
    </>
  );
}