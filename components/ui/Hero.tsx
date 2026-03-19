"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <div className="bg-white py-20 md:py-32" suppressHydrationWarning>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" suppressHydrationWarning>
        <h1 className="text-4xl md:text-6xl font-bold text-black mb-6">
          Discover Free Copy-Paste AI Prompts
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Browse high-quality free prompts for ChatGPT, Google Gemini Nano Banana and other AI tools. Easily copy-paste and use prompts.
        </p>

        <Link
          href="/prompts"
          className="inline-block px-8 py-3 bg-yellow-100 text-gray-800 text-sm font-medium rounded-md hover:bg-yellow-200 transition-colors"
        >
          Discover Prompts
        </Link>
      </div>
    </div>
  );
}