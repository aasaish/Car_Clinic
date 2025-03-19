// SignUp.js
import React, { useState } from 'react';
import './Signup.css';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
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
  // const [paymentProof, setPaymentProof] = useState(null);

  const firebaseURL = "https://car-clinic-9cc74-default-rtdb.firebaseio.com/mechanics.json"; // Firebase Database URL

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
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
      alert(`Signed up as user: ${userCredential.user.email}`);
      window.location.reload();

    } catch (error) {
      console.error('Error signing up:', error);
      alert(`Sign-Up failed. Error: ${error.message}`);
    }
  };

  const handleMechanicSignUp = async () => {
    // Logic to handle mechanic sign-up with the form data (e.g., save to Firestore or Realtime Database)
    // if (!paymentProof) {
    //   alert("Please upload payment proof!");
    //   return;
    // }

    try {

      const mechanicData = {
        name,
        email,
        phone,
        address,
        specialty,
        role: "mechanic",
        status: "pending", // Mechanic request needs admin approval
        password,
        // paymentProof: paymentProof.name, // Ideally, store this in Firebase Storage
      };

      await axios.post(firebaseURL, mechanicData, {
        headers: { "Content-Type": "application/json" },
      });

      alert("Your request has been sent to the admin for approval!");

      window.location.reload();
    } catch (error) {
      console.error("Error signing up:", error);
      alert(`Sign-Up failed. Error: ${error.message}`);
    }

  };

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Google Sign-Up Successful:', result.user);
      alert(`Signed up with Google as: ${result.user.email}`);
    } catch (error) {
      console.error('Error signing up with Google:', error);
      alert('Google Sign-Up failed. Please try again.');
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
    </div>
  );
};

export default SignUp;
