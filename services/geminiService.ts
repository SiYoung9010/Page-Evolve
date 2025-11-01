// services/geminiService.ts

import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import { AnalysisResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeHtml = async (html: string): Promise<AnalysisResult> => {
  const prompt = `
You are an expert marketing and web development consultant. Analyze the following product detail page HTML and provide suggestions for improvement based on the provided JSON schema.

HTML Code:
\`\`\`html
${html}
\`\`\`

Analysis Rules:
- Provide a maximum of 5 suggestions.
- Include 1-2 'high' priority suggestions.
- The 'message' should be concrete and explain the reasoning.
- The 'code' should be a valid HTML snippet.
- The 'targetSelector' should be a specific and valid CSS selector.
- The 'action' must be one of: 'replace', 'insert_before', 'insert_after', 'wrap'.
- Example: "❌ Add image" -> "✅ Add a before-and-after comparison image to build trust and potentially increase conversion rates by 15%."
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    structure: {
                        type: Type.OBJECT,
                        properties: {
                            sections: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of detected section names" },
                            imageCount: { type: Type.NUMBER, description: "Number of images" },
                            textLength: { type: Type.NUMBER, description: "Length of text content" },
                            hasH1: { type: Type.BOOLEAN, description: "Boolean indicating if an H1 tag exists" },
                        },
                        required: ['sections', 'imageCount', 'textLength', 'hasH1'],
                    },
                    suggestions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING, description: "Can be 'image', 'text', 'seo', or 'structure'" },
                                priority: { type: Type.STRING, description: "Can be 'high', 'medium', or 'low'" },
                                message: { type: Type.STRING, description: "A specific, actionable suggestion for improvement." },
                                position: { type: Type.STRING, description: "Optional: A description of where to insert/modify." },
                                code: { type: Type.STRING, description: "The actual HTML code snippet to apply." },
                                targetSelector: { type: Type.STRING, description: "A CSS selector for the target element." },
                                action: { type: Type.STRING, description: "The action to perform: 'replace', 'insert_before', 'insert_after', or 'wrap'." },
                            },
                            required: ['type', 'priority', 'message', 'code', 'targetSelector', 'action'],
                        },
                    },
                    seoScore: { type: Type.NUMBER, description: "A score between 0 and 100" },
                },
                required: ['structure', 'suggestions', 'seoScore'],
            },
        }
    });
    
    const text = response.text;
    const parsed = JSON.parse(text);
    return parsed as AnalysisResult;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('AI analysis failed: ' + (error instanceof Error ? error.message : 'An unknown error occurred'));
  }
};

export const modifyHtmlBlock = async (
  fullHtml: string,
  targetSelector: string,
  userFeedback: string
): Promise<{ newHtml: string }> => {
  const prompt = `
You are an expert web developer tasked with modifying a single HTML element on a page based on user feedback.

**Rules:**
1.  Analyze the user's request and the provided HTML context.
2.  Modify ONLY the element targeted by the CSS selector: \`${targetSelector}\`.
3.  Return a JSON object containing the new outerHTML for the modified element(s).
4.  Do NOT return the full HTML page, only the modified element's code.
5.  If the request involves adding an element (e.g., "add a button below this"), return the original element's HTML followed by the new element's HTML.
6.  Ensure the returned HTML is valid and well-formed.

**User Feedback:**
"${userFeedback}"

**Full Page HTML for context:**
\`\`\`html
${fullHtml}
\`\`\`

Now, provide the new HTML for the element identified by the selector \`${targetSelector}\`.
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            newHtml: {
              type: Type.STRING,
              description: "The new outerHTML of the modified element."
            }
          },
          required: ['newHtml']
        }
      }
    });
    const parsed = JSON.parse(response.text);
    return parsed as { newHtml: string };

  } catch (error) {
    console.error('Gemini Block Modification Error:', error);
    throw new Error('AI block modification failed: ' + (error instanceof Error ? error.message : 'An unknown error occurred'));
  }
};
