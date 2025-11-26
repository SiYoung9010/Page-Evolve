export interface ImageTokenMapping {
  token: string;
  originalSrc: string;
}

/**
 * Service to handle image tokenization for AI prompts.
 * Replaces large Base64 image data with short tokens to prevent context window overflow.
 */
export const ImageOptimizer = {
  /**
   * Replaces all image sources in the HTML with tokens (e.g., {{IMG_1}}).
   * Returns the optimized HTML and a mapping of tokens to original sources.
   */
  tokenizeImages: (html: string): { optimizedHtml: string; mapping: Map<string, string> } => {
    const mapping = new Map<string, string>();
    let imgCounter = 1;

    // Regex to find img tags and capture the src attribute
    // This handles both single and double quotes
    const optimizedHtml = html.replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/g, (match, src) => {
      // Skip if it's already a short URL (e.g. placeholder or external URL)
      // We primarily want to target data:image URIs which are huge
      if (!src.startsWith('data:image')) {
        return match;
      }

      const token = `{{IMG_${imgCounter++}}}`;
      mapping.set(token, src);
      
      // Replace the src in the tag with the token
      return match.replace(src, token);
    });

    return { optimizedHtml, mapping };
  },

  /**
   * Restores the original image sources from the tokens.
   */
  restoreImages: (html: string, mapping: Map<string, string>): string => {
    let restoredHtml = html;

    mapping.forEach((originalSrc, token) => {
      // Global replace in case the AI moved the image or duplicated it
      // Escaping the token for regex usage
      const escapedToken = token.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(escapedToken, 'g');
      restoredHtml = restoredHtml.replace(regex, originalSrc);
    });

    return restoredHtml;
  },

  /**
   * Prepares HTML for the AI prompt by removing scripts, styles, and tokenizing images.
   * This ensures the AI focuses on structure and content, not heavy data.
   */
  optimizeForGemini: (html: string): { optimizedHtml: string; mapping: Map<string, string> } => {
    // First, tokenize images
    const { optimizedHtml, mapping } = ImageOptimizer.tokenizeImages(html);

    // Optional: We could also strip scripts or styles here if needed to further save tokens,
    // but for now, just image tokenization is the critical fix.
    
    return { optimizedHtml, mapping };
  }
};
