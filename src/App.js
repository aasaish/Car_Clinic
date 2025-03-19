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

function App() {

  const [user, setUser] = useState(null);

// useEffect( ()=> {
//   onAuthStateChanged(auth, (user) => {
//     if (user){
//       console.log("hi", user);
//     }else{
//       console.log("you are log out");
//     }
//   });
// },[])

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
            <Route path="/appointment" element={<Appointment />} />
            <Route path="/login" element={<Login />} />
            <Route path="/sign_up" element={<SignUp />} />
            <Route path="/contact_us" element={<ContactUs />} />
            <Route path="/about_us" element={<AboutUs />} />
            <Route path="/virtual_assistance" element={<VirtualAssistance />} />
            <Route path="/admin_portal" element={<AdminPortal />} />
            <Route path="/mechanic_portal" element={<MechanicPortal />} />
            <Route path="/rating" element={<Rating />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
