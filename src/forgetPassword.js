import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import axios from "axios";
import CustomAlert from './CustomAlert';

const ForgetPassword = () => {
    const [email, setEmail] = useState('');
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



    const handleCheckEmail = async (email) => {
        try {
            const res = await axios.post("https://car-clinic-backend.onrender.com/checkEmail", { email });

            // ✅ Navigate if email exists
            if (res.status === 200) {
                const { email,uid } = res.data;
                navigate("/ChangePassword", { state: { email, uid } });
            }
        } catch (error) {
            // ❌ Show alert if email does not exist
            if (error.response && error.response.status === 404) {
                showAlert("Email not found");
            } else {
                showAlert("Something went wrong");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        handleCheckEmail(email)
    };



    return (
        <div className="login-container">
            <h1>Forget Password</h1>
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

export default ForgetPassword;
