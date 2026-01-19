import React, { useState } from 'react';
import { Page, Navbar, NavRight, Link, Icon } from 'framework7-react';

const NightLightPage = () => {
  const [color, setColor] = useState('#FFD700'); // Gold/Warm

  return (
    <Page style={{backgroundColor: color, transition: 'background-color 0.5s'}}>
      <Navbar title="Nachtlicht" transparent>
        <NavRight>
          <Link back iconF7="multiply" color="black" />
        </NavRight>
      </Navbar>
      
      <div 
        style={{
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%', 
          justifyContent: 'center', 
          alignItems: 'center',
          paddingBottom: '100px'
        }}
        onClick={() => setColor(color === '#FFD700' ? '#FF4500' : '#FFD700')} // Wechsel zwischen Gelb und Orange
      >
        <Icon f7="lightbulb_fill" size="100px" style={{opacity: 0.3, color: 'black'}} />
        <p style={{opacity: 0.5, color: 'black', marginTop: '20px'}}>Tippen für Farbwechsel</p>
      </div>
    </Page>
  );
};

export default NightLightPage;