-- SitterSafe Supabase Datenbank Setup
-- Führe dieses SQL-Skript in deinem Supabase SQL Editor aus

-- 1. Backups Tabelle erstellen
CREATE TABLE IF NOT EXISTS backups (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  backup_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  device_info TEXT,
  app_version TEXT
);

-- 2. Index für schnellere Abfragen
CREATE INDEX IF NOT EXISTS idx_backups_user_id ON backups(user_id);
CREATE INDEX IF NOT EXISTS idx_backups_created_at ON backups(created_at DESC);

-- 3. Row Level Security (RLS) aktivieren für bessere Sicherheit
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;

-- 4. Policy erstellen - Benutzer können nur ihre eigenen Backups sehen/erstellen
CREATE POLICY "Users can view their own backups"
  ON backups FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own backups"
  ON backups FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own backups"
  ON backups FOR DELETE
  USING (auth.uid()::text = user_id);

-- 5. Optional: Tabelle für Feedback
CREATE TABLE IF NOT EXISTS feedback (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  feedback_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  device_info TEXT,
  app_version TEXT,
  status TEXT DEFAULT 'new'
);

CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feedback"
  ON feedback FOR INSERT
  WITH CHECK (true);

-- 6. Optional: Tabelle für App-Statistiken
CREATE TABLE IF NOT EXISTS app_stats (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  stat_type TEXT NOT NULL,
  stat_value JSONB NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_stats_user_id ON app_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_app_stats_type ON app_stats(stat_type);

ALTER TABLE app_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own stats"
  ON app_stats FOR ALL
  USING (auth.uid()::text = user_id);

-- Fertig! 🎉
-- Die Datenbank ist jetzt bereit für SitterSafe
