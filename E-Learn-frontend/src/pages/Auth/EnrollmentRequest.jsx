import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaBook, FaCheckCircle, FaTimes } from 'react-icons/fa';
import courseService from '../../services/courseService';
import enrollmentService from '../../services/enrollmentService';
import './Auth.css';

const EnrollmentRequest = ({ onRequestSent, onCancel }) => {
  const [courses, setCourses] = useState([]);
  const [courseYears, setCourseYears] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingYears, setFetchingYears] = useState(false);

  // Fetch available courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        console.log('📚 Fetching available courses...');
        const coursesData = await courseService.getAllCourses();
        console.log('✅ Courses fetched:', coursesData);
        
        // Filter out unwanted courses
        const filteredCourses = (coursesData || []).filter(course => 
          course.title !== 'Placeholder Course' && 
          course.title !== 'BSc IT'
        );
        
        setCourses(filteredCourses);
        
        // Pre-select first course from filtered list
        if (filteredCourses.length > 0) {
          setSelectedCourse(filteredCourses[0]._id);
        }
      } catch (error) {
        console.error('❌ Error fetching courses:', error);
        toast.error('Failed to load courses. Please try again.');
      }
    };

    fetchCourses();
  }, []);

  // Fetch years when course changes
  useEffect(() => {
    const fetchYears = async () => {
      if (!selectedCourse) return;

      try {
        setFetchingYears(true);
        console.log(`📅 Fetching years for course ${selectedCourse}...`);
        // Note: This endpoint might not exist - check your API routes
        const yearsData = await courseService.getCourseYears?.(selectedCourse) || [];
        console.log('✅ Years fetched:', yearsData);
        setCourseYears(yearsData);
        
        if (yearsData && yearsData.length > 0) {
          setSelectedYear(yearsData[0]._id);
        } else {
          setSelectedYear('First Year (FY)');
        }
      } catch (error) {
        console.warn('⚠️ Could not fetch years, using default:', error);
        setCourseYears([]);
        setSelectedYear('First Year (FY)');
      } finally {
        setFetchingYears(false);
      }
    };

    fetchYears();
  }, [selectedCourse]);

  const handleRequestEnrollment = async (e) => {
    e.preventDefault();

    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }

    setLoading(true);

    try {
      console.log(`📝 Requesting enrollment for course ${selectedCourse}, year ${selectedYear}...`);
      
      const response = await enrollmentService.requestEnrollment({
        courseId: selectedCourse,
        yearId: selectedYear
      });

      console.log('✅ Enrollment request sent:', response);
      
      const selectedCourseName = courses.find(c => c._id === selectedCourse)?.title || 'Course';
      toast.success(`Enrollment request sent for ${selectedCourseName}! Please wait for teacher approval.`);
      
      // Call parent callback
      if (onRequestSent) {
        onRequestSent();
      }
    } catch (error) {
      console.error('❌ Enrollment request error:', error);
      const errorMsg = error?.error || error?.message || 'Failed to send enrollment request';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-box" style={{ maxWidth: '500px', padding: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '25px' }}>
          <FaBook size={32} color="#006D5B" style={{ marginRight: '15px' }} />
          <h1 style={{ color: '#006D5B', margin: 0 }}>Request Enrollment</h1>
        </div>

        <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '30px', lineHeight: '1.5' }}>
          Select a course and year to request enrollment. A teacher will review and approve your request.
        </p>

        <form onSubmit={handleRequestEnrollment}>
          {/* Course Selection */}
          <div className="form-group">
            <label className="auth-label">Select Course *</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="auth-input"
              required
              disabled={loading}
            >
              <option value="">Choose a course...</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {/* Year Selection */}
          {selectedCourse && (
            <div className="form-group">
              <label className="auth-label">
                Select Year/Batch {fetchingYears && '(Loading...)'}
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="auth-input"
                required
                disabled={loading || fetchingYears}
              >
                <option value="">Choose a year...</option>
                {courseYears.length > 0 ? (
                  courseYears.map(year => (
                    <option key={year._id} value={year._id}>
                      {year.year_label || `Year ${year.year_number}`}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="First Year (FY)">First Year</option>
                    <option value="Second Year (SY)">Second Year</option>
                    <option value="Third Year (TY)">Third Year</option>
                  </>
                )}
              </select>
            </div>
          )}

          {/* Info Box */}
          <div style={{
            background: '#f0fdf4',
            padding: '12px 15px',
            borderRadius: '8px',
            border: '1px solid #c6f6d5',
            color: '#166534',
            fontSize: '0.85rem',
            marginBottom: '25px',
            display: 'flex',
            alignItems: 'flex-start'
          }}>
            <FaCheckCircle style={{ marginRight: '10px', marginTop: '2px', flexShrink: 0 }} />
            <div>
              <strong>What happens next?</strong>
              <br />Your teacher will review your request and approve/reject it within 24 hours.
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={loading || !selectedCourse || !selectedYear}
            >
              {loading ? 'Sending...' : 'Request Enrollment'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="btn"
              style={{
                flex: 1,
                background: '#e5e7eb',
                color: '#374151',
                border: 'none',
                cursor: 'pointer'
              }}
              disabled={loading}
            >
              <FaTimes /> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnrollmentRequest;
