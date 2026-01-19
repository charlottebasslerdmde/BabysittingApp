import React from 'react';
import {
  Page,
  Navbar,
  NavLeft,
  NavTitle,
  NavRight,
  Link,
  Block,
  BlockTitle,
} from 'framework7-react';

const FactPage = () => {
  const fact = localStorage.getItem('currentFact') || 'Kein Fact verfügbar';

  return (
    <Page name="fact">
      <Navbar>
        <NavLeft>
          <Link back iconIos="f7:chevron_left" iconMd="material:chevron_left"></Link>
        </NavLeft>
        <NavTitle>Baby Fact of the Day</NavTitle>
      </Navbar>
      <Block>
        <BlockTitle>Baby Fact of the Day</BlockTitle>
        <p>{fact}</p>
      </Block>
    </Page>
  );
};

export default FactPage;