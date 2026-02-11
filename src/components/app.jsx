import React, { useState, useEffect } from 'react';

import {
  f7,
  f7ready,
  App,
  Panel,
  Views,
  View,
  Popup,
  Page,
  Navbar,
  NavRight,
  Link,
  Block,
} from 'framework7-react';


import routes from '../js/routes';
import store from '../js/store';
import { initI18n, t } from '../js/i18n';
import { supabase } from '../js/supabase';

const MyApp = () => {
  // Offline-Status
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Auth State Change Listener
  useEffect(() => {
    // Listen for auth changes (email confirmation, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);
      
      if (event === 'SIGNED_IN' && session) {
        // User wurde eingeloggt (z.B. nach Email-Bestätigung)
        setTimeout(() => {
          if (f7.views.main) {
            f7.views.main.router.navigate('/home/');
          }
        }, 100);
      }
      
      if (event === 'SIGNED_OUT') {
        // User wurde ausgeloggt
        if (f7.views.main) {
          f7.views.main.router.navigate('/login/');
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Offline/Online Event Listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      f7.toast.show({
        text: t('toast_online'),
        closeTimeout: 2000,
        position: 'top',
        cssClass: 'toast-online'
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      f7.toast.show({
        text: t('toast_offline'),
        closeTimeout: 3000,
        position: 'top',
        cssClass: 'toast-offline'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Framework7 Parameters
  const f7params = {
    name: 'SitterSafe', // App name
      theme: 'ios', // iOS theme for native look
      colors: {
        primary: '#00e1ff',
      },



      // App store
      store: store,
      // App routes
      routes: routes,

      // Register service worker (only on production build)
      serviceWorker: process.env.NODE_ENV ==='production' ? {
        path: '/service-worker.js',
      } : {},
  };
  f7ready(() => {
    initI18n();

    // Call F7 APIs here
  });

  return (
    <App { ...f7params }>
      
      {/* Offline-Indikator */}
      {!isOnline && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(135deg, #ff9500 0%, #ff6b00 100%)',
          color: 'white',
          padding: '8px 16px',
          textAlign: 'center',
          fontSize: '13px',
          fontWeight: '600',
          zIndex: 10000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '16px' }}>📡</span>
          <span>Offline - Daten werden lokal gespeichert</span>
          <span style={{ fontSize: '16px' }}>💾</span>
        </div>
      )}

        {/* Left panel with cover effect*/}
        <Panel left cover dark>
          <View>
            <Page>
              <Navbar title="Linkes Panel"/>
              <Block>Inhalt des linken Panels kommt hier hin</Block>
            </Page>
          </View>
        </Panel>


        {/* Right panel with reveal effect*/}
        <Panel right reveal dark>
          <View>
            <Page>
              <Navbar title="Rechtes Panel"/>
              <Block>Inhalt des rechten Panels kommt hier hin</Block>
            </Page>
          </View>
        </Panel>


        {/* Views/Tabs container */}
        <Views>
          {/* Main view */}
          <View main url="/" />
        </Views>

      {/* Popup */}
      <Popup id="my-popup">
        <View>
          <Page>
            <Navbar title="Popup">
              <NavRight>
                <Link popupClose>Schließen</Link>
              </NavRight>
            </Navbar>
            <Block>
              <p>Popup-Inhalt kommt hier hin.</p>
            </Block>
          </Page>
        </View>
      </Popup>

      <style>
        {`
          .toast-online {
            background: linear-gradient(135deg, #34c759 0%, #30d158 100%);
          }
          .toast-offline {
            background: linear-gradient(135deg, #ff9500 0%, #ff6b00 100%);
          }
        `}
      </style>
    </App>
  )
}
export default MyApp;