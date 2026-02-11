# SitterSafe App Icons

## 🎨 Design

Das App-Icon zeigt:
- **Gradient-Hintergrund**: Lila-Farbverlauf (#667eea → #764ba2) für moderne, vertrauenswürdige Optik
- **Baby/Kind-Symbol**: Stilisiertes Kind in Weiß als Hauptelement
- **Herz**: Rosa-Herz als Symbol für Liebe und Fürsorge
- **Schutzschild**: Dezenter Schild im Hintergrund für Sicherheit
- **Sterne**: Dekorative Sterne für Qualität und Schutz

## 📱 Generierte Größen

### Web/PWA Icons:
- `128x128.png` - Chrome/Edge App
- `144x144.png` - Windows Tiles
- `152x152.png` - iPad
- `192x192.png` - Android Home Screen
- `256x256.png` - Windows App
- `512x512.png` - PWA Splash Screen
- `1024x1024.png` - Master Icon

### Spezielle Icons:
- `apple-touch-icon.png` (180x180) - iOS Home Screen
- `favicon.png` (32x32) - Browser Tab

### Source:
- `app-icon.svg` - Master SVG (skalierbar)

## 🔄 Icons neu generieren

```bash
# 1. SVG erstellen
node generate-icon.js

# 2. PNG-Varianten generieren
node convert-icon.js

# 3. iOS Icons aktualisieren
cp public/icons/1024x1024.png ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png

# 4. App neu builden
npm run build && npx cap sync ios
```

## 🎯 Verwendung

Die Icons werden automatisch von:
- **PWA Manifest** (`src/manifest.json`)
- **iOS App** (`ios/App/App/Assets.xcassets/AppIcon.appiconset/`)
- **index.html** für Favicon und Apple Touch Icon

## ✏️ Anpassung

Um das Design zu ändern, bearbeite `generate-icon.js`:
- Farben im `linearGradient` ändern
- SVG-Paths für andere Symbole anpassen
- Sterne oder Herz repositionieren

Made with ❤️ for SitterSafe
