import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CustomAlert from './CustomAlert';
import './Rating.css';
import { useParams } from 'react-router-dom';
import { ref, push, update, get } from "firebase/database";
import { database } from './firebase';

const Rating = ({ user, setUser }) => {

  const { email } = useParams();
  const { aid } = useParams();

  const [formData, setFormData] = useState({
    userEmail: user?.email,
    mechanicName: '',
    rating: '',
    comments: '',
  });

  const [alert, setAlert] = useState({
    show: false,
    message: '',
    onConfirm: () => { },
  });

  const [mechanic, setMechanic] = useState(null);

  // Firebase database URLs
  const mechanicsURL = "https://car-clinic-9cc74-default-rtdb.firebaseio.com/approvedMechanics.json";
  // const firebaseURL = "https://car-clinic-9cc74-default-rtdb.firebaseio.com/ratings.json";

  useEffect(() => {
    const fetchMechanic = async () => {
      try {
        const response = await axios.get(mechanicsURL);
        if (response.data) {
          const mechanicsArray = Object.values(response.data);
          const foundMechanic = mechanicsArray.find(mech => mech.email === email);
          if (foundMechanic) {
            setMechanic(foundMechanic);
            setFormData(prevData => ({ ...prevData, mechanicName: foundMechanic.name }));
          }
        }
      } catch (error) {
        console.error("Error fetching mechanic:", error);
      }
    };

    fetchMechanic();
  }, [email]);


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


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.mechanicName || !formData.rating) {
      showAlert("Please fill in all required fields.");
      return;
    }

    try {
      const newRating = {
        userEmail: user?.email,
        mechanicName: formData.mechanicName,
        rating: Number(formData.rating),
        comments: formData.comments || '',
        timestamp: new Date().toISOString()
      };

      // 1. Submit to ratings collection
      const ratingsRef = ref(database, 'ratings');
      await push(ratingsRef, newRating);

      // 2. Add to approvedMechanics/[uid]/ratings/items[]
      const mechanicsSnap = await get(ref(database, 'approvedMechanics'));
      if (mechanicsSnap.exists()) {
        const mechanicsData = mechanicsSnap.val();
        const mechanicEntry = Object.entries(mechanicsData).find(
          ([, value]) => value.email === email
        );

        if (mechanicEntry) {
          const [mechanicUid, mechanicData] = mechanicEntry;
          const ratingsPath = `approvedMechanics/${mechanicUid}/ratings/items`;
          const countPath = `approvedMechanics/${mechanicUid}/ratings/count`;

          // Add new rating item
          await push(ref(database, ratingsPath), newRating);

          // Update count
          const currentCount = mechanicData?.ratings?.count || 0;
          await update(ref(database), {
            [countPath]: currentCount + 1
          });
        }
      }

      // 3. Update rating in appointment (by aid param)
      const appointmentsRef = ref(database, 'appointments');
      const appointmentsSnap = await get(appointmentsRef);

      if (appointmentsSnap.exists()) {
        const appointmentsData = appointmentsSnap.val();

        // Find the correct appointment by `aid`
        const appointmentNode = Object.entries(appointmentsData).find(
          ([key, value]) => value.aid === aid
        );

        if (appointmentNode) {
          const [appointmentKey] = appointmentNode;

          // Now update the `rating` for the specific appointment
          const appointmentRatingPath = `appointments/${appointmentKey}`;
          await update(ref(database, appointmentRatingPath), {
            rating: Number(formData.rating)
          });

          // Alert + reset form
          showAlert("Your rating has been submitted successfully!");
          setFormData({
            mechanicName: mechanic?.name,
            rating: '',
            comments: ''
          });
        }else {
            console.error("Appointment not found for given aid.");
            showAlert("Appointment not found.");
          }
        }
    

        } catch (error) {
          console.error("Error submitting rating:", error);
          showAlert("Failed to submit rating. Please try again.");
        }
      };

      if (!user) return <p>Loading user info...</p>;


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
              disabled
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
