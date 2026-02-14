import React, { useState } from 'react';
import {
  Page,
  Navbar,
  List,
  ListInput,
  BlockTitle,
  Block,
  Button,
  f7,
  NavRight,
  Link
} from 'framework7-react';
import { supabase } from '../js/supabase'; // Dein Backend Import
import { safeLocalStorageSet } from '../js/imageUtils';

const FormPage = ({ f7router }) => {
  // State für die Eingabefelder
  const [name, setName] = useState('');
  const [rufname, setRufname] = useState('');
  const [birthday, setBirthday] = useState('');
  const [loading, setLoading] = useState(false);

  // Speicher-Logik
  const handleSave = async () => {
    // 1. Validierung: Name muss da sein
    if (!name.trim()) {
      f7.toast.show({ text: 'Bitte einen Namen eingeben', closeTimeout: 2000, position: 'center' });
      return;
    }

    // 2. Validierung: Geburtsdatum darf nicht in der Zukunft liegen
    if (birthday) {
      const selectedDate = new Date(birthday);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate > today) {
        f7.toast.show({ 
          text: 'Geburtsdatum darf nicht in der Zukunft liegen', 
          position: 'center', 
          closeTimeout: 2500 
        });
        return;
      }
    }

    setLoading(true);

    // 2. Das komplette Daten-Objekt erstellen (WICHTIG für Schritt 2: Keine weißen Screens!)
    const newKind = {
      id: Date.now().toString(),
      basis: {
        name: name.trim(),
        rufname: rufname.trim(),
        geburtsdatum: birthday,
        foto: '' // Foto kann später in der Detail-Ansicht hinzugefügt werden
      },
      sicherheit: {
        notfallKontakte: '',
        allergien: '',
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
      logs: []
    };

    // 3. In Supabase (Cloud) speichern
    // Prüfe ob User eingeloggt ist
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // User ist eingeloggt -> In Cloud speichern
      const { error } = await supabase
        .from('children')  // ✅ Richtiger Tabellenname
        .insert([{ 
          id: newKind.id,
          user_id: user.id,  // ✅ Erforderlich für RLS Policy
          data: newKind,
          avatar_url: newKind.basis.foto || null
        }]);

      if (error) {
        console.error('Supabase Fehler:', error);
        f7.dialog.alert(
          `<b>Cloud-Backup fehlgeschlagen</b><br><br>` +
          `Fehler: ${error.message}<br><br>` +
          `<small>Die Daten werden nur lokal gespeichert.</small>`,
          'Warnung'
        );
      } else {
        f7.toast.show({ 
          text: 'In Cloud gespeichert', 
          icon: '<i class="f7-icons">checkmark_alt</i>', 
          closeTimeout: 2000 
        });
      }
    }

    // 4. Lokal speichern (Update LocalStorage Cache) mit Error Handling
    const currentLocal = JSON.parse(localStorage.getItem('sitterSafe_kinder') || '[]');
    const updatedLocal = [...currentLocal, newKind];
    
    const saveResult = safeLocalStorageSet('sitterSafe_kinder', updatedLocal);
    
    if (!saveResult.success) {
      f7.dialog.alert(
        `<div style="text-align: center;">
          <div style="font-size: 48px; margin-bottom: 15px;">⚠️</div>
          <p><b>Speicher voll!</b></p>
          <p>${saveResult.message}</p>
          <p style="font-size: 13px; color: #666; margin-top: 10px;">
            Das Kind wurde in der Cloud gespeichert, konnte aber nicht lokal gespeichert werden.
            Bitte lösche alte Daten oder Fotos.
          </p>
        </div>`,
        'Fehler beim Speichern'
      );
      setLoading(false);
      return;
    }

    setLoading(false);

    // 5. Custom Event dispatchen für Live-Sync zwischen Geräten
    window.dispatchEvent(new CustomEvent('kinderUpdated', { detail: { action: 'added', kind: newKind } }));

    // 6. Zur Home-Page navigieren und Kinder-Tab öffnen
    f7router.navigate('/home/', {
      clearPreviousHistory: false
    });
    
    // Tab auf Kinder setzen mit Framework7 API (nach Navigation)
    setTimeout(() => {
      f7.tab.show('#tab-kinder');
    }, 150);
  };

  return (
    <Page name="form">
      <Navbar title="Neues Profil" backLink="Abbrechen">
        <NavRight>
          {/* Speicher-Button auch oben rechts (iOS Style) */}
          <Link onClick={handleSave}>Fertig</Link>
        </NavRight>
      </Navbar>

      <BlockTitle>Basis Informationen</BlockTitle>
      <List strongIos outlineIos dividersIos form>
        <ListInput
          label="Vorname *"
          type="text"
          placeholder="Wie heißt das Kind?"
          value={name}
          onInput={(e) => setName(e.target.value)}
          clearButton
          required
          validate
        />

        <ListInput
          label="Rufname / Spitzname"
          type="text"
          placeholder="Optional"
          value={rufname}
          onInput={(e) => setRufname(e.target.value)}
          clearButton
        />

        <ListInput
          label="Geburtsdatum"
          type="date"
          placeholder="Geburtstag wählen"
          value={birthday}
          onInput={(e) => setBirthday(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
        />
      </List>

      <BlockTitle footer>Weitere Details (Allergien, Notfallkontakte etc.) kannst du nach dem Erstellen im Profil bearbeiten.</BlockTitle>

      <Block>
        <Button fill large onClick={handleSave} preloader loading={loading}>
          Profil erstellen
        </Button>
      </Block>
    </Page>
  );
};

export default FormPage;