import React from 'react';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Hero from "../components/landing/Hero";
import LearningPathsCatalog from "../components/landing/LearningPathsCatalog";
import "../pages/Home.css";

function Home() {
  return (
    <div className="Home">
      <Navbar />
      
      <main>
        {/* Landing Page Content */}
        <Hero />
        
        <hr style={{ border: "none", height: "1px", background: "linear-gradient(to right, transparent, #eee, transparent)", margin: "40px 0" }} />

        {/* Learning Paths Catalog */}
        <LearningPathsCatalog />
      </main>

      <Footer />
    </div>
  );
}

export default Home;