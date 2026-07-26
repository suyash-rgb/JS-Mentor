import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const backend_url = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const PracticeQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState({ solved_question_ids: [] });
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        // Fetch all questions for the practice hub list page
        const qRes = await axios.get(`${backend_url}/api/v1/practice/questions`, { headers });
        setQuestions(qRes.data || []);
        
        if (token) {
          try {
            const sRes = await axios.get(`${backend_url}/api/v1/practice/stats`, { headers });
            setStats(sRes.data || { solved_question_ids: [] });
          } catch (sErr) {
            console.warn("Could not fetch user solved stats:", sErr);
          }
        }
      } catch (err) {
        console.error("Error fetching practice data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [getToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-xl font-medium text-slate-500">Loading questions...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Navbar />
      
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">All Practice Questions</h1>
              <p className="mt-2 text-lg text-slate-600">
                Sharpen your skills with {questions.length} JS-Mentor challenges.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link to="/practice-hub" className="text-amber-600 font-semibold hover:text-amber-700 transition-colors bg-amber-50 px-4 py-2 rounded-lg no-underline">
                &larr; Back to Practice Hub
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-12">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {questions.map((q) => {
                    const isSolved = stats.solved_question_ids && stats.solved_question_ids.includes(q.id);
                    return (
                      <tr key={q.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-5 whitespace-nowrap">
                          {isSolved ? (
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          ) : (
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-400">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" strokeWidth="2" strokeDasharray="4 4" />
                              </svg>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <Link to={`/practice-workspace/${q.id}`} className="text-lg font-bold text-slate-800 hover:text-amber-600 transition-colors no-underline">
                            {q.title}
                          </Link>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                            q.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800' :
                            q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {q.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                          <Link 
                            to={`/practice-workspace/${q.id}`}
                            className={`inline-block px-4 py-2 rounded-lg font-bold transition-all no-underline ${
                              isSolved 
                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                : 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm hover:shadow'
                            }`}
                          >
                            {isSolved ? 'Review Code' : 'Solve'}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PracticeQuestions;
