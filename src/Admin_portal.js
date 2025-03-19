import React, { useEffect, useState } from 'react';
import './AdminPortal.css'; // Ensure CSS file is correctly imported
import axios from 'axios';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, remove, set } from 'firebase/database';
import { auth } from './firebase';


const AdminPortal = () => {
  const database = getDatabase();
  // State to handle active table view
  const [activeTable, setActiveTable] = useState('user'); // Default table view is 'user'
  const [queriesData, setQueriesData] = useState([]);
  const [ratingsData, setRatingsData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [mechanicsData, setMechanicsData] = useState([]);

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

  const fetchMechanicsData = async () => {
    try {
      const response = await axios.get(mechanicsFirebaseURL);
      const mechanicsArray = response.data ? Object.entries(response.data).map(([id, value]) => ({ id, ...value })) : [];
      setMechanicsData(mechanicsArray);
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


  const handleApprove = async (mechanic) => {
    try {
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
        address: mechanic.address,
      });
  
      // Remove from 'mechanics' collection after approval
      await remove(ref(database, `mechanics/${mechanic.id}`));
  
      alert(`Mechanic ${mechanic.name} approved and moved to 'approvedMechanics' collection!`);
      fetchMechanicsData(); // Refresh UI
    } catch (error) {
      console.error('Error approving mechanic:', error);
      alert(`Failed to approve mechanic: ${error.message}`);
    }
  };
  
  const handleReject = async (mechanicId) => {
    try {
      await remove(ref(database, `mechanics/${mechanicId}`));
      alert('Mechanic request rejected and removed.');
      fetchMechanicsData(); // Refresh mechanic list
    } catch (error) {
      console.error('Error rejecting mechanic:', error);
      alert('Failed to reject mechanic.');
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
                <th>Phone Number</th>
              </tr>
            </thead>
            {/* <tbody>
              {users.map((user, index) => (
                <tr key={index}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                </tr>
              ))}
            </tbody> */}
            <tbody>
              {usersData.map((user, index) => (
                <tr key={index}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
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
                <th>Field</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mechanicsData.map((mechanic, index) => (
                <tr key={index}>
                  <td>{mechanic.name}</td>
                  <td>{mechanic.email}</td>
                  <td>{mechanic.specialty}</td>
                  <td>{mechanic.address}</td>
                  <td>
                    <button className="approve-btn" onClick={() => handleApprove(mechanic)}>Approve</button>
                    <button className="reject-btn" onClick={() => handleReject(mechanic.id)}>Reject</button>
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
    </div>
  );
};

export default AdminPortal;
