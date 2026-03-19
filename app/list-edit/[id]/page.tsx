"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { listsApi, promptsApi } from "@/lib/supabase-queries";
import { useAuth } from "@/components/ui/AuthProvider";
import type { Database } from "@/lib/database.types";
import { createSlug } from "@/lib/utils";

type List = Database['public']['Tables']['lists']['Row'];
type Prompt = Database['public']['Tables']['prompts']['Row'] & {
  userName?: string;
  list?: string;
};

export default function ListEditIndividualPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [list, setList] = useState<List | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedTag, setSelectedTag] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const promptsPerPage = 10;
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    prompt_ids: [] as string[]
  });

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

  useEffect(() => {
    const loadList = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const listId = params.id as string;
        const data = await listsApi.getById(listId);
        
        setList(data);
        
        // Set form data
        setFormData({
          name: data.name,
          description: data.description,
          image: data.image || '',
          prompt_ids: data.prompt_ids || []
        });
        
      } catch (err) {
        console.error('Error loading list:', err);
        setError('Failed to load list. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (params.id && user) {
      loadList();
    }
  }, [params.id, user]);

  const allTags = ["all", "Creative", "Business", "Tech", "Marketing", "Education", "Lifestyle"];

  useEffect(() => {
    const loadPrompts = async () => {
      try {
        const data = await promptsApi.getAll();
        const transformedPrompts: Prompt[] = data.map(prompt => ({
          ...prompt,
          userName: "User",
          list: prompt.tags[0] || "General"
        }));
        setPrompts(transformedPrompts);
      } catch (error) {
        console.error('Error loading prompts:', error);
      }
    };

    loadPrompts();
  }, []);

  const filteredPrompts = prompts.filter(prompt =>
    selectedTag === "all" || prompt.tags.some((tag: string) => tag === selectedTag)
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredPrompts.length / promptsPerPage);
  const startIndex = (currentPage - 1) * promptsPerPage;
  const endIndex = startIndex + promptsPerPage;
  const currentPrompts = filteredPrompts.slice(startIndex, endIndex);

  const togglePrompt = (promptId: string) => {
    setFormData(prev => ({
      ...prev,
      prompt_ids: prev.prompt_ids.includes(promptId)
        ? prev.prompt_ids.filter(id => id !== promptId)
        : [...prev.prompt_ids, promptId]
    }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTagChange = (tag: string) => {
    setSelectedTag(tag);
    setCurrentPage(1); // Reset to first page when tag changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!list) return;

    // Validation
    if (!formData.name.trim() || !formData.description.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const updates = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: formData.image || null,
        prompt_ids: formData.prompt_ids
      };

      await listsApi.update(list.id, updates);
      
      // Redirect back to list edit list
      router.push('/list-edit');
    } catch (err) {
      console.error('Error updating list:', err);
      setError('Failed to update list. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!list) return;
    
    if (confirm("Are you sure you want to delete this list? This action cannot be undone.")) {
      try {
        setSaving(true);
        await listsApi.delete(list.id);
        router.push('/list-edit');
      } catch (err) {
        console.error('Error deleting list:', err);
        setError('Failed to delete list. Please try again.');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Convert to base64 for demo purposes
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setFormData(prev => ({ ...prev, image: base64 }));
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
      setUploading(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
  };

  if (authLoading || loading) {
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

  if (error || !list) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-black mb-4">
            {error || 'List Not Found'}
          </h1>
          <div className="space-x-4">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
            >
              Go Back
            </button>
            <Link
              href="/list-edit"
              className="px-4 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800"
            >
              Back to List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/list-edit"
              className="text-sm text-gray-600 hover:text-black mb-2 inline-block"
            >
              ← Back to Lists
            </Link>
            <h1 className="text-3xl font-semibold text-black">
              Edit List
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`/list/${list.id}/${list.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-gray-600 border border-gray-300 text-sm rounded-md hover:bg-gray-50"
            >
              View List
            </a>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              Delete List
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Image Upload - Left Side */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-black mb-4">Image</h3>
              {formData.image ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={formData.image}
                      alt="List Image"
                      className="w-full h-48 object-cover rounded border"
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
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
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
                      <svg className="w-6 h-6 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-xs text-gray-600">
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
          </div>

          {/* Form - Right Side */}
          <div className="lg:col-span-9">
            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-8">
              {/* Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-black mb-2">
                  List Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Enter list name..."
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-black mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={6}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Enter list description..."
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <Link
                  href="/list-edit"
                  className="px-6 py-3 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving || !formData.name.trim() || !formData.description.trim()}
                  className="px-6 py-3 bg-black text-white text-sm rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Prompts Management */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-black">
                Manage Prompts ({formData.prompt_ids.length} selected)
              </h3>
              <p className="text-sm text-gray-600">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredPrompts.length)} of {filteredPrompts.length} prompts
                {totalPages > 1 && (
                  <span className="ml-2">• Page {currentPage} of {totalPages}</span>
                )}
              </p>
            </div>
            {formData.prompt_ids.length > 0 && (
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, prompt_ids: [] }))}
                className="text-sm text-gray-600 hover:text-black"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Tag Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-black mb-3">
              Filter Prompts by Tag
            </label>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagChange(tag)}
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
          </div>

          {/* Prompts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {currentPrompts.map((prompt) => (
              <button
                key={prompt.id}
                type="button"
                onClick={() => togglePrompt(prompt.id)}
                className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                  formData.prompt_ids.includes(prompt.id)
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
                      formData.prompt_ids.includes(prompt.id)
                        ? "bg-black text-white"
                        : "bg-white text-black"
                    }`}>
                      {formData.prompt_ids.includes(prompt.id) ? (
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {/* Previous Button */}
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 text-sm rounded border ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300 hover:border-black"
                }`}
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 text-sm rounded border ${
                        currentPage === pageNum
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-700 border-gray-300 hover:border-black"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 text-sm rounded border ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300 hover:border-black"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}