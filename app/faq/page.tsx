import { Metadata } from "next";
import FAQClient from "./faq-client";
import { faqData } from "./faq-data";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Find answers to common questions about AI prompts, ChatGPT, Midjourney, and how to use our prompt engineering platform.",
};

export default function FAQPage() {
  return (
    <>
      <FAQClient faqData={faqData} />
      
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
    </>
  );
}