import type {
  RunSegment,
  RunSegmentType,
  RunSession,
  RunSessionType,
  RunTemplate,
  RunInterval,
  WalkRunWeek,
} from '@/types/run';

// ── Segment builder helpers ───────────────────────────────────────────

function warmup(durationSeconds: number): RunSegment {
  return {
    type: 'warmup',
    durationSeconds,
    targetIntensity: 'easy walk',
    targetHRPercent: { min: 50, max: 60 },
  };
}

function cooldown(durationSeconds: number): RunSegment {
  return {
    type: 'cooldown',
    durationSeconds,
    targetIntensity: 'easy walk',
    targetHRPercent: { min: 50, max: 60 },
  };
}

function walk(durationSeconds: number): RunSegment {
  return {
    type: 'walk',
    durationSeconds,
    targetIntensity: 'easy',
    targetHRPercent: { min: 50, max: 65 },
  };
}

function run(
  durationSeconds: number,
  intensity = 'conversational pace',
  hrMin = 60,
  hrMax = 70,
): RunSegment {
  return {
    type: 'run',
    durationSeconds,
    targetIntensity: intensity,
    targetHRPercent: { min: hrMin, max: hrMax },
  };
}

function work(
  durationSeconds: number,
  intensity: string,
  hrMin: number,
  hrMax: number,
): RunSegment {
  return {
    type: 'work',
    durationSeconds,
    targetIntensity: intensity,
    targetHRPercent: { min: hrMin, max: hrMax },
  };
}

function recovery(durationSeconds: number): RunSegment {
  return {
    type: 'recovery',
    durationSeconds,
    targetIntensity: 'easy jog',
    targetHRPercent: { min: 55, max: 65 },
  };
}

/** Repeats a segment pattern N times */
function repeatSegments(segments: RunSegment[], rounds: number): RunSegment[] {
  return Array.from({ length: rounds }, () => segments).flat();
}

/** Sums segment durations to whole minutes */
function totalMinutes(segments: RunSegment[]): number {
  const totalSec = segments.reduce((sum, seg) => sum + seg.durationSeconds, 0);
  return Math.round(totalSec / 60);
}

// ── Walk/Run session factory ──────────────────────────────────────────

const WARMUP_SECONDS = 180; // 3 min
const COOLDOWN_SECONDS = 120; // 2 min

function makeWalkRunSession(
  week: number,
  sessionIndex: number,
  coreSegments: RunSegment[],
  nameOverride?: string,
  descriptionOverride?: string,
): RunSession {
  const allSegments = [
    warmup(WARMUP_SECONDS),
    ...coreSegments,
    cooldown(COOLDOWN_SECONDS),
  ];

  return {
    id: `wr_w${week}_s${sessionIndex + 1}`,
    name: nameOverride ?? `Walk/Run W${week}D${sessionIndex + 1}`,
    type: 'walk_run',
    description:
      descriptionOverride ?? `Week ${week} walk/run progression session.`,
    totalDurationMinutes: totalMinutes(allSegments),
    segments: allSegments,
    citationIds: [],
    talkTestGuidance:
      'During walk segments, speak freely. During run segments, you should manage short sentences but feel slightly winded.',
  };
}

// ── Beginner Walk/Run Progression (8 weeks, 3 sessions/week) ──────────

export const walkRunProgression: WalkRunWeek[] = [
  // Week 1: Walk 2:00 / Run 0:30 × 8
  {
    week: 1,
    description: 'Walk 2 min, Run 30 sec × 8 rounds',
    sessions: Array.from({ length: 3 }, (_, i) =>
      makeWalkRunSession(1, i, repeatSegments([walk(120), run(30)], 8)),
    ),
  },

  // Week 2: Walk 2:00 / Run 1:00 × 7
  {
    week: 2,
    description: 'Walk 2 min, Run 1 min × 7 rounds',
    sessions: Array.from({ length: 3 }, (_, i) =>
      makeWalkRunSession(2, i, repeatSegments([walk(120), run(60)], 7)),
    ),
  },

  // Week 3: Walk 1:30 / Run 1:30 × 7
  {
    week: 3,
    description: 'Walk 1:30, Run 1:30 × 7 rounds',
    sessions: Array.from({ length: 3 }, (_, i) =>
      makeWalkRunSession(3, i, repeatSegments([walk(90), run(90)], 7)),
    ),
  },

  // Week 4: Walk 1:00 / Run 2:00 × 7
  {
    week: 4,
    description: 'Walk 1 min, Run 2 min × 7 rounds',
    sessions: Array.from({ length: 3 }, (_, i) =>
      makeWalkRunSession(4, i, repeatSegments([walk(60), run(120)], 7)),
    ),
  },

  // Week 5: 2× Walk 1:00 / Run 3:00 × 5  +  1× easy 15 min continuous
  {
    week: 5,
    description: 'Walk 1 min, Run 3 min × 5 rounds + 1 easy 15 min run',
    sessions: [
      ...Array.from({ length: 2 }, (_, i) =>
        makeWalkRunSession(5, i, repeatSegments([walk(60), run(180)], 5)),
      ),
      makeWalkRunSession(
        5,
        2,
        [run(900)],
        'Easy Run 15 min',
        'Your first continuous easy run. Keep it conversational.',
      ),
    ],
  },

  // Week 6: 2× Walk 0:30 / Run 4:00 × 5  +  1× easy 18 min continuous
  {
    week: 6,
    description: 'Walk 30 sec, Run 4 min × 5 rounds + 1 easy 18 min run',
    sessions: [
      ...Array.from({ length: 2 }, (_, i) =>
        makeWalkRunSession(6, i, repeatSegments([walk(30), run(240)], 5)),
      ),
      makeWalkRunSession(
        6,
        2,
        [run(1080)],
        'Easy Run 18 min',
        'Continuous easy run. Slow enough to hold a conversation.',
      ),
    ],
  },

  // Week 7: 2× Walk 0:30 / Run 5:00 × 4  +  1× easy 22 min continuous
  {
    week: 7,
    description: 'Walk 30 sec, Run 5 min × 4 rounds + 1 easy 22 min run',
    sessions: [
      ...Array.from({ length: 2 }, (_, i) =>
        makeWalkRunSession(7, i, repeatSegments([walk(30), run(300)], 4)),
      ),
      makeWalkRunSession(
        7,
        2,
        [run(1320)],
        'Easy Run 22 min',
        'Extended continuous easy run. Conversational pace throughout.',
      ),
    ],
  },

  // Week 8: Run 10 / Walk 1 / Run 10  +  Easy 25 min  +  Easy 20 min
  {
    week: 8,
    description: 'Run 10 / Walk 1 / Run 10 + easy 25 min + easy 20 min',
    sessions: [
      makeWalkRunSession(
        8,
        0,
        [run(600), walk(60), run(600)],
        'Run 10 / Walk 1 / Run 10',
        'Two 10-minute run blocks with a brief walk break.',
      ),
      makeWalkRunSession(
        8,
        1,
        [run(1500)],
        'Easy Run 25 min',
        'Your longest continuous run. Keep it easy and conversational.',
      ),
      makeWalkRunSession(
        8,
        2,
        [run(1200)],
        'Easy Run 20 min',
        'A relaxed 20-minute run to close out the program.',
      ),
    ],
  },
];

// ── Standard Easy Run ─────────────────────────────────────────────────

export const easyRunTemplate: RunSession = {
  id: 'easy_run',
  name: 'Easy Run',
  type: 'easy',
  description:
    'Conversational-pace run in Zone 2. The foundation of aerobic fitness.',
  totalDurationMinutes: 33, // 5 warmup + 25 main + 3 cooldown
  segments: [
    warmup(300), // 5 min easy walk/jog
    run(1500), // 25 min Zone 2
    cooldown(180), // 3 min cooldown walk
  ],
  citationIds: [],
  talkTestGuidance:
    'You should be able to speak in full sentences. If you can only say a few words, slow down.',
};

// ── Tempo Run ─────────────────────────────────────────────────────────

export const tempoRunTemplate: RunSession = {
  id: 'tempo_run',
  name: 'Tempo Run',
  type: 'tempo',
  description:
    'Comfortably hard sustained effort at lactate threshold pace.',
  totalDurationMinutes: 30, // 5 warmup + 20 tempo + 5 cooldown
  segments: [
    warmup(300), // 5 min easy warmup jog
    work(1200, 'comfortably hard', 80, 88), // 20 min tempo
    cooldown(300), // 5 min easy cooldown jog
  ],
  citationIds: [],
  talkTestGuidance:
    'Comfortably hard. You can speak in short phrases but not full sentences.',
};

// ── Interval Session ──────────────────────────────────────────────────

export const intervalTemplate: RunSession = {
  id: 'interval_session',
  name: 'Interval Session',
  type: 'intervals',
  description:
    '5 rounds of 3-minute hard efforts with equal recovery. Builds speed and VO2max.',
  totalDurationMinutes: 40, // 5 warmup + 5×(3+3) + 5 cooldown
  segments: [
    warmup(300), // 5 min warmup
    ...repeatSegments(
      [
        work(180, '85-95% HRmax', 85, 95), // 3 min work
        recovery(180), // 3 min recovery jog
      ],
      5,
    ),
    cooldown(300), // 5 min cooldown
  ],
  citationIds: [],
  talkTestGuidance:
    'Work: Hard effort. Only a few words at a time. Recovery: Easy. Full conversation possible.',
};

// ── Exports: record + array (matches exercises.ts pattern) ────────────

export const runSessions: Record<string, RunSession> = {
  [easyRunTemplate.id]: easyRunTemplate,
  [tempoRunTemplate.id]: tempoRunTemplate,
  [intervalTemplate.id]: intervalTemplate,
};

export const runSessionList: RunSession[] = [
  easyRunTemplate,
  tempoRunTemplate,
  intervalTemplate,
];

// ── RunSession → RunTemplate converter (store compatibility) ──────────

const segmentTypeToIntervalType: Record<RunSegmentType, RunInterval['type']> = {
  walk: 'walk',
  warmup: 'walk',
  cooldown: 'walk',
  run: 'run',
  work: 'work',
  recovery: 'rest',
};

export function toRunTemplate(session: RunSession): RunTemplate {
  return {
    id: session.id,
    name: session.name,
    type: session.type,
    targetDurationMin: session.totalDurationMinutes,
    targetZone:
      session.type === 'easy'
        ? 'Zone 2'
        : session.type === 'tempo'
          ? 'Zone 4'
          : undefined,
    intervals: session.segments.map(
      (seg): RunInterval => ({
        type: segmentTypeToIntervalType[seg.type],
        durationSeconds: seg.durationSeconds,
        targetHrPct: seg.targetHRPercent
          ? Math.round((seg.targetHRPercent.min + seg.targetHRPercent.max) / 2)
          : undefined,
      }),
    ),
  };
}

// ── Lookup utilities ──────────────────────────────────────────────────

/**
 * Returns the appropriate RunSession for a given type.
 *
 * For 'walk_run': returns the session at the given week (1-8) and
 * sessionIndex (0-2). Defaults to week 1, session 0.
 */
export function getRunSessionForDay(
  type: RunSessionType,
  weekNumber = 1,
  sessionIndex = 0,
): RunSession {
  if (type === 'walk_run') {
    const clampedWeek = Math.max(1, Math.min(8, weekNumber));
    const week = walkRunProgression[clampedWeek - 1];
    const clampedIdx = Math.max(0, Math.min(week.sessions.length - 1, sessionIndex));
    return week.sessions[clampedIdx];
  }

  switch (type) {
    case 'easy':
      return easyRunTemplate;
    case 'tempo':
      return tempoRunTemplate;
    case 'intervals':
      return intervalTemplate;
  }
}

/** Returns the full WalkRunWeek for a given week number (1-8) */
export function getWalkRunWeek(weekNumber: number): WalkRunWeek | undefined {
  return walkRunProgression.find((w) => w.week === weekNumber);
}
