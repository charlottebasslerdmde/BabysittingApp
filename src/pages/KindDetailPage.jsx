import React, { useState, useEffect, useRef } from 'react';
import { 
  Page, Navbar, Subnavbar, Segmented, Button, Block, 
  List, ListItem, Sheet, Toolbar, Link, Input, Icon, 
  BlockTitle, SwipeoutActions, SwipeoutButton, f7, ListInput, Card 
} from 'framework7-react';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';

const KindDetailPage = ({ f7route }) => {
  const kindId = f7route.params.id;
  const [kind, setKind] = useState(null);
  const [activeTab, setActiveTab] = useState('basis');
  const fileInputRef = useRef(null);

  // --- NEU: Biometrie Handler mit Settings-Check ---
  const handleTabChange = async (newTab) => {
    // 1. Prüfen, ob Sicherheit in den Settings aktiviert ist (Default: an)
    // Wir nutzen 'true' als String, falls der Key noch nicht existiert
    const storedSetting = localStorage.getItem('sitterSafe_bio_active');
    const securityEnabled = storedSetting ? JSON.parse(storedSetting) : true;

    // 2. Nur prüfen, wenn Tab "sicherheit" gewählt UND Feature in Settings aktiv
    if (newTab === 'sicherheit' && securityEnabled) {
      try {
        const result = await NativeBiometric.verifyIdentity({
          reason: "Sicherheits-Check für Medikamente",
          title: "Authentifizierung",
          subtitle: "Bitte bestätigen",
          description: "Lege deinen Finger auf den Sensor"
        }).then(() => true).
        catch(() => false);


        if (result.success) {
          setActiveTab(newTab);
          f7.toast.show({ text: 'Zugriff gewährt', icon: '<i class="f7-icons">lock_open</i>', closeTimeout: 1500 });
        }
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

  // --- 2. PERSISTENZ ---
  const persistChanges = (updatedKind) => {
    setKind(updatedKind);
    const storedKinder = JSON.parse(localStorage.getItem('sitterSafe_kinder') || '[]');
    const updatedList = storedKinder.map(k => k.id === kindId ? updatedKind : k);
    localStorage.setItem('sitterSafe_kinder', JSON.stringify(updatedList));
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

  // --- PROFILFOTO HANDLING ---
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Prüfe Dateigröße (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      f7.toast.show({ 
        text: 'Bild zu groß (max 5MB)', 
        position: 'center', 
        closeTimeout: 2000 
      });
      return;
    }

    // Konvertiere zu Base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Image = event.target.result;
      const updatedKind = {
        ...kind,
        basis: { ...kind.basis, profilFoto: base64Image }
      };
      persistChanges(updatedKind);
      f7.toast.show({ 
        text: 'Foto gespeichert', 
        icon: '<i class="f7-icons">checkmark_alt</i>', 
        position: 'center', 
        closeTimeout: 1500 
      });
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    f7.dialog.confirm(
      'Möchtest du das Profilfoto wirklich entfernen?',
      'Foto löschen',
      () => {
        const updatedKind = {
          ...kind,
          basis: { ...kind.basis, profilFoto: null }
        };
        persistChanges(updatedKind);
        f7.toast.show({ text: 'Foto entfernt', closeTimeout: 1500 });
      }
    );
  };

  if (!kind) return <Page><Navbar title="Laden..." /></Page>;

  // --- 4. RENDER HELPER ---
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
      <Navbar title={kind.basis.name} backLink="Zurück">
        <Subnavbar>
          <Segmented raised>
            <Button tabLinkActive={activeTab === 'basis'} onClick={() => handleTabChange('basis')}>Basis</Button>
            <Button tabLinkActive={activeTab === 'sicherheit'} onClick={() => handleTabChange('sicherheit')}>
               <Icon f7="lock_fill" size="14px" style={{marginRight:'4px'}}/> Sicherheit
            </Button>
            <Button tabLinkActive={activeTab === 'routine'} onClick={() => handleTabChange('routine')}>Routine</Button>
            <Button tabLinkActive={activeTab === 'regeln'} onClick={() => handleTabChange('regeln')}>Regeln</Button>
          </Segmented>
        </Subnavbar>
      </Navbar>

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
                background: kind.basis?.profilFoto ? 'transparent' : '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {kind.basis?.profilFoto ? (
                  <img 
                    src={kind.basis.profilFoto} 
                    alt="Profilfoto" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Icon f7="person_fill" size="60px" color="gray" />
                )}
              </div>
              
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                style={{ display: 'none' }}
                onChange={handlePhotoUpload}
              />
              
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <Button 
                  fill 
                  small 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ borderRadius: '20px', background: 'white', color: '#667eea' }}
                >
                  <Icon f7="camera_fill" size="16px" style={{ marginRight: '4px' }} />
                  {kind.basis?.profilFoto ? 'Ändern' : 'Foto hinzufügen'}
                </Button>
                {kind.basis?.profilFoto && (
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
            <RenderItem cluster="basis" field="name" label="Vollständiger Name" />
            <RenderItem cluster="basis" field="rufname" label="Rufname / Spitzname" />
            <RenderItem cluster="basis" field="geburtsdatum" label="Geburtsdatum" type="date" />
          </List>
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
        style={{height: 'auto', borderTopLeftRadius: '16px', borderTopRightRadius: '16px'}}
        swipeToClose
        backdrop
      >
        <div className="sheet-modal-inner">
          <Toolbar top>
            <div className="left" style={{paddingLeft: '16px', fontWeight: 'bold'}}>{editSheet.label}</div>
            <div className="right">
              <Link onClick={() => setEditSheet({...editSheet, opened: false})}>Abbrechen</Link>
            </div>
          </Toolbar>
          <Block style={{padding: '40px 16px 20px'}}>
            {editSheet.type === 'medication' ? (
              <List noHairlinesMd>
                <ListInput
                  label="Name" type="text" placeholder="z.B. Hustensaft"
                  value={editSheet.medFormData.name}
                  onInput={(e) => setEditSheet({...editSheet, medFormData: {...editSheet.medFormData, name: e.target.value}})}
                  outline floatingLabel clearButton
                />
                <ListInput
                  label="Dosis" type="text" placeholder="z.B. 5ml"
                  value={editSheet.medFormData.dosis}
                  onInput={(e) => setEditSheet({...editSheet, medFormData: {...editSheet.medFormData, dosis: e.target.value}})}
                  outline floatingLabel clearButton
                />
                <ListInput
                  label="Info" type="textarea" placeholder="Anwendung..."
                  value={editSheet.medFormData.info}
                  onInput={(e) => setEditSheet({...editSheet, medFormData: {...editSheet.medFormData, info: e.target.value}})}
                  outline floatingLabel resizable
                />
              </List>
            ) : (
              <Input
                type={editSheet.type}
                value={editSheet.value}
                placeholder={`Eingabe...`}
                clearButton
                onInput={(e) => setEditSheet({...editSheet, value: e.target.value})}
                resizable={editSheet.type === 'textarea'}
                autofocus
                style={{marginBottom: '24px'}}
              />
            )}
            <Button fill large onClick={saveField} style={{marginTop: '16px', marginBottom: '30px', borderRadius: '12px'}}>Speichern</Button>
          </Block>
        </div>
      </Sheet>
    </Page>
  );
};

export default KindDetailPage;