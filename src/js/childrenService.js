// Datei: src/js/childrenService.js
// Service für die Verwaltung von Kindern in Supabase
import { supabase } from './supabase';

/**
 * Holt alle Kinder eines Benutzers aus Supabase
 * @param {string} userId - Die UUID des Benutzers (auth.uid())
 * @returns {Promise<Array>} - Array von Kinder-Objekten im App-Format
 */
export async function loadChildrenFromSupabase(userId) {
  try {
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fehler beim Laden der Kinder:', error);
      return { success: false, error: error.message, data: [] };
    }

    // Konvertiere Supabase-Format zu App-Format
    const kinder = data.map(child => ({
      id: child.id,
      basis: {
        name: child.name || '',
        nachname: child.nachname || '',
        rufname: child.rufname || '',
        geburtsdatum: child.geburtsdatum || '',
        foto: child.foto_url || '', // URL wird später durch base64 ersetzt
      },
      sicherheit: child.sicherheit || {
        notfallKontakte: '',
        allergien: '',
        medikamente: [],
        hausarzt: '',
        krankenkasse: ''
      },
      routine: child.routine || {
        essensplan: '',
        schlafenszeitRitual: '',
        hygiene: ''
      },
      regeln: child.regeln || {
        medienzeit: '',
        suessigkeiten: '',
        tabuZonen: ''
      },
      psychologie: child.psychologie || {
        aengste: '',
        beruhigungsStrategie: '',
        belohnungssystem: ''
      },
      logs: child.logs || []
    }));

    return { success: true, data: kinder };
  } catch (error) {
    console.error('Fehler beim Laden der Kinder:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Speichert oder aktualisiert ein Kind in Supabase
 * @param {object} kind - Das Kind-Objekt im App-Format
 * @param {string} userId - Die ID des Benutzers
 * @returns {Promise<object>} - Erfolgs-Status
 */
export async function saveChildToSupabase(kind, userId) {
  try {
    // Foto separat behandeln (Upload zu Storage)
    let fotoUrl = kind.basis.foto;
    if (kind.basis.foto && kind.basis.foto.startsWith('data:')) {
      // Foto ist noch base64 -> Upload zu Storage
      const uploadResult = await uploadChildPhoto(kind.id, kind.basis.foto, userId);
      if (uploadResult.success) {
        fotoUrl = uploadResult.url;
      } else {
        console.warn('Foto-Upload fehlgeschlagen, speichere ohne Foto:', uploadResult.error);
        fotoUrl = '';
      }
    }

    // Daten für Supabase vorbereiten
    const childData = {
      id: kind.id,
      user_id: userId,
      name: kind.basis.name,
      nachname: kind.basis.nachname || '',
      rufname: kind.basis.rufname || '',
      geburtsdatum: kind.basis.geburtsdatum || null,
      foto_url: fotoUrl,
      sicherheit: kind.sicherheit || {},
      routine: kind.routine || {},
      regeln: kind.regeln || {},
      psychologie: kind.psychologie || {},
      logs: kind.logs || []
    };

    // Prüfen ob Kind schon existiert (Update vs Insert)
    const { data: existing } = await supabase
      .from('children')
      .select('id')
      .eq('id', kind.id)
      .single();

    let result;
    if (existing) {
      // Update
      result = await supabase
        .from('children')
        .update(childData)
        .eq('id', kind.id);
    } else {
      // Insert
      result = await supabase
        .from('children')
        .insert([childData]);
    }

    if (result.error) {
      console.error('Fehler beim Speichern des Kindes:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Fehler beim Speichern des Kindes:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Löscht ein Kind aus Supabase
 * @param {string} childId - Die ID des Kindes
 * @param {string} userId - Die ID des Benutzers
 * @returns {Promise<object>} - Erfolgs-Status
 */
export async function deleteChildFromSupabase(childId, userId) {
  try {
    // Erst das Foto löschen (falls vorhanden)
    await deleteChildPhoto(childId, userId);

    // Dann den Datenbankeintrag
    const { error } = await supabase
      .from('children')
      .delete()
      .eq('id', childId)
      .eq('user_id', userId);

    if (error) {
      console.error('Fehler beim Löschen des Kindes:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Fehler beim Löschen des Kindes:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Lädt ein Kinder-Foto zu Supabase Storage hoch
 * @param {string} childId - Die ID des Kindes
 * @param {string} base64Photo - Das Foto als base64-String
 * @param {string} userId - Die ID des Benutzers
 * @returns {Promise<object>} - Erfolgs-Status mit URL
 */
export async function uploadChildPhoto(childId, base64Photo, userId) {
  try {
    // Base64 zu Blob konvertieren
    const base64Data = base64Photo.split(',')[1];
    const mimeType = base64Photo.match(/data:([^;]+);/)?.[1] || 'image/jpeg';
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

    // Dateipfad: userId/childId.jpg
    const fileExt = mimeType.split('/')[1];
    const filePath = `${userId}/${childId}.${fileExt}`;

    // Upload zu Storage
    const { data, error } = await supabase.storage
      .from('child-photos')
      .upload(filePath, blob, {
        contentType: mimeType,
        upsert: true // Überschreibe falls schon vorhanden
      });

    if (error) {
      console.error('Fehler beim Upload des Fotos:', error);
      return { success: false, error: error.message };
    }

    // Public URL generieren
    const { data: urlData } = supabase.storage
      .from('child-photos')
      .getPublicUrl(filePath);

    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    console.error('Fehler beim Upload des Fotos:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Lädt ein Foto von einer URL und konvertiert es zu base64
 * @param {string} url - Die URL des Fotos
 * @returns {Promise<string>} - Das Foto als base64-String
 */
export async function downloadPhotoAsBase64(url) {
  try {
    if (!url || url === '') return '';

    const response = await fetch(url);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Fehler beim Download des Fotos:', error);
    return '';
  }
}

/**
 * Löscht ein Kinder-Foto aus Supabase Storage
 * @param {string} childId - Die ID des Kindes
 * @param {string} userId - Die ID des Benutzers
 * @returns {Promise<object>} - Erfolgs-Status
 */
export async function deleteChildPhoto(childId, userId) {
  try {
    // Alle möglichen Dateiendungen durchgehen
    const extensions = ['jpg', 'jpeg', 'png', 'webp'];
    
    for (const ext of extensions) {
      const filePath = `${userId}/${childId}.${ext}`;
      await supabase.storage
        .from('child-photos')
        .remove([filePath]);
      // Ignoriere Fehler, falls Datei nicht existiert
    }

    return { success: true };
  } catch (error) {
    console.error('Fehler beim Löschen des Fotos:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Synchronisiert lokale Kinder mit Supabase
 * Lädt Kinder aus Supabase und merged mit lokalen Daten
 * @param {string} userId - Die ID des Benutzers
 * @returns {Promise<object>} - Erfolgs-Status mit gemergten Daten
 */
export async function syncChildrenWithSupabase(userId) {
  try {
    // 1. Lade Kinder von Supabase
    const remoteResult = await loadChildrenFromSupabase(userId);
    if (!remoteResult.success) {
      return { success: false, error: remoteResult.error, data: [] };
    }

    // 2. Lade lokale Kinder
    const localKinder = JSON.parse(localStorage.getItem('sitterSafe_kinder') || '[]');

    // 3. Merge-Strategie: Supabase ist führend, aber lokale Änderungen behalten
    const mergedKinder = [...remoteResult.data];
    const remoteIds = new Set(remoteResult.data.map(k => k.id));

    // Lokale Kinder, die nicht in Supabase sind, hinzufügen
    for (const localKind of localKinder) {
      if (!remoteIds.has(localKind.id)) {
        // Neues lokales Kind -> zu Supabase hochladen
        await saveChildToSupabase(localKind, userId);
        mergedKinder.push(localKind);
      }
    }

    // 4. Fotos herunterladen und als base64 speichern (für Offline-Nutzung)
    for (const kind of mergedKinder) {
      if (kind.basis.foto && !kind.basis.foto.startsWith('data:')) {
        const base64 = await downloadPhotoAsBase64(kind.basis.foto);
        kind.basis.foto = base64;
      }
    }

    // 5. In localStorage speichern
    localStorage.setItem('sitterSafe_kinder', JSON.stringify(mergedKinder));

    return { success: true, data: mergedKinder };
  } catch (error) {
    console.error('Fehler beim Sync der Kinder:', error);
    return { success: false, error: error.message, data: [] };
  }
}
