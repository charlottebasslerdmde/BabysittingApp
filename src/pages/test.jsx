import React from 'react';
import { Page, Navbar, Block, Button } from 'framework7-react';

const TestPage = () => {
  return (
    <Page>
      <Navbar title="🔧 Test Page" />
      <Block>
        <h1>✅ App läuft!</h1>
        <p>Wenn du das siehst, funktioniert die App grundsätzlich.</p>
        <Button fill href="/login/">Zur Login-Seite</Button>
      </Block>
    </Page>
  );
};

export default TestPage;
