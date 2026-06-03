import type { SearchItem } from "./search-index";

const SYNONYMS: Record<string, string[]> = {
  wait: ["delay", "queue", "minutes", "waiting"],
  doctor: ["physician", "dr", "provider", "doc"],
  nurse: ["rn", "nursing"],
  appointment: ["appt", "visit", "booking", "slot"],
  congestion: ["busy", "crowded", "overload", "bottleneck"],
  room: ["exam", "rooms"],
  urgent: ["er", "emergency"],
  pediatric: ["peds", "pediatrics", "children", "kids"],
  recommend: ["rec", "recs", "suggestion", "advice"],
  simulate: ["sim", "what-if", "scenario", "forecast"],
  analytics: ["stats", "report", "outcomes", "performance"],
  intake: ["check-in", "checkin", "registration", "front desk"],
  throughput: ["volume", "productivity", "patients per hour"],
  satisfaction: ["nps", "survey", "experience"],
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ");
}

function levenshtein(a: string, b: string) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array.from({ length: a.length + 1 }, () => Array<number>(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
}

function expandToken(token: string) {
  const expanded = new Set([token]);
  for (const [key, values] of Object.entries(SYNONYMS)) {
    if (token === key || values.includes(token)) {
      expanded.add(key);
      values.forEach((value) => expanded.add(value));
    }
  }
  return [...expanded];
}

function expandQuery(query: string) {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  const expanded = new Set<string>();
  for (const token of tokens) {
    expandToken(token).forEach((value) => expanded.add(value));
  }
  return [...expanded];
}

function fuzzyScore(query: string, target: string) {
  const q = normalize(query);
  const t = normalize(target);
  if (!q || !t) return 0;
  if (t === q) return 100;
  if (t.includes(q)) return 92;
  if (t.startsWith(q)) return 88;
  if (t.split(/\s+/).some((word) => word.startsWith(q))) return 78;
  if (q.length >= 3 && t.split(/\s+/).some((word) => word.includes(q))) return 68;

  const distance = levenshtein(q, t);
  const maxLen = Math.max(q.length, t.length);
  const similarity = 1 - distance / maxLen;
  return similarity >= 0.5 ? similarity * 62 : 0;
}

function fieldScore(query: string, field: string, weight: number) {
  return fuzzyScore(query, field) * weight;
}

export function scoreSearchItem(query: string, item: SearchItem) {
  const q = normalize(query);
  if (!q) return 0;

  const tokens = expandQuery(q);
  const fields: Array<{ text: string; weight: number }> = [
    { text: item.title, weight: 1 },
    ...(item.aliases ?? []).map((alias) => ({ text: alias, weight: 0.92 })),
    ...item.keywords.map((keyword) => ({ text: keyword, weight: 0.88 })),
    ...(item.subtitle ? [{ text: item.subtitle, weight: 0.72 }] : []),
  ];

  let total = 0;
  for (const token of tokens) {
    let best = 0;
    for (const field of fields) {
      best = Math.max(best, fieldScore(token, field.text, field.weight));
    }
    total += best;
  }

  const tokenBonus = q.includes(" ") && tokens.length > 1 ? 4 : 0;
  return total / tokens.length + tokenBonus;
}

export interface ScoredSearchItem {
  item: SearchItem;
  score: number;
}

export function filterSearchItems(query: string, items: SearchItem[], minScore = 28): SearchItem[] {
  const q = normalize(query);
  if (!q) {
    return items.filter(
      (item) =>
        item.category === "Pages" ||
        item.category === "Departments" ||
        item.category === "Metrics",
    );
  }

  return items
    .map((item) => ({ item, score: scoreSearchItem(q, item) }))
    .filter(({ score }) => score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map(({ item }) => item);
}

export function findSearchSuggestions(query: string, items: SearchItem[], limit = 3): SearchItem[] {
  const q = normalize(query);
  if (!q) return [];

  const scored = items
    .map((item) => ({ item, score: scoreSearchItem(q, item) }))
    .filter(({ score }) => score >= 16 && score < 28)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);

  if (scored.length > 0) return scored;

  return items
    .map((item) => ({ item, score: scoreSearchItem(q, item) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .filter(({ score }) => score >= 12)
    .map(({ item }) => item);
}

export function groupSearchResults(items: SearchItem[]) {
  const groups = new Map<string, SearchItem[]>();
  for (const item of items) {
    const list = groups.get(item.category) ?? [];
    list.push(item);
    groups.set(item.category, list);
  }
  return groups;
}

export function highlightMatch(text: string, query: string) {
  const q = normalize(query);
  if (!q) return [{ text, match: false }];

  const lower = text.toLowerCase();
  const index = lower.indexOf(q);
  if (index === -1) {
    const words = q.split(/\s+/).filter(Boolean);
    for (const word of words) {
      const wordIndex = lower.indexOf(word);
      if (wordIndex !== -1) {
        return [
          { text: text.slice(0, wordIndex), match: false },
          { text: text.slice(wordIndex, wordIndex + word.length), match: true },
          { text: text.slice(wordIndex + word.length), match: false },
        ].filter((part) => part.text);
      }
    }
    return [{ text, match: false }];
  }

  return [
    { text: text.slice(0, index), match: false },
    { text: text.slice(index, index + q.length), match: true },
    { text: text.slice(index + q.length), match: false },
  ].filter((part) => part.text);
}
