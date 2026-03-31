import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { validateEmail } from '../../utils/validation';
import './Auth.css';

const Signup = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState('');

    const [courseList] = useState(() => {
        const defaults = [
            "B.Sc Information Technology",
            "Bachelors of Marketing",
            "Bachelors of Finance Management",
            "Bachelors for Commerce",
            "Bachelors of Banking & Insurance",
            "BAMMC"
        ];
        const saved = localStorage.getItem('customCourses');
        const custom = saved ? JSON.parse(saved) : [];
        const customTitles = custom.map(c => c.title);
        return [...defaults, ...customTitles];
    });

    const [course, setCourse] = useState(localStorage.getItem('selectedCourse') || (courseList[0] || ''));
    const [teacherCourses, setTeacherCourses] = useState(() => {
        const saved = localStorage.getItem('selectedTeacherCourses');
        return saved ? JSON.parse(saved) : [];
    });

    const handleCourseCheckbox = (e, c) => {
        if (e.target.checked) {
            setTeacherCourses(prev => [...prev, c]);
        } else {
            setTeacherCourses(prev => prev.filter(item => item !== c));
        }
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

    const handleSignup = async (e) => {
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
            const userData = {
                name,
                email,
                password,
                role
            };

            if (role === 'teacher') {
                if (teacherCourses.length === 0) {
                    toast.error("Please select at least one course.");
                    setLoading(false);
                    return;
                }
                userData.course = teacherCourses;
                localStorage.setItem('selectedTeacherCourses', JSON.stringify(teacherCourses));
            } else {
                userData.course = course;
                localStorage.setItem('selectedCourse', course);
            }

            const response = await register(userData);
            
            toast.success(response.message || "Account created! Please verify your email.");
            navigate('/login', { state: { role } });
        } catch (error) {
            console.error('Signup error:', error);
            const errorMessage = error?.message || 'Signup failed. Please try again.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h1 className="auth-title">CREATE ACCOUNT</h1>
                <p className="auth-subtitle">Join E-LEARN to start your learning journey.</p>

                <form onSubmit={handleSignup}>
                    <div className="form-group">
                        <label className="auth-label">I am a...</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="auth-input"
                        >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                        </select>
                    </div>

                    {role === 'student' ? (
                        <div className="form-group slide-in">
                            <label className="auth-label">Select Your Course</label>
                            <select
                                value={course}
                                onChange={(e) => setCourse(e.target.value)}
                                className="auth-input"
                                required
                            >
                                {courseList.map((c, index) => (
                                    <option key={index} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className="form-group slide-in">
                            <label className="auth-label">Select Your Courses</label>
                            <div className="checkbox-group">
                                {courseList.map((c, index) => (
                                    <label key={index} style={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        marginBottom: '10px', 
                                        cursor: 'pointer',
                                        color: '#374151',
                                        fontSize: '0.9rem'
                                    }}>
                                        <input
                                            type="checkbox"
                                            value={c}
                                            checked={teacherCourses.includes(c)}
                                            onChange={(e) => handleCourseCheckbox(e, c)}
                                            style={{ 
                                                cursor: 'pointer', 
                                                marginRight: '12px',
                                                width: '18px',
                                                height: '18px',
                                                accentColor: '#10b981'
                                            }}
                                        />
                                        <span>{c}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="auth-label">Full Name</label>
                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="auth-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="auth-label">Email Address</label>
                        <input
                            type="email"
                            placeholder="e.g. yourname@gmail.com"
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
                            placeholder="Create a password (min. 6 characters)"
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
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p className="auth-text">
                        Already have an account? <Link to="/login" className="auth-link">Login here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;

