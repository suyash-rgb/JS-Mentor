import React from 'react';
import Card from "../Card";
import { useCurriculum } from '../../hooks/useCurriculum';
import { useProgress } from '../../hooks/useProgress';

const LearningPathsCatalog = () => {
  const { curriculum, loading, error } = useCurriculum();
  const { computeHeadingProgress } = useProgress();

  if (loading) return (
    <div className="loading-state" style={{ padding: "100px", textAlign: "center" }}>
      Loading Learning Paths...
    </div>
  );

  if (error) return (
    <div className="error-state" style={{ padding: "100px", textAlign: "center", color: "red" }}>
      Unable to sync curriculum. Please try again later.
    </div>
  );

  const allCards = curriculum?.cards || [];

  const isFirstTwoCompleted = 
    allCards.length >= 2 &&
    computeHeadingProgress(allCards[0]?.heading) === 100 && 
    computeHeadingProgress(allCards[1]?.heading) === 100;

  return (
    <section className="learning-paths-section">
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
        {allCards.map((card, index) => (
          <Card
            key={index}
            heading={card.heading}
            links={card.links}
            isLocked={index >= 2 && !isFirstTwoCompleted}
          />  
        ))}
      </div>
    </section>
  );
};

export default LearningPathsCatalog;
