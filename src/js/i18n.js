// i18n.js - Internationalisierung für SitterSafe App
// Unterstützte Sprachen: Deutsch (de), Englisch (en)

import React from 'react';

const translations = {
  de: {
    // Allgemein
    app_name: 'SitterSafe',
    cancel: 'Abbrechen',
    save: 'Speichern',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    add: 'Hinzufügen',
    back: 'Zurück',
    close: 'Schließen',
    confirm: 'Bestätigen',
    ok: 'OK',
    yes: 'Ja',
    no: 'Nein',
    loading: 'Wird geladen...',
    error: 'Fehler',
    success: 'Erfolgreich',
    
    // Kinder-Seite
    kinder_page_title: 'Meine Schützlinge',
    kinder_empty_state: 'Noch keine Kinder angelegt.',
    kinder_create_first: 'Erstes Profil erstellen',
    kinder_new_profile: 'Neues Profil',
    kinder_add_photo: 'Foto hinzufügen',
    kinder_first_name: 'Vorname *',
    kinder_name_placeholder: 'Wie heißt das Kind?',
    kinder_create_profile: 'Profil erstellen',
    kinder_delete_confirm: 'Möchtest du dieses Profil wirklich löschen?',
    kinder_delete_title: 'SitterSafe',
    kinder_created_success: 'Kind erfolgreich angelegt',
    kinder_name_required: 'Bitte einen Namen eingeben',
    kinder_no_nickname: 'Kein Spitzname',
    kinder_allergies_warning: '⚠️ Allergien vermerkt',
    kinder_all_ok: '✅ Alles ok',
    kinder_status: 'Status',
    
    // Home-Seite
    home_title: 'Willkommen',
    home_tracker: 'Tracker',
    home_profiles: 'Profile',
    home_moment: 'Moment',
    home_quick_access: 'Schnellzugriff',
    home_recent_activities: 'Letzte Aktivitäten',
    home_no_activities: 'Noch keine Aktivitäten',
    home_emergency: 'Notfall',
    home_notes: 'Notizen',
    home_timer: 'Timer',
    
    // Settings-Seite
    settings_title: 'Einstellungen',
    settings_appearance: 'Darstellung',
    settings_dark_mode: 'Dark Mode',
    settings_theme_color: 'Akzentfarbe',
    settings_language: 'Sprache',
    settings_language_german: 'Deutsch',
    settings_language_english: 'English',
    settings_notifications: 'Benachrichtigungen',
    settings_sound: 'Sound',
    settings_haptics: 'Vibration',
    settings_biometrics: 'Biometrische Authentifizierung',
    settings_security: 'Sicherheit',
    settings_backup: 'Backup & Daten',
    settings_auto_backup: 'Automatisches Backup',
    settings_export: 'Daten exportieren',
    settings_import: 'Daten importieren',
    settings_cloud_backup: 'Cloud-Backup',
    settings_cloud_restore: 'Cloud-Wiederherstellung',
    settings_about: 'Über',
    settings_version: 'Version',
    settings_help: 'Hilfe & Support',
    settings_feedback: 'Feedback senden',
    settings_reset: 'App zurücksetzen',
    settings_language_changed: 'Sprache auf Deutsch gesetzt',
    settings_notifications_on: 'Benachrichtigungen aktiviert',
    settings_notifications_off: 'Stumm geschaltet',
    settings_sound_on: '🔊 Sound an',
    settings_sound_off: '🔇 Sound aus',
    settings_haptics_on: 'Vibration an',
    settings_auto_backup_on: '☁️ Auto-Backup aktiviert',
    settings_emergency_mode: '🚨 NOTFALL-MODUS AKTIV',
    settings_export_success: '✅ Export abgeschlossen',
    settings_import_success: '✅ Import erfolgreich',
    settings_cache_cleared: '🧹 Cache geleert',
    
    // Kind-Detail-Seite
    kind_detail_basic_info: 'Basis-Informationen',
    kind_detail_name: 'Name',
    kind_detail_nickname: 'Rufname/Spitzname',
    kind_detail_birthdate: 'Geburtsdatum',
    kind_detail_safety: 'Sicherheit & Gesundheit',
    kind_detail_emergency_contacts: 'Notfall-Kontakte',
    kind_detail_allergies: 'Allergien',
    kind_detail_medications: 'Medikamente',
    kind_detail_doctor: 'Hausarzt',
    kind_detail_insurance: 'Krankenkasse',
    kind_detail_routine: 'Routine & Gewohnheiten',
    kind_detail_meal_plan: 'Essensplan',
    kind_detail_bedtime_ritual: 'Schlafenszeit-Ritual',
    kind_detail_hygiene: 'Hygiene',
    kind_detail_rules: 'Regeln & Grenzen',
    kind_detail_screen_time: 'Medienzeit',
    kind_detail_sweets: 'Süßigkeiten',
    kind_detail_forbidden_zones: 'Tabu-Zonen',
    kind_detail_psychology: 'Psychologie & Verhalten',
    kind_detail_fears: 'Ängste',
    kind_detail_calming_strategy: 'Beruhigungsstrategie',
    kind_detail_reward_system: 'Belohnungssystem',
    kind_detail_activity_log: 'Aktivitäts-Protokoll',
    kind_detail_save_success: 'Änderungen gespeichert',
    
    // Nightlight-Seite
    nightlight_title: 'Nachtlicht',
    nightlight_color: 'Farbe',
    nightlight_brightness: 'Helligkeit',
    nightlight_timer: 'Timer',
    nightlight_sound: 'Beruhigender Sound',
    
    // Fact-Seite
    fact_title: 'Wusstest du?',
    fact_next: 'Nächster Fakt',
    fact_share: 'Teilen',
    
    // About-Seite
    about_title: 'Über SitterSafe',
    about_description: 'Die sichere Babysitter-App',
    about_version: 'Version',
    about_developer: 'Entwickelt mit ❤️',
    
    // Toasts & Feedback
    toast_online: '✅ Verbindung wiederhergestellt',
    toast_offline: '📡 Offline - Daten werden lokal gespeichert',
  },
  
  en: {
    // General
    app_name: 'SitterSafe',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    back: 'Back',
    close: 'Close',
    confirm: 'Confirm',
    ok: 'OK',
    yes: 'Yes',
    no: 'No',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    
    // Children Page
    kinder_page_title: 'My Children',
    kinder_empty_state: 'No children added yet.',
    kinder_create_first: 'Create first profile',
    kinder_new_profile: 'New Profile',
    kinder_add_photo: 'Add photo',
    kinder_first_name: 'First Name *',
    kinder_name_placeholder: "What's the child's name?",
    kinder_create_profile: 'Create profile',
    kinder_delete_confirm: 'Do you really want to delete this profile?',
    kinder_delete_title: 'SitterSafe',
    kinder_created_success: 'Child successfully created',
    kinder_name_required: 'Please enter a name',
    kinder_no_nickname: 'No nickname',
    kinder_allergies_warning: '⚠️ Allergies noted',
    kinder_all_ok: '✅ All good',
    kinder_status: 'Status',
    
    // Home Page
    home_title: 'Welcome',
    home_tracker: 'Tracker',
    home_profiles: 'Profiles',
    home_moment: 'Moment',
    home_quick_access: 'Quick Access',
    home_recent_activities: 'Recent Activities',
    home_no_activities: 'No activities yet',
    home_emergency: 'Emergency',
    home_notes: 'Notes',
    home_timer: 'Timer',
    
    // Settings Page
    settings_title: 'Settings',
    settings_appearance: 'Appearance',
    settings_dark_mode: 'Dark Mode',
    settings_theme_color: 'Accent Color',
    settings_language: 'Language',
    settings_language_german: 'German',
    settings_language_english: 'English',
    settings_notifications: 'Notifications',
    settings_sound: 'Sound',
    settings_haptics: 'Haptic Feedback',
    settings_biometrics: 'Biometric Authentication',
    settings_security: 'Security',
    settings_backup: 'Backup & Data',
    settings_auto_backup: 'Automatic Backup',
    settings_export: 'Export Data',
    settings_import: 'Import Data',
    settings_cloud_backup: 'Cloud Backup',
    settings_cloud_restore: 'Cloud Restore',
    settings_about: 'About',
    settings_version: 'Version',
    settings_help: 'Help & Support',
    settings_feedback: 'Send Feedback',
    settings_reset: 'Reset App',
    settings_language_changed: 'Language set to English',
    settings_notifications_on: 'Notifications enabled',
    settings_notifications_off: 'Muted',
    settings_sound_on: '🔊 Sound on',
    settings_sound_off: '🔇 Sound off',
    settings_haptics_on: 'Haptics on',
    settings_auto_backup_on: '☁️ Auto-backup enabled',
    settings_emergency_mode: '🚨 EMERGENCY MODE ACTIVE',
    settings_export_success: '✅ Export completed',
    settings_import_success: '✅ Import successful',
    settings_cache_cleared: '🧹 Cache cleared',
    
    // Child Detail Page
    kind_detail_basic_info: 'Basic Information',
    kind_detail_name: 'Name',
    kind_detail_nickname: 'Nickname',
    kind_detail_birthdate: 'Date of Birth',
    kind_detail_safety: 'Safety & Health',
    kind_detail_emergency_contacts: 'Emergency Contacts',
    kind_detail_allergies: 'Allergies',
    kind_detail_medications: 'Medications',
    kind_detail_doctor: 'Doctor',
    kind_detail_insurance: 'Health Insurance',
    kind_detail_routine: 'Routine & Habits',
    kind_detail_meal_plan: 'Meal Plan',
    kind_detail_bedtime_ritual: 'Bedtime Ritual',
    kind_detail_hygiene: 'Hygiene',
    kind_detail_rules: 'Rules & Boundaries',
    kind_detail_screen_time: 'Screen Time',
    kind_detail_sweets: 'Sweets',
    kind_detail_forbidden_zones: 'Forbidden Zones',
    kind_detail_psychology: 'Psychology & Behavior',
    kind_detail_fears: 'Fears',
    kind_detail_calming_strategy: 'Calming Strategy',
    kind_detail_reward_system: 'Reward System',
    kind_detail_activity_log: 'Activity Log',
    kind_detail_save_success: 'Changes saved',
    
    // Nightlight Page
    nightlight_title: 'Nightlight',
    nightlight_color: 'Color',
    nightlight_brightness: 'Brightness',
    nightlight_timer: 'Timer',
    nightlight_sound: 'Soothing Sound',
    
    // Fact Page
    fact_title: 'Did you know?',
    fact_next: 'Next Fact',
    fact_share: 'Share',
    
    // About Page
    about_title: 'About SitterSafe',
    about_description: 'The secure babysitting app',
    about_version: 'Version',
    about_developer: 'Made with ❤️',
    
    // Toasts & Feedback
    toast_online: '✅ Connection restored',
    toast_offline: '📡 Offline - Data saved locally',
  }
};

// Aktuell gewählte Sprache (wird aus LocalStorage geladen)
let currentLanguage = 'de';

// Initialisierung: Sprache aus LocalStorage laden
export const initI18n = () => {
  const storedLang = localStorage.getItem('sitterSafe_language');
  if (storedLang && translations[storedLang]) {
    currentLanguage = storedLang;
  }
};

// Sprache setzen
export const setLanguage = (lang) => {
  if (translations[lang]) {
    currentLanguage = lang;
    localStorage.setItem('sitterSafe_language', lang);
    
    // Event auslösen für React-Komponenten, die neu rendern müssen
    window.dispatchEvent(new Event('languageChanged'));
    
    return true;
  }
  return false;
};

// Aktuell gewählte Sprache abrufen
export const getLanguage = () => {
  return currentLanguage;
};

// Übersetzung abrufen (mit Fallback)
export const t = (key, fallback = null) => {
  const translation = translations[currentLanguage]?.[key];
  if (translation !== undefined) {
    return translation;
  }
  
  // Fallback auf Deutsch
  if (currentLanguage !== 'de' && translations.de[key]) {
    return translations.de[key];
  }
  
  // Wenn kein Fallback angegeben, gib den Key zurück
  return fallback !== null ? fallback : key;
};

// React Hook für i18n in funktionalen Komponenten
export const useTranslation = () => {
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  
  React.useEffect(() => {
    const handleLanguageChange = () => forceUpdate();
    window.addEventListener('languageChanged', handleLanguageChange);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);
  
  return { t, currentLanguage, setLanguage };
};

// Alle verfügbaren Sprachen
export const availableLanguages = [
  { code: 'de', name: 'Deutsch' },
  { code: 'en', name: 'English' }
];

export default { t, setLanguage, getLanguage, initI18n, useTranslation, availableLanguages };
