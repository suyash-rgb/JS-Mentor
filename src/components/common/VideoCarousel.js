import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const VideoCarousel = ({ videos }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!videos || videos.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
  };

  const currentVideo = videos[currentIndex];
  const isYouTube = (url) => url && (url.includes('youtube.com') || url.includes('youtu.be'));

  const getEmbedUrl = (url) => {
    if (!url) return url;
    const ytRegExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(ytRegExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return url;
  };

  return (
    <div className="videos-section mt-5">
      <h3 className="video-heading">📺 Video Tutorials</h3>
      <div className="section-divider"></div>
      
      <div className="video-carousel-container" style={{ position: 'relative', maxWidth: '800px', margin: '20px auto 30px', padding: '0 50px' }}>
        <div className="video-card">
          {currentVideo.title && <h4 style={{ marginBottom: '10px', textAlign: 'center' }}>{currentVideo.title}</h4>}
          {isYouTube(currentVideo.url) ? (
            <iframe 
              key={currentVideo.url}
              src={getEmbedUrl(currentVideo.url)} 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-100 rounded shadow-sm"
              style={{ width: '100%', aspectRatio: '16/9', maxHeight: '400px', backgroundColor: '#000', borderRadius: '8px', border: 'none' }}
              title={currentVideo.title || "Video Tutorial"}
            />
          ) : (
            <video 
              key={currentVideo.url}
              src={currentVideo.url} 
              controls 
              className="w-100 rounded shadow-sm"
              style={{ width: '100%', maxHeight: '400px', backgroundColor: '#000', borderRadius: '8px' }}
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
        
        {videos.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              style={{
                position: 'absolute',
                top: '50%',
                left: '0',
                transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <FaChevronLeft />
            </button>
            <button 
              onClick={handleNext}
              style={{
                position: 'absolute',
                top: '50%',
                right: '0',
                transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <FaChevronRight />
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '10px', color: '#666', fontSize: '0.9rem', fontWeight: 'bold' }}>
              Video {currentIndex + 1} of {videos.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoCarousel;
