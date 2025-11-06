import { PagePlan, Suggestion } from '../types';
import DOMPurify from 'dompurify';

interface ApplyResult {
  success: boolean;
  newPagePlan: PagePlan;
  error?: string;
}

const findBlockIndexFromSelector = (html: string, selector: string): number => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const targetElement = doc.querySelector(selector);
    if (!targetElement) return -1;
    
    const blockElement = targetElement.closest('[data-block-index]');
    if (blockElement) {
      const index = blockElement.getAttribute('data-block-index');
      return index ? parseInt(index, 10) : -1;
    }
    return -1;
  } catch (e) {
    return -1;
  }
};

const htmlToBlock = (htmlCode: string): {type: 'heading' | 'text' | 'image' | 'list', content: string | string[], level?: 1 | 2 | 3 | 4 | 5 | 6} => {
    // This is a simplified conversion and might need to be more robust
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = DOMPurify.sanitize(htmlCode);
    const element = tempDiv.firstElementChild;

    if (!element) return { type: 'text', content: htmlCode };
    
    const tagName = element.tagName.toLowerCase();
    if (tagName.startsWith('h')) {
        return { type: 'heading', level: parseInt(tagName[1], 10) as 1|2|3|4|5|6, content: element.textContent || '' };
    }
    if (tagName === 'p') {
        return { type: 'text', content: element.innerHTML };
    }
    if (tagName === 'img') {
        return { type: 'image', content: (element as HTMLImageElement).src || '' };
    }
    if (tagName === 'ul') {
        const items = Array.from(element.querySelectorAll('li')).map(li => li.textContent || '');
        return { type: 'list', content: items };
    }
    return { type: 'text', content: htmlCode };
}


export const applySuggestion = (
  currentPagePlan: PagePlan,
  suggestion: Suggestion,
  currentHtml: string // We need this to resolve selectors
): ApplyResult => {
  try {
    const newPlan = JSON.parse(JSON.stringify(currentPagePlan));
    const blockIndex = findBlockIndexFromSelector(currentHtml, suggestion.targetSelector || '');

    if (blockIndex === -1 && suggestion.action !== 'add_block') {
      throw new Error(`Target element could not be found for selector: "${suggestion.targetSelector}"`);
    }

    const newBlockData = htmlToBlock(suggestion.code || '');
    const newBlock = { id: crypto.randomUUID(), ...newBlockData };

    switch (suggestion.action) {
      case 'replace':
        newPlan.blocks[blockIndex] = { ...newPlan.blocks[blockIndex], ...newBlockData };
        break;
      case 'insert_before':
        newPlan.blocks.splice(blockIndex, 0, newBlock);
        break;
      case 'insert_after':
        newPlan.blocks.splice(blockIndex + 1, 0, newBlock);
        break;
      // 'wrap' is complex with JSON and is omitted for now. It would require block nesting.
      // FIX: Added 'add_block' case to handle adding a new block to the plan.
      case 'add_block':
        newPlan.blocks.push(newBlock);
        break;
      default:
        throw new Error(`Unsupported action for PagePlan: ${suggestion.action}`);
    }

    return {
      success: true,
      newPagePlan: newPlan,
    };
  } catch (error) {
    console.error('Failed to apply suggestion to PagePlan:', error);
    return {
      success: false,
      newPagePlan: currentPagePlan,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
};
