import React, { useState, useEffect } from 'react';
import { Share } from '@capacitor/share';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { supabase } from '../js/supabase';
import {
  Page,
  Navbar,
  NavLeft,
  NavTitle,
  NavRight,
  Link,
  Toolbar,
  Tabs,
  Tab,
  Block,
  BlockTitle,
  List,
  ListInput,
  ListItem,
  Button,
  Icon,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Sheet,
  PageContent,
  SwipeoutActions,
  SwipeoutButton,
  f7 
} from 'framework7-react';
import { useTranslation } from '../js/i18n';
import { safeLocalStorageSet } from '../js/imageUtils';

const HomePage = () => {
  // i18n Hook
  const { t } = useTranslation();
  // --- STATE DEFINITIONEN ---
  
  // 0. Current User
  const [currentUser, setCurrentUser] = useState(null);
  
  // 1. Tracker & Protokoll
  const [eventLog, setEventLog] = useState([]);
  const [showFact, setShowFact] = useState(true);
  const [dailyFact, setDailyFact] = useState("");

  // 2. Kinder Daten (Dynamisch aus DB)
  const [kinder, setKinder] = useState([]);

  // 3. Übergabe-Protokoll (Haus & Schicht)
  const [sheetOpened, setSheetOpened] = useState(false);
  const [householdData, setHouseholdData] = useState({
    address: '',
    wifiName: '',
    wifiPass: '',
    parent1Name: '',
    parent1Phone: '',
    parent2Name: '',
    parent2Phone: '',
  });
  const [shiftData, setShiftData] = useState({
    returnTime: '',
    parentsLocation: '',
    notes: ''
  });

  // 4. Aktivitäts-Detail-Sheet
  const [activitySheet, setActivitySheet] = useState({
    opened: false,
    type: '',
    icon: '',
    title: '',
    details: {},
    selectedKind: null,
    mood: '',
    editingEventId: null // Für Bearbeitungsmodus
  });

  // 5. Undo-Funktion
  const [lastDeleted, setLastDeleted] = useState(null);
  
  // 6. PWA Install Prompt
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // 7. Foto-Moment-Tagebuch
  const [image, setImage] = useState(null);
  const [photos, setPhotos] = useState([]);

  // --- EFFEKTE (Laden beim Start) ---

  useEffect(() => {
    // A) Current User laden
    loadCurrentUser();
    
    // B) Fact of the Day laden
    loadDailyFact();

    // C) Hausdaten laden (LocalStorage)
    const savedHouseData = localStorage.getItem('sitterSafe_household');
    if (savedHouseData) setHouseholdData(JSON.parse(savedHouseData));

    // D) Kinder laden (Supabase + LocalStorage)
    loadKinderData();

    // E) EventLog laden (Supabase + LocalStorage)
    loadEventLog();

    // E) ShiftData laden (aktuelle Schicht)
    const savedShiftData = localStorage.getItem('sitterSafe_shiftData');
    if (savedShiftData) {
      try {
        setShiftData(JSON.parse(savedShiftData));
      } catch (e) {
        console.error("Fehler beim Laden der ShiftData", e);
      }
    }

    // F) Fotos laden
    loadPhotos();
    
    // D) PWA Install Prompt registrieren
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Zeige Banner nur, wenn nicht bereits installiert und nicht dismissed
      const dismissed = localStorage.getItem('sitterSafe_installDismissed');
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
      
      if (!dismissed && !isStandalone) {
        setShowInstallBanner(true);
      }
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Check if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (!isStandalone) {
      const dismissed = localStorage.getItem('sitterSafe_installDismissed');
      if (!dismissed) {
        // Zeige Banner nach 2 Sekunden
        setTimeout(() => setShowInstallBanner(true), 2000);
      }
    }
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Kinder-Daten beim Fokus auf die Seite aktualisieren
  useEffect(() => {
    const handlePageBeforeIn = () => {
      // Kinder-Daten neu laden wenn Seite wieder in den Vordergrund kommt
      loadKinderData();
      loadEventLog();
      loadPhotos();
    };

    // Framework7 Page Event Listener
    const page = document.querySelector('.page[data-name="home"]');
    if (page) {
      page.addEventListener('page:beforein', handlePageBeforeIn);
      
      return () => {
        page.removeEventListener('page:beforein', handlePageBeforeIn);
      };
    }
  }, []);

  // Window Focus Event - lädt Daten neu wenn Browser-Tab wieder aktiv wird
  useEffect(() => {
    const handleFocus = () => {
      loadKinderData();
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Custom Event Listener für Kinder-Updates (von kinder.jsx)
  useEffect(() => {
    const handleKinderUpdate = (event) => {
      console.log('Kinder Update Event:', event.detail);
      loadKinderData(); // Kinder-Daten neu laden
    };

    window.addEventListener('kinderUpdated', handleKinderUpdate);
    
    return () => {
      window.removeEventListener('kinderUpdated', handleKinderUpdate);
    };
  }, []);

  // EventLog in LocalStorage speichern (Persistierung) mit Error Handling
  useEffect(() => {
    const result = safeLocalStorageSet('sitterSafe_eventLog', eventLog);
    if (!result.success) {
      console.error('Fehler beim Speichern des EventLogs:', result.error);
    }
  }, [eventLog]);

  // ShiftData in LocalStorage speichern (aktuelle Schicht) mit Error Handling
  useEffect(() => {
    const result = safeLocalStorageSet('sitterSafe_shiftData', shiftData);
    if (!result.success) {
      console.error('Fehler beim Speichern der ShiftData:', result.error);
    }
  }, [shiftData]);

  // --- HILFSFUNKTIONEN ---

  const loadCurrentUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user);
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadDailyFact = () => {
    const babyFacts = [
      "Babys erkennen die Stimme ihrer Mutter bereits vor der Geburt.",
      "Neugeborene haben etwa 300 Knochen, Erwachsene nur 206.",
      "Bis zum 7. Monat können Babys gleichzeitig atmen und schlucken.",
      "Ein Neugeborenes hat nur etwa eine Tasse Blut im Körper.",
      "Babys verdoppeln ihr Geburtsgewicht in den ersten 5 Monaten."
    ];
    const today = new Date().toDateString();
    const stored = localStorage.getItem('babyFactOfTheDay');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) {
        setDailyFact(parsed.fact);
        return;
      }
    }
    const randomFact = babyFacts[Math.floor(Math.random() * babyFacts.length)];
    localStorage.setItem('babyFactOfTheDay', JSON.stringify({ date: today, fact: randomFact }));
    setDailyFact(randomFact);
  };

  const loadKinderData = async () => {
    // Offline-First: Zuerst LocalStorage laden
    const local = localStorage.getItem('sitterSafe_kinder');
    if (local) {
      setKinder(JSON.parse(local));
    }

    // Dann Supabase synchronisieren (wenn User eingeloggt)
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return; // Kein User eingeloggt
      
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading children from Supabase:', error);
        // Fehler ignorieren und lokale Daten verwenden
        // Unterstützte Fehlercodes:
        // - PGRST116: Tabelle nicht gefunden
        // - 42P01: Undefined table
        // - NotFoundError: Objekt nicht gefunden
        // Alle Fehler werden stillschweigend ignoriert, damit die App nicht abstürzt
        return;
      }

      if (data && data.length > 0) {
        // Konvertiere Supabase-Format zu lokalem Format
        const children = data.map(child => child.data);
        setKinder(children);
        // Cache in localStorage
        localStorage.setItem('sitterSafe_kinder', JSON.stringify(children));
      } else if (!local) {
        setKinder([]); // Leeres Array wenn weder Supabase noch localStorage Daten haben
      }
    } catch (error) {
      console.error('Error syncing children:', error);
      // Bei Fehler: Fallback auf localStorage (bereits geladen)
      // Fehler wird ignoriert, damit die App nicht abstürzt
    }
  };

  const loadPhotos = async () => {
    // Offline-First: Zuerst LocalStorage laden
    const savedPhotos = localStorage.getItem('sitterSafe_photos');
    if (savedPhotos) {
      try {
        setPhotos(JSON.parse(savedPhotos));
      } catch (e) {
        console.error("Fehler beim Laden der Fotos", e);
      }
    }
  };

  const loadEventLog = async () => {
    // Offline-First: Zuerst LocalStorage laden
    const savedEventLog = localStorage.getItem('sitterSafe_eventLog');
    if (savedEventLog) {
      try {
        setEventLog(JSON.parse(savedEventLog));
      } catch (e) {
        console.error("Fehler beim Laden des EventLogs", e);
      }
    }

    // Dann Supabase synchronisieren (wenn User eingeloggt)
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return; // Kein User eingeloggt
      
      // Nur Events von heute laden
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('event_time', `${today}T00:00:00`)
        .order('event_time', { ascending: false });

      if (error) {
        console.error('Error loading events from Supabase:', error);
        // Fehler ignorieren und lokale Daten verwenden
        // Alle Fehler werden stillschweigend ignoriert, damit die App nicht abstürzt
        return;
      }

      if (data && data.length > 0) {
        // Konvertiere Supabase-Format zu lokalem Format
        const events = data.map(event => ({
          id: event.id,
          time: new Date(event.event_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          activity: event.details?.activityText || event.event_type,
          icon: event.icon || 'circle',
          color: event.color || 'blue',
          details: event.details || {},
          kindId: event.child_id,
          mood: event.mood
        }));
        setEventLog(events);
        // Cache in localStorage
        localStorage.setItem('sitterSafe_eventLog', JSON.stringify(events));
      }
    } catch (error) {
      console.error('Error syncing events:', error);
      // Bei Fehler: Fallback auf localStorage (bereits geladen)
    }
  };

  const updateHouseholdData = (field, value) => {
    const newData = { ...householdData, [field]: value };
    setHouseholdData(newData);
    localStorage.setItem('sitterSafe_household', JSON.stringify(newData));
  };

  const handleTrackEvent = (activity, icon, color) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newEvent = { id: Date.now(), time: timeString, activity, icon, color };
    setEventLog([newEvent, ...eventLog]);
    f7.toast.show({ text: `${activity} ${t('tracker_saved')}`, closeTimeout: 1000, position: 'center', cssClass: 'toast-success' });
  };

  const openActivityDetail = (type) => {
    const configs = {
      essen: { title: t('activity_food_title'), icon: '🍼', details: { was: '', menge: '', notizen: '' } },
      schlaf: { title: t('activity_sleep_title'), icon: '😴', details: { von: '', bis: '', qualitaet: '' } },
      windel: { title: t('activity_diaper_title'), icon: '💩', details: { art: 'nass', notizen: '' } },
      spiel: { title: t('activity_play_title'), icon: '🧸', details: { aktivitaet: '', dauer: '', notizen: '' } }
    };
    setActivitySheet({ 
      opened: true, 
      type, 
      ...configs[type],
      selectedKind: kinder.length === 1 ? kinder[0].id : null,
      mood: '😊',
      editingEventId: null
    });
  };

  const editEvent = (eventId) => {
    const event = eventLog.find(e => e.id === eventId);
    if (!event) return;

    // Typ aus den Details oder Icon ableiten
    const typeMap = {
      'mouth_fill': 'essen',
      'moon_zzz_fill': 'schlaf',
      'drop_fill': 'windel',
      'gamecontroller_fill': 'spiel'
    };
    const type = typeMap[event.icon] || 'essen';

    const configs = {
      essen: { title: t('activity_food_title'), icon: '🍼' },
      schlaf: { title: t('activity_sleep_title'), icon: '😴' },
      windel: { title: t('activity_diaper_title'), icon: '💩' },
      spiel: { title: t('activity_play_title'), icon: '🧸' }
    };

    setActivitySheet({
      opened: true,
      type,
      ...configs[type],
      details: event.details || {},
      selectedKind: event.kindId || null,
      mood: event.mood || '😊',
      editingEventId: eventId
    });
  };

  const saveActivityDetail = async () => {
    const { type, title, icon, details, selectedKind, mood, editingEventId } = activitySheet;
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Kind-Name hinzufügen wenn ausgewählt
    let kindName = '';
    if (selectedKind) {
      const kind = kinder.find(k => k.id === selectedKind);
      kindName = kind ? kind.basis.rufname || kind.basis.name : '';
    }
    
    let activityText = kindName ? `${kindName}: ${title}` : title;
    if (type === 'essen' && details.was) activityText += ` - ${details.was}`;
    if (type === 'schlaf' && details.von) activityText += ` - ${details.von} bis ${details.bis || '?'}`;
    if (type === 'windel') activityText += ` - ${details.art}`;
    if (type === 'spiel' && details.aktivitaet) activityText += ` - ${details.aktivitaet}`;
    
    const colorMap = { essen: 'blue', schlaf: 'orange', windel: 'green', spiel: 'purple' };
    const iconMap = { essen: 'mouth_fill', schlaf: 'moon_zzz_fill', windel: 'drop_fill', spiel: 'gamecontroller_fill' };
    
    if (editingEventId) {
      // Bearbeitungsmodus: Bestehenden Eintrag aktualisieren
      const updatedEvent = {
        id: editingEventId,
        time: eventLog.find(e => e.id === editingEventId)?.time || timeString, // Zeit beibehalten
        activity: activityText,
        icon: iconMap[type],
        color: colorMap[type],
        details: { ...details, activityText },
        kindId: selectedKind,
        mood
      };
      
      const updatedLog = eventLog.map(e => e.id === editingEventId ? updatedEvent : e);
      setEventLog(updatedLog);
      setActivitySheet({ ...activitySheet, opened: false });
      f7.toast.show({ text: `${title} aktualisiert ${mood}`, closeTimeout: 1500, position: 'center' });
    } else {
      // Neu-Erstellungsmodus
      const newEvent = { 
        id: Date.now(), 
        time: timeString, 
        activity: activityText, 
        icon: iconMap[type], 
        color: colorMap[type],
        details: { ...details, activityText },
        kindId: selectedKind,
        mood
      };
    
      // Optimistic Update: Sofort in UI anzeigen
      setEventLog([newEvent, ...eventLog]);
      setActivitySheet({ ...activitySheet, opened: false });
      f7.toast.show({ text: `${title} ${t('tracker_saved')} ${mood}`, closeTimeout: 1500, position: 'center' });
    }
    
    // In Supabase speichern (Background)
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { error } = await supabase
          .from('events')
          .insert([{
            user_id: session.user.id,
            child_id: selectedKind,
            event_type: type,
            event_time: now.toISOString(),
            mood: mood,
            details: { ...details, activityText },
            icon: iconMap[type],
            color: colorMap[type]
          }]);

        if (error) {
          console.error('Error saving event to Supabase:', error);
          // Wenn Tabelle nicht existiert, zeige Hinweis
          if (error.code === 'PGRST116' || error.code === '42P01') {
            console.warn('⚠️ Supabase-Tabellen nicht gefunden. Führe supabase-migration.sql aus!');
          }
          // Event bleibt trotzdem in localStorage als Fallback
        }
      }
    } catch (error) {
      console.error('Error syncing event:', error);
      // Event bleibt trotzdem in localStorage
    }
  };

  const updateActivityDetail = (field, value) => {
    setActivitySheet({
      ...activitySheet,
      details: { ...activitySheet.details, [field]: value }
    });
  };

  const deleteEvent = (eventId) => {
    const event = eventLog.find(e => e.id === eventId);
    setLastDeleted(event);
    setEventLog(eventLog.filter(e => e.id !== eventId));
    f7.toast.show({ 
      text: t('tracker_deleted'), 
      closeTimeout: 3000, 
      position: 'center',
      closeButton: true,
      closeButtonText: t('tracker_undo'),
      closeButtonColor: 'blue',
      on: {
        close: (toast, closeByButton) => {
          if (closeByButton && lastDeleted) {
            setEventLog([lastDeleted, ...eventLog.filter(e => e.id !== eventId)]);
            setLastDeleted(null);
          }
        }
      }
    });
  };

  const getStatistics = () => {
    const stats = { essen: 0, schlaf: 0, windel: 0, spiel: 0 };
    eventLog.forEach(event => {
      if (event.color === 'blue') stats.essen++;
      if (event.color === 'orange') stats.schlaf++;
      if (event.color === 'green') stats.windel++;
      if (event.color === 'purple') stats.spiel++;
    });
    return stats;
  };

  const shareProtocol = async () => {
    if (eventLog.length === 0) {
      f7.toast.show({ text: t('tracker_nothing_to_share'), closeTimeout: 2000 });
      return;
    }
    const reportText = eventLog.map(e => `⏰ ${e.time}: ${e.activity}`).join('\n');
    const footer = `\n\n${t('tracker_share_footer')}`;
    
    try {
      // Capacitor Share API (für native Apps)
      if (typeof Share !== 'undefined' && Share.share) {
        await Share.share({
          title: `SitterSafe ${t('tracker_protocol_today')}`,
          text: `${reportText}${footer}`,
          dialogTitle: 'Teilen via',
        });
      }
      // Web Share API (Browser Fallback)
      else if (navigator.share) {
        await navigator.share({
          title: `SitterSafe ${t('tracker_protocol_today')}`,
          text: `${reportText}${footer}`,
        });
      }
      // Fallback: Text kopieren
      else {
        await navigator.clipboard.writeText(`${reportText}${footer}`);
        f7.toast.show({ text: t('tracker_protocol_copied'), closeTimeout: 2000 });
      }
    } catch (e) { 
      if (e.name !== 'AbortError') {
        console.log('Share-Fehler:', e);
        f7.toast.show({ text: t('tracker_share_failed'), closeTimeout: 2000 });
      }
    }
  };

  // Foto-Upload mit Capacitor Camera
  const uploadImage = async () => {
    try {
      // Zeige Action Sheet: Kamera oder Galerie wählen
      const buttons = [
        {
          text: 'Kamera',
          onClick: () => takePicture(CameraSource.Camera)
        },
        {
          text: 'Galerie',
          onClick: () => takePicture(CameraSource.Photos)
        },
        {
          text: 'Abbrechen',
          color: 'red'
        }
      ];
      
      f7.actions.create({
        buttons: [buttons]
      }).open();
    } catch (error) {
      console.error('Fehler beim Öffnen der Kamera:', error);
      f7.toast.show({ 
        text: 'Fehler beim Öffnen der Kamera', 
        closeTimeout: 2000, 
        position: 'center' 
      });
    }
  };

  const takePicture = async (source) => {
    try {
      f7.preloader.show();
      
      const image = await Camera.getPhoto({
        quality: 70,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: source,
        width: 800,
        height: 800
      });
      
      // Flexiblere Validierung - prüfe verschiedene mögliche Formate
      const imageData = image.dataUrl || image.base64String || image.webPath;
      
      if (!imageData) {
        console.error('Kein Bilddaten erhalten:', image);
        throw new Error('Kein Bild erhalten');
      }
      
      // Stelle sicher, dass es ein data URL ist
      const finalImageData = imageData.startsWith('data:') ? imageData : `data:image/jpeg;base64,${imageData}`;
      
      // Lokale Vorschau setzen
      setImage(finalImageData);

      // Dateiname generieren
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      
      // Upload zu Supabase Storage
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Auch ohne Login lokal speichern
        const newPhoto = {
          id: Date.now(),
          url: finalImageData,
          localUrl: finalImageData,
          timestamp: new Date().toISOString(),
          fileName: fileName
        };

        const updatedPhotos = [newPhoto, ...photos];
        setPhotos(updatedPhotos);
        localStorage.setItem('sitterSafe_photos', JSON.stringify(updatedPhotos));
        
        f7.preloader.hide();
        f7.toast.show({ 
          text: '✓ Foto lokal gespeichert', 
          icon: '<i class="f7-icons">checkmark_alt</i>',
          position: 'center', 
          closeTimeout: 2000,
          cssClass: 'toast-success'
        });
        return;
      }

      // Base64 zu Blob konvertieren für Upload
      const base64Response = await fetch(finalImageData);
      const blob = await base64Response.blob();

      const { data, error } = await supabase.storage
        .from('photos')
        .upload(`${session.user.id}/${fileName}`, blob, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload Fehler:', error);
        // Trotzdem lokal speichern
        const newPhoto = {
          id: Date.now(),
          url: finalImageData,
          localUrl: finalImageData,
          timestamp: new Date().toISOString(),
          fileName: fileName
        };

        const updatedPhotos = [newPhoto, ...photos];
        setPhotos(updatedPhotos);
        localStorage.setItem('sitterSafe_photos', JSON.stringify(updatedPhotos));
        
        f7.preloader.hide();
        f7.toast.show({ 
          text: '✓ Foto lokal gespeichert (Cloud-Upload fehlgeschlagen)', 
          position: 'center', 
          closeTimeout: 2500
        });
        return;
      }

      // Öffentliche URL abrufen
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(data.path);

      // Foto zur Liste hinzufügen
      const newPhoto = {
        id: Date.now(),
        url: publicUrl,
        localUrl: finalImageData,
        timestamp: new Date().toISOString(),
        fileName: fileName
      };

      const updatedPhotos = [newPhoto, ...photos];
      setPhotos(updatedPhotos);
      localStorage.setItem('sitterSafe_photos', JSON.stringify(updatedPhotos));

      f7.preloader.hide();
      f7.toast.show({ 
        text: '✓ Foto gespeichert und hochgeladen', 
        icon: '<i class="f7-icons">checkmark_alt</i>',
        position: 'center', 
        closeTimeout: 2000,
        cssClass: 'toast-success'
      });
    } catch (error) {
      f7.preloader.hide();
      
      // Ignoriere Abbruch durch Benutzer
      if (error.message === 'User cancelled photos app') {
        return;
      }
      
      console.error('Fehler beim Aufnehmen:', error);
      
      // Detaillierte Fehlermeldung
      let errorMsg = 'Fehler beim Laden des Fotos';
      
      if (error.message?.includes('permission')) {
        errorMsg = 'Zugriff auf Galerie wurde verweigert. Bitte Berechtigungen prüfen.';
      } else if (error.message?.includes('No camera')) {
        errorMsg = 'Keine Kamera verfügbar';
      } else if (error.message?.includes('Kein Bild')) {
        errorMsg = 'Kein Bild ausgewählt oder Fehler beim Laden';
      }
      
      f7.toast.show({ 
        text: errorMsg, 
        position: 'center', 
        closeTimeout: 2500 
      });
    }
  };

  const deletePhoto = (photoId) => {
    f7.dialog.confirm(
      'Möchtest du dieses Foto wirklich löschen?',
      'Foto löschen',
      () => {
        const updatedPhotos = photos.filter(p => p.id !== photoId);
        setPhotos(updatedPhotos);
        localStorage.setItem('sitterSafe_photos', JSON.stringify(updatedPhotos));
        f7.toast.show({ text: 'Foto gelöscht', closeTimeout: 1500 });
      }
    );
  };

  // PWA Install Handler
  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // iOS Anleitung zeigen
      if (/(iPhone|iPad|iPod)/.test(navigator.userAgent)) {
        f7.dialog.alert(
          `<div style="text-align: center; padding: 20px;">
            <div style="font-size: 48px; margin-bottom: 15px;">📱</div>
            <p><b>SitterSafe zum Home-Screen hinzufügen:</b></p>
            <ol style="text-align: left; margin: 15px 0; line-height: 1.8;">
              <li>${t('tracker_install_ios_step1')}</li>
              <li>${t('tracker_install_ios_step2')}</li>
              <li>${t('tracker_install_ios_step3')}</li>
            </ol>
            <p>${t('tracker_install_ios_footer')}</p>
          </div>`,
          t('tracker_install_ios_title')
        );
      } else {
        f7.toast.show({ 
          text: 'Installation aktuell nicht verfügbar', 
          closeTimeout: 2000 
        });
      }
      return;
    }
    
    // Show install prompt
    deferredPrompt.prompt();
    
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      f7.toast.show({ 
        text: '🎉 Installation gestartet!', 
        closeTimeout: 2000,
        cssClass: 'toast-success'
      });
    }
    
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem('sitterSafe_installDismissed', 'true');
    f7.toast.show({ 
      text: t('tracker_install_dismissed'), 
      closeTimeout: 3000 
    });
  };

  // Helper für Avatar (Foto oder Buchstaben)
  const renderAvatar = (kind) => {
    if (kind.basis.foto) {
      return <img src={kind.basis.foto} style={{width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover'}} />;
    }
    return (
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#00e1ff', 
        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
      }}>
        {kind.basis.name.charAt(0).toUpperCase()}
      </div>
    );
  };

  // --- UI RENDER ---

  return (
    <Page name="home">
      <Navbar>
        <NavLeft>
          <Link iconIos="f7:gear_alt_fill" iconMd="material:settings" href="/settings/" />
        </NavLeft>
        <NavTitle sliding>SitterSafe</NavTitle>
        <NavRight>
          <Link iconIos="f7:exclamationmark_shield_fill" iconMd="material:security" iconColor="red" onClick={() => setSheetOpened(true)} />
        </NavRight>
      </Navbar>

      <Toolbar tabbar labels bottom>
        <Link tabLink="#tab-tracker" tabLinkActive iconIos="f7:clock_fill" iconMd="material:schedule" text={t('tracker_title')} />
        <Link tabLink="#tab-kinder" iconIos="f7:person_2_fill" iconMd="material:people" text={t('tracker_children')} />
        <Link tabLink="#tab-fotos" iconIos="f7:camera_fill" iconMd="material:camera_alt" text={t('tracker_photos')} />
      </Toolbar>

      <Tabs>
        
        {/* TAB 1: TRACKER */}
        <Tab id="tab-tracker" className="page-content" tabActive>
          
          {/* PWA Install Banner */}
          {showInstallBanner && (
            <Card style={{
              margin: '16px',
              marginTop: '8px',
              background: 'linear-gradient(135deg, #00e1ff 0%, #007aff 100%)',
              color: 'white',
              border: 'none'
            }}>
              <CardContent>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '40px' }}>📱</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
                      {t('tracker_install_app')}
                    </div>
                    <div style={{ fontSize: '13px', opacity: 0.95 }}>
                      {t('tracker_install_description')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                    <Button 
                      small 
                      fill
                      style={{ 
                        background: 'white', 
                        color: '#007aff',
                        fontWeight: 'bold'
                      }}
                      onClick={handleInstallClick}
                    >
                      {t('tracker_install_button')}
                    </Button>
                    <Button 
                      small
                      onClick={dismissInstallBanner}
                      style={{ 
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white'
                      }}
                    >
                      {t('tracker_install_later')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {showFact && (
            <Card outline className="no-shadow" style={{marginTop: '8px'}}>
              <CardHeader>
                <div><Icon icon="f7:lightbulb_fill" color="yellow" size="20"/> {t('tracker_fact_title')}</div>
                <Link icon="f7:multiply" onClick={() => setShowFact(false)} />
              </CardHeader>
              <CardContent>{dailyFact}</CardContent>
            </Card>
          )}

          {/* Tages-Statistik */}
          {eventLog.length > 0 && (
            <Card style={{margin: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white'}}>
              <CardContent>
                <div style={{fontWeight: 'bold', marginBottom: '12px', fontSize: '16px'}}>📊 {t('tracker_today')}</div>
                <div style={{display: 'flex', justifyContent: 'space-around', fontSize: '14px'}}>
                  <div style={{textAlign: 'center'}}>
                    <div style={{fontSize: '24px', fontWeight: 'bold'}}>{getStatistics().essen}</div>
                    <div>🍼 {t('tracker_food')}</div>
                  </div>
                  <div style={{textAlign: 'center'}}>
                    <div style={{fontSize: '24px', fontWeight: 'bold'}}>{getStatistics().schlaf}</div>
                    <div>😴 {t('tracker_sleep')}</div>
                  </div>
                  <div style={{textAlign: 'center'}}>
                    <div style={{fontSize: '24px', fontWeight: 'bold'}}>{getStatistics().windel}</div>
                    <div>💩 {t('tracker_diaper')}</div>
                  </div>
                  <div style={{textAlign: 'center'}}>
                    <div style={{fontSize: '24px', fontWeight: 'bold'}}>{getStatistics().spiel}</div>
                    <div>🧸 {t('tracker_play')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <BlockTitle>{t('tracker_record_activity')}</BlockTitle>
          <div className="grid grid-cols-2 grid-gap padding-horizontal">
            <div onClick={() => openActivityDetail('essen')} style={{
              textAlign:'center', padding:'20px', cursor: 'pointer',
              background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s', border: '2px solid #007aff'
            }} onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'} onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              <div style={{fontSize:'40px'}}>🍼</div>
              <div style={{fontWeight:'bold', color: '#007aff'}}>{t('tracker_food')}</div>
            </div>
            
            <div onClick={() => openActivityDetail('schlaf')} style={{
              textAlign:'center', padding:'20px', cursor: 'pointer',
              background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s', border: '2px solid #ff9500'
            }} onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'} onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              <div style={{fontSize:'40px'}}>😴</div>
              <div style={{fontWeight:'bold', color: '#ff9500'}}>{t('tracker_sleep')}</div>
            </div>
            
            <div onClick={() => openActivityDetail('windel')} style={{
              textAlign:'center', padding:'20px', cursor: 'pointer',
              background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s', border: '2px solid #34c759'
            }} onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'} onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              <div style={{fontSize:'40px'}}>💩</div>
              <div style={{fontWeight:'bold', color: '#34c759'}}>{t('tracker_diaper')}</div>
            </div>
            
            <div onClick={() => openActivityDetail('spiel')} style={{
              textAlign:'center', padding:'20px', cursor: 'pointer',
              background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s', border: '2px solid #af52de'
            }} onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'} onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              <div style={{fontSize:'40px'}}>🧸</div>
              <div style={{fontWeight:'bold', color: '#af52de'}}>{t('tracker_play')}</div>
            </div>
          </div>

          <Block style={{marginTop: '8px', marginBottom: '0'}}>
             <Button fill color="yellow" textColor="black" href="/nightlight/" round>
               <Icon f7="lightbulb_fill" size="18px" style={{marginRight: '8px'}}/>
               {t('tracker_nightlight')}
             </Button>
          </Block>
          
          <BlockTitle>{t('tracker_protocol_today')}</BlockTitle>
          <List mediaList inset>
            {eventLog.length === 0 ? (
              <ListItem title={t('tracker_no_activities')} footer={t('tracker_tap_icon')} />
            ) : (
              eventLog.map((log) => (
                <ListItem key={log.id} title={log.activity} after={log.time} swipeout>
                  <div slot="media" style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                    <Icon iconIos={`f7:${log.icon}`} color={log.color} />
                    <span style={{fontSize: '20px'}}>{log.mood || ''}</span>
                  </div>
                  <SwipeoutActions right>
                    <SwipeoutButton color="blue" onClick={() => editEvent(log.id)}>
                      <Icon f7="pencil" size="20px" />
                    </SwipeoutButton>
                    <SwipeoutButton delete onClick={() => deleteEvent(log.id)}>{t('delete')}</SwipeoutButton>
                  </SwipeoutActions>
                </ListItem>
              ))
            )}
          </List>

          <Block>
            <Button fill large raised color="green" onClick={shareProtocol}>
              <Icon f7="square_arrow_up" className="margin-right" />
              {t('tracker_share_protocol')}
            </Button>
          </Block>
        </Tab>


        {/* TAB 2: KINDER PROFILE (JETZT DYNAMISCH) */}
        <Tab id="tab-kinder" className="page-content">
          <BlockTitle>{t('children_title')}</BlockTitle>
          <List mediaList>
            {kinder.length === 0 ? (
              <ListItem title={t('children_no_profiles')} footer={t('children_create_first_profile')} />
            ) : (
              kinder.map((kind) => (
                <ListItem
                  key={kind.id}
                  link={`/kind/${kind.id}/`}
                  title={kind.basis.name}
                  subtitle={kind.basis.rufname ? `"${kind.basis.rufname}"` : ''}
                  text={kind.sicherheit.allergien ? '⚠️ Allergien vermerkt' : ''}
                  swipeout
                >
                  <div slot="media">
                    {renderAvatar(kind)}
                  </div>
                </ListItem>
              ))
            )}
          </List>
          
          {/* Zentriertes Plus-Icon zum Hinzufügen */}
          <Block style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '16px 0'
          }}>
            <Link href="/form/" style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#f0f0f0',
              transition: 'all 0.2s ease'
            }}>
              <Icon f7="plus" size="30px" color="blue" />
            </Link>
          </Block>
        </Tab>


        {/* TAB 3: FOTO */}
        <Tab id="tab-fotos" className="page-content">
          <BlockTitle>{t('photos_capture_moment')}</BlockTitle>
          <Block>
            <Card style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textAlign: 'center',
              padding: '20px'
            }}>
              <CardContent>
                <Icon icon="f7:camera_fill" size="60" color="white" style={{marginBottom: '15px'}}/>
                <p style={{marginBottom: '20px', fontSize: '15px'}}>
                  Halte besondere Momente fest und erstelle ein Foto-Tagebuch
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={uploadImage}
                  style={{ display: 'none' }}
                  id="camera-input"
                />
                <Button 
                  fill 
                  large 
                  round
                  onClick={() => document.getElementById('camera-input').click()}
                  style={{
                    background: 'white',
                    color: '#667eea',
                    fontWeight: 'bold'
                  }}
                >
                  <Icon f7="camera_fill" style={{marginRight: '8px'}} />
                  Foto aufnehmen
                </Button>
                <p style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.9)',
                  marginTop: '12px',
                  marginBottom: '0',
                  textAlign: 'center'
                }}>
                  💡 Im Browser/Simulator: Foto aus Galerie/Dateien auswählen
                </p>
              </CardContent>
            </Card>
          </Block>

          {/* Foto-Galerie */}
          {photos.length > 0 && (
            <>
              <BlockTitle>Foto-Galerie ({photos.length})</BlockTitle>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                padding: '0 16px 16px'
              }}>
                {photos.map((photo) => (
                  <Card key={photo.id} style={{
                    margin: 0,
                    padding: 0,
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <img 
                      src={photo.localUrl || photo.url} 
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover'
                      }} 
                      alt="Moment"
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                      padding: '8px',
                      fontSize: '11px',
                      color: 'white',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>{new Date(photo.timestamp).toLocaleString('de-DE', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}</span>
                      <Link 
                        onClick={() => deletePhoto(photo.id)}
                        style={{color: 'white'}}
                      >
                        <Icon f7="trash" size="18px" />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          {photos.length === 0 && (
            <Block style={{textAlign: 'center', opacity: 0.6, marginTop: '40px'}}>
              <Icon f7="photo" size="64px" color="gray" />
              <p>Noch keine Fotos aufgenommen</p>
              <p style={{fontSize: '13px', color: '#999'}}>Tippe auf "Foto aufnehmen" um zu starten</p>
            </Block>
          )}
        </Tab>
      </Tabs>


      {/* ÜBERGABE / NOTFALL SHEET */}
      <Sheet
        className="demo-sheet-swipe-to-close"
        style={{height: '90%', '--f7-sheet-bg-color': '#fff'}}
        swipeToClose
        backdrop
        opened={sheetOpened}
        onSheetClosed={() => setSheetOpened(false)}
      >
        <div className="sheet-modal-swipe-step" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
          <div style={{
            padding: '16px', 
            background: 'linear-gradient(135deg, #ff3b30 0%, #ff6b6b 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px'}}>
              <span style={{fontSize: '24px'}}>🛡️</span> {t('safety_center')}
            </div>
            <Button 
              fill 
              round 
              onClick={() => setSheetOpened(false)}
              style={{
                background: 'white',
                color: '#ff3b30',
                fontWeight: 'bold',
                minWidth: '80px'
              }}
            >
              {t('safety_done')}
            </Button>
          </div>

          <PageContent style={{flex: 1, overflow: 'auto'}}>
            <BlockTitle>🚨 {t('safety_emergency')}</BlockTitle>
            <Block className="no-margin-bottom">
              <Button large fill color="red" href="tel:112" external raised className="margin-bottom" style={{borderRadius: '12px', fontWeight: 'bold', fontSize: '18px'}}>
                <Icon icon="f7:phone_fill" className="margin-right" /> {t('safety_emergency_call')}
              </Button>
              <div style={{marginBottom: '12px', padding: '12px', background: '#fff3cd', borderRadius: '8px', fontSize: '13px', color: '#856404', border: '1px solid #ffeaa7'}}>
                💡 <b>{t('safety_tip')}</b> {t('safety_tip_text')}
              </div>
              <div className="grid grid-cols-2 grid-gap">
                <Button large fill color="green" href={`tel:${householdData.parent1Phone}`} external disabled={!householdData.parent1Phone} style={{borderRadius: '12px', opacity: householdData.parent1Phone ? 1 : 0.5}}>
                  <Icon f7="phone_fill" style={{marginRight: '4px'}} />
                  {householdData.parent1Name || `${t('safety_parent')} 1`}
                </Button>
                <Button large fill color="green" href={`tel:${householdData.parent2Phone}`} external disabled={!householdData.parent2Phone} style={{borderRadius: '12px', opacity: householdData.parent2Phone ? 1 : 0.5}}>
                  <Icon f7="phone_fill" style={{marginRight: '4px'}} />
                  {householdData.parent2Name || `${t('safety_parent')} 2`}
                </Button>
              </div>
            </Block>

            <BlockTitle>📍 {t('safety_location_title')}</BlockTitle>
            <Card className="no-margin" style={{borderRadius: '12px', overflow: 'hidden'}}>
              <CardContent padding={false}>
                <List noHairlinesMd form>
                  <ListInput
                    type="textarea"
                    placeholder={t('safety_address_placeholder')}
                    value={householdData.address}
                    onInput={(e) => updateHouseholdData('address', e.target.value)}
                    resizable
                    inputStyle={{fontSize: '16px', fontWeight: '500', color: '#333'}}
                    clearButton
                  >
                    <Icon slot="media" f7="map_pin_ellipse" color="red" />
                  </ListInput>
                </List>
              </CardContent>
            </Card>

            <BlockTitle>🌙 {t('safety_tonight')}</BlockTitle>
            <List inset strong style={{borderRadius: '12px'}}>
              <ListInput 
                label={t('safety_return_time')} 
                type="time" 
                value={shiftData.returnTime} 
                onInput={(e) => setShiftData({...shiftData, returnTime: e.target.value})}
              >
                <Icon slot="media" f7="clock_fill" color="orange" />
              </ListInput>
              <ListInput 
                label={t('safety_parents_location')} 
                type="text" 
                placeholder={t('safety_parents_location_placeholder')}
                value={shiftData.parentsLocation} 
                onInput={(e) => setShiftData({...shiftData, parentsLocation: e.target.value})}
                clearButton
              >
                <Icon slot="media" f7="location_fill" color="purple" />
              </ListInput>
              <ListInput 
                label={t('activity_notes')} 
                type="textarea" 
                placeholder={t('safety_notes_placeholder')}
                value={shiftData.notes} 
                onInput={(e) => setShiftData({...shiftData, notes: e.target.value})} 
                resizable
              >
                <Icon slot="media" f7="doc_text_fill" color="gray" />
              </ListInput>
            </List>

            <BlockTitle>🏠 {t('safety_house_wifi')}</BlockTitle>
            <List inset strong accordionList>
              <ListItem accordionItem title={`📞 ${t('safety_emergency_contacts')}`} style={{background: '#e8f5e9'}}>
                <Icon slot="media" f7="person_2_fill" color="green" />
                <div className="accordion-item-content">
                  <List noHairlinesMd>
                    <ListInput 
                      label={t('safety_parent1_name')} 
                      type="text"
                      placeholder={t('safety_parent1_placeholder')}
                      value={householdData.parent1Name} 
                      onInput={(e) => updateHouseholdData('parent1Name', e.target.value)}
                      clearButton
                    />
                    <ListInput 
                      label={t('safety_phone1')} 
                      type="tel" 
                      placeholder={t('safety_phone_placeholder')}
                      value={householdData.parent1Phone} 
                      onInput={(e) => updateHouseholdData('parent1Phone', e.target.value)}
                      clearButton
                    />
                    <ListInput 
                      label={t('safety_parent2_name')} 
                      type="text"
                      placeholder={t('safety_parent1_placeholder')}
                      value={householdData.parent2Name} 
                      onInput={(e) => updateHouseholdData('parent2Name', e.target.value)}
                      clearButton
                    />
                    <ListInput 
                      label={t('safety_phone2')} 
                      type="tel" 
                      placeholder={t('safety_phone_placeholder')}
                      value={householdData.parent2Phone} 
                      onInput={(e) => updateHouseholdData('parent2Phone', e.target.value)}
                      clearButton
                    />
                  </List>
                </div>
              </ListItem>
              <ListItem accordionItem title={`📡 ${t('safety_wifi_credentials')}`}>
                <Icon slot="media" f7="wifi" color="blue" />
                <div className="accordion-item-content">
                  <List noHairlinesMd>
                    <ListInput 
                      label={t('safety_wifi_name')} 
                      type="text" 
                      placeholder={t('safety_wifi_name_placeholder')}
                      value={householdData.wifiName} 
                      onInput={(e) => updateHouseholdData('wifiName', e.target.value)}
                      clearButton
                    />
                    <ListInput 
                      label={t('safety_wifi_password')} 
                      type="text" 
                      placeholder={t('safety_wifi_password_placeholder')}
                      value={householdData.wifiPass} 
                      onInput={(e) => updateHouseholdData('wifiPass', e.target.value)}
                      clearButton
                    />
                  </List>
                </div>
              </ListItem>
            </List>
          </PageContent>
        </div>
      </Sheet>

      {/* AKTIVITÄTS-DETAIL SHEET */}
      <Sheet
        className="demo-sheet-swipe-to-close"
        style={{height: 'auto', '--f7-sheet-bg-color': '#fff', borderTopLeftRadius: '16px', borderTopRightRadius: '16px'}}
        swipeToClose
        backdrop
        opened={activitySheet.opened}
        onSheetClosed={() => setActivitySheet({...activitySheet, opened: false})}
      >
        <div className="sheet-modal-swipe-step">
          <div className="display-flex padding justify-content-between align-items-center bg-color-light" style={{padding: '16px'}}>
            <div style={{fontSize: '20px', fontWeight: 'bold'}}>
              <span style={{fontSize: '24px', marginRight: '8px'}}>{activitySheet.icon}</span>
              {activitySheet.editingEventId ? `${activitySheet.title} bearbeiten` : activitySheet.title}
            </div>
            <Link onClick={() => setActivitySheet({...activitySheet, opened: false})}>{t('cancel')}</Link>
          </div>

          <PageContent>
            <Block style={{paddingTop: '8px', paddingBottom: '24px'}}>
              
              {/* Kind-Auswahl wenn mehrere Kinder */}
              {kinder.length > 1 && (
                <List noHairlinesMd strong inset style={{marginBottom: '16px'}}>
                  <ListInput
                    label={t('activity_which_child')}
                    type="select"
                    value={activitySheet.selectedKind || ''}
                    onInput={(e) => setActivitySheet({...activitySheet, selectedKind: e.target.value})}
                  >
                    <option value="">{t('activity_please_select')}</option>
                    {kinder.map(kind => (
                      <option key={kind.id} value={kind.id}>{kind.basis.name}</option>
                    ))}
                  </ListInput>
                </List>
              )}

              {/* Stimmung */}
              <div style={{marginBottom: '16px', textAlign: 'center'}}>
                <div style={{marginBottom: '8px', fontWeight: 'bold', color: '#666'}}>{t('activity_mood')}</div>
                <div style={{display: 'flex', justifyContent: 'center', gap: '12px'}}>
                  {['😢', '😐', '😊', '😄'].map(emoji => (
                    <div 
                      key={emoji}
                      onClick={() => setActivitySheet({...activitySheet, mood: emoji})}
                      style={{
                        fontSize: '32px', cursor: 'pointer', padding: '8px',
                        borderRadius: '50%', transition: 'transform 0.2s',
                        transform: activitySheet.mood === emoji ? 'scale(1.3)' : 'scale(1)',
                        border: activitySheet.mood === emoji ? '3px solid #007aff' : '3px solid transparent'
                      }}
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* ESSEN */}
              {activitySheet.type === 'essen' && (
                <List noHairlinesMd strong inset>
                  <ListInput
                    label={t('activity_what_eaten')}
                    type="text"
                    placeholder={t('activity_what_placeholder')}
                    value={activitySheet.details.was || ''}
                    onInput={(e) => updateActivityDetail('was', e.target.value)}
                    clearButton
                  />
                  <ListInput
                    label={t('activity_amount')}
                    type="text"
                    placeholder={t('activity_amount_placeholder')}
                    value={activitySheet.details.menge || ''}
                    onInput={(e) => updateActivityDetail('menge', e.target.value)}
                    clearButton
                  />
                  <ListInput
                    label={t('activity_notes')}
                    type="textarea"
                    placeholder={t('activity_notes_placeholder')}
                    value={activitySheet.details.notizen || ''}
                    onInput={(e) => updateActivityDetail('notizen', e.target.value)}
                    resizable
                  />
                </List>
              )}

              {/* SCHLAF */}
              {activitySheet.type === 'schlaf' && (
                <List noHairlinesMd strong inset>
                  <ListInput
                    label={t('activity_from')}
                    type="time"
                    value={activitySheet.details.von || ''}
                    onInput={(e) => updateActivityDetail('von', e.target.value)}
                  />
                  <ListInput
                    label={t('activity_to')}
                    type="time"
                    value={activitySheet.details.bis || ''}
                    onInput={(e) => updateActivityDetail('bis', e.target.value)}
                  />
                  <ListInput
                    label={t('activity_quality')}
                    type="select"
                    value={activitySheet.details.qualitaet || ''}
                    onInput={(e) => updateActivityDetail('qualitaet', e.target.value)}
                  >
                    <option value="">{t('activity_please_select')}</option>
                    <option value="tief">{t('activity_quality_deep')}</option>
                    <option value="normal">{t('activity_quality_normal')}</option>
                    <option value="unruhig">{t('activity_quality_restless')}</option>
                  </ListInput>
                </List>
              )}

              {/* WINDEL */}
              {activitySheet.type === 'windel' && (
                <List noHairlinesMd strong inset>
                  <ListInput
                    label={t('activity_diaper_type')}
                    type="select"
                    value={activitySheet.details.art || 'nass'}
                    onInput={(e) => updateActivityDetail('art', e.target.value)}
                  >
                    <option value="nass">{t('activity_diaper_wet')}</option>
                    <option value="voll">{t('activity_diaper_full')}</option>
                    <option value="beides">{t('activity_diaper_both')}</option>
                  </ListInput>
                  <ListInput
                    label={t('activity_notes')}
                    type="textarea"
                    placeholder={t('activity_diaper_notes_placeholder')}
                    value={activitySheet.details.notizen || ''}
                    onInput={(e) => updateActivityDetail('notizen', e.target.value)}
                    resizable
                  />
                </List>
              )}

              {/* SPIEL */}
              {activitySheet.type === 'spiel' && (
                <List noHairlinesMd strong inset>
                  <ListInput
                    label={t('activity_play_activity')}
                    type="text"
                    placeholder={t('activity_play_placeholder')}
                    value={activitySheet.details.aktivitaet || ''}
                    onInput={(e) => updateActivityDetail('aktivitaet', e.target.value)}
                    clearButton
                  />
                  <ListInput
                    label={t('activity_duration')}
                    type="text"
                    placeholder={t('activity_duration_placeholder')}
                    value={activitySheet.details.dauer || ''}
                    onInput={(e) => updateActivityDetail('dauer', e.target.value)}
                    clearButton
                  />
                  <ListInput
                    label={t('activity_notes')}
                    type="textarea"
                    placeholder={t('activity_mood_placeholder')}
                    value={activitySheet.details.notizen || ''}
                    onInput={(e) => updateActivityDetail('notizen', e.target.value)}
                    resizable
                  />
                </List>
              )}

              <Button 
                fill 
                large 
                raised
                onClick={saveActivityDetail}
                style={{marginTop: '16px', borderRadius: '12px'}}
              >
                <Icon f7="checkmark_alt" style={{marginRight: '8px'}} />
                {activitySheet.editingEventId ? 'Aktualisieren' : t('save')}
              </Button>
            </Block>
          </PageContent>
        </div>
      </Sheet>

    </Page>
  );
};

export default HomePage;