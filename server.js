const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const ngrok = require('ngrok'); // Import ngrok
const axios = require("axios");



// Initialize Firebase Admin with service account
const serviceAccount = require("./serviceAccountKey.json"); // Download from Firebase Console
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// Fetch all users
app.get("/getUsers", async (req, res) => {
  try {
    const listUsers = await admin.auth().listUsers(); // Fetch users from Firebase Auth
    const users = listUsers.users.map(user => ({
      uid: user.uid,
      name: user.displayName || "N/A",
      email: user.email,
      phone: user.phoneNumber || "N/A",
    }));

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/deleteUser/:uid", async (req, res) => {
  const { uid } = req.params;
  try {
    await admin.auth().deleteUser(uid); // Delete user from Firebase Authentication
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: error.message });
  }
});


const firebaseDB = "https://car-clinic-9cc74-default-rtdb.firebaseio.com"; // Firebase base URL
const firebaseURL = "https://car-clinic-9cc74-default-rtdb.firebaseio.com/appointments.json";

app.post("/webhook", async (req, res) => {
  try {
    console.log("Received webhook Body", req.body.calendar, req.body.customData);

    const { calendar, customData } = req.body;

    if (!calendar || !customData) {
      return res.status(400).json({ error: "Invalid webhook data" });
    }

    const { id: calendarId, calendarName, startTime, endTime } = calendar;
    const { nameContact, emailContact, appointmentId } = customData;

    // ✅ Fetch existing Firebase data to find a matching `calendarId`
    const firebaseResponse = await axios.get(`${firebaseDB}/appointments.json`);
    const existingAppointments = firebaseResponse.data;
    console.log("Existing Appointments:", existingAppointments);

    let matchedEntry = null;

    // ✅ Check if any appointment in Firebase matches `calendarId`
    for (let key in existingAppointments) {
      if (existingAppointments[key].calendarId === calendarId) {
        matchedEntry = { ...existingAppointments[key], key };
        break;
      }
    }

    // ❌ If no match, skip processing
    if (!matchedEntry) {
      console.log("No matching calendarId found, skipping...");
      return res.status(200).json({ message: "No matching calendarId found" });
    }

    console.log("Matched Entry:", matchedEntry);

    // ✅ Verify `calendarName` contains `mechanicName`
    if (!calendarName.includes(matchedEntry.mechanicName)) {
      console.log("Calendar name does not contain the mechanic name, skipping...");
      return res.status(200).json({ message: "Calendar name mismatch" });
    }

    // ✅ Data to store in the new Firebase collection
    const newAppointmentData = {
      name: matchedEntry.name, // From Firebase
      appointmentId, // From Webhook
      calendarId, // From Webhook
      startTime, // From Webhook
      endTime, // From Webhook
      nameContact, // From Webhook
      emailContact, // From Webhook
      calendarLink: matchedEntry.calendarLink, // From Firebase
    };

    console.log("Saving appointment:", newAppointmentData);

    // ✅ Save to a new Firebase collection (e.g., `processedAppointments`)
    await axios.post(`${firebaseDB}/processedAppointments.json`, newAppointmentData);

    // ✅ Check if the `calendarAppointments` collection exists for this `calendarId`
    const calendarAppointmentsResponse = await axios.get(`${firebaseDB}/calendarAppointments/${calendarId}.json`);
    let calendarAppointments = calendarAppointmentsResponse.data;

    if (!calendarAppointments) {
      // 🔹 If `calendarId` does not exist, create a new object
      calendarAppointments = {
        calendarId,
        appointments: [
          {
            email: emailContact,
            startTime,
            appointmentId
          }
        ]
      };

      console.log(`Creating new calendar entry for ${calendarId}`);
    } else {
      // 🔹 If `calendarId` exists, update the `appointments` array
      calendarAppointments.appointments.push({
        email: emailContact,
        startTime,
        appointmentId
      });

      console.log(`Updating existing calendar entry for ${calendarId}`);
    }

    // ✅ Save the updated calendarAppointments collection
    await axios.put(`${firebaseDB}/calendarAppointments/${calendarId}.json`, calendarAppointments);

    const allAppointmentsResponse = await axios.get(`${firebaseURL}`);
    const allAppointments = allAppointmentsResponse.data;
    
    let latestAppointmentKey = null;
    for (let key in allAppointments) {
      if (allAppointments[key].email === emailContact && !allAppointments[key].startTime) {
        latestAppointmentKey = key;
      }
    }

    if (latestAppointmentKey) {
      // ✅ Update the found appointment with new `startTime` and `appointmentId`
      const updatedData = {
        ...allAppointments[latestAppointmentKey],
        startTime,
        appointmentId
      };

      await axios.put(`${firebaseDB}/appointments/${latestAppointmentKey}.json`, updatedData);
      console.log("Updated latest appointment:", updatedData);
    } else {
      console.log("No appointment found without startTime for this email.");
    }
//emails sent
    res.status(200).json({
      message: "Appointment processed successfully",
      data: newAppointmentData,
      calendarAppointments
    });

  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


const PORT = 5000;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  try {
        const url = await ngrok.connect(PORT);
        console.log(`Ngrok tunnel established at: ${url}`);
    } catch (error) {
        console.error('Error starting Ngrok:', error);
    }
});
