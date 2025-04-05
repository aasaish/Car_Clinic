import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Header from './Header';
import Footer from './Footer';
import HomePage from './HomePage';
import Appointment from './Appointment';
import Login from './Login';
import SignUp from './Sign_up';
import ContactUs from './Contact_us';
import AboutUs from './About_us';
import VirtualAssistance from './Virtual_assistance';
import AdminPortal from './Admin_portal';
import MechanicPortal from './Mechanic_portal';
import Rating from './Rating';
import { useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import MyAppointments from './MyAppointments';

function App() {

  const [user, setUser] = useState(null);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser); // Store user globally
  });

  return () => unsubscribe(); // Cleanup listener on unmount
}, []);

  return (
    <Router>
      <div className="App">
      <Header user={user} setUser={setUser} />
        <div className="content-container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/appointment" element={<Appointment user={user} setUser={setUser} />} />
            <Route path="/MyAppointments" element={<MyAppointments user={user} setUser={setUser}/>} />
            <Route path="/login" element={<Login />} />
            <Route path="/sign_up" element={<SignUp />} />
            <Route path="/contact_us" element={<ContactUs />} />
            <Route path="/about_us" element={<AboutUs />} />
            <Route path="/virtual_assistance" element={<VirtualAssistance />} />
            <Route path="/admin_portal" element={<AdminPortal />} />
            <Route path="/mechanic_portal" element={<MechanicPortal user={user} setUser={setUser} />} />
            <Route path="/rating/:email/:aid" element={<Rating user={user} setUser={setUser}/>} />
            </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
