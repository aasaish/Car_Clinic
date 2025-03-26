import React, { useEffect, useState } from 'react';
import './AdminPortal.css'; // Ensure CSS file is correctly imported
import axios from 'axios';
import emailjs from '@emailjs/browser';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, remove, set } from 'firebase/database';
import CustomAlert from './CustomAlert';
import { auth } from './firebase';


const AdminPortal = () => {
  const database = getDatabase();
  // State to handle active table view
  const [activeTable, setActiveTable] = useState('user'); // Default table view is 'user'
  const [queriesData, setQueriesData] = useState([]);
  const [ratingsData, setRatingsData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [mechanicsData, setMechanicsData] = useState([]);
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    onConfirm: () => { },
  });


  const queriesFirebaseURL = 'https://car-clinic-9cc74-default-rtdb.firebaseio.com/contact_us.json';
  const ratingsFirebaseURL = 'https://car-clinic-9cc74-default-rtdb.firebaseio.com/ratings.json';
  const mechanicsFirebaseURL = 'https://car-clinic-9cc74-default-rtdb.firebaseio.com/mechanics.json';

  // Fetch users from backend
  const fetchUsersData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/getUsers"); // Backend API
      setUsersData(response.data);
      
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const approvedMechanicsFirebaseURL = 'https://car-clinic-9cc74-default-rtdb.firebaseio.com/approvedMechanics.json';

  const fetchMechanicsData = async () => {
    try {
      // Fetch pending mechanics
      const mechanicsResponse = await axios.get(mechanicsFirebaseURL);
      const mechanicsArray = mechanicsResponse.data
        ? Object.entries(mechanicsResponse.data).map(([id, value]) => ({
          id,
          ...value,
          status: 'pending', // Mark them as pending
        }))
        : [];

      // Fetch approved mechanics
      const approvedResponse = await axios.get(approvedMechanicsFirebaseURL);
      const approvedArray = approvedResponse.data
        ? Object.entries(approvedResponse.data).map(([id, value]) => ({
          id,
          ...value,
          status: 'approved', // Mark them as approved
        }))
        : [];

      // Merge both arrays
      setMechanicsData([...mechanicsArray, ...approvedArray]);
    } catch (error) {
      console.error('Error fetching mechanics:', error);
    }
  };


  // Fetch Queries Data from Firebase
  const fetchQueriesData = async () => {
    try {
      const response = await axios.get(queriesFirebaseURL);
      const itemsArray = Object.values(response?.data || {});
      setQueriesData(itemsArray);
    } catch (error) {
      console.error('Error fetching queries:', error);
    }
  };

  // Fetch Ratings Data from Firebase
  const fetchRatingsData = async () => {
    try {
      const response = await axios.get(ratingsFirebaseURL);
      const ratingsArray = Object.values(response?.data || {});
      setRatingsData(ratingsArray);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  useEffect(() => {
    fetchUsersData();
    fetchQueriesData();
    fetchRatingsData();
    fetchMechanicsData();
  }, []);

  const showAlert = (message, onConfirm) => {
    setAlert({ show: true, message, onConfirm });
  };

  // Function to close alert
  const closeAlert = () => {
    setAlert({ show: false, message: '', onConfirm: () => { } });
  };

  const sendApprovalEmail = async (mechanic) => {
    const templateParams = {
      to_email: mechanic.email,
      mechanic_name: mechanic.name,
      message: `Dear ${mechanic.name}, your request has been approved. You can now log in to our system Car Clinic as a mechanic.`,
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

  const handleRemoveUser = async (uid) => {
    try {
      await axios.delete(`http://localhost:5000/deleteUser/${uid}`);
      showAlert("User removed successfully.");
      fetchUsersData(); // Refresh user list
    } catch (error) {
      console.error("Error removing user:", error);
      showAlert("Failed to remove user.");
    }
  };


  const handleApprove = async (mechanic) => {
    try {
      // Save admin's email before approving the mechanic
      const adminEmail = auth.currentUser.email;
      const adminPassword = "12345678"; // Hardcoded admin password (not recommended for production)

      // Create mechanic account (this logs out the admin)
      const userCredential = await createUserWithEmailAndPassword(auth, mechanic.email, mechanic.password);
      const user = userCredential.user;

      // Store mechanic in 'approvedMechanics' collection
      await set(ref(database, `approvedMechanics/${user.uid}`), {
        uid: user.uid,
        name: mechanic.name,
        email: mechanic.email,
        phone: mechanic.phone,
        role: 'mechanic',
        status: 'approved',
        specialty: mechanic.specialty,
        experience: mechanic.experience,
        date: "",
        ratings: "",
        appointments: "",
        calendarLink : mechanic.calendarLink,
        address: mechanic.address,
        calendarId: mechanic.calendarId
      });

      // Remove from 'mechanics' collection after approval
      await remove(ref(database, `mechanics/${mechanic.id}`));

      showAlert(`Mechanic ${mechanic.name} request is approved!!!`);
      await sendApprovalEmail(mechanic);

      // Reauthenticate the admin automatically
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);

      fetchMechanicsData(); // Refresh UI
    } catch (error) {
      console.error("Error approving mechanic:", error);
      showAlert(`Failed to approve mechanic: ${error.message}`);
    }
  };


  const handleReject = async (mechanicId) => {
    try {
      await remove(ref(database, `mechanics/${mechanicId}`));
      showAlert('Mechanic request rejected and removed.');
      fetchMechanicsData(); // Refresh mechanic list
    } catch (error) {
      console.error('Error rejecting mechanic:', error);
      showAlert('Failed to reject mechanic.');
    }
  };

  const handleRemove = async (id) => {
    try {
      await axios.delete(`https://car-clinic-9cc74-default-rtdb.firebaseio.com/approvedMechanics/${id}.json`);
      showAlert('Mechanic is removed.');
      fetchMechanicsData(); // Refresh data
    } catch (error) {
      console.error('Error removing mechanic:', error);
    }
  };



  return (
    <div className="admin-portal">
      <div className="sidebar">
        <button onClick={() => setActiveTable('user')}>Users</button>
        <button onClick={() => setActiveTable('mechanic')}>Mechanics</button>
        <button onClick={() => setActiveTable('queries')}>Queries</button>
        <button onClick={() => setActiveTable('ratings')}>Ratings</button>
      </div>

      <div className="table-container">
        {activeTable === 'user' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                {/* <th>Phone Number</th> */}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersData.map((user, index) => (
                <tr key={index}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  {/* <td>{user.phone}</td> */}
                  <td>
                    <button className="reject-btn" onClick={() => handleRemoveUser(user.uid)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTable === 'mechanic' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Experience</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mechanicsData.map((mechanic, index) => (
                <tr key={index}>
                  <td>{mechanic.name}</td>
                  <td>{mechanic.email}</td>
                  <td>{mechanic.experience}</td>
                  <td>{mechanic.address}</td>
                  <td>
                    {mechanic.status === 'pending' ? (
                      <>
                        <button className="approve-btn" onClick={() => handleApprove(mechanic)}>Approve</button>
                        <button className="reject-btn" onClick={() => handleReject(mechanic.id)}>Reject</button>
                      </>
                    ) : (
                      <button className="reject-btn" onClick={() => handleRemove(mechanic.id)}>Remove</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTable === 'queries' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone Number</th>
                <th>Email</th>
                <th>Query</th>
              </tr>
            </thead>
            <tbody>
              {queriesData.map((query, index) => (
                <tr key={index}>
                  <td>{query?.name}</td>
                  <td>{query?.phone}</td>
                  <td>{query?.email}</td>
                  <td>{query?.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTable === 'ratings' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mechanic Name</th>
                <th>Rating</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {ratingsData.map((rating, index) => (
                <tr key={index}>
                  <td>{rating?.mechanicName}</td>
                  <td>{rating?.rating}</td>
                  <td>{rating?.comments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
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
  );
};

export default AdminPortal;
