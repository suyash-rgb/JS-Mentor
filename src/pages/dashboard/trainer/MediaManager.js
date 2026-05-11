import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CardMedia, 
  IconButton, TextField, Button, MenuItem, Select, FormControl, InputLabel, CircularProgress 
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { getLearningPathNames } from '../../../utils/trainerService';

const MediaManager = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [topic, setTopic] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [pathNames, setPathNames] = useState([]);
  const [loadingPaths, setLoadingPaths] = useState(true);

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const names = await getLearningPathNames();
        setPathNames(names);
      } catch (error) {
        console.error("Failed to load path names", error);
      } finally {
        setLoadingPaths(false);
      }
    };
    fetchPaths();
  }, []);

  const videos = [
    { id: 1, title: 'Introduction to Closures', topic: 'JS Core', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { id: 2, title: 'Understanding Event Loop', topic: 'Node.js', url: 'https://www.youtube.com/embed/8aGhZQkoFbQ' },
  ];

  const handleAddVideo = () => {
    // Mock add logic
    setVideoUrl('');
    setTopic('');
    setUploadFile(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Video Tutorials</Typography>

      {/* Add Video Section */}
      <Card elevation={2} sx={{ mb: 6, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 4, fontWeight: 'bold' }}>Add New Tutorial</Typography>
          
          <Grid container spacing={4}>
            {/* Row 1: Embed Option */}
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>Option 1: Embed from YouTube</Typography>
              <TextField 
                fullWidth label="YouTube Embed URL" 
                placeholder="https://www.youtube.com/embed/..." 
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                disabled={!!uploadFile}
                variant="outlined"
              />
            </Grid>

            {/* Row 2: Divider */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                <Box sx={{ flex: 1, height: '1px', bgcolor: '#e2e8f0' }} />
                <Typography variant="caption" sx={{ px: 2, fontWeight: 'bold', color: 'text.secondary' }}>OR</Typography>
                <Box sx={{ flex: 1, height: '1px', bgcolor: '#e2e8f0' }} />
              </Box>
            </Grid>

            {/* Row 3: Upload Option */}
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>Option 2: Upload Local Video</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <input
                  accept="video/*"
                  style={{ display: 'none' }}
                  id="raised-button-file"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="raised-button-file">
                  <Button 
                    variant="outlined" 
                    component="span" 
                    startIcon={<CloudUploadIcon />}
                    sx={{ borderRadius: 2, px: 3 }}
                    disabled={!!videoUrl}
                  >
                    {uploadFile ? 'Change Video' : 'Select Video File'}
                  </Button>
                </label>
                {uploadFile && (
                  <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 500 }}>
                    <i className="fas fa-check-circle" style={{ marginRight: '6px' }}></i>
                    {uploadFile.name}
                  </Typography>
                )}
              </Box>
            </Grid>

            {/* Row 4: Topic Selection */}
            <Grid item xs={12}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>Step 3: Assign to Learning Path Module</Typography>
                <FormControl fullWidth variant="outlined" sx={{ minWidth: '300px' }}>
                  <InputLabel id="topic-select-label">
                    {loadingPaths ? 'Loading paths...' : 'Select the specific module this video belongs to'}
                  </InputLabel>
                  <Select 
                    labelId="topic-select-label"
                    value={topic} 
                    label={loadingPaths ? 'Loading paths...' : 'Select the specific module this video belongs to'} 
                    onChange={(e) => setTopic(e.target.value)}
                    sx={{ borderRadius: 2 }}
                    disabled={loadingPaths}
                  >
                    {loadingPaths ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <CircularProgress size={24} />
                      </Box>
                    ) : (
                      pathNames.map((name) => (
                        <MenuItem key={name} value={name}>{name}</MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            {/* Row 5: Save Button (Full Width for clarity) */}
            <Grid item xs={12}>
              <Button 
                variant="contained" 
                startIcon={<AddCircleIcon />} 
                fullWidth 
                onClick={handleAddVideo}
                disabled={(!videoUrl && !uploadFile) || !topic}
                sx={{ 
                  borderRadius: 2, 
                  height: '60px', 
                  fontSize: '1.1rem', 
                  fontWeight: 'bold',
                  boxShadow: '0 4px 12px rgba(49, 130, 206, 0.3)'
                }}
              >
                Save and Publish Tutorial
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
