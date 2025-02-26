import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Mechanic_portal.css';

const MechanicPortal = () => {
  // State to store appointments fetched from Firebase
  const [appointments, setAppointments] = useState([]);

  // Firebase URL
  const firebaseURL = "https://car-clinic-9cc74-default-rtdb.firebaseio.com/appointments.json";

  // Fetch appointments data from Firebase
  const fetchAppointments = async () => {
    try {
      const response = await axios.get(firebaseURL);
      if (response.data) {
        // Convert object data to an array of appointment objects
        const fetchedAppointments = Object.values(response.data);
        setAppointments(fetchedAppointments);
      } else {
        console.log("No appointments found in the database.");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div>
      <h1>Mechanic Portal</h1>
      <h2>Appointments</h2>
      <table className="appointments-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Address</th>
            <th>Query</th>
            <th>Visit Preference</th>
            <th>Selected Services</th>
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
                <td>{appointment.query}</td>
                <td>{appointment.visitPreference}</td>
                <td>{appointment.selectedServices}</td>
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
  );
};

export default MechanicPortal;
