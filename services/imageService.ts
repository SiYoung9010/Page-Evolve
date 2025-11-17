// services/imageService.ts

import { GoogleGenAI, Type } from '@google/genai';
import { ImageAnalysisResult, ImagePosition } from '../types';
import { PROMPTS } from '../config/prompts';
import { CONFIG } from '../config/constants';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

/**
 * Converts a File object to a Base64 Data URL.
 */
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Gets the dimensions (width and height) of an image file.
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Parses a data URL to extract its MIME type and Base64 data.
 */
export const parseDataUrl = (dataUrl: string): { mimeType: string; base64Data: string } => {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error('Invalid data URL format');
  return {
    mimeType: match[1],
    base64Data: match[2]
  };
};

/**
 * Creates a simplified text summary of the HTML structure for the AI prompt.
 */
const extractStructureSummary = (html: string): string => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const sections: string[] = [];
    
    doc.querySelectorAll('h1, h2, h3').forEach((heading) => {
      sections.push(`${heading.tagName}: ${heading.textContent?.trim().slice(0, 50)}`);
    });
    
    const imgCount = doc.querySelectorAll('img').length;
    sections.push(`Images: ${imgCount}`);
    
    return sections.join('\n');
  } catch (e) {
      return "Could not parse HTML.";
  }
};

/**
 * Analyzes an image using AI to generate alt text and suggest insertion positions within the HTML.
 */
export const analyzeImageForInsertion = async (
  imageDataUrl: string,
  currentHtml: string
): Promise<ImageAnalysisResult> => {
  const { mimeType, base64Data } = parseDataUrl(imageDataUrl);
  const htmlStructure = extractStructureSummary(currentHtml);
  const prompt = PROMPTS.IMAGE_ANALYSIS(htmlStructure);

  try {
    const response = await ai.models.generateContent({
      model: CONFIG.AI.DEFAULT_MODEL,
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            altText: { type: Type.STRING },
            altVariations: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedPositions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  targetSelector: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  code: { type: Type.STRING },
                  action: { type: Type.STRING }
                },
                required: ['targetSelector', 'reason', 'priority', 'code', 'action']
              }
            }
          },
          required: ['description', 'altText', 'altVariations', 'suggestedPositions']
        }
      }
    });
    
    const parsed = JSON.parse(response.text);
    return parsed as ImageAnalysisResult;
    
  } catch (error) {
    console.error('Image analysis error:', error);
    throw new Error('Image analysis failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

/**
 * Replaces the 'PLACEHOLDER' in the code with the actual image data URL.
 */
export const createImageInsertionCode = (
  position: ImagePosition,
  imageDataUrl: string
): string => {
  // Use a regex to replace PLACEHOLDER to handle cases where it might have quotes
  return position.code.replace(/['"]?PLACEHOLDER['"]?/, `"${imageDataUrl}"`);
};
