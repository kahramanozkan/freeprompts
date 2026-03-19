import Image, { ImageProps } from 'next/image';
import { ComponentProps } from 'react';

interface SEOImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  loading?: 'lazy' | 'eager';
}

export default function SEOImage({
  src,
  alt,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  loading = 'lazy',
  className = '',
  ...props
}: SEOImageProps) {
  // Generate blurDataURL for LQIP (Low Quality Image Placeholder)
  const blurDataURL = `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="Arial, sans-serif" font-size="16">${alt}</text>
    </svg>`
  ).toString('base64')}`;

  return (
    <Image
      src={src}
      alt={alt}
      width={props.width || 400}
      height={props.height || 300}
      priority={priority}
      loading={priority ? 'eager' : loading}
      sizes={sizes}
      className={`transition-opacity duration-300 ${className}`}
      style={{
        objectFit: props.style?.objectFit || 'cover',
        ...props.style
      }}
      // Enhanced SEO attributes
      decoding="async"
      // Add fetch priority for LCP (Largest Contentful Paint)
      fetchPriority={priority ? 'high' : 'auto'}
      // Add referrer policy for security and SEO
      referrerPolicy="origin-when-cross-origin"
      // Add quality hint for optimization
      quality={priority ? 95 : 85}
      {...props}
    />
  );
}

// Utility function to generate optimized image URLs
export function generateOptimizedImageUrl(
  src: string,
  width?: number,
  height?: number,
  quality = 85
): string {
  // If it's an external URL, return as is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // If it's a relative URL, you could add image optimization service here
  // For now, return the original
  return src;
}

// SEO-optimized image component for prompt cards
export function PromptCardImage({ 
  src, 
  alt, 
  title, 
  views = 0, 
  likes = 0,
  priority = false 
}: {
  src?: string | null;
  alt: string;
  title: string;
  views?: number;
  likes?: number;
  priority?: boolean;
}) {
  if (!src) {
    return (
      <div className="aspect-[2/3] bg-gray-200 rounded-lg flex items-center justify-center">
        <svg 
          className="w-12 h-12 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-label="No image available"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative aspect-[2/3] group">
      <SEOImage
        src={src}
        alt={alt}
        title={title}
        priority={priority}
        className="rounded-lg transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        loading={priority ? 'eager' : 'lazy'}
        // Add hover overlay with stats
        onLoad={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.opacity = '1';
        }}
        style={{ opacity: 0 }}
      />
      
      {/* Hover overlay with engagement stats */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-end justify-between p-3 opacity-0 group-hover:opacity-100">
        <div className="flex items-center space-x-2 text-white text-sm">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            {views}
          </span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            {likes}
          </span>
        </div>
      </div>
    </div>
  );
}