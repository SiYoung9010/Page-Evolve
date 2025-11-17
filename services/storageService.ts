// services/storageService.ts

import { UploadedImage } from '../types';
import { CONFIG } from '../config/constants';

const STORAGE_KEY = CONFIG.STORAGE.IMAGE_STORAGE_KEY;
const MAX_STORAGE_SIZE = CONFIG.STORAGE.MAX_SIZE_BYTES;

/**
 * Saves a list of images to localStorage.
 * The File object is excluded to make the data serializable.
 */
export const saveImages = (images: UploadedImage[]): void => {
  try {
    const serializableImages = images.map(({ file, ...rest }) => rest);
    const json = JSON.stringify(serializableImages);
    
    if (json.length > MAX_STORAGE_SIZE) {
      console.warn('Image storage exceeds 5MB limit. Skipping save.');
      return;
    }
    
    localStorage.setItem(STORAGE_KEY, json);
  } catch (error) {
    console.error('Failed to save images to localStorage:', error);
  }
};

/**
 * Loads images from localStorage.
 */
export const loadImages = (): Omit<UploadedImage, 'file'>[] => {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return [];
    
    const parsed = JSON.parse(json);
    // Re-hydrate Date objects
    return parsed.map((img: any) => ({
      ...img,
      uploadedAt: new Date(img.uploadedAt)
    }));
  } catch (error) {
    console.error('Failed to load images from localStorage:', error);
    return [];
  }
};

/**
 * Deletes a specific image from localStorage by its ID.
 */
export const deleteImageFromStorage = (imageId: string): void => {
  const images = loadImages();
  const filtered = images.filter(img => img.id !== imageId);
  saveImages(filtered as UploadedImage[]); // Recast after filtering
};

/**
 * Clears all images from localStorage.
 */
export const clearAllImagesFromStorage = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
