import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { optimizePrompt, testPromptExecution, suggestDifficulty, generateVisualPreview } from './src/server/geminiHandler.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API route to generate visual preview thumbnail for technical drawings & infographics
app.post('/api/generate-visual-preview', async (req, res) => {
  try {
    const result = await generateVisualPreview(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Error generating visual preview:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate visual preview',
    });
  }
});

// API route to suggest adaptive difficulty level (1-5)
app.post('/api/suggest-difficulty', async (req, res) => {
  try {
    const result = await suggestDifficulty(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Error suggesting difficulty:', error);
    res.status(500).json({
      error: error.message || 'Failed to suggest difficulty level',
    });
  }
});

// API route to optimize teacher prompt
app.post('/api/optimize-prompt', async (req, res) => {
  try {
    const result = await optimizePrompt(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Error optimizing prompt:', error);
    res.status(500).json({
      error: error.message || 'Failed to optimize educational prompt',
    });
  }
});

// API route to test prompt execution / generate educational material
app.post('/api/test-prompt', async (req, res) => {
  try {
    const { jsonSchema, chainOfThought, outputLanguage } = req.body;
    const result = await testPromptExecution({
      jsonSchema,
      chainOfThought,
      outputLanguage: outputLanguage || 'English',
    });
    res.json(result);
  } catch (error: any) {
    console.error('Error executing test prompt:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate educational material',
    });
  }
});

// Static assets in production vs Vite middlewares in development
const isProd = process.env.NODE_ENV === 'production';

if (!isProd) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`EduPrompt Architect server running on http://localhost:${PORT}`);
});
