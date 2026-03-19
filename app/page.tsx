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

// Revalidate every 60 seconds
export const revalidate = 60;

// Server-side data fetching (using server-safe Supabase client)
const getCachedHomepageStats = async () => {
  try {
    return await getHomepageStatsServer();
  } catch (err) {
    console.error('Error fetching homepage stats:', err);
    return {
      totalPrompts: 0,
      totalLists: 0,
      totalViews: 0,
      totalLikes: 0
    };
  }
};

const getCachedLatestPrompts = async () => {
  try {
    return await getLatestPromptsServer(8);
  } catch (err) {
    console.error('Error fetching latest prompts:', err);
    return null;
  }
};

const getCachedLatestLists = async () => {
  try {
    return await getLatestListsServer(3);
  } catch (err) {
    console.error('Error fetching latest lists:', err);
    return null;
  }
};

const getCachedVariantCounts = async (promptIds: string[]) => {
  try {
    return await getVariantCountsServer(promptIds);
  } catch (err) {
    console.warn('Error fetching variant counts:', err);
    const counts: Record<string, number> = {};
    promptIds.forEach(id => counts[id] = 0);
    return counts;
  }
};

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
  let latestPrompts: Prompt[] = [];
  let latestLists: List[] = [];
  let error = null;
  let userLikesMap: Record<string, boolean> = {};
  let stats = {
    totalPrompts: 0,
    totalLists: 0,
    totalViews: 0,
    totalLikes: 0
  };

  try {
    // Fetch data independently from auth — auth failures must NOT block content
    const [promptsData, listsData, statsData] = await Promise.all([
      getCachedLatestPrompts(),
      getCachedLatestLists(),
      getCachedHomepageStats()
    ]);

    stats = statsData;

    if (promptsData && promptsData.length > 0) {
      const promptIds = promptsData.map((p: any) => p.id);
      const variantCounts = await getCachedVariantCounts(promptIds);

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
  } catch (err) {
    console.error('Error loading homepage data:', err);
    error = 'Failed to load content';
  }

  return (
    <div>
      {/* Hero Section */}
      <Hero />

      {/* Stats Section */}
      <section className="py-6 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Total Prompts */}
            <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="text-3xl md:text-4xl font-bold text-black mb-2">
                {stats.totalPrompts.toLocaleString()}+
              </div>
              <div className="text-sm text-gray-600">
                ready to use free prompts
              </div>
            </div>
            {/* Total Lists */}
            <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="text-3xl md:text-4xl font-bold text-black mb-2">
                {stats.totalLists.toLocaleString()}+
              </div>
              <div className="text-sm text-gray-600">
                groupped prompt lists
              </div>
            </div>
            {/* Total Views */}
            <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="text-3xl md:text-4xl font-bold text-black mb-2">
                {stats.totalViews.toLocaleString()}+
              </div>
              <div className="text-sm text-gray-600">
                viewed prompt contents
              </div>
            </div>
            {/* Total Likes */}
            <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="text-3xl md:text-4xl font-bold text-black mb-2">
                {stats.totalLikes.toLocaleString()}+
              </div>
              <div className="text-sm text-gray-600">
                liked prompts
              </div>
            </div>
          </div>
        </div>
      </section>

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
              <p className="text-gray-500">{error || "No prompts available yet"}</p>
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
                    className="w-full bg-cover bg-center relative"
                    style={{ aspectRatio: '1/1', backgroundImage: list.image ? `url(${list.image})` : undefined }}
                  >
                    {!list.image && (
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
                    <div className="text-sm text-gray-500">
                      {new Date(list.created_at).toLocaleDateString('en-US')}
                    </div>
                  </div>
                </Link>
              ))}
            </HomeSlider>
          ) : (
            <div className="col-span-full text-center py-20">
              <p className="text-gray-500">{error || "No lists available yet"}</p>
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

      {/* Subscribe Section */}
      <section className="py-16 bg-gray-50">
        <Subscribe />
      </section>
    </div>
  );
}
