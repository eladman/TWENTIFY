import type { Domain } from './user';
import type { DayPlan, GymPlan, RunPlan } from './plan';
import type { NutritionPlan } from './nutrition';

// ── Chat phases ──────────────────────────────────────────────────────────

export type ChatPhase = 'gathering' | 'generating' | 'reviewing' | 'complete';

// ── Messages ─────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  /** Suggested quick-reply options from the AI */
  suggestedQuestions?: string[];
  /** Plan attached to this message (assistant only) */
  plan?: AiGeneratedPlan;
}

// ── AI-generated plan (matches usePlanStore.setPlan format) ──────────────

export interface AiGeneratedPlan {
  weeklySchedule: DayPlan[];
  gymPlan?: GymPlan;
  runPlan?: RunPlan;
  nutritionPlan?: NutritionPlan;
}

// ── Request / Response ───────────────────────────────────────────────────

export interface AiCoachRequest {
  messages: { role: 'user' | 'assistant'; content: string }[];
  domains: Domain[];
  /** Optional user context for richer personalization */
  userContext?: {
    age?: number;
    weightKg?: number;
    heightCm?: number;
    sex?: 'male' | 'female';
    fitnessLevel?: string;
    goal?: string;
    equipmentAccess?: string;
    runningLevel?: string;
  };
}

export interface AiCoachResponse {
  message: string;
  plan?: AiGeneratedPlan;
  suggestedQuestions?: string[];
  phase: ChatPhase;
}
