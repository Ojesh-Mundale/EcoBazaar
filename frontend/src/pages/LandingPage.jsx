import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-content">
        <img src="/ecobazaar_logo.png" alt="EcoBazaar Logo" className="s" />
        <h1>Welcome to EcoBazaarX</h1>
        <p class="description"><b>Your one-stop shop for eco-friendly products</b></p>
        <div className="features">
          <div className="feature">
            <h3>Sustainable Products</h3>
            <p>Discover a wide range of eco-friendly items that help reduce your carbon footprint.</p>
          </div>
          <div className="feature">
            <h3>Quality Assurance</h3>
            <p>All our products are sourced from trusted suppliers and meet high environmental standards.</p>
          </div>
          <div className="feature">
            <h3>Community Driven</h3>
            <p>Join a community of like-minded individuals committed to a greener future.</p>
          </div>
        </div>
        <div className="button-group">
          <button className="btn login-btn" onClick={() => navigate('/auth?mode=login')}>
            Login
          </button>
          <button className="btn signup-btn" onClick={() => navigate('/auth?mode=signup')}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
