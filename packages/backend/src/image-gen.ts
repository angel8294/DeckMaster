import dotenv from 'dotenv';
import { GoogleGenAI, PersonGeneration } from '@google/genai';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey });

export async function generateImageBase64(prompt: string): Promise<string | null> {
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not set — skipping image generation.');
    return null;
  }

  try {
    const response = await ai.models.generateImages({
      model: 'models/imagen-4.0-generate-001',
      prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        personGeneration: PersonGeneration.ALLOW_ALL,
        aspectRatio: '1:1',
        imageSize: '1K',
      },
    });

    if (!response?.generatedImages || response.generatedImages.length === 0) return null;

    const imageBytes = response.generatedImages[0]?.image?.imageBytes;
    if (!imageBytes) return null;

    return imageBytes; // base64 string
  } catch (err) {
    console.error('Error generating image:', err);
    return null;
  }
}
