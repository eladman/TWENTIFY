// ── Types ──────────────────────────────────────────────────────────────

export interface OnboardingOption {
  label: string;
  value: string;
  icon?: string; // emoji
}

export interface OnboardingQuestion {
  id: string;
  question: string;
  type: 'single_select' | 'multi_select' | 'numeric_form';
  options?: OnboardingOption[];
  fields?: {
    key: string;
    label: string;
    placeholder: string;
    unit?: string;
    keyboardType: string;
  }[];
  /**
   * Returns true when this question is eligible to be shown.
   *
   * storeKey routing (handled by assessment screen):
   *   'goal'         → useUserStore.setGoal(value as Goal)
   *   'fitnessLevel' → useUserStore.setFitnessLevel(value as FitnessLevel)
   *   'profile'      → useUserStore.setProfile({ ...current, [field]: coerced })
   *
   * Value coercion (handled by assessment screen):
   *   gym_days       → Number(value) for gymDaysPerWeek
   *   has_hr_monitor → value === 'true' for hasHrMonitor
   */
  showWhen: (
    domains: string[],
    previousAnswers: Record<string, any>,
  ) => boolean;
  storeKey: string;
}

// ── Typed helper ───────────────────────────────────────────────────────

const q = (question: OnboardingQuestion): OnboardingQuestion => question;

// ── Questions ──────────────────────────────────────────────────────────

// ── Universal (always shown) ───────────────────────────────────────────

const goal = q({
  id: 'goal',
  question: "What's your primary goal?",
  type: 'single_select',
  options: [
    { label: 'Lose fat', value: 'fat_loss', icon: '🔥' },
    { label: 'Build muscle', value: 'muscle_build', icon: '💪' },
    { label: 'Stay healthy', value: 'maintenance', icon: '🧘' },
  ],
  showWhen: () => true,
  storeKey: 'goal',
});

const fitnessLevel = q({
  id: 'fitness_level',
  question: 'How would you describe your fitness experience?',
  type: 'single_select',
  options: [
    { label: 'New to fitness', value: 'beginner', icon: '🌱' },
    { label: 'Some experience', value: 'intermediate', icon: '📈' },
    { label: 'Experienced', value: 'advanced', icon: '🏆' },
  ],
  showWhen: () => true,
  storeKey: 'fitnessLevel',
});

// ── Gym-specific ───────────────────────────────────────────────────────

const gymDays = q({
  id: 'gym_days',
  question: 'How many days can you train per week?',
  type: 'single_select',
  options: [
    { label: '3 days', value: '3', icon: '📅' },
    { label: '4 days', value: '4', icon: '🗓️' },
  ],
  showWhen: (domains) => domains.includes('gym') && !domains.includes('running'),
  storeKey: 'profile',
});

const trainingDays = q({
  id: 'training_days',
  question: 'How many days per week can you train?',
  type: 'single_select',
  options: [
    { label: '3 days', value: '3', icon: '📅' },
    { label: '4 days', value: '4', icon: '📅' },
    { label: '5 days', value: '5', icon: '🗓️' },
  ],
  showWhen: (domains) => domains.includes('gym') && domains.includes('running'),
  storeKey: 'profile',
});

const equipment = q({
  id: 'equipment',
  question: 'What equipment do you have access to?',
  type: 'single_select',
  options: [
    { label: 'Full gym (barbells + machines)', value: 'full_gym', icon: '🏋️' },
    { label: 'Dumbbells only', value: 'dumbbells', icon: '🥊' },
    { label: 'Bodyweight only', value: 'bodyweight', icon: '🤸' },
  ],
  showWhen: (domains) => domains.includes('gym'),
  storeKey: 'profile',
});

// ── Running-specific ───────────────────────────────────────────────────

const runningLevel = q({
  id: 'running_level',
  question: 'Can you currently run for 20+ minutes without stopping?',
  type: 'single_select',
  options: [
    { label: 'Yes', value: 'can_run_20min', icon: '✅' },
    { label: 'No', value: 'cant_run_20min', icon: '❌' },
    { label: 'Not sure', value: 'cant_run_20min', icon: '🤔' },
  ],
  showWhen: (domains) => domains.includes('running'),
  storeKey: 'profile',
});

const hasHrMonitor = q({
  id: 'has_hr_monitor',
  question: 'Do you have a heart rate monitor or smartwatch?',
  type: 'single_select',
  options: [
    { label: 'Yes', value: 'true', icon: '⌚' },
    { label: 'No', value: 'false', icon: '❌' },
  ],
  showWhen: (domains) => domains.includes('running'),
  storeKey: 'profile',
});

// ── Nutrition-specific ─────────────────────────────────────────────────

const bodyStats = q({
  id: 'body_stats',
  question: 'Quick stats for your nutrition plan',
  type: 'numeric_form',
  fields: [
    { key: 'age', label: 'Age', placeholder: 'e.g. 28', unit: 'yrs', keyboardType: 'numeric' },
    { key: 'weightKg', label: 'Weight', placeholder: 'e.g. 75', unit: 'kg', keyboardType: 'numeric' },
    { key: 'heightCm', label: 'Height', placeholder: 'e.g. 175', unit: 'cm', keyboardType: 'numeric' },
    { key: 'sex', label: 'Sex', placeholder: 'male / female', keyboardType: 'default' },
  ],
  showWhen: (domains) => domains.includes('nutrition'),
  storeKey: 'profile',
});

// ── Question array & lookup ────────────────────────────────────────────

const questionArray: OnboardingQuestion[] = [
  goal,
  fitnessLevel,
  gymDays,
  trainingDays,
  equipment,
  runningLevel,
  hasHrMonitor,
  bodyStats,
];

const questionById: Record<string, OnboardingQuestion> = Object.fromEntries(
  questionArray.map((question) => [question.id, question]),
);

// ── getQuestionsForDomains ─────────────────────────────────────────────

const MAX_QUESTIONS = 5;

/**
 * Priority-ordered question IDs per domain combination.
 * Key = sorted, comma-joined domain list.
 * All paths respect the MAX 5 cap.
 */
const QUESTION_PRIORITY: Record<string, string[]> = {
  // Single domains
  gym: ['goal', 'fitness_level', 'gym_days', 'equipment'],
  running: ['goal', 'fitness_level', 'running_level', 'has_hr_monitor'],
  nutrition: ['goal', 'fitness_level', 'body_stats'],

  // Two-domain combinations
  'gym,nutrition': ['goal', 'fitness_level', 'gym_days', 'equipment', 'body_stats'],
  'gym,running': ['goal', 'fitness_level', 'training_days', 'equipment', 'running_level'],
  'nutrition,running': ['goal', 'fitness_level', 'running_level', 'has_hr_monitor', 'body_stats'],

  // All three — running_level derived from fitness_level, hasHrMonitor defaults false
  'gym,nutrition,running': ['goal', 'fitness_level', 'body_stats', 'training_days', 'equipment'],
};

export function getQuestionsForDomains(domains: string[]): OnboardingQuestion[] {
  if (domains.length === 0) return [];

  const key = [...domains].sort().join(',');
  const ids = QUESTION_PRIORITY[key] ?? ['goal', 'fitness_level'];

  return ids
    .slice(0, MAX_QUESTIONS)
    .map((id) => questionById[id])
    .filter((item): item is OnboardingQuestion => item != null);
}

// ── Exports ────────────────────────────────────────────────────────────

export const onboardingQuestions: OnboardingQuestion[] = questionArray;
