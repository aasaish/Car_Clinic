// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
// import { getDatabase } from "firebase/database";  


// Replace the below config object with your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfp9KLxlXXN2dQOHAo61MqHy7Pe6EtblY",
  authDomain: "car-clinic-9cc74.firebaseapp.com",
  projectId: "car-clinic-9cc74",
  storageBucket: "car-clinic-9cc74.firebasestorage.app",
  messagingSenderId: "5786665754",
  appId: "1:5786665754:web:8c2a34c11867543da222a3",
    measurementId: "G-3HMJDYQ00Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
export const db = getFirestore(app);
export const auth = getAuth(app);
export const database = getDatabase(app);
