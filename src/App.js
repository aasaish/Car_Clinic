import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
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
import { getDatabase, ref, get, set } from "firebase/database";
import { onAuthStateChanged } from 'firebase/auth';
import MyAppointments from './MyAppointments';
import { PublicRoute, AdminRoute, MechanicRoute, UserOnlyRoute } from './ProtectedRoutes';
import ForgetPassword from './forgetPassword';
import ChangePassword from './ChangePassword';

function App() {

  const [user, setUser] = useState(null);
  const [isAdmin, setAdmin] = useState(false);
  const [isMechanic, setIsMechanic] = useState(false);
  const [mechanicData, setMechanicData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setAdmin(false);
      setIsMechanic(false);
      return;
    }

    setAdmin(user.email === "aasaish@growthguild.us");
    checkIfMechanic(user.uid);
  }, [user]);

  const checkIfMechanic = async (uid) => {
  try {
    const db = getDatabase();
    const dbRef = ref(db, "approvedMechanics/" + uid);
    const snapshot = await get(dbRef);

    if (snapshot.exists()) {
      const data = snapshot.val();

      if (data.role === "mechanic") {
        const currentYear = new Date().getFullYear();
        const signupYear = new Date(data.signupDate).getFullYear();
        const yearsPassed = currentYear - signupYear;

        const originalExperience = parseInt(data.experience || "0", 10);
        const calculatedNetExperience = originalExperience + yearsPassed;

        // Only store if it's not already up to date
        if (data.netExperience !== calculatedNetExperience) {
          const updatedData = { ...data, netExperience: calculatedNetExperience };

          // Update mechanic's data in Firebase only if netExperience has changed
          await set(ref(db, "approvedMechanics/" + uid), updatedData);

          setMechanicData(updatedData);
        } else {
          // No update needed, already accurate
          setMechanicData(data);
        }

        setIsMechanic(true);
      } else {
        setIsMechanic(false);
        setMechanicData(null);
      }
    } else {
      setIsMechanic(false);
      setMechanicData(null);
    }
  } catch (error) {
    console.error("Error checking mechanic:", error);
    setIsMechanic(false);
    setMechanicData(null);
  }
};


  useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin_portal');
    } else if (user && isMechanic) {
      navigate('/mechanic_portal');
    }
  }, [user, isAdmin, isMechanic, navigate]);



  return (
    <div className="App">
      <Header user={user} setUser={setUser} />
      <div className="content-container">
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/appointment" element={<Appointment user={user} setUser={setUser} />} />

          <Route
            path="/MyAppointments"
            element={
              <UserOnlyRoute user={user} isAdmin={isAdmin} isMechanic={isMechanic}>
                <MyAppointments user={user} setUser={setUser} />
              </UserOnlyRoute>
            }
          />

          <Route
            path="/rating/:email/:aid"
            element={
              <UserOnlyRoute user={user}>
                <Rating user={user} setUser={setUser} />
              </UserOnlyRoute>
            }
          />

          <Route
            path="/login"
            element={
              <PublicRoute user={user}>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/forgetPassword"
            element={
              <PublicRoute user={user}>
                <ForgetPassword />
              </PublicRoute>
            }
          />

          <Route
            path="/ChangePassword"
            element={
              <PublicRoute user={user}>
                <ChangePassword />
              </PublicRoute>
            }
          />

          <Route
            path="/sign_up"
            element={
              <PublicRoute user={user}>
                <SignUp />
              </PublicRoute>
            }
          />

          <Route path="/contact_us" element={<ContactUs />} />
          <Route path="/about_us" element={<AboutUs />} />
          <Route path="/virtual_assistance" element={<VirtualAssistance />} />

          <Route
            path="/admin_portal"
            element={
              <AdminRoute user={user} isAdmin={isAdmin}>
                <AdminPortal user={user} setUser={setUser}/>
              </AdminRoute>
            }
          />

          <Route
            path="/mechanic_portal"
            element={
              <MechanicRoute user={user} isMechanic={isMechanic}>
                <MechanicPortal user={user} setUser={setUser} mechanicData={mechanicData} setMechanicData={setMechanicData} />
              </MechanicRoute>
            }
          />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;