import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaLock, FaPlay, FaChartLine, FaSignOutAlt, FaHome } from 'react-icons/fa';
import { mockVideos } from '../../../data/mockData';
import { useProgress } from '../../../context/ProgressContext';
import '../../../styles/StudentDashboard.css';
import '../../../App.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { isUnlocked, completedVideos } = useProgress();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("All");

  // Get selected course from localStorage
  const currentCourse = localStorage.getItem('selectedCourse') || "B.Sc Information Technology";

  // Merge mock videos with teacher-uploaded videos
  const [videos] = useState(() => {
    const saved = localStorage.getItem('teacherVideos');
    const teacherVideos = saved ? JSON.parse(saved) : [];

    // Filter mock videos for the current course
    const courseMockVideos = mockVideos.filter(v => v.course === currentCourse);

    const combined = [...courseMockVideos];
    teacherVideos.forEach(tv => {
      if (!combined.find(v => v.id === tv.id)) {
        // Assign a default subject if none exists
        combined.push({ ...tv, subject: tv.subject || "Teacher Uploads" });
      }
    });
    return combined;
  });

  // Unique Subjects for filtering
  const subjects = ["All", ...new Set(videos.map(v => v.subject).filter(Boolean))];

  // Filtered Videos
  const filteredVideos = selectedSubject === "All"
    ? videos
    : videos.filter(v => v.subject === selectedSubject);

  // Progress Calculations (always based on total available)
  const totalVideos = videos.length;
  const completedCount = videos.filter(v => completedVideos.includes(v.id)).length;
  const progressPercentage = totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0;

  // Mock Student Data State
  const [studentData] = useState(() => {
    const saved = localStorage.getItem('studentProfile');
    const profile = saved ? JSON.parse(saved) : null;
    return {
      name: profile?.name || "Smyra Johnson",
      gender: profile?.gender || "Female",
      email: profile?.email || "smyra.johnson@example.com",
      course: currentCourse,
      photo: profile?.photo || null,
      isApproved: profile?.isApproved ?? true // Default true for existing mock data, false for new signups
    };
  });

  const handleLogout = () => {
    localStorage.removeItem('selectedCourse'); // Clear selection on logout
    navigate('/signup');
  };

  // Approval Guard
  if (!studentData.isApproved) {
    return (
      <div className="dashboard-container" style={{ justifyContent: 'center', alignItems: 'center', background: '#FFFDD0' }}>
        <div className="card" style={{ maxWidth: '500px', textAlign: 'center', padding: '40px', background: 'white', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
          <div style={{ background: '#fef3c7', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
            <FaLock size={40} color="#d97706" />
          </div>
          <h1 style={{ color: '#006D5B', marginBottom: '15px' }}>Account Pending Approval</h1>
          <p style={{ color: '#666', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '25px' }}>
            hello <strong>{studentData.name}</strong>! Your request to join the <strong>{studentData.course}</strong> course has been sent to the teacher.
          </p>
          <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '8px', border: '1px solid #c6f6d5', color: '#166534', fontSize: '0.9rem', marginBottom: '30px' }}>
            Please wait for the teacher to verify your enrollment. You will gain access to videos and quizzes once approved.
          </div>
          <button onClick={handleLogout} className="btn btn-primary" style={{ width: '100%' }}>
            <FaSignOutAlt /> Log Out
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="dashboard-container">
      {/* Progress Tracker Modal (Unchanged) */}
      {showProgress && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Learning Statistics</h2>
              <button onClick={() => setShowProgress(false)} className="close-btn">&times;</button>
            </div>

            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div className="progress-circle">
                <span className="progress-text">{progressPercentage}%</span>
              </div>
              <h3 style={{ marginTop: '20px', color: '#006D5B' }}>
                {completedCount} / {totalVideos} Modules Completed
              </h3>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
              </div>
              <p style={{ color: '#666', marginTop: '15px' }}>
                {progressPercentage === 100
                  ? "Congratulations! You've completed all modules!"
                  : "Keep going! You're doing great."}
              </p>
            </div>

            <button onClick={() => setShowProgress(false)} className="modal-close-btn">Close</button>
          </div>
        </div>
      )}

      {/* Sidebar (Unchanged) */}
      <div
        className="sidebar"
        style={{ width: isSidebarOpen ? '250px' : '70px' }}
        onMouseEnter={() => setIsSidebarOpen(true)}
        onMouseLeave={() => setIsSidebarOpen(false)}
      >
        <button
          className="profile-button"
          onClick={() => navigate('/student/profile')}
          title="View Profile"
        >
          {studentData.photo ? (
            <img src={studentData.photo} alt="Profile" className="sidebar-profile-img" />
          ) : (
            <FaUserCircle size={40} color="#FFFDD0" />
          )}
          {isSidebarOpen && <span className="username">{studentData.name}</span>}
        </button>

        <div className="nav-items">
          <div className="nav-item">
            <FaHome size={24} className="nav-icon" />
            {isSidebarOpen && <span>Dashboard</span>}
          </div>
          <div className="nav-item" onClick={() => setShowProgress(true)}>
            <FaChartLine size={24} className="nav-icon" />
            {isSidebarOpen && <span>Statistics</span>}
          </div>
        </div>

        <div className="logout-section" onClick={handleLogout}>
          <FaSignOutAlt size={24} className="nav-icon" />
          {isSidebarOpen && <span>Logout</span>}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="content-area">
        <div className="dashboard-header-modern">
          <div className="course-banner">
            <span className="course-label">Enrolled Course</span>
            <h1 className="course-name">{studentData.course}</h1>
          </div>

          <div className="subject-selector">
            <span className="subject-label">Filter by Subject:</span>
            <div className="subject-tabs">
              {subjects.map(subject => (
                <button
                  key={subject}
                  className={`subject-tab ${selectedSubject === subject ? 'active' : ''}`}
                  onClick={() => setSelectedSubject(subject)}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid">
          {filteredVideos.map((video) => {
            const isLocked = !isUnlocked(video.id);
            return (
              <div key={video.id} className="card-custom">
                {/* Thumbnail */}
                <div className="thumbnail">
                  {isLocked ? (
                    <div className="text-center">
                      <FaLock size={30} style={{ marginBottom: '10px' }} />
                      <p>Locked</p>
                    </div>
                  ) : (
                    <Link to={`/video/${video.id}`} style={{ color: 'white' }}>
                      <FaPlay size={40} />
                    </Link>
                  )}
                  <span className="subject-badge">{video.subject}</span>
                </div>

                {/* Content */}
                <div className="card-content" style={{ padding: '20px' }}>
                  <h3 className="card-title">{video.title}</h3>
                  <p className="card-desc">{video.description}</p>

                  {isLocked ? (
                    <button className="disabled-btn" disabled>Complete Previous Task</button>
                  ) : (
                    <Link to={`/video/${video.id}`}>
                      <button className="start-btn">Start Module</button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;