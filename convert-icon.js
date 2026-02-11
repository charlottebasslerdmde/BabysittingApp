/**
 * Icon Converter - Konvertiert SVG zu PNG in verschiedenen Größen
 * Benötigt: npm install --save-dev sharp
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [128, 144, 152, 192, 256, 512, 1024];
const iconsDir = path.join(__dirname, 'public', 'icons');
const svgPath = path.join(iconsDir, 'app-icon.svg');

async function generateIcons() {
  try {
    // Prüfe ob SVG existiert
    if (!fs.existsSync(svgPath)) {
      console.error('❌ SVG nicht gefunden. Führe zuerst: node generate-icon.js aus');
      return;
    }

    const svgBuffer = fs.readFileSync(svgPath);

    console.log('🎨 Generiere App-Icons...\n');

    // Generiere alle Größen
    for (const size of sizes) {
      const outputPath = path.join(iconsDir, `${size}x${size}.png`);
      
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ ${size}x${size}.png erstellt`);
    }

    // Apple Touch Icon (180x180)
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join(iconsDir, 'apple-touch-icon.png'));
    console.log('✅ apple-touch-icon.png erstellt');

    // Favicon (32x32)
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(iconsDir, 'favicon.png'));
    console.log('✅ favicon.png erstellt');

    console.log('\n🎉 Alle Icons erfolgreich generiert!');
    console.log('\n📱 iOS Icons:');
    console.log('Kopiere die generierten PNGs nach:');
    console.log('ios/App/App/Assets.xcassets/AppIcon.appiconset/');
    
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('\n❌ Sharp nicht installiert.');
      console.log('Installiere es mit: npm install --save-dev sharp\n');
    } else {
      console.error('❌ Fehler:', error.message);
    }
  }
}

generateIcons();
