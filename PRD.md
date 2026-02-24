# Twentify — MVP Product Requirements Document
### Version 2.0 | February 2026

> **Purpose of this document:** This is the single source of truth for building the Twentify MVP. It's written for an AI coding agent (Claude Opus 4.6 in terminal) and any human developer working on the project. Every screen, feature, flow, and technical decision is documented here. If it's not in this document, it's not in the MVP.

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Target User](#2-target-user)
3. [MVP Scope — What's In, What's Out](#3-mvp-scope)
4. [Tech Stack](#4-tech-stack)
5. [Project Structure](#5-project-structure)
6. [Data Architecture](#6-data-architecture)
7. [Onboarding Flow](#7-onboarding-flow)
8. [Screen-by-Screen Specifications](#8-screen-specifications)
9. [Core Algorithms & Logic](#9-core-algorithms)
10. [AI Coach Behavior](#10-ai-coach)
11. [Monetization & Paywall](#11-monetization)
12. [Navigation & Information Architecture](#12-navigation)
13. [State Management](#13-state-management)
14. [API & Backend](#14-api-backend)
15. [Analytics & Events](#15-analytics)
16. [Phasing & Milestones](#16-phasing)
17. [Success Metrics](#17-success-metrics)
18. [Design System Reference](#18-design-system)

---

## 1. Product Vision <a name="1-product-vision"></a>

### One-Liner
Twentify delivers the 20% of fitness that generates 80% of results — backed by peer-reviewed science, not opinions.

### The Problem
People download fitness apps, get overwhelmed by 500 exercises, 12 dashboard tabs, and endless content, then quit within 5 months (80% abandonment rate). The average person tries 4.2 fitness apps before giving up entirely.

### Our Solution
Strip fitness down to what the science says actually works. Three domains — **Gym, Running, Nutrition** — each reduced to the minimum effective dose. Every recommendation has a citation. No bro-science. No influencer opinions. You open the app, see today's plan, do it in 25-40 minutes, and close the app.

### Core Beliefs (Non-Negotiable)
1. **Less is more.** The app should feel like it's *removing* complexity from your life, not adding it.
2. **Science is the authority.** Every exercise, every set count, every nutrition rule links to a peer-reviewed source. If we can't cite it, it's not in the app.
3. **The app serves your life, not the other way around.** We want users to spend as LITTLE time in the app as possible. Time-in-app is not a success metric; session completion is.
4. **No guilt.** Missed a workout? "No big deal. Here's your adjusted plan." Never: "You broke your streak! 😢"
5. **Calm confidence.** The tone is a knowledgeable friend who happens to have read every meta-analysis — not a hype-bro personal trainer.

### Positioning
- **Not** another fitness app with everything
- **Not** a social platform (no feeds, no likes, no challenges)
- **Not** a gamified experience (no streaks with guilt, no badges, no XP)
- **Is** a research-backed fitness tool for people who want results with minimum time investment

---

## 2. Target User <a name="2-target-user"></a>

### Primary Persona: The Busy Professional
- **Age:** 25-45
- **Lifestyle:** Works full-time, values efficiency, limited free time
- **Fitness level:** Beginner to intermediate (has gone to the gym before, maybe runs occasionally, knows they should eat better)
- **Motivation:** Wants to be fit and healthy but doesn't want fitness to be their hobby
- **Pain point:** "I don't have time to figure out what works. Just tell me what to do."
- **Platforms:** iOS primary, Android secondary

### User Personas

**Emma K., 32, Product Manager**
> "I deleted 4 fitness apps before this. I just want someone to tell me what to do — gym days, run days, what to eat. I do it and move on with my life."
- Domains: Gym + Nutrition
- Schedule: 3-4 days/week, 30 min max
- Goal: Lose fat, tone up

**Dan R., 28, Software Engineer**
> "Every recommendation has a citation. Every single one. I stopped second-guessing my gym plan and my running routine in the same week."
- Domains: Gym + Running
- Schedule: 5 days/week, flexible timing
- Goal: Build muscle, improve cardio

**Ben M., 41, Startup Founder**
> "3 workouts, 2 runs, basic nutrition rules. 25–30 min a day. I'm in better shape at 41 than I was at 30."
- Domains: Gym + Running + Nutrition
- Schedule: 6 days/week, early morning
- Goal: Overall health and energy

---

## 3. MVP Scope — What's In, What's Out <a name="3-mvp-scope"></a>

### ✅ IN (MVP v1.0)

| Feature | Description |
|---------|-------------|
| **Onboarding** | Domain selection → 5-question assessment → plan preview → start |
| **Today Screen** | Single card showing today's plan (workout, run, nutrition tip, or rest day) |
| **Gym Domain** | 3-day and 4-day programs, compound exercises, guided workout with timer |
| **Running Domain** | 2 easy + 1 quality session structure, Zone 2 guidance, beginner walk/run progression |
| **Nutrition Domain** | Goal-based nutrition rules (fat loss / muscle build / maintenance), protein targets, hand-portion system |
| **Active Workout** | Full-screen takeover: exercise name, sets, reps, weight input, rest timer, next exercise |
| **Active Run** | Full-screen: timer, target zone indicator (with Talk Test prompt for no-HR users), distance (if GPS) |
| **Workout/Run Summary** | Post-session stats card |
| **Progress Screen** | Weekly consistency grid + simple trend lines (weight lifted over time, run distance over time) |
| **Profile/Settings** | Domain management, units, notifications, account |
| **Paywall** | Free tier + Pro subscription ($9.99/mo or $79.99/yr) |
| **Research Citations** | Tap any exercise or recommendation → see the study behind it |
| **Push Notifications** | Workout reminders, rest day messages |

### ❌ OUT (Not in MVP)

| Feature | Why It's Out | Phase |
|---------|-------------|-------|
| Social features | Not our product. Users don't need a feed. | Never |
| Apple Watch app | Requires separate Swift target, adds complexity | Phase 2 |
| iOS Widgets | Requires separate Swift target | Phase 2 |
| Dark mode | Design for light mode only first | Phase 2 |
| Cycling domain | Focus on 3 domains first | Phase 2 |
| Recovery domain | Focus on 3 domains first | Phase 2 |
| Custom workout builder | We tell you what to do. You don't build your own. | Phase 3 |
| Meal plans / recipes | We give rules and targets, not meal plans | Phase 3 |
| Calorie/food tracking | We use hand portions, not MyFitnessPal-style logging | Phase 3 |
| AI chat interface | The AI speaks through the plan, not a chatbot | Phase 3 |
| Barcode scanner | Not aligned with hand-portion simplicity | Never |
| Video exercise demos | Static illustrations or animations only | Phase 2 |
| Wearable integrations (Garmin, Whoop, etc.) | Apple Health only for MVP | Phase 2 |

### Hard Constraints
- **12 screens maximum.** If a feature requires a new screen, it's not in v1.
- **30 seconds to first value.** From app open to seeing your plan.
- **2 taps to start a workout.** Open app → tap "Start" on today's card.
- **Zero mandatory account creation.** Users can use the app without signing up. Account only required for sync/Pro.

---

## 4. Tech Stack <a name="4-tech-stack"></a>

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | React Native (Expo SDK 52+) | Cross-platform, Elad's existing expertise, fast iteration |
| **Language** | TypeScript (strict mode) | Type safety, better DX with AI agents |
| **Navigation** | Expo Router (file-based) | Native-feeling navigation, deep linking support |
| **State Management** | Zustand + MMKV for persistence | Lightweight, fast, no boilerplate |
| **Backend** | Supabase (PostgreSQL + Auth + Edge Functions) | Familiar stack, fast to set up, real-time sync |
| **Auth** | Supabase Auth (Email + Apple Sign In + Google) | Apple required for iOS, Google for Android |
| **Payments** | RevenueCat | Best-in-class subscription management for RN |
| **Animations** | React Native Reanimated 3 | 60fps native thread animations |
| **Haptics** | expo-haptics | Tactile feedback on key actions |
| **Push Notifications** | expo-notifications + Supabase Edge Functions | Scheduled reminders |
| **Analytics** | PostHog (self-hosted or cloud) | Privacy-friendly, product analytics |
| **Error Tracking** | Sentry | Crash reporting |
| **OTA Updates** | EAS Update | Push fixes without App Store review |
| **CI/CD** | EAS Build + GitHub Actions | Automated builds and deploys |

### Key Dependencies (npm packages)

```json
{
  "expo": "~52.x",
  "expo-router": "~4.x",
  "react-native-reanimated": "~3.x",
  "zustand": "^5.x",
  "react-native-mmkv": "^3.x",
  "@supabase/supabase-js": "^2.x",
  "react-native-purchases": "^8.x",
  "@expo-google-fonts/dm-sans": "*",
  "@expo-google-fonts/ibm-plex-mono": "*",
  "expo-haptics": "~14.x",
  "expo-notifications": "~0.29.x",
  "posthog-react-native": "^3.x",
  "@sentry/react-native": "^6.x",
  "date-fns": "^4.x"
}
```

---

## 5. Project Structure <a name="5-project-structure"></a>

```
twentify/
├── app/                          # Expo Router file-based routing
│   ├── _layout.tsx               # Root layout (font loading, providers)
│   ├── index.tsx                 # Entry → redirect to onboarding or tabs
│   ├── (onboarding)/
│   │   ├── _layout.tsx           # Onboarding stack layout
│   │   ├── domains.tsx           # Step 1: Pick domains
│   │   ├── assessment.tsx        # Step 2: 5 questions
│   │   └── preview.tsx           # Step 3: Plan preview → start
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab bar layout (3 tabs)
│   │   ├── today.tsx             # Today screen (main)
│   │   ├── progress.tsx          # Progress dashboard
│   │   └── profile.tsx           # Profile & settings
│   ├── workout/
│   │   ├── [id].tsx              # Active Workout screen
│   │   └── summary.tsx           # Post-workout summary
│   ├── run/
│   │   ├── active.tsx            # Active Run screen
│   │   └── summary.tsx           # Post-run summary
│   ├── exercise/
│   │   └── [id].tsx              # Exercise detail + research citation
│   └── paywall.tsx               # Subscription screen
├── src/
│   ├── theme/                    # Design system tokens (see DESIGN_SYSTEM.md)
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   ├── radius.ts
│   │   ├── shadows.ts
│   │   └── index.ts
│   ├── components/
│   │   ├── ui/                   # Shared UI primitives
│   │   │   ├── Text.tsx          # Typed text (heading.xl, body.md, etc.)
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── BottomSheet.tsx
│   │   │   └── Toast.tsx
│   │   ├── today/                # Today screen components
│   │   │   ├── WorkoutCard.tsx
│   │   │   ├── RunCard.tsx
│   │   │   ├── NutritionCard.tsx
│   │   │   └── RestDayCard.tsx
│   │   ├── workout/              # Active workout components
│   │   │   ├── ExerciseView.tsx
│   │   │   ├── SetRow.tsx
│   │   │   ├── RestTimer.tsx
│   │   │   └── WorkoutSummary.tsx
│   │   ├── run/                  # Active run components
│   │   │   ├── RunTimer.tsx
│   │   │   ├── ZoneIndicator.tsx
│   │   │   └── RunSummary.tsx
│   │   └── progress/             # Progress components
│   │       ├── ConsistencyGrid.tsx
│   │       └── TrendChart.tsx
│   ├── stores/                   # Zustand stores
│   │   ├── useUserStore.ts       # User profile, settings, onboarding state
│   │   ├── useWorkoutStore.ts    # Active workout state, history
│   │   ├── useRunStore.ts        # Active run state, history
│   │   ├── useNutritionStore.ts  # Nutrition goals, daily tracking
│   │   └── usePlanStore.ts       # Generated plan, schedule
│   ├── services/
│   │   ├── supabase.ts           # Supabase client
│   │   ├── auth.ts               # Auth helpers
│   │   ├── planGenerator.ts      # AI plan generation logic
│   │   ├── progressiveOverload.ts # Overload calculation engine
│   │   └── revenueCat.ts         # Subscription management
│   ├── data/
│   │   ├── exercises.ts          # Exercise database (compound lifts + alternatives)
│   │   ├── runTemplates.ts       # Run session templates
│   │   ├── nutritionRules.ts     # Nutrition rules per goal
│   │   ├── citations.ts          # Research citations database
│   │   └── onboardingQuestions.ts # Assessment questions
│   ├── utils/
│   │   ├── calculations.ts       # TDEE, protein, Zone 2 HR calculations
│   │   ├── formatters.ts         # Weight, time, distance formatters
│   │   └── haptics.ts            # Haptic feedback helpers
│   └── types/
│       ├── workout.ts
│       ├── run.ts
│       ├── nutrition.ts
│       ├── user.ts
│       └── plan.ts
├── assets/
│   ├── icons/                    # SF Symbol equivalents
│   └── images/                   # App icon, splash screen
├── DESIGN_SYSTEM.md              # Full design system documentation
├── PRD.md                        # This file
├── supabase/
│   ├── migrations/               # Database migrations
│   └── functions/                # Edge functions
└── app.config.ts                 # Expo config
```

---

## 6. Data Architecture <a name="6-data-architecture"></a>

### Local Storage (MMKV — works offline)

All workout data is stored locally first, synced to Supabase when online. The app MUST work fully offline.

### Supabase Schema

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  onboarding_completed BOOLEAN DEFAULT false,
  subscription_tier TEXT DEFAULT 'free', -- 'free' | 'pro'
  units TEXT DEFAULT 'metric', -- 'metric' | 'imperial'
  settings JSONB DEFAULT '{}'
);

-- User Profile (assessment answers + calculated values)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  domains TEXT[] NOT NULL, -- ['gym', 'running', 'nutrition']
  fitness_level TEXT NOT NULL, -- 'beginner' | 'intermediate' | 'advanced'
  goal TEXT NOT NULL, -- 'fat_loss' | 'muscle_build' | 'maintenance'
  gym_days_per_week INT, -- 3 or 4
  run_days_per_week INT, -- 2 or 3
  age INT,
  weight_kg DECIMAL,
  height_cm DECIMAL,
  sex TEXT, -- 'male' | 'female' (for TDEE calculation only)
  resting_hr INT, -- for Zone 2 calculation (optional)
  tdee_estimated INT, -- calculated
  protein_target_g INT, -- calculated
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Generated Plans
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL, -- 'gym_3day' | 'gym_4day' | 'run_3day' | 'run_2day' | 'nutrition'
  plan_data JSONB NOT NULL, -- full plan structure
  week_number INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Workout Sessions (completed)
CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id),
  workout_template TEXT NOT NULL, -- 'lower_a' | 'upper_a' | 'full_body_a' etc.
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  duration_seconds INT,
  exercises JSONB NOT NULL, -- array of {exercise_id, sets: [{reps, weight_kg, completed}]}
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Run Sessions (completed)
CREATE TABLE run_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id),
  session_type TEXT NOT NULL, -- 'easy' | 'tempo' | 'intervals' | 'walk_run'
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  duration_seconds INT,
  distance_meters DECIMAL, -- if GPS available
  avg_hr INT, -- if HR monitor available
  target_zone TEXT, -- 'zone2' | 'tempo' | 'interval'
  intervals JSONB, -- for interval sessions: [{type, duration, target_hr_pct}]
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Nutrition Check-ins (simple daily tracking)
CREATE TABLE nutrition_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  protein_servings INT DEFAULT 0, -- number of palm-sized protein portions
  veggie_servings INT DEFAULT 0,
  water_glasses INT DEFAULT 0,
  followed_plan BOOLEAN,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Exercise Library
CREATE TABLE exercises (
  id TEXT PRIMARY KEY, -- 'barbell_squat', 'bench_press', etc.
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'compound' | 'isolation' | 'bodyweight'
  movement_pattern TEXT NOT NULL, -- 'squat' | 'hinge' | 'push_horizontal' | 'push_vertical' | 'pull_horizontal' | 'pull_vertical'
  primary_muscles TEXT[] NOT NULL,
  secondary_muscles TEXT[],
  equipment TEXT NOT NULL, -- 'barbell' | 'dumbbell' | 'bodyweight' | 'cable' | 'machine'
  alternatives TEXT[], -- IDs of alternative exercises
  citation_ids TEXT[], -- references to citations table
  instructions TEXT,
  cues TEXT[] -- form cues: ["Drive through heels", "Keep chest up"]
);

-- Research Citations
CREATE TABLE citations (
  id TEXT PRIMARY KEY, -- 'schoenfeld_2017_volume'
  authors TEXT NOT NULL,
  year INT NOT NULL,
  title TEXT NOT NULL,
  journal TEXT NOT NULL,
  finding TEXT NOT NULL, -- one-sentence takeaway
  doi TEXT,
  confidence TEXT NOT NULL -- 'high' | 'medium' | 'low'
);
```

---

## 7. Onboarding Flow <a name="7-onboarding-flow"></a>

### Philosophy
- No account creation required
- No splash screen carousels or "feature tours"
- 45 seconds to first plan preview
- All data stored locally until user optionally creates account

### Step 1: Domain Selection (Screen: `domains.tsx`)

**UI:** Three large tappable cards, full-width, stacked vertically.

```
┌─────────────────────────────┐
│  🏋️  GYM                    │
│  Strength training.          │
│  The vital few exercises.    │
│  ☐                           │
└─────────────────────────────┘
┌─────────────────────────────┐
│  🏃  RUNNING                 │
│  Cardio & endurance.         │
│  The 80/20 of running.       │
│  ☐                           │
└─────────────────────────────┘
┌─────────────────────────────┐
│  🍽  NUTRITION               │
│  What to eat.                │
│  The rules that matter.      │
│  ☐                           │
└─────────────────────────────┘

[Continue →]  (enabled when ≥1 selected)
```

**Logic:** User selects 1-3 domains. Selection is stored in local state. At least 1 domain required.

### Step 2: Quick Assessment (Screen: `assessment.tsx`)

**UI:** One question at a time, full-screen, large text. Progress dots at top. Swipe or tap to advance.

The questions adapt based on selected domains:

**Universal questions (always asked):**

| # | Question | Options | Stored As |
|---|----------|---------|-----------|
| 1 | What's your primary goal? | Lose fat · Build muscle · Stay healthy | `goal` |
| 2 | How would you describe your fitness experience? | New to fitness · Some experience · Experienced | `fitness_level` |

**Gym-specific (if Gym selected):**

| # | Question | Options | Stored As |
|---|----------|---------|-----------|
| 3 | How many days can you train per week? | 3 days · 4 days | `gym_days_per_week` |
| 4 | What equipment do you have access to? | Full gym (barbells + machines) · Dumbbells only · Bodyweight only | `equipment_access` |

**Running-specific (if Running selected):**

| # | Question | Options | Stored As |
|---|----------|---------|-----------|
| 3 | Can you currently run for 20+ minutes without stopping? | Yes · No · Not sure | `running_level` |
| 4 | Do you have a heart rate monitor / smartwatch? | Yes · No | `has_hr_monitor` |

**Nutrition-specific (if Nutrition selected):**

| # | Question | Options | Stored As |
|---|----------|---------|-----------|
| 3 | Quick stats for your nutrition plan: | Age, Weight, Height, Sex (numeric input form) | `age`, `weight_kg`, `height_cm`, `sex` |

**Logic:** Maximum 5 questions regardless of domain combination. Questions are deduplicated if they overlap.

### Step 3: Plan Preview (Screen: `preview.tsx`)

**UI:** Shows the generated weekly schedule as a clean calendar-style view.

```
┌─────────────────────────────────┐
│  Your 20% Plan                  │
│                                 │
│  Mon   Tue   Wed   Thu   Fri    │
│  🏋️    🏃    Rest  🏋️    🏃     │
│  Lower  Easy       Upper  Tempo │
│  30min  25min      30min  20min │
│                                 │
│  Sat   Sun                      │
│  🏋️    Rest                     │
│  Full   Recovery                │
│  35min                          │
│                                 │
│  ─── Nutrition ───              │
│  Daily: ~2,100 kcal             │
│  Protein: 130g (4 palm portions)│
│  Rule: Protein at every meal    │
│                                 │
│  [Start My Plan →]              │
│                                 │
│  Powered by 47 peer-reviewed    │
│  studies. Tap any item to see   │
│  the research.                  │
└─────────────────────────────────┘
```

**Logic:**
1. Plan generator runs based on assessment answers
2. Generates weekly schedule with specific workouts assigned to days
3. Calculates nutrition targets (TDEE via Mifflin-St Jeor, protein via 1.6-2.2g/kg based on goal)
4. Shows preview
5. "Start My Plan" saves everything locally and navigates to Today tab

---

## 8. Screen-by-Screen Specifications <a name="8-screen-specifications"></a>

### Screen 1: Today (Tab — Main Screen)

**Purpose:** Show exactly what the user should do today. One glance, one action.

**Layout:**
```
┌──────────────────────────────────┐
│ Today's 20%            Tue Feb 21│
│                                  │
│ ┌──────────────────────────────┐ │
│ │ READY                        │ │
│ │                              │ │
│ │ Lower Body — Strength        │ │
│ │ 4 exercises · ~32 min        │ │
│ │                              │ │
│ │  Barbell Squat      3×6-8   │ │
│ │  Romanian Deadlift  3×8-10  │ │
│ │  Leg Press          3×10-12 │ │
│ │  Calf Raise         2×12-15 │ │
│ │                              │ │
│ │  [ Start Workout → ]         │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ 🍽 NUTRITION TODAY            │ │
│ │ Protein target: 130g         │ │
│ │ (4 palm-sized portions)      │ │
│ │ ○ ○ ○ ○   0/4 logged        │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ 📊 THIS WEEK                  │ │
│ │ ██ ██ ░░ ░░ ░░ ░░ ░░        │ │
│ │ M  T  W  T  F  S  S         │ │
│ │ 2/5 sessions completed       │ │
│ └──────────────────────────────┘ │
│                                  │
│  [Today]    [Progress]  [Profile]│
└──────────────────────────────────┘
```

**Components:**
- **WorkoutCard** (or RunCard on run days, RestDayCard on rest days): Shows today's session with exercise list, tap to start
- **NutritionCard** (if nutrition domain active): Protein tracking circles, tap to log
- **WeekStrip**: Mini consistency view showing completed/pending days this week

**States:**
- `scheduled_workout` → Show workout card with "Start Workout"
- `scheduled_run` → Show run card with "Start Run"
- `rest_day` → Show rest day card with recovery message
- `completed_today` → Show completion card with summary stats, green checkmark
- `missed_yesterday` → No guilt banner. Just adjust the plan silently.

**Logic:**
- Plan determines what's shown today based on day of week + user schedule
- If user hasn't completed today's session, show it as primary card
- If completed, show summary
- If rest day, show rest message + optional nutrition card

### Screen 2: Active Workout (Full-Screen — `workout/[id].tsx`)

**Purpose:** Guide the user through their workout set by set. Zero decisions required.

**Layout:**
```
┌──────────────────────────────────┐
│ ← Exit          2 / 4 exercises │
│                                  │
│                                  │
│         Romanian Deadlift        │
│                                  │
│         Set 2 of 3               │
│                                  │
│     ┌──────────────────────┐     │
│     │    8-10 reps          │     │
│     │                      │     │
│     │    Previous: 60kg    │     │
│     │    [  65  ] kg       │     │
│     └──────────────────────┘     │
│                                  │
│     RPE target: 7-8              │
│     (2-3 reps in reserve)        │
│                                  │
│     Why this exercise?           │
│     → Schoenfeld et al., 2017   │
│                                  │
│                                  │
│     [ Complete Set ✓ ]           │
│                                  │
└──────────────────────────────────┘
```

**After tapping "Complete Set":**
```
┌──────────────────────────────────┐
│                                  │
│          REST                    │
│                                  │
│         2:00                     │
│        ████████░░                │
│                                  │
│    Next: Set 3 of 3             │
│    Romanian Deadlift · 8-10 reps │
│                                  │
│    [ Skip Rest → ]               │
│                                  │
└──────────────────────────────────┘
```

**Flow:**
1. Exercise name + set/rep info displayed
2. Weight input pre-filled with last session's weight (or empty if first time)
3. User adjusts weight if needed
4. Taps "Complete Set" → haptic feedback → weight/reps saved
5. Rest timer starts automatically (2-3 min for compounds, 90s for accessories)
6. Timer counts down with large IBM Plex Mono display
7. When timer ends → haptic buzz → next set auto-loads
8. After last set of exercise → next exercise loads
9. After last exercise → navigate to summary

**Key behaviors:**
- Weight input: scrollable number picker or direct keyboard entry
- Previous weight shown as reference (progressive overload nudge)
- If user lifts MORE than last time, subtle accent highlight (progress!)
- "Why this exercise?" tappable → opens bottom sheet with citation
- RPE target shown below each set based on plan (RPE 7-8 for working sets)
- Back/exit button asks for confirmation ("End workout early?")

### Screen 3: Active Run (Full-Screen — `run/active.tsx`)

**Purpose:** Guide the user through their run session.

**Layout (Easy/Zone 2 Run):**
```
┌──────────────────────────────────┐
│ ← End Run         Easy Run      │
│                                  │
│           23:47                  │
│         elapsed                  │
│                                  │
│     ┌──────────────────────┐     │
│     │   ZONE 2 — EASY      │     │
│     │   Conversational pace │     │
│     │                      │     │
│     │   Can you speak in   │     │
│     │   full sentences?    │     │
│     │   ✅ Yes = on target  │     │
│     └──────────────────────┘     │
│                                  │
│     Target: 30-45 min            │
│     Distance: 4.2 km            │
│                                  │
│     [ Pause ⏸ ]                  │
│                                  │
└──────────────────────────────────┘
```

**Layout (Interval Session):**
```
┌──────────────────────────────────┐
│ ← End Run        Intervals      │
│                                  │
│          WORK                    │
│          3:24                    │
│       remaining in interval      │
│                                  │
│     Interval 3 of 5             │
│     Target: 85-95% HRmax        │
│     (Hard effort — short        │
│      phrases only)              │
│                                  │
│     Next: 3 min recovery jog    │
│                                  │
│     [ Pause ⏸ ]                  │
│                                  │
└──────────────────────────────────┘
```

**Beginner Walk/Run Layout:**
```
┌──────────────────────────────────┐
│ ← End          Walk/Run W3D1    │
│                                  │
│          🏃 RUN                  │
│          1:47                    │
│       remaining                  │
│                                  │
│     Round 3 of 6                │
│     Next: Walk 2:00              │
│                                  │
│     Total elapsed: 11:23         │
│                                  │
│     [ Pause ⏸ ]                  │
│                                  │
└──────────────────────────────────┘
```

**Key behaviors:**
- Timer always visible in large data font (IBM Plex Mono, 48px)
- For users WITH HR monitor: show current HR + zone color indicator
- For users WITHOUT HR monitor: show Talk Test prompt + RPE guidance
- Interval sessions: auto-advance between work and rest intervals with haptic buzz
- Walk/Run sessions: auto-advance between walk and run segments with distinct haptic patterns
- GPS distance tracking if location permission granted (optional, not required)
- Screen stays awake during active session

### Screen 4: Workout/Run Summary (Post-session)

**Purpose:** Clean summary of what was accomplished. Calm, factual, no cheerleading.

```
┌──────────────────────────────────┐
│                                  │
│        Session Complete          │
│                                  │
│     Duration         32 min      │
│     Exercises        4           │
│     Working Sets     11          │
│     Total Volume     4,230 kg    │
│                                  │
│     ── Progress ──               │
│     Squat: 80kg → 82.5kg  ↑     │
│     RDL: 60kg (same)             │
│                                  │
│     "Progressive overload on     │
│      squat. That's the 20%       │
│      that matters."              │
│           — Kraemer, 2004        │
│                                  │
│     [ Done → ]                   │
│                                  │
└──────────────────────────────────┘
```

**Key behaviors:**
- Show volume increase vs. last session if applicable
- Show weight progression highlights
- One contextual research quote related to what happened (e.g., if weight increased, cite progressive overload study)
- No stars, no badges, no "streak" count, no "share to social"
- "Done" returns to Today screen with completed state

### Screen 5: Progress (Tab)

**Purpose:** Am I making progress? Keep it simple.

```
┌──────────────────────────────────┐
│ Progress                         │
│                                  │
│ ── This Month ──                 │
│ ██ ██ ██ ░░ ██ ██ ░░            │
│ ██ ░░ ██ ██ ██ ░░ ░░            │
│ ██ ██ ░░ ██ ██ ██ ░░            │
│ ░░ ░░ ░░ ░░                     │
│ 14/20 planned sessions ✓        │
│                                  │
│ ── Strength Trends ──            │
│ ┌──────────────────────────────┐ │
│ │ Squat  ───────────/          │ │
│ │        60  65  70  75  80 kg │ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │ Bench  ─────────/            │ │
│ │        40  45  50  55  60 kg │ │
│ └──────────────────────────────┘ │
│                                  │
│ ── Running ──                    │
│ Avg easy pace: 6:12/km          │
│ Weekly volume: 14.2 km          │
│                                  │
│  [Today]    [Progress]  [Profile]│
└──────────────────────────────────┘
```

**Components:**
- **ConsistencyGrid:** Monthly grid, each cell = a day. Filled = completed session. Green = gym, Blue = run, Gray = rest day
- **TrendChart:** Simple line chart per major lift showing weight over time. Only compound lifts.
- **RunStats:** Average pace trend, weekly volume
- No nutrition progress charts in MVP (just daily tracking on Today screen)

### Screen 6: Profile (Tab)

**Purpose:** Settings, account, subscription, domain management.

```
┌──────────────────────────────────┐
│ Profile                          │
│                                  │
│ ── Your Domains ──               │
│ ✅ Gym (4 days/week)             │
│ ✅ Running (2 days/week)         │
│ ✅ Nutrition (fat loss)          │
│ [Edit domains]                   │
│                                  │
│ ── Account ──                    │
│ Email: elad@example.com          │
│ Plan: Free                       │
│ [Upgrade to Pro →]               │
│                                  │
│ ── Settings ──                   │
│ Units: Metric / Imperial         │
│ Notifications: On                │
│ Reminder time: 07:00             │
│                                  │
│ ── About ──                      │
│ Research sources                 │
│ Privacy policy                   │
│ Terms of service                 │
│ Contact support                  │
│ Version 1.0.0                    │
│                                  │
│  [Today]    [Progress]  [Profile]│
└──────────────────────────────────┘
```

### Screen 7: Exercise Detail (Bottom Sheet — `exercise/[id].tsx`)

**Purpose:** Show why this exercise is in your plan, with the research citation.

```
┌──────────────────────────────────┐
│ ──────                           │ ← Handle
│                                  │
│ Barbell Back Squat               │
│                                  │
│ ── Why this exercise ──          │
│ The squat is a bilateral         │
│ compound movement that           │
│ activates quadriceps, glutes,    │
│ and hamstrings. Multi-joint      │
│ movements produce greater        │
│ strength and hypertrophy per     │
│ minute than isolation.           │
│                                  │
│ ── The Research ──               │
│ 📄 Schoenfeld et al., 2017      │
│    J Sports Sciences             │
│    "Compound > Isolation"        │
│                                  │
│ 📄 Iversen et al., 2021         │
│    Sports Medicine               │
│    "Minimum 3 movement patterns" │
│                                  │
│ ── Form Cues ──                  │
│ • Feet shoulder-width apart      │
│ • Drive through heels            │
│ • Keep chest up, core braced     │
│ • Descend until thighs parallel  │
│                                  │
└──────────────────────────────────┘
```

### Screen 8: Paywall (`paywall.tsx`)

See [Section 11: Monetization](#11-monetization).

---

## 9. Core Algorithms & Logic <a name="9-core-algorithms"></a>

### Plan Generation (`planGenerator.ts`)

The plan generator takes assessment answers and produces a weekly schedule. It does NOT use an LLM in real-time — it's a deterministic algorithm based on the research templates.

```typescript
interface PlanInput {
  domains: ('gym' | 'running' | 'nutrition')[];
  goal: 'fat_loss' | 'muscle_build' | 'maintenance';
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  gymDaysPerWeek?: 3 | 4;
  equipmentAccess?: 'full_gym' | 'dumbbells' | 'bodyweight';
  runningLevel?: 'cant_run_20min' | 'can_run_20min' | 'experienced';
  hasHrMonitor?: boolean;
  age?: number;
  weightKg?: number;
  heightCm?: number;
  sex?: 'male' | 'female';
}

interface PlanOutput {
  weeklySchedule: DayPlan[]; // 7 days
  gymPlan?: GymPlan;
  runPlan?: RunPlan;
  nutritionPlan?: NutritionPlan;
}
```

**Gym plan logic:**
- 3-day → Full Body A/B/A alternating (from GYM research doc, section 1.7)
- 4-day → Upper/Lower split (from GYM research doc, section 1.7)
- Equipment modifiers: if `dumbbells` → substitute all barbell exercises with dumbbell alternatives; if `bodyweight` → substitute with bodyweight alternatives
- Beginner: start at lower volume (2 sets per exercise), linear progression
- Intermediate: 3 sets per exercise, weekly progression
- All exercises from the "vital few" compound list

**Run plan logic:**
- If `cant_run_20min` → Start with Walk/Run progression (8-week C25K-style program from research gap doc)
- If `can_run_20min` → 2 easy + 1 quality session per week (from Running research, section 2.2)
- If `experienced` → Same structure with higher targets
- Zone 2 targets calculated via Karvonen method if HR monitor available, Talk Test guidance if not

**Nutrition plan logic:**
- Calculate TDEE: Mifflin-St Jeor × activity factor
- Calculate calorie target based on goal:
  - Fat loss: TDEE - 400-600 kcal (adjusted by body fat estimate)
  - Muscle build: TDEE + 200-400 kcal
  - Maintenance: TDEE
- Calculate protein target: 1.6-2.4 g/kg based on goal
- Convert to hand portions (1 palm ≈ 25-30g protein)
- Generate 5 daily rules based on goal (from Nutrition research, section 3.6)

### Progressive Overload Engine (`progressiveOverload.ts`)

Runs after each completed workout to determine next session's targets.

```typescript
function calculateNextSession(
  exercise: Exercise,
  lastSession: CompletedSet[],
  fitnessLevel: FitnessLevel
): TargetSet[] {
  // If all sets completed at target reps with same weight:
  //   → Increase weight by increment (beginner: 2.5kg upper / 5kg lower)
  //   → Reset reps to bottom of range
  
  // If NOT all sets completed at target reps:
  //   → Keep same weight, try to add 1 rep per set
  
  // If user failed to match previous session 2x in a row:
  //   → Suggest deload (reduce weight by 10%)
  
  // Always: stay within 6-12 rep range for compounds
}
```

### Zone 2 Calculator (`calculations.ts`)

```typescript
function calculateZone2HR(
  age: number,
  restingHR?: number
): { low: number; high: number; method: string } {
  if (restingHR) {
    // Karvonen method (more accurate)
    const maxHR = 220 - age;
    const hrReserve = maxHR - restingHR;
    return {
      low: Math.round(restingHR + hrReserve * 0.6),
      high: Math.round(restingHR + hrReserve * 0.7),
      method: 'karvonen'
    };
  } else {
    // Simple % of max HR
    const maxHR = 220 - age;
    return {
      low: Math.round(maxHR * 0.6),
      high: Math.round(maxHR * 0.7),
      method: 'percentage'
    };
  }
}
```

### TDEE Calculator (`calculations.ts`)

```typescript
function calculateTDEE(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: 'male' | 'female',
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active'
): number {
  // Mifflin-St Jeor
  let bmr: number;
  if (sex === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
  
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725
  };
  
  return Math.round(bmr * multipliers[activityLevel]);
}
```

---

## 10. AI Coach Behavior <a name="10-ai-coach"></a>

The AI is NOT a chatbot. It's the app's voice — woven into copy, summaries, and contextual nudges.

### Voice Rules

| Rule | Example ✅ | Example ❌ |
|------|-----------|-----------|
| Factual, not emotional | "Your squat went up 5kg this month." | "Amazing job! 🎉 You're crushing it!" |
| Never guilt | "You missed 2 sessions. Plan adjusted." | "You broke your streak! 😢" |
| Always cite | "3 sets is enough. (Wernbom, 2007)" | "Trust us, this works!" |
| Zero fluff | "Rest day. Your muscles recover during rest, not during training." | "You deserve a break! Take some time for self-care today! 🧘" |
| Direct instructions | "Do 3 sets of 8 at 65kg." | "Try to aim for around 3 sets, maybe 8ish reps?" |
| Short | Max 2 sentences per contextual message | Long paragraphs explaining the science |

### Where the AI voice appears:
1. **Today screen**: Workout card subtitle ("Full body. 4 exercises. ~32 min.")
2. **Rest timer**: "Why this rest period? Schoenfeld (2024): >60s rest yields no additional hypertrophy benefit."
3. **Workout summary**: One contextual insight ("Progressive overload on squat. That's the 20% that matters." — Kraemer, 2004)
4. **Rest day card**: "Rest day. Muscle grows during recovery, not during training. (Schoenfeld, 2016)"
5. **Missed session**: "Missed yesterday. No problem. Plan adjusted. Your next session is tomorrow."
6. **Nutrition card**: "4 palm-sized protein portions today. That's your 20%."

---

## 11. Monetization & Paywall <a name="11-monetization"></a>

### Pricing

| Tier | Price | Billing |
|------|-------|---------|
| **Free** | $0 | Forever |
| **Pro Monthly** | $9.99/mo | Monthly |
| **Pro Annual** | $79.99/yr ($6.66/mo) | Annual |
| **Pro Trial** | 7 days free | Then monthly or annual |

### Feature Split

| Feature | Free | Pro |
|---------|------|-----|
| Research-backed plan (any domain) | ✅ | ✅ |
| Guided workouts & runs | ✅ | ✅ |
| Rest timer | ✅ | ✅ |
| Basic set tracking | ✅ | ✅ |
| Weekly consistency grid | ✅ | ✅ |
| Nutrition daily targets | ✅ | ✅ |
| Research citations | ✅ | ✅ |
| **AI adaptive programming** | ❌ | ✅ |
| **Progressive overload engine** | ❌ | ✅ |
| **All 3 domains simultaneously** | 1 domain | ✅ All 3 |
| **Strength/run trend analytics** | ❌ | ✅ |
| **Exercise alternatives** | ❌ | ✅ |
| **Plan adjustment after missed sessions** | ❌ | ✅ |
| **Priority support** | ❌ | ✅ |

### Paywall Trigger Points
- After completing onboarding (soft upsell, dismissible)
- When tapping a Pro-locked feature (domain lock, trends, alternatives)
- After first week of consistent use (engagement-triggered)
- From Profile screen ("Upgrade to Pro")

### Paywall Screen Layout
```
┌──────────────────────────────────┐
│ ×                                │
│                                  │
│     Unlock Your Full 20%         │
│                                  │
│  Free gets you started.          │
│  Pro adapts to you.              │
│                                  │
│  ✅ All 3 domains unlocked       │
│  ✅ AI adapts your plan weekly    │
│  ✅ Progressive overload tracking │
│  ✅ Strength & running trends     │
│  ✅ Exercise alternatives         │
│                                  │
│  ┌────────────────────────────┐  │
│  │ Annual — $6.66/mo          │  │
│  │ $79.99/year · Save 33%    │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │ Monthly — $9.99/mo         │  │
│  └────────────────────────────┘  │
│                                  │
│  7-day free trial · Cancel       │
│  anytime                         │
│                                  │
│  [Start Free Trial →]            │
│                                  │
│  Terms · Restore purchases       │
└──────────────────────────────────┘
```

---

## 12. Navigation & Information Architecture <a name="12-navigation"></a>

```
App Root (_layout.tsx)
├── Onboarding Stack (if !onboarding_completed)
│   ├── domains.tsx
│   ├── assessment.tsx
│   └── preview.tsx
│
├── Tab Navigator (if onboarding_completed)
│   ├── Today (today.tsx)
│   ├── Progress (progress.tsx)
│   └── Profile (profile.tsx)
│
├── Modal Stack (presented over tabs)
│   ├── workout/[id].tsx (Active Workout)
│   ├── workout/summary.tsx
│   ├── run/active.tsx (Active Run)
│   ├── run/summary.tsx
│   ├── exercise/[id].tsx (Bottom Sheet)
│   └── paywall.tsx
```

**Navigation Rules:**
- Onboarding is a one-time stack. Once completed, never shown again.
- Active Workout and Active Run are full-screen modals that prevent accidental back navigation.
- Exercise detail is a bottom sheet, not a full screen.
- Paywall is a modal that can be dismissed.
- Tab bar has exactly 3 items: Today, Progress, Profile.

---

## 13. State Management <a name="13-state-management"></a>

### Zustand Stores

**`useUserStore`** — Persistent (MMKV)
```typescript
interface UserState {
  onboardingCompleted: boolean;
  domains: ('gym' | 'running' | 'nutrition')[];
  goal: string;
  fitnessLevel: string;
  profile: UserProfile;
  settings: { units: 'metric' | 'imperial'; notifications: boolean; reminderTime: string };
  subscriptionTier: 'free' | 'pro';
}
```

**`usePlanStore`** — Persistent (MMKV)
```typescript
interface PlanState {
  weeklySchedule: DayPlan[];
  currentWeek: number;
  gymPlan: GymPlan | null;
  runPlan: RunPlan | null;
  nutritionPlan: NutritionPlan | null;
}
```

**`useWorkoutStore`** — Active session in memory, history in MMKV
```typescript
interface WorkoutState {
  activeSession: ActiveWorkout | null;
  history: CompletedWorkout[];
  // Actions
  startWorkout: (template: WorkoutTemplate) => void;
  completeSet: (exerciseIndex: number, setIndex: number, data: SetData) => void;
  finishWorkout: () => void;
}
```

**`useRunStore`** — Same pattern as workout
```typescript
interface RunState {
  activeSession: ActiveRun | null;
  history: CompletedRun[];
  startRun: (template: RunTemplate) => void;
  finishRun: () => void;
}
```

**`useNutritionStore`** — Persistent (MMKV)
```typescript
interface NutritionState {
  todayCheckin: NutritionCheckin;
  logProteinPortion: () => void;
  logVeggiePortion: () => void;
  logWater: () => void;
}
```

---

## 14. API & Backend <a name="14-api-backend"></a>

### Offline-First Architecture
- All data stored locally in MMKV first
- Sync to Supabase when user creates an account AND is online
- App works 100% without an account and without internet
- Sync is background, non-blocking, and idempotent

### Supabase Edge Functions

| Function | Trigger | Purpose |
|----------|---------|---------|
| `sync-workout` | POST | Sync completed workout from local to cloud |
| `sync-run` | POST | Sync completed run from local to cloud |
| `send-reminder` | CRON (daily) | Send push notification reminders |
| `generate-weekly-plan` | POST (Pro only) | Generate adapted plan based on last week's performance |

### Row Level Security (RLS)
All tables have RLS enabled. Users can only read/write their own data:
```sql
CREATE POLICY "Users can only access own data"
ON workout_sessions FOR ALL
USING (auth.uid() = user_id);
```

---

## 15. Analytics & Events <a name="15-analytics"></a>

Track these events in PostHog:

| Event | Properties | Purpose |
|-------|-----------|---------|
| `onboarding_started` | – | Funnel top |
| `domains_selected` | `domains[]` | Which domains are popular |
| `assessment_completed` | `goal, fitness_level` | Profile distribution |
| `plan_generated` | `plan_type, domains` | Plan mix |
| `workout_started` | `template, exercise_count` | Engagement |
| `workout_completed` | `duration_seconds, total_volume` | Completion rate |
| `workout_abandoned` | `exercise_reached, reason` | Drop-off analysis |
| `run_started` | `session_type` | Run engagement |
| `run_completed` | `duration, distance` | Run completion |
| `set_completed` | `exercise, weight, reps` | Granular tracking |
| `nutrition_logged` | `type (protein/veggie/water)` | Nutrition engagement |
| `paywall_viewed` | `trigger_source` | Conversion funnel |
| `subscription_started` | `plan_type, price` | Revenue |
| `subscription_cancelled` | `reason` | Churn analysis |
| `citation_viewed` | `citation_id` | Research engagement |

---

## 16. Phasing & Milestones <a name="16-phasing"></a>

### Phase 1: Foundation (Week 1-2)
- [ ] Expo project setup with TypeScript
- [ ] Theme system implementation (all tokens from DESIGN_SYSTEM.md)
- [ ] Base UI components (Text, Button, Card, Badge, BottomSheet, Toast)
- [ ] Expo Router navigation structure
- [ ] Zustand stores with MMKV persistence
- [ ] Font loading (DM Sans + IBM Plex Mono)

### Phase 2: Onboarding + Plan Generation (Week 2-3)
- [ ] Domain selection screen
- [ ] Assessment flow (adaptive questions)
- [ ] Plan generation algorithm
- [ ] Exercise database seeding (vital few compounds + alternatives)
- [ ] Nutrition calculation engine (TDEE, protein, hand portions)
- [ ] Plan preview screen
- [ ] Local data persistence

### Phase 3: Today Screen + Active Sessions (Week 3-5)
- [ ] Today screen with WorkoutCard, RunCard, NutritionCard, RestDayCard
- [ ] Active Workout flow (exercise view, set tracking, rest timer, weight input)
- [ ] Active Run flow (timer, zone indicator, Talk Test, interval support)
- [ ] Walk/Run beginner mode
- [ ] Workout/Run summary screens
- [ ] Progressive overload engine
- [ ] Haptic feedback integration

### Phase 4: Progress + Profile (Week 5-6)
- [ ] Consistency grid component
- [ ] Strength trend charts
- [ ] Running stats
- [ ] Profile screen
- [ ] Settings (units, notifications, reminder time)
- [ ] Domain editing

### Phase 5: Monetization + Backend (Week 6-7)
- [ ] Supabase setup (schema, RLS, migrations)
- [ ] Auth flow (Apple Sign In + Email)
- [ ] RevenueCat integration
- [ ] Paywall screen
- [ ] Free/Pro feature gating
- [ ] Data sync (local ↔ cloud)
- [ ] Push notifications

### Phase 6: Polish + Launch (Week 7-8)
- [ ] Animation polish (screen transitions, card reveals, set completion)
- [ ] Error states and edge cases
- [ ] App icon and splash screen
- [ ] App Store screenshots and listing
- [ ] PostHog analytics integration
- [ ] Sentry error tracking
- [ ] TestFlight beta
- [ ] App Store submission

---

## 17. Success Metrics <a name="17-success-metrics"></a>

### North Star Metric
**Weekly active sessions completed** — not DAU, not time-in-app.

### KPIs (Month 1-3)

| Metric | Target | Why |
|--------|--------|-----|
| Onboarding completion rate | >80% | If people don't finish onboarding, nothing else matters |
| First workout completion | >60% of onboarded users | First session = activation |
| Week 1 retention (3+ sessions) | >40% | Early engagement |
| Week 4 retention | >25% | Habit forming |
| Free → Pro conversion | >3% | Revenue viability |
| Monthly recurring revenue | $500 → $1,000 | Path to $1-5K target |
| Workout completion rate | >85% | People finish what they start |
| App Store rating | >4.5 | Social proof |

### Revenue Math
- Target: $1,000 MRR within 3-6 months
- At $9.99/mo: 100 Pro subscribers needed
- At 3% conversion: ~3,333 active free users needed
- At 30% onboarding → active: ~11,111 downloads needed
- Growth strategy: Content marketing (TikTok/Reels on 80/20 fitness), ASO, ProductHunt launch

---

## 18. Design System Reference <a name="18-design-system"></a>

The full design system is documented in `DESIGN_SYSTEM.md` in the project root. The theme token files are in `src/theme/`.

### Quick Reference

| Element | Value |
|---------|-------|
| Background | `#F5F5F7` |
| Card | `#FFFFFF` + `1px #D2D2D7` border |
| Accent | `#0071E3` |
| Text | `#1D1D1F` / `#6E6E73` / `#AEAEB2` |
| Display Font | DM Sans 700-800 |
| Body Font | DM Sans 400-600 |
| Data Font | IBM Plex Mono 400-600 |
| Border Radius | 8 / 12 / 16 / 18 / 24 |
| Screen Padding | 20px horizontal |
| Transitions | 200-300ms ease-out |
| Tabs | 3 (Today, Progress, Profile) |
| Vibe | Apple clean. Science confident. No BS. |

---

*Last updated: February 21, 2026*
*Version: 2.0 — MVP Scope*