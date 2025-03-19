// src/Header.js
import React, { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css'; // Import CSS for the header styling
import { signOut } from 'firebase/auth';
import { auth } from './firebase'; // Ensure db is imported
import { getDatabase, ref, get} from "firebase/database";

const Header = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(false);
  const [isMechanic, setIsMechanic] = useState(false);

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
    try {
      await signOut(auth);
      setUser(null); // Update global state
      navigate("/"); // Redirect after logout
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

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
        {admin ?
          <button className="header-button" onClick={() => navigate('/Admin_portal')}>
            Admin Portal
          </button>
          : null}

        {isMechanic && (
          <button className="header-button" onClick={() => navigate('/Mechanic_portal')}>
            Mechanic_portal
          </button>
        )}

        <button className="header-button" onClick={() => navigate('/Contact_us')}>
          Contact-Us
        </button>
        <button className="header-button" onClick={() => navigate('/Rating')}>
          Rating
        </button>

        {user ? (
          <button className="header-button logout" onClick={handleLogout}>
            Log Out
          </button>
        ) : (
          <>
            <button className="header-button" onClick={() => navigate('/Sign_up')}>
              Sign Up
            </button>
            <button className="header-button" onClick={() => navigate('/Login')}>
              Log In
            </button>
          </>
        )}


      </div>
    </header>
  );
};

export default Header;
