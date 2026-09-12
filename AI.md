# 🤖 StudySpace Web AI Integration & Setup Guide (`AI.md`)

This guide details the production architecture and setup used in **StudySpace Web Application** to deliver high-speed, truncation-free AI features using Google's Gemini models in web browsers and Flutter Web.

---

## 📑 Table of Contents
1. [Core Web AI Architecture & CORS Handling](#1-core-web-ai-architecture--cors-handling)
2. [API Configuration & Endpoint Details](#2-api-configuration--endpoint-details)
3. [Model Cascade Strategy (Zero-Downtime Fallback)](#3-model-cascade-strategy-zero-downtime-fallback)
4. [Fixing Response Truncation (Long Answers Cutting Mid-Way)](#4-fixing-response-truncation-long-answers-cutting-mid-way)
5. [LaTeX & Math Sanitizer for Web Markdown](#5-latex--math-sanitizer-for-web-markdown)
6. [Structured JSON Output Mode](#6-structured-json-output-mode)
7. [Full Copy-Paste Implementation: Flutter Web (`GeminiService`)](#7-full-copy-paste-implementation-flutter-web-geminiservice)
8. [Full Copy-Paste Implementation: Web JavaScript / TypeScript](#8-full-copy-paste-implementation-web-javascript--typescript)
9. [Full Copy-Paste Implementation: Python Web Backends](#9-full-copy-paste-implementation-python-web-backends)
10. [Web Security & Deployment Checklist](#10-web-security--deployment-checklist)

---

## 1. Core Web AI Architecture & CORS Handling

When invoking Gemini API from web applications, client-side requests must handle browser CORS rules and network latency smoothly:
1. **Google Gemini CORS Compliance**: Google's `generativelanguage.googleapis.com` endpoints support browser CORS requests when passing `Content-Type: application/json` and `x-goog-api-key` headers or URL query keys.
2. **Model Fallback Cascade**: If a specific model alias fails (`429 Too Many Requests`, `404 Not Found`, or quota exceeded), the web engine immediately retries with the next model in sequence.
3. **Large Token Allocation**: Sets `maxOutputTokens: 16384` to prevent responses from cutting off mid-sentence.
4. **LaTeX Web Sanitizer**: Converts LaTeX expressions (`\frac{a}{b}`, `\text{...}`) into clean Unicode math symbols rendered perfectly by browser markdown view.

---

## 2. API Configuration & Endpoint Details

- **REST Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/{MODEL_NAME}:generateContent?key={API_KEY}`
- **HTTP Method**: `POST`
- **Headers**:
  ```json
  {
    "Content-Type": "application/json",
    "x-goog-api-key": "YOUR_GEMINI_API_KEY"
  }
  ```

---

## 3. Model Cascade Strategy (Zero-Downtime Fallback)

To guarantee that your web app never fails if a specific model version is overloaded, iterate through the model array:

```dart
final modelsToTry = [
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
];
```

If the first model returns an error status (`404`, `429`, `500`), the engine immediately retries with the next model.

---

## 4. Fixing Response Truncation (Long Answers Cutting Mid-Way)

### Rule A: Increase `maxOutputTokens` to 16,384
```json
{
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 16384
  }
}
```

### Rule B: Concatenate all `parts`
Never read only `candidates[0].content.parts[0].text`. Always join all returned text parts:
```typescript
const fullText = candidate.content.parts.map((p: any) => p.text || '').join('');
```

---

## 5. LaTeX & Math Sanitizer for Web Markdown

Sanitize raw LaTeX before rendering in web markdown components:

```dart
String cleanMathFormulas(String input) {
  if (input.isEmpty) return input;
  String text = input;

  // 1. Remove \text{...}, \mathrm{...}, \mathbf{...}
  text = text.replaceAllMapped(
    RegExp(r'\\(?:text|mathrm|mathbf|mathit|textsf)\{([^}]+)\}'),
    (match) => match.group(1) ?? '',
  );

  // 2. Replace \frac{a}{b} -> (a / b)
  text = text.replaceAllMapped(
    RegExp(r'\\frac\{([^}]+)\}\{([^}]+)\}'),
    (match) => '(${match.group(1)} / ${match.group(2)})',
  );

  // 3. Replace common math symbols
  final mathSymbols = {
    r'\times': '×',
    r'\div': '÷',
    r'\pm': '±',
    r'\approx': '≈',
    r'\neq': '≠',
    r'\leq': '≤',
    r'\geq': '≥',
    r'\infty': '∞',
    r'\pi': 'π',
    r'\theta': 'θ',
    r'\sqrt': '√',
  };

  mathSymbols.forEach((key, value) {
    text = text.replaceAll(key, value);
  });

  return text;
}
```

---

## 6. Structured JSON Output Mode

For web search engines or structured study cards:

```json
{
  "system_instruction": {
    "parts": [{ "text": "Respond ONLY with a valid JSON array. No markdown, no code blocks." }]
  },
  "generationConfig": {
    "responseMimeType": "application/json"
  }
}
```

---

## 7. Full Copy-Paste Implementation: Flutter Web (`GeminiService`)

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class GeminiService {
  static final List<String> _models = [
    'gemini-3.6-flash',
    'gemini-3.7-flash',
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
  ];

  static Future<String> generateText({
    required String prompt,
    String systemInstruction = "You are StudySpace AI, a helpful web tutor.",
  }) async {
    final apiKey = dotenv.env['GEMINI_API_KEY'];
    if (apiKey == null || apiKey.isEmpty) {
      throw Exception('GEMINI_API_KEY is missing from environment variables.');
    }

    for (final model in _models) {
      try {
        final url = Uri.parse(
          'https://generativelanguage.googleapis.com/v1beta/models/$model:generateContent?key=$apiKey',
        );

        final response = await http.post(
          url,
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'system_instruction': {
              'parts': [{'text': systemInstruction}]
            },
            'contents': [
              {
                'role': 'user',
                'parts': [{'text': prompt}]
              }
            ],
            'generationConfig': {
              'temperature': 0.7,
              'maxOutputTokens': 16384,
            }
          }),
        );

        if (response.statusCode == 200) {
          final data = jsonDecode(response.body);
          final candidates = data['candidates'] as List?;
          if (candidates != null && candidates.isNotEmpty) {
            final parts = candidates[0]['content']?['parts'] as List?;
            if (parts != null && parts.isNotEmpty) {
              final text = parts.map((p) => p['text']?.toString() ?? '').join('');
              if (text.trim().isNotEmpty) return text;
            }
          }
        }
      } catch (e) {
        continue; // Try next model in cascade
      }
    }

    throw Exception('Failed to receive response from Gemini AI models.');
  }
}
```

---

## 8. Full Copy-Paste Implementation: Web JavaScript / TypeScript

```typescript
const MODELS = [
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
];

export async function askGeminiWeb(prompt: string, apiKey: string): Promise<string> {
  for (const model of MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 16384 },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const parts = data.candidates?.[0]?.content?.parts || [];
        const text = parts.map((p: any) => p.text || '').join('');
        if (text.trim()) return text;
      }
    } catch {
      continue;
    }
  }

  throw new Error('All Gemini Web AI models failed.');
}
```

---

## 9. Full Copy-Paste Implementation: Python Web Backends

```python
import requests

MODELS = [
    "gemini-3.6-flash",
    "gemini-3.7-flash",
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
]

def generate_ai_web_response(prompt: str, api_key: str) -> str:
    for model in MODELS:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [{"role": "user", "parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 16384,
                },
            }

            resp = requests.post(url, headers=headers, json=payload, timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
                full_text = "".join([p.get("text", "") for p in parts])
                if full_text.strip():
                    return full_text
        except Exception:
            continue

    raise RuntimeError("All Gemini Web AI models failed.")
```

---

## 10. Web Security & Deployment Checklist

1. **Vercel Environment Variables**:
   - Set `GEMINI_API_KEY` in Vercel project dashboard settings. `vercel_build.sh` will inject it into `.env` automatically during deployment.
2. **API Key Restrictions**:
   - Restrict your API key in Google Cloud Console / Google AI Studio to HTTP Referrers (e.g. `https://your-domain.vercel.app/*`).
