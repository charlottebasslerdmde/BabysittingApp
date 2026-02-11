import React, { useState, useEffect, useRef } from 'react';
import { 
  Page, Navbar, Subnavbar, Segmented, Button, Block, 
  List, ListItem, Sheet, Toolbar, Link, Input, Icon, 
  BlockTitle, SwipeoutActions, SwipeoutButton, f7, ListInput, Card 
} from 'framework7-react';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { compressImage, safeLocalStorageSet } from '../js/imageUtils';

const KindDetailPage = ({ f7route }) => {
  const kindId = f7route.params.id;
  const [kind, setKind] = useState(null);
  const [activeTab, setActiveTab] = useState('basis');

  // --- NEU: Biometrie Handler mit Settings-Check ---
  const handleTabChange = async (newTab) => {
    // 1. Prüfen, ob Sicherheit in den Settings aktiviert ist (Default: an)
    // Wir nutzen 'true' als String, falls der Key noch nicht existiert
    const storedSetting = localStorage.getItem('sitterSafe_bio_active');
    const securityEnabled = storedSetting ? JSON.parse(storedSetting) : true;

    // 2. Nur prüfen, wenn Tab "sicherheit" gewählt UND Feature in Settings aktiv
    if (newTab === 'sicherheit' && securityEnabled) {
      try {
        await NativeBiometric.verifyIdentity({
          reason: "Sicherheits-Check für Medikamente",
          title: "Authentifizierung",
          subtitle: "Bitte bestätigen",
          description: "Lege deinen Finger auf den Sensor"
        });

        // Wenn wir hier ankommen, war die Authentifizierung erfolgreich
        setActiveTab(newTab);
        f7.toast.show({ text: 'Zugriff gewährt ✓', icon: '<i class="f7-icons">lock_open_fill</i>', closeTimeout: 1500, position: 'center' });
      } catch (error) {
        // Fallback für Simulator oder wenn Abbruch
        console.warn("Biometrie Fehler (oder Simulator):", error);
        f7.dialog.confirm(
          'Biometrie nicht verfügbar (Dev Mode). Trotzdem öffnen?', 
          'Sicherheit', 
          () => setActiveTab(newTab)
        );
      }
    } else {
      // 3. Alle anderen Fälle: Tab einfach öffnen
      setActiveTab(newTab);
    }
  };
  // ------------------------------------------------

  // State für das Bearbeitungs-Sheet
  const [editSheet, setEditSheet] = useState({
    opened: false,
    cluster: '',
    field: '',
    label: '',
    type: 'text',
    value: '',
    medFormData: { name: '', dosis: '', info: '' } 
  });

  // --- 1. DATEN LADEN ---
  useEffect(() => {
    const storedKinder = JSON.parse(localStorage.getItem('sitterSafe_kinder') || '[]');
    const foundKind = storedKinder.find(k => k.id === kindId);

    if (foundKind) {
      // Reparatur-Logik für fehlende Datenstrukturen
      if (!foundKind.basis) foundKind.basis = {};
      if (!foundKind.sicherheit) foundKind.sicherheit = {};
      if (!foundKind.sicherheit.medikamente) foundKind.sicherheit.medikamente = [];
      if (!foundKind.routine) foundKind.routine = {};
      if (!foundKind.regeln) foundKind.regeln = {};
      if (!foundKind.psychologie) foundKind.psychologie = {};

      setKind(foundKind);
    } else {
      f7.toast.show({ text: 'Kind nicht gefunden', closeTimeout: 2000 });
    }
  }, [kindId]);

  // --- 2. PERSISTENZ MIT ERROR HANDLING ---
  const persistChanges = (updatedKind) => {
    setKind(updatedKind);
    const storedKinder = JSON.parse(localStorage.getItem('sitterSafe_kinder') || '[]');
    const updatedList = storedKinder.map(k => k.id === kindId ? updatedKind : k);
    
    const result = safeLocalStorageSet('sitterSafe_kinder', updatedList);
    
    if (!result.success) {
      f7.dialog.alert(
        `<div style="text-align: center;">
          <div style="font-size: 48px; margin-bottom: 15px;">⚠️</div>
          <p><b>Speicher voll!</b></p>
          <p>${result.message}</p>
          <p style="font-size: 13px; color: #666; margin-top: 10px;">
            💡 Tipp: Fotos werden komprimiert. Falls das Problem weiterhin besteht,
            versuche das Profilfoto zu entfernen oder zu verkleinern.
          </p>
        </div>`,
        'Fehler beim Speichern'
      );
      // Rollback
      setKind(kind);
    } else {
      // Event dispatchen, damit andere Seiten (z.B. Kinder-Liste) aktualisiert werden
      window.dispatchEvent(new CustomEvent('kinderUpdated', { 
        detail: { action: 'updated', kindId: kindId, kind: updatedKind } 
      }));
    }
  };

  // --- 3. HELPER ---
  const openEdit = (cluster, field, label, type = 'text') => {
    setEditSheet({
      opened: true,
      cluster,
      field,
      label,
      type,
      value: kind[cluster] ? kind[cluster][field] : '',
      medFormData: { name: '', dosis: '', info: '' }
    });
  };

  const openAddMedication = () => {
    setEditSheet({
      opened: true,
      cluster: 'sicherheit',
      field: 'medikamente',
      label: 'Medikament hinzufügen',
      type: 'medication',
      value: '', 
      medFormData: { name: '', dosis: '', info: '' }
    });
  };

  const saveField = () => {
    const { cluster, field, value, type, medFormData } = editSheet;
    let updatedKind = { ...kind };

    if (type === 'medication') {
      if (!medFormData.name) {
        f7.toast.show({ text: 'Bitte Name eingeben', position: 'center', closeTimeout: 1500 });
        return;
      }
      const newMed = { id: Date.now().toString(), ...medFormData };
      const currentList = updatedKind[cluster][field] || [];
      updatedKind = {
        ...updatedKind,
        [cluster]: { ...updatedKind[cluster], [field]: [...currentList, newMed] }
      };
    } else {
      // Validierung für Geburtsdatum
      if (field === 'geburtsdatum' && value) {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate > today) {
          f7.toast.show({ 
            text: 'Geburtsdatum darf nicht in der Zukunft liegen', 
            position: 'center', 
            closeTimeout: 2000 
          });
          return;
        }
      }
      
      updatedKind = { 
        ...updatedKind, 
        [cluster]: { ...updatedKind[cluster], [field]: value }
      };
    }

    persistChanges(updatedKind);
    setEditSheet({ ...editSheet, opened: false });
    f7.toast.show({ text: 'Gespeichert', icon: '<i class="f7-icons">checkmark_alt</i>', closeTimeout: 1000, position: 'center' });
  };

  const deleteMedication = (medId) => {
    const updatedList = kind.sicherheit.medikamente.filter(m => m.id !== medId);
    const updatedKind = {
      ...kind,
      sicherheit: { ...kind.sicherheit, medikamente: updatedList }
    };
    persistChanges(updatedKind);
  };

  const deleteKind = () => {
    f7.dialog.confirm(
      `Möchtest du das Profil von "${kind.basis.name}" wirklich löschen?`,
      'Profil löschen',
      () => {
        // Kind aus localStorage entfernen
        const storedKinder = JSON.parse(localStorage.getItem('sitterSafe_kinder') || '[]');
        const updatedKinder = storedKinder.filter(k => k.id !== kindId);
        localStorage.setItem('sitterSafe_kinder', JSON.stringify(updatedKinder));
        
        // Custom Event dispatchen für andere Seiten
        window.dispatchEvent(new CustomEvent('kinderUpdated', { detail: { action: 'deleted', kindId: kindId } }));
        
        // Toast anzeigen und zur Home-Seite mit Kinder-Tab navigieren
        f7.toast.show({ 
          text: 'Profil gelöscht', 
          icon: '<i class="f7-icons">checkmark_alt</i>',
          closeTimeout: 1500,
          position: 'center'
        });
        
        // Zur Home-Seite navigieren und Kinder-Tab aktivieren
        f7.views.main.router.navigate('/', {
          reloadCurrent: true,
          on: {
            pageAfterIn: () => {
              // Kinder-Tab aktivieren
              f7.tab.show('#tab-kinder');
            }
          }
        });
      }
    );
  };

  // --- PROFILFOTO HANDLING MIT CAPACITOR CAMERA ---
  const handlePhotoUpload = async () => {
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
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: source,
        width: 400,
        height: 400
      });
      
      const updatedKind = {
        ...kind,
        basis: { ...kind.basis, foto: image.dataUrl }
      };
      
      persistChanges(updatedKind);
      
      f7.preloader.hide();
      f7.toast.show({ 
        text: 'Foto komprimiert und gespeichert ✓', 
        icon: '<i class="f7-icons">checkmark_alt</i>', 
        position: 'center', 
        closeTimeout: 1500,
        cssClass: 'toast-success'
      });
    } catch (error) {
      f7.preloader.hide();
      if (error.message !== 'User cancelled photos app') {
        console.error('Fehler beim Aufnehmen:', error);
        f7.toast.show({ 
          text: 'Fehler beim Laden des Fotos', 
          position: 'center', 
          closeTimeout: 2000 
        });
      }
    }
  };

  const removePhoto = () => {
    f7.dialog.confirm(
      'Möchtest du das Profilfoto wirklich entfernen?',
      'Foto löschen',
      () => {
        const updatedKind = {
          ...kind,
          basis: { ...kind.basis, foto: null }
        };
        persistChanges(updatedKind);
        f7.toast.show({ text: 'Foto entfernt', closeTimeout: 1500 });
      }
    );
  };

  if (!kind) return <Page><Navbar title="Laden..." /></Page>;

  // --- 4. RENDER HELPER ---
  const calculateAge = (birthdate) => {
    if (!birthdate) return null;
    
    const birth = new Date(birthdate);
    const today = new Date();
    
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    if (today.getDate() < birth.getDate()) {
      months--;
      if (months < 0) {
        years--;
        months += 12;
      }
    }
    
    if (years === 0) {
      return `${months} ${months === 1 ? 'Monat' : 'Monate'}`;
    } else if (months === 0) {
      return `${years} ${years === 1 ? 'Jahr' : 'Jahre'}`;
    } else {
      return `${years} ${years === 1 ? 'Jahr' : 'Jahre'}, ${months} ${months === 1 ? 'Monat' : 'Monate'}`;
    }
  };

  const RenderItem = ({ cluster, field, label, type = 'text', placeholder = 'Nicht angegeben' }) => {
    const val = kind[cluster]?.[field];
    return (
      <ListItem 
        link="#" 
        title={label} 
        after={val || placeholder}
        onClick={() => openEdit(cluster, field, label, type)}
      >
        {!val && <Icon slot="media" f7="exclamationmark_circle" size="16px" color="gray" />}
      </ListItem>
    );
  };

  const RenderMedicationSection = () => {
    const meds = kind.sicherheit.medikamente || [];
    return (
      <>
        <BlockTitle style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <span>Medikamente & Dosierung</span>
          <Link onClick={openAddMedication} style={{fontSize: '14px'}}>+ Hinzufügen</Link>
        </BlockTitle>
        <List mediaList insetMd strong dividersIos outlineIos>
          {meds.length === 0 ? (
            <ListItem title="Keine Medikamente" footer="Tippe auf Hinzufügen" />
          ) : (
            meds.map((med) => (
              <ListItem key={med.id} title={med.name} after={med.dosis} text={med.info} swipeout>
                <Icon slot="media" f7="pills_fill" color="red" />
                <SwipeoutActions right>
                  <SwipeoutButton delete onClick={() => deleteMedication(med.id)}>Löschen</SwipeoutButton>
                </SwipeoutActions>
              </ListItem>
            ))
          )}
        </List>
      </>
    );
  };

  // --- 5. HAUPT RENDER ---
  return (
    <Page name="kind-detail">
      <Navbar 
        backLink="Zurück" 
        backLinkShowText={false}
        onBackClick={() => {
          // Zurück zur Kinder-Übersichtsseite navigieren
          f7.views.main.router.navigate('/', {
            on: {
              pageAfterIn: () => {
                // Kinder-Tab aktivieren
                f7.tab.show('#tab-kinder');
              }
            }
          });
        }}
      >
        <div slot="title" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <Icon f7="person_crop_circle_fill" size="24px" color="#667eea" />
          <span style={{fontSize: '18px', fontWeight: '600'}}>{kind.basis.name}</span>
        </div>
        <Subnavbar>
          <Segmented raised style={{fontSize: '13px'}}>
            <Button 
              tabLinkActive={activeTab === 'basis'} 
              onClick={() => handleTabChange('basis')}
              style={{minWidth: '60px', padding: '0 8px'}}
            >
              <Icon f7="person_fill" size="16px" style={{marginBottom: '2px'}} /><br/>
              <span style={{fontSize: '11px'}}>Basis</span>
            </Button>
            <Button 
              tabLinkActive={activeTab === 'sicherheit'} 
              onClick={() => handleTabChange('sicherheit')}
              style={{minWidth: '60px', padding: '0 8px'}}
            >
              <Icon f7="lock_fill" size="16px" style={{marginBottom: '2px'}} /><br/>
              <span style={{fontSize: '11px'}}>Medizin</span>
            </Button>
            <Button 
              tabLinkActive={activeTab === 'routine'} 
              onClick={() => handleTabChange('routine')}
              style={{minWidth: '60px', padding: '0 8px'}}
            >
              <Icon f7="clock_fill" size="16px" style={{marginBottom: '2px'}} /><br/>
              <span style={{fontSize: '11px'}}>Routine</span>
            </Button>
            <Button 
              tabLinkActive={activeTab === 'regeln'} 
              onClick={() => handleTabChange('regeln')}
              style={{minWidth: '60px', padding: '0 8px'}}
            >
              <Icon f7="list_bullet" size="16px" style={{marginBottom: '2px'}} /><br/>
              <span style={{fontSize: '11px'}}>Regeln</span>
            </Button>
          </Segmented>
        </Subnavbar>
      </Navbar>

      <div style={{height: '10px'}} />

      {activeTab === 'basis' && (
        <>
          {/* Profilfoto Card */}
          <Card style={{
            margin: '16px', 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}>
            <div style={{ padding: '20px' }}>
              <div style={{
                width: '120px',
                height: '120px',
                margin: '0 auto 16px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                background: kind.basis?.foto ? 'transparent' : '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {kind.basis?.foto ? (
                  <img 
                    src={kind.basis.foto} 
                    alt="Profilfoto" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Icon f7="person_fill" size="60px" color="gray" />
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <Button 
                  fill 
                  small 
                  onClick={handlePhotoUpload}
                  style={{ borderRadius: '20px', background: 'white', color: '#667eea' }}
                >
                  <Icon f7="camera_fill" size="16px" style={{ marginRight: '4px' }} />
                  {kind.basis?.foto ? 'Ändern' : 'Foto hinzufügen'}
                </Button>
                {kind.basis?.foto && (
                  <Button 
                    fill 
                    small 
                    onClick={removePhoto}
                    style={{ borderRadius: '20px', background: 'rgba(255,255,255,0.2)', color: 'white' }}
                  >
                    <Icon f7="trash" size="16px" />
                  </Button>
                )}
              </div>
            </div>
          </Card>

          <List insetMd strong dividersIos outlineIos>
            <RenderItem cluster="basis" field="name" label="Vorname" />
            <RenderItem cluster="basis" field="nachname" label="Nachname" />
            <RenderItem cluster="basis" field="rufname" label="Rufname / Spitzname" />
            <RenderItem cluster="basis" field="geburtsdatum" label="Geburtsdatum" type="date" />
            <ListItem 
              title="Aktuelles Alter" 
              after={calculateAge(kind.basis?.geburtsdatum) || 'Geburtsdatum erforderlich'}
            >
              <Icon slot="media" f7="calendar" size="16px" color="#667eea" />
            </ListItem>
          </List>

          {/* Danger Zone - Profil löschen */}
          <Block style={{ marginTop: '40px', marginBottom: '20px' }}>
            <Button 
              fill 
              large
              color="red"
              onClick={deleteKind}
              style={{ borderRadius: '12px' }}
            >
              <Icon f7="trash_fill" style={{ marginRight: '8px' }} />
              Profil löschen
            </Button>
          </Block>
        </>
      )}

      {activeTab === 'sicherheit' && (
        <>
          <List insetMd strong dividersIos outlineIos>
            <RenderItem cluster="sicherheit" field="allergien" label="Allergien" type="textarea" />
            <RenderItem cluster="sicherheit" field="hausarzt" label="Hausarzt (Name/Tel)" />
            <RenderItem cluster="sicherheit" field="krankenkasse" label="Krankenkasse" />
            <RenderItem cluster="sicherheit" field="notfallKontakte" label="Notfall-Kontakte" type="textarea" />
          </List>
          <RenderMedicationSection />
        </>
      )}

      {activeTab === 'routine' && (
        <List insetMd strong dividersIos outlineIos>
          <RenderItem cluster="routine" field="essensplan" label="Essensplan & Vorlieben" type="textarea" />
          <RenderItem cluster="routine" field="schlafenszeitRitual" label="Schlafenszeit & Ritual" type="textarea" />
          <RenderItem cluster="routine" field="hygiene" label="Wickeln / Hygiene" type="textarea" />
        </List>
      )}

      {activeTab === 'regeln' && (
        <>
          <BlockTitle>Regeln & Erziehung</BlockTitle>
          <List insetMd strong dividersIos outlineIos>
            <RenderItem cluster="regeln" field="medienzeit" label="TV / Medienzeit" />
            <RenderItem cluster="regeln" field="suessigkeiten" label="Süßigkeiten" />
            <RenderItem cluster="regeln" field="tabuZonen" label="Tabu-Zonen" type="textarea" />
          </List>
          <BlockTitle>Psychologie & Komfort</BlockTitle>
          <List insetMd strong dividersIos outlineIos>
            <RenderItem cluster="psychologie" field="aengste" label="Ängste / Trigger" type="textarea" />
            <RenderItem cluster="psychologie" field="beruhigungsStrategie" label="Was beruhigt?" type="textarea" />
            <RenderItem cluster="psychologie" field="belohnungssystem" label="Belohnungssystem" />
          </List>
        </>
      )}

      {/* EDIT SHEET */}
      <Sheet 
        opened={editSheet.opened} 
        onSheetClosed={() => setEditSheet({...editSheet, opened: false})}
        style={{height: '70%', borderTopLeftRadius: '16px', borderTopRightRadius: '16px'}}
        swipeToClose
        backdrop
      >
        <Toolbar top>
          <div className="left" style={{paddingLeft: '16px', fontWeight: 'bold'}}>{editSheet.label}</div>
          <div className="right">
            <Link onClick={() => setEditSheet({...editSheet, opened: false})}>Abbrechen</Link>
          </div>
        </Toolbar>
        <div style={{
          height: 'calc(100% - 44px)',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}>
          <Block style={{padding: '24px 16px 60px'}}>
            <List noHairlinesMd>
              {editSheet.type === 'medication' ? (
                <>
                  <ListInput
                    label="Name" type="text" placeholder="z.B. Hustensaft"
                    value={editSheet.medFormData.name}
                    onInput={(e) => setEditSheet({...editSheet, medFormData: {...editSheet.medFormData, name: e.target.value}})}
                    outline floatingLabel clearButton
                    style={{
                      '--f7-input-height': '44px',
                      '--f7-input-padding-vertical': '8px'
                    }}
                  />
                  <ListInput
                    label="Dosis" type="text" placeholder="z.B. 5ml"
                    value={editSheet.medFormData.dosis}
                    onInput={(e) => setEditSheet({...editSheet, medFormData: {...editSheet.medFormData, dosis: e.target.value}})}
                    outline floatingLabel clearButton
                    style={{
                      '--f7-input-height': '44px',
                      '--f7-input-padding-vertical': '8px'
                    }}
                  />
                  <ListInput
                    label="Info" type="textarea" placeholder="Anwendung..."
                    value={editSheet.medFormData.info}
                    onInput={(e) => setEditSheet({...editSheet, medFormData: {...editSheet.medFormData, info: e.target.value}})}
                    outline floatingLabel resizable
                  />
                </>
              ) : (
                <ListInput
                  label={editSheet.label}
                  type={editSheet.type}
                  value={editSheet.value}
                  placeholder="Eingabe..."
                  clearButton
                  onInput={(e) => setEditSheet({...editSheet, value: e.target.value})}
                  resizable={editSheet.type === 'textarea'}
                  outline
                  floatingLabel
                  max={editSheet.type === 'date' ? new Date().toISOString().split('T')[0] : undefined}
                  style={{
                    '--f7-input-height': '44px',
                    '--f7-input-padding-vertical': '8px',
                    '--f7-list-item-min-height': '44px'
                  }}
                  inputStyle={{
                    margin: 0,
                    padding: '10px 12px',
                    height: editSheet.type === 'date' ? '44px' : 'auto',
                    lineHeight: '1.4',
                    verticalAlign: 'middle',
                    boxSizing: 'border-box'
                  }}
                />
              )}
            </List>
            <Button fill large onClick={saveField} style={{marginTop: '24px', marginBottom: '20px', borderRadius: '12px'}}>Speichern</Button>
          </Block>
        </div>
      </Sheet>
    </Page>
  );
};

export default KindDetailPage;