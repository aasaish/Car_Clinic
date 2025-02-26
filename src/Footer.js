// src/Footer.js
import React from 'react';
import './Footer.css'; // Import CSS for the footer styling

const Footer = () => {
  return (
    <div className="footer">
      <div>
        <h1>Contact information</h1>
        <p>agency@carclinic.com</p>
        <p>+92 3231587096</p>
      </div>

      <div>
        <h1>LOG-IN</h1>
        <p>user</p>
        <p>admin</p>
        <p>mechanic</p>
      </div>
    </div>
  );
};

export default Footer;
