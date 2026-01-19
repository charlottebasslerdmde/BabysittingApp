import React, { useState, useEffect } from 'react';
import {
  Page,
  Navbar,
  NavLeft,
  NavRight,
  Link,
  List,
  ListItem,
  Popup,
  Block,
  BlockTitle,
  Input,
  Button,
  Stepper,
} from 'framework7-react';

const ChildProfile = ({ f7route }) => {
  const childId = f7route.params.id;
  const [childData, setChildData] = useState({
    name: '',
    rufname: '',
    alter: '',
    geburtsdatum: '',
    foto: '',
    notfallKontakte: '',
    geschwister: '',
    grosseltern: '',
    freunde: '',
    allergien: '',
    medikamente: '',
    besondereBeduerfnisse: '',
    hausarzt: '',
    krankenkasse: '',
    essensplan: '',
    schlafenszeitRitual: '',
    hygiene: '',
    beruhigungsStrategie: '',
    medienzeit: 0,
    suessigkeitenRegel: '',
    tabuZonen: '',
    disziplin: '',
    aengste: '',
    lieblingsThemen: '',
    belohnungssystem: '',
  });
  const [popupOpened, setPopupOpened] = useState(false);
  const [currentField, setCurrentField] = useState('');
  const [tempValue, setTempValue] = useState('');

  useEffect(() => {
    const storedChildren = JSON.parse(localStorage.getItem('kinder') || '[]');
    const foundChild = storedChildren.find(c => c.id === childId);
    if (foundChild) {
      // Ensure all fields are correct types
      const sanitizedChild = {};
      Object.keys(foundChild).forEach(key => {
        if (key === 'medienzeit') {
          sanitizedChild[key] = Number(foundChild[key] || 0);
        } else if (key === 'medikamente') {
          sanitizedChild[key] = Array.isArray(foundChild[key]) ? foundChild[key].map(med => ({
            name: String(med.name || ''),
            anwendung: String(med.anwendung || ''),
            dosis: String(med.dosis || ''),
            beschreibung: String(med.beschreibung || ''),
          })) : [];
        } else {
          sanitizedChild[key] = String(foundChild[key] || '');
        }
      });
      setChildData(sanitizedChild);
    }
  }, [childId]);

  const openSheet = (field) => {
    setCurrentField(field);
    setTempValue(childData[field]);
    setPopupOpened(true);
  };

  const saveField = () => {
    setChildData(prev => ({ ...prev, [currentField]: tempValue }));
    const storedChildren = JSON.parse(localStorage.getItem('kinder') || '[]');
    const updatedChildren = storedChildren.map(c => c.id === childId ? { ...c, [currentField]: tempValue } : c);
    localStorage.setItem('kinder', JSON.stringify(updatedChildren));
    setPopupOpened(false);
  };

  const renderInput = () => {
    switch (currentField) {
      case 'geburtsdatum':
        return (
          <Input
            type="date"
            value={tempValue}
            onInput={(e) => setTempValue(e.target.value)}
            placeholder="Geburtsdatum auswählen"
          />
        );
      case 'medienzeit':
        return (
          <Stepper
            value={tempValue}
            onStepperChange={(value) => setTempValue(value)}
            min={0}
            max={24}
            step={0.5}
            autorepeat={true}
            wraps={false}
          />
        );
      case 'foto':
          return (
            <Input
              type="file"
              accept="image/*"
              onInput={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => setTempValue(reader.result);
                  reader.readAsDataURL(file);
                }
              }}
              placeholder="Bild auswählen"
            />
          );
      case 'name':
      case 'rufname':
      case 'alter':
        return (
          <Input
            type="text"
            value={tempValue}
            onInput={(e) => setTempValue(e.target.value)}
            placeholder="Eingabe..."
          />
        );
      case 'hausarzt':
      case 'krankenkasse':
      case 'allergien':
      case 'medikamente':
      case 'besondereBeduerfnisse':
      case 'notfallKontakte':
      case 'geschwister':
      case 'grosseltern':
      case 'freunde':
      case 'essensplan':
      case 'schlafenszeitRitual':
      case 'hygiene':
      case 'beruhigungsStrategie':
      case 'suessigkeitenRegel':
      case 'tabuZonen':
      case 'disziplin':
      case 'aengste':
      case 'lieblingsThemen':
      case 'belohnungssystem':
        return (
          <Input
            type="textarea"
            value={tempValue}
            onInput={(e) => setTempValue(e.target.value)}
            placeholder="Eingabe..."
          />
        );
      default:
        return (
          <Input
            type="text"
            value={tempValue}
            onInput={(e) => setTempValue(e.target.value)}
            placeholder="Eingabe..."
          />
        );
    }
  };

  return (
    <Page name="child-profile">
      <Navbar title={childData.name || 'Kind Profil'}>
        <NavLeft>
          <Link back iconIos="f7:chevron_left" iconMd="material:chevron_left"></Link>
        </NavLeft>
      </Navbar>

      <List>
        <ListItem groupTitle title="Basis-Informationen" />
        <ListItem
          title="Vollständiger Name"
          after={childData.name}
          onClick={() => openSheet('name')}
        >
          <i slot="media" className="icon f7-icons">person_circle</i>
        </ListItem>
        <ListItem
          title="Rufname"
          after={childData.rufname}
          onClick={() => openSheet('rufname')}
        >
          <i slot="media" className="icon f7-icons">person</i>
        </ListItem>
        <ListItem
          title="Alter"
          after={childData.alter}
          onClick={() => openSheet('alter')}
        >
          <i slot="media" className="icon f7-icons">calendar</i>
        </ListItem>
        <ListItem
          title="Geburtsdatum"
          after={childData.geburtsdatum}
          onClick={() => openSheet('geburtsdatum')}
        >
          <i slot="media" className="icon f7-icons">calendar_badge_plus</i>
        </ListItem>
        <ListItem
          title="Foto URL"
          after={childData.foto}
          onClick={() => openSheet('foto')}
        >
          <i slot="media" className="icon f7-icons">photo</i>
        </ListItem>
        <ListItem
          title="Notfall-Kontakte"
          after={(childData.notfallKontakte || '').substring(0, 20) + '...'}
          onClick={() => openSheet('notfallKontakte')}
        >
          <i slot="media" className="icon f7-icons">phone_circle</i>
        </ListItem>

        <ListItem groupTitle title="Familie & Freunde" />
        <ListItem
          title="Geschwister"
          after={(childData.geschwister || '').substring(0, 20) + '...'}
          onClick={() => openSheet('geschwister')}
        >
          <i slot="media" className="icon f7-icons">person_3</i>
        </ListItem>
        <ListItem
          title="Großeltern"
          after={(childData.grosseltern || '').substring(0, 20) + '...'}
          onClick={() => openSheet('grosseltern')}
        >
          <i slot="media" className="icon f7-icons">person_2</i>
        </ListItem>
        <ListItem
          title="Freunde"
          after={(childData.freunde || '').substring(0, 20) + '...'}
          onClick={() => openSheet('freunde')}
        >
          <i slot="media" className="icon f7-icons">person_2_fill</i>
        </ListItem>

        <ListItem groupTitle title="Sicherheit & Medizin" />
        <ListItem
          title="Allergien"
          after={(childData.allergien || '').substring(0, 20) + '...'}
          onClick={() => openSheet('allergien')}
        >
          <i slot="media" className="icon f7-icons">exclamationmark_shield</i>
        </ListItem>
        <ListItem
          title="Medikamente"
          after={(childData.medikamente || '').substring(0, 20) + '...'}
          onClick={() => openSheet('medikamente')}
        >
          <i slot="media" className="icon f7-icons">bandage</i>
        </ListItem>
        <ListItem
          title="Besondere Bedürfnisse"
          after={(childData.besondereBeduerfnisse || '').substring(0, 20) + '...'}
          onClick={() => openSheet('besondereBeduerfnisse')}
        >
          <i slot="media" className="icon f7-icons">heart</i>
        </ListItem>
        <ListItem
          title="Hausarzt"
          after={childData.hausarzt}
          onClick={() => openSheet('hausarzt')}
        >
          <i slot="media" className="icon f7-icons">stethoscope</i>
        </ListItem>
        <ListItem
          title="Krankenkasse"
          after={childData.krankenkasse}
          onClick={() => openSheet('krankenkasse')}
        >
          <i slot="media" className="icon f7-icons">doc_plaintext</i>
        </ListItem>

        <ListItem groupTitle title="Alltag & Routine" />
        <ListItem
          title="Essensplan"
          after={(childData.essensplan || '').substring(0, 20) + '...'}
          onClick={() => openSheet('essensplan')}
        >
          <i slot="media" className="icon f7-icons">fork_knife</i>
        </ListItem>
        <ListItem
          title="Schlafenszeit-Ritual"
          after={(childData.schlafenszeitRitual || '').substring(0, 20) + '...'}
          onClick={() => openSheet('schlafenszeitRitual')}
        >
          <i slot="media" className="icon f7-icons">moon_stars</i>
        </ListItem>
        <ListItem
          title="Hygiene"
          after={(childData.hygiene || '').substring(0, 20) + '...'}
          onClick={() => openSheet('hygiene')}
        >
          <i slot="media" className="icon f7-icons">drop</i>
        </ListItem>
        <ListItem
          title="Beruhigungs-Strategie"
          after={(childData.beruhigungsStrategie || '').substring(0, 20) + '...'}
          onClick={() => openSheet('beruhigungsStrategie')}
        >
          <i slot="media" className="icon f7-icons">hand_thumbsup</i>
        </ListItem>

        <ListItem groupTitle title="Regeln & Erziehung" />
        <ListItem
          title="Medienzeit"
          after={`${childData.medienzeit} Std`}
          onClick={() => openSheet('medienzeit')}
        >
          <i slot="media" className="icon f7-icons">tv</i>
        </ListItem>
        <ListItem
          title="Süßigkeiten-Regel"
          after={(childData.suessigkeitenRegel || '').substring(0, 20) + '...'}
          onClick={() => openSheet('suessigkeitenRegel')}
        >
          <i slot="media" className="icon f7-icons">birthday_cake</i>
        </ListItem>
        <ListItem
          title="Tabu-Zonen"
          after={(childData.tabuZonen || '').substring(0, 20) + '...'}
          onClick={() => openSheet('tabuZonen')}
        >
          <i slot="media" className="icon f7-icons">nosign</i>
        </ListItem>
        <ListItem
          title="Disziplin"
          after={(childData.disziplin || '').substring(0, 20) + '...'}
          onClick={() => openSheet('disziplin')}
        >
          <i slot="media" className="icon f7-icons">hand_raised</i>
        </ListItem>

        <ListItem groupTitle title="Psychologie & Komfort" />
        <ListItem
          title="Ängste"
          after={(childData.aengste || '').substring(0, 20) + '...'}
          onClick={() => openSheet('aengste')}
        >
          <i slot="media" className="icon f7-icons">exclamationmark_triangle</i>
        </ListItem>
        <ListItem
          title="Lieblings-Themen"
          after={(childData.lieblingsThemen || '').substring(0, 20) + '...'}
          onClick={() => openSheet('lieblingsThemen')}
        >
          <i slot="media" className="icon f7-icons">star</i>
        </ListItem>
        <ListItem
          title="Belohnungssystem"
          after={(childData.belohnungssystem || '').substring(0, 20) + '...'}
          onClick={() => openSheet('belohnungssystem')}
        >
          <i slot="media" className="icon f7-icons">gift</i>
        </ListItem>
      </List>

      <Popup
        opened={popupOpened}
        onPopupClosed={() => setPopupOpened(false)}
      >
        <Block>
          <BlockTitle>{currentField ? currentField.charAt(0).toUpperCase() + currentField.slice(1).replace(/([A-Z])/g, ' $1') : 'Bearbeiten'}</BlockTitle>
          {renderInput()}
          <Button fill onClick={saveField}>Speichern</Button>
          <Button onClick={() => setPopupOpened(false)}>Abbrechen</Button>
        </Block>
      </Popup>
    </Page>
  );
};

export default ChildProfile;