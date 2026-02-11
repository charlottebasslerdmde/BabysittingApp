# 🎬 Screencast-Anleitung für Abgabe

## ⏱️ Zeit: 10 Minuten

---

## 1️⃣ iOS Simulator vorbereiten (3 Min)

### A) Xcode & Simulator starten

```bash
# Terminal
cd "/Users/d0304104/Library/CloudStorage/OneDrive-dmdrogerie/Studium - Master/Mobile Business Apps/BabysittingApp"

# Capacitor Sync (iOS Dateien aktualisieren)
npx cap sync ios

# Xcode öffnen
open ios/App/App.xcodeproj
```

### B) In Xcode:

1. **Simulator auswählen:**
   - Oben links: Gerät auswählen
   - Empfohlen: **iPhone 15 Pro** oder **iPhone 14**
   
2. **App starten:**
   - ▶️ Play-Button drücken (oder Cmd+R)
   - Warte bis Simulator startet

3. **Simulator-Fenster optimieren:**
   - Window → Physical Size (Cmd+1) → Gute Größe für Recording
   - Oder: Window → Pixel Accurate (für HD-Qualität)

---

## 2️⃣ Demo-Account vorbereiten (2 Min)

### SQL in Supabase ausführen:

```sql
-- 1. In https://app.supabase.com → SQL Editor

-- Account erstellen (falls noch nicht vorhanden)
-- Manuell in App registrieren oder direkt per SQL:

-- 2. Account bestätigen nach Registrierung:
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'demo@sittersafe.app';

-- 3. Prüfen:
SELECT email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'demo@sittersafe.app';
```

### Demo-Credentials:

```
Email: demo@sittersafe.app
Passwort: SitterSafe2026!
```

---

## 3️⃣ Screencast aufnehmen (macOS) (1 Min)

### A) Screenshot-Tool öffnen:

```
⌘ Cmd + Shift + 5
```

### B) Aufnahme-Modus wählen:

1. **"Ausgewählten Bereich aufnehmen"** 
   - Damit nur Simulator-Fenster aufnehmen
   
2. Simulator-Fenster auswählen (anklicken)

3. **Optionen (wichtig!):**
   - Mikrofon: AN (falls du sprechen willst)
   - Mauszeiger anzeigen: AN
   - Speicherort: Schreibtisch

4. **"Aufnehmen" klicken**

### C) Alternative: QuickTime Player

```
QuickTime Player → Ablage → Neue Bildschirmaufnahme
```

---

## 4️⃣ Screencast-Drehbuch (3 Min Recording)

### 🎬 Szene 1: App Start (15 Sek)

```
1. Simulator zeigt Login-Seite
2. Kurz zeigen: "SitterSafe" Logo, Email/Passwort Felder
```

**Optional sprechen:**
> "SitterSafe ist eine Offline-First PWA mit Supabase-Backend und Authentifizierung."

---

### 🎬 Szene 2: Registrierung ODER Login (45 Sek)

#### Option A: Neue Registrierung zeigen

```
1. Klick auf "Noch kein Konto? Registrieren"
2. Email eingeben: demo2@sittersafe.app
3. Passwort eingeben: SitterSafe2026!
4. "Registrieren" klicken
5. Toast-Nachricht: "Bitte Email bestätigen"
6. Kurz zeigen, dann zu SQL Editor wechseln
7. SQL ausführen: UPDATE auth.users SET email_confirmed_at = NOW()...
8. Zurück zu App
9. Jetzt "Anmelden" klicken
10. → Login erfolgreich
```

**Sprechen:**
> "Nach der Registrierung ist Email-Verifizierung erforderlich. Für die Demo bestätige ich den Account direkt in der Datenbank."

#### Option B: Direkter Login (schneller)

```
1. Email: demo@sittersafe.app
2. Passwort: SitterSafe2026!
3. "Anmelden" klicken
4. → Home-Seite öffnet sich
```

**Sprechen:**
> "Login mit Email und Passwort. Passwörter werden gehasht, JWT-Tokens für Sessions."

---

### 🎬 Szene 3: Hauptfunktionen zeigen (60 Sek)

```
1. Home-Seite: Event erstellen
   - "Essen" wählen
   - Kind auswählen (Emma)
   - Details eingeben: "Apfelmus, 150ml"
   - Speichern

2. Browser DevTools zeigen (optional wenn im Web):
   - Application → Local Storage
   - Zeigen: Daten gespeichert

3. Supabase Table Editor zeigen:
   - Zu Supabase wechseln
   - Table Editor → events
   - Zeigen: Neues Event in Cloud gespeichert
   - user_id ist gesetzt (RLS!)

4. Zurück zur App:
   - Event-Log zeigen
   - Neues Event ist da

5. Settings öffnen:
   - "Abmelden" klicken
   - Bestätigen
   - → Redirect zu Login
```

**Sprechen:**
> "Events werden offline-first in localStorage gespeichert, dann mit Supabase synchronisiert. Row Level Security stellt sicher, dass jeder User nur eigene Daten sieht."

---

### 🎬 Szene 4: Sicherheit demonstrieren (30 Sek)

```
1. In Supabase SQL Editor:
   SELECT * FROM events;
   → Zeigen: Nur events von aktuellem User

2. RLS Policies zeigen:
   - Table Editor → events → Policies
   - Zeigen: "Users can only view their own events"

3. Zurück zur App:
   - Nochmal Login zeigen
   - Fertig!
```

**Sprechen:**
> "Row Level Security Policies im Backend schützen die Daten. PostgreSQL filtert automatisch basierend auf User-ID."

---

## 5️⃣ Aufnahme beenden & speichern

```
1. ⌘ Cmd + Control + Esc → Aufnahme stoppen
2. Datei wird auf Schreibtisch gespeichert
3. Video umbenennen: "SitterSafe_Demo_[Dein_Name].mov"
```

---

## 📱 Alternative: Web-Version im Browser (einfacher!)

### Vorteil: Einfacher zu bedienen, DevTools zeigen

```bash
# Terminal
npm run dev
```

Öffne: http://localhost:5173

### Screencast im Browser:

```
1. Browser-Fenster vorbereiten
2. DevTools öffnen (F12) → Console, Application tabs sichtbar
3. ⌘ Cmd + Shift + 5 → Browser-Fenster aufnehmen
4. Selbes Drehbuch wie oben durchführen
5. Zusätzlich zeigen:
   - Network Tab (Supabase Requests)
   - Application → Local Storage
   - Console (keine Fehler)
```

**Empfehlung:** Browser ist einfacher, da du direkt zwischen App und Supabase wechseln kannst!

---

## 🎯 Screencast-Checkliste

### Vor der Aufnahme:
- [ ] Demo-Account in Supabase bestätigt
- [ ] App läuft (Simulator oder Browser)
- [ ] Supabase Table Editor geöffnet (zweiter Tab)
- [ ] Notizen zum Sprechen vorbereitet
- [ ] Simulator/Browser-Fenster Größe optimiert

### Während der Aufnahme:
- [ ] Langsames Tempo (lesbar für Dozent)
- [ ] Jede Aktion kommentieren (sprechen oder Text-Overlays)
- [ ] Keine Fehler zeigen (vorher testen!)
- [ ] Gelungene Aktionen: Login, Event erstellen, Supabase sync, Logout

### Nach der Aufnahme:
- [ ] Video gespeichert
- [ ] Länge prüfen (2-3 Min ideal)
- [ ] Evtl. schneiden mit iMovie/QuickTime
- [ ] Datei umbenennen

---

## 🎥 Empfohlene Video-Struktur (2:30 Min)

```
00:00 - 00:15  Intro: App zeigen, Login-Screen
00:15 - 00:45  Login demonstrieren (mit Email-Verifizierung)
00:45 - 01:30  Event erstellen, Cloud-Sync zeigen
01:30 - 02:00  Supabase Table Editor, RLS demonstrieren
02:00 - 02:15  Offline-Modus (optional)
02:15 - 02:30  Logout, Zusammenfassung
```

---

## 💡 Profi-Tipps

### Video-Qualität:

```
✅ DO:
- Vollbild für Simulator/Browser
- Langsame Mausbewegungen
- Deutlich sprechen (oder später Voice-Over)
- Jede Aktion 2-3 Sekunden zeigen
- Bei Fehlern: Pause, wiederholen, schneiden

❌ DON'T:
- Zu schnell klicken
- Passwörter zeigen (außer Demo)
- Persönliche Daten
- Zu lange Ladezeiten (vorher testen!)
```

### Wenn etwas schief geht:

```
1. Aufnahme pausieren (Cmd+Control+Esc)
2. Problem beheben
3. Neue Aufnahme starten
4. Später Videos zusammenschneiden (iMovie)
```

### Schneiden mit iMovie (optional):

```
1. iMovie öffnen
2. Video importieren
3. Anfang/Ende trimmen
4. Fehler rausschneiden
5. Exportieren: Datei → Teilen → Datei
   - Qualität: Hoch (1080p)
   - Format: H.264
```

---

## 🚀 Quick-Start (für Eilige!)

```bash
# 1. Terminal
npm run dev

# 2. Browser öffnen
open http://localhost:5173

# 3. Screencast starten
# ⌘ Cmd + Shift + 5 → Browser-Fenster auswählen → Aufnehmen

# 4. Demo durchführen:
# - Login: demo@sittersafe.app / SitterSafe2026!
# - Event erstellen
# - Supabase Table Editor zeigen
# - Logout

# 5. Fertig!
# ⌘ Cmd + Control + Esc → Stoppen
```

**Gesamtzeit: 5 Minuten!** 🎯

---

## 📎 Anhang: Sprechtext-Vorlage

```
"Hallo, ich präsentiere SitterSafe - eine Babysitter-App mit Supabase-Backend.

[Login zeigen]
Die App nutzt Email-Authentifizierung mit Passwort-Hashing und JWT-Tokens.
Email-Verifizierung ist in Production aktiviert.

[Login durchführen]
Nach erfolgreichem Login sehen wir die Home-Seite.

[Event erstellen]
Ich erstelle jetzt ein Ess-Event für Emma mit Details.

[Speichern]
Das Event wird zuerst in localStorage gespeichert - Offline-First Strategie.
Dann wird es automatisch mit Supabase synchronisiert.

[Supabase zeigen]
Hier im Table Editor sehen wir das Event in der Cloud.
Die user_id ist automatisch gesetzt durch Row Level Security.

[RLS Policies zeigen]
Diese SQL-Policies stellen sicher, dass jeder User nur eigene Daten sieht.

[Logout]
Beim Abmelden werden JWT-Tokens gelöscht und wir kehren zum Login zurück.

Vielen Dank!"
```

---

## ✅ FERTIG!

Du hast jetzt alles für einen professionellen Screencast:
- ✅ Simulator/Browser Setup
- ✅ Demo-Account
- ✅ Aufnahme-Tools
- ✅ Drehbuch
- ✅ Sprechtext

**Viel Erfolg bei der Abgabe!** 🎓🚀
