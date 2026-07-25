import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

const backend_url = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const WeeklyChallenge = () => {
  const [challenge, setChallenge] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const token = await getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const cRes = await axios.get(`${backend_url}/api/v1/practice/weekly-challenge`, { headers });
        
        if (cRes.data.active) {
          setChallenge(cRes.data);
          const lRes = await axios.get(`${backend_url}/api/v1/practice/weekly-challenge/leaderboard/${cRes.data.challenge_id}`, { headers });
          setLeaderboard(lRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, [getToken]);

  if (loading) return <div className="p-10 text-center font-sans font-medium text-slate-600">Loading Leaderboard...</div>;

  if (!challenge) {
    return (
      <div className="min-h-screen bg-slate-50 p-10 text-center flex flex-col items-center justify-center font-sans">
        <h1 className="text-3xl font-bold text-slate-800">No Active Challenge</h1>
        <p className="text-slate-600 mt-4 text-lg">Check back next week for a new challenge!</p>
        <Link to="/practice-hub" className="mt-8 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow font-semibold transition-colors no-underline">
          Back to Practice Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl shadow-lg p-10 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-white opacity-10"></div>
          
          <h1 className="text-4xl font-black mb-4 flex justify-center items-center gap-3 relative z-10">
            🏆 Weekly Challenge
          </h1>
          <h2 className="text-3xl font-bold text-yellow-300 mb-8 relative z-10">{challenge.question_data?.title}</h2>
          <Link 
            to={`/practice-workspace/${challenge.challenge_id}?weekly=true`}
            className="inline-block relative z-10 bg-white text-indigo-700 font-bold py-4 px-10 rounded-full shadow-lg hover:bg-indigo-50 hover:scale-105 transition-all text-lg no-underline"
          >
            Enter Arena
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
               Global Leaderboard
            </h3>
            <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              Closes {new Date(challenge.end_date).toLocaleDateString()}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Rank</th>
                  <th scope="col" className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                  <th scope="col" className="px-8 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Score</th>
                  <th scope="col" className="px-8 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Exec Time (ms)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {leaderboard.length === 0 ? (
                  <tr><td colSpan="4" className="px-8 py-12 text-center text-slate-500 text-lg">No submissions yet. Be the first!</td></tr>
                ) : (
                  leaderboard.map((entry, index) => (
                    <tr key={index} className={`transition-colors hover:bg-slate-50 ${index < 3 ? "bg-yellow-50/20" : ""}`}>
                      <td className="px-8 py-5 whitespace-nowrap text-sm font-black text-slate-900 flex items-center gap-2">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center ${index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-slate-200 text-slate-700' : index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-500'}`}>
                          {index + 1}
                        </span>
                        {index === 0 && " 🥇"}
                        {index === 1 && " 🥈"}
                        {index === 2 && " 🥉"}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-base text-slate-700 font-bold">{entry.student_name}</td>
                      <td className="px-8 py-5 whitespace-nowrap text-base text-indigo-600 font-black text-right">{entry.score.toLocaleString()}</td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-500 font-medium text-right">{entry.execution_time_ms} ms</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyChallenge;
