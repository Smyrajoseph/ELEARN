import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaLock, FaPlay, FaChartLine, FaSignOutAlt, FaHome, FaTimes, FaClipboardList, FaBookOpen, FaClipboardCheck, FaClock, FaLayerGroup } from 'react-icons/fa';
import useActivityTimer from '../../../hooks/useActivityTimer';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/AuthContext';
import { useProgress } from '../../../context/ProgressContext';
import enrollmentService from '../../../services/enrollmentService';
import videoService from '../../../services/videoService';
import subjectService from '../../../services/subjectService';
import Spinner from '../../../components/Spinner';
import EnrollmentRequest from '../../Auth/EnrollmentRequest';
import '../../../styles/StudentDashboardModern.css';
import '../../../App.css';
import '../../Auth/Auth.css';


const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { completedVideos, totalTimeSpent, quizzesSolved, isUnlocked } = useProgress();

  // Track user activity time
  useActivityTimer();

  // HELPER: Match years with aliases (e.g. "Year 1" matches "First Year (FY)")
  const isYearMatch = (dataYear, studentYear) => {
    const dY = String(dataYear || '').toLowerCase().trim();
    const sY = String(studentYear || '').toLowerCase().trim();
    
    if (dY === sY || !sY || dY === '' || dY === 'no year' || dY === 'default') return true;
    
    // New: Case for empty data labels if they are meant to be 'default'
    if (dY === '' && (sY === 'default' || sY === '')) return true;

    const isFirst = (sY === 'default' || sY.includes('1') || sY.includes('first'));
    const dataIsFirst = (dY.includes('1') || dY.includes('first') || dY.includes('fy'));
    if (isFirst && dataIsFirst) return true;

    const isSecond = (sY.includes('2') || sY.includes('second'));
    const dataIsSecond = (dY.includes('2') || dY.includes('second') || dY.includes('sy'));
    if (isSecond && dataIsSecond) return true;

    const isThird = (sY.includes('3') || sY.includes('third'));
    const dataIsThird = (dY.includes('3') || dY.includes('third') || dY.includes('ty'));
    if (isThird && dataIsThird) return true;

    return false;
  };

  const [showEnrollmentRequest, setShowEnrollmentRequest] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'subjects', 'statistics'
  const [viewingSubject, setViewingSubject] = useState(null); // Full subject object for detail view
  const [subjectNote, setSubjectNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [selectedSubject] = useState("All");

  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [videos, setVideos] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [courseSubjects, setCourseSubjects] = useState([]);
  const [subjectQuizzes, setSubjectQuizzes] = useState({});
  const [currentCourse, setCurrentCourse] = useState(null);

  // Fetch enrollments and videos
  const fetchStudentData = async () => {
    try {
      setLoading(true);

      // Fetch student's enrollments
      const enrollmentData = await enrollmentService.getMyEnrollments();
      setEnrollments(enrollmentData);

      if (enrollmentData && enrollmentData.length > 0) {
        // Get the first enrolled course
        const firstEnrollment = enrollmentData[0];
        const courseId = firstEnrollment.course_id || firstEnrollment.course?._id;
        const studentYear = firstEnrollment.year_id;

        // Set current course (handle populated vs unpopulated)
        setCurrentCourse(firstEnrollment.course || { title: `Course ID: ${courseId}`, _id: courseId });

        console.log('📝 ENROLLMENT SYNC DEBUG:', {
          studentId: user?.id,
          courseId,
          studentYear,
          hasEnrollment: !!firstEnrollment
        });

            // Fetch all content (videos and documents)
            const allContentData = await videoService.getCourseVideos(courseId);

            // Filter by academic year
            const yearSpecificContent = (allContentData || []).filter(v => 
              isYearMatch(v.year_id || v.year, studentYear)
            );

            // Separate videos and documents
            const videoFiles = yearSpecificContent.filter(v => v.type === 'video' || !v.type);
            const docFiles = yearSpecificContent.filter(v => v.type === 'document' || v.type === 'pdf');

            setVideos(videoFiles);
            setDocuments(docFiles);

            // Fetch curriculum and notify about diagnostics
            console.log('🎬 CONTENT SYNC DEBUG:', {
              studentYear,
              totalFetched: allContentData.length,
              videos: videoFiles.length,
              documents: docFiles.length
            });

            // Add Diagnostic Toast
            if (allContentData.length === 0) {
              toast.info(`Sync Info: ${courseId} | Year: ${studentYear} | Raw: 0`);
            } else if (yearSpecificContent.length === 0) {
              toast.info(`Sync Info: ${allContentData.length} items found, but none match '${studentYear}'`);
            }

            // FETCH ALL SUBJECTS FOR THE CURRICULUM AND QUIZZES
            try {
              const allCurriculumSubjects = await subjectService.getSubjectsByCourse(courseId);
              
              const yearCurriculum = (allCurriculumSubjects || []).filter(s => 
                isYearMatch(s.year_id || s.year, studentYear)
              );
              
              setCourseSubjects(yearCurriculum);

              // Also fetch quizzes for the full year curriculum
              const quizService = (await import('../../../services/quizService')).default;
              const allSubjectIds = [...new Set(yearCurriculum.map(s => s._id || s.id).filter(Boolean))];
              
              if (allSubjectIds.length > 0) {
                const quizzesPromises = allSubjectIds.map(sid => quizService.getQuizzesBySubject(sid).catch(() => []));
                const quizzesResults = await Promise.all(quizzesPromises);
                const quizMap = {};
                yearCurriculum.forEach((s, idx) => {
                  quizMap[s._id] = quizzesResults[idx] || [];
                });
                setSubjectQuizzes(quizMap);
              }
            } catch (err) {
              console.error('Curriculum/Quiz fetch error:', err);
            }
        }
    } catch (error) {
      console.error('Error fetching student data:', error);
      const savedCourse = localStorage.getItem('selectedCourse') || "B.Sc Information Technology";
      setCurrentCourse({ title: savedCourse });
      toast.warning('Using offline mode. Some features may be limited.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Note Auto-save
  useEffect(() => {
    if (!viewingSubject) return;

    const saveNote = async () => {
      try {
        const noteService = (await import('../../../services/noteService')).default;
        setIsSavingNote(true);
        await noteService.saveNote(viewingSubject._id, subjectNote);
        setTimeout(() => setIsSavingNote(false), 800);
      } catch (err) {
        console.error('Note save error:', err);
        setIsSavingNote(false);
        toast.error('Failed to auto-save note. Please check your connection.');
      }
    };

    const timeoutId = setTimeout(saveNote, 1500); // Save after 1.5 seconds of inactivity
    return () => clearTimeout(timeoutId);
  }, [subjectNote, viewingSubject]);

  // Load Note when subject detail opens
  const handleSubjectClick = async (subject) => {
    if (!subject) return;
    setViewingSubject(subject);
    try {
      const noteService = (await import('../../../services/noteService')).default;
      const note = await noteService.getNote(subject._id);
      setSubjectNote(note?.content || '');
    } catch (err) {
      console.error('Note load error:', err);
      setSubjectNote('');
    }
  };

  // Fetch enrollments and videos on mount
  useEffect(() => {
    if (user) {
      fetchStudentData();
    }
  }, [user]);

  // Unique Subjects for filtering (Show ALL curriculum subjects)
  const subjects = ["All", ...new Set(courseSubjects.map(s => s.name).filter(Boolean))];

  // Filtered Videos
  const filteredVideos = selectedSubject === "All"
    ? videos
    : videos.filter(v => (v.subject?.name || v.subject_id) === selectedSubject);

  // Progress Calculations (always based on total available)
  const totalVideos = videos.length;
  const completedCount = videos.filter(v => completedVideos.includes(v._id || v.id)).length;
  const progressPercentage = totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0;

  const handleLogout = async () => {
    await logout();
    toast.info('Logged out successfully');
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.header-profile')) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  // Check if user has pending enrollments
  const hasPendingEnrollment = enrollments.some(e => e.status === 'pending');
  const isApproved = enrollments.some(e => e.status === 'accepted');
  const hasRejectedEnrollment = enrollments.some(e => e.status === 'rejected');

  if (loading) {
    return <Spinner message="Loading your dashboard..." />;
  }

  if (showEnrollmentRequest) {
    return (
      <EnrollmentRequest
        onRequestSent={() => {
          setShowEnrollmentRequest(false);
          // Refresh enrollments
          fetchStudentData();
        }}
        onCancel={() => setShowEnrollmentRequest(false)}
      />
    );
  }

  // Approval Guard - Show if no approved enrollments
  if (!isApproved) {
    if (hasPendingEnrollment) {
      return (
        <div className="auth-container">
          <div className="card auth-box" style={{ maxWidth: '500px', textAlign: 'center', padding: '40px' }}>
            <div style={{ background: '#fef3c7', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <FaLock size={40} color="#d97706" />
            </div>
            <h1 style={{ color: '#006D5B', marginBottom: '15px' }}>Account Pending Approval</h1>
            <p style={{ color: '#666', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '25px' }}>
              Hello <strong>{user?.name}</strong>! Your enrollment request has been sent to the teacher.
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

    if (hasRejectedEnrollment) {
      return (
        <div className="auth-container">
          <div className="card auth-box" style={{ maxWidth: '500px', textAlign: 'center', padding: '40px' }}>
            <div style={{ background: '#fee2e2', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <FaTimes size={40} color="#dc2626" />
            </div>
            <h1 style={{ color: '#006D5B', marginBottom: '15px' }}>Enrollment Rejected</h1>
            <p style={{ color: '#666', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '25px' }}>
              Hello <strong>{user?.name}</strong>! Your request to join the course was declined.
            </p>
            <div style={{ background: '#fef2f2', padding: '15px', borderRadius: '8px', border: '1px solid #fecaca', color: '#991b1b', fontSize: '0.9rem', marginBottom: '30px' }}>
              Please contact the instructor if you believe this was a mistake, or you can request enrollment in a different course.
            </div>
            <button onClick={() => setShowEnrollmentRequest(true)} className="btn btn-primary" style={{ width: '100%', marginBottom: '10px' }}>
              Request Enrollment Again
            </button>
            <button onClick={handleLogout} className="btn" style={{ width: '100%', background: '#e5e7eb', color: '#374151', border: 'none' }}>
              <FaSignOutAlt /> Log Out
            </button>
          </div>
        </div>
      );
    }
  }

  if (enrollments.length === 0) {
    return (
      <div className="auth-container">
        <div className="card auth-box" style={{ maxWidth: '500px', textAlign: 'center', padding: '40px' }}>
          <h1 style={{ color: '#006D5B', marginBottom: '15px' }}>Welcome, {user?.name}!</h1>
          <p style={{ color: '#666', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '25px' }}>
            You haven't enrolled in any courses yet.
          </p>
          <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '8px', border: '1px solid #c6f6d5', color: '#166534', fontSize: '0.9rem', marginBottom: '30px' }}>
            Start your learning journey by requesting enrollment in one of our courses.
          </div>
          <button
            onClick={() => setShowEnrollmentRequest(true)}
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '10px' }}
          >
            📚 Request Enrollment
          </button>
          <button onClick={handleLogout} className="btn" style={{ width: '100%', background: '#e5e7eb', color: '#374151', border: 'none' }}>
            <FaSignOutAlt /> Log Out
          </button>
        </div>
      </div>
    );
  }

  // HEADER (Navbar)
  const renderHeader = () => (
    <nav className="wireframe-header">
      <div className="header-logo">
        <FaHome size={30} style={{ marginRight: '10px' }} />
        <span>Student Portal</span>
      </div>
      <div className="header-links">
        <span className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>My Videos</span>
        <span className={activeTab === 'documents' ? 'active' : ''} onClick={() => setActiveTab('documents')}>Lessons</span>
        <span className={activeTab === 'subjects' ? 'active' : ''} onClick={() => setActiveTab('subjects')}>Subjects</span>
        <span className={activeTab === 'statistics' ? 'active' : ''} onClick={() => setActiveTab('statistics')}>Statistics</span>
      </div>
      <div 
        className="header-profile" 
        onClick={() => setShowProfileDropdown(!showProfileDropdown)} 
        style={{ cursor: 'pointer', position: 'relative' }}
      >
        {user?.photo ? (
          <img src={user.photo} alt="Profile" className="sidebar-profile-img" style={{ width: '26px', height: '26px', borderRadius: '50%' }} />
        ) : (
          <FaUserCircle size={26} />
        )}
        <span>{user?.name || 'Student'}</span>
        <FaSignOutAlt size={22} className="logout-icon" onClick={(e) => { e.stopPropagation(); handleLogout(); }} title="Logout" />

        {showProfileDropdown && (
          <div className="profile-dropdown-card slide-in" onClick={(e) => e.stopPropagation()}>
            <div className="dropdown-header">
              <div className="dropdown-avatar">
                {user?.photo ? (
                  <img src={user.photo} alt="User" />
                ) : (
                  <FaUserCircle size={50} color="#10b981" />
                )}
              </div>
              <div className="dropdown-user-info">
                <h4>{user?.name || 'Student'}</h4>
                <p>{user?.email || 'No email provided'}</p>
              </div>
            </div>
            <div className="dropdown-divider"></div>
            <div className="dropdown-course-info">
              <span className="dropdown-label">Enrolled Course:</span>
              <div className="dropdown-course-name">
                {currentCourse?.title || currentCourse?.name || 'Loading course...'}
              </div>
            </div>
            <div className="dropdown-actions">
              <button className="wf-btn-outline" onClick={() => navigate('/student/profile')}>
                <FaUserCircle style={{ marginRight: '8px' }} /> View Full Profile
              </button>
              <button className="wf-btn-outline logout-btn" onClick={handleLogout}>
                <FaSignOutAlt style={{ marginRight: '8px' }} /> Log Out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );

  // SIDEBAR (Student Tools)
  const renderSidebar = () => (
    <aside className="wireframe-sidebar">
      <h3>Learning Tools</h3>
      <ul>
        <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
          <FaPlay /> My Videos
        </li>
        <li className={activeTab === 'documents' ? 'active' : ''} onClick={() => setActiveTab('documents')}>
          <FaBookOpen /> My Lessons
        </li>
        <li className={activeTab === 'subjects' ? 'active' : ''} onClick={() => setActiveTab('subjects')}>
          <FaClipboardList /> Subjects
        </li>
        <li className={activeTab === 'statistics' ? 'active' : ''} onClick={() => setActiveTab('statistics')}>
          <FaChartLine /> Statistics
        </li>
        <li onClick={() => navigate('/student/profile')}>
          <FaUserCircle /> My Profile
        </li>
        <hr style={{ margin: '15px 0', borderColor: 'rgba(255,255,255,0.1)' }} />
        <li onClick={handleLogout} style={{ color: '#f87171' }}>
          <FaSignOutAlt /> Logout
        </li>
      </ul>
    </aside>
  );

  // Main Guard Logic
  const renderGuardContent = () => {
    if (!isApproved) {
      if (hasPendingEnrollment) {
        return (
          <div className="wireframe-section slide-in center-form" style={{ marginTop: '50px' }}>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ background: '#fef3c7', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                <FaLock size={40} color="#d97706" />
              </div>
              <h1 style={{ color: '#111827', marginBottom: '15px', fontWeight: '800' }}>Account Pending Approval</h1>
              <p style={{ color: '#4b5563', fontSize: '1.1rem', marginBottom: '25px' }}>
                Hello <strong>{user?.name}</strong>! Your enrollment request is being reviewed by the teacher.
              </p>
              <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', color: '#374151', marginBottom: '30px' }}>
                You will gain access to your curriculum once the teacher approves your request.
              </div>
              <button onClick={handleLogout} className="wf-btn-large">
                <FaSignOutAlt style={{ marginRight: '8px' }} /> Log Out
              </button>
            </div>
          </div>
        );
      }

      if (hasRejectedEnrollment) {
        return (
          <div className="wireframe-section slide-in center-form" style={{ marginTop: '50px' }}>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ background: '#fee2e2', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                <FaTimes size={40} color="#dc2626" />
              </div>
              <h1 style={{ color: '#111827', marginBottom: '15px', fontWeight: '800' }}>Enrollment Rejected</h1>
              <p style={{ color: '#4b5563', fontSize: '1.1rem', marginBottom: '25px' }}>
                Your request to join the course was declined.
              </p>
              <button onClick={() => setShowEnrollmentRequest(true)} className="wf-btn-large" style={{ marginBottom: '15px' }}>
                Request Enrollment Again
              </button>
              <button onClick={handleLogout} className="wf-btn-outline" style={{ width: '100%' }}>
                Log Out
              </button>
            </div>
          </div>
        );
      }
    }

    if (enrollments.length === 0) {
      return (
        <div className="wireframe-section slide-in center-form" style={{ marginTop: '50px' }}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h1 style={{ color: '#111827', marginBottom: '15px', fontWeight: '800' }}>Welcome, {user?.name}!</h1>
            <p style={{ color: '#4b5563', marginBottom: '25px' }}>You haven't enrolled in any courses yet.</p>
            <button onClick={() => setShowEnrollmentRequest(true)} className="wf-btn-large">
              📚 Request Enrollment
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  const guardContent = renderGuardContent();
  if (guardContent) {
    return (
      <div className="wireframe-layout">
        {renderHeader()}
        <div className="wireframe-body" style={{ justifyContent: 'center' }}>
          {guardContent}
        </div>
      </div>
    );
  }

  return (
    <div className="wireframe-layout">
      {renderHeader()}
      <div className="wireframe-body">
        {renderSidebar()}
        <main className="wireframe-main">
          {activeTab === 'statistics' ? (
            <div className="wireframe-section slide-in">
              <div className="course-header-banner">
                <h2>Learning Statistics</h2>
                <p className="wf-subtitle">Your progress and achievements at a glance.</p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '20px' }}>
                {/* 1. Time Spent Card */}
                <div className="wf-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: 'linear-gradient(135deg, #006D5B 0%, #004D40 100%)', color: 'white' }}>
                  <FaClock size={40} style={{ marginBottom: '15px', color: '#B2DFDB' }} />
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', opacity: 0.9 }}>Total Learning Time</h4>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800' }}>
                    {Math.floor(totalTimeSpent / 3600)}h {Math.floor((totalTimeSpent % 3600) / 60)}m
                  </div>
                  <p style={{ margin: '10px 0 0 0', fontSize: '0.8rem', opacity: 0.8 }}>Active time on platform</p>
                </div>

                {/* 2. Videos Completed Card */}
                <div className="wf-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <FaPlay size={40} style={{ marginBottom: '15px', color: '#006D5B' }} />
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#666' }}>Modules Watched</h4>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111827' }}>
                    {completedVideos.length} <span style={{ fontSize: '1rem', color: '#999', fontWeight: '400' }}>/ {videos.length}</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#e5e7eb', borderRadius: '3px', marginTop: '15px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#006D5B', width: `${videos.length > 0 ? (completedVideos.length / videos.length) * 100 : 0}%` }}></div>
                  </div>
                </div>

                {/* 3. Quizzes Solved Card */}
                <div className="wf-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <FaClipboardCheck size={40} style={{ marginBottom: '15px', color: '#f59e0b' }} />
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#666' }}>Quizzes Solved</h4>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111827' }}>
                    {quizzesSolved}
                  </div>
                  <p style={{ margin: '10px 0 0 0', fontSize: '0.8rem', color: '#999' }}>Assessments completed</p>
                </div>

                {/* 4. Left to Watch Card */}
                <div className="wf-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <FaLayerGroup size={40} style={{ marginBottom: '15px', color: '#6366f1' }} />
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#666' }}>Modules Remaining</h4>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111827' }}>
                    {Math.max(0, videos.length - completedVideos.length)}
                  </div>
                  <p style={{ margin: '10px 0 0 0', fontSize: '0.8rem', color: '#999' }}>Keep it up!</p>
                </div>
              </div>

              <div className="wf-card" style={{ marginTop: '30px', padding: '30px', textAlign: 'center', background: '#F0FDF4', borderColor: '#BBF7D0' }}>
                <h3 style={{ color: '#166534', marginBottom: '10px' }}>Your Learning Progress</h3>
                <p style={{ color: '#15803d', marginBottom: '20px' }}>
                  Overall Completion: <strong>{videos.length > 0 ? Math.round((completedVideos.length / videos.length) * 100) : 0}%</strong>
                </p>
                <div style={{ maxWidth: '500px', margin: '0 auto', height: '12px', background: 'white', borderRadius: '6px', overflow: 'hidden', border: '1px solid #BBF7D0' }}>
                  <div style={{ height: '100%', background: '#166534', width: `${videos.length > 0 ? (completedVideos.length / videos.length) * 100 : 0}%` }}></div>
                </div>
                <button className="wf-btn" style={{ marginTop: '30px' }} onClick={() => setActiveTab('dashboard')}>
                  Continue Learning &rarr;
                </button>
              </div>
            </div>
          ) : viewingSubject ? (
            <div className="wireframe-section slide-in">
              <div className="course-header-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="wf-tag">Subject Detail</span>
                  <h2>{viewingSubject.name}</h2>
                  <p className="wf-subtitle">Modules and your personal study pad.</p>
                </div>
                <button className="wf-btn-outline" onClick={() => setViewingSubject(null)}>
                  &larr; Back to Dashboard
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(300px, 1fr)', gap: '30px', marginTop: '20px' }}>
                {/* Left Column: Videos & Curriculum */}
                <div className="card" style={{ padding: '20px', background: 'white', borderRadius: '12px' }}>
                  <h3 style={{ marginBottom: '20px', color: '#006D5B' }}>My Videos</h3>
                  <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' }}>
                    {(() => {
                      // STAGE 1: Strict Match (Subject AND Year)
                      let filtered = videos.filter(v => {
                        const vSubName = (v.subject?.name || v.subject_name || v.subject || '').toString().toLowerCase().trim();
                        const vSubId = (v.subject?._id || v.subject_id || '').toString();
                        const currentSubName = (viewingSubject.name || '').toLowerCase().trim();
                        const currentSubId = (viewingSubject._id || viewingSubject.id || '').toString();
                        
                        const isYearOk = isYearMatch(v.year_id || v.year, enrollments[0]?.year_id);
                        return (isYearOk) && (vSubName === currentSubName || (vSubId && vSubId === currentSubId));
                      });

                      // STAGE 2: Flexible Recovery (Subject Only) - if strict failed
                      if (filtered.length === 0 && videos.length > 0) {
                        filtered = videos.filter(v => {
                          const vSubName = (v.subject?.name || v.subject_name || v.subject || '').toString().toLowerCase().trim();
                          const vSubId = (v.subject?._id || v.subject_id || '').toString();
                          const currentSubName = (viewingSubject.name || '').toLowerCase().trim();
                          const currentSubId = (viewingSubject._id || viewingSubject.id || '').toString();
                          
                          return vSubName === currentSubName || (vSubId && vSubId === currentSubId);
                        });
                      }

                      return filtered.length > 0 ? (
                        filtered.map((video, idx) => (
                          <div key={video._id} className="wf-card" style={{ padding: '15px', marginBottom: '15px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <div style={{ width: '40px', height: '40px', background: '#E6F4F1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#006D5B', fontWeight: 'bold' }}>
                              {idx + 1}
                            </div>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ margin: 0, fontSize: '1rem' }}>{video.title}</h4>
                              <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#666' }}>Module Video</p>
                            </div>
                            <button className="wf-btn" style={{ padding: '5px 12px', fontSize: '0.8rem' }} onClick={() => navigate(`/video/${video._id}`)}>
                              Watch
                            </button>
                          </div>
                        ))
                      ) : (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                          <FaBookOpen size={40} color="#e5e7eb" style={{ marginBottom: '10px' }} />
                          <p className="wf-subtitle">No modules uploaded yet.</p>
                        </div>
                      )
                    })()}

                    {/* Quizzes Section */}
                    {subjectQuizzes[viewingSubject._id]?.length > 0 && (
                      <div style={{ marginTop: '30px' }}>
                        <h3 style={{ marginBottom: '20px', color: '#f59e0b' }}>Assessments</h3>
                        {subjectQuizzes[viewingSubject._id].map((quiz) => (
                          <div key={quiz._id} className="wf-card" style={{ padding: '15px', marginBottom: '15px', display: 'flex', gap: '15px', alignItems: 'center', borderColor: '#fef3c7' }}>
                            <div style={{ width: '40px', height: '40px', background: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', fontSize: '1.2rem' }}>
                              <FaClipboardCheck />
                            </div>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ margin: 0, fontSize: '1rem' }}>{quiz.title}</h4>
                              <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#666' }}>Quiz Assessment</p>
                            </div>
                            <button className="wf-btn" style={{ background: '#f59e0b', padding: '5px 12px', fontSize: '0.8rem' }} onClick={() => navigate(`/quiz/${quiz._id}`)}>
                              Start Quiz
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Study Materials & Notes Pad */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Study Materials (Teacher Documents) */}
                  <div className="wf-card" style={{ padding: '20px', background: '#F0F9FF', borderColor: '#BAE6FD' }}>
                    <h3 style={{ marginBottom: '15px', color: '#0369A1', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FaBookOpen /> Lesson Materials
                    </h3>
                    <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                      {(() => {
                        const subDocs = documents.filter(d => {
                          const dSubName = (d.subject?.name || d.subject_name || d.subject || '').toString().toLowerCase().trim();
                          const dSubId = (d.subject?._id || d.subject_id || '').toString();
                          const currentSubName = (viewingSubject.name || '').toLowerCase().trim();
                          const currentSubId = (viewingSubject._id || viewingSubject.id || '').toString();
                          return dSubName === currentSubName || (dSubId && dSubId === currentSubId);
                        });

                        return subDocs.length > 0 ? (
                          subDocs.map((doc) => (
                            <div key={doc._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'white', borderRadius: '8px', marginBottom: '8px', border: '1px solid #E0F2FE' }}>
                              <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                                {doc.title}
                              </span>
                              <button 
                                className="wf-btn" 
                                style={{ padding: '4px 10px', fontSize: '0.75rem', background: '#0284C7' }}
                                onClick={() => {
                                  const url = doc.video_url || doc.url || '';
                                  const isActuallyDoc = doc.type === 'document' || doc.type === 'pdf' || 
                                                        url.toLowerCase().endsWith('.pdf') || 
                                                        url.toLowerCase().endsWith('.doc') || 
                                                        url.toLowerCase().endsWith('.docx') || 
                                                        url.toLowerCase().endsWith('.txt');
                                  
                                  const fullUrl = url.startsWith('http') ? url : `http://localhost:5000${url}`;
                                  
                                  if (isActuallyDoc) {
                                    window.open(fullUrl, '_blank');
                                  } else {
                                    // Normally this is in content view, but if someone clicked 'view' on a video
                                    navigate(`/video/${doc._id}`);
                                  }
                                }}
                              >
                                View
                              </button>
                            </div>
                          ))
                        ) : (
                          <p style={{ fontSize: '0.85rem', color: '#64748B', fontStyle: 'italic' }}>No documents for this subject.</p>
                        );
                      })()}
                    </div>
                  </div>

                  {/* My Notes Pad */}
                  <div className="card" style={{ padding: '20px', background: '#fdfdfd', borderRadius: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <h3 style={{ margin: 0, color: '#006D5B' }}>My Study Pad</h3>
                      {isSavingNote && <span style={{ fontSize: '0.75rem', color: '#666' }}>Saving...</span>}
                    </div>
                    <textarea
                      style={{
                        flex: 1,
                        width: '100%',
                        minHeight: '300px',
                        padding: '15px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        background: '#fff',
                        fontSize: '0.95rem',
                        lineHeight: '1.6',
                        resize: 'none',
                        outline: 'none',
                        fontFamily: 'Inter, sans-serif'
                      }}
                      placeholder="Start taking notes..."
                      value={subjectNote}
                      onChange={(e) => setSubjectNote(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'documents' ? (
            <div className="wireframe-section slide-in">
              <div className="course-header-banner">
                <span className="wf-tag">Learning Materials</span>
                <h2>Study Lessons</h2>
                <p className="wf-subtitle">Access lesson materials, notes, and study guides shared by your instructor.</p>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: '20px',
                marginTop: '30px'
              }}>
                {documents.map((doc) => (
                  <div key={doc._id} className="wf-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ width: '50px', height: '50px', background: '#F0F9FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284C7' }}>
                        <FaBookOpen size={24} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', color: '#1E293B' }}>{doc.title}</h4>
                        <span className="wf-tag" style={{ background: '#E0F2FE', color: '#0369A1', fontSize: '0.7rem', marginTop: '5px', display: 'inline-block' }}>
                          {doc.subject?.name || 'Lesson Material'}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0, minHeight: '40px' }}>
                      {doc.description || 'View this lesson resource for your study.'}
                    </p>
                    <button 
                      className="wf-btn" 
                      style={{ width: '100%', background: '#0284C7' }}
                      onClick={() => {
                        const url = doc.video_url || doc.url || '';
                        const isActuallyDoc = doc.type === 'document' || doc.type === 'pdf' || 
                                              url.toLowerCase().endsWith('.pdf') || 
                                              url.toLowerCase().endsWith('.doc') || 
                                              url.toLowerCase().endsWith('.docx') || 
                                              url.toLowerCase().endsWith('.txt');

                        const fullUrl = url.startsWith('http') ? url : `http://localhost:5000${url}`;
                        
                        if (isActuallyDoc) {
                          window.open(fullUrl, '_blank');
                        } else {
                          navigate(`/video/${doc._id}`);
                        }
                      }}
                    >
                      Open Lesson
                    </button>
                  </div>
                ))}
                {documents.length === 0 && (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }}>
                    <div style={{ background: '#f3f4f6', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                      <FaBookOpen size={40} color="#9ca3af" />
                    </div>
                    <h3 style={{ color: '#111827', marginBottom: '10px' }}>No lessons yet</h3>
                    <p className="wf-subtitle">Your teacher hasn't uploaded any lesson materials for this academic year yet.</p>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'subjects' ? (
            <div className="wireframe-section slide-in">
              <div className="course-header-banner">
                <span className="wf-tag">Full Curriculum</span>
                <h2>All Subjects - {currentCourse?.title || currentCourse?.name}</h2>
                <p className="wf-subtitle">Explore all subjects available for your academic year.</p>
              </div>
              
              <div className="wf-course-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: '25px',
                padding: '20px 0'
              }}>
                {courseSubjects.map((subject, idx) => (
                  <div 
                    key={subject._id || idx} 
                    className="wf-card" 
                    style={{ 
                      padding: '25px', 
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      border: '1px solid #e5e7eb'
                    }}
                    onClick={() => handleSubjectClick(subject)}
                    onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ background: '#f0fdf4', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
                      <FaClipboardList size={24} color="#006D5B" />
                    </div>
                    <h3 style={{ marginBottom: '10px', fontSize: '1.2rem' }}>{subject.name}</h3>
                    <p className="wf-small-text" style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '20px' }}>
                      Complete your curriculum by watching modules and taking quizzes for this subject.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="wf-tag" style={{ background: '#E6F4F1', color: '#006D5B' }}>Curriculum</span>
                      <span style={{ color: '#006D5B', fontWeight: '600', fontSize: '0.85rem' }}>View Modules &rarr;</span>
                    </div>
                  </div>
                ))}
                {courseSubjects.length === 0 && (
                   <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }}>
                    <p className="wf-subtitle">No subjects available for your academic year yet.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="wireframe-section slide-in">
              <div className="course-header-banner">
                <span className="wf-tag">Enrolled Course</span>
                <h2>{currentCourse?.title || currentCourse?.name}</h2>
                <div className="subject-selector" style={{ marginTop: '20px' }}>
                  <div className="subject-tabs" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {subjects.map(subject => (
                      <button
                        key={subject}
                        className={`wf-btn${selectedSubject === subject ? '' : '-outline'}`}
                        style={{ padding: '8px 15px', fontSize: '0.85rem' }}
                        onClick={() => handleSubjectClick(courseSubjects.find(s => s.name === subject) || { name: subject })}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="wf-course-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '25px',
                marginTop: '30px'
              }}>
                {filteredVideos.map((video) => {
                  const videoId = video._id || video.id;
                  const isLocked = !isUnlocked(videoId);
                  const subjectName = video.subject?.name || video.subject_name || (typeof video.subject === 'string' ? video.subject : null) || 'Curriculum Module';
                  const associatedQuiz = subjectQuizzes[video.subject_id]?.find(q => String(q.after_video_id) === String(videoId));
                  
                  return (
                    <div key={videoId} className="wf-course-card" style={{ 
                      position: 'relative',
                      background: 'white',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}>
                      <div className="wf-course-icon" style={{ 
                        height: '170px', 
                        background: isLocked ? '#f3f4f6' : 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        position: 'relative'
                      }}>
                        {isLocked ? (
                          <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                            <FaLock size={40} />
                            <p style={{ marginTop: '10px', fontSize: '0.85rem', fontWeight: '600' }}>Locked Module</p>
                          </div>
                        ) : (
                          <div className="play-container" onClick={() => navigate(`/video/${videoId}`)} style={{ cursor: 'pointer' }}>
                            <FaPlay size={50} className="play-icon-hover" />
                          </div>
                        )}
                        <span style={{ 
                          position: 'absolute', 
                          top: '12px', 
                          right: '12px', 
                          background: 'rgba(255,255,255,0.95)', 
                          color: '#006D5B',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          zIndex: 1
                        }}>
                          {subjectName}
                        </span>
                        {associatedQuiz && (
                          <div style={{ 
                            position: 'absolute', 
                            top: '12px', 
                            left: '12px', 
                            background: '#f59e0b', 
                            color: 'white',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}>
                            <FaClipboardCheck /> QUIZ READY
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '20px' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', fontWeight: '700', color: '#111827' }}>{video.title}</h3>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '20px', minHeight: '40px', lineHeight: '1.5' }}>
                          {video.description || 'Access this curriculum module and complete the assessment to progress.'}
                        </p>
                        
                        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                          {isLocked ? (
                            <button className="wf-btn-outline" style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed', borderColor: '#e5e7eb' }} disabled>
                              Complete Previous Module
                            </button>
                          ) : (
                            <>
                              <button 
                                className="wf-btn" 
                                style={{ width: '100%', padding: '10px' }}
                                onClick={() => navigate(`/video/${videoId}`)}
                              >
                                Watch Module &rarr;
                              </button>
                              
                              {associatedQuiz && (
                                <button 
                                  className="wf-btn-outline" 
                                  style={{ width: '100%', padding: '10px', borderColor: '#f59e0b', color: '#f59e0b' }}
                                  onClick={() => navigate(`/quiz/${associatedQuiz._id}`)}
                                >
                                  Take Module Quiz
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {filteredVideos.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px', background: '#f9fafb', borderRadius: '15px' }}>
                   <p style={{ color: '#6b7280' }}>No modules available for this subject yet.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;