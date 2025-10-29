// types.ts

export interface Suggestion {
  id: string;
  type: 'image' | 'text' | 'seo' | 'structure';
  priority: 'high' | 'medium' | 'low';
  message: string;
  code?: string; // HTML code to apply
  position?: string; // Description of insertion point
  
  // Sprint 2 Fields
  targetSelector?: string; // CSS selector for the target element
  action: 'replace' | 'insert_before' | 'insert_after' | 'wrap';
  applied: boolean; // Whether the suggestion has been applied
  appliedAt?: Date; // Timestamp of application
}

export interface AnalysisResult {
  structure: {
    sections: string[];
    imageCount: number;
    textLength: number;
    hasH1: boolean;
  };
  suggestions: Omit<Suggestion, 'id' | 'applied' | 'appliedAt'>[]; // AI returns this shape
  seoScore: number;
}

// For history management
export interface HtmlHistory {
  id: string;
  html: string;
  timestamp: Date;
  action: string; // e.g., "AI Suggestion: Add image"
  suggestionId?: string; // ID of the applied suggestion
}

// For the result of applying a suggestion
export interface ApplyResult {
  success: boolean;
  newHtml: string;
  error?: string;
}

// ========== Sprint 3: Image Types ==========

export interface UploadedImage {
  id: string;
  file: File;
  dataUrl: string; // Base64 data URL (data:image/png;base64,...)
  fileName: string;
  mimeType: string;
  width: number;
  height: number;
  sizeInBytes: number;
  uploadedAt: Date;
  
  // AI generated info
  altText?: string;
  description?: string;
  suggestedPositions?: ImagePosition[];
}

export interface ImagePosition {
  targetSelector: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  code: string; // <img> tag template
  action: 'replace' | 'insert_before' | 'insert_after';
}

export interface ImageAnalysisResult {
  description: string;
  altText: string;
  altVariations: string[]; // Alternative alt texts
  suggestedPositions: ImagePosition[];
}
