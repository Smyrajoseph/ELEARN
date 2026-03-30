import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaBook, FaCalendarAlt, FaBookOpen, FaUpload, FaGraduationCap, FaClipboardCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/AuthContext';
import courseService from '../../../services/courseService';
import enrollmentService from '../../../services/enrollmentService';
import videoService from '../../../services/videoService';
import subjectService from '../../../services/subjectService';
import quizService from '../../../services/quizService';
import Spinner from '../../../components/Spinner';

import '../../../App.css';
import '../../../styles/TeacherDashboard.css';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  // Wireframe UI States
  const [activeTab, setActiveTab] = useState('courses');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseSubjects, setCourseSubjects] = useState([]);
  const [selectedUploadYear, setSelectedUploadYear] = useState('');
  const [selectedUploadType, setSelectedUploadType] = useState('video');
  const [teacherVideos, setTeacherVideos] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [enrollmentRequests, setEnrollmentRequests] = useState([]);
  const [editingVideo, setEditingVideo] = useState(null);

  // Quiz Creator States
  const [quizUploadLoading, setQuizUploadLoading] = useState(false);
  const [quizSelectedCourse, setQuizSelectedCourse] = useState(null);
  const [quizSelectedYear, setQuizSelectedYear] = useState('');
  const [quizSelectedSubject, setQuizSelectedSubject] = useState(null);
  const [quizVideos, setQuizVideos] = useState([]);
  const [selectedVideoAfter, setSelectedVideoAfter] = useState('');
  const [quizMode, setQuizMode] = useState('link'); // 'link' or 'builder'
  const [builderQuestions, setBuilderQuestions] = useState([
    { question: '', options: ['', '', '', ''], correctAnswer: '' }
  ]);

  // Fixed Structural Constants
  const ACADEMIC_YEARS = ['First Year (FY)', 'Second Year (SY)', 'Third Year (TY)'];

  useEffect(() => {
    if (['subject-add', 'course-detail', 'upload-content'].includes(activeTab) && selectedCourse) {
      const fetchSubjects = async () => {
        try {
          const data = await subjectService.getSubjectsByCourse(selectedCourse._id || selectedCourse.id);
          setCourseSubjects(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error(error);
          toast.error('Failed to load subjects.');
        }
      };
      fetchSubjects();
    }
  }, [activeTab, selectedCourse]);

  useEffect(() => {
    if (activeTab === 'my-videos' || activeTab === 'enrollment-requests') {
      const fetchData = async () => {
        try {
          // setLoading(true); // Don't block whole screen for sub-tabs
          if (activeTab === 'my-videos') {
            const data = await videoService.getTeacherVideos();
            setTeacherVideos(Array.isArray(data) ? data : []);
          } else if (activeTab === 'enrollment-requests') {
            const data = await enrollmentService.getTeacherPendingRequests();
            setEnrollmentRequests(Array.isArray(data) ? data : []);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          toast.error(`Failed to load ${activeTab === 'my-videos' ? 'videos' : 'requests'}.`);
        } finally {
          // setLoading(false);
        }
      };
      fetchData();
    }
  }, [activeTab]);

  // Fetch subjects for Quiz Creator when course is selected
  useEffect(() => {
    if (activeTab === 'quiz-creator' && quizSelectedCourse) {
      const fetchSubjects = async () => {
        try {
          const data = await subjectService.getSubjectsByCourse(quizSelectedCourse._id || quizSelectedCourse.id);
          setCourseSubjects(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error(error);
          toast.error('Failed to load subjects.');
        }
      };
      fetchSubjects();
    }
  }, [activeTab, quizSelectedCourse]);

  // Fetch videos for Quiz Creator when subject is selected
  useEffect(() => {
    if (activeTab === 'quiz-creator' && quizSelectedCourse && quizSelectedSubject) {
      const fetchVideosForQuiz = async () => {
        try {
          const data = await videoService.getCourseVideos(quizSelectedCourse._id || quizSelectedCourse.id);
          const allVideos = Array.isArray(data) ? data : [];
          
          // Ultra-flexible filter
          let filtered = allVideos.filter(v => {
            const videoSubId = String(v.subject_id || '').trim();
            const targetSubId = String(quizSelectedSubject._id || quizSelectedSubject.id || '').trim();
            const videoYear = String(v.year_id || '').trim();
            const targetYear = String(quizSelectedYear || '').trim();

            // Match by subject and year (robust comparison)
            return videoSubId === targetSubId && 
                   (videoYear === targetYear || targetYear === '' || videoYear === '');
          });

          // Fallback: If filtered list is empty, show all course videos so the dropdown isn't empty
          if (filtered.length === 0 && allVideos.length > 0) {
            console.warn('No specific video found for this subject/year, showing all course videos.');
            setQuizVideos(allVideos);
          } else {
            setQuizVideos(filtered);
          }
        } catch (error) {
          console.error('Error fetching videos for quiz:', error);
        }
      };
      fetchVideosForQuiz();
    }
  }, [activeTab, quizSelectedSubject, quizSelectedYear, quizSelectedCourse]);

  // Fetch teacher data on mount
  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        setLoading(true);
        // Fetch teacher's courses
        const coursesData = await courseService.getAllCourses();
        const teacherCourses = (coursesData || []).filter(course => {
          const isSelected = Array.isArray(user?.course)
            ? user.course.includes(course.title)
            : course.title === user?.course;
          return isSelected || course.teacher_id === user?.id || String(course._id) === String(user?.courseId);
        });

        if (teacherCourses.length > 0) {
          setCourses(teacherCourses);
        } else {
          setCourses([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTeacherData();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to permanently delete this course?')) return;
    try {
      await courseService.deleteCourse(courseId);
      setCourses(courses.filter(c => c._id !== courseId));
      toast.success('Course deleted successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete course');
    }
  };

  const handleEnrollmentStatusUpdate = async (requestId, status) => {
    try {
      await enrollmentService.updateEnrollmentStatus(requestId, status);
      toast.success(`Request ${status} successfully!`);
      // Refresh the list
      const data = await enrollmentService.getTeacherPendingRequests();
      setEnrollmentRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${status} request.`);
    }
  };

  // HEADER (Navbar)
  const renderHeader = () => (
    <nav className="wireframe-header">
      <div className="header-logo">
        <FaGraduationCap size={30} />
        <span>E-Learn Platform</span>
      </div>
      <div className="header-links">
        <span className={activeTab === 'courses' ? 'active' : ''} onClick={() => { setActiveTab('courses'); setSelectedCourse(null); }}>Courses</span>
        <span className={activeTab === 'upload-content' ? 'active' : ''} onClick={() => { setActiveTab('upload-content'); setSelectedCourse(null); }}>Upload Content</span>
        <span className={activeTab === 'my-courses' ? 'active' : ''} onClick={() => setActiveTab('my-courses')}>Manage</span>
      </div>
      <div className="header-profile" onClick={() => navigate('/teacher/profile')} style={{ cursor: 'pointer' }}>
        {user?.photo ? (
          <img src={user.photo} alt="Profile" className="sidebar-profile-img" style={{ width: '26px', height: '26px', borderRadius: '50%' }} />
        ) : (
          <FaUserCircle size={26} />
        )}
        <span>{user?.name || 'Teacher'}</span>
        <FaSignOutAlt size={22} className="logout-icon" onClick={(e) => { e.stopPropagation(); handleLogout(); }} title="Logout" />
      </div>
    </nav>
  );

  // SIDEBAR (Admin/Teacher Tools)
  const renderSidebar = () => (
    <aside className="wireframe-sidebar">
      <h3>Admin/Teacher Tools</h3>
      <ul>
        <li className={activeTab === 'courses' || activeTab === 'my-courses' ? 'active' : ''} onClick={() => { setActiveTab('courses'); setSelectedCourse(null); }}>
          <FaBook /> My Courses
        </li>

        <li className={activeTab === 'manage-subjects' ? 'active' : ''} onClick={() => setActiveTab('manage-subjects')}>
          <FaBookOpen /> Subjects
        </li>
        <li className={activeTab === 'add-course' ? 'active' : ''} onClick={() => setActiveTab('add-course')}>
          <FaBook /> Add Course
        </li>
        <li className={activeTab === 'enrollment-requests' ? 'active' : ''} onClick={() => setActiveTab('enrollment-requests')}>
          <FaUserCircle /> Enrollment Requests
        </li>
        <li className={activeTab === 'quiz-creator' ? 'active' : ''} onClick={() => setActiveTab('quiz-creator')}>
          <FaClipboardCheck /> Quiz Creator
        </li>
        <li className={activeTab === 'my-videos' ? 'active' : ''} onClick={() => setActiveTab('my-videos')}>
          <FaUpload /> My Videos
        </li>
        <li className={activeTab === 'upload-content' ? 'active' : ''} onClick={() => { setActiveTab('upload-content'); setSelectedCourse(null); setSelectedSubject(null); }}>
          <FaUpload /> Upload Content
        </li>
        <hr style={{ margin: '15px 0', borderColor: 'rgba(0,0,0,0.05)' }} />
        <li onClick={() => navigate('/teacher/profile')}>
          <FaUserCircle /> My Profile
        </li>
      </ul>
    </aside>
  );

  // MAIN SECTION (Course List Grid)
  const renderCourseList = (title = 'Course List', targetTab = 'course-detail') => (
    <div className="wireframe-section slide-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>{title}</h2>
        {(activeTab === 'my-courses' || activeTab === 'courses') && (
          <button className="wf-btn" onClick={() => setActiveTab('add-course')}>+ Add New Course</button>
        )}
      </div>
      <div className="course-grid">
        {courses.map(course => (
          <div key={course._id} className="wf-course-card">
            <div className="wf-course-icon"><FaBook size={40} /></div>
            <h3>{course.title}</h3>
            <p>{course.description || 'Administer course details, years, and subjects.'}</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button className="wf-btn" style={{ flex: 1 }} onClick={() => {
                setSelectedCourse(course);
                setActiveTab(targetTab);
              }}>
                {targetTab === 'subject-add' ? 'Subjects' : 'View Details'}
              </button>
              {(activeTab === 'my-courses' || activeTab === 'courses') && (
                <button className="wf-btn-outline" style={{ width: '80px', borderColor: '#ef4444', color: '#ef4444' }} onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCourse(course._id || course.id);
                }}>
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ADD COURSE PAGE
  const renderAddCourse = () => (
    <div className="wireframe-section slide-in center-form">
      <div className="wf-breadcrumb">
        <button className="wf-btn-outline" onClick={() => setActiveTab('courses')}>&larr; Back to Courses</button>
      </div>
      <div className="course-header-banner">
        <h2>Create New Course</h2>
        <p className="wf-subtitle">Add a new course to your curriculum catalog.</p>
      </div>
      <form className="wf-upload-form" onSubmit={async (e) => {
        e.preventDefault();
        const title = e.target.title.value;
        const description = e.target.description.value;
        try {
          const newCourse = await courseService.createCourse({ title, description, teacher_id: user?.id || "default_teacher" });
          setCourses([...courses, newCourse]);
          toast.success('Course created successfully!');
          setActiveTab('courses');
        } catch (err) {
          console.error(err);
          toast.error('Failed to create course');
        }
      }}>
        <div className="form-group">
          <label>Course Title</label>
          <input type="text" name="title" required placeholder="e.g. B.Sc Data Science" />
        </div>
        <div className="form-group">
          <label>Course Description</label>
          <textarea name="description" required placeholder="Brief description of the course..." rows="4"></textarea>
        </div>
        <button type="submit" className="wf-btn-large">Create Course</button>
      </form>
    </div>
  );

  // COURSE DETAIL PAGE
  const renderCourseDetail = () => {
    if (!selectedCourse) return null;
    return (
      <div className="wireframe-section slide-in">
        <div className="wf-breadcrumb">
          <button className="wf-btn-outline" onClick={() => { setActiveTab('courses'); setSelectedCourse(null); }}>&larr; Back to Courses</button>
        </div>
        <div className="course-header-banner">
          <h2>{selectedCourse.title}</h2>
          <p className="wf-subtitle">Manage curriculum and content for this course.</p>
        </div>

        <div className="year-list">
          {ACADEMIC_YEARS.map((year, idx) => {
            const subjectsForYear = Array.isArray(courseSubjects) ? courseSubjects.filter(s => s.year_id === year) : [];
            return (
              <div key={idx} className="year-block">
                <div className="year-header">
                  <FaCalendarAlt color="#10b981" />
                  <h3>{year}</h3>
                </div>
                <div className="subject-list">
                  {subjectsForYear.map((subject, sIdx) => (
                    <div key={subject._id || sIdx} className="subject-card">
                      <h4>{subject.name}</h4>
                      <p className="wf-small-text">Syllabus modules and materials</p>
                      <button className="wf-btn wf-btn-small" onClick={() => {
                        setSelectedCourse(selectedCourse);
                        setSelectedSubject(subject);
                        setActiveTab('upload-content');
                      }}>Manage Content</button>
                    </div>
                  ))}
                  {subjectsForYear.length === 0 && <p className="wf-small-text">No subjects configured for this year.</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    );
  };

  // MANAGE SUBJECTS DETAIL PAGE
  const renderManageSubjectsDetail = () => {
    if (!selectedCourse) return null;

    const handleAddSubject = async (e) => {
      e.preventDefault();
      const year_id = e.target.elements.yearName.value;
      const name = e.target.elements.subjectName.value;
      try {
        const newSub = await subjectService.createSubject({
          course_id: selectedCourse._id || selectedCourse.id,
          year_id,
          name
        });
        setCourseSubjects([...courseSubjects, newSub]);
        toast.success('Subject added successfully!');
        e.target.reset();
      } catch (err) {
        console.error(err);
        toast.error('Failed to add subject');
      }
    };

    const handleDeleteSubject = async (subjectId) => {
      if (!window.confirm('Are you sure you want to delete this subject?')) return;
      try {
        await subjectService.deleteSubject(subjectId);
        setCourseSubjects(courseSubjects.filter(s => s._id !== subjectId));
        toast.success('Subject deleted.');
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete subject.');
      }
    };

    const handleUpdateSubject = async (subjectId, oldName) => {
      const newName = window.prompt("Enter new subject name:", oldName);
      if (!newName || newName === oldName) return;
      try {
        const updated = await subjectService.updateSubject(subjectId, { name: newName });
        setCourseSubjects(courseSubjects.map(s => s._id === subjectId ? updated : s));
        toast.success("Subject updated successfully!");
      } catch (err) {
        console.error(err);
        toast.error("Failed to update subject");
      }
    };

    return (
      <div className="wireframe-section slide-in">
        <div className="wf-breadcrumb">
          <button className="wf-btn-outline" onClick={() => { setActiveTab('manage-subjects'); setSelectedCourse(null); }}>&larr; Back to Course List</button>
        </div>
        <div className="course-header-banner">
          <h2>{selectedCourse.title} - Subjects</h2>
          <p className="wf-subtitle">Add and configure subjects for this curriculum.</p>
        </div>

        <div className="center-form" style={{ marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '20px' }}>Add New Subject</h3>
          <form className="wf-upload-form" onSubmit={handleAddSubject}>
            <div className="form-row">
              <div className="form-group half-width">
                <label>Select Year</label>
                <select name="yearName" required defaultValue="">
                  <option value="" disabled>-- Choose Year --</option>
                  {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="form-group half-width">
                <label>Subject Name</label>
                <input type="text" name="subjectName" placeholder="e.g. Advanced Java" required />
              </div>
            </div>
            <button type="submit" className="wf-btn">Add Subject</button>
          </form>
        </div>

        <h3 style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #e5e7eb' }}>Existing Subjects</h3>
        <div className="year-list">
          {ACADEMIC_YEARS.map((year, idx) => {
            const safeSubjects = Array.isArray(courseSubjects) ? courseSubjects : [];
            const subjectsForYear = safeSubjects.filter(s => s.year_id === year);
            return (
              <div key={idx} className="year-block">
                <div className="year-header">
                  <FaCalendarAlt color="#10b981" />
                  <h3>{year}</h3>
                </div>
                <div className="subject-list">
                  {subjectsForYear.length > 0 ? subjectsForYear.map((subject, sIdx) => (
                    <div key={subject._id || sIdx} className="subject-card">
                      <h4>{subject.name}</h4>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button className="wf-btn-outline" style={{ flex: 1, fontSize: '0.8rem', padding: '5px' }} onClick={() => handleUpdateSubject(subject._id, subject.name)}>Edit</button>
                        <button className="wf-btn-outline" style={{ flex: 1, fontSize: '0.8rem', padding: '5px', color: '#ef4444', borderColor: '#fca5a5' }} onClick={() => handleDeleteSubject(subject._id)}>Delete</button>
                      </div>
                    </div>
                  )) : (
                    <p className="wf-small-text">No subjects configured for this year.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ENROLLMENT REQUESTS PAGE
  const renderEnrollmentRequests = () => (
    <div className="wireframe-section slide-in">
      <h2>Enrollment Requests</h2>
      <p className="wf-subtitle">Review and manage student admission to your courses.</p>

      {enrollmentRequests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          <p>No pending enrollment requests found.</p>
        </div>
      ) : (
        <div className="requests-table">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px' }}>Student</th>
                <th style={{ padding: '12px' }}>Course</th>
                <th style={{ padding: '12px' }}>Year</th>
                <th style={{ padding: '12px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {enrollmentRequests.map(req => (
                <tr key={req._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px' }}>{req.student_name || req.student_id}</td>
                  <td style={{ padding: '12px' }}>{req.course_title || req.course_id}</td>
                  <td style={{ padding: '12px' }}>{req.year_id}</td>
                  <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                    <button className="wf-btn wf-btn-small" onClick={() => handleEnrollmentStatusUpdate(req._id, "accepted")}>Approve</button>
                    <button className="wf-btn-outline" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={() => handleEnrollmentStatusUpdate(req._id, "rejected")}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // QUIZ CREATOR PAGE
  const renderQuizCreator = () => {
    const handleQuizUpload = async (e) => {
      e.preventDefault();
      const title = e.target.title.value;
      const courseId = e.target.courseId.value;
      const year = e.target.yearId.value;
      const subjectId = e.target.subjectId.value;
      const videoAfterId = e.target.videoAfterId.value;

      try {
        setQuizUploadLoading(true);
        
        const payload = {
          title,
          course_id: courseId,
          year_id: year,
          subject_id: subjectId,
          after_video_id: videoAfterId,
          quiz_mode: quizMode
        };

        if (quizMode === 'link') {
          payload.quiz_link = e.target.quizLink.value;
        } else {
          // Validate questions
          const validQuestions = builderQuestions.filter(q => q.question.trim() !== '' && q.correctAnswer !== '');
          if (validQuestions.length === 0) {
            toast.error("Please add at least one complete question.");
            setQuizUploadLoading(false);
            return;
          }
          payload.questions = validQuestions;
        }

        await quizService.createQuiz(payload);
        toast.success('Quiz created successfully!');
        e.target.reset();
        setQuizSelectedCourse(null);
        setQuizSelectedSubject(null);
        setBuilderQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: '' }]);
      } catch (err) {
        console.error('Quiz creation error:', err);
        toast.error('Failed to create quiz.');
      } finally {
        setQuizUploadLoading(false);
      }
    };

    const addQuestion = () => {
      setBuilderQuestions([...builderQuestions, { question: '', options: ['', '', '', ''], correctAnswer: '' }]);
    };

    const removeQuestion = (index) => {
      if (builderQuestions.length > 1) {
        setBuilderQuestions(builderQuestions.filter((_, i) => i !== index));
      }
    };

    const updateQuestion = (index, field, value) => {
      const updated = [...builderQuestions];
      updated[index][field] = value;
      setBuilderQuestions(updated);
    };

    const updateOption = (qIdx, oIdx, value) => {
      const updated = [...builderQuestions];
      updated[qIdx].options[oIdx] = value;
      setBuilderQuestions(updated);
    };

    return (
      <div className="wireframe-section slide-in center-form">
        <h2>Quiz Creator</h2>
        <p className="wf-subtitle">Design interactive assessments for your students.</p>

        <form className="wf-upload-form" onSubmit={handleQuizUpload}>
          <div className="form-group">
            <label>Quiz Title</label>
            <input type="text" name="title" required placeholder="e.g. Midterm Quiz - React Basics" />
          </div>

          <div className="form-group">
            <label>Select Course</label>
            <select
              name="courseId"
              required
              onChange={(e) => {
                const course = courses.find(c => String(c._id || c.id) === String(e.target.value));
                setQuizSelectedCourse(course);
              }}
              defaultValue=""
            >
              <option value="" disabled>-- Choose Course --</option>
              {courses.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.title}</option>)}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group half-width">
              <label>Select Year</label>
              <select
                name="yearId"
                required
                onChange={(e) => setQuizSelectedYear(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>-- Choose Year --</option>
                {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div className="form-group half-width">
              <label>Select Subject</label>
              <select
                name="subjectId"
                required
                onChange={(e) => {
                  const subject = courseSubjects.find(s => String(s._id || s.id) === String(e.target.value));
                  setQuizSelectedSubject(subject);
                }}
                defaultValue=""
              >
                <option value="" disabled>-- Choose Subject --</option>
                {courseSubjects.filter(s => s.year_id === quizSelectedYear).map(sub => (
                  <option key={sub._id || sub.id} value={sub._id || sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Appear After Video</label>
            <select name="videoAfterId" required defaultValue="">
              <option value="" disabled>-- Choose Video --</option>
              {quizVideos.map(vid => {
                const subject = courseSubjects.find(s => String(s._id || s.id) === String(vid.subject_id))?.name || 'Unknown Subject';
                return (
                  <option key={vid._id || vid.id} value={vid._id || vid.id}>
                    {vid.title} ({subject} - {vid.year_id || 'No Year'})
                  </option>
                );
              })}
            </select>
            <p className="wf-small-text" style={{ marginTop: '5px' }}>The quiz will be unlocked for the student after they watch this video.</p>
          </div>

          <div className="form-group">
            <label>Quiz Mode</label>
            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
              <button
                type="button"
                className={`wf-btn${quizMode === 'link' ? '' : '-outline'}`}
                style={{ flex: 1 }}
                onClick={() => setQuizMode('link')}
              >
                External Link
              </button>
              <button
                type="button"
                className={`wf-btn${quizMode === 'builder' ? '' : '-outline'}`}
                style={{ flex: 1 }}
                onClick={() => setQuizMode('builder')}
              >
                Quiz Builder
              </button>
            </div>
          </div>

          {quizMode === 'link' ? (
            <div className="form-group">
              <label>External Quiz Link</label>
              <input 
                type="url" 
                name="quizLink" 
                required 
                placeholder="https://forms.gle/..." 
                className="wf-input"
              />
              <p className="wf-small-text" style={{ marginTop: '5px' }}>Paste the URL of your Google Form, Microsoft Form, or Quiz tool.</p>
            </div>
          ) : (
            <div className="quiz-builder-container" style={{ marginTop: '20px' }}>
              <h3>Builder: Multiple Choice Questions</h3>
              {builderQuestions.map((q, qIdx) => (
                <div key={qIdx} className="builder-question-block" style={{ 
                  background: '#f9fafb', 
                  padding: '20px', 
                  borderRadius: '10px', 
                  marginBottom: '20px',
                  border: '1px solid #e5e7eb',
                  position: 'relative'
                }}>
                  {builderQuestions.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeQuestion(qIdx)}
                      style={{ 
                        position: 'absolute', 
                        top: '10px', 
                        right: '10px', 
                        background: 'none', 
                        border: 'none', 
                        color: '#ef4444', 
                        cursor: 'pointer' 
                      }}
                    >
                      Remove
                    </button>
                  )}
                  <div className="form-group">
                    <label>Question {qIdx + 1}</label>
                    <input 
                      type="text" 
                      value={q.question} 
                      onChange={(e) => updateQuestion(qIdx, 'question', e.target.value)}
                      placeholder="Enter your question here..."
                      className="wf-input"
                    />
                  </div>
                  <div className="options-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="form-group">
                        <label style={{ fontSize: '0.8rem' }}>Option {oIdx + 1}</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input 
                            type="radio" 
                            name={`correct-${qIdx}`} 
                            checked={q.correctAnswer === opt && opt !== ''}
                            onChange={() => updateQuestion(qIdx, 'correctAnswer', opt)}
                          />
                          <input 
                            type="text" 
                            value={opt} 
                            onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                            placeholder={`Option ${oIdx + 1}`}
                            className="wf-input"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button 
                type="button" 
                className="wf-btn-outline" 
                onClick={addQuestion}
                style={{ width: '100%', marginBottom: '20px' }}
              >
                + Add Another Question
              </button>
            </div>
          )}

          <button type="submit" className="wf-btn-large" disabled={quizUploadLoading}>
            {quizUploadLoading ? <Spinner message="Creating..." /> : (
              <><FaClipboardCheck size={20} style={{ marginRight: '8px' }} /> Create Quiz</>
            )}
          </button>
        </form>
      </div>
    );
  };

  // UPLOAD CONTENT PAGE
  const renderUploadContent = () => {
    const handleVideoUpload = async (e) => {
      e.preventDefault();
      const courseId = e.target.courseId.value;
      const subjectId = e.target.subjectId.value;
      const yearId = e.target.yearId.value;
      const title = e.target.title.value;
      const description = e.target.description.value;
      const type = e.target.contentType.value;
      const file = e.target.videoFile.files[0];

      if (type === 'video' && !file) {
        toast.error("Please select a video file.");
        return;
      }

      try {
        setUploadLoading(true);
        if (type === 'video') {
          await videoService.uploadVideo(courseId, { title, description, file, subject_id: subjectId, year_id: yearId });
          toast.success('Video uploaded and stored in GridFS successfully!');
        } else {
          toast.info(`${type} uploads are coming soon! Standardizing and storing in GridFS...`);
          // Mock behavior for now
        }
        e.target.reset();
        const data = await videoService.getTeacherVideos();
        setTeacherVideos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Upload error:', err);
        toast.error('Failed to upload content.');
      } finally {
        setUploadLoading(false);
      }
    };

    return (
      <div className="wireframe-section slide-in center-form">
        <h2>Upload Content</h2>
        <p className="wf-subtitle">Add new learning materials to the curriculum.</p>

        <form className="wf-upload-form" onSubmit={handleVideoUpload}>
          <div className="form-group">
            <label>Content Type</label>
            <select name="contentType" required defaultValue={selectedUploadType} onChange={(e) => setSelectedUploadType(e.target.value)}>
              <option value="video">Video Lecture</option>
              <option value="pdf">Syllabus</option>
            </select>
          </div>

          <div className="form-group">
            <label>Select Course</label>
            <select name="courseId" required defaultValue={selectedCourse?._id || ''}>
              <option value="" disabled>-- Choose Course --</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group half-width">
              <label>Select Year</label>
              <select name="yearId" required defaultValue={selectedSubject?.year_id || ''} onChange={(e) => setSelectedUploadYear(e.target.value)}>
                <option value="" disabled>-- Choose Year --</option>
                {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div className="form-group half-width">
              <label>Select Subject</label>
              <select name="subjectId" required defaultValue={selectedSubject?._id || ''}>
                <option value="" disabled>-- Choose Subject --</option>
                {courseSubjects.filter(s => s.year_id === (selectedUploadYear || selectedSubject?.year_id)).map(sub => (
                  <option key={sub._id} value={sub._id}>{sub.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Content Title</label>
            <input type="text" name="title" required placeholder="e.g. Introduction to React" />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" rows="3" placeholder="Briefly describe the content..."></textarea>
          </div>

          <div className="form-group file-upload-group">
            <label>Upload File</label>
            <div className="file-drop-zone">
              <FaUpload size={30} color="#9ca3af" />
              <p>Select your {selectedUploadType === 'video' ? 'video' : 'document'} file</p>
              <input
                type="file"
                name="videoFile"
                required
                accept={selectedUploadType === 'video' ? "video/*" : ".pdf,.doc,.docx,.txt"}
                className="file-input-hidden"
                style={{ cursor: 'pointer', opacity: 1, position: 'relative', width: 'auto', textAlign: 'center' }}
              />
            </div>
          </div>

          <button type="submit" className="wf-btn-large" disabled={uploadLoading}>
            {uploadLoading ? <Spinner message="Uploading..." /> : (
              <><FaUpload style={{ marginRight: '8px' }} /> Upload</>
            )}
          </button>
        </form>
      </div>
    );
  };

  // MY VIDEOS PAGE
  const renderTeacherVideos = () => (
    <div className="wireframe-section slide-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>My Uploaded Videos</h2>
        <button className="wf-btn" onClick={() => setActiveTab('upload-content')}>+ Upload New</button>
      </div>
      <div className="course-grid">
        {(teacherVideos || []).map(video => {
          const videoSource = video.video_url.startsWith('http')
            ? video.video_url
            : `http://localhost:5000${video.video_url}`;

          return (
            <div key={video._id} className="wf-course-card">
              <div className="wf-course-icon" style={{ backgroundColor: '#000' }}>
                <video
                  src={videoSource}
                  className="wf-video-preview"
                  muted
                  preload="metadata"
                  onMouseEnter={(e) => {
                    const playPromise = e.target.play();
                    if (playPromise !== undefined) {
                      playPromise.catch(() => {
                        // Safe to ignore: play was interrupted or failed
                      });
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.pause();
                    e.target.currentTime = 0;
                  }}
                />
              </div>
              <h3>{video.title}</h3>
              <p>{video.description || 'No description provided.'}</p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button className="wf-btn" style={{ flex: 1 }} onClick={() => setPreviewVideo(video)}>
                  Play Video
                </button>
                <button className="wf-btn-outline" style={{ flex: 1 }} onClick={() => setEditingVideo(video)}>
                  Edit
                </button>
                <button className="wf-btn-outline" style={{ width: '80px', borderColor: '#ef4444', color: '#ef4444' }} onClick={async (e) => {
                  e.stopPropagation();
                  if (!window.confirm('Delete this video?')) return;
                  try {
                    await videoService.deleteVideo(video._id);
                    setTeacherVideos(teacherVideos.filter(v => v._id !== video._id));
                    toast.success('Video deleted!');
                  } catch (err) {
                    console.error(err);
                    toast.error('Failed to delete video.');
                  }
                }}>
                  Delete
                </button>
              </div>
            </div>
          );
        })}
        {teacherVideos.length === 0 && <p>You haven't uploaded any videos yet.</p>}
      </div>
    </div>
  );

  // RENDER SWITCH
  const renderContent = () => {
    switch (activeTab) {
      case 'courses': return renderCourseList('Course List', 'course-detail');
      case 'my-courses': return renderCourseList('My Courses', 'course-detail');
      case 'add-course': return renderAddCourse();
      case 'course-detail': return renderCourseDetail();
      case 'upload-content': return renderUploadContent();
      case 'my-videos': return renderTeacherVideos();
      case 'enrollment-requests': return renderEnrollmentRequests();
      case 'quiz-creator': return renderQuizCreator();

      case 'manage-subjects': return renderCourseList('Select a Course to view Subjects', 'subject-add');
      case 'subject-add': return renderManageSubjectsDetail();

      default: return renderCourseList('Course List', 'course-detail');
    }
  };

  if (loading) return <Spinner message="Loading Teacher Dashboard..." />;

  const renderVideoPlayerModal = () => {
    if (!previewVideo) return null;

    // Construct full URL if it is a relative path like /files/...
    const videoSource = previewVideo.video_url.startsWith('http')
      ? previewVideo.video_url
      : `http://localhost:5000${previewVideo.video_url}`;

    return (
      <div className="wf-modal-overlay" onClick={() => setPreviewVideo(null)}>
        <div className="wf-modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="wf-modal-close" onClick={() => setPreviewVideo(null)}>×</button>

          <div className="wf-video-player-container">
            <video
              className="wf-video-player"
              controls
              autoPlay
              src={videoSource}
            >
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="wf-modal-info">
            <h3>{previewVideo.title}</h3>
            <p>{previewVideo.description || 'No description available.'}</p>
          </div>
        </div>
      </div>
    );
  };
  
  const renderEditVideoModal = () => {
    if (!editingVideo) return null;

    const handleVideoUpdate = async (e) => {
      e.preventDefault();
      const title = e.target.title.value;
      const description = e.target.description.value;
      const subjectId = e.target.subjectId.value;
      const yearId = e.target.yearId.value;
      const file = e.target.videoFile.files[0];

      try {
        setUploadLoading(true);
        await videoService.updateVideo(editingVideo._id, { 
          title, 
          description, 
          subject_id: subjectId, 
          year_id: yearId, 
          file 
        });
        toast.success('Video updated successfully!');
        setEditingVideo(null);
        // Refresh list
        const data = await videoService.getTeacherVideos();
        setTeacherVideos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Update error:', err);
        toast.error('Failed to update video.');
      } finally {
        setUploadLoading(false);
      }
    };

    return (
      <div className="wf-modal-overlay" onClick={() => setEditingVideo(null)}>
        <div className="wf-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', position: 'relative', overflow: 'visible' }}>
          <button 
            className="wf-modal-close" 
            onClick={() => setEditingVideo(null)}
            style={{ 
              position: 'absolute', 
              top: '-15px', 
              right: '-15px', 
              background: '#ef4444', 
              color: 'white', 
              border: '2px solid white', 
              borderRadius: '50%', 
              width: '30px', 
              height: '30px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              fontSize: '18px',
              fontWeight: 'bold',
              zIndex: 1000
            }}
          >
            ×
          </button>
          <h2 style={{ marginBottom: '20px', fontWeight: '800', color: '#111827', fontSize: '1.5rem' }}>
            Edit Uploaded Video
          </h2>
          
          <form className="wf-upload-form" onSubmit={handleVideoUpdate}>
            <div className="form-group">
              <label>Content Title</label>
              <input type="text" name="title" defaultValue={editingVideo.title} required />
            </div>

            <div className="form-row">
              <div className="form-group half-width">
                <label>Select Year</label>
                <select name="yearId" required defaultValue={editingVideo.year_id || ''} onChange={(e) => setSelectedUploadYear(e.target.value)}>
                  <option value="" disabled>-- Choose Year --</option>
                  {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              <div className="form-group half-width">
                <label>Select Subject</label>
                <select name="subjectId" required defaultValue={editingVideo.subject_id || ''}>
                  <option value="" disabled>-- Choose Subject --</option>
                  {courseSubjects.filter(s => s.year_id === (selectedUploadYear || editingVideo.year_id)).map(sub => (
                    <option key={sub._id} value={sub._id}>{sub.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea name="description" rows="3" defaultValue={editingVideo.description}></textarea>
            </div>

            <div className="form-group">
              <label>Replace Video File (Optional)</label>
              <input type="file" name="videoFile" accept="video/*" />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" className="wf-btn" style={{ flex: 1 }} disabled={uploadLoading}>
                {uploadLoading ? 'Updating...' : 'Save Changes'}
              </button>
              <button type="button" className="wf-btn-outline" style={{ flex: 1 }} onClick={() => setEditingVideo(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="wireframe-layout">
      {renderHeader()}
      {renderVideoPlayerModal()}
      {renderEditVideoModal()}
      <div className="wireframe-body">
        {renderSidebar()}
        <main className="wireframe-main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;