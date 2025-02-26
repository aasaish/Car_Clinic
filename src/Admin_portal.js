import React, { useEffect, useState } from 'react';
import './AdminPortal.css'; // Ensure CSS file is correctly imported
import axios from 'axios';

const AdminPortal = () => {
  // State to handle active table view
  const [activeTable, setActiveTable] = useState('user'); // Default table view is 'user'
  const [queriesData, setQueriesData] = useState([]);
  const [ratingsData, setRatingsData] = useState([]);

  const queriesFirebaseURL = 'https://car-clinic-9cc74-default-rtdb.firebaseio.com/contact_us.json';
  const ratingsFirebaseURL = 'https://car-clinic-9cc74-default-rtdb.firebaseio.com/ratings.json';

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
    fetchQueriesData();
    fetchRatingsData();
  }, []);

  // Sample data for User and Mechanic tables
  const users = [
    { name: 'John Doe', email: 'john@example.com', phone: '123-456-7890' },
    { name: 'Jane Smith', email: 'jane@example.com', phone: '987-654-3210' },
  ];

  const mechanics = [
    { name: 'Mark Lee', experience: '5 years', field: 'Engine Repair', address: '1234 Main St' },
    { name: 'Lucy Brown', experience: '3 years', field: 'Bodywork', address: '5678 Elm St' },
  ];

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
            <tbody>
              {users.map((user, index) => (
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
                <th>Experience</th>
                <th>Field</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mechanics.map((mechanic, index) => (
                <tr key={index}>
                  <td>{mechanic.name}</td>
                  <td>{mechanic.experience}</td>
                  <td>{mechanic.field}</td>
                  <td>{mechanic.address}</td>
                  <td>
                    <button className="approve-btn">Approve</button>
                    <button className="reject-btn">Reject</button>
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
