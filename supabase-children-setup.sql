-- ========================================
-- SitterSafe - Kinder-Datenbank Setup
-- ========================================
-- Dieses Skript erstellt die notwendigen Tabellen und Storage
-- für die dauerhafte Speicherung von Kinderdaten in Supabase
-- ========================================

-- 1. Kinder-Tabelle erstellen
CREATE TABLE IF NOT EXISTS children (
  id TEXT PRIMARY KEY,  -- Wird von der App generiert (Date.now())
  user_id UUID NOT NULL,  -- Verknüpfung zum Babysitter/Account (UUID von auth.users)
  
  -- Basis-Daten
  name TEXT NOT NULL,
  nachname TEXT,
  rufname TEXT,
  geburtsdatum DATE,
  avatar_url TEXT,  -- URL zum Foto in Supabase Storage
  
  -- Strukturierte Daten als JSONB für Flexibilität
  sicherheit JSONB DEFAULT '{}'::jsonb,
  routine JSONB DEFAULT '{}'::jsonb,
  regeln JSONB DEFAULT '{}'::jsonb,
  psychologie JSONB DEFAULT '{}'::jsonb,
  logs JSONB DEFAULT '[]'::jsonb,
  
  -- Zeitstempel
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Indices für schnellere Abfragen
CREATE INDEX IF NOT EXISTS idx_children_user_id ON children(user_id);
CREATE INDEX IF NOT EXISTS idx_children_created_at ON children(created_at DESC);

-- 3. Row Level Security (RLS) aktivieren
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- 4. Policies erstellen
-- Benutzer können nur ihre eigenen Kinder sehen
CREATE POLICY "Users can view their own children"
  ON children FOR SELECT
  USING (auth.uid() = user_id);

-- Benutzer können nur ihre eigenen Kinder erstellen
CREATE POLICY "Users can create their own children"
  ON children FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Benutzer können nur ihre eigenen Kinder aktualisieren
CREATE POLICY "Users can update their own children"
  ON children FOR UPDATE
  USING (auth.uid() = user_id);

-- Benutzer können nur ihre eigenen Kinder löschen
CREATE POLICY "Users can delete their own children"
  ON children FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Funktion für automatisches updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Trigger für automatisches updated_at
DROP TRIGGER IF EXISTS update_children_updated_at ON children;
CREATE TRIGGER update_children_updated_at
    BEFORE UPDATE ON children
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- STORAGE BUCKET für Kinder-Fotos
-- ========================================
-- WICHTIG: Diesen Teil musst du manuell im Supabase Dashboard ausführen:
-- 1. Gehe zu Storage im Supabase Dashboard
-- 2. Erstelle einen neuen Bucket mit dem Namen: child-photos
-- 3. Konfiguriere die Policies für den Bucket:
--    - Public: false (nur authentifizierte Benutzer)
--    - File size limit: 5 MB
--    - Allowed MIME types: image/jpeg, image/png, image/webp
-- 
-- Storage Policies (im Supabase Dashboard unter Storage > Policies):
-- 
-- Policy 1: "Users can upload their own child photos"
-- Operation: INSERT
-- Policy definition: (bucket_id = 'child-photos' AND auth.uid()::text = (storage.foldername(name))[1])
--
-- Policy 2: "Users can view their own child photos"
-- Operation: SELECT
-- Policy definition: (bucket_id = 'child-photos' AND auth.uid()::text = (storage.foldername(name))[1])
--
-- Policy 3: "Users can update their own child photos"
-- Operation: UPDATE
-- Policy definition: (bucket_id = 'child-photos' AND auth.uid()::text = (storage.foldername(name))[1])
--
-- Policy 4: "Users can delete their own child photos"
-- Operation: DELETE  
-- Policy definition: (bucket_id = 'child-photos' AND auth.uid()::text = (storage.foldername(name))[1])

-- ========================================
-- ✅ FERTIG! 
-- ========================================
-- Nach dem Ausführen solltest du folgende Tabelle sehen:
-- - children
--
-- Nächste Schritte:
-- 1. Führe dieses SQL-Skript im Supabase SQL Editor aus
-- 2. Erstelle manuell den Storage Bucket "child-photos" im Dashboard
-- 3. Konfiguriere die Storage Policies wie oben beschrieben
-- 4. Teste die Integration in der App
-- ========================================
