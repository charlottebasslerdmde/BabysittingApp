import React, { useState, useEffect } from 'react';
import { 
  Page, 
  Navbar, 
  List, 
  ListItem, 
  ListInput,
  Toggle, 
  BlockTitle, 
  Block, 
  Button, 
  Card,
  CardContent,
  f7,
  Icon,
  Fab,
  Sheet
} from 'framework7-react';
import { supabase } from '../js/supabase';
import { logout, checkAuth } from '../js/authGuard';
import { useTranslation, setLanguage as setI18nLanguage, getLanguage } from '../js/i18n';
import store from '../js/store';
import { compressImage } from '../js/imageUtils';

const SettingsPage = () => {
  // i18n Hook für automatisches Re-Rendering bei Sprachwechsel
  const { t: translate } = useTranslation();
  
  // --- STATE ---
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [biometricRequired, setBiometricRequired] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);
  const [reminderInterval, setReminderInterval] = useState('60');
  const [userName, setUserName] = useState('');
  const [themeColor, setThemeColor] = useState('#007aff');
  const [defaultKind, setDefaultKind] = useState('');
  const [autoDeleteDays, setAutoDeleteDays] = useState('0');
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [lastBackupDate, setLastBackupDate] = useState('Nie');
  const [profileImage, setProfileImage] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('de');
  const [currentUser, setCurrentUser] = useState(null);
  
  // Statistiken
  const [stats, setStats] = useState({
    totalKinder: 0,
    totalEvents: 0,
    storageUsed: '0 KB',
    appVersion: '1.2.0',
    deviceInfo: ''
  });

  // --- HELPER FUNCTIONS ---
  
  // Lädt Benutzerprofil aus Supabase
  const loadUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('babysitter_name, profile_image')
        .eq('id', userId)
        .single();
      
      if (error) {
        // Profil existiert noch nicht, das ist ok bei neuen Benutzern
        if (error.code === 'PGRST116') {
          console.log('Kein Profil gefunden, wird beim ersten Speichern erstellt');
          return;
        }
        throw error;
      }
      
      if (data) {
        if (data.babysitter_name) {
          setUserName(data.babysitter_name);
          // Auch in localStorage für Offline-Verfügbarkeit
          localStorage.setItem('sitterSafe_userName', data.babysitter_name);
        }
        if (data.profile_image) {
          setProfileImage(data.profile_image);
          localStorage.setItem('sitterSafe_profileImage', data.profile_image);
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden des Profils:', error);
      // Fallback auf localStorage
      const storedName = localStorage.getItem('sitterSafe_userName');
      const storedImage = localStorage.getItem('sitterSafe_profileImage');
      if (storedName) setUserName(storedName);
      if (storedImage) setProfileImage(storedImage);
    }
  };
  
  // Speichert Benutzerprofil in Supabase
  const saveUserProfile = async (userId, updates) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...updates
        });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Fehler beim Speichern des Profils:', error);
      return { success: false, error: error.message };
    }
  };

  // --- INIT (Laden beim Start) ---
  useEffect(() => {
    // Authentifizierung prüfen und Profil laden
    const initializeSettings = async () => {
      const { isAuthenticated, user } = await checkAuth();
      
      if (isAuthenticated && user) {
        setCurrentUser(user);
        // Profil aus Supabase laden
        await loadUserProfile(user.id);
      } else {
        // Fallback auf localStorage wenn nicht eingeloggt
        const storedName = localStorage.getItem('sitterSafe_userName');
        if (storedName) setUserName(storedName);
        const storedImage = localStorage.getItem('sitterSafe_profileImage');
        if (storedImage) setProfileImage(storedImage);
      }
    };
    
    initializeSettings();
    
    // 1. Dark Mode
    const storedDark = localStorage.getItem('sitterSafe_darkMode');
    if (storedDark) {
      const isDark = JSON.parse(storedDark);
      setIsDarkMode(isDark);
      updateTheme(isDark);
    } else {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    }

    // 2. Haptik
    const storedHaptics = localStorage.getItem('sitterSafe_haptics');
    if (storedHaptics) setHapticsEnabled(JSON.parse(storedHaptics));

    // 3. Sound
    const storedSound = localStorage.getItem('sitterSafe_sound');
    if (storedSound) setSoundEnabled(JSON.parse(storedSound));

    // 4. Biometrie Pflicht
    const storedBio = localStorage.getItem('sitterSafe_bio_active');
    if (storedBio) setBiometricRequired(JSON.parse(storedBio));

    // 5. Auto-Backup
    const storedBackup = localStorage.getItem('sitterSafe_autoBackup');
    if (storedBackup) setAutoBackup(JSON.parse(storedBackup));

    // 6. Erinnerungsintervall
    const storedReminder = localStorage.getItem('sitterSafe_reminderInterval');
    if (storedReminder) setReminderInterval(storedReminder);

    // 7. Benutzername & Profilbild werden oben in initializeSettings() geladen

    // 8. Theme-Farbe
    const storedTheme = localStorage.getItem('sitterSafe_themeColor');
    if (storedTheme) setThemeColor(storedTheme);

    // 9. Standard-Kind
    const storedDefaultKind = localStorage.getItem('sitterSafe_defaultKind');
    if (storedDefaultKind) setDefaultKind(storedDefaultKind);

    // 10. Auto-Löschung
    const storedDeleteDays = localStorage.getItem('sitterSafe_autoDeleteDays');
    if (storedDeleteDays) setAutoDeleteDays(storedDeleteDays);

    // 11. Notfall-Modus
    const storedEmergency = localStorage.getItem('sitterSafe_emergencyMode');
    if (storedEmergency) setEmergencyMode(JSON.parse(storedEmergency));

    // 12. Letztes Backup
    const storedBackupDate = localStorage.getItem('sitterSafe_lastBackup');
    if (storedBackupDate) setLastBackupDate(storedBackupDate);

    // 13. Profilbild wird oben in initializeSettings() geladen

    // 14. Sprache
    const storedLanguage = getLanguage();
    setCurrentLanguage(storedLanguage);

    // 15. Statistiken berechnen
    calculateStats();
  }, []);

  const calculateStats = () => {
    const kinder = JSON.parse(localStorage.getItem('sitterSafe_kinder') || '[]');
    const eventLog = JSON.parse(localStorage.getItem('sitterSafe_eventLog') || '[]');
    
    // Speicherverbrauch schätzen
    let totalSize = 0;
    for (let key in localStorage) {
      if (key.startsWith('sitterSafe_')) {
        totalSize += localStorage[key].length + key.length;
      }
    }
    const sizeKB = (totalSize / 1024).toFixed(2);

    // Device Info
    const deviceInfo = `${navigator.platform} | ${navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}`;

    setStats({
      totalKinder: kinder.length,
      totalEvents: eventLog.length,
      storageUsed: `${sizeKB} KB`,
      appVersion: '1.2.0',
      deviceInfo
    });
  };

  // --- HANDLERS ---

  const updateTheme = (dark) => {
    if (dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const toggleDarkMode = (e) => {
    const checked = e.target.checked;
    setIsDarkMode(checked);
    updateTheme(checked);
    localStorage.setItem('sitterSafe_darkMode', JSON.stringify(checked));
  };

  const toggleHaptics = (e) => {
    const checked = e.target.checked;
    setHapticsEnabled(checked);
    localStorage.setItem('sitterSafe_haptics', JSON.stringify(checked));
    if (checked) f7.toast.show({text: 'Vibration an', closeTimeout: 1000, position: 'center'});
  };

  const toggleNotifications = (e) => {
    const checked = e.target.checked;
    setNotifications(checked);
    // Hier könnte man später echte Push-Logik einbauen
    f7.toast.show({text: checked ? 'Benachrichtigungen aktiviert' : 'Stumm geschaltet', closeTimeout: 1500});
  };

  const toggleBiometrics = (e) => {
    const checked = e.target.checked;
    setBiometricRequired(checked);
    localStorage.setItem('sitterSafe_bio_active', JSON.stringify(checked));
  };

  const toggleSound = (e) => {
    const checked = e.target.checked;
    setSoundEnabled(checked);
    localStorage.setItem('sitterSafe_sound', JSON.stringify(checked));
    f7.toast.show({text: checked ? '🔊 Sound an' : '🔇 Sound aus', closeTimeout: 1000, position: 'center'});
  };

  const changeLanguage = (e) => {
    const lang = e.target.value;
    setI18nLanguage(lang);
    setCurrentLanguage(lang);
    const message = lang === 'de' ? translate('settings_language_changed') : 'Language set to English';
    f7.toast.show({text: message, closeTimeout: 1500, position: 'center'});
  };

  const toggleAutoBackup = (e) => {
    const checked = e.target.checked;
    setAutoBackup(checked);
    localStorage.setItem('sitterSafe_autoBackup', JSON.stringify(checked));
    if (checked) {
      f7.toast.show({text: '☁️ Auto-Backup aktiviert', closeTimeout: 1500});
    }
  };

  const updateReminderInterval = (e) => {
    const val = e.target.value;
    setReminderInterval(val);
    localStorage.setItem('sitterSafe_reminderInterval', val);
  };

  const saveUserName = async (e) => {
    const val = e.target.value;
    setUserName(val);
    localStorage.setItem('sitterSafe_userName', val);
    
    // In Supabase speichern wenn eingeloggt
    if (currentUser) {
      const result = await saveUserProfile(currentUser.id, { babysitter_name: val });
      if (!result.success) {
        console.error('Fehler beim Speichern in Supabase:', result.error);
      }
    }
  };

  const exportData = () => {
    f7.dialog.create({
      title: 'Daten exportieren',
      text: 'Format wählen',
      buttons: [
        {
          text: 'JSON',
          onClick: () => {
            const data = {};
            for (let key in localStorage) {
              if (key.startsWith('sitterSafe_')) {
                data[key] = localStorage[key];
              }
            }
            const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sitterSafe_backup_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            // Backup-Datum speichern
            const now = new Date().toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'});
            localStorage.setItem('sitterSafe_lastBackup', now);
            setLastBackupDate(now);
            
            f7.toast.show({text: '✅ Export abgeschlossen', closeTimeout: 2000});
          }
        },
        {
          text: 'Teilen',
          onClick: async () => {
            const data = {};
            for (let key in localStorage) {
              if (key.startsWith('sitterSafe_')) {
                data[key] = localStorage[key];
              }
            }
            const jsonString = JSON.stringify(data, null, 2);
            const fileName = `sitterSafe_backup_${new Date().toISOString().split('T')[0]}.json`;
            
            try {
              // Prüfe ob Web Share API mit Dateien verfügbar ist
              if (navigator.canShare && navigator.canShare({ files: [] })) {
                const file = new File([jsonString], fileName, { type: 'application/json' });
                await navigator.share({
                  title: 'SitterSafe Backup',
                  text: 'Mein SitterSafe Backup - Import über Einstellungen > Daten importieren',
                  files: [file]
                });
                
                // Backup-Datum speichern
                const now = new Date().toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'});
                localStorage.setItem('sitterSafe_lastBackup', now);
                setLastBackupDate(now);
                
                f7.toast.show({text: '✅ Backup geteilt', closeTimeout: 2000, cssClass: 'toast-success'});
              } else {
                // Fallback: Download wenn Datei-Sharing nicht unterstützt wird
                const blob = new Blob([jsonString], {type: 'application/json'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                a.click();
                URL.revokeObjectURL(url);
                
                // Backup-Datum speichern
                const now = new Date().toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'});
                localStorage.setItem('sitterSafe_lastBackup', now);
                setLastBackupDate(now);
                
                f7.toast.show({text: '⬇️ Datei heruntergeladen (Sharing nicht verfügbar)', closeTimeout: 2500});
              }
            } catch (e) {
              // Wenn Teilen abgebrochen oder fehlgeschlagen
              if (e.name !== 'AbortError') {
                console.error('Share-Fehler:', e);
                f7.toast.show({text: 'Teilen fehlgeschlagen', closeTimeout: 2000});
              }
            }
          }
        },
        {text: 'Abbrechen', color: 'red'}
      ]
    }).open();
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          f7.dialog.confirm(
            'Vorhandene Daten werden überschrieben. Fortfahren?',
            'Daten importieren',
            () => {
              Object.keys(data).forEach(key => {
                if (key.startsWith('sitterSafe_')) {
                  localStorage.setItem(key, data[key]);
                }
              });
              f7.toast.show({text: '✅ Import erfolgreich', closeTimeout: 2000});
              setTimeout(() => window.location.reload(), 1500);
            }
          );
        } catch (err) {
          f7.dialog.alert('Ungültige Datei', 'Fehler');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const updateThemeColor = (e) => {
    const color = e.target.value;
    setThemeColor(color);
    localStorage.setItem('sitterSafe_themeColor', color);
    document.documentElement.style.setProperty('--f7-theme-color', color);
  };

  const updateDefaultKind = (e) => {
    const val = e.target.value;
    setDefaultKind(val);
    localStorage.setItem('sitterSafe_defaultKind', val);
  };

  const updateAutoDeleteDays = (e) => {
    const val = e.target.value;
    setAutoDeleteDays(val);
    localStorage.setItem('sitterSafe_autoDeleteDays', val);
    if (val !== '0') {
      f7.toast.show({text: `🗑️ Lösche Protokolle älter als ${val} Tage`, closeTimeout: 2000});
    }
  };

  const toggleEmergencyMode = (e) => {
    const checked = e.target.checked;
    setEmergencyMode(checked);
    localStorage.setItem('sitterSafe_emergencyMode', JSON.stringify(checked));
    if (checked) {
      document.documentElement.classList.add('emergency-mode');
      f7.toast.show({text: '🚨 NOTFALL-MODUS AKTIV', closeTimeout: 2000, cssClass: 'toast-emergency'});
    } else {
      document.documentElement.classList.remove('emergency-mode');
    }
  };

  const showSystemInfo = () => {
    f7.dialog.alert(
      `<div style="text-align: left; font-size: 14px;">
        <b>App Version:</b> ${stats.appVersion}<br>
        <b>Build:</b> 2026.02.08<br>
        <b>Plattform:</b> ${navigator.platform}<br>
        <b>Browser:</b> ${navigator.userAgent.split(' ').slice(-1)[0]}<br>
        <b>Speicher:</b> ${stats.storageUsed}<br>
        <b>Kinder:</b> ${stats.totalKinder}<br>
        <b>Ereignisse:</b> ${stats.totalEvents}<br>
        <b>Letztes Backup:</b> ${lastBackupDate}
      </div>`,
      'System-Informationen'
    );
  };

  const clearCache = () => {
    f7.dialog.confirm(
      'Cache leeren? (Einstellungen bleiben erhalten)',
      'Cache löschen',
      () => {
        // Nur temporäre Daten löschen, Einstellungen behalten
        const toKeep = ['sitterSafe_darkMode', 'sitterSafe_haptics', 'sitterSafe_sound', 
                        'sitterSafe_bio_active', 'sitterSafe_userName',
                        'sitterSafe_kinder', 'sitterSafe_household', 'sitterSafe_themeColor',
                        'sitterSafe_defaultKind', 'sitterSafe_autoDeleteDays'];
        const backup = {};
        toKeep.forEach(key => {
          if (localStorage.getItem(key)) {
            backup[key] = localStorage.getItem(key);
          }
        });
        
        localStorage.clear();
        
        Object.keys(backup).forEach(key => {
          localStorage.setItem(key, backup[key]);
        });
        
        calculateStats();
        f7.toast.show({text: '🧹 Cache geleert', closeTimeout: 1500});
      }
    );
  };

  const resetApp = () => {
    f7.dialog.confirm(
      'Wirklich alle Daten (Kinder, Protokolle, Einstellungen) löschen?',
      'Werkseinstellungen',
      () => {
        localStorage.clear();
        f7.dialog.alert('App wurde zurückgesetzt.', () => {
          window.location.reload();
        });
      }
    );
  };

  // NEU: Profilbild hochladen mit Kompression
  const uploadProfileImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        f7.preloader.show();
        
        // Komprimiere das Bild
        const compressedBase64 = await compressImage(file, 300, 300, 0.5);
        
        setProfileImage(compressedBase64);
        localStorage.setItem('sitterSafe_profileImage', compressedBase64);
        
        // In Supabase speichern wenn eingeloggt
        if (currentUser) {
          const result = await saveUserProfile(currentUser.id, { profile_image: compressedBase64 });
          if (!result.success) {
            console.error('Fehler beim Speichern in Supabase:', result.error);
          }
        }
        
        f7.preloader.hide();
        f7.toast.show({
          text: '✅ Profilbild aktualisiert', 
          closeTimeout: 1500,
          cssClass: 'toast-success'
        });
      } catch (error) {
        f7.preloader.hide();
        console.error('Fehler beim Aktualisieren des Profilbildes:', error);

        // Spezielles Handling für Speicherprobleme (QuotaExceededError)
        const isQuotaError =
          error &&
          (error.name === 'QuotaExceededError' ||
            error.code === 22 || // manche Browser
            error.message?.toLowerCase().includes('quota'));

        const errorText = isQuotaError
          ? 'Speicher ist voll. Bitte löschen Sie alte Daten oder versuchen Sie es später erneut.'
          : 'Fehler beim Laden des Bildes';

        f7.toast.show({
          text: errorText,
          closeTimeout: 2000
        });
      }
    };
    input.click();
  };

  // NEU: Cloud-Backup mit Supabase
  const cloudBackup = async () => {
    f7.preloader.show();
    try {
      const data = {};
      for (let key in localStorage) {
        if (key.startsWith('sitterSafe_')) {
          data[key] = localStorage[key];
        }
      }
      
      const deviceInfo = `${navigator.platform} | ${navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}`;
      
      const backupData = {
        user_id: 'demo_user', // In echter App würde man hier die echte User-ID verwenden
        backup_data: data,
        device_info: deviceInfo,
        app_version: stats.appVersion,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('backups')
        .insert([backupData]);
      
      if (error) throw error;
      
      const now = new Date().toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'});
      localStorage.setItem('sitterSafe_lastBackup', now);
      setLastBackupDate(now);
      
      f7.toast.show({text: '☁️ Cloud-Backup erfolgreich', closeTimeout: 2000});
    } catch (error) {
      f7.dialog.alert('Cloud-Backup fehlgeschlagen: ' + error.message, 'Fehler');
    } finally {
      f7.preloader.hide();
    }
  };

  // NEU: Cloud-Restore mit Supabase
  const cloudRestore = async () => {
    f7.preloader.show();
    try {
      const { data, error } = await supabase
        .from('backups')
        .select('*')
        .eq('user_id', 'demo_user')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        f7.dialog.alert('Kein Cloud-Backup gefunden', 'Info');
        return;
      }

      const backupData = data[0].backup_data;
      
      f7.dialog.confirm(
        'Vorhandene Daten werden durch Cloud-Backup überschrieben. Fortfahren?',
        'Cloud-Restore',
        () => {
          Object.keys(backupData).forEach(key => {
            if (key.startsWith('sitterSafe_')) {
              localStorage.setItem(key, backupData[key]);
            }
          });
          f7.toast.show({text: '✅ Wiederherstellung erfolgreich', closeTimeout: 2000});
          setTimeout(() => window.location.reload(), 1500);
        }
      );
    } catch (error) {
      f7.dialog.alert('Cloud-Restore fehlgeschlagen: ' + error.message, 'Fehler');
    } finally {
      f7.preloader.hide();
    }
  };

  // NEU: Feedback senden
  const sendFeedback = async () => {
    f7.dialog.prompt('Dein Feedback hilft uns, SitterSafe zu verbessern!', 'Feedback', 
      async (text) => {
        if (text && text.trim()) {
          f7.preloader.show();
          
          try {
            // 1. Lokal speichern
            const feedbacks = JSON.parse(localStorage.getItem('sitterSafe_feedbacks') || '[]');
            feedbacks.push({
              text: text,
              date: new Date().toISOString()
            });
            localStorage.setItem('sitterSafe_feedbacks', JSON.stringify(feedbacks));
            
            // 2. Optional: In Supabase speichern
            try {
              const deviceInfo = `${navigator.platform} | ${navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}`;
              
              await supabase
                .from('feedback')
                .insert([{
                  user_id: 'demo_user',
                  feedback_text: text,
                  device_info: deviceInfo,
                  app_version: stats.appVersion,
                  created_at: new Date().toISOString()
                }]);
              
              f7.toast.show({
                text: '✅ Vielen Dank für dein Feedback!', 
                closeTimeout: 2500
              });
            } catch (cloudError) {
              // Falls Cloud-Speicherung fehlschlägt, ist das okay - lokal ist gespeichert
              console.log('Cloud-Feedback failed:', cloudError);
              f7.toast.show({
                text: '✅ Feedback gespeichert (lokal)', 
                closeTimeout: 2500
              });
            }
          } finally {
            f7.preloader.hide();
          }
        }
      }
    );
  };

  // NEU: Liste aller Cloud-Backups anzeigen
  const showCloudBackups = async () => {
    f7.preloader.show();
    try {
      const { data, error } = await supabase
        .from('backups')
        .select('*')
        .eq('user_id', 'demo_user')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        f7.dialog.alert('Keine Cloud-Backups gefunden', 'Info');
        return;
      }

      // Backups als Liste anzeigen
      const buttons = data.map(backup => {
        const date = new Date(backup.created_at).toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        return {
          text: `📅 ${date}`,
          onClick: () => {
            f7.dialog.confirm(
              `Backup vom ${date} wiederherstellen?`,
              'Backup laden',
              () => {
                Object.keys(backup.backup_data).forEach(key => {
                  if (key.startsWith('sitterSafe_')) {
                    localStorage.setItem(key, backup.backup_data[key]);
                  }
                });
                f7.toast.show({text: '✅ Wiederherstellung erfolgreich', closeTimeout: 2000});
                setTimeout(() => window.location.reload(), 1500);
              }
            );
          }
        };
      });

      buttons.push({text: 'Abbrechen', color: 'red'});

      f7.dialog.create({
        title: `${data.length} Cloud-Backup(s) gefunden`,
        text: 'Wähle ein Backup zum Wiederherstellen:',
        buttons: buttons
      }).open();
    } catch (error) {
      f7.dialog.alert('Fehler beim Laden der Backups: ' + error.message, 'Fehler');
    } finally {
      f7.preloader.hide();
    }
  };

  // NEU: Cloud-Backups verwalten (löschen)
  const manageCloudBackups = async () => {
    f7.preloader.show();
    try {
      const { data, error } = await supabase
        .from('backups')
        .select('*')
        .eq('user_id', 'demo_user')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        f7.dialog.alert('Keine Cloud-Backups gefunden', 'Info');
        return;
      }

      const totalSize = JSON.stringify(data).length;
      const sizeKB = (totalSize / 1024).toFixed(2);

      f7.dialog.confirm(
        `Du hast ${data.length} Cloud-Backup(s) (${sizeKB} KB).\n\nAlle außer dem neuesten löschen?`,
        'Cloud-Backups verwalten',
        async () => {
          try {
            f7.preloader.show();
            
            // Alle außer dem ersten (neuesten) löschen
            const toDelete = data.slice(1).map(b => b.id);
            
            if (toDelete.length > 0) {
              const { error: deleteError } = await supabase
                .from('backups')
                .delete()
                .in('id', toDelete);
              
              if (deleteError) throw deleteError;
              
              f7.toast.show({
                text: `🗑️ ${toDelete.length} alte Backup(s) gelöscht`,
                closeTimeout: 2000
              });
            } else {
              f7.toast.show({text: 'Nur ein Backup vorhanden', closeTimeout: 1500});
            }
          } catch (err) {
            f7.dialog.alert('Fehler beim Löschen: ' + err.message, 'Fehler');
          } finally {
            f7.preloader.hide();
          }
        }
      );
    } catch (error) {
      f7.dialog.alert('Fehler beim Laden der Backups: ' + error.message, 'Fehler');
    } finally {
      f7.preloader.hide();
    }
  };

  // NEU: Datenschutzerklärung
  const showPrivacy = () => {
    f7.dialog.alert(
      `<div style="text-align: left; font-size: 13px; max-height: 400px; overflow-y: auto;">
        <h3>Datenschutzerklärung</h3>
        <p><b>Datenverarbeitung:</b><br>
        SitterSafe speichert alle Daten lokal auf deinem Gerät. 
        Keine Daten werden ohne deine explizite Zustimmung übertragen.</p>
        
        <p><b>Cloud-Backup:</b><br>
        Wenn du das optionale Cloud-Backup aktivierst, werden deine 
        Daten verschlüsselt an unsere Server übertragen.</p>
        
        <p><b>Gesundheitsdaten:</b><br>
        Medikamenten- und Gesundheitsdaten werden besonders geschützt 
        und können mit FaceID/Fingerabdruck gesichert werden.</p>
        
        <p><b>Deine Rechte:</b><br>
        Du kannst jederzeit alle deine Daten exportieren oder löschen.</p>
        
        <p style="margin-top: 15px; font-size: 11px; color: #666;">
        Stand: Februar 2026<br>
        Kontakt: privacy@sittersafe.app
        </p>
      </div>`,
      'Datenschutz'
    );
  };

  // Event Handler: Fokus entfernen beim Verlassen der Seite
  const handlePageBeforeOut = () => {
    // Entfernt den Fokus von allen fokussierten Elementen
    if (document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }
  };

  return (
    <Page name="settings" onPageBeforeOut={handlePageBeforeOut}>
      <Navbar title={translate('settings_title')} backLink="Zurück" backLinkForce={true} />

      {/* PROFIL CARD */}
      <Card style={{margin: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white'}}>
        <CardContent>
          <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
            <div 
              onClick={uploadProfileImage}
              style={{
                width: '60px', height: '60px', borderRadius: '50%', 
                background: profileImage ? `url(${profileImage}) center/cover` : 'rgba(255,255,255,0.3)', 
                display: 'flex', 
                alignItems: 'center', justifyContent: 'center', fontSize: '28px',
                cursor: 'pointer',
                border: '2px solid rgba(255,255,255,0.5)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {!profileImage && '👤'}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(0,0,0,0.5)',
                fontSize: '10px',
                textAlign: 'center',
                padding: '2px'
              }}>
                📷
              </div>
            </div>
            <div style={{flex: 1}}>
              <input 
                type="text" 
                placeholder="Dein Name" 
                value={userName}
                onChange={saveUserName}
                style={{
                  background: 'rgba(255,255,255,0.2)', 
                  border: 'none', 
                  padding: '10px', 
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  width: '100%'
                }}
              />
              {currentUser && currentUser.email && (
                <div style={{marginTop: '6px', fontSize: '13px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '6px'}}>
                  <Icon f7="envelope_fill" size="12px" />
                  {currentUser.email}
                </div>
              )}
              <div style={{marginTop: '8px', fontSize: '14px', opacity: 0.9}}>
                {translate('settings_babysitter_profile')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* STATISTIKEN */}
      <Card style={{margin: '16px'}}>
        <CardContent>
          <div style={{fontWeight: 'bold', marginBottom: '12px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
            <Icon f7="chart_bar_fill" color="blue" />
            {translate('settings_your_stats')}
          </div>
          <div style={{display: 'flex', justifyContent: 'space-around', textAlign: 'center'}}>
            <div>
              <div style={{fontSize: '24px', fontWeight: 'bold', color: '#667eea'}}>{stats.totalKinder}</div>
              <div style={{fontSize: '12px', color: '#666'}}>{translate('settings_children_count')}</div>
            </div>
            <div>
              <div style={{fontSize: '24px', fontWeight: 'bold', color: '#764ba2'}}>{stats.totalEvents}</div>
              <div style={{fontSize: '12px', color: '#666'}}>{translate('settings_events_count')}</div>
            </div>
            <div>
              <div style={{fontSize: '24px', fontWeight: 'bold', color: '#34c759'}}>{stats.storageUsed}</div>
              <div style={{fontSize: '12px', color: '#666'}}>{translate('settings_storage')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NOTFALL-MODUS BANNER */}
      {emergencyMode && (
        <Card style={{margin: '16px', background: '#ff3b30', color: 'white', border: '3px solid #ff9500'}}>
          <CardContent>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', fontWeight: 'bold'}}>
              <Icon f7="exclamationmark_triangle_fill" size="24px" />
              NOTFALL-MODUS AKTIV
              <Icon f7="exclamationmark_triangle_fill" size="24px" />
            </div>
            <div style={{marginTop: '8px', fontSize: '13px', opacity: 0.9}}>
              Große Buttons, schneller Zugriff auf Notfallkontakte
            </div>
          </CardContent>
        </Card>
      )}

      {/* 1. ALLGEMEIN */}
      <BlockTitle>{translate('settings_general')}</BlockTitle>
      <List strong inset dividersIos>
        <ListItem 
          title="Benachrichtigungen"
          onClick={(e) => {
            if (!e.target.classList.contains('toggle-icon')) {
              toggleNotifications({ target: { checked: !notifications } });
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          <Icon slot="media" f7="bell_fill" color="red" />
          <Toggle slot="after" checked={notifications} onChange={toggleNotifications} />
        </ListItem>

        <ListInput
          label="Erinnerung alle..."
          type="select"
          value={reminderInterval}
          onChange={updateReminderInterval}
        >
          <Icon slot="media" f7="alarm_fill" color="orange" />
          <option value="30">30 Minuten</option>
          <option value="60">1 Stunde</option>
          <option value="120">2 Stunden</option>
          <option value="180">3 Stunden</option>
          <option value="0">Aus</option>
        </ListInput>

        <ListInput
          label="Standard-Kind"
          type="select"
          value={defaultKind}
          onChange={updateDefaultKind}
        >
          <Icon slot="media" f7="person_crop_circle_fill" color="blue" />
          <option value="">Immer fragen</option>
          {JSON.parse(localStorage.getItem('sitterSafe_kinder') || '[]').map(kind => (
            <option key={kind.id} value={kind.id}>{kind.basis.name}</option>
          ))}
        </ListInput>
      </List>

      {/* 2. SICHERHEIT */}
      <BlockTitle>Sicherheit & Datenschutz</BlockTitle>
      <List strong inset dividersIos>
        <ListItem 
          title="FaceID für Medikamente" 
          footer="Schützt sensible Gesundheitsdaten"
          onClick={(e) => {
            if (!e.target.classList.contains('toggle-icon')) {
              toggleBiometrics({ target: { checked: !biometricRequired } });
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          <Icon slot="media" f7="lock_shield_fill" color="green" />
          <Toggle slot="after" checked={biometricRequired} onChange={toggleBiometrics} />
        </ListItem>

        <ListItem 
          title="Auto-Backup (Cloud)"
          footer="Täglich automatisch sichern"
          onClick={(e) => {
            if (!e.target.classList.contains('toggle-icon')) {
              toggleAutoBackup({ target: { checked: !autoBackup } });
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          <Icon slot="media" f7="cloud_upload_fill" color="blue" />
          <Toggle slot="after" checked={autoBackup} onChange={toggleAutoBackup} />
        </ListItem>
      </List>

      {/* 3. DARSTELLUNG & HAPTIK */}
      <BlockTitle>{translate('settings_appearance')}</BlockTitle>
      <List strong inset dividersIos>
        <ListInput
          label={translate('settings_language')}
          type="select"
          value={currentLanguage}
          onChange={changeLanguage}
        >
          <Icon slot="media" f7="globe" color="blue" />
          <option value="de">{translate('settings_language_german')}</option>
          <option value="en">{translate('settings_language_english')}</option>
        </ListInput>
        
        <ListItem>
          <div slot="inner" style={{width: '100%'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <Icon f7="paintbrush_fill" color={themeColor} />
                <span>{translate('settings_theme_color_label')}</span>
              </div>
              <input 
                type="color" 
                value={themeColor} 
                onChange={updateThemeColor}
                style={{width: '50px', height: '35px', border: 'none', borderRadius: '8px', cursor: 'pointer'}}
              />
            </div>
          </div>
        </ListItem>
        <ListItem 
          title="Nachtmodus (Dark Mode)"
          onClick={(e) => {
            if (!e.target.classList.contains('toggle-icon')) {
              toggleDarkMode({ target: { checked: !isDarkMode } });
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          <Icon slot="media" f7="moon_stars_fill" color="purple" />
          <Toggle slot="after" checked={isDarkMode} onChange={toggleDarkMode} />
        </ListItem>
        
        <ListItem 
          title="Vibrationen"
          onClick={(e) => {
            if (!e.target.classList.contains('toggle-icon')) {
              toggleHaptics({ target: { checked: !hapticsEnabled } });
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          <Icon slot="media" f7="hand_tap_fill" color="orange" />
          <Toggle slot="after" checked={hapticsEnabled} onChange={toggleHaptics} />
        </ListItem>

        <ListItem 
          title="Soundeffekte"
          onClick={(e) => {
            if (!e.target.classList.contains('toggle-icon')) {
              toggleSound({ target: { checked: !soundEnabled } });
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          <Icon slot="media" f7="speaker_wave_3_fill" color="pink" />
          <Toggle slot="after" checked={soundEnabled} onChange={toggleSound} />
        </ListItem>
      </List>

      {/* 3B. NOTFALL-MODUS */}
      <BlockTitle>Sicherheit</BlockTitle>
      <List strong inset dividersIos>
        <ListItem 
          title="Notfall-Modus"
          footer="Große Buttons, vereinfachte Oberfläche"
          onClick={(e) => {
            if (!e.target.classList.contains('toggle-icon')) {
              toggleEmergencyMode({ target: { checked: !emergencyMode } });
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          <Icon slot="media" f7="exclamationmark_triangle_fill" color="red" />
          <Toggle slot="after" checked={emergencyMode} onChange={toggleEmergencyMode} />
        </ListItem>
      </List>

      {/* 4. DATEN MANAGEMENT */}
      <BlockTitle>Datenverwaltung</BlockTitle>
      <List strong inset dividersIos>
        <ListInput
          label="Protokolle löschen nach..."
          type="select"
          value={autoDeleteDays}
          onChange={updateAutoDeleteDays}
          footer="Automatische Bereinigung alter Einträge"
        >
          <Icon slot="media" f7="calendar_badge_minus" color="orange" />
          <option value="0">Nie löschen</option>
          <option value="7">7 Tage</option>
          <option value="14">14 Tage</option>
          <option value="30">30 Tage</option>
          <option value="90">90 Tage</option>
        </ListInput>
        <ListItem 
          link="#" 
          title="Daten exportieren"
          footer={`Letztes Backup: ${lastBackupDate}`}
          onClick={exportData}
        >
          <Icon slot="media" f7="arrow_down_doc_fill" color="blue" />
        </ListItem>

        <ListItem 
          link="#" 
          title="Daten importieren"
          footer="JSON-Datei wiederherstellen"
          onClick={importData}
        >
          <Icon slot="media" f7="arrow_up_doc_fill" color="green" />
        </ListItem>

        <ListItem 
          link="#" 
          title="Cloud-Backup erstellen"
          footer="In Supabase speichern"
          onClick={cloudBackup}
        >
          <Icon slot="media" f7="cloud_upload_fill" color="purple" />
        </ListItem>

        <ListItem 
          link="#" 
          title="Cloud-Backup wiederherstellen"
          footer="Aus Supabase laden"
          onClick={cloudRestore}
        >
          <Icon slot="media" f7="cloud_download_fill" color="purple" />
        </ListItem>

        <ListItem 
          link="#" 
          title="Cloud-Backups anzeigen"
          footer="Alle verfügbaren Backups"
          onClick={showCloudBackups}
        >
          <Icon slot="media" f7="list_bullet_below_rectangle" color="purple" />
        </ListItem>

        <ListItem 
          link="#" 
          title="Cloud-Backups verwalten"
          footer="Alte Backups löschen"
          onClick={manageCloudBackups}
        >
          <Icon slot="media" f7="trash_slash_fill" color="orange" />
        </ListItem>

        <ListItem 
          link="#" 
          title="Cache leeren"
          onClick={clearCache}
        >
          <Icon slot="media" f7="trash_circle_fill" color="orange" />
        </ListItem>

        <ListItem 
          title="Abmelden" 
          link="#" 
          onClick={async () => {
            f7.dialog.confirm(
              'Möchtest du dich wirklich abmelden?',
              'Abmelden',
              async () => {
                f7.preloader.show();
                const result = await logout(f7.views.main.router);
                f7.preloader.hide();
                if (result.success) {
                  f7.toast.show({
                    text: '✅ Erfolgreich abgemeldet',
                    position: 'center',
                    closeTimeout: 2000
                  });
                } else {
                  f7.dialog.alert(result.error, 'Fehler beim Abmelden');
                }
              }
            );
          }}
          textColor="orange"
        >
          <Icon slot="media" f7="arrow_right_square" color="orange" />
        </ListItem>

        <ListItem 
          title="App zurücksetzen" 
          link="#" 
          onClick={resetApp}
          textColor="red"
        >
          <Icon slot="media" f7="exclamationmark_triangle_fill" color="red" />
        </ListItem>
      </List>

      {/* 5. HILFE & INFO */}
      <BlockTitle>Support & Infos</BlockTitle>
      <List strong inset dividersIos>
        <ListItem link="#" title="Feedback senden" onClick={sendFeedback}>
          <Icon slot="media" f7="envelope_fill" color="green" />
        </ListItem>
        
        <ListItem link="#" title="Datenschutzerklärung" onClick={showPrivacy}>
          <Icon slot="media" f7="doc_text_fill" color="gray" />
        </ListItem>

        <ListItem 
          link="#" 
          title="System-Informationen"
          onClick={showSystemInfo}
        >
          <Icon slot="media" f7="gear_alt_fill" color="gray" />
        </ListItem>
      </List>

      <Block strong inset style={{textAlign: 'center', color: 'gray', marginTop: '30px', marginBottom: '120px'}}>
        <div style={{fontSize: '14px', fontWeight: 'bold', marginBottom: '8px'}}>SitterSafe v1.2.0</div>
        <div style={{fontSize: '12px', opacity: 0.7}}>Build 2026.02.08</div>
        <div style={{fontSize: '12px', marginTop: '12px'}}>Made with ❤️ for safe babysitting</div>
      </Block>

      {/* FAB für schnellen Export */}
      <Fab position="right-bottom" slot="fixed" color="blue" onClick={exportData}>
        <Icon f7="arrow_down_to_line" />
      </Fab>
    </Page>
  );
};

export default SettingsPage;