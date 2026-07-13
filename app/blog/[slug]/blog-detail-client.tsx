"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSiteLanguage } from "@/contexts/SiteLanguageContext";
import { getTranslation } from "@/lib/translations";
import { BlogPost, BlogPostContent } from "@/lib/blog-data";
import PromptCard from "@/components/ui/PromptCard";

interface BlogDetailClientProps {
  post: BlogPost;
  relatedPrompts?: any[];
}

export default function BlogDetailClient({ post, relatedPrompts = [] }: BlogDetailClientProps) {
  const { siteLanguage } = useSiteLanguage();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeLang = mounted ? siteLanguage : "english";
  const t = (key: string) => getTranslation(activeLang, key);

  const content: BlogPostContent = post.translations[activeLang as "english" | "turkish"] || post.translations.english;

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareUrl = typeof window !== "undefined" ? encodeURIComponent(window.location.href) : "";
  const shareTitle = encodeURIComponent(content.title);

  return (
    <div className="min-h-screen bg-white py-12 md:py-20" suppressHydrationWarning>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
        
        {/* Back Button */}
        <div className="mb-8" suppressHydrationWarning>
          <Link
            href="/blog"
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-black transition-colors"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t("blog.backToBlog")}
          </Link>
        </div>

        {/* Article Meta */}
        <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-gray-500" suppressHydrationWarning>
          <span>{post.readTime}</span>
          <span>•</span>
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString(activeLang === "turkish" ? "tr-TR" : "en-US", {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
          <span>•</span>
          <span>{t("blog.author")}: {post.author}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-bold text-black tracking-tight mb-8 leading-tight" suppressHydrationWarning>
          {content.title}
        </h1>

        {/* Cover Image */}
        <div className="relative aspect-[21/9] rounded-2xl overflow-hidden mb-12 bg-gray-100 border border-gray-200" suppressHydrationWarning>
          <Image
            src={post.image}
            alt={content.title}
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12" suppressHydrationWarning>
          
          {/* Sidebar Share Options */}
          <div className="lg:col-span-1 flex lg:flex-col items-center lg:items-start justify-center lg:justify-start gap-4 lg:gap-6 border-b lg:border-b-0 lg:border-r border-gray-100 pb-6 lg:pb-0 lg:pr-8 h-fit">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:block">
              {activeLang === "turkish" ? "Paylaş" : "Share"}
            </span>
            <div className="flex lg:flex-col gap-3">
              <a
                href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-black hover:border-black transition-colors"
                title="Share on X"
              >
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-black hover:border-black transition-colors"
                title="Share on Facebook"
              >
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <button
                onClick={handleCopyLink}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-black hover:border-black transition-colors relative"
                title="Copy Link"
              >
                {copied ? (
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                )}
                {copied && (
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-0.5 rounded shadow whitespace-nowrap">
                    {activeLang === "turkish" ? "Kopyalandı" : "Copied"}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Article Text Content */}
          <div className="lg:col-span-3 prose prose-lg prose-gray max-w-none">
            {/* GEO Quick Summary & Key Concept (AI Search Engine Optimization) */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6 mb-8 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {activeLang === 'turkish' ? 'Yapay Zeka Arama Motoru Özeti' : 'AI Search Overview & Takeaways'}
              </h3>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed font-sans font-medium">
                {content.excerpt}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans mt-4 pt-4 border-t border-indigo-100/50">
                <div>
                  <span className="block text-gray-400 font-semibold uppercase">{activeLang === 'turkish' ? 'Hedef Odaklı Teknolojiler' : 'Target Technologies'}</span>
                  <span className="font-semibold text-gray-800 mt-1 block">{content.tags.slice(0, 3).join(', ')}</span>
                </div>
                <div>
                  <span className="block text-gray-400 font-semibold uppercase">{activeLang === 'turkish' ? 'Önemli Anahtar Kelimeler' : 'Actionable Keywords'}</span>
                  <span className="font-semibold text-indigo-700 mt-1 block">{content.tags.map(t => `#${t.replace(/\s+/g, '')}`).join(' ')}</span>
                </div>
              </div>
            </div>

            {/* Render HTML Content */}
            <div 
              className="space-y-6 text-gray-700 leading-relaxed font-sans blog-content"
              dangerouslySetInnerHTML={{ __html: content.content }}
            />
            
            {/* Tags */}
            <div className="mt-12 pt-6 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {content.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Related Prompts Section */}
        {relatedPrompts && relatedPrompts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-gray-150" suppressHydrationWarning>
            <h2 className="text-2xl font-bold text-black mb-8">
              {activeLang === "turkish" ? "İlişkili Prompt Şablonları" : "Related Prompt Templates"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedPrompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          </div>
        )}

      </div>

      <style jsx global>{`
        .blog-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #000;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .blog-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #000;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .blog-content p {
          margin-bottom: 1.25rem;
        }
        .blog-content ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1.25rem;
          margin-top: 0.5rem;
        }
        .blog-content li {
          margin-bottom: 0.5rem;
        }
        .blog-content pre {
          background-color: #f3f4f6;
          border-radius: 0.5rem;
          padding: 1rem;
          overflow-x: auto;
          margin-bottom: 1.25rem;
          margin-top: 0.5rem;
        }
        .blog-content code {
          font-family: monospace;
          background-color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.9em;
        }
        .blog-content pre code {
          background-color: transparent;
          padding: 0;
          border-radius: 0;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}
