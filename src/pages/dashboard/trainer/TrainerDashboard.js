import React, { useState } from 'react';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import StudentProgression from './StudentProgression'; 
import {
  Box, Drawer, Typography, IconButton, useMediaQuery, useTheme
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

// Sub-components
import TrainerOverview from './TrainerOverview';
import GradingHub from './GradingHub';
import StudentSupport from './StudentSupport';
import CurriculumManager from './CurriculumManager';
import MediaManager from './MediaManager';
import RiskAssessment from './RiskAssessment';

const drawerWidth = 260;

const TrainerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { id: 'overview', text: 'Overview', icon: <DashboardIcon className="w-5 h-5" /> },
    { id: 'progression', text: 'Student Progression', icon: <QueryStatsIcon className="w-5 h-5" /> }, 
    { id: 'grading', text: 'Grading Hub', icon: <AssignmentTurnedInIcon className="w-5 h-5" /> },
    { id: 'messages', text: 'Student Doubts', icon: <QuestionAnswerIcon className="w-5 h-5" /> },
    { id: 'curriculum', text: 'Curriculum', icon: <LibraryBooksIcon className="w-5 h-5" /> },
    { id: 'risk', text: 'Risk Analytics', icon: <ReportProblemIcon className="w-5 h-5" /> },
    { id: 'media', text: 'Video Tutorials', icon: <VideoLibraryIcon className="w-5 h-5" /> },
  ];

  // Helper to find active tab title to print on mobile header bar
  const activeTabDetails = menuItems.find(item => item.id === activeTab) || menuItems[0];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <TrainerOverview />;
      case 'progression': return <StudentProgression />; 
      case 'grading': return <GradingHub />;
      case 'messages': return <StudentSupport />;
      case 'curriculum': return <CurriculumManager />;
      case 'risk': return <RiskAssessment />;
      case 'media': return <MediaManager />;
      default: return <TrainerOverview />;
    }
  };

  const drawerContent = (
    <div className="flex flex-col h-full bg-white">
      {/* Sidebar Navigation Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
        <Typography variant="h6" className="font-black text-slate-900 text-base tracking-tight">
          Trainer Console
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle} size="small" className="text-slate-400 hover:bg-slate-50">
            <CloseIcon className="w-4 h-4" />
          </IconButton>
        )}
      </div>

      {/* Navigation Router List Links */}
      <nav className="flex-1 p-3 overflow-y-auto space-y-1">
        {menuItems.map((item) => {
          const isSelected = activeTab === item.id;
          return (
            <div
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (isMobile) setMobileOpen(false);
              }}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl cursor-pointer font-medium text-sm transition-all ${
                isSelected
                  ? 'bg-blue-50 text-blue-700 font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className={`${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                {item.icon}
              </div>
              <span>{item.text}</span>
            </div>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />

      {/* Mobile Top Sub-Header Bar (Only displays on devices under 768px) */}
      {isMobile && (
        <div className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-slate-800">
            <div className="text-blue-600 shrink-0">{activeTabDetails.icon}</div>
            <span className="font-extrabold text-sm tracking-tight">{activeTabDetails.text}</span>
          </div>
          <button
            onClick={handleDrawerToggle}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1 border border-slate-200/40"
          >
            <MenuIcon className="w-4 h-4" />
            <span className="text-xs font-bold pr-1">Console</span>
          </button>
        </div>
      )}

      {/* Primary Shell Framing Workspace */}
      <div className="flex flex-1 relative min-h-0">
        
        {/* DESKTOP SIDEBAR VIEWPORT */}
        {!isMobile && (
          <aside 
            style={{ width: drawerWidth }}
            className="shrink-0 bg-white border-r border-slate-200 h-full sticky top-0"
          >
            {drawerContent}
          </aside>
        )}

        {/* MOBILE DRAWER VIEWPORT SHEET */}
        {isMobile && (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }} // Better open performance on mobile
            sx={{
              zIndex: 9999, // Guarantees the console renders over the main navigation block
              '& .MuiDrawer-paper': { 
                width: drawerWidth, 
                boxSizing: 'border-box',
                boxShadow: '24px 0px 48px -12px rgba(0,0,0,0.15)',
                borderRight: 'none',
              },
            }}
          >
            {drawerContent}
          </Drawer>
        )}

        {/* CORE CONTENT RENDER INJECTION PANEL */}
        <main className="flex-1 flex flex-col p-3 sm:p-6 min-w-0 overflow-x-hidden">
          <div className="flex-1 bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-6 shadow-sm min-h-[70vh]">
            {renderContent()}
          </div>
        </main>

      </div>

      <Footer />
    </div>
  );
};

export default TrainerDashboard;