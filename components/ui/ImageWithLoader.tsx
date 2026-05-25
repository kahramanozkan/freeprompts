"use client";

import { useState } from 'react';
import Image from 'next/image';

interface ImageWithLoaderProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ImageWithLoader({ src, alt, className = "" }: ImageWithLoaderProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
      {/* Loader */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
        </div>
      )}
      
      {/* Image */}
      {src && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)} // Stop spinning if image fails to load
        />
      )}
    </div>
  );
}
