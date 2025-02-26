// src/HomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css'; // Import the custom CSS file for styling

const Home = () => {
  const navigate = useNavigate();

  // Handle button click to navigate to the Appointment page
  const handleBookAppointment = () => {
    navigate('/Appointment');
  };

  return (
    <div className="home-page">
      <div className="content">
        <div className="intro">
          <h1>Repair Services</h1>
          <h2>We offer the best repair services</h2>
          <button onClick={handleBookAppointment}>Book Appointment</button>
        </div>

        <div className="service-image-container">
          <img src="/2.png" alt="Repair Service" className="service-image" />
        </div>
      </div>

      <div className="abc">
        <div>
          <h1>Auto Repair Technical Assistance</h1>
          
        </div>
      </div>

      <div className="testimonials">
        <h1>Testimonials</h1>
        <h2>What our clients say about us</h2>
        <div className='testimonial'>
        <div>

<h1>John</h1>
<p>
  I would like to commend you and your team on the exceptional service
  that you provide, and I can confidently say that Car Clinic is a workshop
  that I would recommend to anyone looking for reliable and trustworthy
  car diagnostic services. Thank you for your hard work and dedication.
</p>
</div>
<div>
<h1>Patric</h1>
<p>
  I would like to commend you and your team on the exceptional service
  that you provide, and I can confidently say that Car Clinic is a workshop
  that I would recommend to anyone looking for reliable and trustworthy
  car diagnostic services. Thank you for your hard work and dedication.
</p>
</div>
<div>
<h1>Essa</h1>
<p>
  I would like to commend you and your team on the exceptional service
  that you provide, and I can confidently say that Car Clinic is a workshop
  that I would recommend to anyone looking for reliable and trustworthy
  car diagnostic services. Thank you for your hard work and dedication.
</p>
</div>
        </div>
        
      </div>
    </div>
  );
};

export default Home;
