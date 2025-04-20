import React, { useEffect, useState } from 'react';
import './AdminPortal.css'; // Ensure CSS file is correctly imported
import axios from 'axios';
import emailjs from '@emailjs/browser';
import { getDatabase, ref, remove, get, update } from 'firebase/database';
import CustomAlert from './CustomAlert';
import ConfirmAlert from './ConfirmAlert';

const AdminPortal = () => {
  const database = getDatabase();
  // State to handle active table view
  const [activeTable, setActiveTable] = useState('user'); // Default table view is 'user'
  const [queriesData, setQueriesData] = useState([]);
  const [ratingsData, setRatingsData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [mechanicsData, setMechanicsData] = useState([]);
  const [mechanicsRequestData, setMechanicsRequestData] = useState([]);
  const [selectedMechanic, setSelectedMechanic] = useState(null);
  const [selectedMechanicID, setSelectedMechanicID] = useState("");
  const [showApproveField, setShowApproveField] = useState(false);
  const [showDeclineBox, setShowDeclineBox] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showAdminConfirmation, setShowAdminConfirmation] = useState(false);
  const [showConfirmationBox, setShowConfirmationBox] = useState(false);
  const [showRejectionBox, setShowRejectionBox] = useState(false);
  const [setterId, setSetterId] = useState("");
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
      const response = await axios.get("https://car-clinic-backend.onrender.com/getUsers"); // Backend API
      setUsersData(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const approvedMechanicsFirebaseURL = 'https://car-clinic-9cc74-default-rtdb.firebaseio.com/approvedMechanics.json';
  const MechanicsRequestFirebaseURL = 'https://car-clinic-9cc74-default-rtdb.firebaseio.com/mechanicRequests.json';


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

  const fetchMechanicRequestsData = async () => {
    try {
      const response = await axios.get(MechanicsRequestFirebaseURL);
      const requestArray = Object.values(response?.data || {});
      setMechanicsRequestData(requestArray);
    } catch (error) {
      console.error('Error fetching mechanic requests:', error);
    }
  };

  useEffect(() => {
    fetchUsersData();
    fetchQueriesData();
    fetchRatingsData();
    fetchMechanicsData();
    fetchMechanicRequestsData();
  }, []);

  const showAlert = (message, onConfirm) => {
    setAlert({ show: true, message, onConfirm });
  };

  // Function to close alert
  const closeAlert = () => {
    setAlert({ show: false, message: '', onConfirm: () => { } });
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

  const handleRemoveUser = async (user, uid) => {
    setShowAdminConfirmation(true);
    setSelectedMechanic(user);
    console.log(selectedMechanic);

    setSetterId(uid)
  };

  const handleAdminConfirm = async () => {
    try {
      await axios.delete(`https://car-clinic-backend.onrender.com/deleteUser/${setterId}`);
      showAlert("User removed successfully.");
      fetchUsersData(); // Refresh user list
      const Message = `Dear ${selectedMechanic.name}, unfortunately you have been removed by the admin of Car Clinic. We are sorry for the inconveninence.`
      await sendApprovalEmail(selectedMechanic.email, Message);
      setSetterId("")
      setSelectedMechanic(null);
      setShowAdminConfirmation(false);
    } catch (error) {
      console.error("Error removing user:", error);
      showAlert("Failed to remove user.");
    }
  };

  const handleAdminCancel = () => {
    setShowAdminConfirmation(false);
  };


  const handleApprove = (mechanic) => {
    setShowConfirmationBox(true);
    setSelectedMechanic(mechanic);
  };

  const handleConfirmationBox = async () => {
    try {
      const response = await fetch("https://car-clinic-backend.onrender.com/approveMechanic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(selectedMechanic)
      });

      const data = await response.json();

      if (response.ok) {
        showAlert(`Mechanic ${selectedMechanic?.name} request is approved!!!`);
        const Message = `Dear ${selectedMechanic.name}, your request has been approved. You can now log in to our system Car Clinic as a mechanic.`
        await sendApprovalEmail(selectedMechanic.email, Message);
        fetchMechanicsData(); // Refresh UI
        setSelectedMechanic(null);
      } else {
        showAlert(`Failed to approve mechanic: ${data.error}`);
      }
      setShowConfirmationBox(false);
    } catch (error) {
      console.error("Error approving mechanic:", error);
      showAlert(`Failed to approve mechanic: ${error.message}`);
    }
  };

  const handleConfirmationBoxCancel = () => {
    setShowConfirmationBox(false);
  };

  const handleReject = (mechanic, mechanicId) => {
    setShowRejectionBox(true);
    setSelectedMechanicID(mechanicId)
    setSelectedMechanic(mechanic);
  };

  const handleRejectionBox = async () => {
    try {
      await remove(ref(database, `mechanics/${selectedMechanicID}`));
      showAlert('Mechanic request rejected and removed.');
      fetchMechanicsData(); // Refresh mechanic list
      const Message = `Dear ${selectedMechanic.name}, your request has for mechanic sign up is rejected by the admin of Car Clinic. We are sorry for the inconveninence.`
      await sendApprovalEmail(selectedMechanic.email, Message);
      setSelectedMechanicID("")
      setSelectedMechanic(null)
      setShowRejectionBox(false);
    } catch (error) {
      console.error('Error rejecting mechanic:', error);
      showAlert('Failed to reject mechanic.');
    }
  };

  const handleRejectionBoxCancel = () => {
    setShowRejectionBox(false);
  };

  const approveFieldRequest = (mechanic) => {
    setShowApproveField(true);
    setSelectedMechanic(mechanic);
  };

  const handleApproveField = async () => {
    const { uid, newSpecialty } = selectedMechanic;
    setShowApproveField(false);

    try {
      const approvedRef = ref(database, `approvedMechanics/${uid}`);
      const snapshot = await get(approvedRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const currentSpecialties = data.specialties || [data.specialty];

        if (!currentSpecialties.includes(newSpecialty)) {
          currentSpecialties.push(newSpecialty);

          await update(approvedRef, { specialties: currentSpecialties });
        }

        // Clean up the request
        await remove(ref(database, `mechanicRequests/${uid}`));
        showAlert("Mechanic specialty updated and request approved!");
        fetchMechanicRequestsData();
        const Message = `Dear ${selectedMechanic.name}, your request has been approved for adding a new field. You can now have a new speciality like ${newSpecialty} in your Bio data.`
        await sendApprovalEmail(selectedMechanic.email, Message);
      }
    } catch (err) {
      console.error("Approval error:", err);
      showAlert("Failed to approve the field request.");
    }
  };

  const handleApproveFieldCancel = () => {
    setShowApproveField(false);
  };

  const handleRejectRequest = (mechanic) => {
    setShowDeclineBox(true);
    setSelectedMechanic(mechanic);
  };

  const handleDeclineBox = async () => {
    const { uid } = selectedMechanic;
    setShowDeclineBox(false);
    try {
      await remove(ref(database, `mechanicRequests/${uid}`));
      showAlert('Mechanic request rejected!');
      const Message = `Dear ${selectedMechanic.name}, your request has for adding a new field is rejected by the admin of Car Clinic. We are sorry for the inconveninence.`
      await sendApprovalEmail(selectedMechanic.email, Message);
      fetchMechanicRequestsData();
      setSelectedMechanic(null);
    } catch (error) {
      console.error('Error rejecting mechanic:', error);
      showAlert('Failed to reject mechanic request.');
    }
  };

  const handleDeclineBoxCancel = () => {
    setShowDeclineBox(false);
  };

  const handleRemove = async (mechanic, id) => {
    setShowConfirmation(true);
    setSelectedMechanic(mechanic);
    setSetterId(id)
  };

  const handleConfirm = async () => {
    try {
      await axios.delete(`https://car-clinic-9cc74-default-rtdb.firebaseio.com/approvedMechanics/${setterId}.json`);
      showAlert('Mechanic is removed.');
      fetchMechanicsData(); // Refresh data
      handleAdminConfirm();
      setSelectedMechanic("");
      setShowConfirmation(false);
    } catch (error) {
      console.error('Error removing mechanic:', error);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
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
                    <button className="reject-btn" onClick={() => handleRemoveUser(user, user.uid)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}


        {activeTable === 'mechanic' && (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Experience</th>
                  <th>Field</th>
                  <th>Sign Up Fee</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mechanicsData.map((mechanic, index) => (
                  <tr key={index}>
                    <td>{mechanic.name}</td>
                    <td>{mechanic.email}</td>
                    <td>{mechanic.phone}</td>
                    <td>{mechanic.experience}</td>
                    <td>{Array.isArray(mechanic.specialties) ? mechanic.specialties.join(', ') : mechanic.specialties}</td>
                    <td>
                      <a href={mechanic.paymentProof} target="_blank" rel="noopener noreferrer">
                        <button className="approve-btn">View</button>
                      </a>
                    </td>
                    <td>{mechanic.address}</td>
                    <td>
                      {mechanic.status === 'pending' ? (
                        <>
                          <button className="approve-btn" onClick={() => handleApprove(mechanic)}>Approve</button>
                          <button className="reject-btn" onClick={() => handleReject(mechanic, mechanic.id)}>Remove</button>
                        </>
                      ) : (
                        <button className="reject-btn" onClick={() => handleRemove(mechanic, mechanic.id)}>Remove</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <br />
            <br />
            {mechanicsRequestData && mechanicsRequestData.length > 0 && (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mechanic Name</th>
                    <th>Email</th>
                    <th>Current Field</th>
                    <th>New Field</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mechanicsRequestData.map((mechanic, index) => (
                    <tr key={index}>
                      <td>{mechanic.name}</td>
                      <td>{mechanic.email}</td>
                      <td>{Array.isArray(mechanic.specialties) ? mechanic.specialties.join(', ') : mechanic.specialties}</td>
                      <td>{mechanic.newSpecialty}</td>
                      <td>
                        <button className="approve-btn" onClick={() => approveFieldRequest(mechanic)}>Accept</button>
                        <button className="reject-btn" onClick={() => handleRejectRequest(mechanic)} style={{ marginLeft: "10px" }}>Decline</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {activeTable === 'queries' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone Number</th>
                <th>Email</th>
                <th>Complaint</th>
                <th>Query</th>
              </tr>
            </thead>
            <tbody>
              {queriesData.map((query, index) => (
                <tr key={index}>
                  <td>{query?.name}</td>
                  <td>{query?.phone}</td>
                  <td>{query?.email}</td>
                  <td>{query?.complaint}</td>
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
      {showAdminConfirmation && (
        <ConfirmAlert
          message={"Are you sure to Remove this user?"}
          onConfirm={handleAdminConfirm}
          onCancel={handleAdminCancel}
        />
      )}
      {showApproveField && (
        <ConfirmAlert
          message={"Are you sure to Accept this mechanic request for adding new field?"}
          onConfirm={handleApproveField}
          onCancel={handleApproveFieldCancel}
        />
      )}
      {showDeclineBox && (
        <ConfirmAlert
          message={"Are you sure to Reject this mechanic request for adding new field?"}
          onConfirm={handleDeclineBox}
          onCancel={handleDeclineBoxCancel}
        />
      )}
      {showConfirmationBox && (
        <ConfirmAlert
          message={"Are you sure to Accept this mechanic request?"}
          onConfirm={handleConfirmationBox}
          onCancel={handleConfirmationBoxCancel}
        />
      )}
      {showRejectionBox && (
        <ConfirmAlert
          message={"Are you sure to Reject this mechanic request?"}
          onConfirm={handleRejectionBox}
          onCancel={handleRejectionBoxCancel}
        />
      )}
      {showConfirmation && (
        <ConfirmAlert
          message={"Are you sure to Remove this mechanic?"}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default AdminPortal;
