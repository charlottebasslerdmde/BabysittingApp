import React, { useState, useEffect, useRef } from 'react';
import { 
  Page, Navbar, NavTitle, NavRight, Link, List, ListItem, 
  Block, Button, Sheet, PageContent, Fab, Icon, SwipeoutActions, 
  SwipeoutButton, ListInput, Toolbar, f7 
} from 'framework7-react';
import { useTranslation } from '../js/i18n';
import { compressImage, safeLocalStorageSet } from '../js/imageUtils';

const KinderPage = () => {
  // i18n Hook
  const { t } = useTranslation();
  // State für die Liste der Kinder
  const [kinder, setKinder] = useState([]);
  
  // State für das "Kind hinzufügen" Sheet
  const [sheetOpened, setSheetOpened] = useState(false);
  const [newKindName, setNewKindName] = useState('');
  
  // Referenz für den File-Input (Kamera/Galerie)
  const fileInputRef = useRef(null);
  const [tempPhoto, setTempPhoto] = useState(null);

  // Initiales Laden aus dem LocalStorage (Offline-First Ansatz)
  useEffect(() => {
    const storedKinder = localStorage.getItem('sitterSafe_kinder');
    if (storedKinder) {
      try {
        setKinder(JSON.parse(storedKinder));
      } catch (e) {
        console.error("Fehler beim Laden der Daten", e);
      }
    }
  }, []);

  // Speichern bei Änderungen (Reaktivität) mit Error Handling
  useEffect(() => {
    if (kinder.length === 0) return; // Nicht speichern wenn leer (beim initialen Laden)
    
    const result = safeLocalStorageSet('sitterSafe_kinder', kinder);
    
    if (!result.success) {
      f7.dialog.alert(
        `<div style="text-align: center;">
          <div style="font-size: 48px; margin-bottom: 15px;">⚠️</div>
          <p><b>Speicher voll!</b></p>
          <p>${result.message}</p>
          <p style="font-size: 13px; color: #666; margin-top: 10px;">
            💡 Tipp: Fotos werden komprimiert gespeichert. Falls das Problem weiterhin besteht,
            versuche Fotos aus älteren Profilen zu entfernen.
          </p>
        </div>`,
        'Fehler beim Speichern'
      );
    }
  }, [kinder]);

  const openAddSheet = () => {
    setNewKindName('');
    setTempPhoto(null);
    setSheetOpened(true);
  };

  // Hilfsfunktion: Foto einlesen und komprimieren
  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // Zeige Loading
        f7.preloader.show();
        
        // Komprimiere das Bild
        const compressedBase64 = await compressImage(file, 300, 300, 0.5);
        
        setTempPhoto(compressedBase64);
        
        f7.preloader.hide();
        f7.toast.show({ 
          text: 'Foto komprimiert und bereit', 
          closeTimeout: 1500, 
          position: 'center',
          cssClass: 'toast-success'
        });
      } catch (error) {
        f7.preloader.hide();
        console.error('Fehler beim Komprimieren:', error);
        f7.toast.show({ 
          text: 'Fehler beim Laden des Fotos', 
          closeTimeout: 2000, 
          position: 'center' 
        });
      }
    }
  };

  const addKind = () => {
    if (!newKindName.trim()) {
      f7.toast.show({ text: t('kinder_name_required'), position: 'center', closeTimeout: 2000 });
      return;
    }

    // ERFÜLLUNG SPEZIFIKATION 2.A: Logische Clusterung der Daten
    const newKind = {
      id: Date.now().toString(),
      basis: {
        name: newKindName.trim(),
        rufname: '',
        geburtsdatum: '', // Input type date
        foto: tempPhoto || '', // Base64 String
      },
      sicherheit: {
        notfallKontakte: '',
        allergien: '', // Textarea
        medikamente: [],
        hausarzt: '',
        krankenkasse: ''
      },
      routine: {
        essensplan: '',
        schlafenszeitRitual: '',
        hygiene: ''
      },
      regeln: {
        medienzeit: '',
        suessigkeiten: '',
        tabuZonen: ''
      },
      psychologie: {
        aengste: '',
        beruhigungsStrategie: '',
        belohnungssystem: ''
      },
      logs: [] // Für 2.B: Live-Aktivitäts-Tracker
    };

    setKinder([...kinder, newKind]);
    setSheetOpened(false);
    f7.toast.show({ text: t('kinder_created_success'), icon: '<i class="f7-icons">checkmark_alt</i>', closeTimeout: 2000 });
  };

  const deleteKind = (id) => {
    f7.dialog.confirm(t('kinder_delete_confirm'), t('kinder_delete_title'), () => {
      const updatedKinder = kinder.filter(k => k.id !== id);
      setKinder(updatedKinder);
    });
  };

  // Hilfsfunktion für Avatar-Anzeige (Foto oder Initialen)
  const renderAvatar = (kind) => {
    if (kind.basis.foto) {
      return <img src={kind.basis.foto} style={{width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover'}} alt="Avatar" />;
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

  return (
    <Page name="kinder">
      {/* Navbar gemäß iOS Design Guidelines */}
      <Navbar title={t('kinder_page_title')} />

      <PageContent>
        {/* Leerer Zustand (Empty State) */}
        {kinder.length === 0 && (
          <Block className="text-align-center" style={{marginTop: '30vh', opacity: 0.6}}>
            <Icon f7="person_3_fill" size="64px" color="gray"></Icon>
            <p>{t('kinder_empty_state')}</p>
            <Button fill round small onClick={openAddSheet} style={{maxWidth: '200px', margin: '0 auto'}}>
              {t('kinder_create_first')}
            </Button>
          </Block>
        )}

        {/* Liste der Kinder mit Swipe-to-Delete */}
        <List mediaList dividersIos outlineIos insetMd>
          {kinder.map((kind) => (
            <ListItem
              key={kind.id}
              link={`/kind/${kind.id}/`} // Routing zur Detailseite (muss in routes.js definiert sein)
              title={kind.basis.name}
              subtitle={kind.basis.rufname ? `"${kind.basis.rufname}"` : t('kinder_no_nickname')}
              text={`${t('kinder_status')}: ${kind.sicherheit.allergien ? t('kinder_allergies_warning') : t('kinder_all_ok')}`}
              swipeout
            >
              <div slot="media">
                {renderAvatar(kind)}
              </div>
              <SwipeoutActions right>
                <SwipeoutButton color="red" onClick={() => deleteKind(kind.id)}>
                  Löschen
                </SwipeoutButton>
              </SwipeoutActions>
            </ListItem>
          ))}
        </List>
      </PageContent>

      {/* Floating Action Button (FAB) für schnelle Erfassung */}
      <Fab position="right-bottom" slot="fixed" color="blue" onClick={openAddSheet}>
        <Icon ios="f7:plus" md="material:add" />
      </Fab>

      {/* Sheet Modal für neues Kind (Atomic Creation) */}
      <Sheet
        opened={sheetOpened}
        onSheetClosed={() => setSheetOpened(false)}
        style={{height: 'auto', borderTopLeftRadius: '16px', borderTopRightRadius: '16px'}}
        swipeToClose
        backdrop
      >
        <div className="sheet-modal-inner">
          <Block>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              <h3 style={{margin: 0}}>{t('kinder_new_profile')}</h3>
              <Link onClick={() => setSheetOpened(false)}>{t('cancel')}</Link>
            </div>
            
            <div style={{textAlign: 'center', marginBottom: '20px'}}>
               {/* Versteckter File Input + Custom Button */}
               <input 
                  type="file" 
                  accept="image/*"
                  ref={fileInputRef} 
                  style={{display: 'none'}} 
                  onChange={handlePhotoUpload}
               />
               <div onClick={() => fileInputRef.current.click()} style={{cursor: 'pointer'}}>
                 {tempPhoto ? (
                   <img src={tempPhoto} style={{width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #00e1ff'}} />
                 ) : (
                   <div style={{width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f0f0f0', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                     <Icon f7="camera_fill" color="gray" size="32px" />
                   </div>
                 )}
                 <div style={{fontSize: '12px', color: '#007aff', marginTop: '4px'}}>{t('kinder_add_photo')}</div>
               </div>
            </div>

            <List noHairlinesMd>
              <ListInput
                label={t('kinder_first_name')}
                type="text"
                placeholder={t('kinder_name_placeholder')}
                value={newKindName}
                onInput={(e) => setNewKindName(e.target.value)}
                clearButton
                outline
                floatingLabel
              />
            </List>
            
            <Button fill large onClick={addKind} style={{marginTop: '20px', borderRadius: '12px'}}>
              {t('kinder_create_profile')}
            </Button>
            <div style={{height: '20px'}}></div>
          </Block>
        </div>
      </Sheet>
    </Page>
  );
};

export default KinderPage;
