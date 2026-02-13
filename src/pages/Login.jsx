import React, { useState, useEffect } from 'react';
import {
  Page,
  Navbar,
  NavTitle,
  Block,
  BlockTitle,
  List,
  ListInput,
  Button,
  Icon,
  f7
} from 'framework7-react';
import { supabase } from '../js/supabase';
import { useTranslation } from '../js/i18n';
import { syncChildrenWithSupabase } from '../js/childrenService';

const LoginPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Prüfe beim Laden der Seite, ob bereits ein User eingeloggt ist
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // User ist bereits eingeloggt -> Kinder synchronisieren
      try {
        const userId = session.user.id;
        const syncResult = await syncChildrenWithSupabase(userId);
        
        if (syncResult.success) {
          console.log('✅ Kinder erfolgreich synchronisiert:', syncResult.data.length, 'Kinder');
        }
      } catch (error) {
        console.error('Fehler bei Kinder-Sync:', error);
      }
      
      // Weiterleitung zur Home-Seite
      f7.views.main.router.navigate('/home/');
    }
  };

  // Willkommensnachricht anzeigen
  const showWelcomeMessage = async (user) => {
    try {
      // Versuche, den Namen aus dem Profil zu laden
      const { data, error } = await supabase
        .from('profiles')
        .select('babysitter_name')
        .eq('id', user.id)
        .single();
      
      let displayName = user.email;
      
      if (!error && data && data.babysitter_name) {
        displayName = data.babysitter_name;
      } else {
        // Fallback: Name aus localStorage
        const storedName = localStorage.getItem('sitterSafe_userName');
        if (storedName) {
          displayName = storedName;
        }
      }
      
      // Willkommensnachricht anzeigen
      f7.toast.show({
        text: `👋 Willkommen zurück, ${displayName}!`,
        closeTimeout: 3000,
        position: 'center',
        cssClass: 'toast-success'
      });
    } catch (err) {
      console.error('Fehler beim Laden des Profils für Willkommensnachricht:', err);
      // Fallback: Einfache Willkommensnachricht mit E-Mail
      f7.toast.show({
        text: `👋 Willkommen zurück, ${user.email}!`,
        closeTimeout: 3000,
        position: 'center',
        cssClass: 'toast-success'
      });
    }
  };

  // Magic Link Login (Passwortlos)
  const handleMagicLink = async () => {
    if (!email) {
      f7.dialog.alert(t('login_email_required'), t('login_error_title'));
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    setLoading(false);

    if (error) {
      f7.dialog.alert(error.message, t('login_error_title'));
    } else {
      setMagicLinkSent(true);
      f7.toast.show({
        text: t('login_magic_link_sent'),
        closeTimeout: 3000,
        position: 'center',
        cssClass: 'toast-success'
      });
    }
  };

  // Email/Passwort Login
  const handleEmailLogin = async () => {
    if (!email || !password) {
      f7.dialog.alert(t('login_email_password_required'), t('login_error_title'));
      return;
    }

    setLoading(true);

    let result;
    if (isSignUp) {
      // Registrierung
      result = await supabase.auth.signUp({
        email,
        password,
      });
    } else {
      // Login
      result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
    }

    setLoading(false);

    if (result.error) {
      console.error('Login error:', result.error);
      console.log('Full error object:', JSON.stringify(result.error, null, 2));
      
      // Spezielle Fehlerbehandlung
      if (result.error.code === 'email_provider_disabled' || 
          result.error.message.includes('Email signups are disabled')) {
        f7.dialog.alert(
          '<b>⚠️ Email-Login ist deaktiviert!</b><br><br>' +
          '<b>Beheben in Supabase:</b><br>' +
          '1️⃣ Authentication → Providers<br>' +
          '2️⃣ Email → "Enable Email provider" AN ✅<br>' +
          '3️⃣ "Enable email confirmations" AUS ❌<br>' +
          '4️⃣ Save<br><br>' +
          '<small>Dann App neu laden & nochmal versuchen</small>',
          '📧 Email-Provider deaktiviert'
        );
      } else if (result.error.message.includes('Email not confirmed') || 
          result.error.message.includes('not confirmed')) {
        f7.dialog.alert(
          'Deine Email-Adresse wurde noch nicht bestätigt.<br><br>' +
          '<b>3 Lösungen:</b><br>' +
          '1️⃣ Supabase: Authentication → Settings → Email Confirmations AUS<br>' +
          '2️⃣ Email-Postfach prüfen & Link klicken<br>' +
          '3️⃣ Magic Link nutzen (keine Bestätigung nötig)<br><br>' +
          '<small>Details siehe SUPABASE_CONFIG.md</small>',
          '📧 Email nicht bestätigt'
        );
      } else if (result.error.message.includes('Invalid login credentials')) {
        f7.dialog.alert(
          'Email oder Passwort falsch.<br><br>Bitte prüfe deine Eingaben.',
          '❌ Anmeldung fehlgeschlagen'
        );
      } else {
        f7.dialog.alert(
          `<b>Fehler:</b> ${result.error.message}<br><br>` +
          '<small>Prüfe Browser Console (F12) für Details</small>',
          t('login_error_title')
        );
      }
    } else {
      if (isSignUp) {
        f7.dialog.alert(
          t('login_signup_success_message'),
          t('login_signup_success_title')
        );
      } else {
        // Erfolgreicher Login -> Willkommensnachricht anzeigen
        showWelcomeMessage(result.data.user);
        
        // WICHTIG: Kinder mit Supabase synchronisieren
        try {
          const userId = result.data.user.id;
          const syncResult = await syncChildrenWithSupabase(userId);
          
          if (syncResult.success) {
            console.log('✅ Kinder erfolgreich synchronisiert:', syncResult.data.length, 'Kinder');
          } else {
            console.warn('⚠️ Kinder-Sync fehlgeschlagen:', syncResult.error);
            // Trotzdem weitermachen - lokale Daten sind vorhanden
          }
        } catch (error) {
          console.error('Fehler bei Kinder-Sync:', error);
          // Trotzdem weitermachen
        }
        
        // Weiterleitung zur Home-Seite
        f7.views.main.router.navigate('/home/');
      }
    }
  };

  return (
    <Page name="login">
      <Navbar>
        <NavTitle>{t('login_title')}</NavTitle>
      </Navbar>

      <Block strong className="text-align-center" style={{marginTop: '40px'}}>
        <div style={{fontSize: '60px', marginBottom: '20px'}}>🛡️</div>
        <h2 style={{margin: '0', color: '#007aff'}}>SitterSafe</h2>
        <p style={{color: '#888', marginTop: '8px'}}>
          {t('login_subtitle')}
        </p>
      </Block>

      {magicLinkSent ? (
        // Magic Link wurde gesendet
        <Block strong className="text-align-center" style={{margin: '20px'}}>
          <Icon f7="envelope_fill" size="60" color="green" style={{marginBottom: '16px'}} />
          <h3 style={{color: '#34c759'}}>{t('login_check_email')}</h3>
          <p style={{color: '#666', fontSize: '14px'}}>
            {t('login_magic_link_instructions')}
          </p>
          <Button
            fill
            round
            onClick={() => setMagicLinkSent(false)}
            style={{marginTop: '20px'}}
          >
            {t('login_back_to_login')}
          </Button>
        </Block>
      ) : (
        <>
          <BlockTitle medium>{isSignUp ? t('login_create_account') : t('login_sign_in')}</BlockTitle>

          <List noHairlinesMd strong inset>
            <ListInput
              label={t('login_email')}
              type="email"
              placeholder="beispiel@mail.de"
              value={email}
              onInput={(e) => setEmail(e.target.value)}
              clearButton
            >
              <Icon slot="media" f7="envelope_fill" color="blue" />
            </ListInput>
            <ListInput
              label={t('login_password')}
              type={showPassword ? 'text' : 'password'}
              placeholder={t('login_password_placeholder')}
              value={password}
              onInput={(e) => setPassword(e.target.value)}
            >
              <Icon slot="media" f7="lock_fill" color="orange" />
              <div 
                slot="content-end" 
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  cursor: 'pointer',
                  padding: '8px',
                  marginRight: '-8px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Icon 
                  f7={showPassword ? 'eye_slash_fill' : 'eye_fill'} 
                  color={showPassword ? 'gray' : 'blue'}
                  size="20px"
                />
              </div>
            </ListInput>
          </List>

          <Block>
            <Button
              fill
              large
              round
              onClick={handleEmailLogin}
              disabled={loading}
              style={{marginBottom: '12px'}}
            >
              {loading ? (
                <Icon f7="arrow_2_circlepath" className="icon-spin" />
              ) : (
                <>
                  <Icon f7={isSignUp ? 'person_badge_plus' : 'arrow_right_circle_fill'} style={{marginRight: '8px'}} />
                  {isSignUp ? t('login_register') : t('login_sign_in')}
                </>
              )}
            </Button>

            <Button
              outline
              large
              round
              onClick={() => setIsSignUp(!isSignUp)}
              disabled={loading}
            >
              {isSignUp ? t('login_already_account') : t('login_no_account')}
            </Button>
          </Block>

          <Block className="text-align-center" style={{marginTop: '30px'}}>
            <div style={{
              color: '#999',
              fontSize: '13px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <div style={{flex: 1, height: '1px', background: '#ddd'}}></div>
              {t('login_or')}
              <div style={{flex: 1, height: '1px', background: '#ddd'}}></div>
            </div>
            
            <Button
              fill
              large
              round
              color="green"
              onClick={handleMagicLink}
              disabled={loading}
            >
              <Icon f7="paperplane_fill" style={{marginRight: '8px'}} />
              {t('login_magic_link_button')}
            </Button>
            
            <p style={{
              fontSize: '12px',
              color: '#999',
              marginTop: '8px',
              padding: '0 20px'
            }}>
              {t('login_magic_link_description')}
            </p>
          </Block>

          <Block className="text-align-center" style={{marginTop: '40px'}}>
            <div style={{
              fontSize: '11px',
              color: '#999',
              padding: '0 30px',
              lineHeight: '1.5'
            }}>
              🔒 {t('login_privacy_note')}
            </div>
          </Block>
        </>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .icon-spin {
            animation: spin 1s linear infinite;
          }
        `}
      </style>
    </Page>
  );
};

export default LoginPage;
