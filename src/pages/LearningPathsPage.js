import React from 'react';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LearningPathsCatalog from "../components/landing/LearningPathsCatalog";

const LearningPathsPage = () => {
  return (
    <div className="learning-paths-page">
      <Navbar />
      <div style={{ padding: "60px 0" }}>
        <LearningPathsCatalog />
      </div>
      <Footer />
    </div>
  );
};

export default LearningPathsPage;
