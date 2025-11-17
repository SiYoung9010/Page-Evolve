/**
 * Converts a File object to a base64 encoded string.
 * @param file The File object to convert.
 * @returns A promise that resolves with the base64 data URL.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Extracts base64 data and mime type from a data URL.
 * @param dataUrl The data URL (e.g., "data:image/png;base64,...")
 * @returns Object containing base64 data and mime type
 */
export const parseDataUrl = (dataUrl: string): { base64: string; mimeType: string } => {
  const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid data URL format');
  }
  return {
    mimeType: matches[1],
    base64: matches[2],
  };
};
