import React, { useState } from 'react';
import './IntroMessage.css';

const IntroMessage = ({ onDismiss }) => {
  const [checked, setChecked] = useState(false);

  const handleDismiss = () => {
    if (checked) {
      localStorage.setItem('introDismissed', 'true');
    }
    onDismiss();
  };

  return (
    <div className="intro-overlay">
      <div className="intro-card">
        <h2 style={{ textAlign: 'center' }}>Pigeon</h2>
        <h3 style={{ textAlign: 'center' }}>Welcome to Pigeon!</h3>
        <p>
         Hi Users, We, the management of Pigeon Chat App, proudly welcome you to this new and premium chat experience.
          <br /><br />
          Pigeon is an innovative chat app meticulously designed by two students of Class 8.
          <br /><br />
          Team:
          <ul>
            <li>JAIKARTHICK - Technical and Admin Lead</li>
            <li>SASHVIN - Chief Financial Officer</li>
          </ul>
        </p>
        <div className="intro-checkbox">
          <input 
            type="checkbox" 
            id="dismissCheckbox" 
            checked={checked} 
            onChange={() => setChecked(!checked)} 
          />
          <label htmlFor="dismissCheckbox">I have read the intro and don't show me again.</label>
        </div>
        <button onClick={handleDismiss}>OK</button>
      </div>
    </div>
  );
};

export default IntroMessage;