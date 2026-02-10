import React, { useState, useEffect } from 'react';
import { Share } from '@capacitor/share'; 
// import { supabase } from '../js/supabase'; // DEAKTIVIERT: Supabase für lokale Entwicklung
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
    mood: ''
  });

  // 5. Undo-Funktion
  const [lastDeleted, setLastDeleted] = useState(null);
  
  // 6. PWA Install Prompt
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // --- EFFEKTE (Laden beim Start) ---

  useEffect(() => {
    // A) Fact of the Day laden
    loadDailyFact();

    // B) Hausdaten laden (LocalStorage)
    const savedHouseData = localStorage.getItem('sitterSafe_household');
    if (savedHouseData) setHouseholdData(JSON.parse(savedHouseData));

    // C) Kinder laden (Supabase + LocalStorage)
    loadKinderData();

    // D) EventLog laden (Persistierung)
    const savedEventLog = localStorage.getItem('sitterSafe_eventLog');
    if (savedEventLog) {
      try {
        setEventLog(JSON.parse(savedEventLog));
      } catch (e) {
        console.error("Fehler beim Laden des EventLogs", e);
      }
    }

    // E) ShiftData laden (aktuelle Schicht)
    const savedShiftData = localStorage.getItem('sitterSafe_shiftData');
    if (savedShiftData) {
      try {
        setShiftData(JSON.parse(savedShiftData));
      } catch (e) {
        console.error("Fehler beim Laden der ShiftData", e);
      }
    }
    
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
    // LocalStorage als primäre Datenquelle (Offline-First)
    const local = localStorage.getItem('sitterSafe_kinder');
    if (local) {
      setKinder(JSON.parse(local));
    } else {
      setKinder([]); // Leeres Array wenn noch keine Kinder angelegt
    }

    // Cloud-Sync deaktiviert für lokale Entwicklung
    // Aktiviere Supabase später in Produktion wenn benötigt
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
    f7.toast.show({ text: `${activity} gespeichert`, closeTimeout: 1000, position: 'center', cssClass: 'toast-success' });
  };

  const openActivityDetail = (type) => {
    const configs = {
      essen: { title: 'Essen', icon: '🍼', details: { was: '', menge: '', notizen: '' } },
      schlaf: { title: 'Schlaf', icon: '😴', details: { von: '', bis: '', qualitaet: '' } },
      windel: { title: 'Windel', icon: '💩', details: { art: 'nass', notizen: '' } },
      spiel: { title: 'Spielzeit', icon: '🧸', details: { aktivitaet: '', dauer: '', notizen: '' } }
    };
    setActivitySheet({ 
      opened: true, 
      type, 
      ...configs[type],
      selectedKind: kinder.length === 1 ? kinder[0].id : null,
      mood: '😊'
    });
  };

  const saveActivityDetail = () => {
    const { type, title, icon, details, selectedKind, mood } = activitySheet;
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
    
    const newEvent = { 
      id: Date.now(), 
      time: timeString, 
      activity: activityText, 
      icon: iconMap[type], 
      color: colorMap[type],
      details,
      kindId: selectedKind,
      mood
    };
    setEventLog([newEvent, ...eventLog]);
    setActivitySheet({ ...activitySheet, opened: false });
    f7.toast.show({ text: `${title} gespeichert ${mood}`, closeTimeout: 1500, position: 'center' });
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
      text: 'Gelöscht', 
      closeTimeout: 3000, 
      position: 'center',
      closeButton: true,
      closeButtonText: 'Rückgängig',
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
      f7.toast.show({ text: 'Nichts zu teilen!', closeTimeout: 2000 });
      return;
    }
    const reportText = eventLog.map(e => `⏰ ${e.time}: ${e.activity}`).join('\n');
    const footer = "\n\nGesendet mit SitterSafe 🛡️";
    
    try {
      // Capacitor Share API (für native Apps)
      if (typeof Share !== 'undefined' && Share.share) {
        await Share.share({
          title: 'SitterSafe Protokoll',
          text: `Protokoll von heute:\n\n${reportText}${footer}`,
          dialogTitle: 'Teilen via',
        });
      }
      // Web Share API (Browser Fallback)
      else if (navigator.share) {
        await navigator.share({
          title: 'SitterSafe Protokoll',
          text: `Protokoll von heute:\n\n${reportText}${footer}`,
        });
      }
      // Fallback: Text kopieren
      else {
        await navigator.clipboard.writeText(`Protokoll von heute:\n\n${reportText}${footer}`);
        f7.toast.show({ text: '📋 In Zwischenablage kopiert', closeTimeout: 2000 });
      }
    } catch (e) { 
      if (e.name !== 'AbortError') {
        console.log('Share-Fehler:', e);
        f7.toast.show({ text: 'Teilen fehlgeschlagen', closeTimeout: 2000 });
      }
    }
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
              <li>Tippe auf das <b>Teilen-Symbol</b> <span style="font-size: 20px;">⎋</span> unten</li>
              <li>Scrolle und wähle <b>"Zum Home-Bildschirm"</b></li>
              <li>Tippe auf <b>"Hinzufügen"</b></li>
            </ol>
            <p>Danach kannst du SitterSafe wie eine normale App öffnen! 🎉</p>
          </div>`,
          'Installation'
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
      text: 'Du kannst die App jederzeit über die Browser-Einstellungen installieren', 
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
      <Navbar large>
        <NavLeft>
          <Link iconIos="f7:gear_alt_fill" iconMd="material:settings" href="/settings/" />
        </NavLeft>
        <NavTitle sliding>SitterSafe</NavTitle>
        <NavRight>
          <Link iconIos="f7:exclamationmark_shield_fill" iconMd="material:security" iconColor="red" onClick={() => setSheetOpened(true)} />
        </NavRight>
      </Navbar>

      <Toolbar tabbar labels bottom>
        <Link tabLink="#tab-tracker" tabLinkActive iconIos="f7:clock_fill" iconMd="material:schedule" text="Tracker" />
        <Link tabLink="#tab-kinder" iconIos="f7:person_2_fill" iconMd="material:people" text="Kinder" />
        <Link tabLink="#tab-fotos" iconIos="f7:camera_fill" iconMd="material:camera_alt" text="Fotos" />
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
                      App installieren
                    </div>
                    <div style={{ fontSize: '13px', opacity: 0.95 }}>
                      Zum Home-Screen hinzufügen für schnelleren Zugriff
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
                      Installieren
                    </Button>
                    <Button 
                      small
                      onClick={dismissInstallBanner}
                      style={{ 
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white'
                      }}
                    >
                      Später
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {showFact && (
            <Card outline className="no-shadow" style={{marginTop: showInstallBanner ? '16px' : '8px'}}>
              <CardHeader>
                <div><Icon icon="f7:lightbulb_fill" color="yellow" size="20"/> Wusstest du?</div>
                <Link icon="f7:multiply" onClick={() => setShowFact(false)} />
              </CardHeader>
              <CardContent>{dailyFact}</CardContent>
            </Card>
          )}

          {/* Tages-Statistik */}
          {eventLog.length > 0 && (
            <Card style={{margin: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white'}}>
              <CardContent>
                <div style={{fontWeight: 'bold', marginBottom: '12px', fontSize: '16px'}}>📊 Heute</div>
                <div style={{display: 'flex', justifyContent: 'space-around', fontSize: '14px'}}>
                  <div style={{textAlign: 'center'}}>
                    <div style={{fontSize: '24px', fontWeight: 'bold'}}>{getStatistics().essen}</div>
                    <div>🍼 Essen</div>
                  </div>
                  <div style={{textAlign: 'center'}}>
                    <div style={{fontSize: '24px', fontWeight: 'bold'}}>{getStatistics().schlaf}</div>
                    <div>😴 Schlaf</div>
                  </div>
                  <div style={{textAlign: 'center'}}>
                    <div style={{fontSize: '24px', fontWeight: 'bold'}}>{getStatistics().windel}</div>
                    <div>💩 Windel</div>
                  </div>
                  <div style={{textAlign: 'center'}}>
                    <div style={{fontSize: '24px', fontWeight: 'bold'}}>{getStatistics().spiel}</div>
                    <div>🧸 Spiel</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <BlockTitle>Aktivität erfassen</BlockTitle>
          <div className="grid grid-cols-2 grid-gap padding-horizontal">
            <div onClick={() => openActivityDetail('essen')} style={{
              textAlign:'center', padding:'20px', cursor: 'pointer',
              background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s', border: '2px solid #007aff'
            }} onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'} onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              <div style={{fontSize:'40px'}}>🍼</div>
              <div style={{fontWeight:'bold', color: '#007aff'}}>Essen</div>
            </div>
            
            <div onClick={() => openActivityDetail('schlaf')} style={{
              textAlign:'center', padding:'20px', cursor: 'pointer',
              background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s', border: '2px solid #ff9500'
            }} onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'} onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              <div style={{fontSize:'40px'}}>😴</div>
              <div style={{fontWeight:'bold', color: '#ff9500'}}>Schlaf</div>
            </div>
            
            <div onClick={() => openActivityDetail('windel')} style={{
              textAlign:'center', padding:'20px', cursor: 'pointer',
              background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s', border: '2px solid #34c759'
            }} onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'} onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              <div style={{fontSize:'40px'}}>💩</div>
              <div style={{fontWeight:'bold', color: '#34c759'}}>Windel</div>
            </div>
            
            <div onClick={() => openActivityDetail('spiel')} style={{
              textAlign:'center', padding:'20px', cursor: 'pointer',
              background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s', border: '2px solid #af52de'
            }} onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'} onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              <div style={{fontSize:'40px'}}>🧸</div>
              <div style={{fontWeight:'bold', color: '#af52de'}}>Spiel</div>
            </div>
          </div>

          <Block style={{marginTop: '16px', marginBottom: '0'}}>
             <Button fill color="yellow" textColor="black" href="/nightlight/" round>
               <Icon f7="lightbulb_fill" size="18px" style={{marginRight: '8px'}}/>
               Nachtlicht einschalten
             </Button>
          </Block>
          
          <BlockTitle>Heutiges Protokoll</BlockTitle>
          <List mediaList inset>
            {eventLog.length === 0 ? (
              <ListItem title="Noch keine Aktivitäten heute" footer="Tippe oben auf ein Icon" />
            ) : (
              eventLog.map((log) => (
                <ListItem key={log.id} title={log.activity} after={log.time} swipeout>
                  <div slot="media" style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                    <Icon iconIos={`f7:${log.icon}`} color={log.color} />
                    <span style={{fontSize: '20px'}}>{log.mood || ''}</span>
                  </div>
                  <SwipeoutActions right>
                    <SwipeoutButton delete onClick={() => deleteEvent(log.id)}>Löschen</SwipeoutButton>
                  </SwipeoutActions>
                </ListItem>
              ))
            )}
          </List>

          <Block>
            <Button fill large raised color="green" onClick={shareProtocol}>
              <Icon f7="square_arrow_up" className="margin-right" />
              Protokoll teilen
            </Button>
          </Block>
        </Tab>


        {/* TAB 2: KINDER PROFILE (JETZT DYNAMISCH) */}
        <Tab id="tab-kinder" className="page-content">
          <BlockTitle>Betreute Kinder</BlockTitle>
          <List mediaList>
            {kinder.length === 0 ? (
              <ListItem title="Keine Profile gefunden" footer="Erstelle dein erstes Kind-Profil" />
            ) : (
              kinder.map((kind) => (
                <ListItem
                  key={kind.id}
                  link={`/kind/${kind.id}/`} // Linkt zur Detailseite
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
            padding: '30px 0'
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
          <BlockTitle>Moment festhalten</BlockTitle>
          <Block>
            <Card className="demo-card-header-pic">
              <CardContent>
                <div style={{textAlign: 'center', padding: '20px'}}>
                  <Icon icon="f7:camera_fill" size="50" color="gray" style={{marginBottom: '10px'}}/>
                  <p>Teile besondere Momente sicher mit den Eltern.</p>
                  <Button fill large round className="file-input-wrapper">
                    Kamera öffnen
                    <input type="file" accept="image/*" capture="camera" style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', opacity:0}} />
                  </Button>
                </div>
              </CardContent>
              <CardFooter><span>Fotos werden nicht lokal gespeichert.</span></CardFooter>
            </Card>
          </Block>
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
              <span style={{fontSize: '24px'}}>🛡️</span> Sicherheits-Center
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
              Fertig
            </Button>
          </div>

          <PageContent style={{flex: 1, overflow: 'auto'}}>
            <BlockTitle>🚨 Im Notfall</BlockTitle>
            <Block className="no-margin-bottom">
              <Button large fill color="red" href="tel:112" external raised className="margin-bottom" style={{borderRadius: '12px', fontWeight: 'bold', fontSize: '18px'}}>
                <Icon icon="f7:phone_fill" className="margin-right" /> NOTRUF 112
              </Button>
              <div style={{marginBottom: '12px', padding: '12px', background: '#fff3cd', borderRadius: '8px', fontSize: '13px', color: '#856404', border: '1px solid #ffeaa7'}}>
                💡 <b>Tipp:</b> Trage unten die Telefonnummern der Eltern ein, damit du sie schnell anrufen kannst!
              </div>
              <div className="grid grid-cols-2 grid-gap">
                <Button large fill color="green" href={`tel:${householdData.parent1Phone}`} external disabled={!householdData.parent1Phone} style={{borderRadius: '12px', opacity: householdData.parent1Phone ? 1 : 0.5}}>
                  <Icon f7="phone_fill" style={{marginRight: '4px'}} />
                  {householdData.parent1Name || 'Elternteil 1'}
                </Button>
                <Button large fill color="green" href={`tel:${householdData.parent2Phone}`} external disabled={!householdData.parent2Phone} style={{borderRadius: '12px', opacity: householdData.parent2Phone ? 1 : 0.5}}>
                  <Icon f7="phone_fill" style={{marginRight: '4px'}} />
                  {householdData.parent2Name || 'Elternteil 2'}
                </Button>
              </div>
            </Block>

            <BlockTitle>📍 Unser Standort</BlockTitle>
            <Card className="no-margin" style={{borderRadius: '12px', overflow: 'hidden'}}>
              <CardContent padding={false}>
                <List noHairlinesMd form>
                  <ListInput
                    type="textarea"
                    placeholder="📍 Adresse eingeben (für Notfälle wichtig)..."
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

            <BlockTitle>🌙 Heute Abend</BlockTitle>
            <List inset strong style={{borderRadius: '12px'}}>
              <ListInput 
                label="Rückkehr um:" 
                type="time" 
                value={shiftData.returnTime} 
                onInput={(e) => setShiftData({...shiftData, returnTime: e.target.value})}
              >
                <Icon slot="media" f7="clock_fill" color="orange" />
              </ListInput>
              <ListInput 
                label="Eltern sind:" 
                type="text" 
                placeholder="z.B. Restaurant, Kino..."
                value={shiftData.parentsLocation} 
                onInput={(e) => setShiftData({...shiftData, parentsLocation: e.target.value})}
                clearButton
              >
                <Icon slot="media" f7="location_fill" color="purple" />
              </ListInput>
              <ListInput 
                label="Notizen:" 
                type="textarea" 
                placeholder="Besondere Hinweise für heute..."
                value={shiftData.notes} 
                onInput={(e) => setShiftData({...shiftData, notes: e.target.value})} 
                resizable
              >
                <Icon slot="media" f7="doc_text_fill" color="gray" />
              </ListInput>
            </List>

            <BlockTitle>🏠 Haus & Wifi</BlockTitle>
            <List inset strong accordionList>
              <ListItem accordionItem title="📞 Notfall-Kontakte bearbeiten" style={{background: '#e8f5e9'}}>
                <Icon slot="media" f7="person_2_fill" color="green" />
                <div className="accordion-item-content">
                  <List noHairlinesMd>
                    <ListInput 
                      label="Name Elternteil 1" 
                      type="text"
                      placeholder="z.B. Mama, Papa..."
                      value={householdData.parent1Name} 
                      onInput={(e) => updateHouseholdData('parent1Name', e.target.value)}
                      clearButton
                    />
                    <ListInput 
                      label="Telefon 1" 
                      type="tel" 
                      placeholder="+49..."
                      value={householdData.parent1Phone} 
                      onInput={(e) => updateHouseholdData('parent1Phone', e.target.value)}
                      clearButton
                    />
                    <ListInput 
                      label="Name Elternteil 2" 
                      type="text"
                      placeholder="z.B. Mama, Papa..."
                      value={householdData.parent2Name} 
                      onInput={(e) => updateHouseholdData('parent2Name', e.target.value)}
                      clearButton
                    />
                    <ListInput 
                      label="Telefon 2" 
                      type="tel" 
                      placeholder="+49..."
                      value={householdData.parent2Phone} 
                      onInput={(e) => updateHouseholdData('parent2Phone', e.target.value)}
                      clearButton
                    />
                  </List>
                </div>
              </ListItem>
              <ListItem accordionItem title="📡 WLAN Zugangsdaten">
                <Icon slot="media" f7="wifi" color="blue" />
                <div className="accordion-item-content">
                  <List noHairlinesMd>
                    <ListInput 
                      label="WLAN Name" 
                      type="text" 
                      placeholder="Netzwerkname..."
                      value={householdData.wifiName} 
                      onInput={(e) => updateHouseholdData('wifiName', e.target.value)}
                      clearButton
                    />
                    <ListInput 
                      label="Passwort" 
                      type="text" 
                      placeholder="WLAN-Passwort..."
                      value={householdData.wifiPass} 
                      onInput={(e) => updateHouseholdData('wifiPass', e.target.value)}
                      clearButton
                    />
                  </List>
                </div>
              </ListItem>
            </List>
            <div style={{height: '80px'}}></div>
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
              {activitySheet.title}
            </div>
            <Link onClick={() => setActivitySheet({...activitySheet, opened: false})}>Abbrechen</Link>
          </div>

          <PageContent>
            <Block style={{paddingTop: '8px', paddingBottom: '24px'}}>
              
              {/* Kind-Auswahl wenn mehrere Kinder */}
              {kinder.length > 1 && (
                <List noHairlinesMd strong inset style={{marginBottom: '16px'}}>
                  <ListInput
                    label="Für welches Kind?"
                    type="select"
                    value={activitySheet.selectedKind || ''}
                    onInput={(e) => setActivitySheet({...activitySheet, selectedKind: e.target.value})}
                  >
                    <option value="">Bitte wählen</option>
                    {kinder.map(kind => (
                      <option key={kind.id} value={kind.id}>{kind.basis.name}</option>
                    ))}
                  </ListInput>
                </List>
              )}

              {/* Stimmung */}
              <div style={{marginBottom: '16px', textAlign: 'center'}}>
                <div style={{marginBottom: '8px', fontWeight: 'bold', color: '#666'}}>Wie war die Stimmung?</div>
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
                    label="Was wurde gegessen?"
                    type="text"
                    placeholder="z.B. Brei, Apfel..."
                    value={activitySheet.details.was || ''}
                    onInput={(e) => updateActivityDetail('was', e.target.value)}
                    clearButton
                  />
                  <ListInput
                    label="Menge"
                    type="text"
                    placeholder="z.B. 150ml, halber Teller..."
                    value={activitySheet.details.menge || ''}
                    onInput={(e) => updateActivityDetail('menge', e.target.value)}
                    clearButton
                  />
                  <ListInput
                    label="Notizen"
                    type="textarea"
                    placeholder="Weitere Infos..."
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
                    label="Von"
                    type="time"
                    value={activitySheet.details.von || ''}
                    onInput={(e) => updateActivityDetail('von', e.target.value)}
                  />
                  <ListInput
                    label="Bis"
                    type="time"
                    value={activitySheet.details.bis || ''}
                    onInput={(e) => updateActivityDetail('bis', e.target.value)}
                  />
                  <ListInput
                    label="Qualität"
                    type="select"
                    value={activitySheet.details.qualitaet || ''}
                    onInput={(e) => updateActivityDetail('qualitaet', e.target.value)}
                  >
                    <option value="">Bitte wählen</option>
                    <option value="tief">Tief & ruhig</option>
                    <option value="normal">Normal</option>
                    <option value="unruhig">Unruhig</option>
                  </ListInput>
                </List>
              )}

              {/* WINDEL */}
              {activitySheet.type === 'windel' && (
                <List noHairlinesMd strong inset>
                  <ListInput
                    label="Art"
                    type="select"
                    value={activitySheet.details.art || 'nass'}
                    onInput={(e) => updateActivityDetail('art', e.target.value)}
                  >
                    <option value="nass">💦 Nass</option>
                    <option value="voll">💩 Voll</option>
                    <option value="beides">💦💩 Beides</option>
                  </ListInput>
                  <ListInput
                    label="Notizen"
                    type="textarea"
                    placeholder="z.B. Ausschlag, Konsistenz..."
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
                    label="Aktivität"
                    type="text"
                    placeholder="z.B. Bauklötze, Buch lesen..."
                    value={activitySheet.details.aktivitaet || ''}
                    onInput={(e) => updateActivityDetail('aktivitaet', e.target.value)}
                    clearButton
                  />
                  <ListInput
                    label="Dauer"
                    type="text"
                    placeholder="z.B. 30 Min..."
                    value={activitySheet.details.dauer || ''}
                    onInput={(e) => updateActivityDetail('dauer', e.target.value)}
                    clearButton
                  />
                  <ListInput
                    label="Notizen"
                    type="textarea"
                    placeholder="Wie war die Stimmung?"
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
                Speichern
              </Button>
            </Block>
          </PageContent>
        </div>
      </Sheet>

    </Page>
  );
};

export default HomePage;