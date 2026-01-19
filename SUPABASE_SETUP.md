# 🔧 Supabase Setup für SitterSafe

Diese Anleitung zeigt dir, wie du die Cloud-Backup-Funktion mit Supabase einrichtest.

## 📋 Voraussetzungen

1. Ein kostenloses Supabase-Konto: [supabase.com](https://supabase.com)
2. Ein neues Projekt in Supabase erstellt

## 🚀 Schritt-für-Schritt Anleitung

### 1. Supabase-Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com) und melde dich an
2. Klicke auf "New Project"
3. Wähle einen Namen und ein Passwort für deine Datenbank
4. Warte, bis das Projekt erstellt ist (~2 Minuten)

### 2. Datenbank-Tabellen erstellen

1. Öffne in deinem Supabase-Projekt den **SQL Editor** (linke Sidebar)
2. Klicke auf "New Query"
3. Kopiere den Inhalt der Datei `supabase-setup.sql` und füge ihn ein
4. Klicke auf **"Run"** oder drücke `Cmd/Ctrl + Enter`

Die folgenden Tabellen werden erstellt:
- ✅ `backups` - Für Cloud-Backups deiner App-Daten
- ✅ `feedback` - Für Benutzer-Feedback
- ✅ `app_stats` - Für App-Statistiken (optional)

### 3. API-Schlüssel holen

1. Gehe zu **Settings** → **API** in deinem Supabase-Projekt
2. Kopiere:
   - **Project URL** (z.B. `https://xyz.supabase.co`)
   - **anon public** API-Key (ein langer String)

### 4. API-Schlüssel in die App eintragen

Die Schlüssel sind bereits in der Datei `src/js/supabase.js` eingetragen:

```javascript
const supabaseUrl = 'https://zjktxqcdqvxodccfrumo.supabase.co';
const supabaseKey = 'eyJhbGci...'; // Dein Key
```

✅ **Das ist bereits konfiguriert!**

Falls du ein anderes Supabase-Projekt verwenden möchtest, ersetze diese Werte.

## 🎯 Funktionen testen

Nach dem Setup kannst du folgende Features nutzen:

### In der App (Settings-Seite):

1. **Cloud-Backup erstellen**
   - Speichert alle deine App-Daten in Supabase
   - Inkl. Device-Info und Zeitstempel

2. **Cloud-Backup wiederherstellen**
   - Lädt das neueste Backup zurück

3. **Cloud-Backups anzeigen**
   - Zeigt alle verfügbaren Backups an
   - Wähle ein spezifisches Backup zum Wiederherstellen

4. **Cloud-Backups verwalten**
   - Lösche alte Backups (behält das neueste)
   - Spart Speicherplatz

5. **Feedback senden**
   - Wird sowohl lokal als auch in Supabase gespeichert

## 🔒 Sicherheit

Die Setup-Datei aktiviert automatisch **Row Level Security (RLS)**:
- Benutzer können nur ihre eigenen Backups sehen
- Jeder kann Feedback senden (anonym möglich)
- Daten sind geschützt

## 📊 Daten in Supabase anschauen

1. Gehe zu **Table Editor** in deinem Supabase-Projekt
2. Wähle eine Tabelle aus (`backups`, `feedback`, etc.)
3. Du siehst alle gespeicherten Einträge

## 🐛 Probleme?

### "Cloud-Backup fehlgeschlagen"
- ✅ Überprüfe, ob die Tabellen erstellt wurden (Table Editor)
- ✅ Stelle sicher, dass die API-Keys korrekt sind
- ✅ Prüfe die Browser-Konsole für detaillierte Fehlermeldungen

### "Kein Cloud-Backup gefunden"
- ✅ Erstelle zuerst ein Backup mit "Cloud-Backup erstellen"
- ✅ Warte einen Moment und versuche es erneut

### Tabellen existieren nicht
- ✅ Führe `supabase-setup.sql` im SQL Editor aus
- ✅ Prüfe, ob die Tabellen im Table Editor sichtbar sind

## 💡 Tipps

- **Automatisches Backup**: Aktiviere "Auto-Backup" in den Einstellungen
- **Mehrere Geräte**: Nutze Cloud-Backup zum Synchronisieren
- **Datenschutz**: Alle Daten werden nur gespeichert, wenn du es aktiv machst

## 🎉 Fertig!

Deine App ist jetzt mit Supabase verbunden und du kannst Cloud-Backups nutzen!

---

**Hinweis**: In der aktuellen Demo-Version wird die `user_id` als `'demo_user'` gespeichert. 
Für eine Produktions-App solltest du eine echte Benutzer-Authentifizierung implementieren.
