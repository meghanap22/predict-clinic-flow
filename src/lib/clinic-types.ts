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

export const scheduleSlotSchema = z.object({
  start: z.string(),
  end: z.string(),
  title: z.string(),
  type: z.enum(["appointment", "break", "admin", "block"]),
  room: z.string().optional(),
});

export const doctorScheduleSchema = z.object({
  id: z.string(),
  name: z.string(),
  department: z.string(),
  sessionLoad: z.number(),
  shift: z.string(),
  todaySchedule: z.array(scheduleSlotSchema),
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
  doctorSchedule: z.array(doctorScheduleSchema),
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

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

export const chatRequestSchema = z.object({
  snapshot: clinicSnapshotSchema,
  page: z.string().max(120).optional(),
  messages: z.array(chatMessageSchema).min(1).max(24),
});

export const chatResponseSchema = z.object({
  reply: z.string(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;
