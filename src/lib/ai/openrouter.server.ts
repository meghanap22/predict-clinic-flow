const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL ?? "google/gemini-2.5-flash";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

interface CacheEntry {
  expiresAt: number;
  value: string;
}

const responseCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getApiKey() {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error("OPENROUTER_API_KEY is not configured. Add it to .env.local or .dev.vars.");
  }
  return key;
}

function cacheKey(task: string, payload: unknown) {
  return `${task}:${JSON.stringify(payload)}`;
}

function readCache(key: string) {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    responseCache.delete(key);
    return null;
  }
  return entry.value;
}

function writeCache(key: string, value: string) {
  responseCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

export async function callOpenRouter(messages: ChatMessage[], jsonMode = false) {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:5173",
      "X-Title": "ClinicFlow Intelligence",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages,
      temperature: 0.4,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenRouter request failed (${response.status}): ${body.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("OpenRouter returned an empty response.");
  return content;
}

export async function callOpenRouterCached(task: string, payload: unknown, messages: ChatMessage[]) {
  const key = cacheKey(task, payload);
  const cached = readCache(key);
  if (cached) return cached;

  const content = await callOpenRouter(messages, true);
  writeCache(key, content);
  return content;
}

export function parseJsonResponse<T>(raw: string): T {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonText = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(jsonText) as T;
}
