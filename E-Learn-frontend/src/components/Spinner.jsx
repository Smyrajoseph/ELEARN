import React from 'react';
import './Spinner.css';

const Spinner = ({ size = 'medium', message = 'Loading...' }) => {
  const sizeClass = `spinner-${size}`;
  
  return (
    <div className="spinner-container">
      <div className={`spinner ${sizeClass}`}></div>
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );
};

export default Spinner;
