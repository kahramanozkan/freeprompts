"use client";

import { useState, useEffect, useCallback } from "react";
import Script from "next/script";
import Link from "next/link";
import AdSpace from "@/components/ui/AdSpace";
import { listsApi } from "@/lib/supabase-queries";
import type { Database } from "@/lib/database.types";

type List = Database['public']['Tables']['lists']['Row'];

export default function ListsPage() {
  const [allLists, setAllLists] = useState<List[]>([]);
  const [filteredLists, setFilteredLists] = useState<List[]>([]);
  const [displayedLists, setDisplayedLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0); // page index for infinite scroll
  const [loadingMore, setLoadingMore] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const LISTS_PER_LOAD = 6;
  const listsPerRow = 3;

  useEffect(() => {
    const loadLists = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await listsApi.getAll();
        setAllLists(data);
        setFilteredLists(data);
      } catch (err) {
        console.error('Error loading lists:', err);
        setError('Failed to load lists. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadLists();
  }, []);

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

  useEffect(() => {
    // Filter lists based on search term
    if (searchTerm.trim() === "") {
      setFilteredLists(allLists);
    } else {
      const filtered = allLists.filter(list =>
        list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        list.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLists(filtered);
    }
    setCurrentPage(0); // Reset to first page when search changes
  }, [searchTerm, allLists]);

  // Load more lists function
  const loadMoreLists = useCallback(async () => {
    if (loadingMore) return;
    
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    const startIndex = nextPage * LISTS_PER_LOAD;
    const endIndex = startIndex + LISTS_PER_LOAD;
    const newLists = filteredLists.slice(startIndex, endIndex);
    
    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (newLists.length > 0) {
      setDisplayedLists(prev => [...prev, ...newLists]);
      setCurrentPage(nextPage);
    } else {
      // No more lists to load, ensure displayedLists equals filteredLists
      setDisplayedLists(prev => {
        if (prev.length < filteredLists.length) {
          return filteredLists;
        }
        return prev;
      });
    }
    setLoadingMore(false);
  }, [currentPage, filteredLists, loadingMore]);

  // Infinite scroll handler - same as /add-list
  const handleScroll = useCallback(() => {
    if (loadingMore) return;
    if (displayedLists.length === filteredLists.length) return; // No more items to load
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    const clientHeight = document.documentElement.clientHeight || window.innerHeight;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    if (distanceFromBottom < 300 && !loadingMore) {
      loadMoreLists();
    }
  }, [loadMoreLists, displayedLists.length, filteredLists.length, loadingMore]);

  // Initialize displayed lists when filteredLists changes
  useEffect(() => {
    if (filteredLists.length > 0) {
      setDisplayedLists(filteredLists.slice(0, LISTS_PER_LOAD));
      setCurrentPage(0);
    } else {
      setDisplayedLists([]);
    }
  }, [filteredLists]);

  // Add scroll listener
  useEffect(() => {
    if (filteredLists.length > 0) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll, filteredLists.length]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by useEffect
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-full max-w-md animate-pulse"></div>
          </div>

          {/* Lists Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 aspect-square rounded-lg mb-4"></div>
                <div className="h-5 bg-gray-300 rounded mb-3"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-semibold text-black mb-4">Browse Lists</h1>
          <p className="text-red-600 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
  
        {/* Google Structured Data */}
        {allLists.length > 0 && (
          <Script
            id="lists-structured-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "CollectionPage",
                "name": "Browse AI Prompt Lists",
                "description": "Discover curated collections of AI prompts organized by categories and themes.",
                "url": "https://freeprompts.store/lists",
                "mainEntity": {
                  "@type": "ItemList",
                  "name": "AI Prompt Lists Collection",
                  "description": "Curated collections of AI prompts organized by themes and use cases",
                  "numberOfItems": allLists.length,
                  "itemListElement": allLists.slice(0, 20).map((list, index) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "item": {
                      "@type": "CreativeWork",
                      "name": list.name,
                      "description": list.description?.substring(0, 160),
                      "url": `https://freeprompts.store/list/${list.id}/${list.slug}`,
                      "creator": {
                        "@type": "Person",
                        "name": "List Creator"
                      },
                      "dateCreated": list.created_at,
                      "numberOfItems": list.prompt_ids?.length || 0
                    }
                  }))
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

  return (
    <div className="min-h-screen bg-white">
      {/* Divider - Full Width */}


      <div className="border-b border-gray-200 mb-6"></div>
      {/* Full-width section with border and search */}
      <section className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">


          <h1 className="text-3xl font-semibold text-black mb-6">
            Browse Lists
          </h1>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-md">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search lists..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </form>
        </div>
      </section>



      <div className="py-12">



        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Results Info */}
          <div className="mb-6">
            <p className="text-gray-600">
              {filteredLists.length === 0 ? (
                searchTerm ? `No lists found for "${searchTerm}"` : "No lists available"
              ) : (
                <>
                  Showing {displayedLists.length > 0 ? 1 : 0}-{displayedLists.length} of {filteredLists.length} lists
                  {searchTerm && (
                    <span className="ml-2">• Search: "{searchTerm}"</span>
                  )}
                </>
              )}
            </p>
          </div>
          {/* Ad Space below Search */}
          <div className="mb-8">
            <div className="bg-gray-100 rounded-lg p-6 text-center">
              <AdSpace />
            </div>
          </div>

          {/* Lists Grid */}
          {displayedLists.length > 0 ? (
            <>
              <div className="space-y-8 mb-8">
                {/* Group lists into rows and show ads between them */}
                {Array.from({ length: Math.ceil(displayedLists.length / listsPerRow) }, (_, rowIndex) => {
                  const startIndex = rowIndex * listsPerRow;
                  const endIndex = startIndex + listsPerRow;
                  const rowLists = displayedLists.slice(startIndex, endIndex);
                  
                  return (
                    <div key={rowIndex}>
                      {/* Grid Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rowLists.map((list) => (
                          <Link
                            key={list.id}
                            href={`/list/${list.id}/${list.slug}`}
                            className="group bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors"
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
                                {new Date(list.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                      
                      {/* Show ad after this row if needed */}
                      {(() => {
                        let shouldShowAd = false;
                        
                        if (isMobile) {
                          // Mobile: 1 ad per 1 item -> show after every row
                          shouldShowAd = true;
                        } else if (isTablet) {
                          // Tablet: 1 ad per 2 items -> show after every row (3 items per row, but we need every 2)
                          // Since 3 items per row on tablet, we need to show after rows that would contain 2 items
                          shouldShowAd = true;
                        } else {
                          // Desktop: 1 ad per 3 items -> show after every 3 items
                          const itemsShown = (rowIndex + 1) * listsPerRow;
                          shouldShowAd = itemsShown % 3 === 0;
                        }
                        
                        // Don't show ad after the last row
                        const isLastRow = rowIndex >= Math.ceil(displayedLists.length / listsPerRow) - 1;
                        
                        return shouldShowAd && !isLastRow ? (
                          <div className="mt-8 bg-gray-100 rounded-lg p-6 text-center">
                            <AdSpace />
                          </div>
                        ) : null;
                      })()}
                    </div>
                  );
                })}
              </div>

              {/* Loading More Indicator */}
              {!loading && displayedLists.length > 0 && (
                <div className="text-center py-8">
                  {loadingMore ? (
                    <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-black">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Load new lists...
                    </div>
                  ) : displayedLists.length < filteredLists.length ? (
                    // More items available but not loading yet (scroll to trigger)
                    <div className="text-gray-500 text-sm">
                      Scroll down to load more lists
                    </div>
                  ) : (
                    // All items loaded
                    <div className="text-gray-500 text-sm font-medium">
                      End of lists.
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              {searchTerm ? (
                <>
                  <p className="text-gray-500 mb-4">No lists found for "{searchTerm}"</p>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="px-4 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800"
                  >
                    Clear Search
                  </button>
                </>
              ) : (
                <>
                  <p className="text-gray-500 mb-4">No lists available yet</p>
                  <Link
                    href="/add-list"
                    className="inline-block px-4 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800"
                  >
                    Add First List
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}