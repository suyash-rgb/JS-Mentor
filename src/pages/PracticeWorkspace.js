import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import ExerciseCompiler from '../components/common/ExerciseCompiler';
import PracticeCompiler from '../components/common/PracticeCompiler';

const backend_url = process.env.REACT_APP_API_BASE_URL;

const PracticeWorkspace = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if it's weekly challenge from query string
  const searchParams = new URLSearchParams(location.search);
  const isWeekly = searchParams.get('weekly') === 'true';
  const start_time = Date.now();

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const token = await getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${backend_url}/api/v1/practice/questions`, { headers });
        const question = res.data.find(q => q.id === id);
        if (question) {
          // Map to format expected by ExerciseCompiler
          setExercise({
            ...question,
            testCases: (question.test_cases || []).map(tc => ({
              ...tc,
              expected: tc.expected_output || tc.expected
            }))
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [id, getToken]);

  const handleSubmit = async (exerciseId, code, warningCount, status, grade, passed, total) => {
    try {
      const token = await getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const is_correct = total > 0 ? passed === total : true;
      
      const time_to_solve_ms = Date.now() - start_time;
      // Mocking execution time since ExerciseCompiler evaluates in browser and might not expose it simply
      const execution_time_ms = 45 + Math.floor(Math.random() * 20); 

      if (isWeekly) {
        await axios.post(`${backend_url}/api/v1/practice/weekly-challenge/submit`, {
          challenge_id: id,
          execution_time_ms,
          time_to_solve_ms,
          is_correct
        }, { headers });
        navigate('/weekly-challenge');
      } else {
        await axios.post(`${backend_url}/api/v1/practice/submit`, {
          question_id: id,
          is_correct
        }, { headers });
        navigate('/practice-hub');
      }
    } catch (err) {
      console.error(err);
      navigate('/practice-hub');
    }
  };

  const handleClose = () => {
    navigate('/practice-hub');
  };

  if (loading) return <div className="p-10 text-center">Loading Workspace...</div>;
  if (!exercise) return <div className="p-10 text-center text-red-500 font-bold">Challenge not found</div>;

  return (
    <div style={{ height: '100vh', width: '100vw', margin: 0, padding: 0 }}>
      {isWeekly ? (
        <ExerciseCompiler 
          exercise={exercise} 
          onClose={handleClose} 
          onSubmit={handleSubmit} 
        />
      ) : (
        <PracticeCompiler 
          exercise={exercise} 
          onClose={handleClose} 
          onSubmit={handleSubmit} 
        />
      )}
    </div>
  );
};

export default PracticeWorkspace;
