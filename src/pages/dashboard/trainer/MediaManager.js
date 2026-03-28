import React, { useState } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CardMedia, 
  IconButton, TextField, Button, MenuItem, Select, FormControl, InputLabel 
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';

const MediaManager = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [topic, setTopic] = useState('');

  const videos = [
    { id: 1, title: 'Introduction to Closures', topic: 'JS Core', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { id: 2, title: 'Understanding Event Loop', topic: 'Node.js', url: 'https://www.youtube.com/embed/8aGhZQkoFbQ' },
  ];

  const handleAddVideo = () => {
    // Mock add logic
    setVideoUrl('');
    setTopic('');
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Video Tutorials</Typography>

      {/* Add Video Section */}
      <Card elevation={2} sx={{ mb: 6, borderRadius: 3, p: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>Embed New Explanation Video</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField 
                fullWidth label="YouTube Embed URL" 
                placeholder="https://www.youtube.com/embed/..." 
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Learning Path Topic</InputLabel>
                <Select value={topic} label="Learning Path Topic" onChange={(e) => setTopic(e.target.value)}>
                  <MenuItem value="Fundamentals">Fundamentals</MenuItem>
                  <MenuItem value="JS Core">JS Core</MenuItem>
                  <MenuItem value="Frontend">Frontend</MenuItem>
                  <MenuItem value="Node.js">Node.js</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button 
                variant="contained" 
                startIcon={<AddCircleIcon />} 
                fullWidth size="large" 
                onClick={handleAddVideo}
                disabled={!videoUrl || !topic}
                sx={{ borderRadius: 2 }}
              >
                Embed Video
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Video Gallery */}
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>Embedded Video Gallery</Typography>
      <Grid container spacing={3}>
        {videos.map((vid) => (
          <Grid item xs={12} sm={6} md={4} key={vid.id}>
            <Card elevation={4} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ position: 'relative', pt: '56.25%' }}>
                 <CardMedia
                   component="iframe"
                   src={vid.url}
                   sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                 />
              </Box>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" noWrap>{vid.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{vid.topic}</Typography>
                </Box>
                <IconButton color="error" size="small"><DeleteIcon /></IconButton>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MediaManager;
