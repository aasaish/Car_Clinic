import React, { useState } from 'react';
import axios from 'axios';
import './Rating.css';

const Rating = () => {
  const [formData, setFormData] = useState({
    mechanicName: '',
    rating: '',
    comments: '',
  });

  // Firebase database URL
  const firebaseURL = "https://car-clinic-9cc74-default-rtdb.firebaseio.com/ratings.json";

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.mechanicName || !formData.rating) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      await axios.post(firebaseURL, formData, {
        headers: { 'Content-Type': 'application/json' },
      });

      alert("Your rating has been submitted successfully!");

      // Reset the form
      setFormData({
        mechanicName: '',
        rating: '',
        comments: '',
      });

    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Failed to submit rating. Please try again.");
    }
  };

  return (
    <div className="rating-page">
      <h2>Rate Your Mechanic</h2>
      <form className="rating-form" onSubmit={handleSubmit}>
        <label htmlFor="mechanicName">Mechanic Name:</label>
        <input
          type="text"
          id="mechanicName"
          name="mechanicName"
          value={formData.mechanicName}
          onChange={handleChange}
          placeholder="Enter mechanic's name"
          required
        />

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
    </div>
  );
};

export default Rating;
