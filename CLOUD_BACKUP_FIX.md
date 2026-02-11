# Cloud-Backup Problem beheben

## Problem
Die Fehlermeldung beim Cloud-Backup tritt auf, weil entweder:
1. Die Tabellen noch nicht erstellt wurden, ODER
2. **Row Level Security (RLS)** den Zugriff blockiert

## Lösung

### Schritt 1: Tabellen erstellen (ZUERST!)

1. Öffne dein **Supabase Dashboard** → https://app.supabase.com
2. Wähle dein Projekt aus
3. Gehe zu **SQL Editor** (linke Seitenleiste)
4. Führe die Datei `supabase-setup.sql` aus (VOLLSTÄNDIG):

```sql
-- SitterSafe Supabase Datenbank Setup

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

-- 4. DEMO-Policies mit Demo-User Support
CREATE POLICY "Users can view their own backups"
  ON backups FOR SELECT
  USING (auth.uid()::text = user_id OR user_id = 'demo_user');

CREATE POLICY "Users can create their own backups"
  ON backups FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR user_id = 'demo_user');

CREATE POLICY "Users can delete their own backups"
  ON backups FOR DELETE
  USING (auth.uid()::text = user_id OR user_id = 'demo_user');

-- 5. Feedback Tabelle
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
```

5. Klicke auf **Run** (oder Ctrl/Cmd + Enter)
6. Warte auf die Bestätigung "Success. No rows returned"

### Schritt 2: Überprüfen

1. Gehe zu **Table Editor** (linke Seitenleiste)
2. Du solltest jetzt die Tabellen `backups` und `feedback` sehen

### Schritt 3: Testen

1. Öffne deine App
2. Gehe zu **Einstellungen**
3. Klicke auf "Cloud-Backup erstellen"
4. Du solltest "☁️ Cloud-Backup erfolgreich" sehen

---

## Alternative: Nur Policies aktualisieren (Falls Tabellen schon existieren)

### Option 1: Demo-Policy anwenden

1. Öffne dein **Supabase Dashboard**
2. Gehe zu **SQL Editor**
3. Führe die Datei `supabase-demo-policy-fix.sql` aus:

```sql
-- Alte Policies löschen
DROP POLICY IF EXISTS "Users can view their own backups" ON backups;
DROP POLICY IF EXISTS "Users can create their own backups" ON backups;
DROP POLICY IF EXISTS "Users can delete their own backups" ON backups;

-- Neue Policies mit Demo-User Support
CREATE POLICY "Users can view their own backups"
  ON backups FOR SELECT
  USING (auth.uid()::text = user_id OR user_id = 'demo_user');

CREATE POLICY "Users can create their own backups"
  ON backups FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR user_id = 'demo_user');

CREATE POLICY "Users can delete their own backups"
  ON backups FOR DELETE
  USING (auth.uid()::text = user_id OR user_id = 'demo_user');
```

4. Klicke auf **Run**

### Option 2: RLS temporär deaktivieren (Nur für Entwicklung!)

1. Öffne **Supabase Dashboard** → **SQL Editor**
2. Führe aus:
```sql
ALTER TABLE backups DISABLE ROW LEVEL SECURITY;
ALTER TABLE feedback DISABLE ROW LEVEL SECURITY;
```

⚠️ **Warnung**: Dies sollte NUR in der Entwicklung verwendet werden!

### Option 3: Echte Authentifizierung implementieren (Empfohlen für Produktion)

Siehe `SUPABASE_CONFIG.md` für die vollständige Authentifizierungs-Implementierung.

## Testen

Nach der Anwendung einer Lösung:

1. Öffne die App
2. Gehe zu **Einstellungen**
3. Klicke auf "Cloud-Backup erstellen"
4. Du solltest jetzt die Meldung "☁️ Cloud-Backup erfolgreich" sehen

## Weitere Hilfe

Wenn das Problem weiterhin besteht, überprüfe:
- Ob die Tabelle `backups` existiert (Supabase → Table Editor)
- Ob die Supabase URL und API Key korrekt sind (`src/js/supabase.js`)
- Die Browser-Konsole für detaillierte Fehlermeldungen
