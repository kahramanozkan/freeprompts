"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: "1",
    question: "What are AI prompts and how do they work?",
    answer: "AI prompts are text instructions or questions that you give to artificial intelligence tools like ChatGPT, Google Gemini, or Claude. These prompts help guide the AI to generate specific types of responses or content. Think of them as recipes that tell the AI exactly what you want it to cook up for you."
  },
  {
    id: "2",
    question: "How do I use these prompts effectively?",
    answer: "To use prompts effectively, simply copy the text from our website and paste it into your AI tool. You can then modify the prompts to fit your specific needs by changing variables like topics, tones, or formats. The key is to be clear and specific about what you want the AI to do."
  },
  {
    id: "3",
    question: "Are these prompts free to use?",
    answer: "Yes, all prompts on our platform are completely free to use. You can copy, modify, and use them for any purpose without any restrictions. We believe in making AI tools accessible to everyone."
  },
  {
    id: "4",
    question: "What AI tools are these prompts compatible with?",
    answer: "Our prompts work with most popular AI tools including ChatGPT, Google Gemini, Claude, Bing Chat, and many others. While the exact formatting might need slight adjustments between different tools, the core instructions remain the same."
  },
  {
    id: "5",
    question: "Can I modify these prompts for my specific needs?",
    answer: "Absolutely! We encourage you to customize prompts to fit your specific requirements. You can change topics, adjust the tone, modify the format, or add specific details that are relevant to your use case. The more specific you make the prompt, the better results you'll get."
  },
  {
    id: "6",
    question: "How often is new content added to the platform?",
    answer: "We regularly add new prompts and lists to our platform. Our team is constantly working on creating fresh, high-quality prompts for various categories including business, creative writing, education, marketing, and more. Check back often for new content!"
  },
  {
    id: "7",
    question: "What categories of prompts do you offer?",
    answer: "We offer prompts across many categories including Creative Writing, Business & Marketing, Education & Learning, Technical & Programming, Personal Development, Content Creation, Data Analysis, and much more. Each category contains dozens of specialized prompts for specific tasks."
  },
  {
    id: "8",
    question: "How can I submit my own prompts to the platform?",
    answer: "You can submit your own prompts directly through our 'Add Prompt' page after signing in. We welcome community contributions and review each submission to ensure quality. Approved prompts will be visible to all users and you'll receive credit as the author."
  },
  {
    id: "9",
    question: "Do you offer prompts in languages other than English?",
    answer: "Yes! Our platform supports multiple languages. You can browse prompts in English, Turkish, and other languages using the language selector. We're continuously adding translations and welcome contributions from multilingual users."
  },
  {
    id: "10",
    question: "What makes a good AI prompt?",
    answer: "A good AI prompt is clear, specific, and provides enough context for the AI to understand exactly what you want. It should include details about the desired format, tone, length, and any specific requirements. The best prompts act as detailed instructions rather than simple questions."
  },
  {
    id: "11",
    question: "Can I use these prompts for commercial purposes?",
    answer: "Yes, you can use our prompts for both personal and commercial purposes. There are no restrictions on how you use the prompts once you've copied them from our platform. However, we recommend always reviewing and customizing prompts to fit your specific commercial needs."
  },
  {
    id: "12",
    question: "How do I get better results from AI prompts?",
    answer: "To get better results, be specific about what you want, provide context when needed, and iterate on your prompts. Try different phrasings, add examples, and break complex tasks into smaller steps. Also, don't hesitate to ask follow-up questions to refine the AI's response."
  },
  {
    id: "13",
    question: "What are prompt lists and how do they work?",
    answer: "Prompt lists are curated collections of prompts organized around specific themes or use cases. You can create your own lists, follow others' lists, and share them with the community. Lists help you organize prompts for recurring tasks or projects."
  },
  {
    id: "14",
    question: "How can I save prompts to my favorites?",
    answer: "You can save prompts to your favorites by clicking the heart icon on any prompt card. Your favorite prompts are accessible from your profile page, allowing you to quickly revisit them later."
  },
  {
    id: "15",
    question: "How do notifications work on this platform?",
    answer: "Notifications keep you updated about new prompts from authors you follow, comments on your prompts, and system announcements. You can manage your notification preferences in your profile settings."
  },
  {
    id: "16",
    question: "Is there a mobile app available?",
    answer: "Currently, we don't have a dedicated mobile app, but our website is fully responsive and works perfectly on mobile browsers. You can add our site to your home screen for an app-like experience."
  },
  {
    id: "17",
    question: "How can I report inappropriate content?",
    answer: "If you encounter any content that violates our community guidelines, please use the 'Report' option available on each prompt or list. Our moderation team reviews reports promptly and takes appropriate action."
  }
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const filteredFAQs = useMemo(() => {
    if (!searchTerm.trim()) return faqData;
    
    return faqData.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

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
            {isSearchOpen ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search FAQs..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchTerm("");
                  }}
                  className="p-2 text-gray-400 hover:text-black"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:border-black transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-gray-600">Search FAQs...</span>
              </button>
            )}
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
                href="mailto:hello@freeprompts.store"
                className="inline-block px-6 py-3 bg-black text-white text-sm rounded-md hover:bg-gray-800 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqData.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          })
        }}
      />
    </div>
  );
}