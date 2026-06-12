"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSiteLanguage } from "@/contexts/SiteLanguageContext";
import { getTranslation } from "@/lib/translations";
import { blogPosts, BlogPost } from "@/lib/blog-data";

export default function BlogPage() {
  const { siteLanguage } = useSiteLanguage();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use server-safe translation before hydration (defaults to English)
  const activeLang = mounted ? siteLanguage : "english";
  const t = (key: string) => getTranslation(activeLang, key);

  const filteredPosts = blogPosts.filter((post) => {
    const content = post.translations[activeLang as "english" | "turkish"] || post.translations.english;
    const query = searchQuery.toLowerCase();
    return (
      content.title.toLowerCase().includes(query) ||
      content.excerpt.toLowerCase().includes(query) ||
      content.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-white py-12 md:py-20" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16" suppressHydrationWarning>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mb-4">
            {activeLang === "turkish" ? "Yapay Zeka Okulu" : "AI Academy"}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-black tracking-tight mb-4">
            {t("blog.title")}
          </h1>
          <p className="text-lg text-gray-600">
            {t("blog.subtitle")}
          </p>
        </div>

        {/* Search bar */}
        <div className="max-w-md mx-auto mb-12" suppressHydrationWarning>
          <div className="relative">
            <input
              type="text"
              placeholder={activeLang === "turkish" ? "Rehberlerde ara..." : "Search guides..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-black border border-gray-300 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder-gray-400 text-sm"
            />
            <svg
              className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400"
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
        </div>

        {/* Blog Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" suppressHydrationWarning>
          {filteredPosts.map((post) => {
            const content = post.translations[activeLang as "english" | "turkish"] || post.translations.english;
            
            return (
              <article
                key={post.slug}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300 flex flex-col group hover:scale-[1.01]"
              >
                {/* Cover Image */}
                <Link href={`/blog/${post.slug}`} className="relative block aspect-video overflow-hidden bg-gray-100">
                  <Image
                    src={post.image}
                    alt={content.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300" />
                </Link>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  {/* Meta */}
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                    <span>{post.readTime}</span>
                    <span>•</span>
                    <time dateTime={post.publishedAt}>
                      {new Date(post.publishedAt).toLocaleDateString(activeLang === "turkish" ? "tr-TR" : "en-US", {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </time>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-black mb-3 line-clamp-2 group-hover:text-gray-700 transition-colors">
                    <Link href={`/blog/${post.slug}`}>
                      {content.title}
                    </Link>
                  </h3>

                  {/* Excerpt */}
                  <p className="text-sm text-gray-600 mb-6 line-clamp-3 flex-grow">
                    {content.excerpt}
                  </p>

                  {/* Footer & Tags */}
                  <div className="border-t border-gray-100 pt-4 mt-auto">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {content.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center text-sm font-semibold text-black hover:text-gray-600 transition-colors"
                    >
                      {t("blog.readMore")}
                      <svg
                        className="ml-1.5 h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-16" suppressHydrationWarning>
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-gray-500 text-lg font-medium">
              {activeLang === "turkish" ? "Aramanızla eşleşen makale bulunamadı." : "No articles found matching your search."}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
