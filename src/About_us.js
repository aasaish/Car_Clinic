import React from 'react';
import './Aboutus.css';
import Reviews from "./Reviews.js"

const About_us = () => {
  return (
    <div className='why'>
      <div>
        <h1>Why Car Clinic?</h1>
        <p>
          At Car Clinic, we’re not just about fixing cars – we’re about building trust, delivering quality, and ensuring your vehicle performs at its best. Most of all, we provide AI assistance to rectify your car problem immediately. Here’s why we’re the top choice for car repairs and maintenance:
        </p>
        <p>- Expert Technicians: Our team consists of highly trained professionals with years of experience in diagnosing and repairing all types of vehicles.</p>
        <p>- Advanced Technology: We provide AI assistant features to offer precise and efficient repair explanations for your vehicle issues.</p>
        <p>- Customer-Centric Approach: Your satisfaction is our priority. We tailor our services to your schedule, budget, and expectations.</p>
        <p>- Comprehensive Solutions: From regular maintenance to complex repairs, we’re your one-stop shop for all automotive needs.</p>
      </div>

      <div>
        <h1>Core Values</h1>
        <p>The core value of Car Clinic is to bring enlightenment to Pakistan’s auto repair industry.</p>
      </div>

      <div>
        <h1>We Offer</h1>
        <p>- Car Clinic offers certified auto repair services for end users and institutes.</p>
        <p>- Nearby available auto workshops and professionals as per their technical grading for end users.</p>
        <p>- Virtual AI assistance to automatically rectify your vehicle issues.</p>
        <p>- Awareness campaigns for Auto Repairing for Auto Workshops, Professionals, and End Users.</p>
      </div>
    <Reviews/>
    </div>
  );
};

export default About_us;
