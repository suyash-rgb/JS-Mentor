import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardMedia,
  IconButton, TextField, Button, MenuItem, Select, FormControl, InputLabel, Divider, CircularProgress, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { 
  getLearningPathNames, 
  getTopicsForLearningPath, 
  getAllVideos, 
  addVideo, 
  deleteVideo,
  updateVideo
} from '../../../utils/trainerService';

const MediaManager = () => {
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [file, setFile] = useState(null);
  const [selectedPath, setSelectedPath] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [pathNames, setPathNames] = useState([]);
  const [topics, setTopics] = useState([]);
  const [videoList, setVideoList] = useState([]);
  const [loadingPaths, setLoadingPaths] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [filterPath, setFilterPath] = useState('All');

  const getYouTubeThumbnail = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg`;
    }
    return null;
  };

  const fetchPaths = async () => {
    setLoadingPaths(true);
    try {
      const names = await getLearningPathNames();
      setPathNames(names);
    } catch (error) {
      console.error("Failed to load path names", error);
    } finally {
      setLoadingPaths(false);
    }
  };

  const fetchVideos = async (path = 'All') => {
    setLoadingVideos(true);
    try {
      const data = await getAllVideos(path === 'All' ? null : path);
      setVideoList(data);
    } catch (error) {
      console.error("Failed to fetch videos", error);
    } finally {
      setLoadingVideos(false);
    }
  };

  useEffect(() => {
    fetchPaths();
    fetchVideos();
  }, []);

  useEffect(() => {
    const fetchTopicsData = async () => {
      if (!selectedPath) {
        setTopics([]);
        return;
      }
      setLoadingTopics(true);
      try {
        const fetchedTopics = await getTopicsForLearningPath(selectedPath);
        setTopics(fetchedTopics);
        setSelectedTopic(''); 
      } catch (error) {
        console.error("Failed to load topics", error);
        setTopics([]);
      } finally {
        setLoadingTopics(false);
      }
    };
    fetchTopicsData();
  }, [selectedPath]);



  const handleAddVideo = async () => {
    if ((!videoUrl && !file) || !selectedPath || !selectedTopic) return;
    
    setIsSubmitting(true);
    try {
      let payload;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', videoTitle || file.name);
        payload = formData;
      } else {
        payload = {
          title: videoTitle || "Tutorial Video",
          url: videoUrl
        };
      }

      await addVideo(selectedPath, selectedTopic, payload);
      
      // Success Cleanup
      setVideoUrl('');
      setVideoTitle('');
      setFile(null);
      setSelectedPath('');
      setSelectedTopic('');
      fetchVideos(filterPath);
    } catch (error) {
      console.error("Error adding video", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this tutorial?")) return;
    
    try {
      await deleteVideo(videoId);
      fetchVideos(filterPath);
    } catch (error) {
      console.error("Error deleting video", error);
    }
  };

  const handleUpdateVideo = (video) => {
    setEditingVideo(video);
    setEditTitle(video.title);
    setEditUrl(video.url);
    setEditModalOpen(true);
  };

  const handleConfirmUpdate = async () => {
    if (!editingVideo) return;
    
    try {
      await updateVideo(editingVideo.id, { 
        title: editTitle, 
        url: editUrl 
      });
      setEditModalOpen(false);
      fetchVideos(filterPath);
    } catch (error) {
      console.error("Error updating video", error);
    }
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingVideo(null);
  };



  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Video Tutorials</Typography>

      {/* Add Video Section */}
      <Card elevation={2} sx={{ mb: 6, borderRadius: 3, p: 3, maxWidth: '800px', ml: 0 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold' }}>Add New Tutorial</Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Step 0: Video Title */}
            <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 2, borderBottom: '3px solid #e2e8f0' }}>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Video Details</Typography>
              <TextField
                fullWidth label="Tutorial Title"
                placeholder="e.g. Mastering Array Methods"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                sx={{ bgcolor: 'white', borderRadius: 1 }}
              />
            </Box>

            {/* Form Group 1: YouTube Option */}
            <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 2, borderBottom: '3px solid #e2e8f0', transition: '0.2s', '&:hover': { bgcolor: '#f1f5f9' } }}>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Add YouTube URL</Typography>
              <TextField
                fullWidth label="YouTube Embed URL"
                placeholder="https://www.youtube.com/embed/..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                sx={{ bgcolor: 'white', borderRadius: 1 }}
                disabled={!!file}
              />
            </Box>

            <Divider sx={{ typography: 'body2', color: 'text.secondary', fontWeight: 'bold' }}>OR</Divider>

            {/* Form Group 2: Local Upload */}
            <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 2, borderBottom: '3px solid #e2e8f0', transition: '0.2s', '&:hover': { bgcolor: '#f1f5f9' } }}>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Upload a Video</Typography>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<CloudUploadIcon />}
                disabled={!!videoUrl}
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

            {/* Form Group 3: Learning Path Selection */}
            <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 2, borderBottom: '3px solid #e2e8f0', transition: '0.2s', '&:hover': { bgcolor: '#f1f5f9' } }}>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Select Learning Path</Typography>
              <FormControl fullWidth sx={{ bgcolor: 'white', borderRadius: 1 }}>
                <InputLabel>{loadingPaths ? 'Loading paths...' : 'Assign to Learning Path'}</InputLabel>
                <Select
                  value={selectedPath}
                  label={loadingPaths ? 'Loading paths...' : 'Assign to Learning Path'}
                  onChange={(e) => setSelectedPath(e.target.value)}
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

            {/* Form Group 4: Dynamic Topic Selection */}
            {selectedPath && (
              <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 2, borderBottom: '3px solid #e2e8f0', transition: '0.2s', '&:hover': { bgcolor: '#f1f5f9' }, animation: 'fadeIn 0.3s ease-in' }}>
                <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>Select Topic</Typography>
                <FormControl fullWidth sx={{ bgcolor: 'white', borderRadius: 1 }}>
                  <InputLabel>{loadingTopics ? 'Loading topics...' : 'Assign to Topic'}</InputLabel>
                  <Select
                    value={selectedTopic}
                    label={loadingTopics ? 'Loading topics...' : 'Assign to Topic'}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    disabled={loadingTopics || topics.length === 0}
                  >
                    {loadingTopics ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <CircularProgress size={24} />
                      </Box>
                    ) : (
                      topics.map((topicName) => (
                        <MenuItem key={topicName} value={topicName}>{topicName}</MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Box>
            )}

            {/* Action Button */}
            <Button
              variant="contained"
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <AddCircleIcon />}
              fullWidth size="large"
              onClick={handleAddVideo}
              disabled={isSubmitting || (!videoUrl && !file) || !selectedPath || !selectedTopic}
              sx={{ borderRadius: 2, mt: 1, py: 1.5, fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'none', boxShadow: 3 }}
            >
              {isSubmitting ? 'Publishing...' : 'Save & Publish'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Video Gallery Section */}
      <Card elevation={2} sx={{ borderRadius: 3, p: 1, bgcolor: '#ffffff' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Published Tutorials
            </Typography>
            <FormControl sx={{ minWidth: 220 }}>
              <InputLabel size="small">Filter by Learning Path</InputLabel>
              <Select
                size="small"
                value={filterPath}
                label="Filter by Learning Path"
                onChange={(e) => {
                  setFilterPath(e.target.value);
                  fetchVideos(e.target.value);
                }}
                sx={{ borderRadius: 2, bgcolor: '#f8fafc' }}
              >
                <MenuItem value="All">All Learning Paths</MenuItem>
                {pathNames.map((name) => (
                  <MenuItem key={name} value={name}>{name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {loadingVideos ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress thickness={5} size={50} />
            </Box>
          ) : videoList.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 3, border: '1px dashed #cbd5e1' }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>No Videos Found</Typography>
              <Typography variant="body2" color="text.disabled">
                Select a different filter or use the form above to publish new content.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={4}>
              {videoList.map((vid) => {
                const thumbnailUrl = getYouTubeThumbnail(vid.url);
                const isPlaying = playingVideoId === vid.id;

                return (
                  <Grid item xs={12} sm={6} md={4} key={vid.id || vid.url}>
                    <Card elevation={0} sx={{ 
                      borderRadius: 4, 
                      overflow: 'hidden', 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': { 
                        transform: 'translateY(-6px)', 
                        boxShadow: '0 12px 20px -10px rgba(0,0,0,0.1)',
                        borderColor: 'primary.light'
                      }
                    }}>
                      <Box sx={{ position: 'relative', pt: '56.25%', bgcolor: 'black' }}>
                        {isPlaying || !thumbnailUrl ? (
                          <CardMedia
                            component="iframe"
                            src={vid.url}
                            sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                            allowFullScreen
                          />
                        ) : (
                          <Box 
                            sx={{ 
                              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                              backgroundImage: `url(${thumbnailUrl})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              '&:hover .play-icon-overlay': { opacity: 1 },
                              '&:hover .play-button': { transform: 'scale(1.1)' }
                            }}
                            onClick={() => setPlayingVideoId(vid.id)}
                          >
                            <Box 
                              className="play-icon-overlay"
                              sx={{ 
                                position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.3)', 
                                opacity: 0, transition: '0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                              }}
                            >
                              <Box 
                                className="play-button"
                                sx={{ 
                                  width: 64, height: 64, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.9)', 
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.3s' 
                                }}
                              >
                                <PlayArrowIcon sx={{ fontSize: 40, color: '#ff0000' }} />
                              </Box>
                            </Box>
                          </Box>
                        )}
                      </Box>
                      <CardContent sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexGrow: 1 }}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle1" fontWeight="bold" noWrap title={vid.title} sx={{ mb: 0.5, lineHeight: 1.3 }}>
                            {vid.title}
                          </Typography>
                          <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.7rem', display: 'block', mb: 0.5 }}>
                            {vid.path_heading}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap sx={{ fontSize: '0.8rem' }}>
                            {vid.page_text}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton color="primary" size="small" onClick={() => handleUpdateVideo(vid)} sx={{ bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}>
                            <RefreshIcon fontSize="small" />
                          </IconButton>
                          <IconButton color="error" size="small" onClick={() => handleDeleteVideo(vid.id)} sx={{ bgcolor: '#fef2f2', '&:hover': { bgcolor: '#fee2e2' } }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </CardContent>
      </Card>
      {/* Edit Video Modal */}
      <Dialog 
        open={editModalOpen} 
        onClose={handleCloseEditModal}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: 3, p: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Update Tutorial Details</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Tutorial Title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Video URL / Embed URL"
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              variant="outlined"
              helperText="Ensure this is a valid embeddable link"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseEditModal} color="inherit" sx={{ fontWeight: 'bold' }}>Cancel</Button>
          <Button 
            onClick={handleConfirmUpdate} 
            variant="contained" 
            sx={{ fontWeight: 'bold', borderRadius: 2, px: 4 }}
          >
            Update Tutorial
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MediaManager;
