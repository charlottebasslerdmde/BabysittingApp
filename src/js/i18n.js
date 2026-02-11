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
    home_tracker: 'Zeiterfassung',
    home_profiles: 'Profile',
    home_moment: 'Moment',
    home_quick_access: 'Schnellzugriff',
    home_recent_activities: 'Letzte Aktivitäten',
    home_no_activities: 'Noch keine Aktivitäten',
    home_emergency: 'Notfall',
    home_notes: 'Notizen',
    home_timer: 'Zeitmesser',
    
    // Settings-Seite
    settings_title: 'Einstellungen',
    settings_appearance: 'Darstellung',
    settings_dark_mode: 'Dunkelmodus',
    settings_theme_color: 'Akzentfarbe',
    settings_language: 'Sprache',
    settings_language_german: 'Deutsch',
    settings_language_english: 'Englisch',
    settings_notifications: 'Benachrichtigungen',
    settings_sound: 'Ton',
    settings_haptics: 'Vibration',
    settings_biometrics: 'Biometrische Authentifizierung',
    settings_security: 'Sicherheit',
    settings_backup: 'Sicherung & Daten',
    settings_auto_backup: 'Automatische Sicherung',
    settings_export: 'Daten exportieren',
    settings_import: 'Daten importieren',
    settings_cloud_backup: 'Cloud-Sicherung',
    settings_cloud_restore: 'Cloud-Wiederherstellung',
    settings_about: 'Über',
    settings_version: 'Version',
    settings_help: 'Hilfe & Unterstützung',
    settings_feedback: 'Rückmeldung senden',
    settings_reset: 'App zurücksetzen',
    settings_language_changed: 'Sprache auf Deutsch gesetzt',
    settings_notifications_on: 'Benachrichtigungen aktiviert',
    settings_notifications_off: 'Stumm geschaltet',
    settings_sound_on: '🔊 Ton an',
    settings_sound_off: '🔇 Ton aus',
    settings_haptics_on: 'Vibration an',
    settings_auto_backup_on: '☁️ Auto-Sicherung aktiviert',
    settings_emergency_mode: '🚨 NOTFALL-MODUS AKTIV',
    settings_export_success: '✅ Export abgeschlossen',
    settings_import_success: '✅ Import erfolgreich',
    settings_cache_cleared: '🧹 Zwischenspeicher geleert',
    settings_general: 'Allgemein',
    settings_babysitter_profile: 'Babysitter Profil',
    settings_your_name: 'Dein Name',
    settings_your_stats: 'Deine Statistiken',
    settings_children_count: 'Kinder',
    settings_events_count: 'Ereignisse',
    settings_storage: 'Speicher',
    settings_theme_color_label: 'Theme-Farbe',
    settings_reminder_label: 'Erinnerung alle...',
    settings_reminder_30min: '30 Minuten',
    settings_reminder_1h: '1 Stunde',
    settings_reminder_2h: '2 Stunden',
    settings_reminder_3h: '3 Stunden',
    settings_reminder_off: 'Aus',
    settings_default_child: 'Standard-Kind',
    settings_always_ask: 'Immer fragen',
    
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
    nightlight_timer: 'Zeitschaltuhr',
    nightlight_sound: 'Beruhigender Klang',
    
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
    
    // Tracker / Home Page
    tracker_title: 'Tracker',
    tracker_children: 'Kinder',
    tracker_photos: 'Fotos',
    tracker_install_app: 'App installieren',
    tracker_install_description: 'Zum Home-Screen hinzufügen für schnelleren Zugriff',
    tracker_install_button: 'Installieren',
    tracker_install_later: 'Später',
    tracker_install_ios_title: 'Installation',
    tracker_install_ios_step1: 'Tippe auf das <b>Teilen-Symbol</b> <span style="font-size: 20px;">⎋</span> unten',
    tracker_install_ios_step2: 'Scrolle und wähle <b>"Zum Home-Bildschirm"</b>',
    tracker_install_ios_step3: 'Tippe auf <b>"Hinzufügen"</b>',
    tracker_install_ios_footer: 'Danach kannst du SitterSafe wie eine normale App öffnen! 🎉',
    tracker_install_dismissed: 'Du kannst die App jederzeit über die Browser-Einstellungen installieren',
    tracker_fact_title: 'Wusstest du?',
    tracker_today: 'Heute',
    tracker_food: 'Essen',
    tracker_sleep: 'Schlaf',
    tracker_diaper: 'Windel',
    tracker_play: 'Spiel',
    tracker_record_activity: 'Aktivität erfassen',
    tracker_nightlight: 'Nachtlicht einschalten',
    tracker_protocol_today: 'Heutiges Protokoll',
    tracker_no_activities: 'Noch keine Aktivitäten heute',
    tracker_tap_icon: 'Tippe oben auf ein Icon',
    tracker_share_protocol: 'Protokoll teilen',
    tracker_deleted: 'Gelöscht',
    tracker_undo: 'Rückgängig',
    tracker_nothing_to_share: 'Nichts zu teilen!',
    tracker_share_footer: 'Gesendet mit SitterSafe 🛡️',
    tracker_protocol_copied: '📋 In Zwischenablage kopiert',
    tracker_share_failed: 'Teilen fehlgeschlagen',
    tracker_saved: 'gespeichert',
    tracker_activity_saved: 'Aktivität gespeichert',
    
    // Activity Details
    activity_food_title: 'Essen',
    activity_sleep_title: 'Schlaf',
    activity_diaper_title: 'Windel',
    activity_play_title: 'Spielzeit',
    activity_which_child: 'Für welches Kind?',
    activity_please_select: 'Bitte wählen',
    activity_mood: 'Wie war die Stimmung?',
    activity_what_eaten: 'Was wurde gegessen?',
    activity_what_placeholder: 'z.B. Brei, Apfel...',
    activity_amount: 'Menge',
    activity_amount_placeholder: 'z.B. 150ml, halber Teller...',
    activity_notes: 'Notizen',
    activity_notes_placeholder: 'Weitere Infos...',
    activity_from: 'Von',
    activity_to: 'Bis',
    activity_quality: 'Qualität',
    activity_quality_deep: 'Tief & ruhig',
    activity_quality_normal: 'Normal',
    activity_quality_restless: 'Unruhig',
    activity_diaper_type: 'Art',
    activity_diaper_wet: '💦 Nass',
    activity_diaper_full: '💩 Voll',
    activity_diaper_both: '💦💩 Beides',
    activity_diaper_notes_placeholder: 'z.B. Ausschlag, Konsistenz...',
    activity_play_activity: 'Aktivität',
    activity_play_placeholder: 'z.B. Bauklötze, Buch lesen...',
    activity_duration: 'Dauer',
    activity_duration_placeholder: 'z.B. 30 Min...',
    activity_mood_placeholder: 'Wie war die Stimmung?',
    
    // Children Tab
    children_title: 'Betreute Kinder',
    children_no_profiles: 'Keine Profile gefunden',
    children_create_first_profile: 'Erstelle dein erstes Kind-Profil',
    
    // Photos Tab
    photos_capture_moment: 'Moment festhalten',
    photos_description: 'Teile besondere Momente sicher mit den Eltern.',
    photos_open_camera: 'Kamera öffnen',
    photos_not_stored: 'Fotos werden nicht lokal gespeichert.',
    
    // Safety Sheet
    safety_center: 'Sicherheits-Center',
    safety_done: 'Fertig',
    safety_emergency: 'Im Notfall',
    safety_emergency_call: 'NOTRUF 112',
    safety_tip: 'Tipp:',
    safety_tip_text: 'Trage unten die Telefonnummern der Eltern ein, damit du sie schnell anrufen kannst!',
    safety_parent: 'Elternteil',
    safety_location_title: 'Unser Standort',
    safety_address_placeholder: '📍 Adresse eingeben (für Notfälle wichtig)...',
    safety_tonight: 'Heute Abend',
    safety_return_time: 'Rückkehr um:',
    safety_parents_location: 'Eltern sind:',
    safety_parents_location_placeholder: 'z.B. Restaurant, Kino...',
    safety_notes_placeholder: 'Besondere Hinweise für heute...',
    safety_house_wifi: 'Haus & Wifi',
    safety_emergency_contacts: 'Notfall-Kontakte bearbeiten',
    safety_parent1_name: 'Name Elternteil 1',
    safety_parent1_placeholder: 'z.B. Mama, Papa...',
    safety_phone1: 'Telefon 1',
    safety_phone_placeholder: '+49...',
    safety_parent2_name: 'Name Elternteil 2',
    safety_phone2: 'Telefon 2',
    safety_wifi_credentials: 'WLAN Zugangsdaten',
    safety_wifi_name: 'WLAN Name',
    safety_wifi_name_placeholder: 'Netzwerkname...',
    safety_wifi_password: 'Passwort',
    safety_wifi_password_placeholder: 'WLAN-Passwort...',
    
    // Login-Seite
    login_title: 'Anmelden',
    login_subtitle: 'Sichere Kinderbetreuung leicht gemacht',
    login_email: 'E-Mail',
    login_password: 'Passwort',
    login_password_placeholder: 'Mindestens 6 Zeichen',
    login_sign_in: 'Anmelden',
    login_register: 'Registrieren',
    login_create_account: 'Account erstellen',
    login_already_account: 'Bereits registriert? Anmelden',
    login_no_account: 'Noch kein Account? Registrieren',
    login_or: 'oder',
    login_magic_link_button: 'Magic Link senden',
    login_magic_link_description: 'Passwortlos per E-Mail anmelden',
    login_magic_link_sent: '✅ Magic Link wurde versendet!',
    login_check_email: 'E-Mail prüfen!',
    login_magic_link_instructions: 'Wir haben dir einen Anmelde-Link per E-Mail geschickt. Klicke auf den Link, um dich anzumelden.',
    login_back_to_login: 'Zurück zur Anmeldung',
    login_email_required: 'Bitte gib eine E-Mail-Adresse ein.',
    login_email_password_required: 'Bitte E-Mail und Passwort eingeben.',
    login_error_title: 'Anmeldefehler',
    login_signup_success_title: 'Registrierung erfolgreich!',
    login_signup_success_message: 'Bitte prüfe deine E-Mails und bestätige deine Anmeldung.',
    login_privacy_note: 'Deine Daten werden verschlüsselt und sicher gespeichert.',
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
    settings_general: 'General',
    settings_babysitter_profile: 'Babysitter Profile',
    settings_your_name: 'Your Name',
    settings_your_stats: 'Your statistics',
    settings_children_count: 'Children',
    settings_events_count: 'Events',
    settings_storage: 'Storage',
    settings_theme_color_label: 'Theme color',
    settings_reminder_label: 'Reminder every...',
    settings_reminder_30min: '30 minutes',
    settings_reminder_1h: '1 hour',
    settings_reminder_2h: '2 hours',
    settings_reminder_3h: '3 hours',
    settings_reminder_off: 'Off',
    settings_default_child: 'Default child',
    settings_always_ask: 'Always ask',
    
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
    
    // Tracker / Home Page
    tracker_title: 'Tracker',
    tracker_children: 'Children',
    tracker_photos: 'Photos',
    tracker_install_app: 'Install App',
    tracker_install_description: 'Add to home screen for faster access',
    tracker_install_button: 'Install',
    tracker_install_later: 'Later',
    tracker_install_ios_title: 'Installation',
    tracker_install_ios_step1: 'Tap the <b>Share icon</b> <span style="font-size: 20px;">⎋</span> below',
    tracker_install_ios_step2: 'Scroll and select <b>"Add to Home Screen"</b>',
    tracker_install_ios_step3: 'Tap <b>"Add"</b>',
    tracker_install_ios_footer: 'Then you can open SitterSafe like a normal app! 🎉',
    tracker_install_dismissed: 'You can install the app anytime through browser settings',
    tracker_fact_title: 'Did you know?',
    tracker_today: 'Today',
    tracker_food: 'Food',
    tracker_sleep: 'Sleep',
    tracker_diaper: 'Diaper',
    tracker_play: 'Play',
    tracker_record_activity: 'Record Activity',
    tracker_nightlight: 'Turn on nightlight',
    tracker_protocol_today: "Today's Log",
    tracker_no_activities: 'No activities today yet',
    tracker_tap_icon: 'Tap an icon above',
    tracker_share_protocol: 'Share Log',
    tracker_deleted: 'Deleted',
    tracker_undo: 'Undo',
    tracker_nothing_to_share: 'Nothing to share!',
    tracker_share_footer: 'Sent with SitterSafe 🛡️',
    tracker_protocol_copied: '📋 Copied to clipboard',
    tracker_share_failed: 'Sharing failed',
    tracker_saved: 'saved',
    tracker_activity_saved: 'Activity saved',
    
    // Activity Details
    activity_food_title: 'Food',
    activity_sleep_title: 'Sleep',
    activity_diaper_title: 'Diaper',
    activity_play_title: 'Playtime',
    activity_which_child: 'For which child?',
    activity_please_select: 'Please select',
    activity_mood: "How was the mood?",
    activity_what_eaten: 'What was eaten?',
    activity_what_placeholder: 'e.g. porridge, apple...',
    activity_amount: 'Amount',
    activity_amount_placeholder: 'e.g. 150ml, half plate...',
    activity_notes: 'Notes',
    activity_notes_placeholder: 'Additional info...',
    activity_from: 'From',
    activity_to: 'To',
    activity_quality: 'Quality',
    activity_quality_deep: 'Deep & calm',
    activity_quality_normal: 'Normal',
    activity_quality_restless: 'Restless',
    activity_diaper_type: 'Type',
    activity_diaper_wet: '💦 Wet',
    activity_diaper_full: '💩 Full',
    activity_diaper_both: '💦💩 Both',
    activity_diaper_notes_placeholder: 'e.g. rash, consistency...',
    activity_play_activity: 'Activity',
    activity_play_placeholder: 'e.g. blocks, reading book...',
    activity_duration: 'Duration',
    activity_duration_placeholder: 'e.g. 30 min...',
    activity_mood_placeholder: 'How was the mood?',
    
    // Children Tab
    children_title: 'Children in Care',
    children_no_profiles: 'No profiles found',
    children_create_first_profile: 'Create your first child profile',
    
    // Photos Tab
    photos_capture_moment: 'Capture the moment',
    photos_description: 'Share special moments securely with parents.',
    photos_open_camera: 'Open camera',
    photos_not_stored: 'Photos are not stored locally.',
    
    // Safety Sheet
    safety_center: 'Safety Center',
    safety_done: 'Done',
    safety_emergency: 'In Emergency',
    safety_emergency_call: 'EMERGENCY 112',
    safety_tip: 'Tip:',
    safety_tip_text: 'Enter the phone numbers of the parents below so you can call them quickly!',
    safety_parent: 'Parent',
    safety_location_title: 'Our Location',
    safety_address_placeholder: '📍 Enter address (important for emergencies)...',
    safety_tonight: 'Tonight',
    safety_return_time: 'Return at:',
    safety_parents_location: "Parents' location:",
    safety_parents_location_placeholder: 'e.g. restaurant, cinema...',
    safety_notes_placeholder: 'Special notes for today...',
    safety_house_wifi: 'House & WiFi',
    safety_emergency_contacts: 'Edit emergency contacts',
    safety_parent1_name: 'Parent 1 name',
    safety_parent1_placeholder: 'e.g. Mom, Dad...',
    safety_phone1: 'Phone 1',
    safety_phone_placeholder: '+49...',
    safety_parent2_name: 'Parent 2 name',
    safety_phone2: 'Phone 2',
    safety_wifi_credentials: 'WiFi credentials',
    safety_wifi_name: 'WiFi name',
    safety_wifi_name_placeholder: 'Network name...',
    safety_wifi_password: 'Password',
    safety_wifi_password_placeholder: 'WiFi password...',
    
    // Login Page
    login_title: 'Sign In',
    login_subtitle: 'Secure childcare made easy',
    login_email: 'Email',
    login_password: 'Password',
    login_password_placeholder: 'At least 6 characters',
    login_sign_in: 'Sign In',
    login_register: 'Register',
    login_create_account: 'Create account',
    login_already_account: 'Already registered? Sign in',
    login_no_account: "Don't have an account? Register",
    login_or: 'or',
    login_magic_link_button: 'Send Magic Link',
    login_magic_link_description: 'Passwordless login via email',
    login_magic_link_sent: '✅ Magic Link sent!',
    login_check_email: 'Check your email!',
    login_magic_link_instructions: "We've sent you a login link via email. Click the link to sign in.",
    login_back_to_login: 'Back to login',
    login_email_required: 'Please enter an email address.',
    login_email_password_required: 'Please enter email and password.',
    login_error_title: 'Login Error',
    login_signup_success_title: 'Registration successful!',
    login_signup_success_message: 'Please check your email and confirm your registration.',
    login_privacy_note: 'Your data is encrypted and stored securely.',
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
