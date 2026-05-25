"use client";

import React, { useState, useEffect } from "react";
import MultiSelectDropdown from "@/components/ui/MultiSelectDropdown";

interface PromptFilterProps {
  searchInput: string;
  setSearchInput: (val: string) => void;
  handleSearchSubmit: (e?: React.FormEvent) => void;

  initialCategories: string[];
  selectedCategories: string[];
  setSelectedCategories: (val: string[]) => void;

  initialGroups: string[];
  selectedGroups: string[];
  setSelectedGroups: (val: string[]) => void;

  initialThemes: string[];
  selectedThemes: string[];
  setSelectedThemes: (val: string[]) => void;

  allTags: string[];
  selectedTags: string[];
  setSelectedTags: (val: string[] | ((prev: string[]) => string[])) => void;

  showFilter: boolean;
  setShowFilter: (val: boolean) => void;
}

export default function PromptFilter({
  searchInput,
  setSearchInput,
  handleSearchSubmit,
  initialCategories,
  selectedCategories,
  setSelectedCategories,
  initialGroups,
  selectedGroups,
  setSelectedGroups,
  initialThemes,
  selectedThemes,
  setSelectedThemes,
  allTags,
  selectedTags,
  setSelectedTags,
  showFilter,
  setShowFilter,
}: PromptFilterProps) {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="w-full">
      {/* Mobile Toggle Button */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-black text-sm font-semibold rounded-md hover:bg-gray-200 transition-colors border border-gray-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {isMobileFilterOpen ? "Hide Filters & Search" : "Show Filters & Search"}
        </button>
      </div>

      {/* Filter Area (Hidden on Mobile unless toggled) */}
      <div className={`${isMobileFilterOpen ? "block" : "hidden"} md:block`}>
        {/* Main Filters: Search, Categories, Groups, Themes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search prompts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>
          <MultiSelectDropdown
            label="Select Categories"
            options={initialCategories}
            selectedValues={selectedCategories}
            onChange={setSelectedCategories}
          />
          <MultiSelectDropdown
            label="Select Groups"
            options={initialGroups}
            selectedValues={selectedGroups}
            onChange={setSelectedGroups}
          />
          <MultiSelectDropdown
            label="Select Themes"
            options={initialThemes}
            selectedValues={selectedThemes}
            onChange={setSelectedThemes}
          />
        </div>

        {/* Filter Toggle Button for Advanced Filters */}
        <div className="mb-6">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {showFilter ? "Hide Advanced Filters" : "Advanced Search"}
          </button>
        </div>

        {/* Advanced Filters (Tags) */}
        {showFilter && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 space-y-6">
            {/* Tags Filter */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-2 border border-gray-300 rounded-md bg-white">
                {allTags.length === 0 ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-8 w-16 bg-gray-200 rounded-md animate-pulse"></div>
                  ))
                ) : (
                  <>
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        type="button"
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                          selectedTags.includes(tag)
                            ? "bg-black text-white border-black"
                            : "bg-white text-gray-700 border-gray-300 hover:border-black"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </>
                )}
              </div>
              {selectedTags.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedTags([])}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear all tags
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
