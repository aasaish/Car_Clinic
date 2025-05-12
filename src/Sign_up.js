// SignUp.js
import React, { useState } from 'react';
import './Signup.css';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from './firebase';
import CustomAlert from './CustomAlert';
import axios from 'axios';
import emailjs from '@emailjs/browser';
import { Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem } from "@mui/material";


const SignUp = () => {
  const [userType, setUserType] = useState('user'); // Default to 'user' signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [experience, setExperience] = useState('');
  const [paymentProof, setPaymentProof] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    onConfirm: () => { },
  });

  // eslint-disable-next-line
  const [availability, setAvailability] = useState({
    sunday: { selected: false, openHour: null, closeHour: null },
    monday: { selected: false, openHour: null, closeHour: null },
    tuesday: { selected: false, openHour: null, closeHour: null },
    wednesday: { selected: false, openHour: null, closeHour: null },
    thursday: { selected: false, openHour: null, closeHour: null },
    friday: { selected: false, openHour: null, closeHour: null },
    saturday: { selected: false, openHour: null, closeHour: null },
  });

  const days = [
    { label: "Sunday", value: 0 },
    { label: "Monday", value: 1 },
    { label: "Tuesday", value: 2 },
    { label: "Wednesday", value: 3 },
    { label: "Thursday", value: 4 },
    { label: "Friday", value: 5 },
    { label: "Saturday", value: 6 },
  ];

  const [selectedDays, setSelectedDays] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentDay, setCurrentDay] = useState(null);
  const [timeInputs, setTimeInputs] = useState({ openHour: "", closeHour: "" });

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

  // const handleAvailabilityChange = (day) => {
  //   if (!availability[day].selected) {
  //     setSelectedDay(day);
  //     setTempOpenHour("");
  //     setTempCloseHour("");
  //   } else {
  //     setAvailability((prev) => ({
  //       ...prev,
  //       [day]: { selected: false, openHour: null, closeHour: null },
  //     }));
  //   }
  // };

  // const handleDialogSubmit = () => {
  //   if (tempOpenHour !== "" && tempCloseHour !== "" && tempOpenHour <= tempCloseHour) {
  //     setAvailability((prev) => ({
  //       ...prev,
  //       [selectedDay]: { selected: true, openHour: tempOpenHour, closeHour: tempCloseHour },
  //     }));
  //     setSelectedDay(null);
  //   }
  // };


  const firebaseURL = "https://car-clinic-9cc74-default-rtdb.firebaseio.com/mechanics.json"; // Firebase Database URL

  const showAlert = (message, onConfirm) => {
    setAlert({ show: true, message, onConfirm });
  };

  // Function to close alert
  const closeAlert = () => {
    setAlert({ show: false, message: '', onConfirm: () => { } });
  };

  // Handle form submit
  const handleSubmit = (e, calendarLink, calendarId) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showAlert('Passwords do not match!');
      return;
    }
    if (userType === 'user') {
      handleUserSignUp();
    } else {
      handleMechanicSignUp(calendarLink, calendarId);
    }
  };

  const handleSubmitAPI = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

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

    const requestBody = {
      isActive: true,
      locationId: "mJbcKUu0vB4yx1ekaRZh",
      name: `${name} - calendar`,
      description: "this is used for testing",
      teamMembers: [{ userId: "1rNy8XU4Da0GgwdxdxVS" }],
      calendarType: "personal",
      widgetType: "classic",
      slotDuration: 60,
      slotDurationUnit: "mins",
      slotInterval: 60,
      slotIntervalUnit: "mins",
      slotBuffer: 0,
      slotBufferUnit: "mins",
      preBuffer: 0,
      preBufferUnit: "mins",
      appoinmentPerSlot: 1,
      openHours,
      enableRecurring: false,
      recurring: {
        freq: "DAILY",
        count: 24,
        bookingOption: "skip",
        bookingOverlapDefaultStatus: "confirmed",
      },
    };

    try {
      const response = await fetch("https://services.leadconnectorhq.com/calendars/", {
        method: "POST",
        headers: {
          Authorization: "Bearer pit-903330fa-f57e-44f6-be36-48f93ef7bbcb",
          Version: "2021-04-15",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      console.log("API Response:", result.calendar.id);
      const calendarId = result.calendar.id;
      const calendarLink = `https://api.leadconnectorhq.com/widget/booking/${calendarId}`
      handleSubmit(e, calendarLink, calendarId);
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  const getAccessToken = async () => {
    const clientId = "5786665754-131bggp0f0k2f4j4cdjaimqn0idj1vnf.apps.googleusercontent.com";
    const clientSecret = "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";
    const refreshToken = "1//099ExCM7JZXeXCgYIARAAGAkSNwF-L9Ir_2auj4nj4KAzepIvI24JJ6-EVY4gTgSq_AH5M5G0s9-VHhsIWux6fqzxzRxD4MnlAhg";

    try {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
      });

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      return null;
    }
  };


  const uploadToGoogleDrive = async (file) => {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      console.error("Failed to get access token.");
      return;
    }

    const metadata = {
      name: file.name,
      mimeType: file.type,
      parents: ["1woYwQGYjFEg51aHzCEB2S3gjoNn4TpsY"], // Replace with the Google Drive folder ID where you want to store the file
    };

    const formData = new FormData();
    formData.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    formData.append("file", file);

    try {
      const response = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      console.log("File uploaded successfully:", data);
      return data.id; // Returns the file ID


    } catch (error) {
      console.error("Error uploading file to Google Drive:", error);
    }
  };

  const sendApprovalEmail = async (email, messagebody) => {
    const templateParams = {
      to_email: email,
      message: messagebody,
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

  const handleUserSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User signed up:', userCredential.user);
      showAlert(`Signed up as user: ${userCredential.user.email}`);
      const user = userCredential.user;

      // Set the display name
      await updateProfile(user, {
        displayName: name
      });

      console.log("User registered:", user);
      console.log("User name:", user.displayName);
      const userMessage = `Welcome ${user.displayName} to our Car Clinic system. You have been successfully sign up in Car Clinic. Enjoy the flawless services and experience!!!`
      await sendApprovalEmail(user.email, userMessage);
      window.location.reload();

    } catch (error) {
      console.error('Error signing up:', error);
      showAlert(`Sign-Up failed. Error: ${error.message}`);
    }
  };

  const handleMechanicSignUp = async (calendarLink, calendarId) => {
    // Logic to handle mechanic sign-up with the form data
    if (!paymentProof) {
      showAlert("Please upload payment proof!");
      setIsSubmitting(false);
      return;
    }
    if (paymentProof.size > 5 * 1024 * 1024) {
      showAlert("File too large. Please upload a file smaller than 5MB.");
      setIsSubmitting(false);
      return;
    }

    try {

      const fileId = await uploadToGoogleDrive(paymentProof);
      if (!fileId) {
        showAlert("Failed to upload payment proof!");
        setIsSubmitting(false);
        return;
      }

      const mechanicData = {
        name,
        email,
        phone,
        address,
        specialties,
        experience,
        role: "mechanic",
        status: "pending", // Mechanic request needs admin approval
        password,
        calendarLink: calendarLink,
        calendarId: calendarId,
        paymentProof: `https://drive.google.com/file/d/${fileId}/view`,
      };

      console.log(mechanicData);


      await axios.post(firebaseURL, mechanicData, {
        headers: { "Content-Type": "application/json" },
      });

      showAlert("Your request has been sent to the admin for approval!");
      const userMessage = `Dear ${mechanicData.name}, your request is successfully submitted. Now you have to wait for the approval from admin of Car Clinic. Thanks for trusting us!!!`
      await sendApprovalEmail(mechanicData.email, userMessage);
      const adminMessage = `Dear Admin of Car Clinic, you have got a new request from mechanic who is waiting for your approval. Please go to your Admin Portal and proceed accordingly.`
      const adminEmail = "aasaish@growthguild.us"
      await sendApprovalEmail(adminEmail, adminMessage);
      setIsSubmitting(false);
      window.location.reload();
    } catch (error) {
      console.error("Error signing up:", error);
      showAlert(`Sign-Up failed. Error: ${error.message}`);
      setIsSubmitting(false);
    }

  };

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Google Sign-Up Successful:', result.user);
      showAlert(`Signed up with Google as: ${result.user.email}`);
    } catch (error) {
      console.error('Error signing up with Google:', error);
      showAlert('Google Sign-Up failed. Please try again.');
    }
  };

  return (
    <>
      <div className="signup-container">
        <h1>Sign Up</h1>

        <div className="navigation-buttons">
          <button
            onClick={() => setUserType('user')}
            className={userType === 'user' ? 'active' : ''}
          >
            User Signup
          </button>
          <button
            onClick={() => setUserType('mechanic')}
            className={userType === 'mechanic' ? 'active' : ''}
          >
            Mechanic Signup
          </button>
        </div>

        {userType === 'user' ? (
          <div>
            <h2>User Signup</h2>
            <form onSubmit={handleSubmit} className="signup-form">
              <table>
                <tbody>
                  <tr>
                    <td><label>Name:</label></td>
                    <td><input type="text" value={name} onChange={(e) => setName(e.target.value)} required /></td>
                  </tr>


                  <tr>
                    <td><label>Email:</label></td>
                    <td><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></td>
                  </tr>

                  <tr>
                    <td><label>Phone Number:</label></td>
                    <td><input type="number" value={phone} onChange={(e) => setPhone(e.target.value)} required /></td>
                  </tr>
                  <tr>
                    <td><label>Password:</label></td>
                    <td><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></td>
                  </tr>
                  <tr>
                    <td><label>Confirm Password:</label></td>
                    <td><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></td>
                  </tr>
                </tbody>
              </table>

              <div className="form-group">
                <button type="button" className="signup-btn google-btn" onClick={handleGoogleSignUp}>
                  Sign up with Google
                </button>
              </div>

              <button type="submit">Submit</button>
            </form>
          </div>
        ) : (
          <div>
            <h2>Mechanic Signup</h2>
            <form onSubmit={handleSubmitAPI} className="signup-form">
              <table>
                <tbody>
                  <tr><td><label>Name:</label></td><td><input type="text" value={name} onChange={(e) => setName(e.target.value)} required /></td></tr>
                  <tr><td><label>Email:</label></td><td><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></td></tr>
                  <tr><td><label>Phone Number:</label></td><td><input type="number" value={phone} onChange={(e) => setPhone(e.target.value)} required /></td></tr>
                  <tr><td><label>Address:</label></td><td><input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required /></td></tr>
                  <tr>
                    <td><label>Specialty:</label></td>
                    <td>
                      <select value={specialties} onChange={(e) => setSpecialties(e.target.value)} required>
                        <option value="">Select Specialty</option>
                        <option value="Mechanic">Mechanic</option>
                        <option value="Electrician">Electrician</option>
                        <option value="Dentor">Dentor</option>
                        <option value="Painter">Painter</option>
                      </select>
                    </td>
                  </tr>
                  <tr><td><label>Experience:</label></td><td><input type="text" value={experience} onChange={(e) => setExperience(e.target.value)} required /></td></tr>
                  <tr><td><label>Payment Proof</label></td>
                    <td>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setPaymentProof(e.target.files[0])}
                      />
                    </td>
                  </tr>
                  <tr><td><label>Password:</label></td><td><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></td></tr>
                  <tr><td><label>Confirm Password:</label></td><td><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></td></tr>
                </tbody>
              </table>

              <div>
                <h2>Select Available Days</h2>
                {days.map((day) => (
                  <div key={day.value}>
                    <Checkbox checked={!!selectedDays[day.value]} onChange={() => handleCheckboxChange(day.value)} />
                    {day.label}
                    {selectedDays[day.value] && (
                      <span>
                        {" "}
                        ({selectedDays[day.value].openHour}:00 - {selectedDays[day.value].closeHour}:00)
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Submit'}</button>
            </form>


          </div>

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
      </div>
      {/* MUI Dialog for Time Selection */}
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
    </>
  );
};

export default SignUp;
