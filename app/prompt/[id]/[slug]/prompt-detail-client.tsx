"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import Image from "next/image";
import { promptsApi, userLikesApi, userLanguageApi, promptVariantsApi } from "@/lib/supabase-queries";
import { useAuth } from "@/components/ui/AuthProvider";
import AdSpace from "@/components/ui/AdSpace";
import { promptLanguages } from "@/lib/languages";
import LanguageSelector from "@/components/ui/LanguageSelector";
import { useSiteLanguage } from "@/contexts/SiteLanguageContext";
import { getTranslation } from "@/lib/translations";
import { PromptBreadcrumbs } from "@/components/Breadcrumbs";
import type { Database } from "@/lib/database.types";

type Prompt = Database['public']['Tables']['prompts']['Row'];

interface PromptDetailClientProps {
  params: { id: string; slug: string };
  initialPrompt: Prompt | null;
  error: string | null;
}

export default function PromptDetailClient({ params, initialPrompt, error }: PromptDetailClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState<Prompt | null>(initialPrompt);
  const [loading, setLoading] = useState(!initialPrompt);
  const [errorState, setErrorState] = useState<string | null>(error);
  const [isLiked, setIsLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const { siteLanguage: globalSiteLanguage } = useSiteLanguage();
  const t = (key: string) => getTranslation(globalSiteLanguage, key);

  // Output Variants state
  const [variants, setVariants] = useState<any[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number | null>(null);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showJsonPrompt, setShowJsonPrompt] = useState(false);

  // Ref to track if view has been incremented for the current prompt ID
  const viewIncrementedRef = useRef<string | null>(null);
  // Ref for share popup to detect outside clicks
  const sharePopupRef = useRef<HTMLDivElement>(null);

  // Load additional data if not loaded on server
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!params.id) {
          return;
        }

        // Load user language preferences - removed

        let currentPrompt = initialPrompt;

        if (!currentPrompt) {
          const data = await promptsApi.getById(params.id as string);

          if (!data) {
            setErrorState('Prompt not found');
            return;
          }

          currentPrompt = data;
          setPrompt(data);
          // setDisplayContent removed
        } else {
          // Ensure prompt state is synced if initialPrompt changes
          // setPrompt(initialPrompt); // This might cause loop if initialPrompt changes often, but it shouldn't
          // setDisplayContent removed
        }

        // Check if user has liked this prompt
        if (user && currentPrompt) {
          try {
            const hasLiked = await userLikesApi.hasLiked(user.id, params.id as string);
            setIsLiked(hasLiked);
          } catch (likeError) {
            // silent
          }
        } else {
          setIsLiked(false);
        }

        // Increment views and update local state
        // Use ref to prevent double counting in strict mode or re-renders
        if (currentPrompt && viewIncrementedRef.current !== params.id) {
          viewIncrementedRef.current = params.id;
          try {
            const result = await promptsApi.incrementViews(params.id as string);
            if (result) {
              setPrompt(prev => prev ? { ...prev, views: result.views } : prev);
            }
          } catch (viewError) {
            // silent
          }
        }
      } catch (err) {
        let errorMessage = 'Prompt not found or failed to load.';
        if (err && typeof err === 'object') {
          if ('message' in err) {
            errorMessage = `Error: ${(err as any).message}`;
          } else if ('error' in err && err.error && typeof err.error === 'object' && 'message' in err.error) {
            errorMessage = `Error: ${(err.error as any).message}`;
          }
        }
        setErrorState(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.id, user, initialPrompt]); // Removed 'prompt' to prevent infinite loop

  // Load variants when prompt is loaded
  useEffect(() => {
    const loadVariants = async () => {
      if (!prompt || !user) return; // Only load variants if user is logged in (requirement c)
      try {
        setVariantsLoading(true);
        const data = await promptVariantsApi.getByPromptId(prompt.id);
        setVariants(data || []);
      } catch (err) {
        console.error('Failed to load variants:', err);
      } finally {
        setVariantsLoading(false);
      }
    };

    if (prompt && user) {
      loadVariants();
    } else {
      // If not logged in, clear variants (they shouldn't see any)
      setVariants([]);
    }
  }, [prompt, user]);

  // Close share popup when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sharePopupRef.current &&
        !sharePopupRef.current.contains(event.target as Node) &&
        showShareOptions
      ) {
        setShowShareOptions(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showShareOptions) {
        setShowShareOptions(false);
      }
    };

    if (showShareOptions) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [showShareOptions]);

  // Keyboard navigation for gallery modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showGalleryModal) return;
      if (event.key === 'ArrowLeft') {
        goToPrev();
      } else if (event.key === 'ArrowRight') {
        goToNext();
      } else if (event.key === 'Escape') {
        closeGallery();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showGalleryModal, selectedVariantIndex, variants]);

  // Translate content when language changes - removed

  // handleTranslate removed

  const handleLike = async () => {
    if (!prompt) return;

    if (!user) {
      router.push('/auth/signin');
      return;
    }

    try {
      if (isLiked) {
        await userLikesApi.removeLike(user.id, prompt.id);
        setPrompt(prev => prev ? { ...prev, likes: Math.max(prev.likes - 1, 0) } : null);
        setIsLiked(false);
      } else {
        await userLikesApi.addLike(user.id, prompt.id);
        setPrompt(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
        setIsLiked(true);
      }
    } catch (err) {
      // silent
    }
  };

  const copyToClipboard = async () => {
    if (!prompt) return;

    const textToCopy = showJsonPrompt && prompt.json_prompt ? prompt.json_prompt : prompt.content;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // silent
    }
  };

  const toggleShareOptions = () => {
    setShowShareOptions(!showShareOptions);
  };

  const shareToPlatform = (platform: 'twitter' | 'facebook' | 'pinterest' | 'whatsapp') => {
    if (!prompt) return;

    const url = window.location.href;
    const title = prompt.title;
    const text = `Check out this prompt: ${title}`;
    const hashtags = 'AI,Prompt,FreePrompts';

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent(hashtags)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
    }

    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    setShowShareOptions(false);
  };

  const copyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      // silent
    }
    setShowShareOptions(false);
  };

  // Output Variants functions
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !prompt || !user) return;

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Only JPG, PNG, and WebP are allowed.');
      setShowUploadModal(true);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('File size exceeds 2MB limit.');
      setShowUploadModal(true);
      return;
    }

    // Check if user already has a variant for this prompt
    try {
      const hasVariant = await promptVariantsApi.userHasVariant(prompt.id, user.id);
      if (hasVariant) {
        setUploadError('You have already uploaded a variant for this prompt. Each user can upload only one.');
        setShowUploadModal(true);
        return;
      }
    } catch (err) {
      console.error('Failed to check existing variant:', err);
    }

    // Upload variant
    try {
      setUploading(true);
      const newVariant = await promptVariantsApi.create(prompt.id, user.id, file);
      setVariants(prev => [newVariant, ...prev]);
      setShowUploadModal(false);
      setUploadError(null);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload variant.');
      setShowUploadModal(true);
    } finally {
      setUploading(false);
      // Clear file input
      event.target.value = '';
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm('Are you sure you want to delete this variant?')) return;
    try {
      await promptVariantsApi.delete(variantId);
      setVariants(prev => prev.filter(v => v.id !== variantId));
    } catch (err) {
      console.error('Failed to delete variant:', err);
      alert('Failed to delete variant.');
    }
  };

  const openGallery = (index: number) => {
    setSelectedVariantIndex(index);
    setShowGalleryModal(true);
  };

  const closeGallery = () => {
    setShowGalleryModal(false);
    setSelectedVariantIndex(null);
  };

  const goToPrev = () => {
    if (selectedVariantIndex === null || variants.length === 0) return;
    setSelectedVariantIndex(prev => prev === 0 ? variants.length - 1 : prev! - 1);
  };

  const goToNext = () => {
    if (selectedVariantIndex === null || variants.length === 0) return;
    setSelectedVariantIndex(prev => prev === variants.length - 1 ? 0 : prev! + 1);
  };

  const handleDownloadImage = async () => {
    if (!prompt?.image) return;
    try {
      const response = await fetch(prompt.image);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prompt-${prompt.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download image:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Loading skeleton remains the same */}
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-40 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="lg:order-1">
                <div className="aspect-[2/3] bg-gray-200 rounded-lg"></div>
              </div>
              <div className="lg:order-2">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
                <div className="bg-gray-100 rounded-lg p-6 mb-6">
                  <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (errorState || !prompt) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-semibold text-black mb-4">Prompt Not Found</h1>
          <p className="text-gray-600 mb-8">{errorState}</p>
          <Link
            href="/prompts"
            className="inline-block px-6 py-3 bg-black text-white text-sm rounded-md hover:bg-gray-800"
          >
            Browse All Prompts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb above ad */}
      <div className="pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PromptBreadcrumbs
            promptTitle={prompt.title}
            promptId={prompt.id}
            slug={params.slug as string}
            className="mb-0"
          />
        </div>
      </div>

      {/* Top Ad Space */}
      <div className="py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdSpace />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back to Prompts link under ad */}
        <div className="mb-8">
          <Link
            href="/prompts"
            className="inline-flex items-center text-sm text-gray-600 hover:text-black"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Prompts
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Side - Image */}
          <div className="lg:order-1">
            {prompt.image && (
              <div
                className="relative"
                style={{ aspectRatio: '2/3' }}
              >
                <Image
                  src={prompt.image}
                  alt={prompt.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover rounded-lg shadow-lg"
                  priority
                />
                {/* Download button */}
                <button
                  onClick={handleDownloadImage}
                  className="absolute top-2 right-2 bg-black/70 text-white p-2 rounded-full hover:bg-black/90 transition-colors"
                  title="Download image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Right Side - Content */}
          <div className="lg:order-2">
            {/* Title */}
            <h1 className="text-3xl font-semibold text-black mb-8">{prompt.title}</h1>
         
            {/* Published on date */}
            <div className="flex items-center gap-2 bg-gray-50 text-gray-700 px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors mb-6 w-fit">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Published on {new Date(prompt.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
        
            {/* Prompt Content */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex flex-col gap-4 mb-4">
                {/* First row: Title and Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <h2 className="text-lg font-medium text-black">Prompt Content</h2>
                    {prompt?.json_prompt && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowJsonPrompt(false)}
                          className={`px-3 py-1 text-sm rounded-md border ${!showJsonPrompt ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`}
                        >
                          TEXT
                        </button>
                        <button
                          onClick={() => setShowJsonPrompt(true)}
                          className={`px-3 py-1 text-sm rounded-md border ${showJsonPrompt ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`}
                        >
                          JSON
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {/* Second row: Copy buttons */}
                <div className="flex flex-row flex-wrap items-center gap-2">
                  <button
                    onClick={copyToClipboard}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors text-sm border ${copied
                      ? 'bg-green-50 text-green-600 border-green-300'
                      : 'bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100'
                      }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {copied ? 'Prompt Copied!' : 'Copy Prompt'}
                  </button>
                  <button
                    onClick={copyLink}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors text-sm border ${copiedLink
                      ? 'bg-green-50 text-green-600 border-green-300'
                      : 'bg-blue-50 text-blue-600 border-blue-300 hover:bg-blue-100'
                      }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {copiedLink ? 'Link Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap font-mono text-sm bg-white p-4 rounded border border-gray-300 overflow-x-auto">
                {showJsonPrompt && prompt.json_prompt ? (
                  (() => {
                    try {
                      const parsed = JSON.parse(prompt.json_prompt);
                      return <pre>{JSON.stringify(parsed, null, 2)}</pre>;
                    } catch (e) {
                      return <pre className="text-red-600">{prompt.json_prompt}</pre>;
                    }
                  })()
                ) : (
                  prompt.content
                )}
              </div>
              {showJsonPrompt && prompt.json_prompt && (
                <p className="text-xs text-gray-500 mt-2">JSON format for advanced usage. Switch back to see normal prompt.</p>
              )}
            </div>

            {/* Translate Prompt Section removed */}

            {/* Theme, Category, Group */}
            {(prompt.theme || prompt.category || prompt.group) && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-black mb-4">Details</h3>
                <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                  <div className="grid grid-cols-1 gap-4">
                    {prompt.theme && (
                      <div className="bg-white border border-gray-300 rounded-lg p-3 flex items-center gap-3">
                        <div className="bg-gray-100 p-2 rounded-full">
                          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Theme</p>
                          <p className="font-medium text-black">{prompt.theme}</p>
                        </div>
                      </div>
                    )}
                    {prompt.category && (
                      <div className="bg-white border border-gray-300 rounded-lg p-3 flex items-center gap-3">
                        <div className="bg-gray-100 p-2 rounded-full">
                          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Category</p>
                          <p className="font-medium text-black">{prompt.category}</p>
                        </div>
                      </div>
                    )}
                    {prompt.group && (
                      <div className="bg-white border border-gray-300 rounded-lg p-3 flex items-center gap-3">
                        <div className="bg-gray-100 p-2 rounded-full">
                          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Group</p>
                          <p className="font-medium text-black">{prompt.group}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-black mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {prompt.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats - only views and total liked in a single line, plus share button */}
            <div className="relative flex flex-wrap items-center gap-4 sm:gap-6 text-sm pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-md border border-blue-300 font-medium hover:bg-blue-100 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Total {prompt.views} views
              </div>
              {/* Like button simple */}
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${isLiked
                  ? 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'
                  : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                  }`}
              >
                <svg
                  className="w-4 h-4"
                  fill={isLiked ? "currentColor" : "none"}
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
                <span className="font-medium">Total {prompt.likes} likes</span>
              </button>
              <div className="relative">
                <button
                  onClick={toggleShareOptions}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors text-sm border border-green-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Share
                </button>
                {/* Share Options Popup */}
                <div
                  ref={sharePopupRef}
                  className={`absolute bottom-full left-0 right-auto mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 transition-all duration-300 ease-out sm:right-0 sm:left-auto sm:w-48 ${showShareOptions
                    ? 'opacity-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 translate-y-2 pointer-events-none'
                    }`}
                >
                  <div className="p-3">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => shareToPlatform('twitter')}
                        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-sm text-gray-700"
                      >
                        <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.213c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                        <span>Twitter</span>
                      </button>
                      <button
                        onClick={() => shareToPlatform('facebook')}
                        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-sm text-gray-700"
                      >
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        <span>Facebook</span>
                      </button>
                      <button
                        onClick={() => shareToPlatform('pinterest')}
                        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-sm text-gray-700"
                      >
                        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.322 1.771 2.322 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.268 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
                        </svg>
                        <span>Pinterest</span>
                      </button>
                      <button
                        onClick={() => shareToPlatform('whatsapp')}
                        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-sm text-gray-700"
                      >
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411" />
                        </svg>
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Output Variants Section */}
      <div className="py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-black mb-2">Output Variants</h2>
                <p className="text-gray-600">
                  See how other users have used this prompt to create their own images.
                  {user ? ' You can also upload your own variant.' : ' Log in to upload your own variant.'}
                </p>
              </div>
              {user && (
                <div className="mt-2 md:mt-0">
                  <button
                    onClick={() => document.getElementById('variant-upload')?.click()}
                    className="px-6 py-3 bg-yellow-100 text-gray-800 hover:bg-yellow-200 rounded-md text-sm font-medium transition-colors border border-yellow-300"
                  >
                    Upload yours
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Hidden file input for upload */}
          <input
            type="file"
            id="variant-upload"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploading}
          />

          {user ? (
            <>
              {/* Variants list */}
              {variantsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[2/3] bg-gray-200 rounded-lg mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
                    </div>
                  ))}
                </div>
              ) : variants.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {variants.map((variant, index) => (
                    <div key={variant.id} className="group relative">
                      <div
                        className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                        onClick={() => openGallery(index)}
                      >
                        <img
                          src={variant.image_url}
                          alt={`Variant by ${variant.user?.name || 'User'}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="mt-3">
                        <p className="text-sm font-medium text-black truncate">
                          {variant.user?.username || variant.user?.name || 'Anonymous'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(variant.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      {/* Delete button for own variant */}
                      {variant.user_id === user.id && (
                        <button
                          onClick={() => handleDeleteVariant(variant.id)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete variant"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">
                    No variants uploaded yet. Be the first to share{' '}
                    <button
                      onClick={() => document.getElementById('variant-upload')?.click()}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      your output!
                    </button>
                  </p>
                </div>
              )}

            </>
          ) : (
            /* Login required view */
            <div className="p-8 bg-gray-50 rounded-lg border border-gray-300 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-xl font-medium text-black mb-2">Login to View and Upload Variants</h3>
              <p className="text-gray-600 mb-6">Only logged-in users can see and contribute to output variants.</p>
              <button
                onClick={() => router.push('/auth/signin')}
                className="px-6 py-3 bg-yellow-100 text-gray-800 hover:bg-yellow-200 rounded-md text-sm font-medium transition-colors border border-yellow-300"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Ad Space */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdSpace />
        </div>
      </div>

      {/* Enhanced JSON-LD Structured Data */}
      <Script
        id="prompt-creativework-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            "name": prompt.title,
            "description": prompt.content.length > 160
              ? `${prompt.content.substring(0, 157)}...`
              : prompt.content,
            "url": `https://freeprompts.store/prompt/${prompt.id}/${params.slug}`,
            "author": {
              "@type": "Person",
              "name": "Anonymous",
              "@id": "https://freeprompts.store/users/anonymous"
            },
            "dateCreated": prompt.created_at,
            "dateModified": prompt.updated_at,
            "keywords": prompt.tags?.join(", "),
            "image": prompt.image ? [prompt.image] : [],
            "genre": "AI Prompt",
            "about": [
              {
                "@type": "Thing",
                "name": "Artificial Intelligence"
              },
              {
                "@type": "Thing",
                "name": "Prompt Engineering"
              }
            ],
            "interactionStatistic": [
              {
                "@type": "InteractionCounter",
                "interactionType": "https://schema.org/LikeAction",
                "userInteractionCount": prompt.likes || 0
              },
              {
                "@type": "InteractionCounter",
                "interactionType": "https://schema.org/ViewAction",
                "userInteractionCount": prompt.views || 0
              }
            ],
            "isPartOf": {
              "@type": "Collection",
              "name": "FreePrompts AI Prompts",
              "url": "https://freeprompts.store"
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://freeprompts.store/prompt/${prompt.id}/${params.slug}`
            }
          })
        }}
      />

      {/* BreadcrumbList Schema */}
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
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
                "name": "Prompts",
                "item": "https://freeprompts.store/prompts"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": prompt.title,
                "item": `https://freeprompts.store/prompt/${prompt.id}/${params.slug}`
              }
            ]
          })
        }}
      />

      {/* Organization Schema */}
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "FreePrompts",
            "url": "https://freeprompts.store",
            "logo": {
              "@type": "ImageObject",
              "url": "https://freeprompts.store/logo.png"
            },
            "sameAs": [
              "https://twitter.com/freeprompts",
              "https://github.com/freeprompts"
            ],
            "description": "Free AI Prompt Marketplace - Discover, share, and use high-quality free AI prompts"
          })
        }}
      />

      {/* WebSite Schema */}
      <Script
        id="website-schema"
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
     {/* Upload Error Modal */}
     {showUploadModal && uploadError && (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
         <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
           <h3 className="text-lg font-semibold text-black mb-4">Upload Error</h3>
           <p className="text-gray-700 mb-6">{uploadError}</p>
           <div className="flex justify-end">
             <button
               onClick={() => setShowUploadModal(false)}
               className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
             >
               OK
             </button>
           </div>
         </div>
       </div>
     )}

     {/* Gallery Modal */}
     {showGalleryModal && selectedVariantIndex !== null && variants[selectedVariantIndex] && (
       <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2 sm:p-4">
         <button
           onClick={closeGallery}
           className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white p-2"
         >
           <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
           </svg>
         </button>
         <button
           onClick={goToPrev}
           className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white p-2 sm:left-4"
         >
           <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
           </svg>
         </button>
         <button
           onClick={goToNext}
           className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white p-2 sm:right-4"
         >
           <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
           </svg>
         </button>
         <div className="max-w-5xl w-full max-h-[95vh] flex flex-col items-center">
           <div className="relative w-full h-[70vh] sm:h-[80vh] mb-2">
             <img
               src={variants[selectedVariantIndex].image_url}
               alt={`Variant by ${variants[selectedVariantIndex].user?.name || 'User'}`}
               className="w-full h-full object-contain"
             />
           </div>
           <div className="text-white text-center px-4 py-2 bg-black/50 rounded-lg max-w-md">
             <p className="text-sm sm:text-base font-medium">
               By {variants[selectedVariantIndex].user?.username || variants[selectedVariantIndex].user?.name || 'Anonymous'}
             </p>
             <p className="text-gray-300 text-xs sm:text-sm">
               {new Date(variants[selectedVariantIndex].created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
             </p>
             <p className="text-xs text-gray-400 mt-1">
               {selectedVariantIndex + 1} of {variants.length}
             </p>
           </div>
         </div>
       </div>
     )}
    </div>
  );
}