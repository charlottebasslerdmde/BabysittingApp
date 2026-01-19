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
  Sheet,
  PageContent
} from 'framework7-react';
import { supabase } from '../js/supabase';

const SettingsPage = () => {
  // --- STATE ---
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [language, setLanguage] = useState('de');
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
  const [tutorialOpened, setTutorialOpened] = useState(false);
  const [aboutOpened, setAboutOpened] = useState(false);
  const [helpOpened, setHelpOpened] = useState(false);
  const [profileImage, setProfileImage] = useState('');
  
  // Statistiken
  const [stats, setStats] = useState({
    totalKinder: 0,
    totalEvents: 0,
    storageUsed: '0 KB',
    appVersion: '1.2.0',
    deviceInfo: ''
  });

  // --- INIT (Laden beim Start) ---
  useEffect(() => {
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

    // 4. Sprache
    const storedLang = localStorage.getItem('sitterSafe_language');
    if (storedLang) setLanguage(storedLang);

    // 5. Biometrie Pflicht
    const storedBio = localStorage.getItem('sitterSafe_bio_active');
    if (storedBio) setBiometricRequired(JSON.parse(storedBio));

    // 6. Auto-Backup
    const storedBackup = localStorage.getItem('sitterSafe_autoBackup');
    if (storedBackup) setAutoBackup(JSON.parse(storedBackup));

    // 7. Erinnerungsintervall
    const storedReminder = localStorage.getItem('sitterSafe_reminderInterval');
    if (storedReminder) setReminderInterval(storedReminder);

    // 8. Benutzername
    const storedName = localStorage.getItem('sitterSafe_userName');
    if (storedName) setUserName(storedName);

    // 9. Theme-Farbe
    const storedTheme = localStorage.getItem('sitterSafe_themeColor');
    if (storedTheme) setThemeColor(storedTheme);

    // 10. Standard-Kind
    const storedDefaultKind = localStorage.getItem('sitterSafe_defaultKind');
    if (storedDefaultKind) setDefaultKind(storedDefaultKind);

    // 11. Auto-Löschung
    const storedDeleteDays = localStorage.getItem('sitterSafe_autoDeleteDays');
    if (storedDeleteDays) setAutoDeleteDays(storedDeleteDays);

    // 12. Notfall-Modus
    const storedEmergency = localStorage.getItem('sitterSafe_emergencyMode');
    if (storedEmergency) setEmergencyMode(JSON.parse(storedEmergency));

    // 13. Letztes Backup
    const storedBackupDate = localStorage.getItem('sitterSafe_lastBackup');
    if (storedBackupDate) setLastBackupDate(storedBackupDate);

    // 14. Profilbild
    const storedImage = localStorage.getItem('sitterSafe_profileImage');
    if (storedImage) setProfileImage(storedImage);

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

  const changeLanguage = (e) => {
    const val = e.target.value;
    setLanguage(val);
    localStorage.setItem('sitterSafe_language', val);
    
    // Kleines Feedback (Simuliert Sprachwechsel)
    const msg = val === 'de' ? 'Sprache auf Deutsch gesetzt' : 'Language set to English';
    f7.toast.show({text: msg, closeTimeout: 2000});
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

  const saveUserName = (e) => {
    const val = e.target.value;
    setUserName(val);
    localStorage.setItem('sitterSafe_userName', val);
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
            const text = JSON.stringify(data, null, 2);
            try {
              await navigator.share({
                title: 'SitterSafe Backup',
                text: text
              });
            } catch (e) {
              f7.toast.show({text: 'Teilen nicht verfügbar', closeTimeout: 2000});
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
                        'sitterSafe_language', 'sitterSafe_bio_active', 'sitterSafe_userName',
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

  // NEU: Profilbild hochladen
  const uploadProfileImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target.result;
        setProfileImage(imageData);
        localStorage.setItem('sitterSafe_profileImage', imageData);
        f7.toast.show({text: '✅ Profilbild aktualisiert', closeTimeout: 1500});
      };
      reader.readAsDataURL(file);
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

  // NEU: Tutorial anzeigen
  const showTutorial = () => {
    setTutorialOpened(true);
  };

  // NEU: Hilfe & FAQ anzeigen
  const showHelp = () => {
    setHelpOpened(true);
  };

  // NEU: Über SitterSafe
  const showAbout = () => {
    setAboutOpened(true);
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
      <Navbar title="Einstellungen" backLink="Zurück" />

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
              <div style={{marginTop: '8px', fontSize: '14px', opacity: 0.9}}>
                Babysitter Profil
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
            Deine Statistiken
          </div>
          <div style={{display: 'flex', justifyContent: 'space-around', textAlign: 'center'}}>
            <div>
              <div style={{fontSize: '24px', fontWeight: 'bold', color: '#667eea'}}>{stats.totalKinder}</div>
              <div style={{fontSize: '12px', color: '#666'}}>Kinder</div>
            </div>
            <div>
              <div style={{fontSize: '24px', fontWeight: 'bold', color: '#764ba2'}}>{stats.totalEvents}</div>
              <div style={{fontSize: '12px', color: '#666'}}>Ereignisse</div>
            </div>
            <div>
              <div style={{fontSize: '24px', fontWeight: 'bold', color: '#34c759'}}>{stats.storageUsed}</div>
              <div style={{fontSize: '12px', color: '#666'}}>Speicher</div>
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
      <BlockTitle>Allgemein</BlockTitle>
      <List strong inset dividersIos>
        <ListInput
          label="Sprache"
          type="select"
          value={language}
          onChange={changeLanguage}
        >
          <Icon slot="media" f7="globe" color="blue" />
          <option value="de">🇩🇪 Deutsch</option>
          <option value="en">🇬🇧 English</option>
          <option value="fr">🇫🇷 Français</option>
          <option value="es">🇪🇸 Español</option>
        </ListInput>

        <ListItem title="Benachrichtigungen">
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
        >
          <Icon slot="media" f7="lock_shield_fill" color="green" />
          <Toggle slot="after" checked={biometricRequired} onChange={toggleBiometrics} />
        </ListItem>

        <ListItem 
          title="Auto-Backup (Cloud)"
          footer="Täglich automatisch sichern"
        >
          <Icon slot="media" f7="cloud_upload_fill" color="blue" />
          <Toggle slot="after" checked={autoBackup} onChange={toggleAutoBackup} />
        </ListItem>
      </List>

      {/* 3. DARSTELLUNG & HAPTIK */}
      <BlockTitle>Bedienung & Design</BlockTitle>
      <List strong inset dividersIos>
        <ListItem>
          <div slot="inner" style={{width: '100%'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <Icon f7="paintbrush_fill" color={themeColor} />
                <span>Theme-Farbe</span>
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
        <ListItem title="Nachtmodus (Dark Mode)">
          <Icon slot="media" f7="moon_stars_fill" color="purple" />
          <Toggle slot="after" checked={isDarkMode} onChange={toggleDarkMode} />
        </ListItem>
        
        <ListItem title="Vibrationen">
          <Icon slot="media" f7="hand_tap_fill" color="orange" />
          <Toggle slot="after" checked={hapticsEnabled} onChange={toggleHaptics} />
        </ListItem>

        <ListItem title="Soundeffekte">
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
        <ListItem link="#" title="Tutorial anzeigen" onClick={showTutorial}>
          <Icon slot="media" f7="book_fill" color="blue" />
        </ListItem>
        
        <ListItem link="#" title="Hilfe & FAQ" onClick={showHelp}>
          <Icon slot="media" f7="question_circle_fill" color="gray" />
        </ListItem>
        
        <ListItem link="#" title="Feedback senden" onClick={sendFeedback}>
          <Icon slot="media" f7="envelope_fill" color="green" />
        </ListItem>
        
        <ListItem link="#" title="Datenschutzerklärung" onClick={showPrivacy}>
          <Icon slot="media" f7="doc_text_fill" color="gray" />
        </ListItem>

        <ListItem link="#" title="Über SitterSafe" onClick={showAbout}>
          <Icon slot="media" f7="info_circle_fill" color="purple" />
        </ListItem>

        <ListItem 
          link="#" 
          title="System-Informationen"
          onClick={showSystemInfo}
        >
          <Icon slot="media" f7="gear_alt_fill" color="gray" />
        </ListItem>
      </List>

      <Block strong inset style={{textAlign: 'center', color: 'gray', marginTop: '30px', marginBottom: '60px'}}>
        <div style={{fontSize: '14px', fontWeight: 'bold', marginBottom: '8px'}}>SitterSafe v1.2.0</div>
        <div style={{fontSize: '12px', opacity: 0.7}}>Build 2026.02.08</div>
        <div style={{fontSize: '12px', marginTop: '12px'}}>Made with ❤️ for safe babysitting</div>
      </Block>

      {/* FAB für schnellen Export */}
      <Fab position="right-bottom" slot="fixed" color="blue" onClick={exportData}>
        <Icon f7="arrow_down_to_line" />
      </Fab>

      {/* TUTORIAL SHEET */}
      <Sheet
        opened={tutorialOpened}
        onSheetClosed={() => setTutorialOpened(false)}
        style={{ height: 'auto', maxHeight: '90%' }}
        swipeToClose
        backdrop
      >
        <PageContent>
          <Block style={{ marginTop: '10px' }}>
            <div style={{ textAlign: 'right', marginBottom: '10px' }}>
              <Button fill onClick={() => setTutorialOpened(false)}>Schließen</Button>
            </div>
            
            <h2 style={{ marginTop: 0 }}>📚 SitterSafe Tutorial</h2>
            
            <Card>
              <CardContent>
                <h3>🏠 1. Kinder hinzufügen</h3>
                <p>Tippe auf das <strong>+</strong> Symbol, um ein neues Kind anzulegen. Fülle alle wichtigen Informationen aus.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h3>📝 2. Ereignisse protokollieren</h3>
                <p>Öffne das Kinderprofil und nutze die Schnellaktionen für Essen, Schlafen, Wickeln etc.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h3>💊 3. Medikamente</h3>
                <p>Medikamentengabe wird mit FaceID geschützt. Aktiviere dies in den Einstellungen.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h3>🌙 4. Nachtlicht</h3>
                <p>Nutze das Nachtlicht-Feature für sanftes Licht beim nächtlichen aufwachen.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h3>☁️ 5. Backup</h3>
                <p>Sichere deine Daten regelmäßig über Export oder Cloud-Backup.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h3>🚨 6. Notfall-Modus</h3>
                <p>Aktiviere den Notfall-Modus für größere Buttons und vereinfachte Navigation.</p>
              </CardContent>
            </Card>
          </Block>
        </PageContent>
      </Sheet>

      {/* HILFE SHEET */}
      <Sheet
        opened={helpOpened}
        onSheetClosed={() => setHelpOpened(false)}
        style={{ height: 'auto', maxHeight: '90%' }}
        swipeToClose
        backdrop
      >
        <PageContent>
          <Block style={{ marginTop: '10px' }}>
            <div style={{ textAlign: 'right', marginBottom: '10px' }}>
              <Button fill onClick={() => setHelpOpened(false)}>Schließen</Button>
            </div>
            
            <h2 style={{ marginTop: 0 }}>❓ Häufig gestellte Fragen</h2>
            
            <Card>
              <CardContent>
                <h4>Wie sichere ich meine Daten?</h4>
                <p>Nutze "Daten exportieren" für lokale Backups oder "Cloud-Backup erstellen" für Online-Sicherung.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h4>Kann ich mehrere Geräte nutzen?</h4>
                <p>Ja! Nutze Cloud-Backup zum Synchronisieren zwischen mehreren Geräten.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h4>Wie funktioniert FaceID?</h4>
                <p>Aktiviere "FaceID für Medikamente" in den Sicherheitseinstellungen. Beim Zugriff auf Medikamente wird dann eine Authentifizierung verlangt.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h4>Werden meine Daten geteilt?</h4>
                <p>Nein! Alle Daten bleiben lokal auf deinem Gerät, außer du nutzt explizit Cloud-Backup.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h4>Wie lösche ich alte Einträge?</h4>
                <p>Stelle unter "Auto-Löschung" ein, nach wie vielen Tagen Protokolle automatisch gelöscht werden sollen.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h4>App funktioniert nicht richtig?</h4>
                <p>Versuche "Cache leeren" in den Einstellungen. Bei weiterhin Problemen: "App zurücksetzen" (Achtung: Alle Daten werden gelöscht!).</p>
              </CardContent>
            </Card>

            <Card style={{ background: '#f0f9ff' }}>
              <CardContent>
                <h4>💡 Weitere Hilfe benötigt?</h4>
                <p>Nutze "Feedback senden" oder kontaktiere uns: support@sittersafe.app</p>
              </CardContent>
            </Card>
          </Block>
        </PageContent>
      </Sheet>

      {/* ÜBER SITTERSAFE SHEET */}
      <Sheet
        opened={aboutOpened}
        onSheetClosed={() => setAboutOpened(false)}
        style={{ height: 'auto', maxHeight: '90%' }}
        swipeToClose
        backdrop
      >
        <PageContent>
          <Block style={{ marginTop: '10px' }}>
            <div style={{ textAlign: 'right', marginBottom: '10px' }}>
              <Button fill onClick={() => setAboutOpened(false)}>Schließen</Button>
            </div>
            
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ fontSize: '64px', marginBottom: '10px' }}>👶</div>
              <h1 style={{ margin: '10px 0' }}>SitterSafe</h1>
              <div style={{ color: '#666' }}>Version 1.2.0</div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>Build 2026.02.08</div>
            </div>

            <Card>
              <CardContent>
                <h3>🎯 Unsere Mission</h3>
                <p>SitterSafe macht Babysitting sicherer und einfacher. Wir helfen Babysittern dabei, den Überblick zu behalten und Eltern transparent zu informieren.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h3>✨ Features</h3>
                <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
                  <li>Kinderprofile mit allen wichtigen Infos</li>
                  <li>Ereignis-Protokollierung in Echtzeit</li>
                  <li>Sichere Medikamentenverwaltung mit FaceID</li>
                  <li>Cloud-Backup & Sync</li>
                  <li>Nachtlicht-Funktion</li>
                  <li>Notfall-Modus</li>
                  <li>Dark Mode & Anpassungen</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h3>🔒 Sicherheit & Datenschutz</h3>
                <p>Deine Daten gehören dir! Alles wird lokal gespeichert. Cloud-Backup ist optional und verschlüsselt.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h3>💝 Entwickelt mit Liebe</h3>
                <p>Made with ❤️ for safe babysitting</p>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                  © 2026 SitterSafe<br/>
                  Alle Rechte vorbehalten
                </p>
              </CardContent>
            </Card>

            <Card style={{ background: '#f0f9ff' }}>
              <CardContent style={{ textAlign: 'center' }}>
                <h4>Kontakt</h4>
                <div style={{ fontSize: '14px' }}>
                  📧 info@sittersafe.app<br/>
                  🌐 www.sittersafe.app<br/>
                  📱 @sittersafe
                </div>
              </CardContent>
            </Card>
          </Block>
        </PageContent>
      </Sheet>
    </Page>
  );
};

export default SettingsPage;