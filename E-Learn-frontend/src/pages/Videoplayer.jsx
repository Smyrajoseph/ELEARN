import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaClipboardCheck } from 'react-icons/fa';
import { useProgress } from '../context/ProgressContext';
import videoService from '../services/videoService';
import Spinner from '../components/Spinner';
import '../styles/Videoplayer.css';
import lmsBg from '../assets/lms-bg.png';

const Videoplayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { markAsCompleted } = useProgress();
  
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [associatedQuiz, setAssociatedQuiz] = useState(null);

  useEffect(() => {
    const fetchVideoAndQuiz = async () => {
      try {
        setLoading(true);
        const videoData = await videoService.getVideoById(id);
        setVideo(videoData);

        // Search for associated quiz
        if (videoData.subject_id) {
          try {
            // Updated quiz search logic
            const importQuizService = (await import('../services/quizService')).default;
            const quizzes = await importQuizService.getQuizzesBySubject(videoData.subject_id);
            const quiz = (quizzes || []).find(q => String(q.after_video_id) === String(id));
            if (quiz) {
              setAssociatedQuiz(quiz);
            }
          } catch (quizErr) {
            console.log('No associated quiz found for this video');
          }
        }
      } catch (err) {
        console.error('Error fetching video:', err);
        setError('Video not found or failed to load');
        toast.error('Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVideoAndQuiz();
    }
  }, [id]);

  const handleAction = async () => {
    try {
      // Mark video as completed
      await markAsCompleted(video._id || video.id);
      
      // Update progress in backend if API available
      try {
        await videoService.updateVideoProgress(video._id || video.id, {
          completed: true,
          completedAt: new Date().toISOString()
        });
      } catch (error) {
        console.log('Progress update not available');
      }

      if (associatedQuiz) {
        navigate(`/quiz/${associatedQuiz._id || associatedQuiz.id}`);
      } else if (video.quiz) {
        // Support legacy video.quiz field if present
        navigate(`/quiz/${id}`);
      } else {
        toast.success('Video marked as completed!');
        navigate('/student');
      }
    } catch (error) {
      console.error('Error completing video:', error);
      toast.error('Failed to mark video as completed');
    }
  };

  if (loading) {
    return <Spinner message="Loading video..." />;
  }

  if (error || !video) {
    return (
      <div className="player-container">
        <div className="player-header">
          <button onClick={() => navigate('/student')} className="back-btn">
            <FaArrowLeft style={{ marginRight: '10px' }} /> Back to Dashboard
          </button>
        </div>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2>{error || 'Video not found'}</h2>
          <button onClick={() => navigate('/student')} className="quiz-btn" style={{ marginTop: '20px' }}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const videoUrl = video.url || video.video_url || video.videoUrl || '';
  const isYouTube = videoUrl.includes('youtube') || videoUrl.includes('youtu.be');
  
  // Construct full URL if it is a relative path like /files/...
  const videoSource = videoUrl.startsWith('http') || isYouTube
      ? videoUrl 
      : `http://localhost:5000${videoUrl}`;

  return (
    <div className="player-container" style={{ 
      minHeight: '100vh', 
      backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url(${lmsBg})`,
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
      backgroundPosition: 'center',
      color: 'white' 
    }}>
      <div className="player-header" style={{ 
        padding: '15px 20px', 
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        minHeight: '70px'
      }}>
        <button 
          onClick={() => navigate('/student')} 
          className="back-btn" 
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: '#3b82f6', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center',
            position: 'absolute',
            left: '20px',
            fontSize: '0.95rem',
            fontWeight: '500',
            transition: 'opacity 0.2s'
          }}
        >
          <FaArrowLeft style={{ marginRight: '8px' }} /> Back to Dashboard
        </button>
        <h1 className="player-title" style={{ 
          fontSize: '1.75rem', 
          margin: 0, 
          color: '#10b981', 
          fontWeight: '800',
          textTransform: 'lowercase',
          letterSpacing: '-0.02em'
        }}>
          {video.title}
        </h1>
      </div>

      <div className="video-wrapper">
        {isYouTube ? (
          <iframe
            src={videoUrl.includes('watch?v=') ? videoUrl.replace('watch?v=', 'embed/').split('&')[0] : videoUrl}
            title={video.title}
            className="video-iframe"
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <video
            src={videoSource}
            controls
            autoPlay
            className="video-player-element"
            style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'contain' }}
          >
            Your browser does not support the video tag.
          </video>
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
            {(associatedQuiz || video.quiz) ? (
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