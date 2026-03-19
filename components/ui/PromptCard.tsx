"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, memo } from "react";
import type { Database } from "@/lib/database.types";
import { userLikesApi } from "@/lib/supabase-queries";
import { useAuth } from "@/components/ui/AuthProvider";
import { createSlug } from "@/lib/utils";

type Prompt = Database['public']['Tables']['prompts']['Row'] & {
  userName?: string;
  list?: string;
};

interface PromptCardProps {
  prompt: Prompt;
  initialLiked?: boolean;
  variantCount?: number;
}

function PromptCard({ prompt, initialLiked = false, variantCount = 0 }: PromptCardProps) {
  // Create slug from title
  const slug = createSlug(prompt.title);

  // Get user from auth context
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isLoading, setIsLoading] = useState(false);

  // Update like status when user changes (e.g., login/logout)
  useEffect(() => {
    if (!user) {
      setIsLiked(false);
    }
    // If user logs in, we keep initialLiked from server (already set)
  }, [user]);

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    if (!user || isLoading) {
      if (!user) {
        // Redirect to login if not authenticated
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        window.location.href = '/auth/signin';
      }
      return;
    }

    setIsLoading(true);

    try {
      const newLikeStatus = await userLikesApi.toggleLike(user.id, prompt.id);
      setIsLiked(newLikeStatus);

      // Update the prompt's likes count in parent component if callback provided
      // This would require a prop to update parent state
    } catch (error) {
      console.error('Error toggling like:', error);

      // Try to refresh like status from database on error
      try {
        const hasLiked = await userLikesApi.hasUserLikedPrompt(user.id, prompt.id);
        setIsLiked(hasLiked);
      } catch (refreshError) {
        console.warn('Could not refresh like status:', refreshError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Link href={`/prompt/${prompt.id}/${slug}`}>
      <div className="group relative bg-gray-200 rounded-lg overflow-hidden border border-gray-300 hover:border-black transition-all duration-300" style={{ aspectRatio: '2/3' }}>
        {/* Background Image */}
        {prompt.image && (
          <Image
            src={prompt.image}
            alt={prompt.title || "Prompt Image"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            priority={false}
            unoptimized={prompt.image.startsWith('data:')}
          />
        )}

        {/* Variant count badge - always visible */}
        <div className="absolute top-2 right-2 bg-yellow-100 text-gray-800 text-xs font-bold px-2 py-1 rounded-full z-10">
          {variantCount} {variantCount === 1 ? 'variant' : 'variants'}
        </div>

        {/* Default Overlay - Always visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-between">
          {/* Bottom section */}
          <div className="mt-auto">
            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(prompt.tags || []).slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white rounded text-xs border border-white/30"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Footer Info */}
            <div className="flex items-center justify-between text-xs text-white/90">
              <button
                onClick={handleLikeClick}
                disabled={isLoading}
                className={`flex items-center transition-colors ${user ? 'hover:text-red-400' : 'cursor-not-allowed opacity-50'} ${isLoading ? 'opacity-50' : ''}`}
                title={user ? (isLiked ? 'Click to unlike' : 'Click to like') : 'Login required to like'}
              >
                <svg
                  className={`w-3.5 h-3.5 mr-1 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-white/90'}`}
                  fill="none"
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
                {prompt.likes}
              </button>
              <span>
                {new Date(prompt.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Hover Overlay - Shows View Prompt button - Only on desktop */}
        <div className="absolute inset-0 bg-black/85 opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 p-4 hidden md:flex items-center justify-center pointer-events-none md:pointer-events-auto">
          <button className="px-4 py-2 bg-yellow-100 text-gray-800 text-sm font-medium rounded-lg hover:bg-yellow-200 transition-colors cursor-pointer">
            View Prompt
          </button>
        </div>
      </div>
    </Link>
  );
}

export default memo(PromptCard);