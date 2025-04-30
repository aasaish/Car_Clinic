import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Login.css';
import axios from "axios";
import CustomAlert from './CustomAlert';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

const ChangePassword = () => {
    const location = useLocation();
    const { email, uid } = location.state || {};
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

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
        if (password !== confirmPassword) {
            showAlert('Passwords do not match!');
            return;
        }
        try {
            const res = await axios.post("https://car-clinic-backend.onrender.com/updatePassword", {
                uid,
                newPassword: password,
            });

            if (res.status === 200) {
                const userCredential = await signInWithEmailAndPassword(auth, email.toLowerCase(), password);
                console.log("Logged in:", userCredential.user);
                navigate("/");
            }
        } catch (error) {
            console.error(error);
            showAlert('Failed to change password. Please try again.');
        }
    };



    return (
        <div className="login-container">
            <h1>Change Password</h1>
            <form onSubmit={handleSubmit} className="login-form">

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
                    <label>Confirm Password:</label>
                    <input
                        type="password"
                        name="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <button type="submit" className="login-btn">
                        Submit
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

export default ChangePassword;
