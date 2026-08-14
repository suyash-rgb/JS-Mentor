import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const backend_url = process.env.REACT_APP_API_BASE_URL;

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
          axios.get(`${backend_url}/api/v1/practice/questions/featured?limit=10`, { headers }),
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
          <div className="bg-gradient-to-br from-orange-500 via-orange-400 to-amber-500 rounded-2xl shadow-lg p-8 md:p-10 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-white opacity-10 pointer-events-none"></div>
            
            <div className="space-y-4 max-w-2xl relative z-10 text-center md:text-left">
              <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">Practice Hub</h1>
              <p className="text-lg text-orange-50 font-medium leading-relaxed drop-shadow-sm">
                Master JavaScript by solving real-world coding challenges.
                Compete in weekly challenges to climb the global leaderboard and sharpen your problem-solving skills!
              </p>
            </div>
            <div className="mt-8 md:mt-0 flex flex-col items-center justify-center min-w-[200px] relative z-10">
              <div className="relative w-36 h-36 flex items-center justify-center hover:scale-105 transition-transform duration-300">
                <svg className="w-full h-full transform -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.25)" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="50" cy="50" r="42" 
                    stroke="url(#progressGradient)" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeLinecap="round"
                    style={{ 
                      strokeDasharray: 2 * Math.PI * 42,
                      strokeDashoffset: questions.length > 0 ? (2 * Math.PI * 42) - ((stats.practice_problems_solved || 0) / questions.length) * (2 * Math.PI * 42) : (2 * Math.PI * 42),
                      transition: 'stroke-dashoffset 1.5s ease-out'
                    }} 
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#fef08a" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-1 drop-shadow-sm">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-black text-white leading-none">
                      {stats.practice_problems_solved || 0}
                    </span>
                    <span className="text-base font-bold text-orange-100 ml-0.5">
                      /{stats.total_questions || questions.length}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-orange-100 uppercase tracking-wider mt-1">Solved</span>
                </div>
              </div>
            </div>
          </div>

          {questions.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

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
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${q.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
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
                      View all {stats.total_questions || questions.length} questions &rarr;
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
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${activeQuestion.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800' :
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
            </div>
          )}

          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between text-white border border-indigo-500 relative overflow-hidden mt-8 mb-4 w-full">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10"></div>
            <div className="flex items-center space-x-4 relative z-10">
              <span className="text-4xl drop-shadow-md">🏆</span>
              <div>
                <h3 className="font-extrabold text-xl mb-1 text-yellow-300">Weekly Challenge is Live!</h3>
                <p className="text-indigo-100 text-sm font-medium">Compete globally and climb the leaderboard.</p>
              </div>
            </div>
            <Link to="/weekly-challenge" className="mt-4 sm:mt-0 px-8 py-3 bg-white text-indigo-700 font-black rounded-xl shadow-lg hover:bg-indigo-50 hover:scale-105 transition-all no-underline whitespace-nowrap relative z-10">
              View Challenge &rarr;
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PracticeHub;
