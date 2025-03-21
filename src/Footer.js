// src/Footer.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Footer.css";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa"; // Social media icons

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <div className="footer-section">
        <h2>Contact Us</h2>
        <p>Email: <a href="mailto:agency@carclinic.com">agency@carclinic.com</a></p>
        <p>Phone: <a href="tel:+923231587096">+92 3231587096</a></p>
      </div>

      <div className="footer-section">
        <h2>Quick Links</h2>
        <p onClick={() => navigate("/")}>Home</p>
        <p onClick={() => navigate("/About_us")}>About Us</p>
        <p onClick={() => navigate("/Contact_us")}>Contact</p>
      </div>

      <div className="footer-section">
        <h2>Follow Us</h2>
        <div className="social-icons">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <FaFacebook />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <FaTwitter />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <FaInstagram />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
            <FaLinkedin />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
