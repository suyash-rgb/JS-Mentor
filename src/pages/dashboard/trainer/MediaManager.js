import React, { useState } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CardMedia, 
  IconButton, TextField, Button, MenuItem, Select, FormControl, InputLabel, Divider 
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const MediaManager = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [file, setFile] = useState(null);
  const [topic, setTopic] = useState('');

  const videos = [
    { id: 1, title: 'Introduction to Closures', topic: 'JS Core', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { id: 2, title: 'Understanding Event Loop', topic: 'Node.js', url: 'https://www.youtube.com/embed/8aGhZQkoFbQ' },
  ];

  const handleAddVideo = () => {
    // Mock add logic
    setVideoUrl('');
    setFile(null);
    setTopic('');
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Video Tutorials</Typography>

      {/* Add Video Section */}
      <Card elevation={2} sx={{ mb: 6, borderRadius: 3, p: 3, maxWidth: '800px', mx: 'auto' }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold' }}>Add New Tutorial</Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Form Group 1: YouTube Option */}
            <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 2, borderBottom: '3px solid #e2e8f0', transition: '0.2s', '&:hover': { bgcolor: '#f1f5f9' } }}>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Option 1: YouTube URL</Typography>
              <TextField 
                fullWidth label="YouTube Embed URL" 
                placeholder="https://www.youtube.com/embed/..." 
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                sx={{ bgcolor: 'white', borderRadius: 1 }}
              />
            </Box>

            <Divider sx={{ typography: 'body2', color: 'text.secondary', fontWeight: 'bold' }}>OR</Divider>

            {/* Form Group 2: Local Upload */}
            <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 2, borderBottom: '3px solid #e2e8f0', transition: '0.2s', '&:hover': { bgcolor: '#f1f5f9' } }}>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Option 2: Local Upload</Typography>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<CloudUploadIcon />}
                sx={{ bgcolor: 'white', py: 1.8, textTransform: 'none', fontSize: '1rem', borderStyle: 'dashed', borderWidth: 2, '&:hover': { borderWidth: 2 } }}
              >
                {file ? file.name : "Select Video File"}
                <input
                  type="file"
                  accept="video/*"
                  hidden
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </Button>
            </Box>

            {/* Form Group 3: Module Selection */}
            <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 2, borderBottom: '3px solid #e2e8f0', transition: '0.2s', '&:hover': { bgcolor: '#f1f5f9' } }}>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Step 3: Module Selection</Typography>
              <FormControl fullWidth sx={{ bgcolor: 'white', borderRadius: 1 }}>
                <InputLabel>Assign to Learning Path</InputLabel>
                <Select value={topic} label="Assign to Learning Path" onChange={(e) => setTopic(e.target.value)}>
                  <MenuItem value="Fundamentals">Fundamentals</MenuItem>
                  <MenuItem value="JS Core">JS Core</MenuItem>
                  <MenuItem value="Frontend">Frontend</MenuItem>
                  <MenuItem value="Node.js">Node.js</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Action Button */}
            <Button 
              variant="contained" 
              startIcon={<AddCircleIcon />} 
              fullWidth size="large" 
              onClick={handleAddVideo}
              disabled={(!videoUrl && !file) || !topic}
              sx={{ borderRadius: 2, mt: 1, py: 1.5, fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'none', boxShadow: 3 }}
            >
              Save & Publish
            </Button>
          </Box>
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
