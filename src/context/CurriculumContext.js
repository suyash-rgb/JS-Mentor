import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const CurriculumContext = createContext();

export const CurriculumProvider = ({ children }) => {
  const [curriculum, setCurriculum] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        const res = await axios.get('http://localhost:8000/trainer/curriculum');
        setCurriculum(res.data);
      } catch (err) {
        console.error("Critical: Could not load curriculum", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCurriculum();
  }, []);

  return (
    <CurriculumContext.Provider value={{ curriculum, loading }}>
      {children}
    </CurriculumContext.Provider>
  );
};

export const useCurriculum = () => useContext(CurriculumContext);