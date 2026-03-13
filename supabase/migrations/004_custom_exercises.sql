-- Add user_id to exercises table for custom user-created exercises.
-- Built-in (seeded) exercises have user_id = NULL.
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ DEFAULT now();

-- Allow authenticated users to insert their own custom exercises
CREATE POLICY exercises_insert_own ON exercises
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update only their own custom exercises
CREATE POLICY exercises_update_own ON exercises
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to delete only their own custom exercises
CREATE POLICY exercises_delete_own ON exercises
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
