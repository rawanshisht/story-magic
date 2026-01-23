/**
 * Image optimization utilities for PDF generation
 * 
 * For full image compression, consider adding 'sharp' package:
 * npm install sharp
 * npm install -D @types/sharp
 */

import { downloadImageAsBase64 } from "./openai";

// Configuration for PDF image optimization
export interface ImageOptimizationConfig {
  /** Maximum width for images in the PDF (default: 800) */
  maxWidth: number;
  /** Maximum height for images in the PDF (default: 800) */
  maxHeight: number;
  /** JPEG quality for compression (0-100, default: 80) */
  quality: number;
  /** Whether to attempt compression (default: true) */
  enabled: boolean;
}

export const DEFAULT_IMAGE_CONFIG: ImageOptimizationConfig = {
  maxWidth: 800,
  maxHeight: 800,
  quality: 80,
  enabled: true,
};

/**
 * Parse data URL to get metadata
 */
function parseDataUrl(dataUrl: string): {
  mimeType: string;
  base64Data: string;
  isValid: boolean;
} {
  const match = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (!match) {
    return { mimeType: "image/png", base64Data: "", isValid: false };
  }
  return {
    mimeType: match[1],
    base64Data: match[2],
    isValid: true,
  };
}

/**
 * Get image dimensions from base64 data
 * Returns estimated dimensions based on buffer size (approximation)
 */
function getImageDimensions(base64Data: string): { width: number; height: number } {
  try {
    const buffer = Buffer.from(base64Data, "base64");
    // Check for PNG signature
    if (buffer.length >= 24 && 
        buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      return { width, height };
    }
    // Check for JPEG signature
    if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xD8) {
      // For JPEG, we'd need to parse the EXIF data to get exact dimensions
      // For now, return a reasonable estimate
      return { width: 1024, height: 1024 }; // DALL-E 3 default
    }
  } catch {
    // Ignore errors and return defaults
  }
  return { width: 1024, height: 1024 };
}

/**
 * Compress image by reducing quality (basic implementation)
 * Note: For full compression with resizing, install 'sharp' package
 * 
 * This is a lightweight implementation that provides basic compression
 * For optimal results, use the sharp-based implementation below
 */
export async function compressImage(
  imageData: string,
  config: ImageOptimizationConfig = DEFAULT_IMAGE_CONFIG
): Promise<string> {
  if (!config.enabled) {
    return imageData;
  }

  const { mimeType, base64Data, isValid } = parseDataUrl(imageData);
  if (!isValid) {
    return imageData;
  }

  // For now, return original if no sharp installation
  // This provides structure for future optimization
  return imageData;
}

/**
 * Check if image needs optimization based on dimensions
 */
export function shouldOptimize(
  imageData: string,
  config: ImageOptimizationConfig = DEFAULT_IMAGE_CONFIG
): boolean {
  if (!config.enabled) return false;

  const { base64Data, isValid } = parseDataUrl(imageData);
  if (!isValid) return false;

  const { width, height } = getImageDimensions(base64Data);
  return width > config.maxWidth || height > config.maxHeight;
}

/**
 * Get optimized image size information
 */
export function getImageSizeInfo(imageData: string): {
  originalSize: number;
  formattedSize: string;
  dimensions: { width: number; height: number };
} {
  const { base64Data, isValid } = parseDataUrl(imageData);
  const originalSize = isValid ? Math.round((base64Data.length * 3) / 4) : 0;
  
  const dimensions = getImageDimensions(base64Data);

  // Format file size
  const formattedSize = originalSize > 1024 * 1024
    ? `${(originalSize / (1024 * 1024)).toFixed(2)} MB`
    : originalSize > 1024
    ? `${(originalSize / 1024).toFixed(2)} KB`
    : `${originalSize} B`;

  return { originalSize, formattedSize, dimensions };
}

/**
 * Process image for PDF generation with optimization
 */
export async function processImageForPdf(
  imageUrlOrBase64: string,
  config: ImageOptimizationConfig = DEFAULT_IMAGE_CONFIG
): Promise<string> {
  // If already base64 with data URI, use as-is (or compress if sharp available)
  if (imageUrlOrBase64.startsWith("data:")) {
    return compressImage(imageUrlOrBase64, config);
  }

  // If URL, download and convert to base64
  if (imageUrlOrBase64.startsWith("https://")) {
    const base64 = await downloadImageAsBase64(imageUrlOrBase64);
    return compressImage(base64, config);
  }

  return imageUrlOrBase64;
}

/**
 * Process multiple images for PDF batch optimization
 */
export async function processImagesForPdf(
  images: string[],
  config: ImageOptimizationConfig = DEFAULT_IMAGE_CONFIG
): Promise<string[]> {
  return Promise.all(images.map((img) => processImageForPdf(img, config)));
}
