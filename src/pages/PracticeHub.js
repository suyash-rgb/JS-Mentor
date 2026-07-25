import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

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
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content: Questions List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">All Challenges</h2>
                <span className="text-sm text-slate-500 font-medium">{questions.length} available</span>
              </div>
              <ul className="divide-y divide-slate-100">
                {questions.map((q) => {
                  const isSolved = stats.solved_question_ids.includes(q.id);
                  return (
                    <li key={q.id} className="hover:bg-slate-50 transition-colors duration-150">
                      <Link to={`/practice-workspace/${q.id}`} className="flex items-center px-6 py-5 no-underline group">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors truncate">
                              {q.title}
                            </h3>
                            {isSolved && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Solved
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-slate-500 line-clamp-1">
                            {q.description.substring(0, 100)}...
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex items-center space-x-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            q.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800' :
                            q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {q.difficulty}
                          </span>
                          <svg className="h-5 w-5 text-slate-400 group-hover:text-amber-500 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Sidebar: Weekly Challenge */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-md border border-indigo-500 p-6 text-white relative overflow-hidden">
              {/* Abstract decoration */}
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10"></div>
              
              <h2 className="text-xl font-bold mb-2 flex items-center">
                <svg className="w-6 h-6 mr-2 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Weekly Challenge
              </h2>
              
              {weeklyChallenge ? (
                <>
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
                </>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-indigo-200">No active challenge this week. Check back later!</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PracticeHub;
