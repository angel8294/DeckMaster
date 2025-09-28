import express, { Request, Response } from 'express';
import { generatePresentationContent } from './gemini';
import { createPptxFromArray } from './pptx-generator';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// In-memory job store for simplicity
const jobs: Record<string, { status: string; result?: any }> = {};

app.post('/api/generate', async (req: Request, res: Response) => {
  const { title, audience, slides, style, language } = req.body;

  if (!title || !audience || !slides || !style || !language) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const jobId = `job_${Math.random().toString(36).substring(2, 11)}`;
  jobs[jobId] = { status: 'processing' };

  // Respond immediately with the job ID
  res.status(202).json({
    jobId,
    status: 'processing',
    estimatedSlides: slides,
  });

  // --- Perform generation in the background ---
  try {
    console.log(`[${jobId}] Starting presentation generation...`);
    const presentationContent = await generatePresentationContent(
      title,
      audience,
      slides,
      style,
      language
    );
    jobs[jobId] = { status: 'done', result: presentationContent };
    console.log(`[${jobId}] Presentation generated successfully.`);
  } catch (error) {
    console.error(`[${jobId}] Error during generation:`, error);
    jobs[jobId] = { status: 'failed' };
  }
});

app.get('/api/job/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;
  const job = jobs[jobId];

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.status(200).json(job);
});

app.post('/api/export', async (req: Request, res: Response) => {
  const { slides } = req.body;

  if (!slides || !Array.isArray(slides) || slides.length === 0) {
    return res.status(400).json({ error: 'Invalid slides data' });
  }

  try {
    const pptxBase64 = await createPptxFromArray(slides);
    res.status(200).json({ pptx: pptxBase64 });
  } catch (error) {
    console.error('Error generating PPTX file:', error);
    res.status(500).json({ error: 'Failed to generate PPTX file' });
  }
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
