"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { promptsApi, listsApi, combinedApi } from "@/lib/supabase-queries";
import { useAuth } from "@/components/ui/AuthProvider";
import type { Database } from "@/lib/database.types";
import { createSlug } from "@/lib/utils";

type Prompt = Database['public']['Tables']['prompts']['Row'] & {
  userName?: string;
  list?: string;
};
type ListInsert = Database['public']['Tables']['lists']['Insert'];

export default function AddListPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [listName, setListName] = useState("");
  const [listDescription, setListDescription] = useState("");
  const [image, setImage] = useState("");
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
      return;
    }

    if (!authLoading && user && user.email !== 'kahramanozkan@gmail.com') {
      router.push('/404');
      return;
    }
  }, [user, authLoading, router]);

  const [allTags, setAllTags] = useState<string[]>(["all", "Creative", "Business", "Tech", "Marketing", "Education", "Lifestyle"]);

  useEffect(() => {
    const loadPrompts = async () => {
      try {
        setLoading(true);
        const data = await promptsApi.getPaginated(1, 10);
        const transformedPrompts: Prompt[] = data.map(prompt => ({
          ...prompt,
          userName: "User",
          list: prompt.tags[0] || "General"
        }));
        setPrompts(transformedPrompts);
        setHasMore(data.length === 10);
        setPage(2);
      } catch (error) {
        console.error('Error loading prompts:', error);
      } finally {
        setLoading(false);
      }
    };

    const loadTags = async () => {
      try {
        const tags = await combinedApi.getUniqueTags();
        setAllTags(["all", ...tags]);
      } catch (error) {
        console.error('Error loading tags:', error);
      }
    };

    loadPrompts();
    loadTags();
  }, []);

  const filteredPrompts = prompts
    .filter(prompt =>
      selectedTag === "all" || prompt.tags.some((tag: string) => tag === selectedTag)
    )
    .filter((prompt, index, self) => self.findIndex(p => p.id === prompt.id) === index);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const data = await promptsApi.getPaginated(page, 10);
      const transformedPrompts: Prompt[] = data.map(prompt => ({
        ...prompt,
        userName: "User",
        list: prompt.tags[0] || "General"
      }));
      setPrompts(prev => [...prev, ...transformedPrompts]);
      setHasMore(data.length === 10);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading more prompts:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight = document.documentElement.clientHeight || window.innerHeight;
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
      if (distanceFromBottom < 300 && !loadingMore && hasMore) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore, page]);

  const togglePrompt = (promptId: string) => {
    setSelectedPrompts(prev =>
      prev.includes(promptId)
        ? prev.filter(id => id !== promptId)
        : [...prev, promptId]
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    setUploading(true);

    try {
      // Convert to base64 for demo purposes
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setImage(base64);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Failed to upload image. Please try again.');
      setUploading(false);
    }
  };

  const removeImage = () => {
    setImage('');
  };

  // Rich text formatting functions
  const formatText = (format: string) => {
    const textarea = document.getElementById('description-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = listDescription.substring(start, end);
    const beforeText = listDescription.substring(0, start);
    const afterText = listDescription.substring(end);

    let newText = '';
    
    switch (format) {
      case 'bold':
        newText = beforeText + `**${selectedText || 'bold text'}**` + afterText;
        break;
      case 'italic':
        newText = beforeText + `*${selectedText || 'italic text'}*` + afterText;
        break;
      case 'h1':
        newText = beforeText + `\n# ${selectedText || 'Heading 1'}\n` + afterText;
        break;
      case 'h2':
        newText = beforeText + `\n## ${selectedText || 'Heading 2'}\n` + afterText;
        break;
      case 'h3':
        newText = beforeText + `\n### ${selectedText || 'Heading 3'}\n` + afterText;
        break;
      case 'bullet':
        newText = beforeText + `\n- ${selectedText || 'Bullet point'}\n` + afterText;
        break;
      case 'number':
        newText = beforeText + `\n1. ${selectedText || 'Numbered item'}\n` + afterText;
        break;
      case 'quote':
        newText = beforeText + `\n> ${selectedText || 'Quote'}\n` + afterText;
        break;
      case 'link':
        newText = beforeText + `[${selectedText || 'link text'}](url)` + afterText;
        break;
      default:
        return;
    }
    
    setListDescription(newText);
  };

  const handleKeyboardShortcuts = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          formatText('bold');
          break;
        case 'i':
          e.preventDefault();
          formatText('italic');
          break;
        case '1':
          e.preventDefault();
          formatText('h1');
          break;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const slug = createSlug(listName);

      const listData: ListInsert = {
        user_id: user!.id,
        name: listName,
        slug,
        description: listDescription,
        image: image || null,
        prompt_ids: selectedPrompts,
      };

      const newList = await listsApi.create(listData);

      router.push(`/list/${newList.id}/${newList.slug}`);
    } catch (error) {
      console.error('Error creating list:', error);
      alert('Failed to create list. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || user.email !== 'kahramanozkan@gmail.com') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-black mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold text-black mb-8">
          Create New List
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Image Upload */}
          <div className="bg-gray-50 rounded-lg p-6">
            <label className="block text-sm font-medium text-black mb-4">
              List Image
            </label>
            {image ? (
              <div className="space-y-4">
                <div className="relative w-full h-48">
                  <img
                    src={image}
                    alt="List Image"
                    className="w-full h-full object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex items-center justify-center w-full h-32">
                <div className="text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-sm text-gray-600">
                      {uploading ? 'Uploading...' : 'Upload Image'}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      Square format (1:1)<br />
                      PNG, JPG, GIF up to 5MB
                    </span>
                  </label>
                </div>
              </div>
            )}
            {uploading && (
              <div className="mt-2 text-sm text-blue-600">Uploading image...</div>
            )}
          </div>

          {/* List Info */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                List Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                required
                placeholder="e.g., Best ChatGPT Prompts"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                List Description <span className="text-red-500">*</span>
              </label>
              
              {/* Rich Text Editor Toolbar */}
              <div className="border border-gray-300 rounded-t-lg bg-gray-50 px-4 py-2 flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => formatText('bold')}
                  className="p-2 hover:bg-gray-200 rounded text-sm font-bold"
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => formatText('italic')}
                  className="p-2 hover:bg-gray-200 rounded text-sm italic"
                  title="Italic"
                >
                  I
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <button
                  type="button"
                  onClick={() => formatText('h1')}
                  className="px-3 py-2 hover:bg-gray-200 rounded text-sm font-bold"
                  title="Heading 1"
                >
                  H1
                </button>
                <button
                  type="button"
                  onClick={() => formatText('h2')}
                  className="px-3 py-2 hover:bg-gray-200 rounded text-sm font-bold"
                  title="Heading 2"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => formatText('h3')}
                  className="px-3 py-2 hover:bg-gray-200 rounded text-sm font-bold"
                  title="Heading 3"
                >
                  H3
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <button
                  type="button"
                  onClick={() => formatText('bullet')}
                  className="p-2 hover:bg-gray-200 rounded text-sm"
                  title="Bullet List"
                >
                  •
                </button>
                <button
                  type="button"
                  onClick={() => formatText('number')}
                  className="p-2 hover:bg-gray-200 rounded text-sm"
                  title="Numbered List"
                >
                  1.
                </button>
                <button
                  type="button"
                  onClick={() => formatText('quote')}
                  className="p-2 hover:bg-gray-200 rounded text-sm"
                  title="Quote"
                >
                  "
                </button>
                <button
                  type="button"
                  onClick={() => formatText('link')}
                  className="p-2 hover:bg-gray-200 rounded text-sm"
                  title="Link"
                >
                  🔗
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <button
                  type="button"
                  onClick={() => {
                    setListDescription('');
                  }}
                  className="p-2 hover:bg-gray-200 rounded text-sm text-red-600"
                  title="Clear All"
                >
                  🗑
                </button>
              </div>
              
              <textarea
                id="description-textarea"
                value={listDescription}
                onChange={(e) => setListDescription(e.target.value)}
                onKeyDown={(e) => handleKeyboardShortcuts(e)}
                required
                rows={6}
                placeholder="Describe what this list is about..."
                className="w-full px-4 py-3 border border-t-0 border-gray-300 rounded-b-lg focus:outline-none focus:border-black resize-none bg-white"
              />
              
              {/* Format Help */}
              <div className="mt-3">
                <div className="text-xs text-gray-500">
                  <p><strong>Formatting:</strong> Use **bold**, *italic*, # Heading 1, ## Heading 2, - bullet points, 1. numbered lists, {'>'} quotes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tag Filter */}
          <div>
            <div className="mb-3">
              <button
                type="button"
                onClick={() => setShowFilter(!showFilter)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                {showFilter ? 'Hide Filter' : 'Show Filter'}
              </button>
            </div>
            {showFilter && (
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                      selectedTag === tag
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-700 border-gray-300 hover:border-black"
                    }`}
                  >
                    {tag === "all" ? "All" : tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Prompts Selection */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-black">
                Select Prompts ({loading ? 'Loading...' : `${selectedPrompts.length} selected`})
              </label>
              {selectedPrompts.length > 0 && !loading && (
                <button
                  type="button"
                  onClick={() => setSelectedPrompts([])}
                  className="text-sm text-gray-600 hover:text-black"
                >
                  Clear all
                </button>
              )}
            </div>

            {loading ? (
              /* Skeleton Loading */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse"
                    style={{ aspectRatio: '2/3' }}
                  >
                    <div className="w-full h-full bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Prompts Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {filteredPrompts.map((prompt) => (
                    <button
                      key={prompt.id}
                      type="button"
                      onClick={() => togglePrompt(prompt.id)}
                      className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                        selectedPrompts.includes(prompt.id)
                          ? "border-black"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      style={{ aspectRatio: '2/3' }}
                    >
                      {/* Image */}
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${prompt.image})` }}
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-between">
                        {/* Add/Remove Button */}
                        <div className="flex justify-end">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            selectedPrompts.includes(prompt.id)
                              ? "bg-black text-white"
                              : "bg-white text-black"
                          }`}>
                            {selectedPrompts.includes(prompt.id) ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            )}
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {prompt.tags.slice(0, 2).map((tag: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white rounded text-xs border border-white/30"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Loading more indicator */}
                {loadingMore && (
                  <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md">
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-black rounded-full animate-spin"></div>
                      <span className="text-sm text-gray-700">Load new prompts...</span>
                    </div>
                  </div>
                )}

                {/* End of prompts */}
                {!hasMore && filteredPrompts.length > 0 && (
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">End of prompts.</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 text-sm text-gray-600 hover:text-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedPrompts.length === 0 || !listName || !listDescription}
              className="px-8 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create List"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}