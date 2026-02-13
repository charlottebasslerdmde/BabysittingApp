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
    // Die Tabelle speichert das komplette Kind-Objekt im 'data' Feld (JSONB)
    const kinder = data.map(child => {
      // child.data enthält das komplette Kind-Objekt
      const kindData = child.data;
      
      // Falls Foto in avatar_url vorhanden ist, überschreibe es im data-Objekt
      if (child.avatar_url && kindData.basis) {
        kindData.basis.foto = child.avatar_url;
      }
      
      return kindData;
    });

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
    // WICHTIG: Foto direkt als base64 in DB speichern (wie bei User-Profilbildern)
    // Kein Upload zu Storage mehr!
    const fotoBase64 = kind.basis.foto || '';

    // Daten für Supabase vorbereiten
    // Die Tabelle hat: id, user_id, data (JSONB), avatar_url
    const childData = {
      id: kind.id,
      user_id: userId,
      data: kind, // KOMPLETTES Kind-Objekt als JSONB speichern
      avatar_url: fotoBase64 // Foto separat für schnellen Zugriff
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
    // Zuerst alle Events dieses Kindes löschen
    const eventsResult = await deleteChildEventsFromSupabase(childId, userId);
    if (!eventsResult.success) {
      console.warn('Warnung: Events konnten nicht gelöscht werden:', eventsResult.error);
    }

    // Datenbankeintrag löschen (Foto ist in avatar_url als base64, wird automatisch gelöscht)
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
 * Löscht alle Events eines Kindes aus Supabase
 * @param {string} childId - Die ID des Kindes
 * @param {string} userId - Die ID des Benutzers
 * @returns {Promise<object>} - Erfolgs-Status
 */
export async function deleteChildEventsFromSupabase(childId, userId) {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('child_id', childId)
      .eq('user_id', userId);

    if (error) {
      console.error('Fehler beim Löschen der Kind-Events:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Fehler beim Löschen der Kind-Events:', error);
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

    // 3. Merge-Strategie: Supabase ist führend, aber lokale Fotos bleiben erhalten!
    const mergedKinder = [];
    const remoteIds = new Set(remoteResult.data.map(k => k.id));

    // Für jedes Remote-Kind: Prüfe ob es lokal ein Foto gibt
    for (const remoteKind of remoteResult.data) {
      const localKind = localKinder.find(lk => lk.id === remoteKind.id);
      
      // Wenn lokales Kind ein Foto hat, aber Remote nicht → Lokales Foto behalten
      if (localKind && localKind.basis?.foto && !remoteKind.basis?.foto) {
        mergedKinder.push({
          ...remoteKind,
          basis: {
            ...remoteKind.basis,
            foto: localKind.basis.foto
          }
        });
      } else {
        mergedKinder.push(remoteKind);
      }
    }

    // Lokale Kinder, die nicht in Supabase sind, hinzufügen
    // ABER: Prüfe erst, ob das Kind kürzlich gelöscht wurde (Race Condition vermeiden)
    const deletedKids = JSON.parse(localStorage.getItem('sitterSafe_deleted_kids') || '[]');
    const recentlyDeletedIds = new Set(
      deletedKids
        .filter(d => Date.now() - d.deletedAt < 60000) // Innerhalb der letzten 60 Sekunden gelöscht
        .map(d => d.id)
    );
    
    for (const localKind of localKinder) {
      if (!remoteIds.has(localKind.id)) {
        // Prüfe ob es kürzlich gelöscht wurde
        if (recentlyDeletedIds.has(localKind.id)) {
          continue;
        }
        
        // Neues lokales Kind -> zu Supabase hochladen
        await saveChildToSupabase(localKind, userId);
        mergedKinder.push(localKind);
      }
    }
    
    // Cleanup: Entferne alte gelöschte IDs (älter als 5 Minuten)
    const cleanedDeletedKids = deletedKids.filter(d => Date.now() - d.deletedAt < 300000);
    if (cleanedDeletedKids.length !== deletedKids.length) {
      localStorage.setItem('sitterSafe_deleted_kids', JSON.stringify(cleanedDeletedKids));
    }

    // 4. Fotos sind bereits base64, kein Download nötig!
    // (Die avatar_url Spalte enthält direkt den base64-String)

    // 5. In localStorage speichern
    localStorage.setItem('sitterSafe_kinder', JSON.stringify(mergedKinder));

    return { success: true, data: mergedKinder };
  } catch (error) {
    console.error('Fehler beim Sync der Kinder:', error);
    return { success: false, error: error.message, data: [] };
  }
}
