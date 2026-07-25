import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const backend_url = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const PracticeHub = () => {
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState({ practice_problems_solved: 0, solved_question_ids: [] });
  const [weeklyChallenge, setWeeklyChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [qRes, wRes] = await Promise.all([
          axios.get(`${backend_url}/api/v1/practice/questions`, { headers }),
          axios.get(`${backend_url}/api/v1/practice/weekly-challenge`, { headers })
        ]);

        setQuestions(qRes.data);
        if (wRes.data.active) {
          setWeeklyChallenge(wRes.data);
        }

        if (token) {
          const sRes = await axios.get(`${backend_url}/api/v1/practice/stats`, { headers });
          setStats(sRes.data);
        }
      } catch (error) {
        console.error("Error fetching practice data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getToken]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Navbar />
      <div className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col md:flex-row items-center justify-between">
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Practice Hub</h1>
            <p className="text-lg text-slate-600">
              Master JavaScript by solving real-world coding challenges. 
              Compete in weekly challenges to climb the global leaderboard and sharpen your problem-solving skills!
            </p>
          </div>
          <div className="mt-6 md:mt-0 bg-amber-50 rounded-xl p-6 border border-amber-100 text-center min-w-[200px]">
            <p className="text-sm font-medium text-amber-800 uppercase tracking-wide">Problems Solved</p>
            <p className="text-5xl font-black text-amber-600 mt-2">{stats.practice_problems_solved}</p>
          </div>
        </div>

        {questions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Left Sidebar: 10 Practice Questions */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full max-h-[800px]">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-lg font-bold text-slate-800">Up Next</h2>
                </div>
                <div className="overflow-y-auto flex-grow">
                  <ul className="divide-y divide-slate-100">
                    {questions.slice(0, 10).map((q) => {
                      const isSolved = stats.solved_question_ids.includes(q.id);
                      return (
                        <li key={q.id} className="hover:bg-slate-50 transition-colors duration-150">
                          <Link to={`/practice-workspace/${q.id}`} className="block px-5 py-4 no-underline group">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors truncate pr-2">
                                {q.title}
                              </h3>
                              {isSolved && (
                                <svg className="h-4 w-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              q.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                              q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {q.difficulty}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-center">
                  <Link to="/practice-hub/all" className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors">
                    View all {questions.length} questions &rarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* Center: Active/Featured Question */}
            <div className="lg:col-span-2 space-y-6">
              {(() => {
                const activeQuestion = questions.find(q => !stats.solved_question_ids.includes(q.id)) || questions[0];
                return activeQuestion ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                    <div className="p-8 flex-grow">
                      <div className="inline-flex items-center space-x-2 mb-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase tracking-wide">
                          Recommended For You
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                          activeQuestion.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800' :
                          activeQuestion.difficulty === 'Medium' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {activeQuestion.difficulty}
                        </span>
                      </div>
                      
                      <h2 className="text-3xl font-extrabold text-slate-900 mb-4">{activeQuestion.title}</h2>
                      
                      <div className="prose prose-slate max-w-none text-slate-600 mb-8">
                        <p>{activeQuestion.description}</p>
                      </div>
                    </div>
                    
                    <div className="p-8 bg-slate-50 border-t border-slate-100">
                      <Link 
                        to={`/practice-workspace/${activeQuestion.id}`}
                        className="inline-flex items-center justify-center w-full md:w-auto px-8 py-4 bg-amber-500 text-white text-lg font-bold rounded-xl hover:bg-amber-600 shadow-md hover:shadow-lg transition-all"
                      >
                        Solve Challenge
                        <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>

            {/* Right Sidebar: Weekly Challenge */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-md border border-indigo-500 p-6 text-white relative overflow-hidden h-full">
                {/* Abstract decoration */}
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10"></div>
                
                <h2 className="text-xl font-bold mb-2 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Weekly Challenge
                </h2>
                
                {weeklyChallenge ? (
                  <div className="flex flex-col h-[calc(100%-2rem)] justify-between">
                    <div>
                      <p className="text-indigo-100 text-sm mb-4">
                        Compete globally! Solve this week's problem optimally to top the leaderboard.
                      </p>
                      <div className="bg-white/10 rounded-lg p-4 mb-5 backdrop-blur-sm">
                        <h3 className="font-bold text-lg mb-1">{weeklyChallenge.question_data?.title}</h3>
                        <div className="flex items-center text-xs text-indigo-200">
                          <span className="font-medium mr-2 px-2 py-0.5 rounded bg-indigo-500/50">
                            {weeklyChallenge.question_data?.difficulty}
                          </span>
                          <span>Closes {new Date(weeklyChallenge.end_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Link 
                        to={`/practice-workspace/${weeklyChallenge.challenge_id}?weekly=true`}
                        className="block w-full text-center bg-white text-indigo-700 font-bold py-3 px-4 rounded-xl shadow hover:bg-indigo-50 transition-colors no-underline"
                      >
                        Start Challenge
                      </Link>
                      <div className="mt-4 text-center">
                        <Link to={`/weekly-challenge`} className="text-sm font-medium text-indigo-200 hover:text-white transition-colors underline">
                          View Global Leaderboard &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center h-full flex items-center justify-center">
                    <p className="text-indigo-200">No active challenge this week. Check back later!</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default PracticeHub;
