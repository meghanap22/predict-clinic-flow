import { z } from "zod";

export const clinicMetricsSchema = z.object({
  avgWaitTime: z.number(),
  checkedIn: z.number(),
  activeAppointments: z.number(),
  doctorsAvailable: z.number(),
  doctorsTotal: z.number(),
  roomUtilization: z.number(),
  congestionRisk: z.number(),
  queueLength: z.number(),
  estimatedDelay: z.number(),
});

export const clinicControlsSchema = z.object({
  arrivalRate: z.number(),
  doctors: z.number(),
  rooms: z.number(),
  apptDuration: z.number(),
  nurses: z.number(),
  overflow: z.boolean(),
});

export const departmentLoadSchema = z.object({
  name: z.string(),
  load: z.number(),
});

export const historyPointSchema = z.object({
  t: z.string(),
  wait: z.number(),
  congestion: z.number(),
  queue: z.number(),
});

export const clinicSnapshotSchema = z.object({
  timestamp: z.string(),
  metrics: clinicMetricsSchema,
  controls: clinicControlsSchema,
  departments: z.array(departmentLoadSchema),
  trend: z.object({
    wait: z.enum(["rising", "falling", "stable"]),
    congestion: z.enum(["rising", "falling", "stable"]),
  }),
  recentHistory: z.array(historyPointSchema),
});

export type ClinicMetrics = z.infer<typeof clinicMetricsSchema>;
export type ClinicControls = z.infer<typeof clinicControlsSchema>;
export type ClinicSnapshot = z.infer<typeof clinicSnapshotSchema>;

export const scenarioComparisonSchema = z.object({
  snapshot: clinicSnapshotSchema,
  baseline: clinicMetricsSchema,
  scenario: clinicMetricsSchema,
});

export type ScenarioComparison = z.infer<typeof scenarioComparisonSchema>;

export const aiRecommendationSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  impact: z.enum(["High", "Medium", "Low"]),
  reasoning: z.string(),
});

export const aiRecommendationsResponseSchema = z.object({
  recommendations: z.array(aiRecommendationSchema).max(3),
  generatedAt: z.string(),
});

export type AiRecommendation = z.infer<typeof aiRecommendationSchema>;
export type AiRecommendationsResponse = z.infer<typeof aiRecommendationsResponseSchema>;

export const aiSummaryResponseSchema = z.object({
  summary: z.string(),
  focusArea: z.string(),
  generatedAt: z.string(),
});

export type AiSummaryResponse = z.infer<typeof aiSummaryResponseSchema>;

export const aiExplainResponseSchema = z.object({
  explanation: z.string(),
  generatedAt: z.string(),
});

export type AiExplainResponse = z.infer<typeof aiExplainResponseSchema>;
