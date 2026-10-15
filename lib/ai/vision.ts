import { ImageCategory } from '@/types';

export interface VisionAnalysisResult {
  description: string;
  category: ImageCategory;
  tags: string[];
  visualObjects: string[];
  ocrText?: string;
  provider: 'groq-vision' | 'groq-text' | 'heuristic';
}

export function isVisionProviderConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY);
}

export function getActiveAiProviderName(): string {
  if (process.env.GROQ_API_KEY) {
    return 'Groq LPU (Qwen 2.5 Vision + Llama Multimodal Reasoning)';
  }
  return 'Local Semantic Analysis Engine';
}

/**
 * Multimodal Visual Analysis Engine
 * Sends the actual image URL directly to Groq's multimodal vision model (qwen/qwen3.8-27b)
 * to physically see and identify people, objects, wrestling, shirts, logos, scenery, etc.
 */
export async function analyzeImage(imageUrl: string, filename: string): Promise<VisionAnalysisResult> {
  if (process.env.GROQ_API_KEY) {
    try {
      const prompt = `Identify everything in this image.
JSON ONLY:
{
  "description": "Short 2 sentence visual description",
  "category": "photograph",
  "tags": ["10-15 lowercase keywords, names (e.g. john cena, wwe), colors, symbols (e.g. pakistani flag, pakistan)"],
  "visualObjects": ["items, clothing, faces, text seen"],
  "ocrText": "any text visible"
}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 14000);

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.8-27b',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: imageUrl } },
              ],
            },
          ],
          temperature: 0.1,
          max_tokens: 160,
        }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));

      if (response.ok) {
        const data = await response.json();
        const rawContent = data.choices[0]?.message?.content || '{}';
        const cleanJson = rawContent.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
        const parsed = JSON.parse(cleanJson);

        return {
          description: parsed.description || `Visual memory of ${filename}`,
          category: sanitizeCategory(parsed.category),
          tags: Array.isArray(parsed.tags) ? parsed.tags.map((t: string) => t.toLowerCase()) : [],
          visualObjects: Array.isArray(parsed.visualObjects) ? parsed.visualObjects : [],
          ocrText: parsed.ocrText || '',
          provider: 'groq-vision',
        };
      } else {
        const errData = await response.json().catch(() => ({}));
        console.error('Groq Vision response error:', errData);
      }
    } catch (err) {
      console.warn('Groq Vision exception:', err);
    }
  }

  // Fallback heuristic if external vision model is unreachable
  return generateHeuristicAnalysis(filename);
}

function sanitizeCategory(cat: string): ImageCategory {
  const valid: ImageCategory[] = ['screenshot', 'diagram', 'receipt', 'document', 'product', 'photograph', 'other'];
  const lower = (cat || '').toLowerCase() as ImageCategory;
  return valid.includes(lower) ? lower : 'photograph';
}

function generateHeuristicAnalysis(filename: string): VisionAnalysisResult {
  const lower = filename.toLowerCase();
  const tags: string[] = [];
  const visualObjects: string[] = [];

  const cleanTokens = lower
    .replace(/[^a-z0-9]/g, ' ')
    .split(' ')
    .filter((t) => t.length > 2 && !['png', 'jpg', 'jpeg', 'webp', 'img', 'images'].includes(t));

  for (const token of cleanTokens) {
    tags.push(token);
    visualObjects.push(token);
  }

  return {
    description: `Visual upload "${filename}".`,
    category: 'photograph',
    tags,
    visualObjects,
    ocrText: '',
    provider: 'heuristic',
  };
}

/**
 * Common national symbols & flag associations dictionary for instant zero-latency match
 */
const NATIONAL_SYMBOLS: Record<string, string[]> = {
  pakistan: ['green', 'white', 'crescent', 'star', 'flag', 'pakistani flag', 'pakistani', 'paksitan'],
  paksitan: ['green', 'white', 'crescent', 'star', 'flag', 'pakistani flag', 'pakistan'],
  america: ['red', 'white', 'blue', 'stars', 'stripes', 'flag', 'usa', 'united states'],
  usa: ['red', 'white', 'blue', 'stars', 'stripes', 'flag', 'american'],
  canada: ['red', 'white', 'maple leaf', 'flag', 'canadian'],
  japan: ['white', 'red sun', 'red circle', 'flag', 'japanese'],
  china: ['red', 'yellow stars', 'flag', 'chinese'],
  india: ['saffron', 'white', 'green', 'chakra', 'wheel', 'flag', 'indian'],
  turkey: ['red', 'white', 'crescent', 'star', 'flag', 'turkish'],
};

/**
 * Expand user search queries into semantic visual concepts.
 */
export async function expandVisualSearchQuery(query: string): Promise<string[]> {
  if (!query || query.length < 2) return [];

  const lowerQ = query.toLowerCase().trim();
  const results: string[] = [];

  // 1. Instant dictionary lookups for countries/flags/symbols
  if (NATIONAL_SYMBOLS[lowerQ]) {
    results.push(...NATIONAL_SYMBOLS[lowerQ]);
  }
  for (const [key, vals] of Object.entries(NATIONAL_SYMBOLS)) {
    if (lowerQ.includes(key)) {
      results.push(...vals);
    }
  }

  // 2. Multimodal AI Semantic Expansion via Groq
  if (process.env.GROQ_API_KEY) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
          messages: [
            {
              role: 'user',
              content: `The user searches visual memories for: "${query}".
Correct typos and list 8-10 visual objects, colors, symbols, national flags, people or items related to this.
Return ONLY comma-separated lowercase terms.`,
            },
          ],
          temperature: 0.1,
          max_tokens: 120,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices[0]?.message?.content || '';
        const items = text
          .split(/[\n,]+/)
          .map((s: string) => s.replace(/[^a-zA-Z0-9\s-]/g, '').trim().toLowerCase())
          .filter((s: string) => s.length > 2 && s.length < 35);
        results.push(...items);
      }
    } catch (err) {
      console.warn('Semantic query expansion fallback:', err);
    }
  }

  return Array.from(new Set(results));
}
