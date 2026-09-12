import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Model Cascade Array for Zero-Downtime Gemini Web AI
const GEMINI_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.5-flash',
  'gemini-3.8-flash',
];

// LaTeX & Math Formula Sanitizer
function cleanMathFormulas(input) {
  if (!input) return '';
  let text = input;

  // Remove \text{...}, \mathrm{...}, \mathbf{...}
  text = text.replace(/\\(?:text|mathrm|mathbf|mathit|textsf)\{([^}]+)\}/g, '$1');

  // Replace \frac{a}{b} -> (a / b)
  text = text.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)');

  // Common LaTeX symbols
  const mathSymbols = {
    '\\times': '×',
    '\\div': '÷',
    '\\pm': '±',
    '\\approx': '≈',
    '\\neq': '≠',
    '\\leq': '≤',
    '\\geq': '≥',
    '\\infty': '∞',
    '\\pi': 'π',
    '\\theta': 'θ',
    '\\sqrt': '√',
  };

  Object.entries(mathSymbols).forEach(([key, val]) => {
    text = text.replaceAll(key, val);
  });

  return text;
}

// In-Memory Data Store with Initial Mock Seed Data
let mockTasks = [];

let mockCommunities = [];

let mockMessages = [];

let mockSearchHistory = [];

// --- API ENDPOINTS ---

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'StudySpace Node.js API',
    timestamp: new Date().toISOString(),
    ai_models_configured: GEMINI_MODELS.length,
    has_api_key: Boolean(process.env.GEMINI_API_KEY)
  });
});

// Gemini AI Chat with Multi-Model Cascade Fallback & Autonomous Academic Engine
app.post('/api/ai/chat', async (req, res) => {
  const { prompt, systemInstruction, history = [] } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt string is required.' });
  }

  const rawKey = process.env.GEMINI_API_KEY || req.headers['x-gemini-api-key'];
  const isValidGeminiKey = Boolean(rawKey && typeof rawKey === 'string' && rawKey.length > 10);

  console.log(`\n🤖 [AI Request] Received prompt: "${prompt.substring(0, 60)}..."`);
  console.log(`🔑 [AI Key Check] rawKey present: ${Boolean(rawKey)}, length: ${rawKey?.length || 0}, isValid: ${isValidGeminiKey}`);

  // If a valid Google AI Studio API key exists, attempt live cascade
  if (isValidGeminiKey) {
    for (const model of GEMINI_MODELS) {
      try {
        console.log(`📡 [AI Cascade] Attempting live call with model: ${model}...`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${rawKey}`;

        const contentsPayload = [
          ...history.map(item => ({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.text }]
          })),
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ];

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemInstruction || 'You are StudySpace AI, an intelligent, empathetic web tutor for college students. Explain concepts step-by-step with clear markdown headings, clean math formulas, and practical code examples.' }]
            },
            contents: contentsPayload,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 16384,
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const candidate = data.candidates?.[0];
          const parts = candidate?.content?.parts || [];
          const fullText = parts.map(p => p.text || '').join('');

          if (fullText.trim()) {
            const cleanedText = cleanMathFormulas(fullText);
            console.log(`✅ [AI Cascade SUCCESS] Model ${model} responded with ${cleanedText.length} characters.`);
            return res.json({
              text: cleanedText,
              modelUsed: model,
              finishReason: candidate?.finishReason || 'STOP'
            });
          }
        }
        const errBody = await response.text().catch(() => '');
        console.error(`❌ [AI Cascade Error] Model ${model} returned HTTP ${response.status}: ${errBody}`);
      } catch (err) {
        console.error(`💥 [AI Cascade Exception] Model ${model} failed: ${err.message}`);
      }
    }
  } else {
    console.error('⚠️ [AI Cascade] No valid Gemini API key found in process.env.GEMINI_API_KEY or headers.');
  }

  // If all live models failed or no key present, fail loudly instead of silent fallback
  return res.status(500).json({ error: 'AI processing failed. Please check Gemini API Key or network.' });
});

// Helper for direct Gemini API completion
async function generateGeminiText(prompt, systemInstruction = '', jsonMode = false) {
  const rawKey = process.env.GEMINI_API_KEY;
  if (!rawKey) throw new Error('GEMINI_API_KEY is missing');
  
  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${rawKey}`;
      const config = { temperature: 0.7, maxOutputTokens: 16384 };
      if (jsonMode) config.responseMimeType = 'application/json';
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: config
        })
      });
      if (response.ok) {
        const data = await response.json();
        const fullText = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('');
        if (fullText) return fullText;
      }
    } catch (e) {
      console.error(`[Gemini helper error model ${model}]`, e.message);
    }
  }
  throw new Error('All AI models failed to generate a response');
}

// AI Quiz Generator Endpoint
app.post('/api/ai/quiz', async (req, res) => {
  const { topic, difficulty = 'medium', numQuestions = 4 } = req.body;
  if (!topic) return res.status(400).json({ error: 'Topic is required' });

  const prompt = `Generate an academic quiz with ${numQuestions} multiple-choice questions on "${topic}" at ${difficulty} difficulty level. Response MUST be a valid JSON array of objects with keys: "id" (number), "question" (string), "options" (array of 4 strings), "correctIndex" (number 0-3), and "explanation" (string). No markdown wrapper outside JSON.`;

  try {
    const rawJson = await generateGeminiText(prompt, 'Respond only with raw JSON. No markdown code blocks.', true);
    const cleanJson = rawJson.replace(/```json/gi, '').replace(/```/g, '').trim();
    const questions = JSON.parse(cleanJson);
    return res.json({ topic, difficulty, questions });
  } catch (e) {
    console.error('Quiz Generation Error:', e);
    return res.status(500).json({ error: 'Failed to generate quiz. Please try again later.' });
  }
});

// AI Notes Summarizer Endpoint
app.post('/api/ai/summarize', async (req, res) => {
  const { text, filename } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required for summarization.' });

  const prompt = `Summarize the following study notes / document concisely into bullet points and high-yield takeaways (from file: ${filename || 'Document'}):\n\n${text.substring(0, 12000)}`;
  
  try {
    const summary = await generateGeminiText(prompt, 'You are an academic study summarizer.');
    return res.json({ summary: cleanMathFormulas(summary) });
  } catch (e) {
    console.error('Summarize Error:', e);
    return res.status(500).json({ error: 'Failed to generate summary.' });
  }
});

// AI Presentation Deck (PPT) Generator Endpoint
app.post('/api/ai/presentation', async (req, res) => {
  const { topic, numSlides = 5, style = 'academic' } = req.body;
  if (!topic) return res.status(400).json({ error: 'Topic string is required.' });

  const prompt = `Generate a ${numSlides}-slide PowerPoint presentation on the academic topic "${topic}". Style: ${style}. Return ONLY a valid JSON array of objects, where each object represents a slide with keys: "slideNumber" (1 to N), "title", "subtitle", "bullets" (array of 3 bullet strings), "codeOrFormula" (a short code snippet or formula string), and "speakerNotes" (a 2-sentence presentation transcript). No markdown outer wrapper.`;

  try {
    const rawJson = await generateGeminiText(prompt, 'Respond strictly with valid JSON. No markdown fences.', true);
    const cleanJson = rawJson.replace(/```json/gi, '').replace(/```/g, '').trim();
    const slides = JSON.parse(cleanJson);
    return res.json({ topic, numSlides, style, slides });
  } catch (e) {
    console.error('Presentation Generation Error:', e);
    return res.status(500).json({ error: 'Failed to generate presentation deck.' });
  }
});

// Tasks Endpoints
app.get('/api/tasks', (req, res) => {
  res.json(mockTasks);
});

app.post('/api/tasks', (req, res) => {
  const { title, description, category, priority, due_date, due_time } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const newTask = {
    id: `task-${Date.now()}`,
    title,
    description: description || '',
    category: category || 'personal',
    priority: priority || 'medium',
    due_date: due_date || new Date().toISOString().split('T')[0],
    due_time: due_time || '23:59',
    completed: false,
    created_at: new Date().toISOString()
  };

  mockTasks.unshift(newTask);
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const taskIndex = mockTasks.findIndex(t => t.id === id);
  if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });

  mockTasks[taskIndex] = {
    ...mockTasks[taskIndex],
    ...req.body,
    updated_at: new Date().toISOString()
  };

  res.json(mockTasks[taskIndex]);
});

app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  mockTasks = mockTasks.filter(t => t.id !== id);
  res.json({ success: true, id });
});

// Community & Channels Endpoints
app.get('/api/community', (req, res) => {
  res.json({
    communities: mockCommunities,
    messages: mockMessages
  });
});

app.post('/api/community/message', (req, res) => {
  const { channel_id, content, user } = req.body;
  if (!channel_id || !content) return res.status(400).json({ error: 'Channel ID and content are required' });

  const newMessage = {
    id: `msg-${Date.now()}`,
    channel_id,
    user: user || { full_name: 'Student User', username: 'student_user', college: 'University', avatar_url: '' },
    content,
    created_at: new Date().toISOString(),
    reactions: []
  };

  mockMessages.push(newMessage);
  res.status(201).json(newMessage);
});

app.post('/api/community/reaction', (req, res) => {
  const { message_id, emoji } = req.body;
  const msg = mockMessages.find(m => m.id === message_id);
  if (!msg) return res.status(404).json({ error: 'Message not found' });

  const existingReaction = msg.reactions.find(r => r.emoji === emoji);
  if (existingReaction) {
    existingReaction.count += 1;
  } else {
    msg.reactions.push({ emoji, count: 1, users: ['currentUser'] });
  }

  res.json(msg);
});

// Academic Resource Search Endpoint
app.get('/api/search', (req, res) => {
  const query = (req.query.q || '').toString().toLowerCase();

  if (query && !mockSearchHistory.includes(query)) {
    mockSearchHistory.unshift(query);
    if (mockSearchHistory.length > 10) mockSearchHistory.pop();
  }

  const catalog = [
    {
      id: 'res-1',
      title: 'Operating System Concepts (Silberschatz) 10th Edition',
      type: 'Textbook PDF',
      category: 'Computer Science',
      author: 'Silberschatz, Galvin, Gagne',
      size: '24.5 MB',
      rating: 4.9,
      downloads: '14.2k',
      url: 'https://openstax.org',
      description: 'Comprehensive coverage of processes, threads, CPU scheduling, deadlocks, virtual memory, and storage management.'
    },
    {
      id: 'res-2',
      title: 'Introduction to Algorithms (CLRS) 4th Edition Notes',
      type: 'Lecture Notes',
      category: 'Computer Science',
      author: 'Cormen, Leiserson, Rivest, Stein',
      size: '8.1 MB',
      rating: 4.8,
      downloads: '28.9k',
      url: 'https://ocw.mit.edu',
      description: 'MIT OpenCourseWare detailed notes on sorting, dynamic programming, greedy strategies, and graph algorithms.'
    },
    {
      id: 'res-3',
      title: 'Multivariable Calculus & Differential Equations Study Guide',
      type: 'Cheat Sheet PDF',
      category: 'Mathematics',
      author: 'Prof. Strang (MIT)',
      size: '3.4 MB',
      rating: 4.9,
      downloads: '9.8k',
      url: 'https://ocw.mit.edu',
      description: 'Formula summary sheet for vector fields, line integrals, Stokes theorem, and second-order differential equations.'
    },
    {
      id: 'res-4',
      title: 'Database Management Systems & SQL Query Tuning Manual',
      type: 'Lab Manual',
      category: 'Information Technology',
      author: 'Dr. R. Ramakrishnan',
      size: '12.0 MB',
      rating: 4.7,
      downloads: '6.4k',
      url: 'https://db-book.com',
      description: 'Relational algebra, B+ Trees indexing, query optimization plans, and PostgreSQL RLS security policy examples.'
    },
    {
      id: 'res-5',
      title: 'Quantum Mechanics & Modern Physics Essentials',
      type: 'Textbook PDF',
      category: 'Physics',
      author: 'David J. Griffiths',
      size: '18.3 MB',
      rating: 4.9,
      downloads: '11.1k',
      url: 'https://openstax.org',
      description: 'Detailed derivations of wave mechanics, angular momentum, harmonic oscillator, and perturbation theory.'
    }
  ];

  const results = query
    ? catalog.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.author.toLowerCase().includes(query)
      )
    : catalog;

  res.json({
    query,
    results,
    history: mockSearchHistory
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`⚡ StudySpace Backend Server running on http://localhost:${PORT}`);
});
