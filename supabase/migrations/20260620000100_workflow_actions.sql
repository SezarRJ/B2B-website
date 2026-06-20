-- ====================================================================
-- Workflow action audit log persistence
-- Stores user-scoped "needs attention" -> "acted on it" transitions.
-- ====================================================================

CREATE TABLE IF NOT EXISTS workflow_actions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('deal', 'order')),
  item_id TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT,
  previous_status TEXT,
  new_status TEXT NOT NULL DEFAULT 'acted' CHECK (new_status = 'acted'),
  acted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  source TEXT NOT NULL DEFAULT 'server',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_workflow_actions_user_acted_at
  ON workflow_actions (user_id, acted_at DESC);

CREATE INDEX IF NOT EXISTS idx_workflow_actions_user_item
  ON workflow_actions (user_id, item_type, item_id);

ALTER TABLE workflow_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own workflow actions" ON workflow_actions;
CREATE POLICY "Users can read own workflow actions"
  ON workflow_actions
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own workflow actions" ON workflow_actions;
CREATE POLICY "Users can insert own workflow actions"
  ON workflow_actions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own workflow actions" ON workflow_actions;
CREATE POLICY "Users can delete own workflow actions"
  ON workflow_actions
  FOR DELETE
  USING (auth.uid() = user_id);
