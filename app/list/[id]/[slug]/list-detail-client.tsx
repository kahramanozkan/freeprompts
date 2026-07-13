"use client";

import { useState, useCallback, useEffect } from "react";
import PromptCard from "@/components/ui/PromptCard";
import AdSpace from "@/components/ui/AdSpace";
import Link from "next/link";
import type { Database } from "@/lib/database.types";

type List = Database['public']['Tables']['lists']['Row'];
type Prompt = Database['public']['Tables']['prompts']['Row'] & {
  userName?: string;
};

interface ListDetailClientProps {
  initialList: List;
  initialPrompts: Prompt[];
}

export default function ListDetailClient({ initialList, initialPrompts }: ListDetailClientProps) {
  const [list] = useState<List>(initialList);
  const [listPrompts] = useState<Prompt[]>(initialPrompts);
  const [displayedPrompts, setDisplayedPrompts] = useState<Prompt[]>(initialPrompts.slice(0, 6));
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

  // Infinite scroll handler
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

  // Separate useEffect for scroll listener
  useEffect(() => {
    if (listPrompts.length > 0) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll, listPrompts.length]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b border-gray-200 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-black">
              Home
            </Link>
            <span>/</span>
            <Link href="/lists" className="hover:text-black">
              Lists
            </Link>
            <span>/</span>
            <span className="text-black">{list.name}</span>
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
      {process.env.NEXT_PUBLIC_DISABLE_ADS !== "true" && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-100 rounded-lg p-6 text-center">
              <AdSpace />
            </div>
          </div>
        </section>
      )}

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
                  {rowIndex < Math.ceil(displayedPrompts.length / PROMPTS_PER_ROW) - 1 && process.env.NEXT_PUBLIC_DISABLE_ADS !== "true" && (
                    <div className="mt-8 bg-gray-100 rounded-lg p-6 text-center">
                      <AdSpace />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {displayedPrompts.length === 0 && (
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
                <div className="text-gray-500 text-sm">
                  Scroll down to load more prompts
                </div>
              ) : (
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
