import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import CustomAlert from './CustomAlert';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "./Appointment.css";

const Appointment = ({ user, setUser }) => {
  const [visitPreference, setVisitPreference] = useState([]);
  const [selectedOption, setSelectedOption] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarUrl, setCalendarUrl] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: user?.email,
    mobile: "",
    address: "",
    query: "",
    carModel: "",
    carNumberPlate: "",
    mechanic: "",
    mechanicEmail: "",
    visitPreference: "",
    selectedServices: "",
    status: "pending",
    rating: "",
    calendarLink: "",
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false); // State to track authentication status
  const [mechanics, setMechanics] = useState([]);
  const [filteredMechanics, setFilteredMechanics] = useState([]);
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    onConfirm: () => { },
  })

  const mechanicsURL = "https://car-clinic-9cc74-default-rtdb.firebaseio.com/approvedMechanics.json";
  const firebaseURL = "https://car-clinic-9cc74-default-rtdb.firebaseio.com/appointments.json";
  const navigate = useNavigate(); // Using useNavigate

  const calendarURLs = {
    Mechanic: "<iframe src='https://link.urgentincome.com/widget/booking/XDjbvVQWbM1Eo3gCfAcv' style='width: 100%; height: 900px; border:none; overflow: hidden;' scrolling='no'></iframe>",
    Electrician: "<iframe src='https://link.urgentincome.com/widget/booking/a5dRvrcfrovYpv0Koxrb' style='width: 100%; height: 900px; border:none; overflow: hidden;' scrolling='no'></iframe>",
    Dentor: "<iframe src='https://link.urgentincome.com/widget/booking/caCbEhgV2vt8ZvH2dZVi' style='width: 100%; height: 900px; border:none; overflow: hidden;' scrolling='no'></iframe>",
    Painter: "<iframe src='https://link.urgentincome.com/widget/booking/VHnozNYb1gW3tG9f11CC' style='width: 100%; height: 900px; border:none; overflow: hidden;' scrolling='no'></iframe>",
  };

  useEffect(() => {
    const fetchMechanics = async () => {
      try {
        const response = await axios.get(mechanicsURL);
        if (response?.data) {
          console.log("Fetched mechanics data:", response.data);

          const approvedMechanics = Object.values(response?.data);

          // Calculate the average rating for each mechanic
          const mechanicsWithAverageRatings = approvedMechanics.map((mechanic) => {
            // const ratings = mechanic.ratings ? Object.values(mechanic.ratings.items) : [];
            const ratings = mechanic.ratings ? Object.values(mechanic.ratings.items || {}) : [];

            const averageRating = ratings.length
              ? ratings.reduce((sum, rating) => sum + (Number(rating.rating) || 0), 0) / ratings.length
              : 0;

            return {
              ...mechanic,
              averageRating: averageRating.toFixed(1), // Limit to 1 decimal place
            };
          });

          setMechanics(mechanicsWithAverageRatings);
        }
      } catch (error) {
        console.error("Error fetching mechanics:", error);
      }
    };


    fetchMechanics();
  }, []);

  useEffect(() => {
    if (formData.selectedServices) {
      console.log("mechanic",mechanics);
      
      const filtered = mechanics.filter(
        (mechanic) => mechanic.specialty === formData.selectedServices
      );
      setFilteredMechanics(filtered);
    } else {
      setFilteredMechanics([]); // Reset if no service is selected
    }
  }, [formData.selectedServices, mechanics]);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User Authenticated ,", user);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        navigate("/login"); // Redirect to login page if not authenticated
      }
    });
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If the selected field is 'mechanic', also update the calendar link
    if (name === "mechanic") {
      const selectedMechanic = mechanics.find((m) => m.name === value);
      console.log("Selected Mechanic:", selectedMechanic); // Debugging
      console.log("Calendar Link:", selectedMechanic?.calendarLink);
      setFormData({
        ...formData,
        [name]: value,
        calendarLink: selectedMechanic?.calendarLink || "", // Store mechanic's calendar link
        mechanicName: selectedMechanic?.name || "",
        mechanicEmail: selectedMechanic?.email || "",
        calendarId: selectedMechanic?.calendarId
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleCheckboxChange = (e, stateUpdater) => {
    const { value, checked } = e.target;
    stateUpdater((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
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

    const randomAID = Math.floor(100000 + Math.random() * 900000);

    const updatedFormData = {
      ...formData,
      aid: randomAID.toString(), // <-- Set aid here directly
      visitPreference: visitPreference.join(", "),
      mechanicEmail: formData.mechanicEmail,
    };

    try {
      await axios.post(firebaseURL, updatedFormData, {
        headers: { "Content-Type": "application/json" },
      });

      if (visitPreference.includes("I Will Visit") && formData.calendarLink) {
        setCalendarUrl(formData.calendarLink); // Show selected mechanic's calendar
        setShowCalendar(true);
      } else if (visitPreference.includes("Visit Me")) {
        showAlert(
          "Your appointment request has been submitted. Our team will contact you shortly!"
        );
        // window.location.reload();
        setShowCalendar(false);
      }

      setFormData({
        name: "",
        email: user?.email,
        mobile: "",
        address: "",
        query: "",
        carModel: "",
        carNumberPlate: "",
        mechanic: "",
        visitPreference: "",
        selectedServices: "",
        mechanicEmail: "",
        status: "pending",
        rating: null,
        calendarLink: "",
      });
      setVisitPreference([]);

    } catch (error) {
      console.error("Error adding appointment:", error);
    }
  };


  if (!isAuthenticated) {
    return <div>Please log in to access the appointment page.</div>; // Show message if not authenticated
  }

  return (
    <>
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
              placeholder={user.email}
              value={formData.email}
              required
              disabled
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

          <div className="labels">
            <label>Car Model:</label>
            <input
              type="text"
              name="carModel"
              value={formData.carModel}
              onChange={handleChange}
              placeholder="e.g Honda Civic"
              required
            />
          </div>

          <div className="labels">
            <label>Car Number Plate:</label>
            <input
              type="text"
              name="carNumberPlate"
              value={formData.carNumberPlate}
              onChange={handleChange}
              placeholder="e.g RIX9278"
              required
            />
          </div>

          <div className="labels">
            <label>Select a Service</label>
            <select
              id="selectedServices"
              name="selectedServices"
              value={formData.selectedServices}
              onChange={handleChange}
              required
            >
              <option value="">Select a Service</option>
              <option value="Mechanic">Mechanic</option>
              <option value="Electrician">Electrician</option>
              <option value="Dentor">Dentor</option>
              <option value="Painter">Painter</option>
            </select>
          </div>

          {/* Select Mechanic (Disabled if No Service is Selected) */}
          <div className="labels">
            <label>Select Mechanic:</label>
            <select
              id="mechanic"
              name="mechanic"
              value={formData.mechanic}
              onChange={handleChange}
              required
              disabled={!formData.selectedServices || filteredMechanics.length === 0}
            >
              <option value="">Select a mechanic</option>
              {filteredMechanics.map((mechanic, index) => (
                <option key={index} value={mechanic.name}>
                  {mechanic.name} - Rating: {mechanic.averageRating || "No rating yet"}/5.0
                </option>
              ))}
            </select>
          </div>

          <div className="choices">
            <div>
              <label>Visit Preference:</label></div>
            <div className="options">
              <div>
                <input
                  type="checkbox"
                  value="Visit Me"
                  onChange={(e) => handleCheckboxChange(e, setVisitPreference)}
                />
                <span>Visit Me</span></div>
              <div>
                <input
                  type="checkbox"
                  value="I Will Visit"
                  onChange={(e) => handleCheckboxChange(e, setVisitPreference)}
                />
                <span>I Will Visit</span>
              </div>
            </div>
          </div>
          {/* <div>
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
        </div> */}

          <div>
            <button type="submit">Submit</button>
          </div>
        </form>

        {showCalendar && (
          <div>
            <h3>Book Your Appointment</h3>
            <h4><b>Note:</b>Your Email must be same as above otherwise your appointment will not book!</h4>
            <iframe
              src={calendarUrl}
              style={{ width: "100%", height: "900px", border: "none", overflow: "hidden" }}
            ></iframe>
          </div>
        )}
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
    </>
  );
};

export default Appointment;
