import React from 'react';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Card from "../components/Card";
import front from "../Images/front.png";
import { useCurriculum } from '../hooks/useCurriculum'; // Replaced static import
import "../pages/Home.css";

function Home() {
  // 1. DYNAMIC DATA FETCHING
  const { curriculum, loading, error } = useCurriculum();

  // State Guards for Synchronized UI
  if (loading) return (
    <div className="Home">
      <Navbar />
      <div className="loading-state" style={{ padding: "100px", textAlign: "center" }}>
        Loading Learning Paths...
      </div>
    </div>
  );

  if (error) return (
    <div className="Home">
      <Navbar />
      <div className="error-state" style={{ padding: "100px", textAlign: "center", color: "red" }}>
        Unable to sync curriculum. Please try again later.
      </div>
    </div>
  );

  const allCards = curriculum?.cards || [];

  return (
    <>
      <div className="Home">
        <Navbar />
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

        {/* need to separate landing page and learning paths */}

        <h2
          id="learning-paths"
          style={{
            textAlign: "center",
            color: "rgb(240, 82, 4)",
            fontSize: "2rem",
            marginBottom: "30px",
            fontWeight: "600",
            scrollMarginTop: "140px"
          }}>
          Explore Learning Paths
        </h2>

        <div className="cards-container">
          {/* Dynamically mapping from Backend Curriculum State */}
          {allCards.map((card, index) => (
            <Card
              key={index}
              heading={card.heading}
              links={card.links}
            />
          ))}
        </div>

        <Footer />
      </div>
    </>
  );
}

export default Home;