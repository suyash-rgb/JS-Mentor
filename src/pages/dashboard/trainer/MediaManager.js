import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Trash2, 
  RotateCw, 
  Play, 
  UploadCloud, 
  Video, 
  Filter, 
  X, 
  Loader2 
} from 'lucide-react';
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

    const ytRegExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const ytMatch = url.match(ytRegExp);
    if (ytMatch && ytMatch[2].length === 11) {
      return `https://img.youtube.com/vi/${ytMatch[2]}/mqdefault.jpg`;
    }

    if (url.includes('res.cloudinary.com')) {
      return url.replace(/\.[^/.]+$/, ".jpg").replace("/video/upload/", "/video/upload/so_auto,c_scale,w_500/");
    }

    return null;
  };

  const isYouTube = (url) => url && (url.includes('youtube.com') || url.includes('youtu.be'));

  const formatYouTubeUrl = (url) => {
    if (!url) return url;
    const ytRegExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(ytRegExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return url;
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
      let payload = new FormData();
      payload.append('title', videoTitle || (file ? file.name : "Tutorial Video"));

      if (file) {
        payload.append('file', file);
      } else {
        payload.append('url', formatYouTubeUrl(videoUrl));
      }

      await addVideo(selectedPath, selectedTopic, payload);

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
        payload.append('url', formatYouTubeUrl(editUrl));
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
    <div className="p-4 md:p-6 max-w-7xl mx-auto text-slate-800 dark:text-slate-100 space-y-8">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Video Tutorials</h1>
        <p className="text-sm text-slate-500 mt-1">Manage and publish educational multi-media content for your learning paths.</p>
      </div>

      {/* Grid Layout: Left Form, Right Gallery Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Add Video Section (Form Card) */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 lg:col-span-1">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-5">
            <Video className="h-5 w-5 text-indigo-600" />
            Add New Tutorial
          </h2>

          <div className="space-y-4">
            {/* Tutorial Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Tutorial Title</label>
              <input
                type="text"
                placeholder="e.g. Mastering Array Methods"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
              />
            </div>

            {/* YouTube URL */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Add YouTube URL</label>
              <input
                type="text"
                placeholder="https://www.youtube.com/embed/..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                disabled={!!file}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none disabled:bg-slate-50 dark:disabled:bg-slate-800/50 disabled:text-slate-400"
              />
            </div>

            {/* Divider "OR" */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink mx-4 text-xs font-bold text-slate-400">OR</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            {/* Local Video Upload */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Upload a Video</label>
              <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer text-center transition-colors ${
                file ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              } ${videoUrl ? 'opacity-50 pointer-events-none' : ''}`}>
                <UploadCloud className={`h-6 w-6 mb-2 ${file ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="text-xs font-medium max-w-[200px] truncate block">
                  {file ? file.name : "Select Video File"}
                </span>
                <input
                  type="file"
                  accept="video/*"
                  hidden
                  disabled={!!videoUrl}
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>
            </div>

            {/* Learning Path dropdown */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Select Learning Path</label>
              <select
                value={selectedPath}
                onChange={(e) => setSelectedPath(e.target.value)}
                disabled={loadingPaths}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
              >
                <option value="" disabled hidden>Assign to Learning Path</option>
                {pathNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            {/* Dynamic Topic Selection */}
            {selectedPath && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Select Topic</label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  disabled={loadingTopics || topics.length === 0}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                >
                  <option value="" disabled hidden>
                    {loadingTopics ? "Loading topics..." : "Assign to Topic"}
                  </option>
                  {topics.map((topicName) => (
                    <option key={topicName} value={topicName}>{topicName}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleAddVideo}
              disabled={isSubmitting || (!videoUrl && !file) || !selectedPath || !selectedTopic}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Publishing...
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" /> Save & Publish
                </>
              )}
            </button>
          </div>
        </div>

        {/* Video Gallery Container */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Gallery Header with Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <h3 className="text-lg font-bold">Published Tutorials</h3>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={filterPath}
                onChange={(e) => {
                  setFilterPath(e.target.value);
                  fetchVideos(e.target.value);
                }}
                className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="All">All Learning Paths</option>
                {pathNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Videos Grid */}
          {loadingVideos ? (
            <div className="flex justify-center items-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
          ) : videoList.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
              <Video className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-600 dark:text-slate-300">No Videos Found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Select a different filter option or use the creator dashboard on the left to publish new video tutorials.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {videoList.map((vid) => {
                const thumbnailUrl = getVideoThumbnail(vid.url);
                const isPlaying = playingVideoId === vid.id;
                const useNativeVideo = !isYouTube(vid.url);

                return (
                  <div key={vid.id || vid.url} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-all group">
                    
                    {/* Aspect Ratio Video Container */}
                    <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
                      {isPlaying || !thumbnailUrl ? (
                        useNativeVideo ? (
                          <video
                            src={vid.url}
                            controls
                            autoPlay
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <iframe
                            src={formatYouTubeUrl(vid.url)}
                            allowFullScreen
                            title={vid.title}
                            className="w-full h-full border-0 absolute top-0 left-0"
                          />
                        )
                      ) : (
                        <div 
                          onClick={() => setPlayingVideoId(vid.id)}
                          style={{ backgroundImage: `url(${thumbnailUrl})` }}
                          className="absolute inset-0 bg-cover bg-center cursor-pointer flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
                        >
                          {/* Play Button Overlay */}
                          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[1px] group-hover:bg-slate-900/40 transition-colors"></div>
                          <div className="relative h-12 w-12 flex items-center justify-center bg-white rounded-full shadow-lg text-rose-600 transform group-hover:scale-110 transition-transform duration-200">
                            <Play className="h-6 w-6 fill-rose-600 ml-0.5" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Meta Body Content */}
                    <div className="p-4 flex-1 flex items-start justify-between gap-3 text-sm">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate" title={vid.title}>
                          {vid.title}
                        </h4>
                        <span className="inline-block mt-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-400 px-2 py-0.5 rounded-md">
                          {vid.path_heading}
                        </span>
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          {vid.page_text}
                        </p>
                      </div>

                      {/* Video Actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleUpdateVideo(vid)}
                          className="p-1.5 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors"
                          title="Update video"
                        >
                          <RotateCw className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVideo(vid.id)}
                          className="p-1.5 border border-slate-100 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Delete content"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* Edit Video Modal (Dialog) */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Overlay Background */}
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={handleCloseEditModal}></div>
          
          {/* Modal Structure */}
          <div className="relative bg-white dark:bg-slate-900 rounded-xl max-w-md w-full shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold">Update Tutorial Details</h3>
              <button onClick={handleCloseEditModal} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content Scroll */}
            <div className="p-5 space-y-4 text-sm flex-1 overflow-y-auto">
              {/* Edit Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Tutorial Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                />
              </div>

              {/* Edit URL */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Video URL / Embed URL</label>
                <input
                  type="text"
                  value={editUrl}
                  disabled={!!editFile}
                  onChange={(e) => {
                    setEditUrl(e.target.value);
                    if (e.target.value) setEditFile(null);
                  }}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none disabled:bg-slate-50 dark:disabled:bg-slate-800/50"
                />
                <p className="text-[11px] text-slate-400 mt-1">Ensure this is a valid embeddable stream link</p>
              </div>

              {/* Divider "OR" */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-3 text-xs font-bold text-slate-400">OR</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              {/* Edit Upload File */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Upload New Video File</label>
                <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer text-center transition-colors ${
                  editFile ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                } ${editUrl && editUrl !== editingVideo?.url ? 'opacity-50 pointer-events-none' : ''}`}>
                  <UploadCloud className="h-6 w-6 text-slate-400 mb-2" />
                  <span className="text-xs font-medium max-w-[200px] truncate block">
                    {editFile ? editFile.name : "Select New Video File"}
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    hidden
                    disabled={!!editUrl && editUrl !== editingVideo?.url}
                    onChange={(e) => {
                      const selectedFile = e.target.files[0];
                      if (selectedFile) {
                        setEditFile(selectedFile);
                        setEditUrl('');
                      }
                    }}
                  />
                </label>
                {editFile && (
                  <span className="text-[10px] text-indigo-500 mt-1.5 block">* New file will replace the existing storage record.</span>
                )}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 rounded-b-xl">
              <button
                type="button"
                onClick={handleCloseEditModal}
                className="px-4 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUpdate}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-colors"
              >
                {isSubmitting ? 'Updating...' : 'Update Tutorial'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default MediaManager;