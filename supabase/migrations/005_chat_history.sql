-- AI Coach conversation history
-- Stores chat sessions so users can resume or review past conversations

CREATE TABLE IF NOT EXISTS ai_coach_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  domains TEXT[] NOT NULL DEFAULT '{}',
  messages JSONB NOT NULL DEFAULT '[]',
  phase TEXT NOT NULL DEFAULT 'gathering',
  generated_plan JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_ai_coach_conversations_user_id
  ON ai_coach_conversations(user_id);

-- Index for recent conversations
CREATE INDEX IF NOT EXISTS idx_ai_coach_conversations_updated_at
  ON ai_coach_conversations(user_id, updated_at DESC);

-- Enable RLS
ALTER TABLE ai_coach_conversations ENABLE ROW LEVEL SECURITY;

-- Users can only access their own conversations
CREATE POLICY "Users can read own conversations"
  ON ai_coach_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON ai_coach_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON ai_coach_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON ai_coach_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_ai_coach_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_coach_conversations_updated_at
  BEFORE UPDATE ON ai_coach_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_coach_updated_at();
