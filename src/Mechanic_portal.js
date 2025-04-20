import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import emailjs from '@emailjs/browser';
import "./Mechanic_portal.css";
import CustomAlert from './CustomAlert';
import ShowDetails from "./ShowDetails";
import ConfirmAlert from './ConfirmAlert';
import ChargesModal from "./CustomInput";
import NameModal from "./CustomInputText";
import PasswordModal from "./CustomInputPassword";
import SelectModal from "./CustomSelect";
import SelectTwoModal from "./CustomTwoSelect";
import { Button, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, Select, MenuItem, InputLabel } from "@mui/material";
import { getAuth, onAuthStateChanged, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { auth, database } from './firebase';
import { ref, update } from "firebase/database";


const MechanicPortal = ({ user, setUser, mechanicData, setMechanicData }) => {

  // State to store appointments
  const [activeTable, setActiveTable] = useState('pending'); // Default table view is 'pending'
  const [appointments, setAppointments] = useState({ pending: [], completed: [] });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [openSelectFieldModal, setOpenSelectFieldModal] = useState(false);
  const [fieldRequestModal, setFieldRequestModal] = useState(false);
  const [chargesModalOpen, setChargesModalOpen] = useState(false);
  const [selectedForCharges, setSelectedForCharges] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedAppointments, setSelectedAppointments] = useState(null);
  const [selectedDays, setSelectedDays] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentDay, setCurrentDay] = useState(null);
  const [timeInputs, setTimeInputs] = useState({ openHour: "", closeHour: "" });
  const [calendarId, setCalendarId] = useState(null);
  const [mechanicRatings, setMechanicRatings] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [newUsername, setnewUsername] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [alert, setAlert] = useState({
    show: false,
    message: '',
    onConfirm: () => { },
  });
  const [appointmentID, setAppointmentID] = useState(true);

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

  const handleChangeField = async (fromField, toField) => {
    setOpenSelectFieldModal(false);

    if (!fromField || !toField || fromField === toField) {
      showAlert("Please select valid fields.");
      return;
    }

    const currentSpecialties = Array.isArray(mechanicData?.specialties)
      ? mechanicData.specialties
      : [mechanicData?.specialties];

    // Replace fromField with toField
    const updatedSpecialties = currentSpecialties
      .filter((field) => field !== fromField)
      .concat(toField);

    try {
      const mechanicRef = ref(database, `approvedMechanics/${user.uid}`);
      await update(mechanicRef, { specialties: updatedSpecialties });

      setMechanicData({ ...mechanicData, specialties: updatedSpecialties });
      showAlert("Field changed successfully!");
      const Message = `Dear ${user.displayName}, your request for change of field is accepted successfully. Your previous speciality "${fromField}" is replaced by "${toField}". Thank you for your time!!!`
      await sendApprovalEmail(user.email, Message);
    } catch (error) {
      console.error("Error updating field:", error);
      showAlert("Failed to update field.");
    }
  };

  const handleFieldRequest = async (newField) => {
    setFieldRequestModal(false);

    if (!newField || newField === mechanicData?.specialty) {
      showAlert("Please select a different field.");
      return;
    }

    try {
      await update(ref(database, `mechanicRequests/${mechanicData.uid}`), {
        ...mechanicData,
        newSpecialty: newField,
      });

      showAlert("Your request for another field is send to admin successfully!");
      const Message = `Dear ${user.displayName}, your request for adding another field is send to admin successfully!. You have to wait for admin approval. Thanks for your patience!!!`
      await sendApprovalEmail(user.email, Message);
    } catch (error) {
      console.error("Error updating specialty:", error);
      showAlert("Failed to update specialty.");
    }
  };

  const handleSubmitAPI = async (e, calendarId) => {
    e.preventDefault();
    let newCalendarId = calendarId;

    if (Object.keys(selectedDays).length === 0) {
      console.log("Please select at least one day for availability.");
      return;
    }
    const openHours = Object.keys(selectedDays).map((day) => ({
      daysOfTheWeek: [parseInt(day)],
      hours: [
        {
          openHour: selectedDays[day].openHour,
          openMinute: 0,
          closeHour: selectedDays[day].closeHour,
          closeMinute: 0,
        },
      ],
    }));
    console.log("newCalendariD : ", newCalendarId);

    const requestBody = {
      openHours
    };

    try {
      const response = await fetch(`https://services.leadconnectorhq.com/calendars/${newCalendarId}`, {
        method: "PUT",
        headers: {
          Authorization: "Bearer pit-903330fa-f57e-44f6-be36-48f93ef7bbcb",
          Version: "2021-04-15",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      console.log("API Response:", result);
      showAlert("Availability Updated Successfully!!!");
      const userMessage = `Dear ${user.displayName}, your availability is updated successfully!!! Have fun!!!`
      await sendApprovalEmail(user.email, userMessage);
    } catch (error) {
      console.error("API Error:", error);
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

  const handleShowDetail = () => {
    setShowDetail(false);
    setSelectedAppointments(null);
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
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        fetchAppointments(user.email); // Initial fetch
        fetchMechanicCalendarId(user.email);
        fetchMechanicRatings(user.email);

        // Set interval to refetch appointments and ratings every 3 seconds
        const intervalId = setInterval(() => {
          fetchAppointments(user.email);
          fetchMechanicRatings(user.email);
        }, 10000);

        // Clean up interval when user logs out or component unmounts
        return () => clearInterval(intervalId);
      } else {
        setUserEmail(null);
        setAppointments([]);
        setMechanicRatings([]);
      }
    });

    // Cleanup auth listener on unmount
    return () => unsubscribe();
  }, []);


  const fetchMechanicRatings = async (email) => {
    try {
      const response = await axios.get(mechanicsURL); // Get all approved mechanics
      const mechanics = response.data;

      // Find the mechanic based on email
      const mechanic = Object.values(mechanics).find(mechanic => mechanic.email === email);

      if (mechanic && mechanic.ratings && mechanic.ratings.items) {
        // Extract ratings from the mechanic's ratings.items
        const ratingsArray = Object.values(mechanic.ratings.items);
        setMechanicRatings(ratingsArray); // Store ratings in state
      }
    } catch (error) {
      console.error("Error fetching mechanic ratings:", error);
    }
  };

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

  const fetchAppointments = async (email) => {
    try {
      const response = await axios.get(firebaseURL);
      if (response.data) {
        const appointmentsArray = Object.entries(response.data).map(([id, data]) => ({
          id,
          ...data,
        }));

        const mechanicAppointments = appointmentsArray.filter(
          (appointment) => appointment.mechanicEmail === email
        );

        const pending = mechanicAppointments.filter(app => app.status === "pending");
        const completed = mechanicAppointments.filter(app => app.status === "completed");

        // Calculate revenue from completed appointments
        const total = completed.reduce((sum, app) => {
          const charge = parseFloat(app.charges);
          return sum + (isNaN(charge) ? 0 : charge);
        }, 0);

        setAppointments({ pending, completed });
        setTotalRevenue(total); // 👈 Set revenue here
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  // by monthly revenue
  // const fetchAppointments = async (email) => {
  //   try {
  //     const response = await axios.get(firebaseURL);
  //     if (response.data) {
  //       const appointmentsArray = Object.entries(response.data).map(([id, data]) => ({
  //         id,
  //         ...data,
  //       }));

  //       const mechanicAppointments = appointmentsArray.filter(
  //         (appointment) => appointment.mechanicEmail === email
  //       );

  //       const pending = mechanicAppointments.filter(app => app.status === "pending");
  //       const completed = mechanicAppointments.filter(app => app.status === "completed");

  //       // --- Monthly Revenue Calculation ---
  //       const revenueByMonth = {};
  //       completed.forEach(app => {
  //         if (app.charges) {
  //           const month = dayjs(app.EntryDate || app.date).format("MMMM YYYY");
  //           revenueByMonth[month] = (revenueByMonth[month] || 0) + parseFloat(app.charges);
  //         }
  //       });

  //       setAppointments({ pending, completed });
  //       setMonthlyRevenue(revenueByMonth);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching appointments:", error);
  //   }
  // };


  // const updateAppointmentStatus = async (appointmentId) => {
  //   try {
  //     const updateURL = `https://car-clinic-9cc74-default-rtdb.firebaseio.com/appointments/${appointmentId}.json`;

  //     await axios.patch(updateURL, { status: "completed" }); // Correctly updating the status

  //     // Refresh appointments after update
  //     fetchAppointments();
  //   } catch (error) {
  //     console.error("Error updating appointment status:", error);
  //   }
  // };

  const deleteAppointment = async (appointment, appointmentId) => {
    console.log(appointment);
    setShowConfirmation(true);
    setSelectedAppointments(appointment)
    setAppointmentID(appointmentId);
  };

  const handleConfirm = async () => {
    try {
      const deleteURL = `https://car-clinic-9cc74-default-rtdb.firebaseio.com/appointments/${appointmentID}.json`;
      await axios.delete(deleteURL); // Delete appointment from Firebase
      fetchAppointments();
      setShowConfirmation(false);
      const userMessage = `Dear ${selectedAppointments.name}, your appointment request has been cancel by the mechanic ${selectedAppointments.mechanic}. We are sorry for the inconvenience. Thank you for your trust!!!`
      await sendApprovalEmail(selectedAppointments.email, userMessage);
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

  const moveAppointmentAfterOneHour = async (appointment, appointmentId, calendarId, depth = 0) => {
    setIsLoading(true);
    try {
      const calendarResponse = await axios.get(`${firebaseDB}/calendarAppointments/${calendarId}.json`);
      if (!calendarResponse.data || !calendarResponse.data.appointments) {
        console.error(`No appointments found for calendarId: ${calendarId}`);
        return;
      }

      let calendarAppointments = calendarResponse.data.appointments.filter(app => app !== null);
      console.log("Filtered calendar data:", calendarAppointments);

      let latestAppointment = calendarAppointments
        .filter(app => app.appointmentId === appointmentId)
        .reduce((latest, current) => {
          return new Date(current.startTime) > new Date(latest.startTime) ? current : latest;
        }, calendarAppointments[0]);
      console.log("Latest Apppiutnemnt : ", latestAppointment);

      if (!latestAppointment) {
        console.error("Appointment not found in calendarAppointments.");
        return;
      }

      let newStartTime = new Date(latestAppointment.startTime);
      newStartTime.setHours(newStartTime.getHours() + 1);
      const formattedNewStartTime = formatDateWithOffset(newStartTime, 5);

      console.log("Latest appointment:", latestAppointment);
      console.log("Formatted new start time:", formattedNewStartTime);

      let conflictingAppointment = calendarAppointments.find(
        app => new Date(app.startTime).getTime() === newStartTime.getTime()
      );

      if (conflictingAppointment) {
        console.log(`Conflicting appointment found at ${formattedNewStartTime}. Moving it first.`);
        await moveAppointmentAfterOneHour(conflictingAppointment.appointmentId, calendarId, depth + 1);
      }

      await updateAppointmentInGHLAndFirebase(appointmentId, calendarId, formattedNewStartTime, calendarAppointments);
      console.log(`Appointment ${appointmentId} moved to ${formattedNewStartTime}`);
      const mecMessage = `Dear ${user.displayName}, your appointment ${appointmentId} moved to ${formattedNewStartTime} successfully!!! Have fun!!!`
      await sendApprovalEmail(user.email, mecMessage);
      const userMessage = `Dear ${appointment.name}, your appointment for ${appointment.carModel} moved to ${formattedNewStartTime} by mechanic. Sorry for the inconvenience!`
      await sendApprovalEmail(appointment.email, userMessage);

      if (depth === 0) {
        setIsLoading(false);
        window.location.reload();
      }

    } catch (error) {
      console.error("Error moving appointment:", error);
    }
  };

  const formatDateWithOffset = (date, offsetHours) => {
    const pad = num => String(num).padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    const offsetSign = offsetHours >= 0 ? "+" : "-";
    const absOffsetHours = Math.abs(offsetHours);
    const offsetFormatted = `${offsetSign}${pad(absOffsetHours)}:00`;

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetFormatted}`;
  };

  const updateAppointmentInGHLAndFirebase = async (appointmentId, calendarId, newStartTime, calendarAppointments) => {
    try {
      const ghlResponse = await axios.put(
        `https://services.leadconnectorhq.com/calendars/events/appointments/${appointmentId}`,
        {
          calendarId: calendarId,
          startTime: newStartTime,
          locationId: "mJbcKUu0vB4yx1ekaRZh",
          ignoreFreeSlotValidation: true,
          assignedUserId: "1rNy8XU4Da0GgwdxdxVS"
        },
        {
          headers: {
            Authorization: "Bearer pit-903330fa-f57e-44f6-be36-48f93ef7bbcb",
            Version: "2021-04-15"
          }
        }
      );

      if (ghlResponse.status === 200) {
        console.log(`GHL updated appointment ${appointmentId} to ${newStartTime}`);

        // ✅ Convert back to Firebase format (YYYY-MM-DDTHH:mm:ss)
        const firebaseFormattedTime = newStartTime.split("+")[0];

        const allAppointmentsResponse = await axios.get(`${firebaseDB}/appointments.json`);
        const allAppointments = allAppointmentsResponse.data;

        let appointmentKey = Object.keys(allAppointments).find(
          key => allAppointments[key].appointmentId === appointmentId
        );

        if (appointmentKey) {
          await axios.patch(`${firebaseDB}/appointments/${appointmentKey}.json`, { startTime: firebaseFormattedTime });
        } else {
          console.error(`Appointment ${appointmentId} not found in appointments collection.`);
        }

        // ✅ Update only the latest appointment in `calendarAppointments`
        let index = calendarAppointments.findIndex(app => app.appointmentId === appointmentId);
        if (index !== -1) {
          calendarAppointments[index].startTime = firebaseFormattedTime;
        }


        if (index !== -1) {
          await axios.patch(`${firebaseDB}/calendarAppointments/${calendarId}/appointments/${index}.json`, {
            startTime: firebaseFormattedTime
          });
          console.log(`Patched appointment ${appointmentId} at index ${index} in calendarAppointments.`);
        } else {
          console.warn(`Appointment ${appointmentId} not found in calendarAppointments array.`);
        }

        console.log(`Appointment ${appointmentId} successfully moved to ${firebaseFormattedTime}`);
      } else {
        console.error(`Failed to update appointment ${appointmentId} in GHL`);
      }
    } catch (ghlError) {
      console.error(`Error updating appointment ${appointmentId} in GHL:`, ghlError);
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

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  const handleItemClick = () => {
    setIsOpen(false); // close after clicking
  };

  return (
    <>
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
                  <button className="dropdown-item" onClick={() => { setOpenSelectFieldModal(true); handleItemClick() }}>
                    Change Field
                  </button>
                </li>
                <li>
                  <button className="dropdown-item" onClick={() => { setFieldRequestModal(true); handleItemClick(); }}>
                    Request for Another Field
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
      <div className="admin-portal">

        {isLoading && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(28, 21, 21, 0.8)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: 'all',
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: "#6C4D13" }}>Processing appointments...</div>
          </div>
        )}

        <div className="sidebar">
          <button className={activeTable === 'pending' ? 'active-tab' : ''} onClick={() => setActiveTable('pending')}>Pending</button>
          <button className={activeTable === 'completed' ? 'active-tab' : ''} onClick={() => setActiveTable('completed')}>Completed</button>
          <button className={activeTable === 'availability' ? 'active-tab' : ''} onClick={() => setActiveTable('availability')}>Availability</button>
          <button className={activeTable === 'ratings' ? 'active-tab' : ''} onClick={() => setActiveTable('ratings')}>Ratings</button>
          <button className={activeTable === 'revenue' ? 'active-tab' : ''} onClick={() => setActiveTable('revenue')}>Revenue</button>
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
                  <th>Car Model</th>
                  <th>Visit Preference</th>
                  <th>Selected Services</th>
                  <th>Details</th> {/* Updated Column */}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments?.pending?.length > 0 ? (
                  appointments.pending.map((appointment, index) => (
                    <tr key={appointment.id}>
                      <td>{appointment.name}</td>
                      <td>{appointment.email}</td>
                      <td>{appointment.mobile}</td>
                      <td>{appointment.address}</td>
                      <td>{appointment.carModel}</td>
                      <td>{appointment.visitPreference}</td>
                      <td>{appointment.selectedServices}</td>
                      <td>
                        {appointment.visitPreference === "I Will Visit" ? (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenDialog(appointment)}
                          >
                            Open Details
                          </Button>
                        ) : appointment.visitPreference === "Visit Me" ? (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                              setSelectedAppointments(appointment);
                              setShowDetail(true);
                            }}
                          >
                            Open Details
                          </Button>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td>
                        <Button variant="contained" color="success" onClick={() => {
                          setSelectedForCharges(appointment);
                          setChargesModalOpen(true);
                        }} style={{ marginLeft: "10px" }}>
                          Done
                        </Button>
                        <Button variant="contained" color="error" onClick={() => deleteAppointment(appointment, appointment.id)} >
                          Cancel
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9">No appointments available.</td>
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
                  <th>Car Model</th>
                  <th>Visit Preference</th>
                  <th>Selected Services</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {appointments?.completed?.length > 0 ? (
                  appointments.completed.map((appointment, index) => (
                    <tr key={index}>
                      <td>{appointment.name}</td>
                      <td>{appointment.email}</td>
                      <td>{appointment.mobile}</td>
                      <td>{appointment.address}</td>
                      <td>{appointment.carModel}</td>
                      <td>{appointment.visitPreference}</td>
                      <td>{appointment.selectedServices}</td>
                      <td>
                        {appointment.visitPreference === "I Will Visit" ? (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenDialog(appointment)}
                          >
                            Open Details
                          </Button>
                        ) : appointment.visitPreference === "Visit Me" ? (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                              setSelectedAppointments(appointment);
                              setShowDetail(true);
                            }}
                          >
                            Open Details
                          </Button>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8">No appointments completed yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
          {activeTable === 'availability' && (
            <div>
              <h2>Select Available Days</h2>
              {days.map((day) => (
                <div key={day.value}>
                  <Checkbox checked={!!selectedDays[day.value]} onChange={() => handleCheckboxChange(day.value)} />
                  {day.label}
                  {selectedDays[day.value] && (
                    <span> ({selectedDays[day.value].openHour}:00 - {selectedDays[day.value].closeHour}:00)</span>
                  )}
                </div>
              ))}
              <Button
                variant="contained"
                color="primary"
                onClick={(e) => handleSubmitAPI(e, calendarId)}
              >
                Update Availability
              </Button>
            </div>
          )}

          {activeTable === 'ratings' && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Rating</th>
                  <th>Comments</th>
                </tr>
              </thead>
              <tbody>
                {mechanicRatings.length > 0 ? (
                  mechanicRatings.map((rating, index) => (
                    <tr key={index}>
                      <td>{rating.userEmail}</td>
                      <td>{rating.rating}</td>
                      <td>{rating.comments}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3">No ratings available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
          {activeTable === 'revenue' && (
            <div className="revenue">
              <div>
                <h2>The Revenue of this month:</h2>
                <h2>Rs: {totalRevenue}/-</h2>
              </div>
              <div>
                <h2>Whole revenue generated from this platform:</h2>
                <h2>Rs: {totalRevenue}/-</h2>
              </div>
            </div>
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
                <p><strong>Query:</strong> {selectedAppointment.query || "N/A"}</p>
                <p><strong>Car Model:</strong> {selectedAppointment.carModel || "N/A"}</p>
                <p><strong>Car Number Plate:</strong> {selectedAppointment.carNumberPlate || "N/A"}</p>
                <p><strong>Selected Services:</strong> {selectedAppointment.selectedServices || "N/A"}</p>
                <p><strong>Mechanic Name:</strong> {selectedAppointment.mechanicName || "N/A"}</p>

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
                onClick={() => moveAppointmentAfterOneHour(selectedAppointment, selectedAppointment.appointmentId, selectedAppointment.calendarId)}
              >
                Extend an hour
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

        <ChargesModal
          open={chargesModalOpen}
          onClose={() => setChargesModalOpen(false)}
          onConfirm={async (charges) => {
            if (charges === "") {
              showAlert('Charges cannot be empty!');
              return;
            }
            setChargesModalOpen(false);
            try {
              const updateURL = `https://car-clinic-9cc74-default-rtdb.firebaseio.com/appointments/${selectedForCharges.id}.json`;
              await axios.patch(updateURL, {
                status: "completed",
                charges,
              });
              fetchAppointments();
              const userMessage = `Dear ${selectedForCharges.name}, your appointment request for services has been completed by the mechanic ${selectedForCharges.mechanic}. Please give ratings to your mechanic depends on the service provided by log into your account in Car Clinic and go to My Appointments. Thank you for your trust!!!`
              await sendApprovalEmail(selectedForCharges.email, userMessage);

            } catch (error) {
              console.error("Error updating status/charges:", error);
            }
          }}
          heading={"Enter Service Charges:"}
          placeholderText={"Enter Charges Here:"}
        />

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

        {showDetail && selectedAppointments && (
          <ShowDetails
            appointment={selectedAppointments}
            onConfirm={handleShowDetail}
          />
        )}

        {showConfirmation && (
          <ConfirmAlert
            message={"Are you sure to reject this appointment?"}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        )}

        <NameModal
          open={newUsername}
          onClose={() => setnewUsername(false)}
          onConfirm={handleUpdateUserName}
          heading={"Change Username:"}
          placeholderText={"Enter New Name Here:"}
        />

        <PasswordModal
          open={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          onConfirm={handlePasswordChange}
          heading="Change Your Password"
        />

        <SelectTwoModal
          open={openSelectFieldModal}
          onClose={() => setOpenSelectFieldModal(false)}
          onConfirm={handleChangeField}
          heading="Change Your Field:"
          currentField={mechanicData?.specialties}
        />

        <SelectModal
          open={fieldRequestModal}
          onClose={() => setFieldRequestModal(false)}
          onConfirm={handleFieldRequest}
          heading="Request for Another Field:"
          currentField={mechanicData?.specialties}
        />

      </div>
    </>
  );
};

export default MechanicPortal;



