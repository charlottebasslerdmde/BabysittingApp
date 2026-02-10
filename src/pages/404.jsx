import React from 'react';
import { Page, Navbar, Block } from 'framework7-react';

const NotFoundPage = () => (
  <Page>
    <Navbar title="Nicht gefunden" backLink />
    <Block strong inset>
      <p>Entschuldigung</p>
      <p>Der angeforderte Inhalt wurde nicht gefunden.</p>
    </Block>
  </Page>
);

export default NotFoundPage;
