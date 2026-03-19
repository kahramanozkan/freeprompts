"use client";

import { LanguageOption } from "@/lib/languages";
import { useState } from "react";

interface LanguageSelectorProps {
  options: LanguageOption[];
  selectedLanguage: string;
  onLanguageChange: (languageCode: string) => void;
  title: string;
  className?: string;
}

export default function LanguageSelector({
  options,
  selectedLanguage,
  onLanguageChange,
  title,
  className = ""
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.code === selectedLanguage);

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {title}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-50"
        >
          <span className="flex items-center">
            {selectedOption && (
              <>
                <span className="text-lg mr-2">{selectedOption.flag}</span>
                <span className="text-gray-900">{selectedOption.nativeName}</span>
              </>
            )}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            <div className="py-1">
              {options.map((option) => (
                <button
                  key={option.code}
                  onClick={() => {
                    onLanguageChange(option.code);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center ${
                    selectedLanguage === option.code
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                      : 'text-gray-900'
                  }`}
                >
                  <span className="text-lg mr-3">{option.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium">{option.nativeName}</div>
                    <div className="text-sm text-gray-500">{option.name}</div>
                  </div>
                  {selectedLanguage === option.code && (
                    <svg
                      className="h-4 w-4 text-blue-500 ml-2"
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
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}