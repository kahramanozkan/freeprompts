"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AdSpace from "@/components/ui/AdSpace";
import { promptsWithUserApi, promptsApi, userLikesApi } from "@/lib/supabase-queries";
import { useAuth } from "@/components/ui/AuthProvider";
import type { Database } from "@/lib/database.types";

type Prompt = Database['public']['Tables']['prompts']['Row'] & {
  userName?: string;
  list?: string;
};

export default function PromptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    const loadPrompt = async () => {
      if (!params.id) return;

      try {
        setLoading(true);
        setError(null);
        
        const data = await promptsWithUserApi.getByIdWithUser(params.id as string);

        if (!data) {
          throw new Error('Prompt not found');
        }

        // Transform data to match our interface
        const transformedPrompt: Prompt = {
          ...data,
          id: data.id ?? '', // Ensure id is a string
          user_id: data.user_id ?? '', // Ensure user_id is a string
          title: data.title ?? '', // Ensure title is a string
          content: data.content ?? '', // Ensure content is a string
          image: data.image ?? null, // Ensure image is string | null
          tags: data.tags ?? [], // Ensure tags is string[]
          likes: data.likes ?? 0, // Ensure likes is number
          views: data.views ?? 0, // Ensure views is number
          created_at: data.created_at ?? '', // Ensure created_at is string
          updated_at: data.updated_at ?? '', // Ensure updated_at is string
          userName: data.user?.name || "Anonymous",
          list: data.tags?.[0] || "General" // Use first tag as list name
        };

        setPrompt(transformedPrompt);

        // Format date for display
        setFormattedDate(new Date(data.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }));

        // Check like status for current user
        if (user) {
          const hasLiked = await userLikesApi.hasUserLikedPrompt(user.id, params.id as string);
          setLiked(hasLiked);
        } else {
          setLiked(false);
        }

        // Increment views (always, regardless of login status)
        await promptsApi.incrementViews(params.id as string);
      } catch (err) {
        let errorMessage = 'Prompt not found or failed to load.';
        if (err && typeof err === 'object') {
          if ('message' in err) {
            errorMessage = `Error: ${(err as any).message}`;
          } else if ('error' in err && err.error && typeof err.error === 'object' && 'message' in err.error) {
            errorMessage = `Error: ${(err.error as any).message}`;
          }
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadPrompt();
  }, [params.id, user]);

  const handleCopy = () => {
    if (prompt) {
      navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLike = async () => {
    if (!user) {
      // Redirect to login if not authenticated
      console.log('User not logged in, redirecting to signin...');
      
      // Store current prompt ID in localStorage for redirect after login
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      
      // Use window.location for immediate redirect
      window.location.href = '/auth/signin';
      return;
    }

    if (!prompt) {
      console.log('No prompt data available');
      return;
    }

    console.log('🔄 === LIKE BUTTON CLICKED ===');
    console.log('Prompt ID:', prompt.id);
    console.log('Current liked state in UI:', liked);
    console.log('User ID:', user.id);

    // Double-check like status before toggling
    let currentLikeStatus = false;
    try {
      currentLikeStatus = await userLikesApi.hasUserLikedPrompt(user.id, prompt.id);
      console.log('📊 Current like status from DB:', currentLikeStatus);
      
      // Ensure UI state matches DB state
      if (currentLikeStatus !== liked) {
        console.log('🔄 Syncing UI state with DB state');
        setLiked(currentLikeStatus);
      }
    } catch (checkError) {
      console.error('❌ Error checking like status:', checkError);
    }

    try {
      console.log('🔄 Calling toggleLike with:', { userId: user.id, promptId: prompt.id });
      const newLikedState = await userLikesApi.toggleLike(user.id, prompt.id);
      console.log('✅ New liked state from API:', newLikedState);

      // Update local state
      setLiked(newLikedState);

      // Update the prompt's like count in local state
      setPrompt(prev => {
        if (!prev) return null;
        
        const currentLikes = prev.likes || 0;
        let newLikes;
        
        if (newLikedState && !currentLikeStatus) {
          // Just liked - increment
          newLikes = currentLikes + 1;
          console.log('👍 Like added, count:', currentLikes, '→', newLikes);
        } else if (!newLikedState && currentLikeStatus) {
          // Just unliked - decrement
          newLikes = Math.max(currentLikes - 1, 0);
          console.log('👎 Like removed, count:', currentLikes, '→', newLikes);
        } else {
          // No change
          newLikes = currentLikes;
          console.log('✅ No change in like count:', newLikes);
        }

        return {
          ...prev,
          likes: newLikes
        };
      });

      console.log('🎉 Like operation completed successfully');
    } catch (error) {
      console.error('💥 Error toggling like:', error);
      
      // Try to refresh the like status from database
      try {
        const hasLiked = await userLikesApi.hasUserLikedPrompt(user.id, prompt.id);
        console.log('🔄 Refreshing like status:', hasLiked);
        setLiked(hasLiked);
      } catch (refreshError) {
        console.warn('⚠️ Could not refresh like status:', refreshError);
      }
      
      alert('Failed to update like. Please try again.');
    }
  };

  const handleShare = async () => {
    if (prompt) {
      if (navigator.share) {
        try {
          await navigator.share({
            title: prompt.title,
            text: prompt.content,
            url: window.location.href,
          });
        } catch (err) {
          console.log("Error sharing:", err);
        }
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="bg-gray-200 rounded-lg aspect-[2/3]"></div>
              </div>
              <div className="lg:col-span-2">
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="h-32 bg-gray-200 rounded mb-6"></div>
                <div className="flex gap-2 mb-6">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-2xl font-semibold text-black mb-4">Prompt Not Found</h1>
          <p className="text-gray-600 mb-8">{error || "The prompt you're looking for doesn't exist."}</p>
          <Link
            href="/prompts"
            className="px-6 py-3 bg-black text-white text-sm rounded-md hover:bg-gray-800"
          >
            Browse All Prompts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Ad Space */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AdSpace format="horizontal" />
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-black">
            Home
          </Link>
          <span>/</span>
          <Link href="/prompts" className="hover:text-black">
            Browse
          </Link>
          <span>/</span>
          <span className="text-black">{prompt.title}</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Image (Vertical 2:3 ratio) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {prompt.image ? (
                <div 
                  className="rounded-lg overflow-hidden border border-gray-300 cursor-pointer hover:border-black transition-colors"
                  style={{ aspectRatio: '2/3' }}
                  onClick={() => setIsModalOpen(true)}
                >
                  <img
                    src={prompt.image || ""}
                    alt={prompt.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div 
                  className="bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center"
                  style={{ aspectRatio: '2/3' }}
                >
                  <svg
                    className="w-16 h-16 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2">
            {/* List Badge */}
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-gray-100 text-black rounded-md text-sm font-medium">
                {prompt.list}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-black mb-6">
              {prompt.title}
            </h1>

            {/* Prompt Content */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-sm font-semibold text-black">Prompt</h2>
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-2 px-4 py-2 bg-white text-sm border border-gray-300 rounded-md hover:border-black transition-colors"
                >
                  {copied ? (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                {prompt.content}
              </p>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {prompt.tags.map((tag: string, index: number) => (
                  <Link
                    key={index}
                    href={`/prompts`}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 px-6 py-2 text-sm rounded-md transition-colors ${
                  liked
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill={liked ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span>{prompt.likes}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-6 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                <span>Share</span>
              </button>
            </div>

            {/* Stats */}
            <div className="bg-gray-50 rounded-lg p-6 mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Views</p>
                    <p className="text-lg font-semibold text-gray-900">{prompt.views.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Published on</p>
                    <p className="text-lg font-semibold text-gray-900">{formattedDate}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Liked</p>
                    <p className="text-lg font-semibold text-gray-900">{prompt.likes.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          {prompt.image && (
            <img
              src={prompt.image}
              alt={prompt.title}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </div>
  );
}