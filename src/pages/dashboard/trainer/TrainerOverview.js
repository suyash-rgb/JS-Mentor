import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Card, CardContent, Divider, CircularProgress, Alert,
  Switch, FormControlLabel
} from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MessageIcon from '@mui/icons-material/Message';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { getDashboardOverview, updateAvailability } from '../../../services/trainerService';

const TrainerOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [trainerName, setTrainerName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getDashboardOverview();
        setData(result);
        setIsAvailable(result.is_available ?? false);
        setTrainerName(result.trainer_name || 'Trainer');
        setError(null);
      } catch (err) {
        console.error("Error fetching trainer dashboard:", err);
        setError("Failed to load dashboard data. Please ensure you are logged in as a trainer.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleToggleAvailability = async (event) => {
    const newVal = event.target.checked;
    setIsUpdating(true);
    try {
      await updateAvailability(newVal);
      setIsAvailable(newVal);
    } catch (err) {
      console.error("Failed to update availability:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <CircularProgress size={40} className="text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-2">
        <Alert severity="error" className="rounded-xl shadow-sm">{error}</Alert>
      </div>
    );
  }

  const { stats, recent_submissions, active_sessions } = data || {};

  const statCards = [
    { title: 'Active Students', value: stats?.active_students || 0, icon: <PeopleAltIcon fontSize="large" className="text-blue-600" />, tailwindBg: 'bg-blue-50/60 border-blue-100' },
    { title: 'Pending Reviews', value: stats?.pending_reviews || 0, icon: <AssignmentIcon fontSize="large" className="text-red-500" />, tailwindBg: 'bg-red-50/60 border-red-100' },
    { title: 'New Doubts', value: stats?.new_doubts || 0, icon: <MessageIcon fontSize="large" className="text-purple-500" />, tailwindBg: 'bg-purple-50/60 border-purple-100' },
    { title: 'Avg. Score', value: `${stats?.average_score_percentage || 0}%`, icon: <TrendingUpIcon fontSize="large" className="text-indigo-500" />, tailwindBg: 'bg-indigo-50/60 border-indigo-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Upper Status Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase block">
            Trainer Dashboard
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Welcome back, {trainerName}
          </h1>
        </div>
        
        {/* Availability Toggle Box */}
        <div className={`px-4 py-1.5 rounded-full border transition-all shadow-sm ${
          isAvailable ? 'bg-emerald-50/80 border-emerald-200' : 'bg-rose-50/80 border-rose-200'
        }`}>
          <FormControlLabel
            className="m-0"
            control={
              <Switch
                checked={isAvailable}
                onChange={handleToggleAvailability}
                disabled={isUpdating}
                color="success"
                size="small"
              />
            }
            label={
              <span className={`text-xs font-bold pl-1 ${isAvailable ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isUpdating ? 'Updating...' : (isAvailable ? 'Online & Available' : 'Offline')}
              </span>
            }
          />
        </div>
      </div>

      {/* Responsive Grid System: 1 column on mobile, 2 on tablet, 4 on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div 
            key={index}
            className={`p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${stat.tailwindBg}`}
          >
            <div className="flex items-center gap-3.5 mb-3">
              <div className="shrink-0">{stat.icon}</div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                {stat.title}
              </h3>
            </div>
            <span className="text-3xl font-black text-slate-900 block tracking-tight">
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom Main Content Panel Workspace Block */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Recent Submissions Feed */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col">
          <h2 className="text-sm font-bold text-slate-800 mb-3">Recent Submissions</h2>
          <Divider className="border-slate-100 mb-3" />
          
          <div className="space-y-2 flex-1 overflow-y-auto max-h-[360px] pr-1">
            {recent_submissions && recent_submissions.length > 0 ? (
              recent_submissions.map((sub) => (
                <div 
                  key={sub.submission_id} 
                  className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                >
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm truncate leading-tight">{sub.exercise_title}</h4>
                    <span className="text-xs text-slate-400 block mt-0.5 truncate">Student: {sub.student_name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider block">
                      {sub.status}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                      {new Date(sub.submitted_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-xs text-slate-400 italic">No recent exercise submissions.</div>
            )}
          </div>
        </div>

        {/* Live Active Mentorship Sessions Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col">
          <h2 className="text-sm font-bold text-slate-800 mb-3">Active Mentorship Sessions</h2>
          <Divider className="border-slate-100 mb-3" />
          
          <div className="space-y-2 flex-1 overflow-y-auto max-h-[360px] pr-1">
            {active_sessions && active_sessions.length > 0 ? (
              active_sessions.map((sess) => (
                <div 
                  key={sess.session_id} 
                  className="p-3 bg-white border border-slate-100 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:border-slate-300 transition-colors"
                >
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm leading-tight">{sess.topic}</h4>
                    <span className="text-xs text-slate-400 block mt-0.5">Student: {sess.student_name}</span>
                  </div>
                  <div className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 shrink-0 self-start sm:self-auto">
                    <span className="text-[10px] text-slate-600 font-mono font-bold">
                      Time Left: {sess.time_remaining_minutes}m
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-xs text-slate-400 italic">No active direct guidance lines live.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TrainerOverview;