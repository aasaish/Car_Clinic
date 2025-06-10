import React, { useEffect, useState } from 'react';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { auth } from './firebase';
import './AdminPortal.css'; // Ensure CSS file is correctly imported
import axios from 'axios';
import emailjs from '@emailjs/browser';
import { getDatabase, ref, remove, get, update } from 'firebase/database';
import CustomAlert from './CustomAlert';
import ConfirmAlert from './ConfirmAlert';
import NameModal from "./CustomInputText";
import PasswordModal from "./CustomInputPassword";

const AdminPortal = ({ user, setUser }) => {
  const database = getDatabase();
  // State to handle active table view
  const [activeTable, setActiveTable] = useState('user'); // Default table view is 'user'
  const [queriesData, setQueriesData] = useState([]);
  const [ratingsData, setRatingsData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [disabledUsers, setDisabledUsers] = useState([]);
  const [mechanicsData, setMechanicsData] = useState([]);
  const [disableMechanicsData, setDisableMechanicsData] = useState([]);
  const [mechanicsRequestData, setMechanicsRequestData] = useState([]);
  const [selectedMechanic, setSelectedMechanic] = useState(null);
  const [selectedMechanicID, setSelectedMechanicID] = useState("");
  const [showApproveField, setShowApproveField] = useState(false);
  const [showDeclineBox, setShowDeclineBox] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showAdminConfirmation, setShowAdminConfirmation] = useState(false);
  const [showMechanicEnable, setShowMechanicEnable] = useState(false);
  const [showMechanicDelete, setShowMechanicDelete] = useState(false);
  const [showAdminEnableConfirmation, setShowAdminEnableConfirmation] = useState(false);
  const [showAdminDeleteConfirmation, setShowAdminDeleteConfirmation] = useState(false);
  const [showConfirmationBox, setShowConfirmationBox] = useState(false);
  const [showRejectionBox, setShowRejectionBox] = useState(false);
  const [newUsername, setnewUsername] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
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

  const fetchDisabledUsers = async () => {
    try {
      const response = await axios.get("https://car-clinic-backend.onrender.com/getDisabledUsers");
      setDisabledUsers(response.data); // Assuming you have a state like `const [disabledUsers, setDisabledUsers] = useState([])`
    } catch (error) {
      console.error("Error fetching disabled users:", error);
    }
  };


  const approvedMechanicsFirebaseURL = 'https://car-clinic-9cc74-default-rtdb.firebaseio.com/approvedMechanics.json';
  const disableMechanicsFirebaseURL = 'https://car-clinic-9cc74-default-rtdb.firebaseio.com/disabledMechanics.json';
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
      console.log(mechanicsData);
      

    } catch (error) {
      console.error('Error fetching mechanics:', error);
    }
  };


  // Fetch Queries Data from Firebase
  const fetchDisableMechanicData = async () => {
    try {
      const response = await axios.get(disableMechanicsFirebaseURL);
      const itemsArray = Object.values(response?.data || {});
      setDisableMechanicsData(itemsArray);
    } catch (error) {
      console.error('Error fetching queries:', error);
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
    fetchDisabledUsers();
    fetchDisableMechanicData();
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
    setSetterId(uid)
  };

  const handleAdminConfirm = async () => {
    try {
      await axios.post(`https://car-clinic-backend.onrender.com/disableUser/${setterId}`);
      showAlert("User disabled successfully.");
      fetchUsersData(); // Refresh user list
      fetchDisabledUsers();
      const Message = `Dear ${selectedMechanic.name}, your account has been disabled by the Car Clinic admin. Please contact support for more details.`;
      await sendApprovalEmail(selectedMechanic.email, Message);
      setSetterId("");
      setSelectedMechanic(null);
      setShowAdminConfirmation(false);
    } catch (error) {
      console.error("Error disabling user:", error);
      showAlert("Failed to disable user.");
    }
  };

  const handleAdminCancel = () => {
    setShowAdminConfirmation(false);
  };

  const handleEnableUser = async (user, uid) => {
    setShowAdminEnableConfirmation(true);
    setSelectedMechanic(user);
    setSetterId(uid)
  };

  const handleAdminEnableConfirm = async () => {
    try {
      await axios.post(`https://car-clinic-backend.onrender.com/enableUser/${setterId}`);
      showAlert("User enabled successfully.");
      fetchUsersData(); // Refresh user list
      fetchDisabledUsers();
      const Message = `Dear ${selectedMechanic.name}, your account has been enabled by the Car Clinic admin.`;
      await sendApprovalEmail(selectedMechanic.email, Message);
      setSetterId("");
      setSelectedMechanic(null);
      setShowAdminEnableConfirmation(false);
    } catch (error) {
      console.error("Error enabling user:", error);
      showAlert("Failed to enable user.");
    }
  };

  const handleAdminEnableCancel = () => {
    setShowAdminEnableConfirmation(false);
  };

  const handleDeleteUser = async (user, uid) => {
    setShowAdminDeleteConfirmation(true);
    setSelectedMechanic(user);
    setSetterId(uid)
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`https://car-clinic-backend.onrender.com/deleteUser/${setterId}`);
      showAlert("User removed successfully.");
      fetchUsersData();
      fetchDisabledUsers(); // Refresh user list
      const Message = `Dear ${selectedMechanic.name}, unfortunately you have been removed by the admin of Car Clinic. We are sorry for the inconveninence.`
      await sendApprovalEmail(selectedMechanic.email, Message);
      setSetterId("")
      setSelectedMechanic(null);
      setShowAdminDeleteConfirmation(false);
    } catch (error) {
      console.error("Error removing user:", error);
      showAlert("Failed to remove user.");
    }
  };

  const handleDeleteCancel = () => {
    setShowAdminDeleteConfirmation(false);
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
      // 1. Fetch the mechanic data first
      const response = await axios.get(`https://car-clinic-9cc74-default-rtdb.firebaseio.com/approvedMechanics/${setterId}.json`);
      const mechanicData = response.data;

      if (!mechanicData) {
        showAlert('Mechanic data not found.');
        return;
      }

      // 2. Save it to `disabledMechanics`
      await axios.put(`https://car-clinic-9cc74-default-rtdb.firebaseio.com/disabledMechanics/${setterId}.json`, mechanicData);

      // 3. Delete from `approvedMechanics`
      await axios.delete(`https://car-clinic-9cc74-default-rtdb.firebaseio.com/approvedMechanics/${setterId}.json`);

      showAlert('Mechanic has been disabled and removed.');
      const Message = `Dear ${selectedMechanic.name}, unfortunately you have been disabled by the admin of Car Clinic. Please contact support for more details.`
      await sendApprovalEmail(selectedMechanic.email, Message);
      fetchMechanicsData(); // Refresh list
      fetchDisableMechanicData();
      fetchUsersData();
      handleDeleteConfirm();
      setSelectedMechanic("");
      setShowConfirmation(false);
    } catch (error) {
      console.error('Error disabling mechanic:', error);
      showAlert('Failed to disable mechanic.');
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  const handleEnable = (mechanic, id) => {
    setShowMechanicEnable(true);
    setSelectedMechanic(mechanic);
    setSetterId(id)
  };

  const handleEnableMechanic = async () => {
    try {
      const response = await fetch("https://car-clinic-backend.onrender.com/enableMechanic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(selectedMechanic)
      });

      const data = await response.json();

      if (response.ok) {
        showAlert(`Mechanic ${selectedMechanic?.name} is enabled!!!`);
        await axios.delete(`https://car-clinic-9cc74-default-rtdb.firebaseio.com/disabledMechanics/${setterId}.json`);
        const Message = `Dear ${selectedMechanic.name}, your have been enabled again. You can now log in to our system Car Clinic as a mechanic.`
        await sendApprovalEmail(selectedMechanic.email, Message);
        fetchDisableMechanicData(); // Refresh UI
        fetchMechanicsData();
        fetchUsersData();
        setSelectedMechanic(null);
        setSetterId("");
      } else {
        showAlert(`Failed to enable mechanic: ${data.error}`);
      }
      setShowMechanicEnable(false);
    } catch (error) {
      console.error("Error in enabling mechanic:", error);
      showAlert(`Failed to enable mechanic: ${error.message}`);
    }
  };

  const handleEnableMechanicCancel = () => {
    setShowMechanicEnable(false);
  };

  const handleDelete = async (mechanic, id) => {
    setShowMechanicDelete(true);
    setSelectedMechanic(mechanic);
    setSetterId(id)
  };

  const handleDeleteMechanic = async () => {
    try {
      await axios.delete(`https://car-clinic-9cc74-default-rtdb.firebaseio.com/disabledMechanics/${setterId}.json`);
      showAlert('Mechanic is deleted permanently.');
      fetchDisableMechanicData(); // Refresh data
      setSelectedMechanic("");
      setSetterId("");
      setShowMechanicDelete(false);
      const Message = `Dear ${selectedMechanic.name}, unfortunately you have been removed permanently by the admin of Car Clinic. We are sorry for the inconveninence.`
      await sendApprovalEmail(selectedMechanic.email, Message); 
    } catch (error) {
      console.error('Error deleting mechanic:', error);
    }
  };

  const handleDeleteMechanicCancel = () => {
    setShowMechanicDelete(false);
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
        <div className="sidebar">
          <button onClick={() => setActiveTable('user')}>Users</button>
          <button onClick={() => setActiveTable('disableUser')}>Disabled Users</button>
          <button onClick={() => setActiveTable('mechanic')}>Mechanics</button>
          <button onClick={() => setActiveTable('disableMechanic')}>Disabled Mechanics</button>
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersData.length > 0 ? (
                  usersData.map((user, index) => (
                    <tr key={index}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <button className="reject-btn" onClick={() => handleRemoveUser(user, user.uid)}>Disable</button>
                      </td>
                    </tr>
                  ))) : (
                  <tr>
                    <td colSpan="3">Users are loading!!!</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTable === 'disableUser' && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {disabledUsers.length > 0 ? (
                  disabledUsers.map((user, index) => (
                    <tr key={index}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <button className="approve-btn" onClick={() => handleEnableUser(user, user.uid)}>Enable</button>
                        <button className="reject-btn" onClick={() => handleDeleteUser(user, user.uid)} style={{ marginLeft: "10px" }}>Remove</button>
                      </td>
                    </tr>
                  ))) : (
                  <tr>
                    <td colSpan="3">No User is disabled yet.</td>
                  </tr>
                )}
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
                  {mechanicsData.length > 0 ? (
                    mechanicsData.map((mechanic, index) => (
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
                              <button className="reject-btn" onClick={() => handleReject(mechanic, mechanic.id)}>Reject</button>
                            </>
                          ) : (
                            <button className="reject-btn" onClick={() => handleRemove(mechanic, mechanic.id)}>Disable</button>
                          )}
                        </td>
                      </tr>
                    ))) : (
                    <tr>
                      <td colSpan="8">No Mechanic is registered yet.</td>
                    </tr>
                  )}
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

          {activeTable === 'disableMechanic' && (
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
                {disableMechanicsData.length > 0 ? (
                  disableMechanicsData.map((mechanic, index) => (
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
                        <button className="approve-btn" onClick={() => handleEnable(mechanic, mechanic.uid)}>Enable</button>
                        <button className="reject-btn" onClick={() => handleDelete(mechanic, mechanic.uid)}>Delete</button>
                      </td>
                    </tr>
                  ))) : (
                  <tr>
                    <td colSpan="8">No Mechanic is disabled yet.</td>
                  </tr>
                )}
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
            message={"Are you sure to Disable this user?"}
            onConfirm={handleAdminConfirm}
            onCancel={handleAdminCancel}
          />
        )}
        {showAdminEnableConfirmation && (
          <ConfirmAlert
            message={"Are you sure to Enable this user?"}
            onConfirm={handleAdminEnableConfirm}
            onCancel={handleAdminEnableCancel}
          />
        )}
        {showAdminDeleteConfirmation && (
          <ConfirmAlert
            message={"Are you sure to Remove this user permanently?"}
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
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
            message={"Are you sure to Disable this mechanic?"}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        )}
        {showMechanicEnable && (
          <ConfirmAlert
            message={"Are you sure to Enable this mechanic?"}
            onConfirm={handleEnableMechanic}
            onCancel={handleEnableMechanicCancel}
          />
        )}
        {showMechanicDelete && (
          <ConfirmAlert
            message={"Are you sure to Delete this mechanic permanently?"}
            onConfirm={handleDeleteMechanic}
            onCancel={handleDeleteMechanicCancel}
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
      </div>
    </>
  );
};

export default AdminPortal;
