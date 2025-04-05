import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Mechanic_portal.css";
import CustomAlert from './CustomAlert';
import { Button } from "@mui/material";

const MyAppointments = ({ user, setUser }) => {

    const [appointments, setAppointments] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [mechanicName, setMechanicName] = useState("");
    const [mechanicEmail, setMechanicEmail] = useState("");
    const [appointmentID, setAppointmentID] = useState("");
    const navigate = useNavigate();

    const firebaseDB = "https://car-clinic-9cc74-default-rtdb.firebaseio.com";
    const firebaseURL = `${firebaseDB}/appointments.json`;

    useEffect(() => {
        if (user && user.email) {
            fetchAppointments(); // initial fetch
    
            const intervalId = setInterval(() => {
                fetchAppointments(); // fetch every 3 seconds
            }, 3000);
    
            return () => clearInterval(intervalId); // cleanup on unmount
        }
    }, [user]);
    


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

    return (
        <div>

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
                                            <Button
                                                variant="contained"
                                                color="success"
                                                onClick={() => handleRating(appointment)}
                                            >
                                                Rate Us
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="contained"
                                                color="error"
                                                onClick={() => deleteAppointment(appointment.id)}
                                            >
                                                Cancel
                                            </Button>
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
        </div>

    );
};

export default MyAppointments;