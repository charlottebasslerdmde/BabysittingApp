/**
 * Bild-Utility Funktionen für SitterSafe
 * Komprimierung von Bildern, um LocalStorage Limits zu vermeiden
 */

/**
 * Komprimiert ein Bild auf eine maximale Größe
 * @param {File} file - Die zu komprimierende Bilddatei
 * @param {number} maxWidth - Maximale Breite (default: 300px)
 * @param {number} maxHeight - Maximale Höhe (default: 300px)
 * @param {number} quality - JPEG Qualität 0-1 (default: 0.5)
 * @returns {Promise<string>} Base64 String des komprimierten Bildes
 */
export const compressImage = (file, maxWidth = 300, maxHeight = 300, quality = 0.5) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Skalierung berechnen
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Als JPEG mit Qualitätsstufe exportieren
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        
        resolve(compressedBase64);
      };
      
      img.onerror = (error) => {
        reject(error);
      };
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
  });
};

/**
 * Prüft ob ein Bild zu groß für LocalStorage ist
 * @param {string} base64String - Base64 kodiertes Bild
 * @returns {boolean} true wenn zu groß
 */
export const isImageTooLarge = (base64String) => {
  // Schätze die Größe in Bytes (base64 ist ~1.37x größer als das Original)
  const sizeInBytes = base64String.length * 0.75; // Ungefähre Größe
  const sizeInKB = sizeInBytes / 1024;
  const sizeInMB = sizeInKB / 1024;
  
  // Warnung wenn größer als 300 KB
  return sizeInMB > 0.3;
};

/**
 * Komprimiert ein Base64 Bild (z.B. von Capacitor Camera API)
 * @param {string} base64String - Base64 String des Bildes
 * @param {number} maxWidth - Maximale Breite (default: 300px)
 * @param {number} maxHeight - Maximale Höhe (default: 300px) 
 * @param {number} quality - JPEG Qualität 0-1 (default: 0.5)
 * @returns {Promise<string>} Base64 String des komprimierten Bildes
 */
export const compressBase64Image = (base64String, maxWidth = 300, maxHeight = 300, quality = 0.5) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64String;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Skalierung berechnen
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Als JPEG mit Qualitätsstufe exportieren
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      
      resolve(compressedBase64);
    };
    
    img.onerror = (error) => {
      reject(error);
    };
  });
};

/**
 * Sicheres Speichern in LocalStorage mit Error Handling
 * @param {string} key - LocalStorage Key
 * @param {any} value - Zu speichernder Wert (wird JSON.stringify)
 * @returns {object} {success: boolean, error?: string}
 */
export const safeLocalStorageSet = (key, value) => {
  try {
    const stringValue = JSON.stringify(value);
    localStorage.setItem(key, stringValue);
    return { success: true };
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      return { 
        success: false, 
        error: 'storage_quota_exceeded',
        message: 'Speicher voll. Bitte lösche alte Fotos oder reduziere die Bildgröße.'
      };
    }
    return { 
      success: false, 
      error: 'storage_error',
      message: error.message 
    };
  }
};
