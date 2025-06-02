import React, { useEffect, useState } from "react";
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { auth, database } from './firebase';
import { ref, update } from "firebase/database";
import emailjs from '@emailjs/browser';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Mechanic_portal.css";
import CustomAlert from './CustomAlert';
import { Button } from "@mui/material";
import NameModal from "./CustomInputText";
import EmailModal from "./CustomInputText";
import NumModal from "./CustomInputNum";
import PasswordModal from "./CustomInputPassword";

const MyAppointments = ({ user, setUser }) => {

    const [appointments, setAppointments] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [mechanicName, setMechanicName] = useState("");
    const [mechanicEmail, setMechanicEmail] = useState("");
    const [appointmentID, setAppointmentID] = useState("");
    const [newUsername, setnewUsername] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newEmailModal, setNewEmailModal] = useState(false);
    const [newPhoneModal, setNewPhoneModal] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [alert, setAlert] = useState({
        show: false,
        message: '',
        onConfirm: () => { },
    });
    const navigate = useNavigate();


    const firebaseDB = "https://car-clinic-9cc74-default-rtdb.firebaseio.com";
    const firebaseURL = `${firebaseDB}/appointments.json`;

    useEffect(() => {
        if (user && user.email) {
            fetchAppointments(); // initial fetch
            fetchPhoneNumber();

            const intervalId = setInterval(() => {
                fetchAppointments(); // fetch every 3 seconds
            }, 3000);

            return () => clearInterval(intervalId); // cleanup on unmount
        }
    }, [user]);

    const sendApprovalEmail = async (email, messageBody) => {
        const templateParams = {
            to_email: email,
            message: messageBody,
        };

        try {
            await emailjs.send(
                'service_8kgv9m8',     // Replace with your Email.js service ID
                'template_bpruqj9',    // Replace with your Email.js template ID
                templateParams,
                'YXs-aMceIqko1PuHu'      // Replace with your Email.js public key
            );
            console.log('Approval email sent successfully');
        } catch (error) {
            console.error('Error sending email:', error);
        }
    };

    const fetchAppointments = async () => {
        try {
            const response = await axios.get(firebaseURL);
            if (response.data) {
                const appointmentsArray = Object.keys(response.data).map((key) => ({
                    id: key, // Store Firebase ID
                    ...response.data[key], // Store appointment details
                }));

                // Filter appointments based on user email
                const filteredAppointments = appointmentsArray.filter(
                    (appointment) => appointment.email === user.email
                );

                setAppointments(filteredAppointments);

                // Check for appointments that are completed and have no rating
                const unratedCompletedAppointment = filteredAppointments.find(
                    (appointment) =>
                        appointment.status === "completed" && (appointment.rating === "" || appointment.rating === null)
                );

                if (unratedCompletedAppointment) {
                    setMechanicName(unratedCompletedAppointment.mechanicName);
                    setMechanicEmail(unratedCompletedAppointment.mechanicEmail);
                    setAppointmentID(unratedCompletedAppointment.aid);
                    setShowConfirmation(true);
                }
            }
        } catch (error) {
            console.error("Error fetching appointments:", error);
        }
    };

    const fetchPhoneNumber = async () => {
        try {
            const userId = user.uid;
            const response = await axios.get(`https://car-clinic-9cc74-default-rtdb.firebaseio.com/users/${userId}.json`);
            if (response.data && response.data.phone) {
                setPhoneNumber(response.data.phone);
            } else {
                console.log("Phone number not found.");
            }
        } catch (error) {
            console.error("Error fetching phone number:", error);
        }
    };

    const deleteAppointment = async (appointmentId) => {
        try {
            const deleteURL = `${firebaseDB}/appointments/${appointmentId}.json`;

            await axios.delete(deleteURL);

            // Update state by filtering out the deleted appointment
            setAppointments((prevAppointments) => prevAppointments.filter(app => app.id !== appointmentId));
        } catch (error) {
            console.error("Error deleting appointment:", error);
        }
    };

    const handleUpdateUserName = async (newName) => {
        setnewUsername(false);

        if (newName === "") {
            showAlert('Username cannot be empty!');
            return;
        }

        if (newName === user?.displayName) {
            showAlert('New username cannot be same as current username!');
            return;
        }
        try {
            const response = await fetch("https://car-clinic-backend.onrender.com/updateUserName", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: user.uid, // Pass the user's UID here
                    newName: newName,
                }),
            });

            const result = await response.json();
            if (response.ok) {
                console.log("User name updated:", result.user);
                showAlert('Name updated successfully!');
                const Message = `Dear ${user.displayName}, your request for change of username is accepted successfully. Your new user name will be "${newName}". Thank you for your time!!!`
                await sendApprovalEmail(user.email, Message);
            } else {
                showAlert('Failed to update name');
            }
        } catch (err) {
            console.error(err);
            showAlert('Something went wrong');
        }
    };

    const handleUpdateEmail = async (newEmail) => {
        setNewEmailModal(false);

        if (!newEmail) {
            showAlert('Email cannot be empty!');
            return;
        }

        if (newEmail === user?.email) {
            showAlert('New email cannot be same as current email!');
            return;
        }

        try {
            const response = await fetch("https://car-clinic-backend.onrender.com/updateUserEmail", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: user.uid,
                    newEmail,
                }),
            });

            const result = await response.json();
            if (response.ok) {
                console.log("User name updated:", result.user);
                showAlert('Email updated successfully!');
                const Message = `Dear ${user.displayName}, your request for change of email is accepted successfully. Your new email will be "${newEmail}". Thank you for your time!!!`;
                await sendApprovalEmail(newEmail, Message);
            } else {
                showAlert('Failed to update email');
            }
        } catch (err) {
            console.error(err);
            showAlert('Something went wrong');
        }
    };

    const handleUpdatePhone = async (newPhone) => {
        setNewPhoneModal(false)
        if (!newPhone) {
            showAlert("Phone number cannot be empty!");
            return;
        }

        if (newPhone === user.phone) {
            showAlert("New phone number cannot be same as current phone number!");
            return;
        }

        try {
            // Update phone in Firebase Realtime Database
            const userRef = ref(database, `users/${user.uid}`);
            await update(userRef, { phone: newPhone });

            showAlert("Phone number updated successfully!");

            const Message = `Dear ${user.displayName}, your phone number has been successfully updated to "${newPhone}". Thank you for keeping your information up to date!`;
            await sendApprovalEmail(user.email, Message);

            // Update local state (assuming setUser exists)
            setUser((prev) => ({ ...prev, phone: newPhone }));
        } catch (error) {
            console.error("Error updating phone number:", error);
            showAlert("Something went wrong while updating phone number.");
        }
    };


    const handlePasswordChange = async (currentPassword, newPassword) => {
        setShowPasswordModal(false);
        const user = auth.currentUser;

        if (!user?.email) {
            showAlert('User not found or not logged in.');
            return;
        }

        if (currentPassword === newPassword) {
            showAlert('New password cannot be same as current password!');
            return;
        }

        const credential = EmailAuthProvider.credential(user.email, currentPassword);

        try {
            // Step 1: Re-authenticate the user
            await reauthenticateWithCredential(user, credential);
            console.log("Re-authentication successful");

            // Step 2: Update the password
            await updatePassword(user, newPassword);
            showAlert('Password updated successfully!');
            const Message = `Dear ${user.displayName}, your request for change of password is accepted successfully. You can now log into your account with new password. Thank you for your time!!!`
            await sendApprovalEmail(user.email, Message);
        } catch (error) {
            console.error("Error updating password:", error);
            if (error.code === 'auth/wrong-password') {
                showAlert('Current password is incorrect.');
            } else if (error.code === 'auth/weak-password') {
                showAlert('New password is too weak.');
            } else {
                showAlert('Failed to update password.');
            }
        }
    };

    const handleConfirm = () => {
        navigate(`/Rating/${mechanicEmail}/${appointmentID}`);
        setShowConfirmation(false);
    };

    const handleRating = (appointment) => {
        navigate(`/Rating/${appointment.mechanicEmail}/${appointment.aid}`);
    };

    const handleCancel = () => {
        setShowConfirmation(false);
    };

    const showAlert = (message, onConfirm) => {
        setAlert({ show: true, message, onConfirm });
    };

    // Function to close alert
    const closeAlert = () => {
        setAlert({ show: false, message: '', onConfirm: () => { } });
    };

    const toggleDropdown = () => {
        setIsOpen(prev => !prev);
    };

    const handleItemClick = () => {
        setIsOpen(false); // close after clicking
    };

    return (
        <div>
            <div className="topBarBody">
                <div className="topBar">
                    <div className="dropdown">
                        <button className="dropdown-toggle" onClick={toggleDropdown}>
                            Settings
                        </button>
                        {isOpen && (
                            <ul className="dropdown-menu">
                                <li>
                                    <button className="dropdown-item" onClick={() => { setnewUsername(true); handleItemClick() }}>
                                        Change Username
                                    </button>
                                </li>
                                <li>
                                    <button className="dropdown-item" onClick={() => { setNewEmailModal(true); handleItemClick() }}>
                                        Change Email
                                    </button>
                                </li>
                                <li>
                                    <button className="dropdown-item" onClick={() => { setNewPhoneModal(true); handleItemClick() }}>
                                        Change Phone Number
                                    </button>
                                </li>
                                <li>
                                    <button className="dropdown-item" onClick={() => { setShowPasswordModal(true); handleItemClick() }}>
                                        Change Password
                                    </button>
                                </li>
                            </ul>
                        )}
                    </div>
                </div>
            </div>
            <div className="detailRow">
                <div>Name: {user.displayName}</div>
                <div>Email: {user.email}</div>
                <div>Phone Number: {phoneNumber}</div>
            </div>
            <h1>My Appointments</h1>
            <div className="table">
                <table className="appointments-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Mobile</th>
                            <th>Address</th>
                            <th>Visit Preference</th>
                            <th>Selected Services</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.length > 0 ? (
                            appointments.map((appointment, index) => (
                                <tr key={index}>
                                    <td>{appointment.name}</td>
                                    <td>{appointment.email}</td>
                                    <td>{appointment.mobile}</td>
                                    <td>{appointment.address}</td>
                                    <td>{appointment.visitPreference}</td>
                                    <td>{appointment.selectedServices}</td>
                                    <td>
                                        {appointment.status === "completed" ? (
                                            <p>{appointment.rating ? (
                                                [...Array(5)].map((_, i) => (
                                                    <span key={i} style={{ color: i < appointment.rating ? '#FFD700' : '#ccc' }}>★</span>
                                                ))
                                            ) : (
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    onClick={() => handleRating(appointment)}
                                                >
                                                    Rate Us
                                                </Button>
                                            )}</p>
                                        ) : (
                                            <p>
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    onClick={() => deleteAppointment(appointment.id)}
                                                >
                                                    Cancel
                                                </Button></p>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7">No appointments available.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {showConfirmation && (
                <CustomAlert
                    message={`${mechanicName} have completed appointment successfully. So you have to rate them now?`}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                    buttonLabel={"OK"}
                />
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
            <NameModal
                open={newUsername}
                onClose={() => setnewUsername(false)}
                onConfirm={handleUpdateUserName}
                heading={"Change Username:"}
                placeholderText={"Enter New Name Here:"}
            />

            <EmailModal
                open={newEmailModal}
                onClose={() => setNewEmailModal(false)}
                onConfirm={handleUpdateEmail}
                heading={"Change Email:"}
                placeholderText={"Enter New Email Here:"}
            />

            <NumModal
                open={newPhoneModal}
                onClose={() => setNewPhoneModal(false)}
                onConfirm={handleUpdatePhone}
                heading={"Change Phone Number:"}
                placeholderText={"Enter New Phone Number Here:"}
            />


            <PasswordModal
                open={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onConfirm={handlePasswordChange}
                heading="Change Your Password"
            />

        </div>

    );
};

export default MyAppointments;