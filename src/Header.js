// src/Header.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css'; // Import CSS for the header styling

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="App-header">
      <div className="header-left">
        <img
          src="/Logo.jpg" // Correct path to the image in the public folder
          alt="Logo"
          className="header-image"
        />
      </div>
      <div className="header-right">
        <button className="header-button" onClick={() => navigate('/')}>
          Home
        </button>
        <button className="header-button" onClick={() => navigate('/About_us')}>
          About
        </button>
        <button className="header-button" onClick={() => navigate('/Virtual_assistance')}>
          Virtual Assistance
        </button>
        <button className="header-button" onClick={() => navigate('/Admin_portal')}>
          Admin Portal
        </button>
       
        <button className="header-button" onClick={() => navigate('/Mechanic_portal')}>
        Mechanic_portal
        </button>
        
        <button className="header-button" onClick={() => navigate('/Sign_up')}>
          Sign Up
        </button>
        <button className="header-button" onClick={() => navigate('/Login')}>
          Log In
        </button>
        <button className="header-button" onClick={() => navigate('/Contact_us')}>
          Contact-Us
        </button>
        <button className="header-button" onClick={() => navigate('/Rating')}>
          Rating
        </button>
    
      </div>
    </header>
  );
};

export default Header;
