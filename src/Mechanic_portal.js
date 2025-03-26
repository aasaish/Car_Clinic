import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import "./Mechanic_portal.css";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

const MechanicPortal = () => {
  // State to store appointments
  const [appointments, setAppointments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Firebase URL
  const firebaseDB = "https://car-clinic-9cc74-default-rtdb.firebaseio.com";
  const firebaseURL = `${firebaseDB}/appointments.json`;
  const ghlUpdateURL = "https://services.leadconnectorhq.com/calendars/events/appointments";
  const calendarAppointmentsURL = "https://car-clinic-9cc74-default-rtdb.firebaseio.com/calendarAppointments.json";

  const AUTH_HEADER = {
    Authorization: "Bearer pit-903330fa-f57e-44f6-be36-48f93ef7bbcb",
    Version: "2021-04-15"
  };
  const LOCATION_ID = "mJbcKUu0vB4yx1ekaRZh";

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(firebaseURL);
      if (response.data) {
        setAppointments(Object.values(response.data));
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const fetchCalendarAppointments = async () => {
    try {
      const response = await axios.get(calendarAppointmentsURL);
      return response.data ? Object.values(response.data) : [];
    } catch (error) {
      console.error("Error fetching calendar appointments:", error);
      return [];
    }
  };

  const moveAppointmentAfterOneHour = async (appointmentId, calendarId) => {
    try {
      // Fetch calendarAppointments for the specific calendarId
      const calendarResponse = await axios.get(`${firebaseDB}/calendarAppointments/${calendarId}.json`);
      const calendarAppointments = calendarResponse.data ? calendarResponse.data.appointments : [];
  
      // Find the appointment we want to move
      const targetAppointment = calendarAppointments.find(app => app.appointmentId === appointmentId);
      if (!targetAppointment) {
        console.error("Appointment not found in calendarAppointments.");
        return;
      }
  
      // Calculate the new startTime (+1 hour)
      let newStartTime = new Date(targetAppointment.startTime);
      newStartTime.setHours(newStartTime.getHours() + 1);
      newStartTime = newStartTime.toISOString(); // Convert to string format
  
      // Find all appointments that need to be moved
      let appointmentsToUpdate = [];
      for (let i = calendarAppointments.length - 1; i >= 0; i--) {
        if (new Date(calendarAppointments[i].startTime) >= new Date(targetAppointment.startTime)) {
          let updatedTime = new Date(calendarAppointments[i].startTime);
          updatedTime.setHours(updatedTime.getHours() + 1);
          appointmentsToUpdate.push({
            appointmentId: calendarAppointments[i].appointmentId,
            newStartTime: updatedTime.toISOString(),
          });
        }
      }
  
      // ✅ Update GHL API for each affected appointment
      for (let appointment of appointmentsToUpdate) {
        try {
          const ghlResponse = await axios.put(
            `https://services.leadconnectorhq.com/calendars/events/appointments/${appointment.appointmentId}`,
            {
              calendarId: calendarId,
              startTime: appointment.newStartTime,
              locationId: "mJbcKUu0vB4yx1ekaRZh",
              ignoreFreeSlotValidation: true
            },
            {
              headers: {
                Authorization: "Bearer pit-903330fa-f57e-44f6-be36-48f93ef7bbcb",
                Version: "2021-04-15"
              }
            }
          );
  
          // If GHL API response is OK, update Firebase
          if (ghlResponse.status === 200) {
            // ✅ Update `appointments` collection correctly
            const allAppointmentsResponse = await axios.get(`${firebaseDB}/appointments.json`);
            const allAppointments = allAppointmentsResponse.data;
  
            // Find the correct key in the appointments collection
            let appointmentKey = Object.keys(allAppointments).find(
              key => allAppointments[key].appointmentId === appointment.appointmentId
            );
  
            if (appointmentKey) {
              await axios.patch(`${firebaseDB}/appointments/${appointmentKey}.json`, {
                startTime: appointment.newStartTime
              });
            } else {
              console.error(`Appointment ${appointment.appointmentId} not found in appointments collection.`);
            }
  
            // ✅ Update `calendarAppointments` collection
            const updatedAppointments = calendarAppointments.map(app => {
              if (app.appointmentId === appointment.appointmentId) {
                return { ...app, startTime: appointment.newStartTime };
              }
              return app;
            });
  
            await axios.put(`${firebaseDB}/calendarAppointments/${calendarId}.json`, {
              calendarId,
              appointments: updatedAppointments
            });
  
            console.log(`Appointment ${appointment.appointmentId} successfully moved to ${appointment.newStartTime}`);
          } else {
            console.error(`Failed to update appointment ${appointment.appointmentId} in GHL`);
          }
        } catch (ghlError) {
          console.error(`Error updating appointment ${appointment.appointmentId} in GHL:`, ghlError);
        }
      }
    } catch (error) {
      console.error("Error moving appointment:", error);
    }
  };
  
  // Function to open dialog with appointment details
  const handleOpenDialog = (appointment) => {
    setSelectedAppointment(appointment);
    setOpenDialog(true);
  };

  // Function to close dialog
  const handleCloseDialog = () => {
    setSelectedAppointment(null);
    setOpenDialog(false);
  };

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
            <th>Visit Preference</th>
            <th>Selected Services</th>
            <th>Details</th> {/* Updated Column */}
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
                  <Button variant="contained" color="primary" onClick={() => handleOpenDialog(appointment)}>
                    Open Details
                  </Button>
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

      {/* MUI Dialog for Appointment Details */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Appointment Details</DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <>
              <p><strong>Appointment ID:</strong> {selectedAppointment.appointmentId || "N/A"}</p>
              <p><strong>Visit Preference:</strong> {selectedAppointment.visitPreference || "N/A"}</p>
              <p>
                <strong>Start Time:</strong>
                {selectedAppointment.startTime ? dayjs(selectedAppointment.startTime).format("MMMM D, YYYY [at] hA") : "Not Set"}
              </p>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          {selectedAppointment && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => moveAppointmentAfterOneHour(selectedAppointment.appointmentId, selectedAppointment.calendarId)}
            >
              Move After 1 Hour
            </Button>
          )}
        </DialogActions>
      </Dialog>

    </div>
  );
};

export default MechanicPortal;
