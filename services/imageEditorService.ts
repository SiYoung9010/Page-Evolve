import { GoogleGenAI, Modality, Type } from "@google/genai";

// Use the same AI instance as the main app
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export interface DetectedObject {
  label: string;
  boundingBox: {
    x_min: number;
    y_min: number;
    x_max: number;
    y_max: number;
  };
}

const objectDetectionSchema = {
  type: Type.OBJECT,
  properties: {
    objects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: {
            type: Type.STRING,
            description: "A short, descriptive label for the detected object, e.g., 'cat', 'red car'."
          },
          boundingBox: {
            type: Type.OBJECT,
            description: "The bounding box coordinates of the object, normalized from 0 to 1.",
            properties: {
              x_min: { type: Type.NUMBER, description: "Left-most coordinate." },
              y_min: { type: Type.NUMBER, description: "Top-most coordinate." },
              x_max: { type: Type.NUMBER, description: "Right-most coordinate." },
              y_max: { type: Type.NUMBER, description: "Bottom-most coordinate." }
            },
            required: ["x_min", "y_min", "x_max", "y_max"]
          }
        },
        required: ["label", "boundingBox"]
      }
    }
  },
  required: ["objects"]
};

/**
 * Generates an image from a text prompt.
 * @param prompt The text prompt describing the desired image.
 * @returns A promise that resolves to the base64 encoded string of the generated image.
 */
export const generateImageFromPrompt = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        if (!response.candidates || response.candidates.length === 0) {
            throw new Error("API returned no candidates for image generation.");
        }

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                return part.inlineData.data;
            }
        }

        throw new Error("No image data found in the generation response.");

    } catch (error) {
        console.error("Error generating image with Gemini:", error);
        throw new Error("Failed to generate image. The model may not be able to fulfill this request.");
    }
};


/**
 * Edits an image using a text prompt with the Gemini API.
 * @param base64ImageData The base64 encoded image data, without the 'data:image/...' prefix.
 * @param mimeType The MIME type of the image (e.g., 'image/jpeg').
 * @param prompt The text prompt describing the desired edit.
 * @returns A promise that resolves to the base64 encoded string of the edited image.
 */
export const editImage = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });

    // The response should contain at least one candidate with content parts.
    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("API returned no candidates.");
    }

    const candidate = response.candidates[0];

    // Find the image part in the response
    for (const part of candidate.content.parts) {
      if (part.inlineData && part.inlineData.data) {
        return part.inlineData.data;
      }
    }

    throw new Error("No image data found in the API response.");

  } catch (error) {
    console.error("Error editing image with Gemini:", error);
    // Re-throw a more user-friendly error message.
    throw new Error("Failed to edit image. The model may not be able to fulfill this request. Please try a different prompt or image.");
  }
};

/**
 * Detects text in an image using the Gemini API.
 * @param base64ImageData The base64 encoded image data.
 * @param mimeType The MIME type of the image.
 * @returns A promise that resolves to an array of detected text objects.
 */
export const detectText = async (
  base64ImageData: string,
  mimeType: string
): Promise<DetectedObject[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: "Identify all text elements in the image. For each piece of text, provide a label (the text itself) and a precise bounding box. Ignore text that is too small or illegible.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: objectDetectionSchema,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
      console.warn("API returned an empty response for text detection.");
      return [];
    }

    const result = JSON.parse(jsonText);
    return result.objects || [];
  } catch (error) {
    console.error("Error detecting text with Gemini:", error);
    throw new Error("Failed to detect text in the image. The model may not have been able to identify any.");
  }
};

/**
 * Detects objects in an image using the Gemini API.
 * @param base64ImageData The base64 encoded image data.
 * @param mimeType The MIME type of the image.
 * @returns A promise that resolves to an array of detected objects.
 */
export const detectObjects = async (
  base64ImageData: string,
  mimeType: string
): Promise<DetectedObject[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: "Identify all distinct objects in the image and provide their labels and bounding boxes. Be as precise as possible.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: objectDetectionSchema,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
      console.warn("API returned an empty response for object detection.");
      return [];
    }

    const result = JSON.parse(jsonText);
    return result.objects || [];
  } catch (error) {
    console.error("Error detecting objects with Gemini:", error);
    throw new Error("Failed to detect objects in the image. The model may not have been able to identify any distinct items.");
  }
};

/**
 * Generates a product staging shot using AI.
 * Combines a product image with mood reference (image or text) to create a styled product photo.
 *
 * @param productBase64 The base64 encoded product image (cutout/no background recommended)
 * @param productMimeType The MIME type of the product image
 * @param moodReference Either a text description or an object with mood image data
 * @param aspectRatio Optional aspect ratio specifications (width, height, platform)
 * @returns A promise that resolves to the base64 encoded string of the staged product image
 */
export const generateProductStaging = async (
  productBase64: string,
  productMimeType: string,
  moodReference: string | { base64: string; mimeType: string },
  aspectRatio?: { width: number; height: number; ratio: string; platform: string }
): Promise<string> => {
  try {
    let parts: any[];
    let prompt: string;

    const aspectRatioInstruction = aspectRatio
      ? `\n- IMPORTANT: Generate image in ${aspectRatio.ratio} aspect ratio (${aspectRatio.width}x${aspectRatio.height}px) optimized for ${aspectRatio.platform}`
      : '';

    if (typeof moodReference === 'string') {
      // Text-based mood description
      prompt = `Create a professional product staging photo with the following mood and style: ${moodReference}

Instructions:
- Place the product in a beautiful, photorealistic scene that matches the described mood
- Ensure proper lighting, shadows, and perspective
- The product should be the main focus
- Create a high-quality, e-commerce ready image
- Use complementary colors and professional composition${aspectRatioInstruction}`;

      parts = [
        {
          inlineData: {
            data: productBase64,
            mimeType: productMimeType,
          },
        },
        {
          text: prompt,
        },
      ];
    } else {
      // Image-based mood reference
      prompt = `Create a professional product staging photo using the style and mood from the first reference image.

Instructions:
- Analyze the mood, lighting, color palette, and composition of the reference image
- Create a scene for the product that matches this aesthetic
- Place the product naturally in a similar environment
- Maintain the same lighting quality and color tone
- Ensure the product is the main focus while harmonizing with the reference style
- Create a high-quality, photorealistic, e-commerce ready image${aspectRatioInstruction}`;

      parts = [
        {
          inlineData: {
            data: moodReference.base64,
            mimeType: moodReference.mimeType,
          },
        },
        {
          inlineData: {
            data: productBase64,
            mimeType: productMimeType,
          },
        },
        {
          text: prompt,
        },
      ];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts,
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("API returned no candidates for product staging.");
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        return part.inlineData.data;
      }
    }

    throw new Error("No image data found in the staging response.");

  } catch (error) {
    console.error("Error generating product staging with Gemini:", error);
    throw new Error("Failed to generate product staging. Please try a different product image or mood reference.");
  }
};

/**
 * Generates multiple variations of product staging for A/B testing.
 * Creates 3 different styles from the same product and mood reference.
 *
 * @param productBase64 The base64 encoded product image
 * @param productMimeType The MIME type of the product image
 * @param moodReference Either a text description or an object with mood image data
 * @param aspectRatio Optional aspect ratio specifications (width, height, platform)
 * @returns A promise that resolves to an array of 3 base64 encoded staged images
 */
export const generateABTestVariations = async (
  productBase64: string,
  productMimeType: string,
  moodReference: string | { base64: string; mimeType: string },
  aspectRatio?: { width: number; height: number; ratio: string; platform: string }
): Promise<string[]> => {
  const variations = ['light and airy', 'dramatic and moody', 'balanced and neutral'];

  const aspectRatioInstruction = aspectRatio
    ? `\n- IMPORTANT: Generate image in ${aspectRatio.ratio} aspect ratio (${aspectRatio.width}x${aspectRatio.height}px) optimized for ${aspectRatio.platform}`
    : '';

  const promises = variations.map(async (variation, index) => {
    try {
      let parts: any[];
      let prompt: string;

      if (typeof moodReference === 'string') {
        prompt = `Create a professional product staging photo (Variation ${index + 1}: ${variation} style) with the following mood: ${moodReference}

Instructions:
- Style: ${variation} interpretation of the mood
- Place the product in a photorealistic scene
- Ensure proper lighting, shadows, and perspective
- The product should be the main focus
- Create a high-quality, e-commerce ready image${aspectRatioInstruction}`;

        parts = [
          { inlineData: { data: productBase64, mimeType: productMimeType } },
          { text: prompt },
        ];
      } else {
        prompt = `Create a professional product staging photo (Variation ${index + 1}: ${variation} style) using the reference image mood.

Instructions:
- Style: ${variation} interpretation
- Analyze and match the reference mood with a ${variation} twist
- Create a scene for the product
- Maintain professional e-commerce quality${aspectRatioInstruction}`;

        parts = [
          { inlineData: { data: moodReference.base64, mimeType: moodReference.mimeType } },
          { inlineData: { data: productBase64, mimeType: productMimeType } },
          { text: prompt },
        ];
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: { responseModalities: [Modality.IMAGE] },
      });

      if (!response.candidates || response.candidates.length === 0) {
        throw new Error(`Failed to generate variation ${index + 1}`);
      }

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return part.inlineData.data;
        }
      }

      throw new Error(`No image data in variation ${index + 1}`);
    } catch (error) {
      console.error(`Error generating variation ${index + 1}:`, error);
      throw error;
    }
  });

  return Promise.all(promises);
};

/**
 * Removes the background from an image automatically.
 *
 * @param base64ImageData The base64 encoded image data
 * @param mimeType The MIME type of the image
 * @returns A promise that resolves to the base64 encoded image with transparent background
 */
export const removeBackground = async (
  base64ImageData: string,
  mimeType: string
): Promise<string> => {
  try {
    const prompt = `Remove the background completely from this image. Keep only the main subject/product with a transparent background. Ensure clean edges and no background remnants.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64ImageData, mimeType: mimeType } },
          { text: prompt },
        ],
      },
      config: { responseModalities: [Modality.IMAGE] },
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("API returned no candidates for background removal.");
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        return part.inlineData.data;
      }
    }

    throw new Error("No image data found in background removal response.");
  } catch (error) {
    console.error("Error removing background with Gemini:", error);
    throw new Error("Failed to remove background. Please try a different image.");
  }
};

/**
 * Adds a watermark or logo to an image.
 *
 * @param base64ImageData The base64 encoded image data
 * @param mimeType The MIME type of the image
 * @param logoBase64 The base64 encoded logo/watermark image
 * @param logoMimeType The MIME type of the logo
 * @param position Position of the watermark: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center'
 * @returns A promise that resolves to the base64 encoded image with watermark
 */
export const addWatermark = async (
  base64ImageData: string,
  mimeType: string,
  logoBase64: string,
  logoMimeType: string,
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center' = 'bottom-right'
): Promise<string> => {
  try {
    const positionInstructions = {
      'bottom-right': 'Place the logo in the bottom-right corner with small padding',
      'bottom-left': 'Place the logo in the bottom-left corner with small padding',
      'top-right': 'Place the logo in the top-right corner with small padding',
      'top-left': 'Place the logo in the top-left corner with small padding',
      'center': 'Place the logo in the center of the image as a subtle watermark',
    };

    const prompt = `Add this logo/watermark to the main image. ${positionInstructions[position]}. The logo should be subtle and professional, not overpowering the main image. Adjust opacity if needed to maintain image quality. Keep the logo proportionally sized (about 10-15% of image width).`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64ImageData, mimeType: mimeType } },
          { inlineData: { data: logoBase64, mimeType: logoMimeType } },
          { text: prompt },
        ],
      },
      config: { responseModalities: [Modality.IMAGE] },
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("API returned no candidates for watermark addition.");
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        return part.inlineData.data;
      }
    }

    throw new Error("No image data found in watermark response.");
  } catch (error) {
    console.error("Error adding watermark with Gemini:", error);
    throw new Error("Failed to add watermark. Please try again.");
  }
};
