/**
 * Image utility functions for progressive loading and optimization
 */

/**
 * Generate a shimmer placeholder SVG for images during load
 * This creates a lightweight animated placeholder
 *
 * @param {number} w - Width of the placeholder
 * @param {number} h - Height of the placeholder
 * @returns {string} Base64 encoded SVG data URL
 */
export function getShimmerPlaceholder(w, h) {
  const shimmer = `
    <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#f6f7f8" offset="0%" />
          <stop stop-color="#edeef1" offset="20%" />
          <stop stop-color="#f6f7f8" offset="40%" />
          <stop stop-color="#f6f7f8" offset="100%" />
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="#f6f7f8" />
      <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
      <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite" />
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(shimmer).toString('base64')}`;
}

/**
 * Generate a blur placeholder data URL from an image URL
 * This creates a heavily blurred, tiny version for LQIP (Low Quality Image Placeholder)
 *
 * @param {string} imageUrl - The image URL to blur
 * @returns {string} SVG blur filter data URL
 */
export function getBlurDataURL(imageUrl) {
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'>
      <filter id='b' color-interpolation-filters='sRGB'>
        <feGaussianBlur stdDeviation='20'/>
        <feColorMatrix values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 100 -1' result='s'/>
        <feFlood x='0' y='0' width='100%' height='100%'/>
        <feComposite operator='out' in='s'/>
        <feComposite in2='SourceGraphic'/>
        <feGaussianBlur stdDeviation='20'/>
      </filter>
      <image width='100%' height='100%' x='0' y='0' preserveAspectRatio='none' style='filter: url(#b);' href='${imageUrl}'/>
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Generate a solid color placeholder based on image URL hash
 * Useful for creating unique placeholder colors per image
 *
 * @param {string} imageUrl - The image URL to generate color from
 * @returns {string} Hex color code
 */
export function getColorPlaceholder(imageUrl) {
  // Simple hash function to generate consistent color from URL
  let hash = 0;
  for (let i = 0; i < imageUrl.length; i++) {
    hash = imageUrl.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert hash to pastel color (muted, professional look)
  const hue = hash % 360;
  const saturation = 25 + (hash % 15); // 25-40% saturation
  const lightness = 85 + (hash % 10); // 85-95% lightness

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Optimize image URL for Next.js Image component
 * Adds query parameters for better caching and optimization
 *
 * @param {string} url - Original image URL
 * @param {number} quality - Image quality (1-100)
 * @returns {string} Optimized image URL
 */
export function optimizeImageUrl(url, quality = 75) {
  try {
    const urlObj = new URL(url);

    // Add quality parameter if not already present
    if (!urlObj.searchParams.has('q')) {
      urlObj.searchParams.set('q', quality.toString());
    }

    // Add format parameter for modern formats
    if (!urlObj.searchParams.has('fm')) {
      urlObj.searchParams.set('fm', 'webp');
    }

    return urlObj.toString();
  } catch {
    // If URL parsing fails, return original
    return url;
  }
}
