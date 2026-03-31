# Remaining Integration Tasks

This document outlines the remaining work to fully integrate all UI components with the backend API. The core infrastructure is complete; these are feature-level integrations.

## ✅ COMPLETED (Core Infrastructure)

1. **Environment Configuration** - Backend and frontend .env files
2. **API Client Setup** - Axios with interceptors and error handling
3. **Service Layer** - All service files created (auth, course, video, quiz, enrollment, profile)
4. **Authentication** - Login, signup, AuthContext, protected routes
5. **Error Handling** - Error boundaries, global error handling
6. **Loading States** - Spinner components
7. **CORS Configuration** - Backend properly configured

## 📋 TODO: Dashboard Integration

### Student Dashboard (`/pages/Boards/StudentDashboard/`)

**Current State:** Uses mock data from `mockData.js`

**Needs Integration:**
1. **Fetch Enrolled Courses**
   - Replace mock courses with API call to `/api/enrollments/my`
   - Display actual enrolled courses from backend

2. **Video List**
   - Fetch videos from `/api/video/courses/:courseId/video`
   - Replace hardcoded video data

3. **Course Progress**
   - Sync progress with backend
   - Update progress via API instead of localStorage

4. **Calendar Integration**
   - Fetch assignments/deadlines from backend
   - Display real upcoming events

**Files to Update:**
- `src/pages/Boards/StudentDashboard/StudentDashboard.jsx`
- Related dashboard components

**Example Integration:**
```javascript
import { useEffect, useState } from 'react';
import enrollmentService from '../../../services/enrollmentService';
import videoService from '../../../services/videoService';

function StudentDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await enrollmentService.getMyEnrollments();
        setEnrollments(data);
      } catch (error) {
        console.error('Error fetching enrollments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ... rest of component
}
```

---

### Teacher Dashboard (`/pages/Boards/TeacherBoard/`)

**Current State:** Uses localStorage for pending requests

**Needs Integration:**
1. **Enrollment Requests**
   - Fetch from `/api/enrollments/:courseId/:yearId/requests`
   - Replace localStorage pendingRequests

2. **Approve/Reject Students**
   - Call `/api/enrollments/:requestId/status`
   - Update UI after approval/rejection

3. **Course Management**
   - Fetch teacher's courses from `/api/courses`
   - Create new courses via API

4. **Student List**
   - Fetch enrolled students from `/api/enrollments/:courseId/:yearId/students`
   - Display real student data

5. **Content Management**
   - Upload videos via `/api/video/courses/:courseId/video`
   - Create quizzes via `/api/quiz`
   - Manage assignments

**Files to Update:**
- `src/pages/Boards/TeacherBoard/TeacherDashBoard.jsx`
- Related teacher components

**Example Integration:**
```javascript
import enrollmentService from '../../../services/enrollmentService';
import courseService from '../../../services/courseService';

function TeacherDashboard() {
  const [requests, setRequests] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // Get teacher's courses first
        const coursesData = await courseService.getAllCourses();
        setCourses(coursesData);
        
        // Get enrollment requests for each course
        const allRequests = [];
        for (const course of coursesData) {
          const reqs = await enrollmentService.getCourseEnrollmentRequests(
            course._id, 
            course.yearId
          );
          allRequests.push(...reqs);
        }
        setRequests(allRequests);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchRequests();
  }, []);

  const handleApprove = async (requestId) => {
    try {
      await enrollmentService.updateEnrollmentStatus(requestId, 'approved');
      // Refresh requests
      // Show success toast
    } catch (error) {
      // Handle error
    }
  };
}
```

---

### Video Player Page (`/pages/Videoplayer.jsx`)

**Current State:** Uses mock video data

**Needs Integration:**
1. **Fetch Video Data**
   - Get video by ID from backend
   - Load real video URL

2. **Update Progress**
   - Track video completion
   - Send progress updates to backend
   - Unlock next video logic from backend

3. **Quiz Integration**
   - Load quiz from backend
   - Submit quiz responses to API

**Files to Update:**
- `src/pages/Videoplayer.jsx`

---

### Quiz Page (`/pages/Quiz.jsx`)

**Current State:** Uses mock quiz data

**Needs Integration:**
1. **Fetch Quiz**
   - Load quiz from `/api/quiz/:id`
   - Get questions and options

2. **Submit Answers**
   - Post answers to `/api/quiz/:id/submit`
   - Get score from backend

3. **Results Display**
   - Fetch results from `/api/quiz/:id/results`
   - Show score history

**Files to Update:**
- `src/pages/Quiz.jsx`

---

### Profile Pages

**Student Profile (`/pages/Auth/StudentProfile.jsx`)**

**Needs Integration:**
1. **Fetch Profile** - `/api/profiles`
2. **Update Profile** - `/api/profiles` (PUT)
3. **Upload Photo** - `/api/profiles/photo`

**Teacher Profile (`/pages/Auth/TeacherProfile.jsx`)**

**Needs Integration:**
1. **Fetch Profile** - `/api/profiles`
2. **Update Profile** - `/api/profiles` (PUT)
3. **Upload Photo** - `/api/profiles/photo`

**Files to Update:**
- `src/pages/Auth/StudentProfile.jsx`
- `src/pages/Auth/TeacherProfile.jsx`

---

## 🔨 Implementation Priority

### Phase 1 (High Priority - Core Features)
1. ✅ Authentication (DONE)
2. Student Dashboard - Enrolled Courses
3. Video Player - Real Video Data
4. Quiz System - API Integration

### Phase 2 (Medium Priority - Teacher Features)
5. Teacher Dashboard - Enrollment Requests
6. Teacher Dashboard - Approve/Reject
7. Course Management - Create/Edit
8. Content Upload - Videos/Quizzes

### Phase 3 (Low Priority - Nice to Have)
9. Profile Management
10. Calendar/Deadlines
11. Progress Analytics
12. Notifications

---

## 🚀 Quick Implementation Template

For each feature, follow this pattern:

```javascript
// 1. Import services
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import courseService from '../../services/courseService';
import Spinner from '../../components/Spinner';

// 2. Component state
function MyComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3. Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await courseService.getAllCourses();
        setData(result);
      } catch (err) {
        setError(err.message);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 4. Handle loading/error states
  if (loading) return <Spinner message="Loading..." />;
  if (error) return <div>Error: {error}</div>;

  // 5. Render data
  return (
    <div>
      {data.map(item => (
        <div key={item._id}>{item.title}</div>
      ))}
    </div>
  );
}
```

---

## 📝 Testing Checklist

After integrating each feature:

- [ ] Test with valid data
- [ ] Test error handling (network failure)
- [ ] Test loading states
- [ ] Test with different user roles
- [ ] Clear localStorage and test
- [ ] Test token expiry handling
- [ ] Check browser console for errors
- [ ] Verify backend logs

---

## 🎯 Current Status Summary

**Infrastructure:** ✅ 100% Complete
- API client, services, auth, routing, error handling

**UI Integration:** ⏳ 20% Complete  
- Login/Signup integrated
- Dashboards still using mock data
- Video/Quiz pages need API connection

**Next Step:** Start with Student Dashboard enrollment integration to see real data flowing through the system.

---

**Note:** The core infrastructure is production-ready. The remaining work is connecting existing UI components to the service layer we've built. Each integration should be straightforward using the pattern above.
