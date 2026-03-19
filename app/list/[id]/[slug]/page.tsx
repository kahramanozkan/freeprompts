"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import PromptCard from "@/components/ui/PromptCard";
import AdSpace from "@/components/ui/AdSpace";
import Script from "next/script";
import Link from "next/link";
import { listsApi, promptsWithUserApi } from "@/lib/supabase-queries";
import type { Database } from "@/lib/database.types";
import { createSlug } from "@/lib/utils";

type List = Database['public']['Tables']['lists']['Row'];
type Prompt = Database['public']['Tables']['prompts']['Row'] & {
  userName?: string;
};

export default function ListDetailPage() {
  const params = useParams();
  const [list, setList] = useState<List | null>(null);
  const [listPrompts, setListPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayedPrompts, setDisplayedPrompts] = useState<Prompt[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const PROMPTS_PER_LOAD = 6;
  const PROMPTS_PER_ROW = 3;

  // Load more prompts function
  const loadMorePrompts = useCallback(async () => {
    if (loadingMore) return;
    
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    const startIndex = nextPage * PROMPTS_PER_LOAD;
    const endIndex = startIndex + PROMPTS_PER_LOAD;
    const newPrompts = listPrompts.slice(startIndex, endIndex);
    
    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (newPrompts.length > 0) {
      setDisplayedPrompts(prev => [...prev, ...newPrompts]);
      setCurrentPage(nextPage);
    } else {
      // No more prompts to load, ensure displayedPrompts equals listPrompts
      setDisplayedPrompts(prev => {
        if (prev.length < listPrompts.length) {
          return listPrompts;
        }
        return prev;
      });
    }
    setLoadingMore(false);
  }, [currentPage, listPrompts, loadingMore]);

  // Infinite scroll handler - same as /add-list
  const handleScroll = useCallback(() => {
    if (loadingMore) return;
    if (displayedPrompts.length === listPrompts.length) return; // No more items to load
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    const clientHeight = document.documentElement.clientHeight || window.innerHeight;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    if (distanceFromBottom < 300 && !loadingMore) {
      loadMorePrompts();
    }
  }, [loadMorePrompts, displayedPrompts.length, listPrompts.length, loadingMore]);

  useEffect(() => {
    const loadListData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get list by slug
        const listData = await listsApi.getBySlug(params.slug as string);
        setList(listData);

        // Get prompts in this list with user data
        const promptsData = await promptsWithUserApi.getAllWithUsers();
        
        // Filter prompts that belong to this list
        const listPromptIds = listData.prompt_ids || [];
        const filteredPrompts = promptsData.filter(prompt =>
          listPromptIds.includes(prompt.id)
        );
        
        // Transform to match interface
        const transformedPrompts: Prompt[] = filteredPrompts.map((prompt: any) => ({
          ...prompt,
          userName: prompt.user?.name || "Anonymous"
        }));

        setListPrompts(transformedPrompts);
        
        // Initialize with first batch
        setDisplayedPrompts(transformedPrompts.slice(0, PROMPTS_PER_LOAD));
        setCurrentPage(0);
      } catch (err) {
        console.error('Error loading list:', err);
        setError('Failed to load list. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      loadListData();
    }
  }, [params.slug]);

  // Separate useEffect for scroll listener
  useEffect(() => {
    if (listPrompts.length > 0) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll, listPrompts.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header Skeleton */}
        <section className="border-b border-gray-200 py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-96 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-80 animate-pulse"></div>
          </div>
        </section>

        {/* Prompts Grid Skeleton */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-[4/3] rounded-lg mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
  
        {/* Google Structured Data */}
        {list && listPrompts.length > 0 && (
          <Script
            id="list-structured-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "CollectionPage",
                "name": list.name,
                "description": list.description,
                "url": `https://freeprompts.store/list/${list.id}/${list.slug}`,
                "author": {
                  "@type": "Person",
                  "name": "List Creator"
                },
                "dateCreated": list.created_at,
                "mainEntity": {
                  "@type": "ItemList",
                  "name": `${list.name} - AI Prompts Collection`,
                  "description": list.description,
                  "numberOfItems": listPrompts.length,
                  "itemListElement": listPrompts.slice(0, 20).map((prompt, index) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "item": {
                      "@type": "CreativeWork",
                      "name": prompt.title,
                      "description": prompt.content?.substring(0, 160),
                      "url": `https://freeprompts.store/prompt/${prompt.id}/${prompt.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                      "creator": {
                        "@type": "Person",
                        "name": prompt.userName || "Anonymous"
                      },
                      "dateCreated": prompt.created_at,
                      "keywords": prompt.tags?.join(", "),
                      "interactionStatistic": {
                        "@type": "InteractionCounter",
                        "interactionType": "https://schema.org/LikeAction",
                        "userInteractionCount": prompt.likes || 0
                      }
                    }
                  }))
                },
                "isPartOf": {
                  "@type": "Collection",
                  "name": "FreePrompts AI Prompt Lists",
                  "url": "https://freeprompts.store/lists"
                },
                "breadcrumb": {
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
                      "name": "Lists",
                      "item": "https://freeprompts.store/lists"
                    },
                    {
                      "@type": "ListItem",
                      "position": 3,
                      "name": list.name,
                      "item": `https://freeprompts.store/list/${list.id}/${list.slug}`
                    }
                  ]
                }
              })
            }}
          />
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-black mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/"
            className="px-4 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-black mb-4">List Not Found</h1>
          <p className="text-gray-600 mb-4">The list you're looking for doesn't exist.</p>
          <Link
            href="/"
            className="px-4 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b border-gray-200 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Link href="/" className="hover:text-black">
              Home
            </Link>
            <span>/</span>
            <span className="text-black">Lists</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold text-black mb-4">
            {list.name}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            {list.description}
          </p>

          <div className="mt-6 flex items-center gap-4 text-sm text-gray-500">
            <span>{listPrompts.length} prompts</span>
            <span>•</span>
            <span>
              Created {new Date(list.created_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </section>

      {/* Ad Space below Header */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-100 rounded-lg p-6 text-center">
            <AdSpace />
          </div>
        </div>
      </section>

      {/* Prompts Grid with Ads */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Group prompts into rows of 3 */}
            {Array.from({ length: Math.ceil(displayedPrompts.length / PROMPTS_PER_ROW) }, (_, rowIndex) => {
              const startIndex = rowIndex * PROMPTS_PER_ROW;
              const endIndex = startIndex + PROMPTS_PER_ROW;
              const rowPrompts = displayedPrompts.slice(startIndex, endIndex);
              
              return (
                <div key={rowIndex}>
                  {/* Grid Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rowPrompts.map((prompt) => (
                      <PromptCard
                        key={prompt.id}
                        prompt={{
                          ...prompt,
                          list: list.name
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Ad after every row except the last one */}
                  {rowIndex < Math.ceil(displayedPrompts.length / PROMPTS_PER_ROW) - 1 && (
                    <div className="mt-8 bg-gray-100 rounded-lg p-6 text-center">
                      <AdSpace />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {displayedPrompts.length === 0 && !loading && (
            <div className="text-center py-20">
              <p className="text-gray-500">No prompts in this list yet</p>
            </div>
          )}

          {/* Loading More Indicator */}
          {displayedPrompts.length > 0 && (
            <div className="text-center py-8">
              {loadingMore ? (
                <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-black">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Load new prompts...
                </div>
              ) : displayedPrompts.length < listPrompts.length ? (
                // More items available but not loading yet (scroll to trigger)
                <div className="text-gray-500 text-sm">
                  Scroll down to load more prompts
                </div>
              ) : (
                // All items loaded
                <div className="text-gray-500 text-sm font-medium">
                  End of prompts.
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}