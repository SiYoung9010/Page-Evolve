// services/geminiService.ts

import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import { AnalysisResult } from '../types';
import { PROMPTS, SYSTEM_INSTRUCTIONS } from '../config/prompts';
import { CONFIG } from '../config/constants';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

export const analyzeHtml = async (html: string): Promise<AnalysisResult> => {
  const prompt = PROMPTS.HTML_ANALYSIS(html);

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

/**
 * Applies user feedback to the given HTML using an AI model.
 * @param currentHtml The current HTML content.
 * @param userFeedback The user's requested changes in natural language.
 * @param context Optional context for better AI responses
 * @returns The complete, updated HTML string.
 */
export const applyFeedbackToHtml = async (
    currentHtml: string,
    userFeedback: string,
    context?: {
        previousChanges?: string[];
        pageGoal?: string;
    }
): Promise<string> => {
    const prompt = PROMPTS.USER_FEEDBACK_ENHANCED(currentHtml, userFeedback, context);

    try {
        const response = await ai.models.generateContent({
            model: CONFIG.AI.DEFAULT_MODEL,
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTIONS.HTML_MODIFIER,
                temperature: CONFIG.AI.TEMPERATURE,
            }
        });

        let modifiedHtml = response.text.trim();

        // Remove markdown fences if the model accidentally adds them
        if (modifiedHtml.startsWith('```html')) {
            modifiedHtml = modifiedHtml.replace(/^```html\n|```$/g, '').trim();
        }
        if (modifiedHtml.startsWith('```')) {
             modifiedHtml = modifiedHtml.replace(/^```\n|```$/g, '').trim();
        }

        return modifiedHtml;
    } catch (error) {
        console.error('Gemini API Error (applyFeedbackToHtml):', error);
        throw new Error('AI failed to apply feedback: ' + (error instanceof Error ? error.message : 'An unknown error occurred'));
    }
};

/**
 * Generates feedback suggestions based on vague user input
 */
export const generateFeedbackSuggestions = async (
    vagueFeedback: string,
    currentHtml: string
): Promise<string[]> => {
    const prompt = PROMPTS.FEEDBACK_IMPROVEMENT_SUGGESTION(vagueFeedback, currentHtml);

    try {
        const response = await ai.models.generateContent({
            model: CONFIG.AI.DEFAULT_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    feedback: { type: Type.STRING },
                                    changes: { type: Type.STRING },
                                    benefit: { type: Type.STRING },
                                },
                                required: ['feedback', 'changes', 'benefit'],
                            },
                        },
                    },
                    required: ['suggestions'],
                },
            }
        });

        const parsed = JSON.parse(response.text);
        return parsed.suggestions.map((s: any) => s.feedback);
    } catch (error) {
        console.error('Gemini API Error (generateFeedbackSuggestions):', error);
        return [];
    }
};
