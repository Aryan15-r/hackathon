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
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
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
let mockTasks = [
  {
    id: 'task-1',
    title: 'Complete Operating System Lab Assignment 3',
    description: 'Implement Semaphore deadlock solution in C/C++',
    category: 'assignment',
    priority: 'high',
    due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    due_time: '23:59',
    completed: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'task-2',
    title: 'Data Structures & Algorithms Midterm Exam',
    description: 'Revise Graph Algorithms, Dijkstra, and Dynamic Programming',
    category: 'exam',
    priority: 'high',
    due_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    due_time: '10:00',
    completed: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'task-3',
    title: 'Database Systems Group Project Architecture',
    description: 'Draft Supabase RLS schema and ER diagram',
    category: 'project',
    priority: 'medium',
    due_date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
    due_time: '18:00',
    completed: true,
    created_at: new Date().toISOString()
  }
];

let mockCommunities = [
  {
    id: 'comm-1',
    name: 'Computer Science 2026',
    icon: '💻',
    description: 'Official batch discussion and exam preparation hub',
    category: 'Computer Science',
    is_private: false,
    created_by: 'admin',
    channels: [
      { id: 'chan-1', name: 'general', description: 'General batch talk & announcements' },
      { id: 'chan-2', name: 'homework-help', description: 'Doubt solving & assignment assistance' },
      { id: 'chan-3', name: 'exam-prep', description: 'Past papers, notes & cheat sheets' },
      { id: 'chan-4', name: 'project-collab', description: 'Find teammates and discuss hackathons' }
    ]
  },
  {
    id: 'comm-2',
    name: 'Physics & Applied Math Lab',
    icon: '⚡',
    description: 'Quantum physics, differential equations & calculus study group',
    category: 'Mathematics & Physics',
    is_private: false,
    created_by: 'admin',
    channels: [
      { id: 'chan-5', name: 'quantum-physics', description: 'Schrodinger equations & wave functions' },
      { id: 'chan-6', name: 'calculus-hub', description: 'Integration, series & vectors' }
    ]
  },
  {
    id: 'comm-3',
    name: 'Web Dev & AI Innovators',
    icon: '🚀',
    description: 'Full-stack engineering, React, Node.js and Gemini AI agents',
    category: 'Engineering',
    is_private: true,
    passcode: '1234',
    created_by: 'admin',
    channels: [
      { id: 'chan-7', name: 'react-node', description: 'MERN stack tips and code reviews' },
      { id: 'chan-8', name: 'ai-agents', description: 'Building with Gemini API & LLM workflows' }
    ]
  }
];

let mockMessages = [
  {
    id: 'msg-1',
    channel_id: 'chan-1',
    user: { full_name: 'Aryan Sharma', username: 'aryan_dev', college: 'Tech University', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
    content: 'Hey everyone! Has anyone started working on the OS Semaphore lab assignment?',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    reactions: [{ emoji: '👍', count: 4, users: ['user1', 'user2'] }]
  },
  {
    id: 'msg-2',
    channel_id: 'chan-1',
    user: { full_name: 'Priya Patel', username: 'priya_p', college: 'Tech University', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    content: 'Yes! Check out page 42 of the textbook for the mutex code template.',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    reactions: [{ emoji: '🔥', count: 6, users: ['user1'] }, { emoji: '💡', count: 3, users: ['user3'] }]
  },
  {
    id: 'msg-3',
    channel_id: 'chan-2',
    user: { full_name: 'Rohan Verma', username: 'rohan_v', college: 'Tech University', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    content: 'Can someone explain Dijkstra shortest path algorithm complexity with Fibonacci heaps?',
    created_at: new Date(Date.now() - 900000).toISOString(),
    reactions: [{ emoji: '🚀', count: 2, users: ['user2'] }]
  }
];

let mockSearchHistory = [
  'Operating Systems Silberschatz 10th edition PDF',
  'Data Structures Dijkstra algorithm python',
  'Calculus 3 multivariable integration notes',
  'React 18 hooks cheat sheet'
];

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

// Gemini AI Chat with Multi-Model Cascade Fallback
app.post('/api/ai/chat', async (req, res) => {
  const { prompt, systemInstruction, history = [] } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt string is required.' });
  }

  const apiKey = process.env.GEMINI_API_KEY || req.headers['x-gemini-api-key'];

  // If no API key is set, return a friendly simulated intelligent fallback
  if (!apiKey) {
    const sanitizedPrompt = prompt.toLowerCase();
    let mockAnswer = `**StudySpace AI Assistant (Simulated Mode)**\n\n*Note: To enable live real-time Gemini AI queries, set \`GEMINI_API_KEY\` in your \`.env\` file or browser settings.*\n\nHere is an academic response for your query:\n\n### Explanation for: "${prompt}"\n\n1. **Core Concept**: When studying this subject, break down complex topics into fundamental principles.\n2. **Formula / Rule**: $E = mc^2$ or $\\frac{d}{dx}[f(x)g(x)] = f'(x)g(x) + f(x)g'(x)$\n3. **Key Steps**:\n   - Step 1: Define initial boundary conditions and variables.\n   - Step 2: Apply standard algorithmic transformation.\n   - Step 3: Verify results against edge test cases.\n\n> **Tip**: You can use the Pomodoro timer in Study Tools or generate a quick practice quiz to solidify your understanding!`;

    return res.json({
      text: cleanMathFormulas(mockAnswer),
      modelUsed: 'simulated-study-cascade',
      sanitized: true
    });
  }

  let lastError = null;

  // Execute Cascade Loop
  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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
          return res.json({
            text: cleanedText,
            modelUsed: model,
            finishReason: candidate?.finishReason || 'STOP'
          });
        }
      } else {
        const errBody = await response.text();
        lastError = `Model ${model} returned status ${response.status}: ${errBody}`;
      }
    } catch (err) {
      lastError = `Model ${model} failed with exception: ${err.message}`;
    }
  }

  res.status(502).json({
    error: 'All Gemini Web AI models in cascade failed.',
    details: lastError
  });
});

// AI Quiz Generator Endpoint
app.post('/api/ai/quiz', async (req, res) => {
  const { topic, difficulty = 'medium', numQuestions = 4 } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required.' });
  }

  if (!apiKey) {
    // Return high quality simulated quiz
    return res.json({
      topic,
      difficulty,
      questions: [
        {
          id: 1,
          question: `Which of the following is a primary characteristic of ${topic}?`,
          options: [
            'Optimal time complexity logarithmic bound',
            'Constant memory footprint O(1)',
            'Asynchronous non-blocking execution thread',
            'Direct memory pointer dereferencing'
          ],
          correctIndex: 0,
          explanation: `In ${topic}, logarithmic or optimal polynomial bounds provide predictable execution guarantees across large datasets.`
        },
        {
          id: 2,
          question: `In standard academic formulations of ${topic}, what is the main purpose of boundary conditions?`,
          options: [
            'To prevent infinite recursion and define edge cases',
            'To compress network bandwidth overhead',
            'To override garbage collection pauses',
            'To format JSON serializations'
          ],
          correctIndex: 0,
          explanation: 'Boundary conditions set initial state constraints preventing unbounded looping or stack overflow exceptions.'
        },
        {
          id: 3,
          question: `What design pattern is most frequently applied when implementing ${topic}?`,
          options: [
            'Divide and Conquer',
            'Singleton Global Scope',
            'Active Polling Loop',
            'Hardcoded Static Allocation'
          ],
          correctIndex: 0,
          explanation: 'Divide and conquer breaks down problem instances into smaller sub-problems solved recursively.'
        }
      ]
    });
  }

  // Live call to Gemini for Quiz JSON
  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const prompt = `Generate an academic quiz with ${numQuestions} multiple-choice questions on "${topic}" at ${difficulty} difficulty level. Response MUST be a valid JSON array of objects with keys: "id", "question", "options" (array of 4 strings), "correctIndex" (0-3), and "explanation". No markdown wrapper outside JSON.`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            responseMimeType: 'application/json'
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const parts = data.candidates?.[0]?.content?.parts || [];
        const rawJson = parts.map(p => p.text || '').join('');
        const questions = JSON.parse(rawJson);
        return res.json({ topic, difficulty, questions });
      }
    } catch {
      continue;
    }
  }

  res.status(500).json({ error: 'Quiz generation failed' });
});

// AI Document / PDF Text Summarizer Endpoint
app.post('/api/ai/summarize', async (req, res) => {
  const { text, filename } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Document text is required for summarization.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.json({
      summary: `### 📄 AI Executive Summary: ${filename || 'Document'}\n\n1. **Core Theme**: The uploaded material discusses fundamental concepts, analytical methodologies, and practical applications in higher education study.\n2. **Key Takeaways**:\n   - **Section 1**: Overview of fundamental principles and definitions.\n   - **Section 2**: Mathematical models, algorithms, and core formulas.\n   - **Section 3**: Experimental evaluation, case studies, and summary conclusions.\n\n3. **Recommended Next Steps**: Review key formulas and test your knowledge using StudySpace Flashcards!`
    });
  }

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const prompt = `Summarize the following academic text from file "${filename || 'Document'}". Provide key bullet points, essential definitions, and a 3-sentence executive summary:\n\n${text.substring(0, 12000)}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 8192 }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const parts = data.candidates?.[0]?.content?.parts || [];
        const result = parts.map(p => p.text || '').join('');
        return res.json({ summary: cleanMathFormulas(result) });
      }
    } catch {
      continue;
    }
  }

  res.status(500).json({ error: 'Summarization failed' });
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
