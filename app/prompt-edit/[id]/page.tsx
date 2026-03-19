"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { promptsApi, promptsWithUserApi, promptVariantsApi } from "@/lib/supabase-queries";
import { useAuth } from "@/components/ui/AuthProvider";
import type { Database } from "@/lib/database.types";
import { createSlug } from "@/lib/utils";

type Prompt = Database['public']['Tables']['prompts']['Row'] & {
  userName?: string;
  list?: string;
};

export default function PromptEditIndividualPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [variants, setVariants] = useState<any[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: '',
    tags: [] as string[],
    theme: '',
    category: '',
    group: '',
    json_prompt: '',
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
    const loadPrompt = async () => {
      try {
        setLoading(true);
        setError(null);

        const promptId = params.id as string;
        const data = await promptsWithUserApi.getByIdWithUser(promptId);

        if (!data) {
          setError('Prompt not found');
          return;
        }

        const transformedPrompt: Prompt = {
          ...data,
          userName: data.user?.name || "Anonymous",
          list: data.tags?.[0] || "General"
        };

        setPrompt(transformedPrompt);

        // Set form data
        setFormData({
          title: data.title,
          content: data.content,
          image: data.image || '',
          tags: data.tags,
          theme: data.theme || '',
          category: data.category || '',
          group: data.group || '',
          json_prompt: data.json_prompt || '',
        });

        // Load variants for this prompt
        try {
          setVariantsLoading(true);
          const variantsData = await promptVariantsApi.getByPromptId(data.id);
          setVariants(variantsData || []);
        } catch (err) {
          console.error('Failed to load variants:', err);
        } finally {
          setVariantsLoading(false);
        }

      } catch (err) {
        console.error('Error loading prompt:', err);
        setError('Failed to load prompt. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (params.id && user) {
      loadPrompt();
    }
  }, [params.id, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;

    // Validation
    if (!formData.title.trim() || !formData.content.trim() || formData.tags.length === 0) {
      setError('Please fill in all fields and add at least one tag.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const updates = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        image: formData.image || null,
        tags: formData.tags.filter(tag => tag.trim()).map(tag => tag.trim()),
        theme: formData.theme.trim() || null,
        category: formData.category.trim() || null,
        group: formData.group.trim() || null,
        json_prompt: formData.json_prompt.trim() || null,
      };

      await promptsApi.update(prompt.id, updates);

      // Redirect back to prompt edit list
      router.push('/prompt-edit');
    } catch (err) {
      console.error('Error updating prompt:', err);
      setError('Failed to update prompt. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!prompt) return;

    if (confirm("Are you sure you want to delete this prompt? This action cannot be undone.")) {
      try {
        setSaving(true);
        await promptsApi.delete(prompt.id);
        router.push('/prompt-edit');
      } catch (err) {
        console.error('Error deleting prompt:', err);
        setError('Failed to delete prompt. Please try again.');
      } finally {
        setSaving(false);
      }
    }
  };

  const addTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }));
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const updateTag = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => i === index ? value : tag)
    }));
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
      // In production, you would upload to Supabase Storage
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

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm('Are you sure you want to delete this variant? This will also delete the image from storage.')) return;
    try {
      await promptVariantsApi.delete(variantId);
      setVariants(prev => prev.filter(v => v.id !== variantId));
    } catch (err) {
      console.error('Failed to delete variant:', err);
      setError('Failed to delete variant.');
    }
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

  if (error || !prompt) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-black mb-4">
            {error || 'Prompt Not Found'}
          </h1>
          <div className="space-x-4">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
            >
              Go Back
            </button>
            <Link
              href="/prompt-edit"
              className="px-4 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800"
            >
              Back to List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Create slug for View button
  const viewUrl = `/prompt/${prompt.id}/${createSlug(prompt.title)}`;

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/prompt-edit"
              className="text-sm text-gray-600 hover:text-black mb-2 inline-block"
            >
              ← Back to Prompts
            </Link>
            <h1 className="text-3xl font-semibold text-black">
              Edit Prompt
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-gray-600 border border-gray-300 text-sm rounded-md hover:bg-gray-50"
            >
              View Prompt
            </a>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              Delete Prompt
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
                      alt="Prompt Image"
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
              {/* Title */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-black mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Enter prompt title..."
                  required
                />
              </div>

              {/* Theme */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-black mb-2">
                  Theme
                </label>
                <input
                  type="text"
                  value={formData.theme}
                  onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="e.g., Fantasy, Sci-Fi"
                />
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-black mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="e.g., Character Design, Landscape"
                />
              </div>

              {/* Group */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-black mb-2">
                  Group
                </label>
                <input
                  type="text"
                  value={formData.group}
                  onChange={(e) => setFormData(prev => ({ ...prev, group: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="e.g., Midjourney, Stable Diffusion"
                />
              </div>

              {/* Content */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-black mb-2">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={12}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Enter prompt content..."
                  required
                />
              </div>

              {/* Json Prompt */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-black mb-2">
                  JSON Prompt (optional)
                </label>
                <textarea
                  value={formData.json_prompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, json_prompt: e.target.value }))}
                  rows={6}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black font-mono text-sm"
                  placeholder="Enter JSON formatted prompt (e.g., for API usage)..."
                />
                <p className="text-xs text-gray-500 mt-1">JSON format for advanced usage</p>
              </div>

              {/* Tags */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-black mb-2">
                  Tags * (minimum 1 required)
                </label>
                <div className="space-y-2">
                  {formData.tags.map((tag, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => updateTag(index, e.target.value)}
                        className="flex-1 px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                        placeholder="Enter tag..."
                      />
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-3 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    + Add Tag
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <Link
                  href="/prompt-edit"
                  className="px-6 py-3 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving || !formData.title.trim() || !formData.content.trim() || formData.tags.filter(tag => tag.trim()).length === 0}
                  className="px-6 py-3 bg-black text-white text-sm rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Preview */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-black mb-4">Preview</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image - Left Side */}
            {formData.image && (
              <div className="lg:order-1">
                <div
                  className="relative rounded-lg overflow-hidden border border-gray-300"
                  style={{ aspectRatio: '2/3' }}
                >
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Content - Right Side */}
            <div className={`${formData.image ? 'lg:order-2' : 'lg:col-span-2'}`}>
              <div>
                <h4 className="font-medium text-black mb-2">
                  {formData.title || 'Title will appear here'}
                </h4>
                <p className="text-gray-600 text-sm line-clamp-6 mb-4">
                  {formData.content || 'Content will appear here...'}
                </p>
                {formData.tags.filter(tag => tag.trim()).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.filter(tag => tag.trim()).map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Variants Management Section */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-black mb-4">Output Variants ({variants.length})</h3>
          <p className="text-gray-600 mb-6">Manage user-uploaded output images for this prompt.</p>

          {variantsLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading variants...</p>
            </div>
          ) : variants.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {variants.map((variant) => (
                    <tr key={variant.id}>
                      <td className="px-4 py-3">
                        <div className="w-16 h-16 rounded overflow-hidden bg-gray-100">
                          <img
                            src={variant.image_url}
                            alt="Variant"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {variant.user?.name || 'Anonymous'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(variant.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <div className="truncate max-w-xs">{variant.file_name}</div>
                        <div className="text-xs text-gray-400">{(variant.file_size / 1024).toFixed(1)} KB</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleDeleteVariant(variant.id)}
                          className="px-3 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600">No variants uploaded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}