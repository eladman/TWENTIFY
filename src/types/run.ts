export type RunSessionType = 'easy' | 'tempo' | 'intervals' | 'walk_run';

export interface RunInterval {
  type: 'work' | 'rest' | 'walk' | 'run';
  durationSeconds: number;
  targetHrPct?: number;
}

export interface RunTemplate {
  id: string;
  name: string;
  type: RunSessionType;
  targetDurationMin: number;
  targetZone?: string;
  intervals?: RunInterval[];
}

export interface ActiveRun {
  templateId: string;
  startedAt: string;
  isPaused: boolean;
  elapsedSeconds: number;
  currentIntervalIndex?: number;
  distanceMeters?: number;
}

export interface CompletedRun {
  id: string;
  templateId: string;
  sessionType: RunSessionType;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  distanceMeters?: number;
  avgHr?: number;
}

// ── Segment-based run types ───────────────────────────────────────────

export type RunSegmentType = 'walk' | 'run' | 'warmup' | 'cooldown' | 'work' | 'recovery';

export interface RunSegment {
  type: RunSegmentType;
  durationSeconds: number;
  targetIntensity: string;
  targetHRPercent?: { min: number; max: number };
}

export interface RunSession {
  id: string;
  name: string;
  type: RunSessionType;
  description: string;
  totalDurationMinutes: number;
  segments: RunSegment[];
  citationIds: string[];
  talkTestGuidance: string;
}

export interface WalkRunWeek {
  week: number;
  sessions: RunSession[];
  description: string;
}
