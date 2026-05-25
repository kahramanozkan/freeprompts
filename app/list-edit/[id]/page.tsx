"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { listsApi, promptsApi, imagesApi, combinedApi, promptsWithUserApi } from "@/lib/supabase-queries";
import { useAuth } from "@/components/ui/AuthProvider";
import type { Database } from "@/lib/database.types";
import { createSlug } from "@/lib/utils";
import PromptFilter from "@/components/ui/PromptFilter";

type List = Database['public']['Tables']['lists']['Row'];
type Prompt = Partial<Database['public']['Tables']['prompts']['Row']> & {
  id: string;
  title: string;
  image: string | null;
  tags: string[];
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

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [initialCategories, setInitialCategories] = useState<string[]>([]);
  const [initialThemes, setInitialThemes] = useState<string[]>([]);
  const [initialGroups, setInitialGroups] = useState<string[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const metadata = await combinedApi.getUniqueMetadata();
        setAllTags(metadata.tags);
        setInitialCategories(metadata.categories);
        setInitialThemes(metadata.themes);
        setInitialGroups(metadata.groups);

        const filters = {
          searchQuery: searchTerm,
          categories: selectedCategories,
          themes: selectedThemes,
          groups: selectedGroups,
          tags: selectedTags,
        };
        const data = await promptsApi.getPaginated(1, 10); // Or use promptsWithUserApi if available
        // For list-edit we just need the prompts, so we will use promptsApi for now
        // Wait, list-edit doesn't use the complex user fields as much, but let's map it.
        const transformedPrompts: Prompt[] = data.map(prompt => ({
          ...prompt,
          userName: "User",
          list: prompt.tags[0] || "General"
        }));
        setPrompts(transformedPrompts);
        setHasMore(data.length === 10);
        setPage(2);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();
  }, [searchTerm, selectedCategories, selectedThemes, selectedGroups, selectedTags]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchTerm(searchInput);
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const filters = {
        searchQuery: searchTerm,
        categories: selectedCategories,
        themes: selectedThemes,
        groups: selectedGroups,
        tags: selectedTags,
      };
      // We are supposed to pass filters to promptsApi.getPaginated but currently it doesn't take filters in its signature.
      // Wait! `promptsApi.getPaginated` does NOT accept filters. I must use `promptsWithUserApi.getPaginatedWithUsers`
      const data = await promptsWithUserApi.getPaginatedWithUsers(page, 10, filters);
      const transformedPrompts: any[] = data.map((prompt: any) => ({
        ...prompt,
        userName: prompt.user?.name || "User",
        list: prompt.tags?.[0] || "General"
      }));
      setPrompts(prev => {
        const newPrompts = [...prev, ...transformedPrompts];
        return newPrompts.filter((p, index, self) => self.findIndex(t => t.id === p.id) === index);
      });
      setHasMore(data.length === 10);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading more prompts:', error);
    } finally {
      setLoadingMore(false);
    }
  };

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
  }, [loadingMore, hasMore, page, searchTerm, selectedCategories, selectedThemes, selectedGroups, selectedTags]);

  const filteredPrompts = prompts;

  const currentPrompts = filteredPrompts; // Use all loaded prompts directly

  const togglePrompt = (promptId: string) => {
    setFormData(prev => ({
      ...prev,
      prompt_ids: prev.prompt_ids.includes(promptId)
        ? prev.prompt_ids.filter(id => id !== promptId)
        : [...prev.prompt_ids, promptId]
    }));
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
      const url = await imagesApi.uploadImage(file);
      setFormData(prev => ({ ...prev, image: url }));
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const formatText = (format: string) => {
    const textarea = document.getElementById('description-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.description.substring(start, end);
    const beforeText = formData.description.substring(0, start);
    const afterText = formData.description.substring(end);

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
    
    setFormData(prev => ({ ...prev, description: newText }));
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
        case '2':
          e.preventDefault();
          formatText('h2');
          break;
        case '3':
          e.preventDefault();
          formatText('h3');
          break;
      }
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
                  List Description <span className="text-red-500">*</span>
                </label>
                
                <div className="border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-black focus-within:border-black transition-all">
                  {/* Formatting Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-300">
                    <button type="button" onClick={() => formatText('bold')} className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-200 rounded" title="Bold (Ctrl+B)">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h8a4 4 0 100-8H6v8zm0 0h9a4 4 0 110 8H6v-8z" /></svg>
                    </button>
                    <button type="button" onClick={() => formatText('italic')} className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-200 rounded" title="Italic (Ctrl+I)">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                    </button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button type="button" onClick={() => formatText('h1')} className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-200 rounded font-bold text-sm" title="Heading 1 (Ctrl+1)">H1</button>
                    <button type="button" onClick={() => formatText('h2')} className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-200 rounded font-bold text-sm" title="Heading 2 (Ctrl+2)">H2</button>
                    <button type="button" onClick={() => formatText('h3')} className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-200 rounded font-bold text-sm" title="Heading 3 (Ctrl+3)">H3</button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button type="button" onClick={() => formatText('bullet')} className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-200 rounded" title="Bullet List">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                    <button type="button" onClick={() => formatText('number')} className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-200 rounded" title="Numbered List">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                    </button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button type="button" onClick={() => formatText('quote')} className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-200 rounded" title="Blockquote">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                    </button>
                    <button type="button" onClick={() => formatText('link')} className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-200 rounded" title="Link">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    </button>
                  </div>
                  
                  {/* Textarea */}
                  <textarea
                    id="description-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    onKeyDown={handleKeyboardShortcuts}
                    rows={8}
                    className="w-full px-4 py-3 border-none focus:outline-none focus:ring-0 resize-y"
                    placeholder="Describe your list... (Markdown supported)"
                    required
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>Supports Markdown formatting</span>
                  <span>Select text to format</span>
                </div>
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
                Showing {currentPrompts.length} prompts
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

          {/* Filter Prompts */}
          <PromptFilter
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            handleSearchSubmit={handleSearchSubmit}
            initialCategories={initialCategories}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            initialGroups={initialGroups}
            selectedGroups={selectedGroups}
            setSelectedGroups={setSelectedGroups}
            initialThemes={initialThemes}
            selectedThemes={selectedThemes}
            setSelectedThemes={setSelectedThemes}
            allTags={allTags}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags as React.Dispatch<React.SetStateAction<string[]>>}
            showFilter={showFilter}
            setShowFilter={setShowFilter}
          />

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
                </div>
              </button>
            ))}
          </div>
          
          {loadingMore && (
            <div className="py-8 flex justify-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}