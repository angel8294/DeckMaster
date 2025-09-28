import pptxgen from 'pptxgenjs';

interface Slide {
  title: string;
  bullets?: string[];
  notes?: string;
  image_prompt?: string;
  image_url?: string; // optional if images are available later
  layout_hint?: string;
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export const createPptxFromArray = async (slides: Slide[]): Promise<string> => {
  const pres = new pptxgen();

  // Use a widescreen layout (16:9) for modern slides
  pres.defineLayout({ name: 'WIDE', width: 13.33, height: 7.5 });
  pres.layout = 'WIDE';

  // Helper: add footer with slide number
  const addFooter = (slide: any, index: number) => {
    slide.addText(` ${index + 1} `, {
      x: 12.2,
      y: 6.9,
      w: 0.9,
      h: 0.4,
      align: 'right',
      fontSize: 10,
      color: '666666',
    });
  };

  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    const slide = pres.addSlide();

    const layout = (s.layout_hint || '').toLowerCase();

    // Title placement
    if (layout.includes('center') || i === 0) {
      // Centered title (good for cover)
      slide.addText(s.title || '', {
        x: 0.6,
        y: i === 0 ? 1.8 : 0.8,
        w: 12.1,
        h: i === 0 ? 1.6 : 0.9,
        align: 'center',
        fontSize: i === 0 ? 40 : 28,
        bold: true,
        color: '222222',
      });
    } else {
      // Left title
      slide.addText(s.title || '', {
        x: 0.6,
        y: 0.4,
        w: 7.5,
        h: 0.8,
        align: 'left',
        fontSize: 28,
        bold: true,
        color: '222222',
      });
    }

    // Image area (right side) if requested by layout or image_url/prompt present
    const hasImage = Boolean(s.image_url || s.image_prompt);
    if (hasImage && (layout.includes('image') || layout.includes('illustrated') || layout.includes('center') || layout.includes('data-heavy'))) {
      // If actual image URL available, use addImage; otherwise draw a placeholder box with the prompt text
      if (s.image_url) {
        try {
          slide.addImage({ x: 8.6, y: 1.4, w: 3.9, h: 3.6, path: s.image_url });
        } catch (e) {
          // fallback to placeholder
          slide.addText(`Image: ${s.image_prompt || 'sugerida'}`, {
            x: 8.6,
            y: 1.4,
            w: 3.9,
            h: 3.6,
            fill: { color: 'EFEFEF' },
            color: '555555',
            align: 'center',
            fontSize: 12,
          });
        }
      } else {
        slide.addText(`Imagen sugerida:\n${s.image_prompt || ''}`, {
          x: 8.6,
          y: 1.4,
          w: 3.9,
          h: 3.6,
          fill: { color: 'F5F7FA' },
          color: '555555',
          align: 'center',
          fontSize: 12,
        });
      }
    }

    // Bullets area
    if (s.bullets && s.bullets.length > 0) {
      // Determine position depending on whether we have an image
      const x = hasImage ? 0.8 : 0.8;
      const y = hasImage ? 1.6 : 1.6;
      const w = hasImage ? 7.5 : 11.5;

      // Adjust font size based on number of bullets
      const fontSize = clamp(Math.floor(28 - s.bullets.length * 2), 14, 24);

      // Build text with bullets
      const text = s.bullets.map((b) => `• ${b}`).join('\n');

      slide.addText(text, {
        x,
        y,
        w,
        h: 4.5,
        fontSize,
        color: '333333',
        bullet: false,
        valign: 'top',
      });
    }

    // Add notes
    if (s.notes) {
      try {
        slide.addNotes(s.notes);
      } catch (e) {
        // ignore if notes not supported
      }
    }

    // Footer / slide number
    addFooter(slide, i);
  }

  // Generate the presentation as a base64 string
  const data = await pres.write({ outputType: 'base64' });
  return data as string;
};
