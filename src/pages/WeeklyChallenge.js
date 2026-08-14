import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const backend_url = process.env.REACT_APP_API_BASE_URL;

const WeeklyChallenge = () => {
  const [challenge, setChallenge] = useState(null);
  const [allChallenges, setAllChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const token = await getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const cRes = await axios.get(`${backend_url}/api/v1/practice/weekly-challenge/all`, { headers });

        setAllChallenges(cRes.data);
        const activeChallenge = cRes.data.find(c => c.is_active);

        if (activeChallenge) {
          setChallenge(activeChallenge);
          const lRes = await axios.get(`${backend_url}/api/v1/practice/weekly-challenge/leaderboard/${activeChallenge.challenge_id}`, { headers });
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
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Navbar />
      <div className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Hero Section */}
            <div className="lg:col-span-5 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl shadow-lg p-10 text-white text-center relative overflow-hidden flex flex-col justify-center min-h-[450px]">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10"></div>
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-white opacity-10"></div>

              <h1 className="text-4xl lg:text-5xl font-black mb-6 flex justify-center items-center gap-3 relative z-10">
                🏆 Weekly Challenge
              </h1>
              <h2 className="text-2xl lg:text-3xl font-bold text-yellow-300 mb-10 relative z-10 leading-snug">{challenge.question_data?.title}</h2>
              <div className="relative z-10">
                <Link
                  to={`/practice-workspace/${challenge.challenge_id}?weekly=true`}
                  className="inline-block bg-white text-indigo-700 font-bold py-4 px-12 rounded-full shadow-xl hover:bg-indigo-50 hover:scale-105 transition-all text-lg no-underline"
                >
                  Enter Arena
                </Link>
              </div>
            </div>

            {/* Leaderboard Section */}
            <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
              <div className="px-8 py-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  Global Leaderboard
                </h3>
                <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                  Closes {new Date(challenge.end_date).toLocaleDateString()}
                </span>
              </div>
              <div className="overflow-x-auto flex-grow">
                <table className="min-w-full divide-y divide-slate-200 h-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Rank</th>
                      <th scope="col" className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                      <th scope="col" className="px-8 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Score</th>
                      <th scope="col" className="px-8 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Exec Time</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {leaderboard.length === 0 ? (
                      <tr><td colSpan="4" className="px-8 py-12 text-center text-slate-500 text-lg">No submissions yet. Be the first!</td></tr>
                    ) : (
                      leaderboard.map((entry, index) => (
                        <tr key={index} className={`transition-colors hover:bg-slate-50 ${entry.is_current_user ? 'bg-indigo-50' : index < 3 ? "bg-yellow-50/10" : ""}`}>
                          <td className="px-8 py-4 whitespace-nowrap text-sm font-black text-slate-900 flex items-center gap-2">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center ${entry.rank === 1 ? 'bg-yellow-100 text-yellow-700' : entry.rank === 2 ? 'bg-slate-200 text-slate-700' : entry.rank === 3 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-500'}`}>
                              {entry.rank}
                            </span>
                            {entry.rank === 1 && " 🥇"}
                            {entry.rank === 2 && " 🥈"}
                            {entry.rank === 3 && " 🥉"}
                          </td>
                          <td className="px-8 py-4 whitespace-nowrap text-base text-slate-700 font-bold">
                            {entry.student_name}
                            {entry.is_current_user && <span className="ml-2 text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full uppercase tracking-widest">You</span>}
                          </td>
                          <td className="px-8 py-4 whitespace-nowrap text-base text-indigo-600 font-black text-right">{entry.score.toLocaleString()}</td>
                          <td className="px-8 py-4 whitespace-nowrap text-sm text-slate-500 font-medium text-right">{entry.execution_time_ms} ms</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {allChallenges.filter(c => !c.is_active).length > 0 && (
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-2">Past Challenges</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allChallenges.filter(c => !c.is_active).map(c => (
                  <div key={c.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded">Past</span>
                        <span className="text-xs text-slate-500">{new Date(c.end_date).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-800 mb-2">{c.question_data?.title || 'Unknown Challenge'}</h4>
                    </div>
                    <Link
                      to={`/practice-workspace/${c.challenge_id}?weekly=true`}
                      className="mt-4 text-center text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 py-2 rounded-lg transition-colors no-underline"
                    >
                      View Challenge
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default WeeklyChallenge;
