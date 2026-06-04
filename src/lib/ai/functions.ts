import { createServerFn } from "@tanstack/react-start";
import { chatRequestSchema, clinicSnapshotSchema, scenarioComparisonSchema } from "@/lib/clinic-types";
import {
  explainScenario,
  generateDashboardSummary,
  generateRecommendations,
  sendChatReply,
} from "@/lib/ai/service.server";

export const fetchRecommendations = createServerFn({ method: "POST" })
  .inputValidator(clinicSnapshotSchema)
  .handler(async ({ data }) => generateRecommendations(data));

export const fetchDashboardSummary = createServerFn({ method: "POST" })
  .inputValidator(clinicSnapshotSchema)
  .handler(async ({ data }) => generateDashboardSummary(data));

export const fetchScenarioExplanation = createServerFn({ method: "POST" })
  .inputValidator(scenarioComparisonSchema)
  .handler(async ({ data }) => explainScenario(data));

export const fetchChatReply = createServerFn({ method: "POST" })
  .inputValidator(chatRequestSchema)
  .handler(async ({ data }) =>
    sendChatReply(data.snapshot, data.messages, data.page),
  );
