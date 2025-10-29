// services/htmlApplier.ts
import { Suggestion, ApplyResult } from '../types';
import DOMPurify from 'dompurify';

/**
 * Converts an HTML code string into a DOM Element.
 * @param code The HTML string.
 * @returns An Element node.
 */
const createElementFromCode = (code: string): Element => {
  const temp = document.createElement('div');
  // Sanitize the code before inserting it into the temporary element
  temp.innerHTML = DOMPurify.sanitize(code.trim());
  
  // Return the first child element, or the wrapper div if there's no single root element
  return temp.firstElementChild || temp;
};


/**
 * A fallback function to find an element based on a position description string.
 * This is used when a specific targetSelector is not provided.
 * @param doc The Document object to search within.
 * @param position A descriptive string like "after the first image".
 * @returns The found Element or null.
 */
const findElementByPosition = (
  doc: Document,
  position: string
): Element | null => {
  const lower = position.toLowerCase();

  if (lower.includes('h1') || lower.includes('title')) {
    return doc.querySelector('h1');
  }
  if (lower.includes('first') && lower.includes('image')) {
    return doc.querySelector('img');
  }
  if (lower.includes('last')) {
    const all = doc.querySelectorAll('body *');
    return all.length > 0 ? all[all.length - 1] : doc.body;
  }
  
  // Default fallback to the body
  return doc.body;
};


/**
 * Applies a given AI suggestion to the current HTML string.
 * @param currentHtml The original HTML content.
 * @param suggestion The suggestion object to apply.
 * @returns An ApplyResult object with the outcome.
 */
export const applySuggestion = (
  currentHtml: string,
  suggestion: Suggestion
): ApplyResult => {
  try {
    // Use DOMParser to create a document from the HTML string
    const parser = new DOMParser();
    const doc = parser.parseFromString(currentHtml, 'text/html');

    // Find the target element using the selector or position description
    let targetElement: Element | null = null;
    if (suggestion.targetSelector) {
      targetElement = doc.querySelector(suggestion.targetSelector);
    } else if (suggestion.position) {
      targetElement = findElementByPosition(doc, suggestion.position);
    }
    
    // If no target is found, it's an error
    if (!targetElement) {
        // A special case for inserting at the very beginning of the body
        if(suggestion.action === 'insert_before' && suggestion.targetSelector === 'body > *:first-child') {
            targetElement = doc.body.firstElementChild || doc.body;
        } else {
            throw new Error(`Target element could not be found with selector: "${suggestion.targetSelector || suggestion.position}"`);
        }
    }

    const newElement = createElementFromCode(suggestion.code || '');

    // Perform the specified action
    switch (suggestion.action) {
      case 'replace':
        targetElement.replaceWith(newElement);
        break;
      case 'insert_before':
        targetElement.parentElement?.insertBefore(newElement, targetElement);
        break;
      case 'insert_after':
        targetElement.parentElement?.insertBefore(newElement, targetElement.nextSibling);
        break;
      case 'wrap':
        const parent = targetElement.parentElement;
        if (parent) {
          parent.insertBefore(newElement, targetElement);
          newElement.appendChild(targetElement);
        }
        break;
      default:
        throw new Error(`Unknown action: ${suggestion.action}`);
    }

    // Serialize the document body back to an HTML string
    // We get the full document HTML to preserve head content
    const newHtml = doc.documentElement.outerHTML;
    
    return {
      success: true,
      newHtml: newHtml,
    };
  } catch (error) {
    console.error('Failed to apply suggestion:', error);
    return {
      success: false,
      newHtml: currentHtml,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
};
