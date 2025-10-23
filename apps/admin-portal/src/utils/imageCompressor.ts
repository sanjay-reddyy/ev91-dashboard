/**
 * Compresses an image file to reduce its size using Canvas API
 *
 * @param imageFile The original image file
 * @param options Compression options
 * @returns A Promise that resolves to the compressed file
 */
export async function compressImage(
  imageFile: File,
  options: {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    useWebWorker?: boolean;
  } = {}
): Promise<File> {
  // Default options
  const maxSizeMB = options.maxSizeMB || 1;
  const maxWidthOrHeight = options.maxWidthOrHeight || 1920;
  
  // If file is already small enough, return as-is
  if (imageFile.size / 1024 / 1024 <= maxSizeMB) {
    return imageFile;
  }

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidthOrHeight) {
          height = (height * maxWidthOrHeight) / width;
          width = maxWidthOrHeight;
        }
      } else {
        if (height > maxWidthOrHeight) {
          width = (width * maxWidthOrHeight) / height;
          height = maxWidthOrHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        
        // Try different quality levels to achieve target size
        let quality = 0.9;
        const tryCompress = () => {
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedSize = blob.size / 1024 / 1024;
              
              if (compressedSize <= maxSizeMB || quality <= 0.1) {
                // Create file from blob
                const compressedFile = new File([blob], imageFile.name, {
                  type: imageFile.type,
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                // Reduce quality and try again
                quality -= 0.1;
                tryCompress();
              }
            } else {
              reject(new Error('Failed to compress image'));
            }
          }, imageFile.type, quality);
        };
        
        tryCompress();
      } else {
        reject(new Error('Canvas context not available'));
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(imageFile);
  });
}

/**
 * Validates if a file is an image and under the specified size limit
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 10,
  allowedTypes: string[] = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
): { isValid: boolean; error?: string } {
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    return {
      isValid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`
    };
  }

  return { isValid: true };
}
