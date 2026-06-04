import type { ChatMessage, ClinicSnapshot, ScenarioComparison } from "@/lib/clinic-types";

const SYSTEM_PROMPT = `You are ClinicFlow Intelligence, an operations advisor for outpatient clinics.
You analyze simulated clinic metrics and give concise, practical recommendations.
Rules:
- Base every statement ONLY on the provided JSON data.
- Never invent patient names, real EMR data, or statistics not in the snapshot.
- Be specific with numbers from the snapshot when relevant.
- Keep language clear and actionable for clinic administrators.
- Return valid JSON only, no markdown.`;

export function recommendationsPrompt(snapshot: ClinicSnapshot) {
  return {
    system: SYSTEM_PROMPT,
    user: `Given this clinic snapshot, return exactly 3 operational recommendations ranked by impact.

Return JSON:
{
  "recommendations": [
    {
      "id": "rec-1",
      "title": "short action title",
      "description": "one sentence summary",
      "category": "Staffing | Scheduling | Room Allocation | Capacity | Coordination",
      "impact": "High | Medium | Low",
      "reasoning": "2-3 sentences referencing specific metrics from the snapshot"
    }
  ],
  "generatedAt": "ISO timestamp"
}

Clinic snapshot:
${JSON.stringify(snapshot, null, 2)}`,
  };
}

export function dashboardSummaryPrompt(snapshot: ClinicSnapshot) {
  return {
    system: SYSTEM_PROMPT,
    user: `Write a brief operational briefing for the clinic administrator.

Return JSON:
{
  "summary": "3-4 sentences on the current situation, biggest risk, and what to focus on",
  "focusArea": "2-4 word priority label e.g. Urgent Care Capacity",
  "generatedAt": "ISO timestamp"
}

Clinic snapshot:
${JSON.stringify(snapshot, null, 2)}`,
  };
}

export function explainScenarioPrompt(comparison: ScenarioComparison) {
  return {
    system: SYSTEM_PROMPT,
    user: `Explain the what-if simulation scenario compared to baseline in plain English.

Return JSON:
{
  "explanation": "2-3 sentences comparing baseline vs scenario. Reference specific metric changes (wait time, congestion, queue). Mention overflow if enabled.",
  "generatedAt": "ISO timestamp"
}

Comparison data:
${JSON.stringify(comparison, null, 2)}`,
  };
}

const PAGE_LABELS: Record<string, string> = {
  "/": "Operations Dashboard",
  "/analytics": "Analytics & Outcomes",
  "/patient-flow": "Patient Flow",
  "/recommendations": "AI Recommendations",
  "/simulation": "What-If Simulation",
};

export function chatAssistantPrompt(
  snapshot: ClinicSnapshot,
  page: string | undefined,
  messages: ChatMessage[],
) {
  const pageLabel = page ? (PAGE_LABELS[page] ?? page) : "ClinicFlow";
  const history = messages
    .slice(0, -1)
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n\n");

  return {
    system: `You are ClinicFlow Intelligence, a conversational operations assistant for outpatient clinic administrators.
Rules:
- Answer using ONLY the clinic snapshot JSON and conversation context below.
- Never invent patient names, EMR records, or metrics not in the snapshot.
- Be concise, practical, and friendly.
- Do NOT use markdown (no **, no # headers, no backticks).
- Format for easy reading: one short opening sentence, then one fact per line starting with "- " (hyphen only; the UI adds bullets).
- Label then value in plain text, e.g. "- Urgent Care load: 91% — highest department pressure."
- The snapshot includes doctorSchedule: each doctor has shift hours, sessionLoad %, and todaySchedule (timed blocks with type: appointment, break, admin, block).
- Use todaySchedule when asked what a doctor is doing, their availability, or appointments; cite times and titles from the data.
- Never say you lack doctor schedules when doctorSchedule is present.
- If asked about something outside the snapshot, say what data you would need.
- The user is currently viewing: ${pageLabel}.`,
    user: `Clinic snapshot (live simulated metrics):
${JSON.stringify(snapshot, null, 2)}

${history ? `Prior conversation:\n${history}\n\n` : ""}User question:
${messages[messages.length - 1]?.content ?? ""}`,
  };
}
