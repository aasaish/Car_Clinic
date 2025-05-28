import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import CustomAlert from './CustomAlert';
import emailjs from '@emailjs/browser';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "./Appointment.css";

const Appointment = ({ user, setUser }) => {
  // const [visitPreference, setVisitPreference] = useState([]);
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
    charges: "",
    rating: "",
    calendarLink: "",
  });
  const [afterFormData, setAfterFormData] = useState({
    carModel: "",
    carNumberPlate: "",
    selectedServices: "",
    mechanic: "",
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

      const filtered = mechanics.filter(
        (mechanic) =>
          Array.isArray(mechanic.specialties)
            ? mechanic.specialties.includes(formData.selectedServices)
            : mechanic.specialties === formData.selectedServices
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

  const handleRadioClick = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      visitPreference: prevData.visitPreference === value ? "" : value,
    }));
  };

  const sendApprovalEmail = async (email, messageBody) => {
    const templateParams = {
      to_email: email,
      message: messageBody,
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

  const showAlert = (message, onConfirm) => {
    setAlert({ show: true, message, onConfirm });
  };

  // Function to close alert
  const closeAlert = () => {
    setAlert({ show: false, message: '', onConfirm: () => { } });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile") {
    // Allow only numbers, max 11 characters
    if (/^\d{0,11}$/.test(value)) {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
    return; // Exit early for mobile field
  }

    // If the selected field is 'mechanic', also update the calendar link
    if (name === "mechanic") {
      const selectedMechanic = mechanics.find((m) => m.name === value);
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


  const handleSubmit = async (e) => {
    e.preventDefault();

    const randomAID = Math.floor(100000 + Math.random() * 900000);

    const updatedFormData = {
      ...formData,
      aid: randomAID.toString(), // <-- Set aid here directly
      mechanicEmail: formData.mechanicEmail,
    };

    try {
      await axios.post(firebaseURL, updatedFormData, {
        headers: { "Content-Type": "application/json" },
      });



      if (formData.visitPreference === "I Will Visit" && formData.calendarLink) {
        setCalendarUrl(formData.calendarLink); // Show selected mechanic's calendar
        setShowCalendar(true);
      } else if (formData.visitPreference === "Visit Me") {
        showAlert(
          "Your appointment request has been submitted. Our team will contact you shortly!"
        );
        // window.location.reload();
        const userMessage = `Dear ${formData.name},, your appointment request has been submitted. Our team will contact you shortly! Stay tuned with us!!!`
        const mechanicMessage = `Dear ${formData.mechanic}, you have a new appointment request. Our customer ${formData.name} is waiting for your response. Please log into your account at Car Clinic and check new request in mechanic portal. Thank you!!!`
        await sendApprovalEmail(formData.email, userMessage);
        await sendApprovalEmail(formData.mechanicEmail, mechanicMessage);
        setShowCalendar(false);
      }

      setAfterFormData({
        carModel: formData.carModel,
        carNumberPlate: formData.carNumberPlate,
        selectedServices: formData.selectedServices,
        mechanic: formData.mechanic
      })

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
        charges: "",
        rating: "",
        calendarLink: "",
      });

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
              inputMode="numeric"
              pattern="\d{11}"
              maxLength="11"
              minLength="11"
              title="Phone number must be exactly 11 digits"
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
                  {mechanic.name} - Rating: {mechanic.averageRating || "No rating yet"}/5.0 - Address: {mechanic.address}
                </option>
              ))}
            </select>
          </div>

          <div className="choices">
            <div>
              <label>Visit Preference:</label></div>
            <div className="options">
              <div>
                <input type="radio" value="Visit Me"
                  checked={formData.visitPreference === 'Visit Me'}
                  onChange={() => handleRadioClick('Visit Me')} />
                <span>Visit Me</span>
              </div>
              <div>
                <input type="radio" value="I Will Visit"
                  checked={formData.visitPreference === 'I Will Visit'}
                  onChange={() => handleRadioClick('I Will Visit')} />
                <span>I Will Visit</span>
              </div>
            </div>
          </div>
          <div>
            <button type="submit">Submit</button>
          </div>
        </form>

        {showCalendar && (
          <div>
            <h3>Book Your Appointment</h3>
            <h4><b>Note:</b>Your Email must be same as above otherwise your appointment will not book!</h4>

            <h5>You are booking appointment for car whose model is {afterFormData.carModel} and the car number plate is {afterFormData.carNumberPlate}</h5>
            <b />
            <h5>And this appointment booking request is for {afterFormData.selectedServices} and {afterFormData.mechanic} will provide you services!!!</h5>
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
