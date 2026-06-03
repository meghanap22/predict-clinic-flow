import { createServerFn } from "@tanstack/react-start";
import {
  clinicSnapshotSchema,
  scenarioComparisonSchema,
} from "@/lib/clinic-types";
import {
  explainScenario,
  generateDashboardSummary,
  generateRecommendations,
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
