DeckMaster backend
==================

This backend includes integration with Gemini for text generation and Image API for image generation.

Setup
-----

1. Copy `.env.example` to `.env` and set your API key:

```
GEMINI_API_KEY=your_key_here
```

2. Install dependencies and run the backend:

```powershell
pnpm --filter backend install
pnpm --filter backend dev
```

Notes
-----
- If `GEMINI_API_KEY` is not set the server will use a mock presentation generator for local development.
- Image generation uses the `@google/genai` SDK and requires quota on the Google AI Studio side.
- Generated images are attached to slides as `data:image/jpeg;base64,...` and embedded in the PPTX.
