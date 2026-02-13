# Supabase-Setup für Kinderübersicht

## 📋 Schritt-für-Schritt Anleitung

### 1. Datenbanktabelle erstellen

1. Öffne dein **Supabase Dashboard**: https://supabase.com/dashboard
2. Wähle dein Projekt aus
3. Gehe zu **SQL Editor** (linkes Menü)
4. Erstelle eine neue Query
5. Kopiere den Inhalt der Datei `supabase-children-setup.sql` und führe sie aus
6. Klicke auf **Run** (RUN Button)

### 2. Storage Bucket erstellen

1. Gehe zu **Storage** im Supabase Dashboard
2. Klicke auf **New Bucket**
3. Name: `child-photos`
4. Public: **false** (nur authentifizierte Benutzer)
5. File size limit: **5 MB**
6. Allowed MIME types: `image/jpeg, image/png, image/webp`

### 3. Storage Policies konfigurieren

Gehe zu Storage > child-photos > Policies und erstelle folgende Policies:

**Policy 1: Upload**
- Name: `Users can upload their own child photos`
- Operation: INSERT
- Policy: `(bucket_id = 'child-photos' AND auth.uid()::text = (storage.foldername(name))[1])`

**Policy 2: View**
- Name: `Users can view their own child photos`
- Operation: SELECT
- Policy: `(bucket_id = 'child-photos' AND auth.uid()::text = (storage.foldername(name))[1])`

**Policy 3: Update**
- Name: `Users can update their own child photos`
- Operation: UPDATE
- Policy: `(bucket_id = 'child-photos' AND auth.uid()::text = (storage.foldername(name))[1])`

**Policy 4: Delete**
- Name: `Users can delete their own child photos`
- Operation: DELETE
- Policy: `(bucket_id = 'child-photos' AND auth.uid()::text = (storage.foldername(name))[1])`

### 4. Testen

1. Öffne die App: http://localhost:5174/
2. Melde dich an (wichtig!)
3. Gehe zur Kinderübersicht
4. Füge ein Kind hinzu
5. Die Daten sollten jetzt automatisch in Supabase gespeichert werden

## 🔍 Debugging

### Console-Log überprüfen

Öffne die Browser-Console (F12) und schaue nach:
- `✅ Kinder erfolgreich mit Supabase synchronisiert` - Sync funktioniert
- `✅ Kind erfolgreich in Supabase gespeichert` - Speichern funktioniert
- `⚠️ Supabase-Sync fehlgeschlagen:` - Es gibt ein Problem

### Häufige Probleme

**Problem: "Kein User eingeloggt"**
- Lösung: Melde dich zuerst in der App an

**Problem: "relation 'children' does not exist"**
- Lösung: Führe das SQL-Skript `supabase-children-setup.sql` aus

**Problem: "Storage bucket not found"**
- Lösung: Erstelle den Storage Bucket wie in Schritt 2 beschrieben

## ✅ Fertig!

Nach erfolgreicher Einrichtung:
- Kinder werden automatisch in Supabase gespeichert
- Beim Öffnen der App werden Daten aus Supabase geladen
- Offline-Funktionalität bleibt erhalten (localStorage als Fallback)
