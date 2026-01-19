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
    const { error } = await supabase
      .from('kinder')
      .insert([{ json_data: newKind }]);

    if (error) {
      console.error('Supabase Fehler:', error);
      f7.dialog.alert('Fehler beim Speichern in der Cloud. Daten werden nur lokal abgelegt.');
    } else {
      f7.toast.show({ text: 'Kind erfolgreich angelegt', icon: '<i class="f7-icons">checkmark_alt</i>', closeTimeout: 2000 });
    }

    // 4. Lokal speichern (Update LocalStorage Cache)
    const currentLocal = JSON.parse(localStorage.getItem('sitterSafe_kinder') || '[]');
    const updatedLocal = [...currentLocal, newKind];
    localStorage.setItem('sitterSafe_kinder', JSON.stringify(updatedLocal));

    setLoading(false);

    // 5. Zurück zur Übersicht navigieren
    f7router.back();
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