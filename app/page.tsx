import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Link from "next/link";
import {
  getLatestPromptsServer,
  getLatestListsServer,
  getHomepageStatsServer,
  getVariantCountsServer,
  getUserLikesServer
} from "@/lib/supabase-server-queries";
import { supabaseServer } from "@/lib/supabase-server";
import type { Database } from "@/lib/database.types";

const Hero = dynamic(() => import('@/components/ui/Hero'), { ssr: true });
const PromptCard = dynamic(() => import('@/components/ui/PromptCard'), { ssr: true });
const Subscribe = dynamic(() => import('@/components/ui/Subscribe'), { ssr: true });
const HomeSlider = dynamic(() => import('@/components/ui/HomeSlider'), { ssr: true });
const LiveStats = dynamic(() => import('@/components/ui/LiveStats'), { ssr: true });
import AutoRefresh from '@/components/ui/AutoRefresh';
import ImageWithLoader from "@/components/ui/ImageWithLoader";
import HomeFAQ from "@/components/ui/HomeFAQ";

// Revalidate every 60 seconds
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Home',
  description: 'Explore thousands of free AI prompts for ChatGPT, Claude, Gemini, and more. Find the perfect prompt for your needs.',
  alternates: {
    canonical: '/',
  },
};

type Prompt = Database['public']['Tables']['prompts']['Row'] & {
  userName?: string;
  list?: string;
};

type List = Database['public']['Tables']['lists']['Row'];

export default async function Home() {
  // We do not catch data fetching errors here.
  // If the database is slow or down, this will throw an error,
  // causing Next.js to abort the revalidation and serve the previous successful cache!
  // This prevents cache poisoning (where Next.js caches an empty page).

  const [promptsData, listsData, statsData] = await Promise.all([
    getLatestPromptsServer(8),
    getLatestListsServer(3),
    getHomepageStatsServer()
  ]);

  const stats = statsData;
  let latestPrompts: Prompt[] = [];
  let latestLists: List[] = [];
  let userLikesMap: Record<string, boolean> = {};

  if (promptsData && promptsData.length > 0) {
    const promptIds = promptsData.map((p: any) => p.id);
    const variantCounts = await getVariantCountsServer(promptIds);

    latestPrompts = (promptsData as any[]).map(prompt => ({
      ...prompt,
      userName: "User",
      list: prompt.tags?.[0] || "General",
      variantCount: variantCounts[prompt.id] || 0
    })) as Prompt[];
  }

  if (listsData) {
    latestLists = listsData as unknown as List[];
  }

  // Auth is separate — failures here don't affect content display
  try {
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (user && latestPrompts.length > 0) {
      const promptIds = latestPrompts.map(p => p.id);
      userLikesMap = await getUserLikesServer(user.id, promptIds);
    }
  } catch {
    // Auth not available on server — this is expected, silently continue
  }

  return (
    <div>
      {/* Auto refresh data on page every 5 minutes (300000ms) without caching */}
      <AutoRefresh intervalMs={300000} />

      {/* Hero Section */}
      <Hero />

      {/* Stats Section */}
      <LiveStats initialStats={stats} />

      {/* Latest Prompts Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-black">
              Latest Prompts
            </h2>
            <Link
              href="/prompts"
              className="inline-block px-6 py-2 bg-yellow-100 text-gray-800 text-sm font-medium rounded-md hover:bg-yellow-200 transition-colors"
            >
              All Prompts →
            </Link>
          </div>

          {/* Prompts Slider - Mobile 1 column, Tablet 2 columns, Desktop 4 columns */}
          {latestPrompts.length > 0 ? (
            <HomeSlider
              slidesPerViewMobile={1}
              slidesPerViewTablet={2}
              slidesPerViewDesktop={4}
              spaceBetween={16}
              className="pb-12"
            >
              {latestPrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt as any}
                  initialLiked={userLikesMap[prompt.id] || false}
                  variantCount={(prompt as any).variantCount || 0}
                />
              ))}
            </HomeSlider>
          ) : (
            <div className="col-span-full text-center py-20">
              <p className="text-gray-500">No prompts available yet</p>
              <Link
                href="/add-prompt"
                className="inline-block mt-4 px-4 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800"
              >
                Add First Prompt
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Latest Lists Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-black">
              Latest Lists
            </h2>
            <Link
              href="/lists"
              className="inline-block px-6 py-2 bg-yellow-100 text-gray-800 text-sm font-medium rounded-md hover:bg-yellow-200 transition-colors"
            >
              All Lists →
            </Link>
          </div>

          {/* Lists Slider - Mobile 1 column, Tablet 2 columns, Desktop 3 columns */}
          {latestLists.length > 0 ? (
            <HomeSlider
              slidesPerViewMobile={1}
              slidesPerViewTablet={2}
              slidesPerViewDesktop={3}
              spaceBetween={24}
              className="pb-12"
              gridCols={3}
            >
              {latestLists.map((list) => (
                <Link
                  key={list.id}
                  href={`/list/${list.id}/${list.slug}`}
                  className="group bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors block h-full"
                >
                  {/* Image - Square format */}
                  <div
                    className="w-full relative"
                    style={{ aspectRatio: '1/1' }}
                  >
                    {list.image ? (
                      <ImageWithLoader
                        src={list.image}
                        alt={list.name}
                        className="absolute inset-0 w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                    )}

                    {/* Prompt count badge */}
                    <div className="absolute top-3 right-3 px-3 py-1 bg-black/70 text-white text-sm rounded-full">
                      {list.prompt_ids?.length || 0} prompts
                    </div>
                  </div>

                  {/* Content - Expanded */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-black mb-4 line-clamp-2 group-hover:text-gray-700">
                      {list.name}
                    </h3>
                    <div className="text-sm text-gray-600">
                      {new Date(list.created_at).toLocaleDateString('en-US')}
                    </div>
                  </div>
                </Link>
              ))}
            </HomeSlider>
          ) : (
            <div className="col-span-full text-center py-20">
              <p className="text-gray-500">No lists available yet</p>
              <Link
                href="/add-list"
                className="inline-block mt-4 px-4 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800"
              >
                Add First List
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Homepage FAQ Section */}
      <HomeFAQ />

      {/* Subscribe Section */}
      <section className="py-16 bg-gray-50">
        <Subscribe />
      </section>

      {/* Homepage FAQ Schema for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is a copy-paste AI prompt?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A copy-paste AI prompt is a pre-written text instruction that you can copy from freeprompts.store and paste directly into tools like ChatGPT, Google Gemini, or Claude to get high-quality outputs instantly."
                }
              },
              {
                "@type": "Question",
                "name": "Yapay zeka hazır promptları nedir?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yapay zeka hazır promptları, ChatGPT, Google Gemini veya Claude gibi araçlara doğrudan yapıştırabileceğiniz metin şablonlarıdır. Metni kopyalayıp değişkenleri düzenleyerek anında profesyonel çıktılar alabilirsiniz."
                }
              },
              {
                "@type": "Question",
                "name": "Are these prompts compatible with newer tools like Nano Banana or GPT Image 2?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, all our templates are fully compatible with and optimized for the latest AI tools and models, including Midjourney, Nano Banana, and GPT Image 2."
                }
              },
              {
                "@type": "Question",
                "name": "Bu promptlar Nano Banana veya GPT Image 2 gibi araçlarla uyumlu mudur?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Evet, sitemizdeki tüm hazır promptlar ve şablonlar Midjourney, Nano Banana ve GPT Image 2 gibi en güncel yapay zeka sistemlerinde test edilmiş ve uyumlu hale getirilmiştir."
                }
              },
              {
                "@type": "Question",
                "name": "How do I use Midjourney templates?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Simply copy the prompt content, paste it into Discord or your visual AI generator interface, customize the placeholder values (in brackets), and execute."
                }
              },
              {
                "@type": "Question",
                "name": "Midjourney şablonlarını nasıl kullanırım?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Prompt içeriğini kopyalayın, Discord'a veya kullandığınız görsel yapay zeka arayüzüne yapıştırın. Köşeli parantezler [ ] içindeki alanları kendi konunuzla doldurun ve çalıştırın."
                }
              }
            ]
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
    </div>
  );
}
