// SignUp.js
import React, { useState } from 'react';
import './Signup.css';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from './firebase';
import CustomAlert from './CustomAlert';
import axios from 'axios';

const SignUp = () => {
  const [userType, setUserType] = useState('user'); // Default to 'user' signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [experience, setExperience] = useState('');
  // const [paymentProof, setPaymentProof] = useState(null);
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    onConfirm: () => { },
  });

  const firebaseURL = "https://car-clinic-9cc74-default-rtdb.firebaseio.com/mechanics.json"; // Firebase Database URL

  const showAlert = (message, onConfirm) => {
    setAlert({ show: true, message, onConfirm });
  };

  // Function to close alert
  const closeAlert = () => {
    setAlert({ show: false, message: '', onConfirm: () => { } });
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showAlert('Passwords do not match!');
      return;
    }
    if (userType === 'user') {
      handleUserSignUp();
    } else {
      handleMechanicSignUp();
    }
  };

  const handleUserSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User signed up:', userCredential.user);
      showAlert(`Signed up as user: ${userCredential.user.email}`);
      const user = userCredential.user;

      // Set the display name
      await updateProfile(user, {
        displayName: name
      });

      console.log("User registered:", user);
      console.log("User name:", user.displayName);
      // window.location.reload();

    } catch (error) {
      console.error('Error signing up:', error);
      showAlert(`Sign-Up failed. Error: ${error.message}`);
    }
  };

  const handleMechanicSignUp = async () => {
    // Logic to handle mechanic sign-up with the form data (e.g., save to Firestore or Realtime Database)
    // if (!paymentProof) {
    //   showAlert("Please upload payment proof!");
    //   return;
    // }showAlert

    try {

      const mechanicData = {
        name,
        email,
        phone,
        address,
        specialty,
        experience,
        role: "mechanic",
        status: "pending", // Mechanic request needs admin approval
        password,
        // paymentProof: paymentProof.name, // Ideally, store this in Firebase Storage
      };

      await axios.post(firebaseURL, mechanicData, {
        headers: { "Content-Type": "application/json" },
      });

      showAlert("Your request has been sent to the admin for approval!");

      window.location.reload();
    } catch (error) {
      console.error("Error signing up:", error);
      showAlert(`Sign-Up failed. Error: ${error.message}`);
    }

  };

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Google Sign-Up Successful:', result.user);
      showAlert(`Signed up with Google as: ${result.user.email}`);
    } catch (error) {
      console.error('Error signing up with Google:', error);
      showAlert('Google Sign-Up failed. Please try again.');
    }
  };

  return (
    <div className="signup-container">
      <h1>Sign Up</h1>

      <div className="navigation-buttons">
        <button
          onClick={() => setUserType('user')}
          className={userType === 'user' ? 'active' : ''}
        >
          User Signup
        </button>
        <button
          onClick={() => setUserType('mechanic')}
          className={userType === 'mechanic' ? 'active' : ''}
        >
          Mechanic Signup
        </button>
      </div>

      {userType === 'user' ? (
        <div>
          <h2>User Signup</h2>
          <form onSubmit={handleSubmit} className="signup-form">
            <table>
              <tbody>
                <tr>
                  <td><label>Name:</label></td>
                  <td><input type="text" value={name} onChange={(e) => setName(e.target.value)} required /></td>
                </tr>


                <tr>
                  <td><label>Email:</label></td>
                  <td><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></td>
                </tr>

                <tr>
                  <td><label>Phone Number:</label></td>
                  <td><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required /></td>
                </tr>
                <tr>
                  <td><label>Password:</label></td>
                  <td><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></td>
                </tr>
                <tr>
                  <td><label>Confirm Password:</label></td>
                  <td><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></td>
                </tr>
              </tbody>
            </table>

            <div className="form-group">
              <button type="button" className="signup-btn google-btn" onClick={handleGoogleSignUp}>
                Sign up with Google
              </button>
            </div>

            <button type="submit">Submit</button>
          </form>
        </div>
      ) : (
        <div>
          <h2>Mechanic Signup</h2>
          <form onSubmit={handleSubmit} className="signup-form">
            <table>
              <tbody>
                <tr>
                  <td><label>Name:</label></td>
                  <td><input type="text" value={name} onChange={(e) => setName(e.target.value)} required /></td>
                </tr>
                <tr>
                  <td><label>Email:</label></td>
                  <td><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></td>
                </tr>
                <tr>
                  <td><label>Phone Number:</label></td>
                  <td><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required /></td>
                </tr>
                <tr>
                  <td><label>Address:</label></td>
                  <td><input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required /></td>
                </tr>
                <tr>
                  <td><label>Specialty:</label></td>
                  <td><input type="text" value={specialty} onChange={(e) => setSpecialty(e.target.value)} required /></td>
                </tr>
                <tr>
                  <td><label>Experience:</label></td>
                  <td><input type="text" value={experience} onChange={(e) => setExperience(e.target.value)} required /></td>
                </tr>
                {/* <tr>
                  <td><label>Payment Proof:</label></td>
                  <td><input type="file" onChange={(e) => setPaymentProof(e.target.files[0])} required /></td>
                </tr> */}
                <tr>
                  <td><label>Password:</label></td>
                  <td><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></td>
                </tr>
                <tr>
                  <td><label>Confirm Password:</label></td>
                  <td><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></td>
                </tr>
              </tbody>
            </table>

            <button type="submit">Submit</button>
          </form>
        </div>
      )}
      {alert.show && (
        <CustomAlert
          message={alert.message}
          onConfirm={() => {
            if (typeof alert.onConfirm === "function") {
              alert.onConfirm(); // Execute the stored function
            }
            closeAlert(); // Close alert after confirmation
          }}
          onCancel={closeAlert}
          buttonLabel="OK"
        />
      )}
    </div>
  );
};

export default SignUp;
