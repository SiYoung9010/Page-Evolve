// services/seoAnalyzer.ts
import { 
  SeoAnalysis, 
  SeoScoreBreakdown, 
  SeoIssue, 
  SeoSuggestion,
  KeywordAnalysis, 
  HeadingStructure 
} from '../types';

/**
 * Extracts heading elements from the document and analyzes their structure.
 */
const extractHeadings = (doc: Document): HeadingStructure[] => {
  const headings: HeadingStructure[] = [];
  const elements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  elements.forEach((el, index) => {
    const level = parseInt(el.tagName[1], 10);
    const text = el.textContent?.trim() || '';
    
    headings.push({
      level,
      text,
      index,
      hasIssue: false,
    });
  });
  
  return headings;
};

/**
 * Extracts and analyzes keywords from the document's text content.
 */
const extractKeywords = (doc: Document): KeywordAnalysis[] => {
  const text = doc.body?.textContent || '';
  
  const words = text
    .toLowerCase()
    .replace(/[^\w가-힣\s]/g, '') // Remove special characters
    .split(/\s+/)
    .filter(w => w.length > 2 && !/^\d+$/.test(w)); // Word length > 2, not just numbers
  
  if (words.length < 10) return [];

  const totalWords = words.length;
  const frequency: { [key: string]: number } = {};
  
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  const sorted = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // Top 10 keywords
  
  return sorted.map(([keyword, count]) => {
    const density = (count / totalWords) * 100;
    const isOptimal = density >= 2 && density <= 3;
    
    return { keyword, count, density, isOptimal };
  });
};

// --- Individual Analyzer Functions ---

const analyzeTitle = (doc: Document): number => {
  const title = doc.querySelector('title')?.textContent?.trim();
  if (!title) return 0;
  const length = title.length;
  if (length < 30) return 10;
  if (length > 60) return 15;
  return 20; // Optimal
};

const analyzeMetaDescription = (doc: Document): number => {
  const meta = doc.querySelector('meta[name="description"]');
  const content = meta?.getAttribute('content')?.trim();
  if (!content) return 0;
  const length = content.length;
  if (length < 120) return 8;
  if (length > 160) return 10;
  return 15; // Optimal
};

const analyzeHeadingStructure = (doc: Document): number => {
  const headings = extractHeadings(doc);
  if (headings.length === 0) return 0;

  let score = 20;
  const h1Count = headings.filter(h => h.level === 1).length;

  if (h1Count === 0) score -= 10;
  if (h1Count > 1) score -= 5;

  headings.forEach((heading, index) => {
    if (index > 0) {
      const prevLevel = headings[index - 1].level;
      if (heading.level - prevLevel > 1) {
        score -= 3; // Penalize for skipping levels (e.g., H1 -> H3)
      }
    }
  });
  
  return Math.max(0, score);
};

const analyzeImageAlt = (doc: Document): number => {
  const images = doc.querySelectorAll('img');
  if (images.length === 0) return 15;
  
  const withAlt = Array.from(images).filter(img => img.getAttribute('alt')?.trim()).length;
  const ratio = withAlt / images.length;
  return Math.round(ratio * 15);
};

const analyzeKeywordDensity = (doc: Document): number => {
  const keywords = extractKeywords(doc);
  if (keywords.length === 0) return 5;
  
  const optimalKeywords = keywords.filter(k => k.isOptimal);
  if (optimalKeywords.length >= 3) return 15;
  if (optimalKeywords.length > 0) return 12;
  return 8;
};

const analyzeContentLength = (doc: Document): number => {
  const text = doc.body?.textContent || '';
  const wordCount = text.trim().split(/\s+/).length;
  
  if (wordCount < 100) return 5;
  if (wordCount < 300) return 10;
  if (wordCount > 2000) return 12;
  return 15; // Optimal
};

/**
 * Collects a list of SEO issues based on the analysis breakdown.
 */
const collectIssues = (doc: Document, breakdown: SeoScoreBreakdown): SeoIssue[] => {
  const issues: SeoIssue[] = [];
  
  if (breakdown.title === 0) issues.push({ type: 'critical', category: 'title', message: '<title> tag is missing.' });
  else if (breakdown.title < 20) issues.push({ type: 'warning', category: 'title', message: 'Title length is suboptimal. Aim for 30-60 characters.' });

  if (breakdown.metaDescription === 0) issues.push({ type: 'critical', category: 'meta', message: 'Meta description is missing.', fixCode: '<meta name="description" content="...">'});
  
  const h1Count = doc.querySelectorAll('h1').length;
  if (h1Count === 0) issues.push({ type: 'critical', category: 'heading', message: 'The page is missing an H1 tag.' });
  else if (h1Count > 1) issues.push({ type: 'warning', category: 'heading', message: `Found ${h1Count} H1 tags. There should only be one.` });
  
  const images = doc.querySelectorAll('img');
  const imagesWithoutAlt = Array.from(images).filter(img => !img.getAttribute('alt')?.trim()).length;
  if (imagesWithoutAlt > 0) issues.push({ type: 'warning', category: 'image', message: `${imagesWithoutAlt} out of ${images.length} images are missing alt attributes.` });
  
  return issues;
};

/**
 * Generates simple, rule-based SEO suggestions.
 */
const generateSuggestions = (doc: Document, breakdown: SeoScoreBreakdown, keywords: KeywordAnalysis[]): SeoSuggestion[] => {
    const suggestions: SeoSuggestion[] = [];
  
    if (breakdown.title < 20) {
        const currentTitle = doc.querySelector('title')?.outerHTML || '<head>\n  ...\n</head>';
        const newTitleText = `${keywords[0]?.keyword || 'Product Name'} - Key Benefit | Brand Name`;
        suggestions.push({
            id: crypto.randomUUID(),
            priority: 'high',
            category: 'title',
            message: `Optimize the title tag to be between 30-60 characters and include primary keywords.`,
            beforeCode: currentTitle,
            afterCode: `<title>${newTitleText}</title>`,
        });
    }

    if (breakdown.metaDescription < 15) {
        const currentMeta = doc.querySelector('meta[name="description"]')?.outerHTML;
        suggestions.push({
            id: crypto.randomUUID(),
            priority: 'high',
            category: 'meta',
            message: `Add or optimize the meta description to be between 120-160 characters.`,
            beforeCode: currentMeta || '<head>\n  ...\n</head>',
            afterCode: `<meta name="description" content="A compelling description of the product, including the main keyword: ${keywords[0]?.keyword || 'keyword'}.">`,
        });
    }

    return suggestions;
};

/**
 * Main function to analyze the HTML for SEO and return a comprehensive report.
 */
export const analyzeSeo = (html: string): SeoAnalysis => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const breakdown: SeoScoreBreakdown = {
    title: analyzeTitle(doc),
    metaDescription: analyzeMetaDescription(doc),
    headingStructure: analyzeHeadingStructure(doc),
    imageAlt: analyzeImageAlt(doc),
    keywordDensity: analyzeKeywordDensity(doc),
    contentLength: analyzeContentLength(doc),
  };
  
  const score = Math.round(Object.values(breakdown).reduce((sum, val) => sum + val, 0));
  const issues = collectIssues(doc, breakdown);
  const keywords = extractKeywords(doc);
  const suggestions = generateSuggestions(doc, breakdown, keywords);
  
  return { score, breakdown, issues, suggestions, keywords };
};