import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockVideos } from '../data/mockData';
import { FaArrowLeft, FaClipboardCheck } from 'react-icons/fa';
import '../styles/Videoplayer.css';
import { useProgress } from '../context/ProgressContext';

const Videoplayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { markAsCompleted } = useProgress();

  // Get video from merged list
  const video = (() => {
    const saved = localStorage.getItem('teacherVideos');
    const teacherVideos = saved ? JSON.parse(saved) : [];
    const combined = [...mockVideos, ...teacherVideos];
    return combined.find(v => v.id === parseInt(id));
  })();

  if (!video) {
    return <div className="player-container"><h2>Video not found</h2></div>;
  }

  const handleAction = () => {
    if (video.quiz) {
      navigate(`/quiz/${id}`);
    } else {
      markAsCompleted(video.id);
      navigate('/student');
    }
  };

  return (
    <div className="player-container">
      <div className="player-header">
        <button onClick={() => navigate('/student')} className="back-btn">
          <FaArrowLeft style={{ marginRight: '10px' }} /> Back to Dashboard
        </button>
        <h1 className="player-title">{video.title}</h1>
      </div>

      <div className="video-wrapper">
        {video.isLocal || (!video.url.includes('youtube') && !video.url.includes('youtu.be')) ? (
          <video
            src={video.url}
            controls
            className="video-player-element"
            style={{ width: '100%', height: '100%', borderRadius: '8px' }}
          />
        ) : (
          <iframe
            src={video.url.includes('watch?v=') ? video.url.replace('watch?v=', 'embed/').split('&')[0] : video.url}
            title={video.title}
            className="video-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        )}
      </div>

      <div className="player-actions">
        <div className="player-info">
          <h2>{video.title}</h2>
          <p>{video.description}</p>
        </div>

        <div className="next-step">
          <p>Finished watching?</p>
          <button onClick={handleAction} className="quiz-btn">
            {video.quiz ? (
              <>
                <FaClipboardCheck style={{ marginRight: '10px' }} />
                Take Quiz to Unlock Next Module
              </>
            ) : (
              <>
                <FaClipboardCheck style={{ marginRight: '10px' }} />
                Mark as Completed
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Videoplayer;