import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import '../../App.css';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(location.state?.role || 'student');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      toast.error("Invalid email format.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      console.log(`🔐 Attempting login for ${email}...`);
      const response = await login({ email, password, role });
      
      console.log('✅ Login response:', response);
      
      const userRole = response?.user?.role || response?.role || role;
      const userName = response?.user?.name || 'User';
      
      toast.success(`Welcome back, ${userName}!`);
      
      if (userRole === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      const errorMessage = error?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-title">
          E-LEARN LOGIN
        </h1>
        <p className="auth-subtitle">
          Welcome back! Please login to continue.
        </p>

        <form onSubmit={handleLogin}>
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

          <div className="form-group">
            <label className="auth-label">Email Address</label>
            <input
              type="email"
              placeholder="e.g. sunitaa@gmail.com"
              value={email}
              onChange={handleEmailChange}
              required
              className={`auth-input ${emailError ? 'input-error' : ''}`}
            />
            {emailError && (
              <span className="error-text">
                <FaExclamationCircle /> {emailError}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="auth-label">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading || !!emailError}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-text">
            Don't have an account? <Link to="/signup" className="auth-link">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;