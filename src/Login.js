import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import CustomAlert from './CustomAlert';
import { auth } from './firebase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    onConfirm: () => { },
  });
  const navigate = useNavigate();

  const showAlert = (message, onConfirm) => {
    setAlert({ show: true, message, onConfirm });
  };

  // Function to close alert
  const closeAlert = () => {
    setAlert({ show: false, message: '', onConfirm: () => { } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.toLowerCase(), password);
      showAlert(`${userCredential.name} logged in successfully`);

    } catch (error) {
      console.error('Error signing in:', error.code, error.message);
      handleAuthError(error);
    }
  };

  // Handle authentication errors with specific messages
  const handleAuthError = (error) => {
    switch (error.code) {
      case 'auth/user-not-found':
        showAlert('No account found with this email. Please sign up first.');
        break;
      case 'auth/wrong-password':
        showAlert('Incorrect password. Please try again.');
        break;
      case 'auth/invalid-email':
        showAlert('Invalid email format. Please check your email.');
        break;
      default:
        showAlert('Login failed. Please check your credentials.');
        break;
    }
  };


  const handleGoogleSignIn = async () => {

    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Google Sign-In Successful:', result.user);
      showAlert(`Logged in with Google as: ${result.user.email}`);
      navigate('/');
    } catch (error) {
      console.error('Error signing in with Google:', error);
      showAlert('Google Sign-In failed. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit} className="login-form">

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

          <div className="form-group">
            <button type="button" className="login-btn google-btn" onClick={handleGoogleSignIn}>
              Sign in with Google
            </button>
          </div>

        <div className="form-group">
          <button type="submit" className="login-btn">
            Login
          </button>
        </div>
      </form>
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

export default Login;
