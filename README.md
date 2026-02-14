Hier ist die **finale, vollständige Version** deiner `README.md`.

Sie enthält jetzt:

1. Das **Mermaid-Architektur-Diagramm** (wird in GitLab automatisch als Grafik angezeigt).
2. Den neuen **Accessibility/WCAG-Abschnitt** (statt "AI Act").
3. Die vollständige **Supabase & PWA Dokumentation**.
4. Die korrekte Struktur gemäß der Vorlage.

Du kannst den gesamten Block unten kopieren und direkt in deine Datei einfügen.

---

# 👶 SitterSafe – README

## 👥 Angaben zur Person (Einzelleistung)

* **Name:** Charlotte Baßler
* **Matrikel-Nr.:** 5109861
* **Studiengang:** Wirtschaftsinformatik

---

## Use Case: SitterSafe – Die digitale Vertrauensbrücke für Kinderbetreuung

Das vorliegende System **SitterSafe** verfolgt das Ziel, die Kommunikation und Dokumentation zwischen Eltern und Babysittern zu professionalisieren, zu strukturieren und sicher zu gestalten. Es ersetzt analoge "Zettelwirtschaft" und unsichere Messenger-Kommunikation durch eine spezialisierte Anwendung, die Cloud-Synchronisation mit lokaler Offline-Verfügbarkeit vereint.

### 🎯 Ziel des Systems

Das primäre Ziel ist die **Sicherheit und Transparenz** im Betreuungskontext. Mobile Anwendungen müssen im Unternehmens- oder Privatkontext oft unter schwierigen Bedingungen funktionieren (wechselnde Netzabdeckung, Datenschutzanforderungen, schwierige Lichtverhältnisse).

**Kernziele & Ablauf:**

1. **Single Source of Truth (Cloud & Local):** Zentralisierung aller kindbezogenen Daten (Medikation, Routinen, Notfallkontakte). Änderungen werden via Supabase in Echtzeit synchronisiert.
2. **Lückenlose Dokumentation:** Echtzeit-Erfassung von Betreuungsereignissen (Essen, Schlaf, Vorfälle).
3. **Privacy by Design:** Datensparsamer Umgang mit Medien. Fotos landen sicher im Cloud-Storage und nicht ungeschützt in der privaten Galerie des Sitters.

**Ergebnis:**
Eltern erhalten ein digitales Live-Protokoll und Sitter haben ein intelligentes Werkzeug, das sie aktiv bei der Einhaltung von Routinen unterstützt.

---

## Technische Architektur & Cloud-Integration

Die Anwendung wurde als **Cross-Platform Progressive Web App (PWA)** implementiert, die mit einem **Supabase-Backend** kommuniziert. Dieser Ansatz ("Mobile First, Cloud Native") entspricht modernen Architektur-Patterns für verteilte Systeme.

graph TB
    subgraph "Presentation Layer"
        UI[Framework7 React UI]
        Pages[Pages Layer]
        HomePage[home.jsx<br/>Tracker & Timeline]
        KinderPage[kinder.jsx<br/>Children List]
        KindDetail[KindDetailPage.jsx<br/>Child Profile]
        LoginPage[Login.jsx<br/>Authentication]
        Settings[settings.jsx<br/>Configuration]
        
        UI --> Pages
        Pages --> HomePage
        Pages --> KinderPage
        Pages --> KindDetail
        Pages --> LoginPage
        Pages --> Settings
    end
    
    subgraph "Business Logic Layer"
        Components[React Components]
        Services[Services]
        ChildrenService[childrenService.js<br/>Child CRUD]
        AuthGuard[authGuard.js<br/>Route Protection]
        ImageUtils[imageUtils.js<br/>Image Compression]
        i18n[i18n.js<br/>Internationalization]
        
        Pages --> Components
        Components --> Services
        Services --> ChildrenService
        Services --> AuthGuard
        Services --> ImageUtils
        Services --> i18n
    end
    
    subgraph "State Management"
        ReactState[React useState/useEffect]
        LocalStorage[Browser LocalStorage<br/>Offline-First Cache]
        
        Components --> ReactState
        ReactState --> LocalStorage
    end
    
    subgraph "Backend Services - Supabase"
        SupabaseClient[supabase.js Client]
        Auth[Supabase Auth<br/>User Management]
        Database[PostgreSQL Database]
        Storage[Supabase Storage<br/>Photo Storage]
        
        SupabaseClient --> Auth
        SupabaseClient --> Database
        SupabaseClient --> Storage
        
        subgraph "Database Tables"
            Children[children table<br/>Child profiles]
            Events[events table<br/>Activity log]
            Profiles[user_profiles table<br/>User data]
        end
        
        Database --> Children
        Database --> Events
        Database --> Profiles
    end
    
    subgraph "Mobile Platform"
        Capacitor[Capacitor]
        Camera[Camera Plugin]
        Share[Share Plugin]
        iOS[iOS Native]
        Android[Android Native]
        
        Capacitor --> Camera
        Capacitor --> Share
        Capacitor --> iOS
        Capacitor --> Android
    end
    
    subgraph "Data Flow"
        OfflineSync[Offline-First Strategy]
        OptimisticUI[Optimistic UI Updates]
    end
    
    Services --> SupabaseClient
    LocalStorage -.Fallback.-> Components
    SupabaseClient -.Sync.-> LocalStorage
    
    Components --> Capacitor
    ImageUtils --> Camera
    HomePage --> Share
    
    ReactState --> OfflineSync
    OfflineSync --> LocalStorage
    OfflineSync --> SupabaseClient
    
    ReactState --> OptimisticUI
    OptimisticUI -.Fast Feedback.-> UI
    
    style UI fill:#667eea,stroke:#333,stroke-width:2px,color:#fff
    style SupabaseClient fill:#3ecf8e,stroke:#333,stroke-width:2px,color:#fff
    style LocalStorage fill:#ff9500,stroke:#333,stroke-width:2px,color:#fff
    style Capacitor fill:#53b9ff,stroke:#333,stroke-width:2px,color:#fff
    style OfflineSync fill:#af52de,stroke:#333,stroke-width:2px,color:#fff

### 🏗 Tech Stack

* **Frontend:** React 19 & Framework7 (v9) – *Für natives iOS Look & Feel.*
* **Build-System:** Vite (v7) – *High-Performance Bundling.*
* **PWA Layer:** Workbox – *Offline-Caching Strategien.*
* **Backend-as-a-Service (BaaS):** **Supabase** (Open Source Firebase Alternative).

### ☁️ Backend Features (Supabase Integration)

Gemäß den Vorlesungsinhalten zur Integration von Backend-Diensten nutzt SitterSafe Supabase für folgende Funktionen:

1. **Datenbank (PostgreSQL):** Speicherung der Kinder-Profile und Event-Logs.
2. **Authentication:** Sichere Anmeldung und Session-Management (JWT Tokens).
3. **Row Level Security (RLS):** Implementierung eines strikten Sicherheitsmodells direkt auf Datenbankebene. Ein Sitter darf nur die Daten der Kinder sehen ("SELECT"), denen er explizit zugeordnet ist.
4. **Storage Buckets:** Sichere Ablage der über die App aufgenommenen Fotos.

---

## PWA Features & UX Design

Besonderer Wert wurde auf die Umsetzung der im Modul "Mobile Business Applications" besprochenen PWA-Charakteristika sowie auf Barrierefreiheit gelegt.

### 1. Offline-Fähigkeit (Resilience)

Da mobile Geräte oft Verbindungsabbrüche haben (Fahrstuhl, Keller), nutzt die App einen **Service Worker** (`sw.js`).

* **Strategie:** `StaleWhileRevalidate` bzw. `NetworkFirst` für kritische Assets.
* **Effekt:** Die App lädt auch ohne Internetverbindung sofort (Shell-Architecture) und erlaubt Zugriff auf cached Profile.

### 2. Zugriff auf Geräte-Hardware (Sensoren)

* **Kamera-Integration:** Nutzung von `<input type="file" capture="environment">` für direkten Hardware-Zugriff.
* **Haptisches Feedback:** Nutzung der **Vibration API** bei kritischen Aktionen (z.B. Notfall-Alarm).
* **Installierbarkeit:** Über das Web App Manifest verhält sich die App wie eine native Anwendung (Standalone Mode).

### 3. Accessibility & Mobile Context (Barrierefreiheit)

Da die App oft unter schwierigen Lichtverhältnissen genutzt wird (z.B. helle Sonne auf dem Spielplatz oder abgedunkeltes Kinderzimmer), wurde strikt auf **optimale Kontrastverhältnisse** geachtet.

* **WCAG Compliance:** Die Farbpalette und UI-Elemente orientieren sich an den **WCAG 2.1 Level AA** Standards, um maximale Lesbarkeit zu gewährleisten.
* **Visual Clarity:** Nutzung von klaren Icons und eindeutiger Typografie zur Vermeidung von Fehlbedienung in Stresssituationen.

---

## Installation & Bereitstellung (Build)

Der Quellcode liegt als Vite-Projekt vor. Für die lokale Ausführung werden Node.js und die entsprechenden Environment-Variablen benötigt.

### Voraussetzungen

* [Node.js](https://nodejs.org/) (LTS Version)
* [npm](https://www.npmjs.com/)

### Setup

1. **Abhängigkeiten installieren:**
```bash
npm install

```


2. **Umgebungsvariablen konfigurieren:**
Erstellen Sie eine `.env` Datei im Hauptverzeichnis mit Ihren Supabase-Credentials:
```env
VITE_SUPABASE_URL=ihre-project-url
VITE_SUPABASE_ANON_KEY=ihr-anon-key

```


3. **Entwicklungsserver starten:**
```bash
npm run dev

```


Die App ist unter `http://localhost:5173/` erreichbar.

### Production Build (Abgabe-Artefakt)

Für die finale Abgabe wird der Code minifiziert und der Service Worker generiert:

```bash
npm run build

```

**Wichtig für die Abgabe:**
Der Befehl erzeugt den Ordner **`www/`**. Dieser Ordner enthält die **deploy-fähige PWA** inkl. aller Assets und Service Worker Logic. Dieser Ordner entspricht dem Inhalt der eingereichten ZIP-Datei.

Um den Production-Build lokal zu simulieren:

```bash
npm run preview

```

---

## Projektstruktur

* `src/components/`: UI-Komponenten (Framework7 Cards, Sheets).
* `src/pages/`: Hauptansichten (Home, Profil, Tracker).
* `src/js/supabase.js`: Initialisierung des Supabase-Clients.
* `src/js/store.js`: Globales State Management.
* `vite.config.js`: Konfiguration des Bundlers und PWA-Manifests.
* `workbox-config.js`: Caching-Strategien für den Offline-Modus.

---

## Ausblick (Future Work)

Die Architektur ist für eine einfache Migration in einen Hybrid-Container vorbereitet:

* **Capacitor:** Wrapper für den Zugriff auf native Push-Notifications.
* **Geofencing:** Automatischer Check-In bei Ankunft am Einsatzort (via Supabase Edge Functions).