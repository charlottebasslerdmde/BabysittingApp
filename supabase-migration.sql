-- 🚀 SitterSafe Supabase Erweiterte Migration
-- Führe dieses SQL-Skript in deinem Supabase SQL Editor aus
-- NACH dem supabase-setup.sql

-- ========================================
-- 1. EVENTS TABELLE (Aktivitäts-Protokoll)
-- ========================================
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  child_id TEXT,
  event_type TEXT NOT NULL, -- 'essen', 'schlaf', 'windel', 'spiel'
  event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  mood TEXT, -- '😢', '😐', '😊', '😄'
  details JSONB, -- Flexible JSON für unterschiedliche Event-Typen
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indizes für schnellere Abfragen
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_child_id ON events(child_id);
CREATE INDEX IF NOT EXISTS idx_events_event_time ON events(event_time DESC);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);

-- Row Level Security aktivieren
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policies erstellen
CREATE POLICY "Users can view their own events"
  ON events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events"
  ON events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events"
  ON events FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- 2. CHILDREN TABELLE (Kinderprofile)
-- ========================================
CREATE TABLE IF NOT EXISTS children (
  id TEXT PRIMARY KEY, -- UUID String von client generiert
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data JSONB NOT NULL, -- Komplettes Kind-Profil als JSON
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indizes
CREATE INDEX IF NOT EXISTS idx_children_user_id ON children(user_id);
CREATE INDEX IF NOT EXISTS idx_children_created_at ON children(created_at DESC);

-- Row Level Security
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own children"
  ON children FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own children"
  ON children FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own children"
  ON children FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own children"
  ON children FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- 3. HOUSEHOLD DATA TABELLE
-- ========================================
CREATE TABLE IF NOT EXISTS household_data (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  address TEXT,
  parent1_name TEXT,
  parent1_phone TEXT,
  parent2_name TEXT,
  parent2_phone TEXT,
  wifi_name TEXT,
  wifi_password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_household_user_id ON household_data(user_id);

-- Row Level Security
ALTER TABLE household_data ENABLE ROW LEVEL SECURITY;

-- Nur ein Haushalt pro User (unique constraint)
CREATE UNIQUE INDEX IF NOT EXISTS unique_household_per_user ON household_data(user_id);

-- Policies
CREATE POLICY "Users can view their own household data"
  ON household_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own household data"
  ON household_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own household data"
  ON household_data FOR UPDATE
  USING (auth.uid() = user_id);

-- ========================================
-- 4. SHIFT DATA TABELLE (Schichtdaten)
-- ========================================
CREATE TABLE IF NOT EXISTS shifts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shift_date DATE DEFAULT CURRENT_DATE,
  return_time TIME,
  parents_location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_shifts_user_id ON shifts(user_id);
CREATE INDEX IF NOT EXISTS idx_shifts_date ON shifts(shift_date DESC);

-- Row Level Security
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own shifts"
  ON shifts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own shifts"
  ON shifts FOR ALL
  USING (auth.uid() = user_id);

-- ========================================
-- 5. HELPER FUNCTIONS
-- ========================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für auto-update
CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON children
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_household_updated_at BEFORE UPDATE ON household_data
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON shifts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ✅ FERTIG!
-- ========================================
-- Die Datenbank ist jetzt bereit für die vollständige SitterSafe Integration
-- mit Authentifizierung und Row Level Security.
