"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from 'next/dynamic';
import Script from "next/script";
import React from "react";
import { promptsWithUserApi, combinedApi, promptVariantsApi } from "@/lib/supabase-queries";
import type { Database } from "@/lib/database.types";
import MultiSelectDropdown from "@/components/ui/MultiSelectDropdown";

const PromptCard = dynamic(() => import('@/components/ui/PromptCard'), { ssr: true });
const AdSpace = dynamic(() => import('@/components/ui/AdSpace'), { ssr: true });

type Prompt = Database['public']['Tables']['prompts']['Row'] & {
  userName?: string;
  list?: string;
  variantCount?: number;
};

interface PromptsPageProps {
  initialPrompts: Prompt[];
  initialTags: string[];
  initialCategories: string[];
  initialThemes: string[];
  initialGroups: string[];
}

export default function PromptsPage({ 
  initialPrompts, 
  initialTags,
  initialCategories,
  initialThemes,
  initialGroups
}: PromptsPageProps) {
  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [allTags, setAllTags] = useState<string[]>(initialTags);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const PROMPTS_PER_LOAD = 12;
  const PROMPTS_PER_ROW = 4;

  const [hasMore, setHasMore] = useState(initialPrompts.length === PROMPTS_PER_LOAD);
  const [page, setPage] = useState(2); // Next page to load (first page already loaded)

  // Screen size detection
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Filter prompts based on selected tags (Removed local filtering, we now use backend filtering)
  const filteredPrompts = prompts;

  // Load more prompts function (loads next page from API)
  const loadMorePrompts = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      // Load next page
      const filters = {
        searchQuery: searchTerm,
        categories: selectedCategories,
        themes: selectedThemes,
        groups: selectedGroups,
        tags: selectedTags,
      };
      const data = await promptsWithUserApi.getPaginatedWithUsers(page, PROMPTS_PER_LOAD, filters);
      if (data && data.length > 0) {
        // Get variant counts for this batch
        const promptIds = data.map(p => p.id);
        let variantCounts: Record<string, number> = {};
        try {
          variantCounts = await promptVariantsApi.countByPromptIds(promptIds);
        } catch (err) {
          console.warn('Batch variant count failed, falling back to individual queries', err);
          for (const prompt of data) {
            try {
              const count = await promptVariantsApi.countByPromptId(prompt.id);
              variantCounts[prompt.id] = count;
            } catch {
              variantCounts[prompt.id] = 0;
            }
          }
        }

        // Transform data
        const newPrompts: Prompt[] = data.map((prompt: any) => ({
          ...prompt,
          userName: prompt.user?.name || "Anonymous",
          list: prompt.tags?.[0] || "General",
          variantCount: variantCounts[prompt.id] || 0
        }));

        // Add to prompts state
        setPrompts(prev => [...prev, ...newPrompts]);
        // Update page and hasMore
        setPage(prev => prev + 1);
        setHasMore(data.length === PROMPTS_PER_LOAD);
      } else {
        // No more data
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more prompts:', error);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, searchTerm, selectedCategories, selectedThemes, selectedGroups, selectedTags]);

  // Infinite scroll handler - same as /add-list
  const handleScroll = useCallback(() => {
    if (loadingMore) return;
    if (!hasMore) return; // No more items to load
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    const clientHeight = document.documentElement.clientHeight || window.innerHeight;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    if (distanceFromBottom < 300 && !loadingMore) {
      loadMorePrompts();
    }
  }, [loadMorePrompts, hasMore, loadingMore]);

  // No need for displayedPrompts initialization

  // Add scroll listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchTerm(searchInput);
    // Reset and fetch first page
    setLoadingMore(true);
    try {
      const filters = {
        searchQuery: searchInput,
        categories: selectedCategories,
        themes: selectedThemes,
        groups: selectedGroups,
        tags: selectedTags,
      };
      const data = await promptsWithUserApi.getPaginatedWithUsers(1, PROMPTS_PER_LOAD, filters);
      if (data) {
        const promptIds = data.map(p => p.id);
        let variantCounts: Record<string, number> = {};
        try { variantCounts = await promptVariantsApi.countByPromptIds(promptIds); } catch (err) {}
        const newPrompts: Prompt[] = data.map((prompt: any) => ({
          ...prompt,
          userName: prompt.user?.name || "Anonymous",
          list: prompt.tags?.[0] || "General",
          variantCount: variantCounts[prompt.id] || 0
        }));
        setPrompts(newPrompts);
        setPage(2);
        setHasMore(data.length === PROMPTS_PER_LOAD);
      } else {
        setPrompts([]);
        setHasMore(false);
      }
    } catch (error) {
       console.error('Error searching prompts:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Trigger search when any filter changes
  useEffect(() => {
    // Only run this if we are not in initial load state where searchInput is empty and all filters are empty.
    if (selectedCategories.length > 0 || selectedThemes.length > 0 || selectedGroups.length > 0 || selectedTags.length > 0) {
      handleSearchSubmit();
    } else if (searchInput === "") {
      // If everything is cleared, fetch default list
      handleSearchSubmit();
    }
  }, [selectedCategories, selectedThemes, selectedGroups, selectedTags]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-black mb-8">
            Browse Prompts
          </h1>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-md mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search prompts..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>

          {/* Main Filters: Categories and Groups */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <MultiSelectDropdown
              label="Select Categories"
              options={initialCategories}
              selectedValues={selectedCategories}
              onChange={setSelectedCategories}
            />
            <MultiSelectDropdown
              label="Select Groups"
              options={initialGroups}
              selectedValues={selectedGroups}
              onChange={setSelectedGroups}
            />
          </div>

          {/* Filter Toggle Button for Advanced Filters */}
          <div className="mb-4">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {showFilter ? 'Hide Advanced Filters' : 'Advanced Search'}
            </button>
          </div>

          {/* Advanced Filters (Themes & Tags) */}
          {showFilter && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 space-y-6">
              
              {/* Themes Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Themes</h3>
                <div className="max-w-xs">
                  <MultiSelectDropdown
                    label="Select Themes"
                    options={initialThemes}
                    selectedValues={selectedThemes}
                    onChange={setSelectedThemes}
                  />
                </div>
              </div>

              {/* Tags Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-2 border border-gray-300 rounded-md bg-white">
                  {allTags.length === 0 ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-8 w-16 bg-gray-200 rounded-md animate-pulse"></div>
                    ))
                  ) : (
                    <>
                      {allTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1 text-xs rounded-full border transition-colors ${selectedTags.includes(tag)
                              ? "bg-black text-white border-black"
                              : "bg-white text-gray-700 border-gray-300 hover:border-black"
                            }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </>
                  )}
                </div>
                {selectedTags.length > 0 && (
                  <button
                    onClick={() => setSelectedTags([])}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear all tags
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Results Info and Ad Space */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Info */}
          {prompts.length > 0 && (
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {filteredPrompts.length > 0 ? 1 : 0}-{filteredPrompts.length} of {filteredPrompts.length} prompts
                {selectedTags.length > 0 && (
                  <span className="ml-2">• Filtered by: {selectedTags.join(', ')}</span>
                )}
              </p>
            </div>
          )}

          {/* Ad Space */}
          <div className="bg-gray-100 rounded-lg p-6 text-center">
            <AdSpace format="horizontal" />
          </div>
        </div>
      </section>

      {/* Prompts Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {prompts.length === 0 ? (
            // Ghost layout for loading state (if no prompts yet)
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-[2/3] rounded-lg mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Group prompts into rows and show ads between them */}
              {Array.from({ length: Math.ceil(filteredPrompts.length / PROMPTS_PER_ROW) }, (_, rowIndex) => {
                const startIndex = rowIndex * PROMPTS_PER_ROW;
                const endIndex = startIndex + PROMPTS_PER_ROW;
                const rowPrompts = filteredPrompts.slice(startIndex, endIndex);

                return (
                  <div key={rowIndex}>
                    {/* Grid Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {rowPrompts.map((prompt: Prompt) => (
                        <PromptCard key={prompt.id} prompt={prompt as any} variantCount={(prompt as any).variantCount || 0} />
                      ))}
                    </div>

                    {/* Show ad after this row if needed */}
                    {(() => {
                      // Calculate how many items have been shown so far
                      const itemsShown = (rowIndex + 1) * PROMPTS_PER_ROW;

                      let shouldShowAd = false;

                      if (isMobile) {
                        // Mobile: 1 ad per 1 item -> show after every row
                        shouldShowAd = true;
                      } else if (isTablet) {
                        // Tablet: 1 ad per 2 items -> show after every row (2 items per row)
                        shouldShowAd = true;
                      } else {
                        // Desktop: 1 ad per 4 items -> show after every 4 items
                        shouldShowAd = itemsShown % PROMPTS_PER_ROW === 0;
                      }

                      // Don't show ad after the last row
                      const isLastRow = rowIndex >= Math.ceil(filteredPrompts.length / PROMPTS_PER_ROW) - 1;

                      return shouldShowAd && !isLastRow ? (
                        <div className="mt-8 bg-gray-100 rounded-lg p-6 text-center">
                          <AdSpace format="horizontal" />
                        </div>
                      ) : null;
                    })()}
                  </div>
                );
              })}
            </div>
          )}

          {/* No Results */}
          {filteredPrompts.length === 0 && prompts.length > 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500">
                No prompts found with selected tags
              </p>
            </div>
          )}

          {/* Loading More Indicator */}
          {filteredPrompts.length > 0 && (
            <div className="text-center py-8">
              {loadingMore ? (
                <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-black">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Load new prompts...
                </div>
              ) : hasMore ? (
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

      {/* JSON-LD Schema Data moved to server component (page.tsx) */}
    </div>
  );
}