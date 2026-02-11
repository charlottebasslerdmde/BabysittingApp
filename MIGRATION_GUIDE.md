# 🚀 Supabase Backend-Integration - Migration Guide

Diese Anleitung zeigt dir, wie du SitterSafe von reinem localStorage auf eine vollständige Supabase-Backend-Integration umstellst, um die Anforderungen für **Backend-Integration** und **Absicherung mobiler Applikationen** zu erfüllen.

## 📋 Übersicht der Änderungen

### ✅ Neu implementierte Features

1. **🔐 Authentifizierung**
   - Login-Seite mit Email/Passwort
   - Magic Link (passwortlos) Login
   - Supabase Auth Integration
   - Row Level Security (RLS) für Datenschutz

2. **💾 Backend-Datenspeicherung**
   - Events (Aktivitäten) in Supabase
   - Kinderprofile in Supabase
   - Haushaltsdaten (optional)
   - Schichtdaten (optional)

3. **🌐 Offline-First-Strategie**
   - localStorage als Cache
   - Automatische Synchronisation bei Verbindung
   - Optimistic Updates (UI reagiert sofort)

4. **🛡️ Sicherheit**
   - Row Level Security (RLS)
   - Jeder User sieht nur seine eigenen Daten
   - Verschlüsselte Passwörter (Supabase Auth)
   - Sichere API-Keys

---

## 📦 Installation & Setup

### Schritt 1: Supabase-Migration ausführen

1. **Öffne dein Supabase-Projekt** auf [supabase.com](https://supabase.com)

2. **Führe zuerst die Basis-Setup aus:**
   - Öffne den **SQL Editor**
   - Kopiere den Inhalt von `supabase-setup.sql`
   - Führe das Skript aus (RUN)

3. **Führe dann die neue Migration aus:**
   - Kopiere den Inhalt von `supabase-migration.sql`
   - Führe das Skript aus (RUN)

   **Dies erstellt folgende Tabellen:**
   - ✅ `events` - Aktivitäts-Protokoll (Essen, Schlaf, etc.)
   - ✅ `children` - Kinderprofile
   - ✅ `household_data` - Haushaltsinformationen
   - ✅ `shifts` - Schichtdaten
   - ✅ `backups` - Cloud-Backups (bereits vorhanden)
   - ✅ `feedback` - Benutzer-Feedback (bereits vorhanden)

### Schritt 2: Dependencies installieren

Die benötigten Packages sollten bereits installiert sein:

```bash
npm install @supabase/supabase-js
```

### Schritt 3: App starten

```bash
npm run dev
```

---

## 🔑 Neue Funktionen nutzen

### 1. Login & Registrierung

**Drei Möglichkeiten:**

#### A) Email + Passwort
1. Öffne die App (du wirst zur Login-Seite weitergeleitet)
2. Klicke auf "Noch kein Account? Registrieren"
3. Gib Email und Passwort ein (mind. 6 Zeichen)
4. Klicke "Registrieren"
5. **Bestätige deine Email** (Supabase sendet eine Bestätigungs-Mail)
6. Melde dich an

#### B) Magic Link (Empfohlen für Demo)
1. Öffne die Login-Seite
2. Gib nur deine Email ein
3. Klicke "Magic Link senden"
4. **Prüfe dein Email-Postfach**
5. Klicke auf den Link in der Email
6. Du wirst automatisch eingeloggt

#### C) Entwicklung/Testing
Für schnelles Testing kannst du auch temporär die Email-Bestätigung in Supabase deaktivieren:
- Gehe zu **Authentication** → **Settings**
- Deaktiviere "Enable email confirmations"

### 2. Daten-Synchronisation

**Automatisch:**
Die App synchronisiert Daten automatisch im Hintergrund:

- **Beim App-Start**: Lädt alle Events und Kinder von Supabase
- **Beim Event erstellen**: Speichert sofort in Supabase (+ localStorage als Fallback)
- **Offline**: Nutzt localStorage, synchronisiert wenn Verbindung wieder da ist

**Manuell (optional):**
Du kannst in home.jsx weitere Sync-Buttons hinzufügen, z.B.:

```jsx
const syncNow = async () => {
  await loadKinderData();
  await loadEventLog();
  f7.toast.show({ text: '🔄 Daten synchronisiert', position: 'center' });
};
```

### 3. Abmelden

- Öffne **Einstellungen** (⚙️)
- Scrolle nach unten zu "Sicherung & Daten"
- Klicke auf **"Abmelden"** (orange)
- Bestätige

---

## 🏗️ Architektur & Datenfluss

### Offline-First-Strategie

```
┌─────────────┐
│   UI Click  │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Optimistic Update   │ ◀─── Sofortiges UI-Feedback
│ (setEventLog)       │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ localStorage Save   │ ◀─── Offline-Fallback
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Supabase Sync       │ ◀─── Backend-Persistierung
│ (Background)        │
└─────────────────────┘
```

### Daten-Lade-Reihenfolge

1. **localStorage** → Sofortiges UI (kein Ladebildschirm)
2. **Supabase** → Aktuellste Daten im Hintergrund laden
3. **Merge** → UI updaten wenn Supabase-Daten ankommen

---

## 🔒 Sicherheitskonzept

### Row Level Security (RLS)

Alle Tabellen sind mit RLS geschützt:

```sql
-- Beispiel: Events Tabelle
CREATE POLICY "Users can view their own events"
  ON events FOR SELECT
  USING (auth.uid() = user_id);
```

**Bedeutung:**
- ✅ User A kann nur seine eigenen Events sehen
- ❌ User A kann **nicht** Events von User B sehen
- ✅ Selbst bei direktem API-Zugriff geschützt

### Authentifizierung

- **JWT-Tokens**: Supabase nutzt JSON Web Tokens
- **Session Management**: Automatisch über `supabase.auth`
- **Refresh Tokens**: Sessions bleiben 7 Tage gültig

### Best Practices

1. **API-Keys nicht committen**: `.env` Datei nutzen (für Produktion)
2. **RLS immer aktiviert**: Nie deaktivieren!
3. **Input Validation**: Nutze Supabase Policies für zusätzliche Checks

---

## 📊 Datenbank-Schema

### `events` Tabelle

```sql
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  child_id TEXT,
  event_type TEXT,          -- 'essen', 'schlaf', 'windel', 'spiel'
  event_time TIMESTAMP,
  mood TEXT,                -- '😢', '😐', '😊', '😄'
  details JSONB,            -- Flexible Details je Event-Typ
  icon TEXT,
  color TEXT
);
```

**Beispiel-Event:**

```json
{
  "user_id": "uuid-123",
  "child_id": "kind-456",
  "event_type": "essen",
  "event_time": "2026-02-11T14:30:00Z",
  "mood": "😊",
  "details": {
    "was": "Apfelmus",
    "menge": "150ml",
    "activityText": "Max: Essen - Apfelmus"
  },
  "icon": "mouth_fill",
  "color": "blue"
}
```

### `children` Tabelle

```sql
CREATE TABLE children (
  id TEXT PRIMARY KEY,      -- Client-generated UUID
  user_id UUID,
  data JSONB,               -- Komplettes Profil als JSON
  avatar_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 🧪 Testing

### Testplan

1. **Registrierung testen**
   - Neuen Account erstellen
   - Email bestätigen
   - Einloggen

2. **Offline-Modus testen**
   - Event erstellen (mit Netzwerk)
   - Browser-DevTools: Network → Offline
   - Weiteres Event erstellen
   - Online gehen → prüfen ob synchronisiert

3. **Multi-Device testen**
   - Auf Gerät A einloggen
   - Event erstellen
   - Auf Gerät B mit selben Account einloggen
   - Event sollte sichtbar sein

4. **RLS testen**
   - Zwei Accounts erstellen
   - Mit Account A Events erstellen
   - Mit Account B einloggen
   - Events von A sollten **nicht** sichtbar sein

---

## 🐛 Troubleshooting

### "Login fehlgeschlagen"

**Checklist:**
- ✅ Supabase-Projekt läuft?
- ✅ API-Keys in `src/js/supabase.js` korrekt?
- ✅ Email-Bestätigung erforderlich? (siehe Supabase Settings)
- ✅ Browser-Konsole für Details prüfen

### "Events werden nicht gespeichert"

**Checklist:**
- ✅ Tabellen existieren? (Table Editor prüfen)
- ✅ RLS-Policies aktiv? (SQL Editor: `SELECT * FROM pg_policies;`)
- ✅ User eingeloggt? (`supabase.auth.getSession()` in Console testen)
- ✅ Browser-Konsole für Fehler prüfen

### "Daten synchronisieren nicht"

**Lösung:**
```javascript
// In Browser-Konsole ausführen:
const { data } = await supabase.auth.getSession();
console.log('Current user:', data.session?.user);

// Test: Events manuell laden
const { data: events } = await supabase.from('events').select('*');
console.log('Events from Supabase:', events);
```

### "Network Error"

**Mögliche Ursachen:**
- CORS-Probleme (sollte nicht passieren, da Supabase CORS erlaubt)
- Falsche Supabase-URL
- API-Key falsch

**Fix:**
- Prüfe `supabaseUrl` in `src/js/supabase.js`
- Stelle sicher, dass es `https://` nutzt

---

## 📈 Next Steps & Erweiterungen

### Empfohlene Verbesserungen

1. **Profilbilder in Supabase Storage**
   ```javascript
   const { data, error } = await supabase.storage
     .from('avatars')
     .upload(`${userId}/avatar.jpg`, file);
   ```

2. **Echtzeit-Updates (Realtime)**
   ```javascript
   supabase
     .channel('events')
     .on('postgres_changes', { 
       event: 'INSERT', 
       schema: 'public', 
       table: 'events' 
     }, (payload) => {
       console.log('New event:', payload.new);
       // UI updaten
     })
     .subscribe();
   ```

3. **Push-Benachrichtigungen**
   - Nutze Supabase Edge Functions
   - Integriere Firebase Cloud Messaging

4. **Export/Import optimieren**
   - Direkt von/zu Supabase
   - PDF-Generation serverseitig

---

## 📚 Weitere Ressourcen

- **Supabase Docs**: https://supabase.com/docs
- **Framework7 Docs**: https://framework7.io/docs/
- **Supabase Auth Guide**: https://supabase.com/docs/guides/auth
- **Row Level Security**: https://supabase.com/docs/guides/auth/row-level-security

---

## ✅ Zusammenfassung

**Du hast erfolgreich implementiert:**

✅ **Authentifizierung** mit Supabase Auth (Magic Link + Email/Passwort)  
✅ **Backend-Integration** mit Supabase PostgreSQL  
✅ **Row Level Security** für Datenschutz  
✅ **Offline-First-Strategie** mit localStorage als Fallback  
✅ **Optimistic Updates** für schnelle UI-Reaktion  
✅ **Logout-Funktion** in den Einstellungen  

**Studiums-Anforderungen erfüllt:**

🎓 **Backend-Integration** ✅  
🎓 **Absicherung mobiler Applikationen** ✅  
🎓 **Cloud-Datenspeicherung** ✅  
🎓 **Benutzer-Authentifizierung** ✅  

---

**Viel Erfolg mit deinem Projekt! 🚀**
