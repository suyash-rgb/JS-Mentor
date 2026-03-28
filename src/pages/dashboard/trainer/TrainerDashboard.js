import React, { useState } from 'react';
import { 
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText, 
  Typography, Divider, IconButton, AppBar, Toolbar, useMediaQuery, 
  useTheme, ThemeProvider, createTheme, CssBaseline
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import MenuIcon from '@mui/icons-material/Menu';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

// Sub-components (Now in the same or child directory)
import TrainerOverview from './TrainerOverview';
import GradingHub from './GradingHub';
import StudentSupport from './StudentSupport';
import CurriculumManager from './CurriculumManager';
import MediaManager from './MediaManager';

const drawerWidth = 240;

const TrainerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { id: 'overview', text: 'Overview', icon: <DashboardIcon /> },
    { id: 'grading', text: 'Grading Hub', icon: <AssignmentTurnedInIcon /> },
    { id: 'messages', text: 'Student Doubts', icon: <QuestionAnswerIcon /> },
    { id: 'curriculum', text: 'Curriculum', icon: <LibraryBooksIcon /> },
    { id: 'media', text: 'Video Tutorials', icon: <VideoLibraryIcon /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <TrainerOverview />;
      case 'grading': return <GradingHub />;
      case 'messages': return <StudentSupport />;
      case 'curriculum': return <CurriculumManager />;
      case 'media': return <MediaManager />;
      default: return <TrainerOverview />;
    }
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Trainer Panel
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.id} 
            onClick={() => {
              setActiveTab(item.id);
              if (isMobile) setMobileOpen(false);
            }}
            selected={activeTab === item.id}
            sx={{
              '&.Mui-selected': { bgcolor: 'primary.light', color: 'primary.main' },
              '&.Mui-selected:hover': { bgcolor: 'primary.light' },
              mx: 1, my: 0.5, borderRadius: 1
            }}
          >
            <ListItemIcon sx={{ color: activeTab === item.id ? 'primary.main' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: activeTab === item.id ? 700 : 400 }} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      <Navbar />
      
      <Box sx={{ display: 'flex', flexGrow: 1, position: 'relative' }}>
        {/* Sidebar for Desktop - Now a regular Box to allow natural scrolling */}
        {!isMobile && (
          <Box
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              bgcolor: 'white',
              borderRight: '1px solid rgba(0, 0, 0, 0.12)',
              minHeight: '100%'
            }}
          >
            {drawer}
          </Box>
        )}

        {/* Sidebar for Mobile */}
        {isMobile && (
          <>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                position: 'fixed', bottom: 20, right: 20, zIndex: 1200, 
                bgcolor: 'primary.main', color: 'white', 
                '&:hover': { bgcolor: 'primary.dark' },
                boxShadow: 3 
              }}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{ keepMounted: true }}
              sx={{
                '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
              }}
            >
              {drawer}
            </Drawer>
          </>
        )}

        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { md: `calc(100% - ${drawerWidth}px)` },
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            {renderContent()}
          </Box>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
};

export default TrainerDashboard;