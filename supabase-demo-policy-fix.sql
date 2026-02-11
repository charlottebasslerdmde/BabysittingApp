-- SitterSafe Demo-Policy Fix
-- Führe dieses SQL-Skript aus, wenn du bereits die Tabellen erstellt hast
-- und Probleme mit dem Cloud-Backup hast

-- 1. Alte Policies löschen
DROP POLICY IF EXISTS "Users can view their own backups" ON backups;
DROP POLICY IF EXISTS "Users can create their own backups" ON backups;
DROP POLICY IF EXISTS "Users can delete their own backups" ON backups;

-- 2. Neue Policies mit Demo-User Support erstellen
CREATE POLICY "Users can view their own backups"
  ON backups FOR SELECT
  USING (auth.uid()::text = user_id OR user_id = 'demo_user');

CREATE POLICY "Users can create their own backups"
  ON backups FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR user_id = 'demo_user');

CREATE POLICY "Users can delete their own backups"
  ON backups FOR DELETE
  USING (auth.uid()::text = user_id OR user_id = 'demo_user');

-- 3. Fertig! 🎉
-- Jetzt sollte das Cloud-Backup mit 'demo_user' funktionieren
