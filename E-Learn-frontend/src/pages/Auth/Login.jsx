import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../App.css';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [role, setRole] = useState(location.state?.role || 'student'); // Default to student or selected role

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    // --- LOGIC BASED ON ROLE / EMAIL ---
    if (role === 'teacher') {
      toast.success("Welcome, Teacher!");
      navigate('/teacher');
    } else {
      toast.success("Welcome, Student!");
      navigate('/student');
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-box">
        <h1 className="mb-20 auth-title">
          E-LEARN LOGIN
        </h1>
        <p className="auth-subtitle">
          Welcome back! Please login to continue.
        </p>

        <form onSubmit={handleLogin}>
          {/* Role Selection Dropdown */}
          <div className="form-group">
            <label className="auth-label">Select Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="auth-input"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          {/* Email Input */}
          <div className="form-group">
            <label className="auth-label">Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
            />
          </div>

          {/* Password Input */}
          <div className="form-group-last">
            <label className="auth-label">Password</label>
            <input
              type="password"
              placeholder="Enter a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
            />
          </div>

          {/* Login Button */}
          <button type="submit" className="btn btn-primary auth-button">
            Sign In
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-text">Don't have an account? <Link to="/signup" className="auth-link">Register here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;