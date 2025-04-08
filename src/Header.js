// src/Header.js
import { NavLink } from "react-router-dom";
import React, { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css'; // Import CSS for the header styling
import { signOut } from 'firebase/auth';
import CustomAlert from './CustomAlert';
import { auth } from './firebase'; // Ensure db is imported
import { getDatabase, ref, get } from "firebase/database";

const Header = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(false);
  const [isMechanic, setIsMechanic] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);


  useEffect(() => {
    if (!user?.uid) {
      setAdmin(false);
      setIsMechanic(false);
      return;
    }

    setAdmin(user.email === "admin@gmail.com"); // Check if admin

    checkIfMechanic(user.uid); // Check if mechanic
  }, [user]);

  const checkIfMechanic = async (uid) => {
    try {

      if (!uid) {
        setIsMechanic(false);
        return;
      }

      const db = getDatabase(); // Get database instance
      const dbRef = ref(db, "approvedMechanics/" + uid); // Reference to the mechanic's data

      const snapshot = await get(dbRef); // Fetch data

      if (snapshot.exists()) {
        const userData = snapshot.val();

        // Check if the role is "mechanic"
        setIsMechanic(userData.role === "mechanic");
      } else {
        setIsMechanic(false);
      }
    } catch (error) {
      setIsMechanic(false);
    }
  };

  const handleLogout = async () => {
    setShowConfirmation(true);
  }

  const handleConfirmLogout = async () => {
    try {
      await signOut(auth);
      setUser(null); // Update global state
      navigate("/"); // Redirect after logout
      setShowConfirmation(false);
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  const handleCancelLogout = () => {
    setShowConfirmation(false);
  };

  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavLinkClick = () => {
    setMenuOpen(false);
  };

  return (
    <nav>
      <img
        src="/Logo.jpg" // Correct path to the image in the public folder
        alt="Logo"
        className="header-image"
      />
      <div
        className="menu"
        onClick={() => {
          setMenuOpen(!menuOpen);
        }}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
      <ul className={menuOpen ? "open" : ""}>
      


        {admin ? (
          <>
          <NavLink to="//Admin_portal" onClick={handleNavLinkClick}><li>
            <button className="header-button" onClick={() => navigate('/Admin_portal')}>
              Admin Panel
            </button></li></NavLink>
            <NavLink to="/" onClick={handleNavLinkClick}>
            <li>
            <button className="header-button logout" onClick={handleLogout}>
              Log Out
            </button></li></NavLink>
          </>
        ) : isMechanic ? (
          <>
          <NavLink to="/Mechanic_portal" onClick={handleNavLinkClick}><li>
            <button className="header-button" onClick={() => navigate('/Mechanic_portal')}>
              Mechanic Panel
            </button></li></NavLink>
            <NavLink to="/" onClick={handleNavLinkClick}>
            <li>
            <button className="header-button logout" onClick={handleLogout}>
              Log Out
            </button></li></NavLink>
          </>
        ) : user ? (
          <>
            <NavLink to="/" onClick={handleNavLinkClick}><li>
            <button className="header-button" onClick={() => navigate('/')}>
              Home
            </button></li></NavLink>
            <NavLink to="/About_us" onClick={handleNavLinkClick}>
            <li><button className="header-button" onClick={() => navigate('/About_us')}>
              About
            </button></li></NavLink>
            <NavLink to="/Virtual_assistance" onClick={handleNavLinkClick}>
            <li><button className="header-button" onClick={() => navigate('/Virtual_assistance')}>
              Virtual Assistance
            </button></li></NavLink>
            <NavLink to="/Contact_us" onClick={handleNavLinkClick}>
            <li><button className="header-button" onClick={() => navigate('/Contact_us')}>
              Contact Us
            </button></li></NavLink>
            <NavLink to="/MyAppointments" onClick={handleNavLinkClick}>
            <li>
            <button className="header-button" onClick={() => navigate('/MyAppointments')}>
              My Appointments
            </button></li></NavLink>
            <NavLink to="/" onClick={handleNavLinkClick}>
            <li>
            <button className="header-button logout" onClick={handleLogout}>
              Log Out
            </button></li></NavLink>
          </>
        ) : (
          <>
          <NavLink to="/" onClick={handleNavLinkClick}><li>
            <button className="header-button" onClick={() => navigate('/')}>
              Home
            </button></li></NavLink>
            <NavLink to="/About_us" onClick={handleNavLinkClick}>
            <li><button className="header-button" onClick={() => navigate('/About_us')}>
              About
            </button></li></NavLink>
            <NavLink to="/Virtual_assistance" onClick={handleNavLinkClick}>
            <li><button className="header-button" onClick={() => navigate('/Virtual_assistance')}>
              Virtual Assistance
            </button></li></NavLink>
            <NavLink to="/Contact_us" onClick={handleNavLinkClick}>
            <li><button className="header-button" onClick={() => navigate('/Contact_us')}>
              Contact Us
            </button></li></NavLink>
            <NavLink to="/Sign_up" onClick={handleNavLinkClick}>
            <li><button className="header-button" onClick={() => navigate('/Sign_up')}>
              Sign Up
            </button></li></NavLink>
            <NavLink to="/Login" onClick={handleNavLinkClick}>
            <li><button className="header-button" onClick={() => navigate('/Login')}>
              Log In
            </button></li></NavLink>
          </>
        )}


      
      {showConfirmation && (
        <CustomAlert
          message="Are you sure you want to Logout?"
          onConfirm={handleConfirmLogout}
          onCancel={handleCancelLogout}
          buttonLabel={"Confirm"}
        />
      )}
      </ul>
    </nav>

  );
};

export default Header;
