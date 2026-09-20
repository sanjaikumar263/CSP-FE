/**
 * Utility for compressing images on the client side before uploading to the server.
 * Uses HTML5 Canvas to resize oversized images and compress quality.
 */

/**
 * Format bytes into human readable format (e.g. 1.2 MB, 340 KB)
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Compresses an image File or Blob in the browser.
 * 
 * @param {File|Blob} file - The image file to compress
 * @param {Object} options - Compression options
 * @param {number} [options.maxWidth=1920] - Maximum width constraint
 * @param {number} [options.maxHeight=1920] - Maximum height constraint
 * @param {number} [options.quality=0.82] - Compression quality (0.0 to 1.0)
 * @param {string} [options.mimeType='image/webp'] - Target MIME type ('image/webp' or 'image/jpeg')
 * @returns {Promise<File>} Compressed File object
 */
export async function compressImage(file, options = {}) {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.82,
    mimeType = 'image/webp'
  } = options;

  // If not an image or is SVG/GIF (animations/vector), return original file
  if (!file || !file.type || !file.type.startsWith('image/')) {
    return file;
  }
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  // If file is already small (e.g. < 300KB), return original file to avoid unnecessary reprocessing
  if (file.size <= 300 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const originalName = file.name || 'image.webp';
    const originalSize = file.size;

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Calculate new dimensions maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // Create canvas and draw resized image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Determine output MIME type
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(file);
          return;
        }

        // If compressed blob happens to be larger than original, keep original
        if (blob.size >= originalSize) {
          resolve(file);
          return;
        }

        const ext = mimeType === 'image/webp' ? '.webp' : '.jpg';
        const baseName = originalName.replace(/\.[^/.]+$/, '');
        const newFileName = `${baseName}${ext}`;

        const compressedFile = new File([blob], newFileName, {
          type: blob.type || mimeType,
          lastModified: Date.now()
        });

        // Attach friendly stats for UI logging
        compressedFile.originalSize = formatBytes(originalSize);
        compressedFile.compressedSize = formatBytes(compressedFile.size);
        const savedPercent = (((originalSize - compressedFile.size) / originalSize) * 100).toFixed(1);
        compressedFile.compressionRatio = `${savedPercent}%`;

        console.log(`⚡ Pre-compressed on client: ${compressedFile.originalSize} -> ${compressedFile.compressedSize} (${compressedFile.compressionRatio} saved)`);
        resolve(compressedFile);
      }, mimeType, quality);
    };

    img.onerror = (err) => {
      console.warn('Client-side compression fallback to original:', err);
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}
