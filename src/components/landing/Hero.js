import React from 'react';
import { Link } from 'react-router-dom';
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
        <div style={{ marginTop: "20px" }}>
          <Link 
            to="/learning-paths" 
            style={{
              padding: "12px 30px",
              backgroundColor: "rgb(240, 82, 4)",
              color: "white",
              textDecoration: "none",
              borderRadius: "5px",
              fontSize: "1.1rem",
              fontWeight: "600",
              boxShadow: "0 4px 6px rgba(240, 82, 4, 0.2)",
              transition: "all 0.3s ease",
              display: "inline-block"
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Explore Learning Paths
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
