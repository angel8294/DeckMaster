import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { generateImageBase64 } from './image-gen';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
let genAI: any = null;
let model: any = null;
if (API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel ? genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }) : null;
  } catch (e) {
    console.warn('Could not initialize GoogleGenerativeAI client, will use fallback mock.');
    genAI = null;
    model = null;
  }
}

const getSystemPrompt = () => {
  return `Eres un generador experto de presentaciones. Produces una estructura clara, con título, 3–5 bullets por diapositiva, notas para el orador de 2–4 frases, y sugerencia de imagen (descripcion corta). Mantén el lenguaje indicado, evita jergas y no excedas 60 palabras por slide. Entrega la salida en JSON estricto con claves: slides[] donde cada slide tiene title, bullets[], notes, image_prompt, layout_hint. No incluyas ningun caracter antes o despues del JSON.`;
};

const getUserPrompt = (
  title: string,
  audience: string,
  slides: number,
  style: string,
  language: string
) => {
  return `Genera ${slides} diapositivas para el título: "${title}" para un público de ${audience}. Estilo: ${style}. Lenguaje: ${language}. Incluir una diapositiva con métricas (usa valores ficticios). Entregar en JSON.`;
};

const mockPresentation = (title: string, slidesCount: number) => {
  const slides = [] as any[];
  slides.push({
    title: title || 'Portada',
    bullets: [title || 'Proyecto', 'Resumen ejecutivo', 'Equipo fundador'],
    notes: 'Breve introducción: nombre, misión y objetivo de la reunión.',
    image_prompt: 'imagen de portada limpia y profesional',
    layout_hint: 'center-title',
  });

  for (let i = 1; i < slidesCount; i++) {
    slides.push({
      title: `Diapositiva ${i + 1}`,
      bullets: [
        `Punto clave ${i}.1`,
        `Punto clave ${i}.2`,
        `Punto clave ${i}.3`,
      ],
      notes: `Notas del orador para la diapositiva ${i + 1}`,
      image_prompt: `imagen sugerida para la diapositiva ${i + 1}`,
      layout_hint: 'text-left',
    });
  }

  // Add a metrics slide at the end if space
  slides.push({
    title: 'Métricas clave',
    bullets: ['Usuarios activos: 12,400 (+18% vs Q2)', 'Retención 30 días: 42%', 'ARPU: $3.40'],
    notes: 'Destacar crecimiento y explicar brevemente qué impulsó la retención.',
    image_prompt: 'tarjeta con KPI y un pequeño ícono de flecha hacia arriba',
    layout_hint: 'data-heavy',
  });

  return { slides };
};

export const generatePresentationContent = async (
  title: string,
  audience: string,
  slides: number,
  style: string,
  language: string
): Promise<any> => {
  // If API key is not configured, return mock for local dev
  if (!genAI || !model) {
    console.info('GEMINI_API_KEY not configured or client failed to initialize — returning mock presentation for local development.');
    return mockPresentation(title, slides);
  }

  const systemPrompt = getSystemPrompt();
  const userPrompt = getUserPrompt(title, audience, slides, style, language);

  try {
    // Try a few possible call shapes depending on SDK version
    let rawText = '';

    try {
      // Some versions expose model.generateContent
      if (typeof model.generateContent === 'function') {
        const result = await model.generateContent([systemPrompt, userPrompt]);
        // result may have different structures
        if (result?.response) {
          try {
            rawText = await result.response.text();
          } catch (e) {
            rawText = result.response?.output?.[0]?.content?.[0]?.text || '';
          }
        } else {
          rawText = result?.output?.[0]?.content?.[0]?.text || result?.text || '';
        }
      } else if (typeof genAI.generate === 'function') {
        const r = await genAI.generate({ model: 'gemini-1.5-flash', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }] });
        rawText = r?.output?.[0]?.content?.[0]?.text || r?.text || '';
      } else {
        // Fallback: attempt to call a generic generate method
        const r = await (model.generate?.(systemPrompt + '\n' + userPrompt) as any);
        rawText = r?.text || r?.output?.[0]?.content?.[0]?.text || '';
      }
    } catch (innerErr) {
      console.warn('Primary Gemini call failed, will fallback to mock. Inner error:', innerErr);
      return mockPresentation(title, slides);
    }

    if (!rawText || rawText.trim().length === 0) {
      console.warn('Empty response from Gemini, returning mock.');
      return mockPresentation(title, slides);
    }

    // Clean up code fences and extract JSON
    const jsonText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const parsed = JSON.parse(jsonText);
      // Ensure structure
      if (!parsed.slides || !Array.isArray(parsed.slides)) {
        throw new Error('Parsed JSON does not contain slides[]');
      }

      // For each slide with an image_prompt, try to generate an image and attach as data URI
      for (let i = 0; i < parsed.slides.length; i++) {
        const s = parsed.slides[i] as any;
        if (s.image_prompt && !s.image_url) {
          try {
            const imgBase64 = await generateImageBase64(s.image_prompt);
            if (imgBase64) {
              s.image_url = `data:image/jpeg;base64,${imgBase64}`;
            }
          } catch (imgErr) {
            console.warn('Image generation failed for slide', i, imgErr);
          }
        }
      }

      return parsed;
    } catch (parseErr) {
      console.warn('Could not parse JSON from Gemini response, returning mock. Parse error:', parseErr);
      return mockPresentation(title, slides);
    }
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    // On any failure, return mock to keep local dev experience smooth
    return mockPresentation(title, slides);
  }
};
