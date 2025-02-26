import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure role is selected before attempting login
    if (!role) {
      alert('Please select a role (User or Mechanic) before logging in.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.toLowerCase(), password);
      console.log(`${role} logged in with Email: ${email}`);
      alert(`${role.charAt(0).toUpperCase() + role.slice(1)} logged in successfully`);

      // Role-based redirection
      if (role === 'user') {
        navigate('/');
      } else if (role === 'mechanic') {
        navigate('/mechanic_portal');
      }
    } catch (error) {
      console.error('Error signing in:', error.code, error.message);
      handleAuthError(error);
    }
  };

  // Handle authentication errors with specific messages
  const handleAuthError = (error) => {
    switch (error.code) {
      case 'auth/user-not-found':
        alert('No account found with this email. Please sign up first.');
        break;
      case 'auth/wrong-password':
        alert('Incorrect password. Please try again.');
        break;
      case 'auth/invalid-email':
        alert('Invalid email format. Please check your email.');
        break;
      default:
        alert('Login failed. Please check your credentials.');
        break;
    }
  };

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
  };

  const handleGoogleSignIn = async () => {
    if (role !== 'user') {
      alert('Only users can log in with Google');
      return;
    }

    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Google Sign-In Successful:', result.user);
      alert(`Logged in with Google as: ${result.user.email}`);
      navigate('/');
    } catch (error) {
      console.error('Error signing in with Google:', error);
      alert('Google Sign-In failed. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group role-selection">
          <div className="role-buttons">
            <button
              type="button"
              className={`role-btn ${role === 'user' ? 'active' : ''}`}
              onClick={() => handleRoleChange('user')}
            >
              User
            </button>
            <button
              type="button"
              className={`role-btn ${role === 'mechanic' ? 'active' : ''}`}
              onClick={() => handleRoleChange('mechanic')}
            >
              Mechanic
            </button>
          </div>
        </div>

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

        

        {role === 'user' && (
          <div className="form-group">
            <button type="button" className="login-btn google-btn" onClick={handleGoogleSignIn}>
              Sign in with Google
            </button>
          </div>
        )}

        <div className="form-group">
          <button type="submit" className="login-btn">
            Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
