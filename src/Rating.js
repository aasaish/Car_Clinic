import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CustomAlert from './CustomAlert';
import './Rating.css';

const Rating = () => {
  const [formData, setFormData] = useState({
    mechanicName: '',
    rating: '',
    comments: '',
  });

  const [alert, setAlert] = useState({
    show: false,
    message: '',
    onConfirm: () => { },
  });

  const [mechanics, setMechanics] = useState([]); // Store approved mechanics

  // Firebase database URLs
  const mechanicsURL = "https://car-clinic-9cc74-default-rtdb.firebaseio.com/approvedMechanics.json";
  const firebaseURL = "https://car-clinic-9cc74-default-rtdb.firebaseio.com/ratings.json";

  useEffect(() => {
    const fetchMechanics = async () => {
      try {
        const response = await axios.get(mechanicsURL);
        if (response.data) {
          const approvedMechanics = Object.values(response.data);
          setMechanics(approvedMechanics);
        }
      } catch (error) {
        console.error("Error fetching mechanics:", error);
      }
    };
    fetchMechanics();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const showAlert = (message, onConfirm) => {
    setAlert({ show: true, message, onConfirm });
  };

  // Function to close alert
  const closeAlert = () => {
    setAlert({ show: false, message: '', onConfirm: () => { } });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.mechanicName || !formData.rating) {
      showAlert("Please fill in all required fields.");
      return;
    }

    try {
      await axios.post(firebaseURL, formData, {
        headers: { 'Content-Type': 'application/json' },
      });

      showAlert("Your rating has been submitted successfully!");

      // Reset the form
      setFormData({
        mechanicName: '',
        rating: '',
        comments: '',
      });

    } catch (error) {
      console.error("Error submitting rating:", error);
      showAlert("Failed to submit rating. Please try again.");
    }
  };

  return (
    <div className="rating-page">
      <h2>Rate Your Mechanic</h2>
      <form className="rating-form" onSubmit={handleSubmit}>
        <label htmlFor="mechanicName">Mechanic Name:</label>
        <select
          id="mechanicName"
          name="mechanicName"
          value={formData.mechanicName}
          onChange={handleChange}
          required
        >
          <option value="">Select a mechanic</option>
          {mechanics.map((mechanic, index) => (
            <option key={index} value={mechanic.name}>
              {mechanic.name}
            </option>
          ))}
        </select>

        <label htmlFor="rating">Rating (1-5):</label>
        <select
          id="rating"
          name="rating"
          value={formData.rating}
          onChange={handleChange}
          required
        >
          <option value="">Select rating</option>
          <option value="1">1 - Poor</option>
          <option value="2">2 - Fair</option>
          <option value="3">3 - Good</option>
          <option value="4">4 - Very Good</option>
          <option value="5">5 - Excellent</option>
        </select>

        <label htmlFor="comments">Comments:</label>
        <textarea
          id="comments"
          name="comments"
          value={formData.comments}
          onChange={handleChange}
          placeholder="Write your feedback here"
        ></textarea>

        <button type="submit">Submit Rating</button>
      </form>
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

export default Rating;
