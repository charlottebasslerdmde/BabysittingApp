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
  Toolbar,
  ToolbarPane,
  NavRight,
  Link,
  Block,
  BlockTitle,
  LoginScreen,
  LoginScreenTitle,
  List,
  ListItem,
  ListInput,
  ListButton,
  BlockFooter
} from 'framework7-react';


import routes from '../js/routes';
import store from '../js/store';
import { initI18n, t } from '../js/i18n';

const MyApp = () => {
  // Login screen demo data
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Offline-Status
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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
  const alertLoginData = () => {
    f7.dialog.alert('Username: ' + username + '<br>Password: ' + password, () => {
      f7.loginScreen.close();
    });
  }
  f7ready(() => {
    // Initialize i18n
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
        <Views tabs className="safe-areas">
          {/* Tabbar for switching views-tabs */}
          <Toolbar tabbar icons bottom>
            <ToolbarPane>
              <Link tabLink="#view-home" tabLinkActive iconIos="f7:house_fill" iconMd="material:home" text="Home" />
              <Link tabLink="#view-catalog" iconIos="f7:square_list_fill" iconMd="material:view_list" text="Kids" />
              <Link tabLink="#view-settings" iconIos="f7:gear" iconMd="material:settings" text="Settings" />
            </ToolbarPane>
          </Toolbar>

          {/* Your main view/tab, should have "view-main" class. It also has "tabActive" prop */}
          <View id="view-home" main tab tabActive url="/" />

          {/* Catalog View */}
          <View id="view-catalog" name="catalog" tab url="/catalog/" />

          {/* Settings View */}
          <View id="view-settings" name="settings" tab url="/settings/" />

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

      <LoginScreen id="my-login-screen">
        <View>
          <Page loginScreen>
            <LoginScreenTitle>Anmelden</LoginScreenTitle>
            <List form>
              <ListInput
                type="text"
                name="username"
                placeholder="Dein Benutzername"
                value={username}
                onInput={(e) => setUsername(e.target.value)}
              ></ListInput>
              <ListInput
                type="password"
                name="password"
                placeholder="Dein Passwort"
                value={password}
                onInput={(e) => setPassword(e.target.value)}
              ></ListInput>
            </List>
            <List>
              <ListButton title="Anmelden" onClick={() => alertLoginData()} />
              <BlockFooter>
                Informationen zur Anmeldung.<br />Klicke „Anmelden“ um den Login-Bildschirm zu schließen
              </BlockFooter>
            </List>
          </Page>
        </View>
      </LoginScreen>
    </App>
  )
}
export default MyApp;