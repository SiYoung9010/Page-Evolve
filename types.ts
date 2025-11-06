// types.ts

// ApplyResult for htmlApplier service.
export interface ApplyResult {
  success: boolean;
  newHtml: string;
  error?: string;
}

// HtmlHistory for useHtmlHistory hook.
export interface HtmlHistory {
  id: string;
  html: string;
  timestamp: Date;
  action: string;
  suggestionId?: string;
}

export interface Suggestion {
  id: string;
  type: 'image' | 'text' | 'seo' | 'structure';
  priority: 'high' | 'medium' | 'low';
  message: string;
  code?: string; // HTML code to apply
  position?: string; // Description of insertion point
  
  targetSelector?: string; // CSS selector for the target element
  // FIX: Added 'add_block' to support adding new content blocks in PagePlan mode.
  action: 'replace' | 'insert_before' | 'insert_after' | 'wrap' | 'add_block';
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

// ========== Sprint 4: SEO Types ==========

export interface SeoAnalysis {
  score: number; // 0-100
  breakdown: SeoScoreBreakdown;
  issues: SeoIssue[];
  suggestions: SeoSuggestion[];
  keywords: KeywordAnalysis[];
}

export interface SeoScoreBreakdown {
  title: number; // 0-20
  metaDescription: number; // 0-15
  headingStructure: number; // 0-20
  imageAlt: number; // 0-15
  keywordDensity: number; // 0-15
  contentLength: number; // 0-15
}

export interface SeoIssue {
  type: 'critical' | 'warning' | 'info';
  category: 'title' | 'meta' | 'heading' | 'image' | 'keyword' | 'content';
  message: string;
  fixCode?: string; // Code to fix the issue
}

export interface SeoSuggestion {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: 'title' | 'meta' | 'heading' | 'keyword';
  message: string;
  beforeCode?: string;
  afterCode: string;
}

export interface KeywordAnalysis {
  keyword: string;
  count: number;
  density: number; // 0-100 (percentage)
  isOptimal: boolean;
}

export interface HeadingStructure {
  level: number; // 1-6
  text: string;
  index: number;
  hasIssue: boolean;
  issueType?: 'duplicate_h1' | 'skipped_level' | 'too_long';
}

// ========== Sprint 5: Project Management ==========

export interface ProjectData {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  
  // 현재 상태
  html: string; // The primary source of truth
  suggestions: Suggestion[];
  images: Omit<UploadedImage, 'file'>[]; // File 객체 제외
  seoAnalysis: SeoAnalysis | null;
  
  // 히스토리
  history: HtmlHistory[];
  historyIndex: number;
  
  // 메타데이터
  tags: string[]; // ['세럼', '보습', '고가']
  notes: string; // 사용자 메모
}

export interface ProjectMetadata {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  thumbnail?: string; // Base64 썸네일
}

// ========== Sprint 5: Reference Library ==========
export interface Reference {
  id: string;
  title: string;
  category: string; // '보습', '세럼', '클렌징' 등
  tags: string[];
  content: string; // HTML 또는 마크다운
  notes: string;
  createdAt: Date;
  isFavorite: boolean;
}

// FIX: Added missing types for the Page Planning feature.
// ========== Sprint 6: Page Planning (JSON-based editor) ==========

export interface Block {
  id: string;
  type: 'heading' | 'text' | 'image' | 'list';
  content: string | string[];
  level?: 1 | 2 | 3 | 4 | 5 | 6; // For headings
}

export interface PagePlan {
  title: string;
  blocks: Block[];
}

export interface PagePlanHistoryEntry {
  id: string;
  plan: PagePlan;
  timestamp: Date;
  action: string;
  suggestionId?: string;
}
