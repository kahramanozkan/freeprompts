"use client";

import { useState, useMemo } from "react";
import { FAQItem } from "./faq-data";

interface FAQClientProps {
  faqData: FAQItem[];
}

export default function FAQClient({ faqData }: FAQClientProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFAQs = useMemo(() => {
    if (!searchTerm.trim()) return faqData;
    
    return faqData.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, faqData]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Find answers to common questions about AI prompts, how to use them effectively, 
            and everything you need to know about our platform.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <div className="relative flex items-center">
              <span className="absolute left-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search FAQs..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 p-1 text-gray-400 hover:text-black"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {searchTerm && (
            <div className="mb-8">
              <p className="text-gray-600">
                Found {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''} for "{searchTerm}"
              </p>
            </div>
          )}

          {/* FAQ Items */}
          <div className="space-y-6">
            {filteredFAQs.map((faq) => (
              <div key={faq.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-black mb-4">
                  {faq.question}
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                No FAQs found matching "{searchTerm}"
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="px-4 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* Contact Section */}
          <div className="mt-16 text-center">
            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-2xl font-semibold text-black mb-4">
                Still have questions?
              </h3>
              <p className="text-gray-600 mb-6">
                Can't find the answer you're looking for? Feel free to reach out to us.
              </p>
              <a
                href="mailto:freeprompts.store@gmail.com"
                className="inline-block px-6 py-3 bg-black text-white text-sm rounded-md hover:bg-gray-800 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
