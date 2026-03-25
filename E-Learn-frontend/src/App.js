import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Pages
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import StudentDashboard from './pages/Boards/StudentDashboard/StudentDashboard';
import TeacherDashboard from './pages/Boards/TeacherBoard/TeacherDashBoard';

import Home from './pages/Home';
import Videoplayer from './pages/Videoplayer';
import Quiz from './pages/Quiz';
import StudentProfile from './pages/Auth/StudentProfile';
import TeacherProfile from './pages/Auth/TeacherProfile';
import LoadingScreen from './components/LoadingScreen';
import { ProgressProvider } from './context/ProgressContext';

function App() {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <ProgressProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/video/:id" element={<Videoplayer />} />
            <Route path="/quiz/:id" element={<Quiz />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/teacher/profile" element={<TeacherProfile />} />
          </Routes>
        </Router>
      </ProgressProvider>
      <ToastContainer position="bottom-right" />
    </>
  );
}

export default App;