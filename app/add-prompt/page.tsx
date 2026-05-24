"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { promptsApi, imagesApi } from "@/lib/supabase-queries";
import { useAuth } from "@/components/ui/AuthProvider";
import type { Database } from "@/lib/database.types";
import { createSlug } from "@/lib/utils";
import Modal from "@/components/ui/Modal";

type PromptInsert = Database['public']['Tables']['prompts']['Insert'];

export default function AddPromptPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  // Modal states
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
    theme: "",
    category: "",
    group: "",
    jsonPrompt: "",
    shareTwitter: "",
    shareFacebook: "",
    sharePinterest: "",
    shareWhatsapp: "",
  });
  const [showShareOptions, setShowShareOptions] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
      return;
    }

    if (!loading && user && user.email !== 'kahramanozkan@gmail.com') {
      router.push('/404');
      return;
    }
  }, [user, loading, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await imagesApi.uploadImage(file);
        setImagePreview(url);
      } catch (error) {
        console.error("Error uploading image:", error);
        setAlertMessage("Failed to upload image.");
        setShowAlertModal(true);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare prompt data
      const promptData: PromptInsert = {
        user_id: user!.id,
        title: formData.title,
        content: formData.content,
        image: imagePreview || null,
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0),
        theme: formData.theme.trim() || null,
        category: formData.category.trim() || null,
        group: formData.group.trim() || null,
        json_prompt: formData.jsonPrompt.trim() || null,
        share_text_twitter: formData.shareTwitter.trim() || null,
        share_text_facebook: formData.shareFacebook.trim() || null,
        share_text_pinterest: formData.sharePinterest.trim() || null,
        share_text_whatsapp: formData.shareWhatsapp.trim() || null,
      };

      // Save to Supabase
      const newPrompt = await promptsApi.create(promptData, user);

      // Redirect to the newly created prompt's detail page
      const slug = createSlug(newPrompt.title);
      router.push(`/prompt/${newPrompt.id}/${slug}`);
    } catch (error) {
      console.error("Error submitting prompt:", error);
      console.log("Error type:", typeof error);
      console.log("Error keys:", error ? Object.keys(error) : "No error object");
      console.log("Raw error:", error);

      let errorMessage = "Unknown error occurred";

      try {
        // Log the full error for debugging
        console.log("Full error object:", JSON.stringify(error, null, 2));

        if (error && typeof error === 'object') {
          // Check for Supabase PostgrestError
          if ('message' in error) {
            errorMessage = (error as any).message;
          }
          if ('details' in error && (error as any).details) {
            errorMessage += ` - Details: ${(error as any).details}`;
          }
          if ('hint' in error && (error as any).hint) {
            errorMessage += ` - Hint: ${(error as any).hint}`;
          }
          if ('code' in error && (error as any).code) {
            errorMessage += ` - Code: ${(error as any).code}`;
          }
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else {
          errorMessage = JSON.stringify(error, null, 2);
        }
      } catch (parseError) {
        console.error("Error parsing error:", parseError);
        errorMessage = "Failed to parse error details";
      }

      setAlertMessage(`Failed to submit prompt: ${errorMessage}`);
      setShowAlertModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-black mb-2">
            Submit a Prompt
          </h1>
          <p className="text-gray-600">
            Share your prompt with the community
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Prompt Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-black transition-colors">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setImagePreview("")}
                    className="mt-4 text-sm text-gray-600 hover:text-black"
                  >
                    Remove image
                  </button>
                </div>
              ) : (
                <div>
                  <svg
                    className="w-12 h-12 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <label className="cursor-pointer">
                    <span className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Creative Writing Assistant"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
            />
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Theme
            </label>
            <input
              type="text"
              name="theme"
              value={formData.theme}
              onChange={handleChange}
              placeholder="e.g., Fantasy, Sci-Fi"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Category
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Character Design, Landscape"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
            />
          </div>

          {/* Group */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Group
            </label>
            <input
              type="text"
              name="group"
              value={formData.group}
              onChange={handleChange}
              placeholder="e.g., Midjourney, Stable Diffusion"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Prompt Content <span className="text-red-500">*</span>
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={10}
              placeholder="Enter your prompt here..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.content.length} characters
            </p>
          </div>

          {/* Json Prompt */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              JSON Prompt (optional)
            </label>
            <textarea
              name="jsonPrompt"
              value={formData.jsonPrompt}
              onChange={handleChange}
              rows={6}
              placeholder="Enter JSON formatted prompt (e.g., for API usage)..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black resize-none font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              JSON format for advanced usage
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Tags <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              required
              placeholder="e.g., Creative, Writing, Story"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate tags with commas
            </p>
            {formData.tags && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.split(",").map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Social Media Share Texts (Optional) */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setShowShareOptions(!showShareOptions)}
              className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between text-left focus:outline-none"
            >
              <span className="font-medium text-black">Social Media Share Texts (Optional)</span>
              <svg className={`w-5 h-5 text-gray-500 transform transition-transform ${showShareOptions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showShareOptions && (
              <div className="p-4 space-y-4 bg-white">
                <p className="text-sm text-gray-500 mb-2">Custom texts to be used when users share this prompt. If left blank, the default Title + Link will be used.</p>
                
                <div>
                  <label className="block text-sm font-medium text-blue-500 mb-1">Twitter Share Text</label>
                  <textarea
                    name="shareTwitter"
                    value={formData.shareTwitter}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-400 text-sm"
                    placeholder="Check out this awesome prompt..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">Facebook Share Text</label>
                  <textarea
                    name="shareFacebook"
                    value={formData.shareFacebook}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-600 text-sm"
                    placeholder="I just found this great prompt..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-red-600 mb-1">Pinterest Share Text</label>
                  <textarea
                    name="sharePinterest"
                    value={formData.sharePinterest}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-red-500 text-sm"
                    placeholder="Pin this prompt..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-green-600 mb-1">WhatsApp Share Text</label>
                  <textarea
                    name="shareWhatsapp"
                    value={formData.shareWhatsapp}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500 text-sm"
                    placeholder="Look at this prompt I found..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
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
              disabled={isSubmitting}
              className="px-8 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Prompt"}
            </button>
          </div>
        </form>
      </div>
      <Modal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        title="Information"
        message={alertMessage}
        type="info"
        confirmText="OK"
      />
    </div>
  );
}