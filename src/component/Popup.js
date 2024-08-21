// Popup.js
import React from 'react';

const Popup = ({ onYes, onNo }) => {
  return (
    <div className="popup-overlay">
      <div className="popup">
        <p>The blueprint was not found. Would you like to send a notification to the team?</p>
        <div className="popup-buttons">
          <button onClick={onYes}>Yes, send it</button>
          <button onClick={onNo}>No, don't send it</button>
        </div>
      </div>
    </div>
  );
};

export default Popup;