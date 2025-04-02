import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import "./Mechanic_portal.css";
import { Button, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, Select, MenuItem, InputLabel } from "@mui/material";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Import Firebase Auth


const MechanicPortal = ({ user, setUser }) => {
  // State to store appointments
  const [activeTable, setActiveTable] = useState('pending'); // Default table view is 'pending'
  const [appointments, setAppointments] = useState({ pending: [], completed: [] });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  const [selectedDays, setSelectedDays] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentDay, setCurrentDay] = useState(null);
  const [timeInputs, setTimeInputs] = useState({ openHour: "", closeHour: "" });
  const [calendarId, setCalendarId] = useState(null);
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    onConfirm: () => { },
  });
  const [showAppointments, setShowAppointments] = useState(true);



  const handleCheckboxChange = (day) => {
    if (selectedDays[day]) {
      const newDays = { ...selectedDays };
      delete newDays[day];
      setSelectedDays(newDays);
    } else {
      setCurrentDay(day);
      setDialogOpen(true);
    }
  };



  const handleTimeChange = (field, value) => {
    setTimeInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitTime = () => {
    setSelectedDays((prev) => ({
      ...prev,
      [currentDay]: { openHour: timeInputs.openHour, closeHour: timeInputs.closeHour },
    }));
    setDialogOpen(false);
    setTimeInputs({ openHour: "", closeHour: "" });
  };

  const showAlert = (message, onConfirm) => {
    setAlert({ show: true, message, onConfirm });
  };

  // Function to close alert
  const closeAlert = () => {
    setAlert({ show: false, message: '', onConfirm: () => { } });
  };


  const days = [
    { label: "Sunday", value: 0 },
    { label: "Monday", value: 1 },
    { label: "Tuesday", value: 2 },
    { label: "Wednesday", value: 3 },
    { label: "Thursday", value: 4 },
    { label: "Friday", value: 5 },
    { label: "Saturday", value: 6 },
  ];


  // Firebase URL
  const firebaseDB = "https://car-clinic-9cc74-default-rtdb.firebaseio.com";
  const firebaseURL = `${firebaseDB}/appointments.json`;
  const mechanicsURL = `${firebaseDB}/approvedMechanics.json`;
  const ghlUpdateURL = "https://services.leadconnectorhq.com/calendars/events/appointments";
  const calendarAppointmentsURL = "https://car-clinic-9cc74-default-rtdb.firebaseio.com/calendarAppointments.json";

  const AUTH_HEADER = {
    Authorization: "Bearer pit-903330fa-f57e-44f6-be36-48f93ef7bbcb",
    Version: "2021-04-15"
  };
  const LOCATION_ID = "mJbcKUu0vB4yx1ekaRZh";

  useEffect(() => {
    // Get the currently signed-in user
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email); // Store the user's email
        fetchAppointments(user.email); // Fetch only relevant appointments
        fetchMechanicCalendarId(user.email);
      } else {
        setUserEmail(null);
        setAppointments([]);
      }
    });
  }, []);


  const fetchMechanicCalendarId = async (email) => {
    try {
      const response = await axios.get(mechanicsURL);
      if (response.data) {
        const mechanic = Object.values(response.data).find(
          (m) => m.email === email
        );
        if (mechanic) {
          setCalendarId(mechanic.calendarId);
          console.log("calendar Id : ", mechanic.calendarId)

        }
      }
    } catch (error) {
      console.error("Error fetching calendarId:", error);
    }
  };

  // useEffect(() => {
  //   fetchAppointments();
  // }, []);

  const fetchAppointments = async (email) => {
    try {
      const response = await axios.get(firebaseURL);
      if (response.data) {
        // Convert Firebase object into an array while preserving the unique keys
        const appointmentsArray = Object.entries(response.data).map(([id, data]) => ({
          id, // Store Firebase ID for updating/deleting
          ...data,
        }));

        // Filter appointments for the logged-in mechanic
        const mechanicAppointments = appointmentsArray.filter(
          (appointment) => appointment.mechanicEmail === user?.email
        );

        // Separate into pending and completed
        setAppointments({
          pending: mechanicAppointments.filter(app => app.status === "pending"),
          completed: mechanicAppointments.filter(app => app.status === "completed"),
        });
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };


  const updateAppointmentStatus = async (appointmentId) => {
    try {
      const updateURL = `https://car-clinic-9cc74-default-rtdb.firebaseio.com/appointments/${appointmentId}.json`;

      await axios.patch(updateURL, { status: "completed" }); // Correctly updating the status

      // Refresh appointments after update
      fetchAppointments();
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
  };

  const deleteAppointment = async (appointmentId) => {
    try {
      const deleteURL = `https://car-clinic-9cc74-default-rtdb.firebaseio.com/appointments/${appointmentId}.json`;

      await axios.delete(deleteURL); // Delete appointment from Firebase

      // Refresh appointments after deletion
      fetchAppointments();
    } catch (error) {
      console.error("Error deleting appointment:", error);
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

  const formatStartTime = (date) => {
    const pad = (num) => String(num).padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // Months are 0-based
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+05:00`;
  };

  const moveAppointmentAfterOneHour = async (appointmentId, calendarId) => {
    // try {
    //   const calendarResponse = await axios.get(`${firebaseDB}/calendarAppointments/${calendarId}.json`);
    //   if (!calendarResponse.data || !calendarResponse.data.appointments) {
    //     console.error(`No appointments found for calendarId: ${calendarId}`);
    //     return;
    //   }

    //   let calendarAppointments = calendarResponse.data.appointments.filter(app => app !== null);
    //   console.log("Filtered calendar data:", calendarAppointments);

    //   let latestAppointment = calendarAppointments
    //     .filter(app => app.appointmentId === appointmentId)
    //     .reduce((latest, current) => {
    //       return new Date(current.startTime) > new Date(latest.startTime) ? current : latest;
    //     }, calendarAppointments[0]);

    //   if (!latestAppointment) {
    //     console.error("Appointment not found in calendarAppointments.");
    //     return;
    //   }

    //   // Calculate the new startTime (+1 hour)
    //   let newStartTime = new Date(targetAppointment.startTime);
    //   newStartTime.setHours(newStartTime.getHours() + 1);
    //   newStartTime = newStartTime.toISOString(); // Convert to string format

    //   // Find all appointments that need to be moved
    //   let appointmentsToUpdate = [];
    //   for (let i = calendarAppointments.length - 1; i >= 0; i--) {
    //     if (new Date(calendarAppointments[i].startTime) >= new Date(targetAppointment.startTime)) {
    //       let updatedTime = new Date(calendarAppointments[i].startTime);
    //       updatedTime.setHours(updatedTime.getHours() + 1);
    //       appointmentsToUpdate.push({
    //         appointmentId: calendarAppointments[i].appointmentId,
    //         newStartTime: updatedTime.toISOString(),
    //       });
    //     }
    //   }

    //   // ✅ Update GHL API for each affected appointment
    //   for (let appointment of appointmentsToUpdate) {
    //     try {
    //       const ghlResponse = await axios.put(
    //         `https://services.leadconnectorhq.com/calendars/events/appointments/${appointment.appointmentId}`,
    //         {
    //           calendarId: calendarId,
    //           startTime: appointment.newStartTime,
    //           locationId: "mJbcKUu0vB4yx1ekaRZh",
    //           ignoreFreeSlotValidation: true
    //         },
    //         {
    //           headers: {
    //             Authorization: "Bearer pit-903330fa-f57e-44f6-be36-48f93ef7bbcb",
    //             Version: "2021-04-15"
    //           }
    //         }
    //       );

    //       // If GHL API response is OK, update Firebase
    //       if (ghlResponse.status === 200) {
    //         //emails sent
    //         // ✅ Update `appointments` collection correctly
    //         const allAppointmentsResponse = await axios.get(`${firebaseDB}/appointments.json`);
    //         const allAppointments = allAppointmentsResponse.data;

    //         // Find the correct key in the appointments collection
    //         let appointmentKey = Object.keys(allAppointments).find(
    //           key => allAppointments[key].appointmentId === appointment.appointmentId
    //         );

    //         if (appointmentKey) {
    //           await axios.patch(`${firebaseDB}/appointments/${appointmentKey}.json`, {
    //             startTime: appointment.newStartTime
    //           });
    //         } else {
    //           console.error(`Appointment ${appointment.appointmentId} not found in appointments collection.`);
    //         }

    //         // ✅ Update `calendarAppointments` collection
    //         const updatedAppointments = calendarAppointments.map(app => {
    //           if (app.appointmentId === appointment.appointmentId) {
    //             return { ...app, startTime: appointment.newStartTime };
    //           }
    //           return app;
    //         });

    //         await axios.put(`${firebaseDB}/calendarAppointments/${calendarId}.json`, {
    //           calendarId,
    //           appointments: updatedAppointments
    //         });

    //         console.log(`Appointment ${appointment.appointmentId} successfully moved to ${appointment.newStartTime}`);
    //       } else {
    //         console.error(`Failed to update appointment ${appointment.appointmentId} in GHL`);
    //       }
    //     } catch (ghlError) {
    //       console.error(`Error updating appointment ${appointment.appointmentId} in GHL:`, ghlError);
    //     }
    //   }
    // } catch (error) {
    //   console.error("Error moving appointment:", error);
    // }
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
    <div className="admin-portal">

      <div className="sidebar">
        <button onClick={() => setActiveTable('pending')}>Pending</button>
        <button onClick={() => setActiveTable('completed')}>Completed</button>
        <button onClick={() => setActiveTable('availability')}>Availability</button>
        <button onClick={() => setActiveTable('ratings')}>Ratings</button>
      </div>
      <div className="table-container">
        {activeTable === 'pending' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Address</th>
                <th>Visit Preference</th>
                <th>Selected Services</th>
                <th>Details</th> {/* Updated Column */}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.pending.length > 0 ? (
                appointments.pending.map((appointment, index) => (
                  <tr key={appointment.id}>
                    <td>{appointment.name}</td>
                    <td>{appointment.email}</td>
                    <td>{appointment.mobile}</td>
                    <td>{appointment.address}</td>
                    <td>{appointment.visitPreference}</td>
                    <td>{appointment.selectedServices}</td>
                    <td>
                      <Button variant="contained" color="primary" onClick={() => handleOpenDialog(appointment)}>
                        Open Details
                      </Button></td>
                    <td>
                      <Button variant="contained" color="success" onClick={() => updateAppointmentStatus(appointment.id)}>
                        Done
                      </Button>
                      <Button variant="contained" color="error" onClick={() => deleteAppointment(appointment.id)} style={{ marginLeft: "4px" }}>
                        X
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">No appointments available.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeTable === 'completed' && (
          <table className="data-table">
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
              {appointments.completed.length > 0 ? (
                appointments.completed.map((appointment, index) => (
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
                  <td colSpan="7">No appointments completed yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
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
              >
              {/*onClick={(e) => handleSubmitAPI(e, calendarId)}*/}
              Update Availability
            </Button>
          )}
        </DialogActions>
</Dialog>
        {/* MUI Dialog for Appointment Details */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>Select Open and Close Hours</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="normal">
              <InputLabel>Open Hour</InputLabel>
              <Select value={timeInputs.openHour} onChange={(e) => handleTimeChange("openHour", e.target.value)}>
                {[...Array(24).keys()].map((hour) => (
                  <MenuItem key={hour} value={hour}>
                    {hour}:00
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Close Hour</InputLabel>
              <Select value={timeInputs.closeHour} onChange={(e) => handleTimeChange("closeHour", e.target.value)}>
                {[...Array(24).keys()].map((hour) => (
                  <MenuItem key={hour} value={hour}>
                    {hour}:00
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmitTime}
              color="primary"
              variant="contained"
              disabled={
                timeInputs.openHour === "" ||
                timeInputs.closeHour === "" ||
                timeInputs.openHour >= timeInputs.closeHour
              }
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

    
    </div>
  );
};

export default MechanicPortal;



{/* 
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
            <th>Details</th> 
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
          </table> */}