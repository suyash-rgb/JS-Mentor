import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, Grid, CardContent,
  TextField, MenuItem, FormControl, InputLabel, Divider, CircularProgress,
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
import * as S from './MediaManager.styles';

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
  const [filterPath, setFilterPath] = useState('All');
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editFile, setEditFile] = useState(null);

  const getVideoThumbnail = (url) => {
    if (!url) return null;

    // YouTube
    const ytRegExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const ytMatch = url.match(ytRegExp);
    if (ytMatch && ytMatch[2].length === 11) {
      return `https://img.youtube.com/vi/${ytMatch[2]}/mqdefault.jpg`;
    }

    // Cloudinary
    if (url.includes('res.cloudinary.com')) {
      // Generate a thumbnail from the video using Cloudinary transformations
      // Replace extension with .jpg and add auto-frame selection
      return url.replace(/\.[^/.]+$/, ".jpg").replace("/video/upload/", "/video/upload/so_auto,c_scale,w_500/");
    }

    return null;
  };

  const isYouTube = (url) => url && (url.includes('youtube.com') || url.includes('youtu.be'));

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
      let payload = new FormData();
      payload.append('title', videoTitle || (file ? file.name : "Tutorial Video"));

      if (file) {
        payload.append('file', file);
      } else {
        payload.append('url', videoUrl);
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
    setEditFile(null);
    setEditModalOpen(true);
  };

  const handleConfirmUpdate = async () => {
    if (!editingVideo) return;

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('title', editTitle);
      
      if (editFile) {
        payload.append('file', editFile);
      } else {
        payload.append('url', editUrl);
      }

      await updateVideo(editingVideo.id, payload);
      setEditModalOpen(false);
      setEditFile(null);
      fetchVideos(filterPath);
    } catch (error) {
      console.error("Error updating video", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingVideo(null);
    setEditFile(null);
  };



  return (
    <S.PageContainer>
      <S.PageTitle variant="h4">Video Tutorials</S.PageTitle>

      {/* Add Video Section */}
      <S.MainCard elevation={2}>
        <CardContent>
          <S.SectionTitle variant="h5">Add New Tutorial</S.SectionTitle>

          <S.FormContainer>
            {/* Step 0: Video Title */}
            <S.FormGroup>
              <S.GroupLabel variant="subtitle2">Video Details</S.GroupLabel>
              <TextField
                fullWidth label="Tutorial Title"
                placeholder="e.g. Mastering Array Methods"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                sx={{ bgcolor: 'white', borderRadius: 1 }}
              />
            </S.FormGroup>

            {/* Form Group 1: YouTube Option */}
            <S.FormGroup>
              <S.GroupLabel variant="subtitle2">Add YouTube URL</S.GroupLabel>
              <TextField
                fullWidth label="YouTube Embed URL"
                placeholder="https://www.youtube.com/embed/..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                sx={{ bgcolor: 'white', borderRadius: 1 }}
                disabled={!!file}
              />
            </S.FormGroup>

            <Divider sx={{ typography: 'body2', color: 'text.secondary', fontWeight: 'bold' }}>OR</Divider>

            {/* Form Group 2: Local Upload */}
            <S.FormGroup>
              <S.GroupLabel variant="subtitle2">Upload a Video</S.GroupLabel>
              <S.UploadButton
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<CloudUploadIcon />}
                disabled={!!videoUrl}
              >
                {file ? file.name : "Select Video File"}
                <input
                  type="file"
                  accept="video/*"
                  hidden
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </S.UploadButton>
            </S.FormGroup>

            {/* Form Group 3: Learning Path Selection */}
            <S.FormGroup>
              <S.GroupLabel variant="subtitle2">Select Learning Path</S.GroupLabel>
              <FormControl fullWidth sx={{ bgcolor: 'white', borderRadius: 1 }}>
                <InputLabel>{loadingPaths ? 'Loading paths...' : 'Assign to Learning Path'}</InputLabel>
                <S.FilterSelect
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
                </S.FilterSelect>
              </FormControl>
            </S.FormGroup>

            {/* Form Group 4: Dynamic Topic Selection */}
            {selectedPath && (
              <S.FormGroup sx={{ animation: 'fadeIn 0.3s ease-in' }}>
                <S.GroupLabel variant="subtitle2">Select Topic</S.GroupLabel>
                <FormControl fullWidth sx={{ bgcolor: 'white', borderRadius: 1 }}>
                  <InputLabel>{loadingTopics ? 'Loading topics...' : 'Assign to Topic'}</InputLabel>
                  <S.FilterSelect
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
                  </S.FilterSelect>
                </FormControl>
              </S.FormGroup>
            )}

            {/* Action Button */}
            <S.PublishButton
              variant="contained"
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <AddCircleIcon />}
              fullWidth size="large"
              onClick={handleAddVideo}
              disabled={isSubmitting || (!videoUrl && !file) || !selectedPath || !selectedTopic}
            >
              {isSubmitting ? 'Publishing...' : 'Save & Publish'}
            </S.PublishButton>
          </S.FormContainer>
        </CardContent>
      </S.MainCard>

      {/* Video Gallery Section */}
      <S.GallerySection elevation={2}>
        <CardContent sx={{ p: 3 }}>
          <S.GalleryHeader>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Published Tutorials
            </Typography>
            <FormControl sx={{ minWidth: 220 }}>
              <InputLabel size="small">Filter by Learning Path</InputLabel>
              <S.FilterSelect
                size="small"
                value={filterPath}
                label="Filter by Learning Path"
                onChange={(e) => {
                  setFilterPath(e.target.value);
                  fetchVideos(e.target.value);
                }}
              >
                <MenuItem value="All">All Learning Paths</MenuItem>
                {pathNames.map((name) => (
                  <MenuItem key={name} value={name}>{name}</MenuItem>
                ))}
              </S.FilterSelect>
            </FormControl>
          </S.GalleryHeader>

          {loadingVideos ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress thickness={5} size={50} />
            </Box>
          ) : videoList.length === 0 ? (
            <S.EmptyGalleryPaper variant="outlined">
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>No Videos Found</Typography>
              <Typography variant="body2" color="text.disabled">
                Select a different filter or use the form above to publish new content.
              </Typography>
            </S.EmptyGalleryPaper>
          ) : (
            <Grid container spacing={4}>
              {videoList.map((vid) => {
                const thumbnailUrl = getVideoThumbnail(vid.url);
                const isPlaying = playingVideoId === vid.id;
                const useNativeVideo = !isYouTube(vid.url);

                return (
                  <Grid item xs={12} sm={6} md={4} key={vid.id || vid.url}>
                    <S.VideoGridCard elevation={0}>
                      <S.VideoContainer>
                        {isPlaying || !thumbnailUrl ? (
                          useNativeVideo ? (
                            <S.VideoFrame
                              component="video"
                              src={vid.url}
                              controls
                              autoPlay
                            />
                          ) : (
                            <S.VideoFrame
                              component="iframe"
                              src={vid.url}
                              allowFullScreen
                            />
                          )
                        ) : (
                          <S.PlayOverlay
                            sx={{ backgroundImage: `url(${thumbnailUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                            onClick={() => setPlayingVideoId(vid.id)}
                          >
                            <S.PlayIconOverlay>
                              <S.PlayButtonContainer>
                                <PlayArrowIcon sx={{ fontSize: 40, color: '#ff0000' }} />
                              </S.PlayButtonContainer>
                            </S.PlayIconOverlay>
                          </S.PlayOverlay>
                        )}
                      </S.VideoContainer>
                      <CardContent sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexGrow: 1 }}>
                        <S.CardDetails>
                          <S.VideoTitle variant="subtitle1" noWrap title={vid.title}>
                            {vid.title}
                          </S.VideoTitle>
                          <S.PathCaption variant="caption">
                            {vid.path_heading}
                          </S.PathCaption>
                          <S.TopicText variant="body2" noWrap>
                            {vid.page_text}
                          </S.TopicText>
                        </S.CardDetails>
                        <S.ActionGroup>
                          <S.StyledIconButton color="primary" size="small" onClick={() => handleUpdateVideo(vid)}>
                            <RefreshIcon fontSize="small" />
                          </S.StyledIconButton>
                          <S.StyledIconButton color="error" size="small" onClick={() => handleDeleteVideo(vid.id)}>
                            <DeleteIcon fontSize="small" />
                          </S.StyledIconButton>
                        </S.ActionGroup>
                      </CardContent>
                    </S.VideoGridCard>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </CardContent>
      </S.GallerySection>

      {/* Edit Video Modal */}
      <Dialog
        open={editModalOpen}
        onClose={handleCloseEditModal}
        fullWidth
        maxWidth="sm"
        PaperProps={S.ModalPaperProps}
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
            
            <Box>
              <TextField
                fullWidth
                label="Video URL / Embed URL"
                value={editUrl}
                onChange={(e) => {
                  setEditUrl(e.target.value);
                  if (e.target.value) setEditFile(null);
                }}
                variant="outlined"
                helperText="Ensure this is a valid embeddable link"
                disabled={!!editFile}
              />
            </Box>

            <Divider sx={{ typography: 'body2', color: 'text.secondary', fontWeight: 'bold' }}>OR</Divider>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 'bold' }}>
                Upload New Video File
              </Typography>
              <S.UploadButton
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<CloudUploadIcon />}
                disabled={!!editUrl && editUrl !== editingVideo?.url}
              >
                {editFile ? editFile.name : "Select New Video File"}
                <input
                  type="file"
                  accept="video/*"
                  hidden
                  onChange={(e) => {
                    const selectedFile = e.target.files[0];
                    if (selectedFile) {
                      setEditFile(selectedFile);
                      setEditUrl('');
                    }
                  }}
                />
              </S.UploadButton>
              {editFile && (
                <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 1 }}>
                  * New file will replace the existing video
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseEditModal} color="inherit" sx={{ fontWeight: 'bold' }}>Cancel</Button>
          <S.PublishButton
            onClick={handleConfirmUpdate}
            variant="contained"
            sx={{ px: 4, mt: 0 }}
          >
            Update Tutorial
          </S.PublishButton>
        </DialogActions>
      </Dialog>
    </S.PageContainer>
  );
};

export default MediaManager;
