/**
 * FOCUSPOINT Image Compression & Formatting Utilities
 * Automatically resizes and optimizes user avatars for persistent, quota-safe storage
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Resizes and compresses an image File or existing Data URL into a compact,
 * high-quality base64 string (typically 15KB - 30KB) that safely fits in localStorage
 * without triggering quota limits.
 */
export const compressImage = (
  source: File | string,
  options: CompressOptions = {}
): Promise<string> => {
  const { maxWidth = 300, maxHeight = 300, quality = 0.78 } = options;

  return new Promise((resolve, reject) => {
    const processImg = (dataUrl: string) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Maintain aspect ratio while bounding within maxWidth x maxHeight
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(dataUrl);
            return;
          }

          // Use smooth image smoothing for crisp avatar reproduction
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Try WebP first for optimal compression; fallback to JPEG
          try {
            const webpData = canvas.toDataURL('image/webp', quality);
            if (webpData.startsWith('data:image/webp')) {
              resolve(webpData);
              return;
            }
          } catch {
            // WebP not supported in some environments, fallback to JPEG
          }

          const jpegData = canvas.toDataURL('image/jpeg', quality);
          resolve(jpegData);
        } catch (err) {
          console.warn('Canvas compression error, using original dataUrl:', err);
          resolve(dataUrl);
        }
      };

      img.onerror = (err) => {
        console.error('Image loading failed in compression:', err);
        reject(new Error('Failed to load image for compression'));
      };

      img.src = dataUrl;
    };

    if (typeof source === 'string') {
      processImg(source);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          processImg(e.target.result);
        } else {
          reject(new Error('Failed to read file as data URL'));
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(source);
    }
  });
};

import { safeStorage } from './storageUtils';

/**
 * Safely persists a key-value pair to storage with automatic quota recovery.
 * Never throws QuotaExceededError.
 */
export const safeSetLocalStorage = (key: string, value: string): boolean => {
  return safeStorage.setItem(key, value);
};

