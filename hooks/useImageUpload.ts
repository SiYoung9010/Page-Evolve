// hooks/useImageUpload.ts

import { useState, useCallback, useEffect } from 'react';
import { UploadedImage } from '../types';
import {
  fileToDataUrl,
  getImageDimensions,
  analyzeImageForInsertion
} from '../services/imageService';
import { saveImages, loadImages, deleteImageFromStorage, clearAllImagesFromStorage } from '../services/storageService';

export const useImageUpload = (currentHtml: string) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [analyzingImageId, setAnalyzingImageId] = useState<string | null>(null);

  // Load images from storage on initial mount
  useEffect(() => {
    // We can't restore the File object, so this is metadata only
    const storedImages = loadImages();
    setImages(storedImages as UploadedImage[]); // Cast for state consistency
  }, []);

  // Persist images to storage whenever they change
  useEffect(() => {
    saveImages(images);
  }, [images]);

  const uploadAndProcessFiles = useCallback(async (files: FileList | File[]) => {
    setIsUploading(true);
    setUploadError(null);
    
    const fileArray = Array.from(files);
    
    try {
      const newImagesPromises = fileArray
        .filter(file => {
          if (!file.type.startsWith('image/')) {
            console.warn(`Skipping non-image file: ${file.name}`);
            return false;
          }
          if (file.size > 10 * 1024 * 1024) {
             throw new Error(`File too large: ${file.name} (max 10MB)`);
          }
          return true;
        })
        .map(async (file) => {
          const [dataUrl, dimensions] = await Promise.all([
            fileToDataUrl(file),
            getImageDimensions(file),
          ]);
          
          const uploadedImage: UploadedImage = {
            id: crypto.randomUUID(),
            file,
            dataUrl,
            fileName: file.name,
            mimeType: file.type,
            width: dimensions.width,
            height: dimensions.height,
            sizeInBytes: file.size,
            uploadedAt: new Date(),
          };
          return uploadedImage;
        });

      const newImages = await Promise.all(newImagesPromises);
      setImages(prev => [...prev, ...newImages]);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(errorMessage);
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const analyzeImage = useCallback(async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;
    
    setAnalyzingImageId(imageId);
    setUploadError(null);
    
    try {
      const analysis = await analyzeImageForInsertion(image.dataUrl, currentHtml);
      
      setImages(prev => prev.map(img => 
        img.id === imageId
          ? {
              ...img,
              altText: analysis.altText,
              description: analysis.description,
              suggestedPositions: analysis.suggestedPositions
            }
          : img
      ));
      
    } catch (error) {
      const errorMessage = 'AI analysis failed: ' + (error instanceof Error ? error.message : '');
      setUploadError(errorMessage);
      console.error('Analysis error:', error);
    } finally {
      setAnalyzingImageId(null);
    }
  }, [images, currentHtml]);

  const removeImage = useCallback((imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
    deleteImageFromStorage(imageId);
  }, []);

  const clearAll = useCallback(() => {
    setImages([]);
    clearAllImagesFromStorage();
  }, []);

  return {
    images,
    isUploading,
    uploadError,
    analyzingImageId,
    uploadImages: uploadAndProcessFiles,
    analyzeImage,
    removeImage,
    clearAllImages: clearAll
  };
};
