import {
  aiExplainResponseSchema,
  aiRecommendationsResponseSchema,
  aiSummaryResponseSchema,
  chatResponseSchema,
  type AiExplainResponse,
  type AiRecommendationsResponse,
  type AiSummaryResponse,
  type ChatMessage,
  type ChatResponse,
  type ClinicSnapshot,
  type ScenarioComparison,
} from "@/lib/clinic-types";
import {
  callOpenRouter,
  callOpenRouterCached,
  parseJsonResponse,
} from "@/lib/ai/openrouter.server";
import {
  chatAssistantPrompt,
  dashboardSummaryPrompt,
  explainScenarioPrompt,
  recommendationsPrompt,
} from "@/lib/ai/prompts";

function withGeneratedAt<T extends { generatedAt?: string }>(value: T): T {
  return { ...value, generatedAt: value.generatedAt ?? new Date().toISOString() };
}

export async function generateRecommendations(
  snapshot: ClinicSnapshot,
): Promise<AiRecommendationsResponse> {
  const { system, user } = recommendationsPrompt(snapshot);
  const raw = await callOpenRouterCached("recommendations", snapshot, [
    { role: "system", content: system },
    { role: "user", content: user },
  ]);

  const parsed = withGeneratedAt(parseJsonResponse<AiRecommendationsResponse>(raw));
  return aiRecommendationsResponseSchema.parse(parsed);
}

export async function generateDashboardSummary(
  snapshot: ClinicSnapshot,
): Promise<AiSummaryResponse> {
  const { system, user } = dashboardSummaryPrompt(snapshot);
  const raw = await callOpenRouterCached("summary", snapshot, [
    { role: "system", content: system },
    { role: "user", content: user },
  ]);

  const parsed = withGeneratedAt(parseJsonResponse<AiSummaryResponse>(raw));
  return aiSummaryResponseSchema.parse(parsed);
}

export async function explainScenario(
  comparison: ScenarioComparison,
): Promise<AiExplainResponse> {
  const { system, user } = explainScenarioPrompt(comparison);
  const raw = await callOpenRouterCached("explain", comparison, [
    { role: "system", content: system },
    { role: "user", content: user },
  ]);

  const parsed = withGeneratedAt(parseJsonResponse<AiExplainResponse>(raw));
  return aiExplainResponseSchema.parse(parsed);
}

export async function sendChatReply(
  snapshot: ClinicSnapshot,
  messages: ChatMessage[],
  page?: string,
): Promise<ChatResponse> {
  const { system, user } = chatAssistantPrompt(snapshot, page, messages);
  const reply = await callOpenRouter([
    { role: "system", content: system },
    { role: "user", content: user },
  ]);
  return chatResponseSchema.parse({ reply });
}
