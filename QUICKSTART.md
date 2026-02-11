# ⚡ Schnellstart: Supabase Setup

## 🚨 Wichtig: Du siehst 404-Fehler, weil die Datenbank-Tabellen noch nicht existieren!

### Schritt 1: Supabase SQL Editor öffnen

1. Gehe zu [https://supabase.com](https://supabase.com)
2. Öffne dein Projekt: **zjktxqcdqvxodccfrumo**
3. Linke Sidebar → **SQL Editor**

### Schritt 2: Tabellen erstellen

**Führe diese SQL-Skripte in dieser Reihenfolge aus:**

#### A) Basis-Setup (falls noch nicht gemacht)
```bash
# Öffne: supabase-setup.sql
# Kopiere den gesamten Inhalt
# Füge ihn in den SQL Editor ein
# Klicke "RUN" oder drücke Cmd/Ctrl + Enter
```

#### B) Migration für Events & Children
```bash
# Öffne: supabase-migration.sql
# Kopiere den gesamten Inhalt
# Füge ihn in den SQL Editor ein
# Klicke "RUN"
```

### Schritt 3: Email-Redirect konfigurieren

1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. **Site URL**: `http://localhost:5173`
3. **Redirect URLs**: Füge hinzu:
   ```
   http://localhost:5173
   http://localhost:5173/**
   ```

### Schritt 4: Email-Bestätigung deaktivieren (für Testing)

1. **Authentication** → **Settings** → **Auth Settings**
2. Deaktiviere: ✅ **"Enable email confirmations"**
3. Speichern

### Schritt 5: App neu starten

```bash
# Stoppe den Server (Ctrl+C)
npm run dev
```

### ✅ Jetzt sollte es funktionieren!

1. Registriere einen Account (ohne Email-Bestätigung)
2. Login funktioniert sofort
3. Keine 404-Fehler mehr

---

## 🔍 Überprüfung

**Prüfe ob Tabellen existieren:**

Supabase → **Table Editor** → Du solltest sehen:
- ✅ `events`
- ✅ `children`
- ✅ `household_data`
- ✅ `shifts`
- ✅ `backups`
- ✅ `feedback`

Wenn nicht → SQL-Skripte erneut ausführen!
