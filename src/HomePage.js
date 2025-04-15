// src/HomePage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css'; // Import the custom CSS file for styling
import axios from 'axios';


const Home = () => {
  const navigate = useNavigate();
  const [topWorkers, setTopWorkers] = useState({});
  

  // Handle button click to navigate to the Appointment page
  const handleBookAppointment = () => {
    navigate('/Appointment');
  };

  useEffect(() => {
    const fetchTopMechanics = async () => {
      try {
        const response = await axios.get("https://car-clinic-9cc74-default-rtdb.firebaseio.com/approvedMechanics.json");

        if (response?.data) {
          const mechanicsArray = Object.values(response.data);

          // Calculate average rating and group by specialty
          const groupedBySpeciality = {};

          mechanicsArray.forEach((mechanic) => {
            const ratings = mechanic.ratings ? Object.values(mechanic.ratings.items || {}) : [];
            const avgRating = ratings.length
              ? ratings.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / ratings.length
              : 0;

            const updatedMechanic = {
              ...mechanic,
              averageRating: parseFloat(avgRating.toFixed(1))
            };

            if (!groupedBySpeciality[mechanic.specialty]) {
              groupedBySpeciality[mechanic.specialty] = [];
            }

            groupedBySpeciality[mechanic.specialty].push(updatedMechanic);
          });

          // Sort and pick top 2 for each specialty
          const topTwoPerSpeciality = {};
          Object.keys(groupedBySpeciality).forEach((specialty) => {
            const sorted = groupedBySpeciality[specialty].sort(
              (a, b) => b.averageRating - a.averageRating
            );
            topTwoPerSpeciality[specialty] = sorted.slice(0, 2);
          });

          setTopWorkers(topTwoPerSpeciality);
        }
      } catch (error) {
        console.error("Error fetching top mechanics:", error);
      }
    };

    fetchTopMechanics();
  }, []);


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
        <h1>Best Achievements of the Month</h1>
        <div className="cards">
          {["Mechanic", "Electrician", "Dentor", "Painter"].map((specialty) => (
            <div className="testimonial" key={specialty}>
              <h2>{specialty}</h2>
              {topWorkers[specialty]?.map((worker, index) => (
                <div key={index}>
                  <h3>Ranked # {index + 1}</h3>
                  <h4>Name: {worker.name}</h4>
                  <h4>Rating: {worker.averageRating}/5.0</h4>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;