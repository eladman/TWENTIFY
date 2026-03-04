-- ============================================================
-- Twentify: Fix constraints & auto-create public.users rows
-- ============================================================

-- --------------------------------------------------------
-- A) Auto-create public.users row on auth signup
-- --------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------------------
-- B) Backfill existing auth users missing a public.users row
-- --------------------------------------------------------

INSERT INTO public.users (id, email)
SELECT au.id, au.email
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
);

-- --------------------------------------------------------
-- C) Add missing UNIQUE constraints
-- --------------------------------------------------------

-- C1: user_profiles(user_id) — dedup then add UNIQUE
DELETE FROM user_profiles
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM user_profiles
  ORDER BY user_id, updated_at DESC
);

DROP INDEX IF EXISTS idx_user_profiles_user_id;
ALTER TABLE user_profiles
  ADD CONSTRAINT uq_user_profiles_user_id UNIQUE (user_id);

-- C2: nutrition_checkins(user_id, date) — dedup then add UNIQUE
DELETE FROM nutrition_checkins
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, date) id
  FROM nutrition_checkins
  ORDER BY user_id, date, created_at DESC
);

ALTER TABLE nutrition_checkins
  ADD CONSTRAINT uq_nutrition_checkins_user_date UNIQUE (user_id, date);

-- C3: plans — partial unique index on (user_id) WHERE is_active = true
DROP INDEX IF EXISTS idx_plans_active;
CREATE UNIQUE INDEX idx_plans_user_active ON plans(user_id) WHERE is_active = true;

-- --------------------------------------------------------
-- D) Add missing column for run_sessions
-- --------------------------------------------------------

ALTER TABLE run_sessions ADD COLUMN IF NOT EXISTS template_id TEXT;
