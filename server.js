const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

// Initialize Firebase Admin with service account
const serviceAccount = require("./serviceAccountKey.json"); // Download from Firebase Console
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(cors());

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

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
