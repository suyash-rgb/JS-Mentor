import React, { useState } from 'react';
import {
  Drawer, Typography, IconButton, useMediaQuery, useTheme, Box
} from '@mui/material';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import BugReportIcon from '@mui/icons-material/BugReport';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

// Sub-components
import LLMObservability from './components/LLMObservability';
import TrainerSupervision from './components/TrainerSupervision';
import StudentRisk from './components/StudentRisk';
import IssueTracker from './components/IssueTracker';
import SystemControl from './components/SystemControl';

const drawerWidth = 260;

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('observability');
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { id: 'observability', text: 'LLM Observability', icon: <QueryStatsIcon className="w-5 h-5" /> },
    { id: 'supervision', text: 'Trainer SLA Control', icon: <AssignmentTurnedInIcon className="w-5 h-5" /> },
    { id: 'risk', text: 'Academic Risk Insights', icon: <ReportProblemIcon className="w-5 h-5" /> },
    { id: 'issues', text: 'Platform Issues', icon: <BugReportIcon className="w-5 h-5" /> },
    { id: 'controls', text: 'System Controls', icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  const activeTabDetails = menuItems.find(item => item.id === activeTab) || menuItems[0];

  const renderContent = () => {
    switch (activeTab) {
      case 'observability': return <LLMObservability />;
      case 'supervision': return <TrainerSupervision />;
      case 'risk': return <StudentRisk />;
      case 'issues': return <IssueTracker />;
      case 'controls': return <SystemControl />;
      default: return <LLMObservability />;
    }
  };

  const drawerContent = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-white">
      {/* Sidebar Navigation Header */}
      <div className="flex items-center justify-between px-5 py-6 border-b border-slate-800 shrink-0">
        <div>
          <Typography variant="h6" className="font-black text-amber-500 text-base tracking-tight">
            JS Mentor
          </Typography>
          <Typography className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider mt-0.5">
            Admin Console
          </Typography>
        </div>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle} size="small" className="text-slate-400 hover:bg-slate-800/40">
            <CloseIcon className="w-4 h-4" />
          </IconButton>
        )}
      </div>

      {/* Navigation Router List Links */}
      <nav className="flex-1 p-4 overflow-y-auto space-y-1.5">
        {menuItems.map((item) => {
          const isSelected = activeTab === item.id;
          return (
            <div
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (isMobile) setMobileOpen(false);
              }}
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl cursor-pointer font-bold text-xs transition-all border-0 ${
                isSelected
                  ? 'bg-amber-500/10 text-amber-500 border-l-4 border-amber-500 pl-3 shadow-md'
                  : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-100'
              }`}
            >
              <div className={`${isSelected ? 'text-amber-500' : 'text-slate-500'}`}>
                {item.icon}
              </div>
              <span className="uppercase tracking-wider">{item.text}</span>
            </div>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 font-sans antialiased">
      <Navbar />

      {/* Mobile Top Sub-Header Bar */}
      {isMobile && (
        <div className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 px-4 py-3.5 flex items-center justify-between shadow-lg text-white">
          <div className="flex items-center gap-2">
            <div className="text-amber-500 shrink-0">{activeTabDetails.icon}</div>
            <span className="font-extrabold text-xs uppercase tracking-wider">{activeTabDetails.text}</span>
          </div>
          <button
            onClick={handleDrawerToggle}
            className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1 border border-slate-700/60 cursor-pointer"
          >
            <MenuIcon className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] uppercase font-bold tracking-wider pr-0.5">Console</span>
          </button>
        </div>
      )}

      {/* Primary Shell Framing Workspace */}
      <div className="flex flex-1 relative min-h-0 bg-slate-950">
        
        {/* DESKTOP SIDEBAR VIEWPORT */}
        {!isMobile && (
          <aside 
            style={{ width: drawerWidth }}
            className="shrink-0 bg-slate-900 border-r border-slate-800 h-full sticky top-0"
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
            ModalProps={{ keepMounted: true }}
            sx={{
              zIndex: 9999,
              '& .MuiDrawer-paper': { 
                width: drawerWidth, 
                boxSizing: 'border-box',
                boxShadow: '24px 0px 48px -12px rgba(0,0,0,0.5)',
                borderRight: 'none',
                backgroundColor: '#0f172a'
              },
            }}
          >
            {drawerContent}
          </Drawer>
        )}

        {/* CORE CONTENT RENDER INJECTION PANEL */}
        <main className="flex-1 flex flex-col p-3 sm:p-6 md:p-8 min-w-0 overflow-x-hidden">
          <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl shadow-black/30 min-h-[75vh]">
            {renderContent()}
          </div>
        </main>

      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
