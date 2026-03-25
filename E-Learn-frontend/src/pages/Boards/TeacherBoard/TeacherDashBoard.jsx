import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaHome, FaUpload, FaSignOutAlt, FaVideo, FaUsers, FaCheck, FaTimes, FaBook, FaUserGraduate, FaTrophy, FaTrash, FaQuestionCircle } from 'react-icons/fa';
import { mockVideos } from '../../../data/mockData';
import '../../../App.css';
import '../../../styles/TeacherDashboard.css';

import { toast } from 'react-toastify';
import UploadContent from './UploadContent';
import AddCourse from './AddCourse';
import StudentRequests from './StudentRequests';
import UploadQuiz from './UploadQuiz';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'upload', 'quiz', 'add-course', 'requests'

  const [videos, setVideos] = useState(() => {
    const saved = localStorage.getItem('teacherVideos');
    return saved ? JSON.parse(saved) : mockVideos;
  });

  const [pendingRequests, setPendingRequests] = useState(() => {
    return JSON.parse(localStorage.getItem('pendingStudentRequests') || '[]');
  });

  const [customCourses, setCustomCourses] = useState(() => {
    return JSON.parse(localStorage.getItem('customCourses') || '[]');
  });

  const [enrolledStudents, setEnrolledStudents] = useState(() => {
    return JSON.parse(localStorage.getItem('enrolledStudents') || '[]');
  });

  const [teacherData] = useState(() => {
    const saved = localStorage.getItem('teacherProfile');
    return saved ? JSON.parse(saved) : { name: "Instructor" };
  });

  const handleLogout = () => {
    navigate('/login');
  };

  const handleAddCourse = (e) => {
    e.preventDefault();
    const title = e.target.elements.courseTitle.value;
    const description = e.target.elements.courseDescription.value;

    const newCourse = {
      id: Date.now(),
      title,
      description
    };

    const updatedCourses = [...customCourses, newCourse];
    setCustomCourses(updatedCourses);
    localStorage.setItem('customCourses', JSON.stringify(updatedCourses));

    toast.success('New course added successfully!');
    e.target.reset();
  };

  const handleApprove = (requestId) => {
    const approvedRequest = pendingRequests.find(r => r.id === requestId);
    const updatedRequests = pendingRequests.filter(r => r.id !== requestId);

    // Update pending list
    localStorage.setItem('pendingStudentRequests', JSON.stringify(updatedRequests));
    setPendingRequests(updatedRequests);

    // Move to Enrolled Students list
    const studentList = JSON.parse(localStorage.getItem('enrolledStudents') || '[]');
    const newStudent = {
      ...approvedRequest,
      enrolledAt: new Date().toISOString(),
      quizCompleted: Math.random() > 0.5 // Mock: randomly assign completion for demo
    };

    if (!studentList.find(s => s.email === newStudent.email)) {
      const updatedList = [...studentList, newStudent];
      localStorage.setItem('enrolledStudents', JSON.stringify(updatedList));
      setEnrolledStudents(updatedList);
    }

    // Update global Student Profile if it matches this email (mock logic)
    const profile = JSON.parse(localStorage.getItem('studentProfile') || '{}');
    if (profile.email === approvedRequest.email) {
      profile.isApproved = true;
      localStorage.setItem('studentProfile', JSON.stringify(profile));
    }

    toast.success(`${approvedRequest.name} has been approved!`);
  };

  const handleReject = (requestId) => {
    const updatedRequests = pendingRequests.filter(r => r.id !== requestId);
    const rejectedRequest = pendingRequests.find(r => r.id === requestId);

    localStorage.setItem('pendingStudentRequests', JSON.stringify(updatedRequests));
    setPendingRequests(updatedRequests);

    toast.warning(`${rejectedRequest.name} has been rejected.`);
  };

  const handleUploadSuccess = (newVideo) => {
    const updatedVideos = [...videos, newVideo];
    setVideos(updatedVideos);

    // Store in localStorage (Note: local Blob URLs won't work after refresh, but YouTube links will)
    localStorage.setItem('teacherVideos', JSON.stringify(updatedVideos));

    toast.success('Video uploaded successfully!');
  };

  const handleDeleteVideo = (videoId) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      const updatedVideos = videos.filter(v => v.id !== videoId);
      setVideos(updatedVideos);
      localStorage.setItem('teacherVideos', JSON.stringify(updatedVideos));
      toast.info('Video deleted successfully');
    }
  };

  const handleQuizUploadSuccess = (videoId, quizData) => {
    const updatedVideos = videos.map(v => {
      if (v.id === videoId) {
        return { ...v, quiz: quizData };
      }
      return v;
    });

    setVideos(updatedVideos);
    localStorage.setItem('teacherVideos', JSON.stringify(updatedVideos));
    toast.success('Quiz attached to video successfully!');
    setActiveTab('dashboard'); // Redirect to dashboard to see changes
  };

  return (
    <div className="teacher-page-container">
      {/* Sidebar Navigation */}
      <div
        className="teacher-sidebar"
        style={{ width: isSidebarHovered ? '280px' : '80px' }}
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      >
        {/* Sidebar Header / Profile */}
        <div className="teacher-sidebar-header" onClick={() => navigate('/teacher/profile')} style={{ cursor: 'pointer' }}>
          {teacherData.photo ? (
            <img src={teacherData.photo} alt="Profile" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', minWidth: 40 }} />
          ) : (
            <FaUserCircle size={40} color="#FFFDD0" style={{ minWidth: 40 }} />
          )}
          <div className={`teacher-sidebar-profile-text ${isSidebarHovered ? 'visible' : 'hidden'}`}>
            <span className="welcome-text">Welcome,</span>
            <span className="name-text">{teacherData.name.split(' ')[0]}</span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="nav-container">
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <FaHome size={24} color="#FFFDD0" style={{ minWidth: 24 }} />
            <span className={`nav-text ${isSidebarHovered ? 'visible' : 'hidden'}`}>Dashboard</span>
          </div>

          <div className={`nav-item ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}>
            <FaUpload size={24} color="#FFFDD0" style={{ minWidth: 24 }} />
            <span className={`nav-text ${isSidebarHovered ? 'visible' : 'hidden'}`}>Upload Video</span>
          </div>

          <div className={`nav-item ${activeTab === 'quiz' ? 'active' : ''}`} onClick={() => setActiveTab('quiz')}>
            <FaQuestionCircle size={24} color="#FFFDD0" style={{ minWidth: 24 }} />
            <span className={`nav-text ${isSidebarHovered ? 'visible' : 'hidden'}`}>Upload Quiz</span>
          </div>

          <div className={`nav-item ${activeTab === 'add-course' ? 'active' : ''}`} onClick={() => setActiveTab('add-course')}>
            <FaBook size={24} color="#FFFDD0" style={{ minWidth: 24 }} />
            <span className={`nav-text ${isSidebarHovered ? 'visible' : 'hidden'}`}>Add Course</span>
          </div>

          <div className={`nav-item ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
            <div style={{ position: 'relative' }}>
              <FaUsers size={24} color="#FFFDD0" style={{ minWidth: 24 }} />
              {pendingRequests.length > 0 && (
                <span style={{ position: 'absolute', top: -10, right: -5, background: '#ff4d4d', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem' }}>
                  {pendingRequests.length}
                </span>
              )}
            </div>
            <span className={`nav-text ${isSidebarHovered ? 'visible' : 'hidden'}`}>Student Requests</span>
          </div>

        </div>

        {/* Logout */}
        <div className="logout-item" onClick={handleLogout}>
          <FaSignOutAlt size={24} color="#FFFDD0" style={{ minWidth: 24 }} />
          <span className={`nav-text ${isSidebarHovered ? 'visible' : 'hidden'}`}>Logout</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="teacher-main-content">
        <div className="teacher-header">
          <h1 className="teacher-title">
            {activeTab === 'dashboard' && "Teacher's Dashboard"}
            {activeTab === 'upload' && 'Upload New Video'}
            {activeTab === 'quiz' && 'Create Video Quiz'}
            {activeTab === 'add-course' && 'Manage Courses'}
            {activeTab === 'requests' && 'Student Approval Panel'}
          </h1>
        </div>

        {/* Student Requests Section (Extracted Component) */}
        {activeTab === 'requests' && (
          <StudentRequests
            requests={pendingRequests}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}

        {/* Add Course Section (Extracted Component) */}
        {activeTab === 'add-course' && (
          <AddCourse onAddCourse={handleAddCourse} />
        )}

        {/* Upload Content Section */}
        {/* Upload Content Section (Extracted Component) */}
        {activeTab === 'upload' && (
          <UploadContent onUploadSuccess={handleUploadSuccess} />
        )}

        {/* Upload Quiz Section (Extracted Component) */}
        {activeTab === 'quiz' && (
          <UploadQuiz videos={videos} onQuizSuccess={handleQuizUploadSuccess} />
        )}

        {/* Dashboard Section (Stats & Video List) */}
        {activeTab === 'dashboard' && (
          <div id="dashboard-section" className="dashboard-section">
            {/* Stats Section */}
            <div className="stats-container" style={{ display: 'flex', gap: '20px', marginBottom: '20px', padding: '0 20px' }}>
              <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                <div style={{ background: '#e0f2f1', padding: '15px', borderRadius: '50%' }}>
                  <FaVideo size={24} color="#008080" />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#333', fontSize: '1.2rem' }}>Total Videos</h3>
                  <p style={{ margin: '5px 0 0 0', color: '#008080', fontSize: '1.8rem', fontWeight: 'bold' }}>{videos.length}</p>
                </div>
              </div>

              <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                <div style={{ background: '#fff9c4', padding: '15px', borderRadius: '50%' }}>
                  <FaUserGraduate size={24} color="#fbc02d" />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#333', fontSize: '1.2rem' }}>Enrolled Students</h3>
                  <p style={{ margin: '5px 0 0 0', color: '#fbc02d', fontSize: '1.8rem', fontWeight: 'bold' }}>{enrolledStudents.length}</p>
                </div>
              </div>

              <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '50%' }}>
                  <FaTrophy size={24} color="#1976d2" />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#333', fontSize: '1.2rem' }}>Quizzes Completed</h3>
                  <p style={{ margin: '5px 0 0 0', color: '#1976d2', fontSize: '1.8rem', fontWeight: 'bold' }}>
                    {enrolledStudents.filter(s => s.quizCompleted).length}
                  </p>
                </div>
              </div>
            </div>

            {/* Uploaded Videos List */}
            <div className="videos-list" style={{ padding: '0 20px', marginBottom: '40px' }}>
              <h2 className="card-title" style={{ marginBottom: '20px', padding: '0' }}>Uploaded Videos</h2>
              <div className="video-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {videos.map((video) => (
                  <div key={video.id} className="video-card" style={{ background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <h4 style={{ margin: 0, color: '#008080', flex: 1 }}>{video.title}</h4>
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '5px' }}
                        title="Delete Video"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                    <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '0.9rem' }}>{video.description}</p>
                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '4px', background: '#000' }}>
                      {video.isLocal || (!video.url.includes('youtube') && !video.url.includes('youtu.be')) ? (
                        <video
                          src={video.url}
                          controls
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                        />
                      ) : (
                        <iframe
                          src={video.url.replace('watch?v=', 'embed/').split('&')[0]}
                          title={video.title}
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;