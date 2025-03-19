import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "./Appointment.css";

const Appointment = () => {
  const [visitPreference, setVisitPreference] = useState([]);
  const [selectedOption, setSelectedOption] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarUrl, setCalendarUrl] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
    query: "",
    visitPreference: "",
    selectedServices: [],
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false); // State to track authentication status

  const firebaseURL = "https://car-clinic-9cc74-default-rtdb.firebaseio.com/appointments.json";
  const navigate = useNavigate(); // Using useNavigate

  const calendarURLs = {
    Mechanic: "<iframe src='https://link.urgentincome.com/widget/booking/XDjbvVQWbM1Eo3gCfAcv' style='width: 100%; height: 900px; border:none; overflow: hidden;' scrolling='no'></iframe>",
    Electrician: "<iframe src='https://link.urgentincome.com/widget/booking/a5dRvrcfrovYpv0Koxrb' style='width: 100%; height: 900px; border:none; overflow: hidden;' scrolling='no'></iframe>",
    Dentor: "<iframe src='https://link.urgentincome.com/widget/booking/caCbEhgV2vt8ZvH2dZVi' style='width: 100%; height: 900px; border:none; overflow: hidden;' scrolling='no'></iframe>",
    Painter: "<iframe src='https://link.urgentincome.com/widget/booking/VHnozNYb1gW3tG9f11CC' style='width: 100%; height: 900px; border:none; overflow: hidden;' scrolling='no'></iframe>",
  };

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        navigate("/login"); // Redirect to login page if not authenticated
      }
    });
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckboxChange = (e, stateUpdater) => {
    const { value, checked } = e.target;
    stateUpdater((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedFormData = {
      ...formData,
      visitPreference: visitPreference.join(", "),
      selectedServices: selectedOption.join(", "),
    };

    try {
      await axios.post(firebaseURL, updatedFormData, {
        headers: { "Content-Type": "application/json" },
      });

      if (visitPreference.includes("I Will Visit") && selectedOption.length > 0) {
        const selectedCalendarIframe = selectedOption
          .map((option) => calendarURLs[option])
          .filter(Boolean)
          .join("");

        if (selectedCalendarIframe) {
          setShowCalendar(true);
          setCalendarUrl(selectedCalendarIframe);
        } else {
          alert("No valid calendar URL found for the selected services.");
        }
      } else if (visitPreference.includes("Visit Me") && selectedOption.length > 0) {
        alert("Your appointment request has been submitted. Our team will contact you shortly!");
        setShowCalendar(false);
      }

      setFormData({
        name: "",
        email: "",
        mobile: "",
        address: "",
        query: "",
        visitPreference: "",
        selectedServices: [],
      });
      setVisitPreference([]);
      setSelectedOption([]);
    } catch (error) {
      console.error("Error adding appointment:", error);
    }
  };

  if (!isAuthenticated) {
    return <div>Please log in to access the appointment page.</div>; // Show message if not authenticated
  }

  return (
    <div className="appointment-page">
      <h1>Book Your Appointment</h1>
      <form onSubmit={handleSubmit} className="appointment-form">
        <div className="labels">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="labels">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>


        <div className="labels">
          <label>Mobile Number:</label>
          <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            required
          />
        </div>

        <div className="labels">
          <label>Address:</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <div className="labels">
          <label>Query:</label>
          <textarea
            name="query"
            value={formData.query}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <div>
          <label>Visit Preference:</label>
          <div>
            <input
              type="checkbox"
              value="Visit Me"
              onChange={(e) => handleCheckboxChange(e, setVisitPreference)}
            />
            <span>Visit Me</span>

            <input
              type="checkbox"
              value="I Will Visit"
              onChange={(e) => handleCheckboxChange(e, setVisitPreference)}
            />
            <span>I Will Visit</span>
          </div>
        </div>

        <div>
          <label>Select an Option:</label>
          <div>
            {Object.keys(calendarURLs).map((option) => (
              <div key={option}>
                <input
                  type="checkbox"
                  value={option}
                  onChange={(e) => handleCheckboxChange(e, setSelectedOption)}
                />
                <span>{option}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <button type="submit">Submit</button>
        </div>
      </form>

      {showCalendar && (
        <div className="calendar-container">
          <div
            className="calendar"
            dangerouslySetInnerHTML={{
              __html: calendarUrl,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Appointment;
