# 🔐 Babysitter-Profil Supabase Integration

## Was wurde implementiert?

Der Babysitter-Name und das Profilbild werden jetzt **user-spezifisch in Supabase** gespeichert. Jeder eingeloggte Benutzer hat sein eigenes Profil.

## 📋 Setup-Anleitung

### Schritt 1: SQL-Datei in Supabase ausführen

1. Öffne dein **Supabase Dashboard**
2. Gehe zu **SQL Editor** (linkes Menü)
3. Klicke auf **New Query**
4. Kopiere den kompletten Inhalt aus `supabase-user-profiles.sql`
5. Füge ihn ein und klicke auf **Run**

### Schritt 2: Überprüfen

Nach dem Ausführen solltest du eine neue Tabelle sehen:
- **profiles** (mit Spalten: id, babysitter_name, profile_image, created_at, updated_at)

Du kannst das überprüfen unter: **Table Editor** → **profiles**

## 🔄 Wie funktioniert es?

### Beim Laden der Settings-Seite:
1. Die App prüft, ob ein User eingeloggt ist
2. Wenn ja: Profildaten werden aus Supabase geladen
3. Wenn nein: Fallback auf localStorage

### Beim Speichern:
1. Name/Bild wird in State und localStorage gespeichert (Offline-Fähigkeit)
2. Wenn eingeloggt: Zusätzlich in Supabase gespeichert (upsert)

### Automatisches Profil-Erstellen:
- Wenn sich ein neuer Benutzer registriert, wird automatisch ein leeres Profil erstellt
- Der User kann dann seinen Namen in den Einstellungen ergänzen

## 🔒 Sicherheit (Row Level Security)

Die Policies stellen sicher:
- ✅ User können **nur ihr eigenes** Profil sehen
- ✅ User können **nur ihr eigenes** Profil bearbeiten
- ❌ User können **keine anderen** Profile sehen oder ändern

## 🧪 Testen

1. **Logge dich ein** (oder registriere einen neuen Account)
2. Gehe zu **Einstellungen**
3. Gib einen **Babysitter-Namen** ein
4. Lade ein **Profilbild** hoch
5. Öffne das **Supabase Dashboard** → **Table Editor** → **profiles**
6. Du solltest deinen Eintrag mit deiner User-ID sehen! 🎉

## 🔁 Multi-Device Sync

Der große Vorteil: Wenn du dich auf einem **anderen Gerät** mit demselben Account anmeldest, werden automatisch dein Name und Profilbild geladen!

## 📝 Hinweise

- **Offline-Modus**: Daten werden zusätzlich in localStorage gespeichert
- **Bildkompression**: Profilbilder werden auf 300x300px komprimiert
- **Fehlerbehandlung**: Bei Supabase-Fehlern wird auf localStorage zurückgegriffen
- **Rückwärtskompatibilität**: Bestehende Daten in localStorage bleiben erhalten

## 🐛 Troubleshooting

**Problem**: "Fehler beim Laden des Profils"
- **Lösung**: Stelle sicher, dass die SQL-Datei korrekt ausgeführt wurde

**Problem**: "Fehler beim Speichern in Supabase"
- **Lösung**: Prüfe die RLS-Policies in Supabase

**Problem**: Name wird nicht gespeichert
- **Lösung**: Überprüfe in der Console, ob ein currentUser vorhanden ist

## 🎯 Nächste Schritte

Weitere Daten, die du in die `profiles` Tabelle aufnehmen könntest:
- Telefonnummer
- Adresse
- Notfallkontakt
- Zertifikate/Qualifikationen
- Sprachen

Einfach die Tabelle erweitern und die Funktionen anpassen!
