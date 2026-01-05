'use client';

import { useState } from 'react';
import Image from 'next/image';

/**
 * Progressive Image Component with blur-up effect
 * Provides a smooth transition from blurred placeholder to sharp image
 *
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text for accessibility
 * @param {string} className - Additional CSS classes
 * @param {number} priority - Next.js Image priority flag
 * @param {object} ...props - Any other Next.js Image props
 */
export default function ProgressiveImage({
  src,
  alt,
  className = '',
  priority = false,
  onLoadComplete,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = (result) => {
    setIsLoaded(true);
    if (onLoadComplete) {
      onLoadComplete(result);
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        {...props}
        priority={priority}
        className={`
          transition-all duration-700 ease-out
          ${isLoaded
            ? 'blur-0 scale-100 opacity-100'
            : 'blur-md scale-105 opacity-0'
          }
        `}
        onLoad={handleLoad}
        style={{
          ...props.style,
          willChange: isLoaded ? 'auto' : 'transform, filter, opacity'
        }}
      />

      {/* Loading shimmer effect while image loads */}
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer"
          style={{
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite linear'
          }}
        />
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}
