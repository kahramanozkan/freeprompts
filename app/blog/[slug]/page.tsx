import { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogPosts } from "@/lib/blog-data";
import BlogDetailClient from "./blog-detail-client";

// Generate static params for static page export/ISR
export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: "Article Not Found",
      description: "The article you're looking for doesn't exist.",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://freeprompts.store';
  const postUrl = `${baseUrl}/blog/${slug}`;
  
  // Default to English content for SEO crawlers
  const seoContent = post.translations.english;

  return {
    title: `${seoContent.title} - FreePrompts Guides`,
    description: seoContent.excerpt,
    keywords: seoContent.tags,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title: `${seoContent.title} - FreePrompts Guides`,
      description: seoContent.excerpt,
      url: postUrl,
      type: 'article',
      images: [
        {
          url: `${baseUrl}${post.image}`,
          width: 1200,
          height: 630,
          alt: seoContent.title,
        },
      ],
      publishedTime: `${post.publishedAt}T00:00:00.000Z`,
      modifiedTime: `${post.publishedAt}T00:00:00.000Z`,
      authors: ['FreePrompts Editorial'],
      tags: seoContent.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${seoContent.title} - FreePrompts Guides`,
      description: seoContent.excerpt,
      images: [`${baseUrl}${post.image}`],
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://freeprompts.store';
  const postUrl = `${baseUrl}/blog/${slug}`;
  const seoContent = post.translations.english;

  return (
    <>
      {/* Schema.org Article JSON-LD for Google AdSense & SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": seoContent.title,
            "description": seoContent.excerpt,
            "image": [`${baseUrl}${post.image}`],
            "datePublished": `${post.publishedAt}T00:00:00.000Z`,
            "dateModified": `${post.publishedAt}T00:00:00.000Z`,
            "author": {
              "@type": "Organization",
              "name": "FreePrompts Editorial",
              "url": baseUrl
            },
            "publisher": {
              "@type": "Organization",
              "name": "FreePrompts",
              "logo": {
                "@type": "ImageObject",
                "url": `${baseUrl}/logo.png`
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": postUrl
            },
            "keywords": seoContent.tags.join(", ")
          })
        }}
      />
      
      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": baseUrl
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Blog",
                "item": `${baseUrl}/blog`
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": seoContent.title,
                "item": postUrl
              }
            ]
          })
        }}
      />

      <BlogDetailClient post={post} />
    </>
  );
}
