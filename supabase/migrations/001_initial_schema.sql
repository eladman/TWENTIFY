-- ============================================================
-- Twentify: Initial Schema Migration
-- ============================================================

-- --------------------------------------------------------
-- 1. Tables (ordered by FK dependency)
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  units       TEXT NOT NULL DEFAULT 'metric',
  settings    JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  domains         TEXT[] NOT NULL,
  fitness_level   TEXT NOT NULL,
  goal            TEXT NOT NULL,
  gym_days_per_week INT,
  run_days_per_week INT,
  age             INT,
  weight_kg       NUMERIC,
  height_cm       NUMERIC,
  sex             TEXT,
  resting_hr      INT,
  tdee_estimated  NUMERIC,
  protein_target_g NUMERIC,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS plans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_type   TEXT NOT NULL,
  plan_data   JSONB NOT NULL,
  week_number INT NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active   BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS workout_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id           UUID REFERENCES plans(id) ON DELETE SET NULL,
  workout_template  TEXT NOT NULL,
  started_at        TIMESTAMPTZ NOT NULL,
  completed_at      TIMESTAMPTZ,
  duration_seconds  INT,
  exercises         JSONB NOT NULL,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS run_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id           UUID REFERENCES plans(id) ON DELETE SET NULL,
  session_type      TEXT NOT NULL,
  started_at        TIMESTAMPTZ NOT NULL,
  completed_at      TIMESTAMPTZ,
  duration_seconds  INT,
  distance_meters   NUMERIC,
  avg_hr            INT,
  target_zone       TEXT,
  intervals         JSONB,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS nutrition_checkins (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
  date              DATE NOT NULL,
  protein_servings  INT NOT NULL DEFAULT 0,
  veggie_servings   INT NOT NULL DEFAULT 0,
  water_glasses     INT NOT NULL DEFAULT 0,
  followed_plan     BOOLEAN,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exercises (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  category          TEXT NOT NULL,
  movement_pattern  TEXT NOT NULL,
  primary_muscles   TEXT[] NOT NULL,
  secondary_muscles TEXT[],
  equipment         TEXT NOT NULL,
  alternatives      TEXT[],
  citation_ids      TEXT[],
  instructions      TEXT,
  cues              TEXT[]
);

CREATE TABLE IF NOT EXISTS citations (
  id          TEXT PRIMARY KEY,
  authors     TEXT NOT NULL,
  year        INT NOT NULL,
  title       TEXT NOT NULL,
  journal     TEXT NOT NULL,
  finding     TEXT NOT NULL,
  doi         TEXT,
  confidence  TEXT NOT NULL
);

-- --------------------------------------------------------
-- 2. Indexes
-- --------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_plans_user_id ON plans(user_id);
CREATE INDEX IF NOT EXISTS idx_plans_active ON plans(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_started_at ON workout_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_run_sessions_user_id ON run_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_run_sessions_started_at ON run_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_nutrition_checkins_user_id ON nutrition_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_checkins_date ON nutrition_checkins(date);

-- --------------------------------------------------------
-- 3. Enable Row Level Security
-- --------------------------------------------------------

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE run_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE citations ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- 4. RLS Policies
-- --------------------------------------------------------

-- users (PK = auth.uid())
CREATE POLICY users_select_own ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_insert_own ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY users_update_own ON users
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY users_delete_own ON users
  FOR DELETE USING (auth.uid() = id);

-- user_profiles
CREATE POLICY user_profiles_select_own ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_profiles_insert_own ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_profiles_update_own ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY user_profiles_delete_own ON user_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- plans
CREATE POLICY plans_select_own ON plans
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY plans_insert_own ON plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY plans_update_own ON plans
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY plans_delete_own ON plans
  FOR DELETE USING (auth.uid() = user_id);

-- workout_sessions
CREATE POLICY workout_sessions_select_own ON workout_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY workout_sessions_insert_own ON workout_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY workout_sessions_update_own ON workout_sessions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY workout_sessions_delete_own ON workout_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- run_sessions
CREATE POLICY run_sessions_select_own ON run_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY run_sessions_insert_own ON run_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY run_sessions_update_own ON run_sessions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY run_sessions_delete_own ON run_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- nutrition_checkins
CREATE POLICY nutrition_checkins_select_own ON nutrition_checkins
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY nutrition_checkins_insert_own ON nutrition_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY nutrition_checkins_update_own ON nutrition_checkins
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY nutrition_checkins_delete_own ON nutrition_checkins
  FOR DELETE USING (auth.uid() = user_id);

-- exercises (read-only for authenticated users; seeded via service role)
CREATE POLICY exercises_select_authenticated ON exercises
  FOR SELECT TO authenticated USING (true);

-- citations (read-only for authenticated users; seeded via service role)
CREATE POLICY citations_select_authenticated ON citations
  FOR SELECT TO authenticated USING (true);
