/**
 * Image Processing Utilities
 * Instagram/Facebook-style client-side image optimization
 */

/**
 * Compress and resize image before upload
 * Similar to Instagram's client-side compression
 *
 * @param {File} file - Original image file
 * @param {Object} options - Compression options
 * @returns {Promise<Blob>} - Compressed image blob
 */
export async function compressImage(file, options = {}) {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85,
    format = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (maintain aspect ratio)
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;

          if (width > height) {
            width = maxWidth;
            height = width / aspectRatio;
          } else {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }

        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          format,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Generate thumbnail from image
 * Like Facebook's instant thumbnail generation
 *
 * @param {File} file - Original image file
 * @param {number} size - Thumbnail size (square)
 * @returns {Promise<string>} - Data URL of thumbnail
 */
export async function generateThumbnail(file, size = 150) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');

        // Calculate crop dimensions (center crop)
        const aspectRatio = img.width / img.height;
        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = img.width;
        let sourceHeight = img.height;

        if (aspectRatio > 1) {
          // Landscape
          sourceWidth = img.height;
          sourceX = (img.width - img.height) / 2;
        } else {
          // Portrait
          sourceHeight = img.width;
          sourceY = (img.height - img.width) / 2;
        }

        // Draw cropped image
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, size, size
        );

        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Extract EXIF data from image
 * Instagram preserves some EXIF data, strips others for privacy
 *
 * @param {File} file - Image file
 * @returns {Promise<Object>} - EXIF data
 */
export async function extractEXIFData(file) {
  // For basic implementation, we can use a library like exif-js
  // For now, return basic file metadata
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: new Date(file.lastModified).toISOString(),
  };
}

/**
 * Estimate upload time based on file size and connection speed
 * Like Instagram's upload time estimation
 *
 * @param {number} fileSize - File size in bytes
 * @returns {string} - Estimated time string
 */
export function estimateUploadTime(fileSize) {
  // Estimate connection speed (rough approximation)
  // 4G: ~5 Mbps, 3G: ~1 Mbps, WiFi: ~10 Mbps
  const connectionSpeed = navigator.connection?.downlink || 5; // Mbps
  const uploadSpeed = connectionSpeed * 0.8; // Upload is typically slower

  const fileSizeMB = fileSize / (1024 * 1024);
  const timeInSeconds = (fileSizeMB * 8) / uploadSpeed;

  if (timeInSeconds < 5) return 'A few seconds';
  if (timeInSeconds < 60) return `About ${Math.round(timeInSeconds)} seconds`;
  if (timeInSeconds < 120) return 'About a minute';
  return `About ${Math.round(timeInSeconds / 60)} minutes`;
}

/**
 * Get optimal image quality based on file size
 * Instagram adjusts quality based on image complexity
 *
 * @param {number} fileSize - Original file size
 * @returns {number} - Quality value (0-1)
 */
export function getOptimalQuality(fileSize) {
  const sizeMB = fileSize / (1024 * 1024);

  if (sizeMB < 1) return 0.9; // Small files can keep high quality
  if (sizeMB < 3) return 0.85; // Medium files
  if (sizeMB < 5) return 0.8;  // Larger files
  return 0.75; // Very large files need more compression
}

/**
 * Check if image needs compression
 *
 * @param {File} file - Image file
 * @param {number} maxSize - Maximum size in bytes
 * @returns {boolean} - Whether compression is needed
 */
export function needsCompression(file, maxSize = 5 * 1024 * 1024) {
  return file.size > maxSize;
}
