import type { ClinicSnapshot, ScenarioComparison } from "@/lib/clinic-types";

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
