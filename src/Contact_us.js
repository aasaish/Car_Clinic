// src/ContactUs.js
import React, { useState } from "react";
import './ContactUs.css';  // Ensure the CSS is correctly imported
import CustomAlert from './CustomAlert';
import axios from "axios";
import emailjs from '@emailjs/browser';


const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    complaint:"",
    message: "",
  });
  const [showConfirmation, setShowConfirmation] = useState(false);

  const firebaseURL = "https://car-clinic-9cc74-default-rtdb.firebaseio.com/contact_us.json";

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

  const handleChange = async (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(firebaseURL, formData, {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error adding item:", error);
    }
    const adminMessage = `Dear Admin of Car Clinic, you have got a new complaint from one of the customer. Please go to your Admin Portal and proceed accordingly.`
    const adminEmail = "aasaish@growthguild.us"
    await sendApprovalEmail(adminEmail, adminMessage);
    setFormData({ name: "", email: "", phone: "", complaint: "", message: "" });
    setShowConfirmation(true);
  };

  const handleAlert = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="contact-us-container">
      <h1>Contact Us</h1>
      <form onSubmit={handleSubmit} className="contact-form">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone:</label>
          <input
            type="number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="complaint">Complaint:</label>
          <input
            name="complaint"
            value={formData.complaint}
            onChange={handleChange}
            required
          ></input>
        </div>
        <div className="form-group">
          <label htmlFor="message">Message:</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <button type="submit" className="submit-btn">Submit</button> {/* Apply styling here */}
      </form>
      {showConfirmation && (
        <CustomAlert
          message="Form Submitted!"
          onConfirm={handleAlert}
          onCancel={handleAlert}
          buttonLabel={"OK"}
        />
      )}
    </div>
  );
};

export default ContactUs;
