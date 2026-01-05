'use client';

import { useState } from 'react';
import Image from 'next/image';

/**
 * Advanced Progressive Image with Low Quality Image Placeholder (LQIP)
 * Provides Instagram/Medium-style progressive loading
 *
 * Features:
 * - Automatic blur placeholder generation
 * - Smooth fade-in transition
 * - Shimmer loading effect
 * - Performance optimized with will-change
 *
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text for accessibility
 * @param {string} blurDataURL - Optional custom blur placeholder (base64 or data URL)
 * @param {boolean} fill - Next.js Image fill prop
 * @param {object} ...props - Any other Next.js Image props
 */
export default function ProgressiveImageWithPlaceholder({
  src,
  alt,
  blurDataURL,
  fill = false,
  className = '',
  priority = false,
  onLoadComplete,
  quality = 90,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Generate a minimal blur placeholder if none provided
  const defaultBlurDataURL = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3CfeColorMatrix values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 100 -1' result='s'/%3E%3CfeFlood x='0' y='0' width='100%25' height='100%25'/%3E%3CfeComposite operator='out' in='s'/%3E%3CfeComposite in2='SourceGraphic'/%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Cimage width='100%25' height='100%25' x='0' y='0' preserveAspectRatio='none' style='filter: url(%23b);' href='${src}'/%3E%3C/svg%3E`;

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
        fill={fill}
        quality={quality}
        priority={priority}
        placeholder="blur"
        blurDataURL={blurDataURL || defaultBlurDataURL}
        {...props}
        className={`
          transition-all duration-700 ease-out
          ${isLoaded
            ? 'blur-0 scale-100 opacity-100'
            : 'blur-sm scale-105 opacity-80'
          }
          ${props.className || ''}
        `}
        onLoad={handleLoad}
        style={{
          ...props.style,
          willChange: isLoaded ? 'auto' : 'transform, filter, opacity'
        }}
      />

      {/* Animated shimmer overlay during load */}
      {!isLoaded && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmerSlide 1.5s infinite linear'
          }}
        />
      )}

      <style jsx>{`
        @keyframes shimmerSlide {
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
