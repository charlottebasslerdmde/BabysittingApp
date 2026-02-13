-- ========================================
-- Storage Bucket und Policies für Kinder-Fotos
-- ========================================
-- WICHTIG: Führe diesen Code im Supabase SQL Editor aus
-- NACH dem du die children-Tabelle erstellt hast
-- ========================================

-- 1. Storage Bucket erstellen (falls noch nicht vorhanden)
INSERT INTO storage.buckets (id, name, public)
VALUES ('child-photos', 'child-photos', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies erstellen
-- WICHTIG: Zuerst alte Policies löschen falls vorhanden
DROP POLICY IF EXISTS "Users can upload their own child photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own child photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own child photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own child photos" ON storage.objects;

-- Policy 1: Fotos hochladen (INSERT)
-- Erlaubt Usern, Fotos im Format: user_id/child_id.jpg hochzuladen
CREATE POLICY "Users can upload their own child photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'child-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: Fotos ansehen (SELECT)
-- Erlaubt Usern, nur ihre eigenen Fotos anzusehen
CREATE POLICY "Users can view their own child photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'child-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Fotos aktualisieren (UPDATE)
-- Erlaubt Usern, nur ihre eigenen Fotos zu aktualisieren
CREATE POLICY "Users can update their own child photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'child-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'child-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Fotos löschen (DELETE)
-- Erlaubt Usern, nur ihre eigenen Fotos zu löschen
CREATE POLICY "Users can delete their own child photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'child-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ========================================
-- ✅ FERTIG!
-- ========================================
-- Der Bucket 'child-photos' ist jetzt erstellt mit allen Policies.
-- 
-- WICHTIG: Fotos werden in diesem Format gespeichert:
-- {user_id}/{child_id}.jpg
-- Beispiel: a1b2c3d4-e5f6-7890-abcd-ef1234567890/1234567890.jpg
--
-- Jeder User sieht nur seine eigenen Fotos (im Ordner mit seiner user_id)
-- ========================================
