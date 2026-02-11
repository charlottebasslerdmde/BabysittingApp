-- ========================================
-- SitterSafe Supabase Datenbank Setup
-- VOLLSTÄNDIGE EINRICHTUNG
-- ========================================
-- Kopiere dieses GESAMTE Skript und führe es im Supabase SQL Editor aus
-- ========================================

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

-- 3. Row Level Security (RLS) aktivieren
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;

-- 4. DEMO-Policies mit Demo-User Support erstellen
-- (Erlaubt 'demo_user' ohne Authentifizierung für Entwicklung/Demo)
CREATE POLICY "Users can view their own backups"
  ON backups FOR SELECT
  USING (auth.uid()::text = user_id OR user_id = 'demo_user');

CREATE POLICY "Users can create their own backups"
  ON backups FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR user_id = 'demo_user');

CREATE POLICY "Users can delete their own backups"
  ON backups FOR DELETE
  USING (auth.uid()::text = user_id OR user_id = 'demo_user');

-- 5. Feedback Tabelle erstellen
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

-- 6. Optional: App-Statistiken Tabelle
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
  USING (auth.uid()::text = user_id OR user_id = 'demo_user');

-- ========================================
-- ✅ FERTIG! Die Datenbank ist bereit
-- ========================================
-- Nach dem Ausführen solltest du diese Tabellen sehen:
-- - backups
-- - feedback  
-- - app_stats
--
-- Teste jetzt das Cloud-Backup in der App!
-- ========================================
