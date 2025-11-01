// services/geminiService.ts

import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import { AnalysisResult, PagePlan } from '../types';

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


export async function applyBlockFeedback(
  pagePlan: PagePlan,
  blockIndex: number,
  userFeedback: string
): Promise<PagePlan> {
  const targetBlock = pagePlan.blocks[blockIndex];

  const prompt = `
You are an expert product detail page designer. Your task is to modify a single block of a page layout based on user feedback.

# IMPORTANT RULES
1.  You MUST modify ONLY the block at index ${blockIndex}.
2.  Do NOT modify any other blocks.
3.  Do NOT add or remove blocks. The "blocks" array must have the same number of elements.
4.  Preserve the 'id' of the modified block.
5.  Return the COMPLETE, updated pagePlan JSON object. Your entire response must be a single, valid JSON object.

# FULL PAGE LAYOUT (JSON)
\`\`\`json
${JSON.stringify(pagePlan, null, 2)}
\`\`\`

# USER-SELECTED BLOCK TO MODIFY
- Index: ${blockIndex}
- Type: ${targetBlock.type}
- Current Content:
\`\`\`json
${JSON.stringify(targetBlock, null, 2)}
\`\`\`

# USER'S REQUEST
"${userFeedback}"

Now, provide the modified full pagePlan as a valid JSON object.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            blocks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  content: {
                    oneOf: [
                      { type: Type.STRING },
                      { type: Type.ARRAY, items: { type: Type.STRING } }
                    ]
                  },
                  level: { type: Type.NUMBER }
                },
                required: ['id', 'type', 'content']
              }
            }
          },
          required: ['title', 'blocks']
        }
      }
    });

    const parsed = JSON.parse(response.text);
    return parsed as PagePlan;

  } catch (error) {
    console.error('Gemini Block Feedback Error:', error);
    throw new Error('AI block modification failed: ' + (error instanceof Error ? error.message : 'An unknown error occurred'));
  }
}