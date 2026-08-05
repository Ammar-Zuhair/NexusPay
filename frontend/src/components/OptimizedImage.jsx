import React, { useState, useEffect } from 'react';

// Global Memory Image Cache to prevent reloading previously fetched image URLs
const imageMemoryCache = new Set();

export const OptimizedImage = ({ 
  src, 
  alt = 'Image', 
  className = '', 
  fallbackSrc = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
  ...props 
}) => {
  const isCached = imageMemoryCache.has(src);
  const [isLoaded, setIsLoaded] = useState(isCached);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);

  useEffect(() => {
    if (!src) {
      setCurrentSrc(fallbackSrc);
      return;
    }

    setCurrentSrc(src);
    setHasError(false);

    if (imageMemoryCache.has(src)) {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
      // Preload image in background memory
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imageMemoryCache.add(src);
        setIsLoaded(true);
      };
      img.onerror = () => {
        setHasError(true);
        setCurrentSrc(fallbackSrc);
        setIsLoaded(true);
      };
    }
  }, [src, fallbackSrc]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Skeleton Loading Shimmer */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-inherit" />
      )}

      {/* Optimized Performance Image Element */}
      <img
        src={hasError ? fallbackSrc : currentSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => {
          if (src) imageMemoryCache.add(src);
          setIsLoaded(true);
        }}
        onError={() => {
          setHasError(true);
          setCurrentSrc(fallbackSrc);
          setIsLoaded(true);
        }}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
};
