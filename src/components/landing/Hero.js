import React from 'react';
import front from "../../Images/front.png";

const Hero = () => {
  return (
    <div className="hero-section">
      <img src={front} alt="JavaScript concepts" className="image" />
      <div style={{ padding: "40px 20px", textAlign: "center", maxWidth: "1200px", margin: "0 auto" }}>
        <h1 className="heading">Javascript Programming Examples, Exercises and Solutions for Beginners</h1>
        <p style={{ 
          fontSize: "1.1rem", 
          color: "#666", 
          lineHeight: "1.8", 
          marginBottom: "40px",
          maxWidth: "800px",
          margin: "0 auto 40px"
        }}>
          Welcome to JS Mentor! Master JavaScript through hands-on learning. Explore comprehensive tutorials, practical exercises, and real-world examples designed to help you become a confident JavaScript developer. Start your coding journey today.
        </p>
      </div>
    </div>
  );
};

export default Hero;
